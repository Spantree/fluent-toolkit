/**
 * Claude Code Version Checking Utility
 * Detects Claude Code installation and validates version requirements
 */

import { greaterOrEqual, parse as parseSemver } from "@std/semver";

export interface ClaudeVersionCheck {
  installed: boolean;
  version?: string;
  meetsRequirements: boolean;
  upgradeAvailable?: boolean;
  latestVersion?: string;
  message?: string;
}

// Minimum required Claude Code version for subagent support
// Custom subagents were introduced in Claude Code 1.0.60
export const MIN_CLAUDE_VERSION = "1.0.60";

// Cache for version check to avoid repeated command execution
// TTL is 5 minutes (300000ms)
const CACHE_TTL_MS = 5 * 60 * 1000;
let cachedVersionCheck: ClaudeVersionCheck | null = null;
let cacheTimestamp: number | null = null;

/**
 * Parse version string from claude --version output
 * Handles formats like "claude 1.2.3" or "1.2.3"
 * Preserves pre-release identifiers (e.g., "1.2.3-beta.1")
 */
export function parseVersion(output: string): string | null {
  // Try to match version pattern: X.Y.Z or X.Y.Z-pre.N
  const versionMatch = output.match(/(\d+\.\d+\.\d+(?:-[\w.]+)?)/);
  return versionMatch ? versionMatch[1] : null;
}

/**
 * Compare two semantic versions using @std/semver
 * Returns: true if v1 >= v2, false otherwise
 *
 * Note: This properly handles pre-release versions according to semver spec:
 * - 1.0.0-beta.1 < 1.0.0 (pre-release is less than release)
 * - 1.0.0 >= 1.0.0 (equal)
 * - 2.0.0 >= 1.0.0 (greater)
 */
export function meetsMinimumVersion(version: string, minimum: string): boolean {
  try {
    const parsedVersion = parseSemver(version);
    const parsedMinimum = parseSemver(minimum);
    return greaterOrEqual(parsedVersion, parsedMinimum);
  } catch (error) {
    // If parsing fails, fall back to false (doesn't meet requirements)
    console.error(
      `Failed to parse version: ${error instanceof Error ? error.message : String(error)}`,
    );
    return false;
  }
}

/**
 * Check if Claude Code is installed and meets version requirements
 *
 * @param options.forceRefresh - Skip cache and re-check version
 * @returns Version check result with installation and requirement status
 */
export async function checkClaudeCodeInstallation(
  options: { forceRefresh?: boolean } = {},
): Promise<ClaudeVersionCheck> {
  // Return cached result if available, not forcing refresh, and within TTL
  const now = Date.now();
  const cacheValid = cachedVersionCheck &&
    cacheTimestamp &&
    (now - cacheTimestamp < CACHE_TTL_MS);

  if (!options.forceRefresh && cacheValid && cachedVersionCheck) {
    return cachedVersionCheck;
  }

  try {
    const command = new Deno.Command("claude", {
      args: ["--version"],
      stdout: "piped",
      stderr: "piped",
    });

    const { code, stdout, stderr } = await command.output();

    if (code !== 0) {
      const errorOutput = new TextDecoder().decode(stderr);
      const result = {
        installed: false,
        meetsRequirements: false,
        message: `Claude Code command failed: ${errorOutput}`,
      };
      cachedVersionCheck = result;
      cacheTimestamp = Date.now();
      return result;
    }

    const output = new TextDecoder().decode(stdout);
    const version = parseVersion(output);

    if (!version) {
      const result = {
        installed: true,
        meetsRequirements: false,
        message: `Could not parse version from output: ${output}`,
      };
      cachedVersionCheck = result;
      cacheTimestamp = Date.now();
      return result;
    }

    const meetsRequirements = meetsMinimumVersion(version, MIN_CLAUDE_VERSION);

    const result = {
      installed: true,
      version,
      meetsRequirements,
      message: meetsRequirements
        ? `Claude Code ${version} is installed`
        : `Claude Code ${version} is outdated (minimum: ${MIN_CLAUDE_VERSION})`,
    };

    cachedVersionCheck = result;
    cacheTimestamp = Date.now();
    return result;
  } catch (error) {
    // Command not found or other execution error
    if (error instanceof Deno.errors.NotFound) {
      const result = {
        installed: false,
        meetsRequirements: false,
        message: "Claude Code is not installed or not in PATH",
      };
      cachedVersionCheck = result;
      cacheTimestamp = Date.now();
      return result;
    }

    const result = {
      installed: false,
      meetsRequirements: false,
      message: `Error checking Claude Code: ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
    cachedVersionCheck = result;
    cacheTimestamp = Date.now();
    return result;
  }
}

/**
 * Clear the version check cache
 * Useful for testing or when you know the version has changed
 */
export function clearVersionCache(): void {
  cachedVersionCheck = null;
  cacheTimestamp = null;
}

/**
 * Detect how Claude Code was installed
 */
export async function detectInstallationMethod(): Promise<
  "npm" | "brew" | "unknown"
> {
  try {
    // Check if installed via npm by looking at the claude binary
    const whichCmd = new Deno.Command("which", {
      args: ["claude"],
      stdout: "piped",
      stderr: "piped",
    });

    const { success, stdout } = await whichCmd.output();

    if (success) {
      const path = new TextDecoder().decode(stdout).trim();

      // npm global installs typically go to:
      // - macOS: /usr/local/bin or ~/.nvm/versions/node/*/bin
      // - Windows: %APPDATA%\npm
      // Homebrew typically goes to: /opt/homebrew/bin or /usr/local/bin
      if (path.includes("node") || path.includes("npm") || path.includes("nvm")) {
        return "npm";
      }

      if (path.includes("homebrew") || path.includes("Homebrew")) {
        return "brew";
      }
    }
  } catch {
    // Fall through to default
  }

  return "unknown";
}

/**
 * Get platform-specific install command
 * Prioritizes npm (official method) unless already installed via brew
 */
export function getInstallCommand(
  preferredMethod?: "npm" | "brew",
): string {
  // Use npm as the official installation method
  const npmCommand = "npm install -g @anthropic-ai/claude-code";

  // If user has a preference, respect it
  if (preferredMethod === "brew" && Deno.build.os === "darwin") {
    return "brew install claude-code";
  }

  // Default to npm (official method)
  return npmCommand;
}

/**
 * Get platform-specific upgrade command
 * Detects installation method and uses appropriate upgrade command
 */
export async function getUpgradeCommand(): Promise<string> {
  const method = await detectInstallationMethod();

  switch (method) {
    case "brew":
      return "brew upgrade claude-code";
    case "npm":
      return "npm update -g @anthropic-ai/claude-code";
    default:
      // Default to npm (official method)
      return "npm update -g @anthropic-ai/claude-code";
  }
}

/**
 * Get installation instructions based on platform
 */
export function getInstallationInstructions(): string {
  return `
Claude Code is not installed. To install (official method):

  npm install -g @anthropic-ai/claude-code

Alternative methods:
  • macOS: brew install claude-code
  • Windows: winget install Claude.ClaudeCode
  • Visit: https://docs.claude.com/claude-code/install
`;
}

/**
 * Check if a newer version of Claude Code is available
 * This is a stub - in production, this would check the Homebrew/winget registry
 * For now, we'll return false unless we can detect upgrade availability
 */
export async function checkForUpgrade(currentVersion: string): Promise<{
  available: boolean;
  latestVersion?: string;
}> {
  // Try to get the latest version from Homebrew on macOS
  if (Deno.build.os === "darwin") {
    try {
      const command = new Deno.Command("brew", {
        args: ["info", "--json", "claude-code"],
        stdout: "piped",
        stderr: "piped",
      });

      const { code, stdout } = await command.output();

      if (code === 0) {
        const output = new TextDecoder().decode(stdout);
        const info = JSON.parse(output);

        if (Array.isArray(info) && info.length > 0 && info[0].versions?.stable) {
          const latestVersion = info[0].versions.stable;
          const current = parseSemver(currentVersion);
          const latest = parseSemver(latestVersion);

          if (greaterOrEqual(latest, current) && !greaterOrEqual(current, latest)) {
            return { available: true, latestVersion };
          }
        }
      }
    } catch {
      // Silently fail - upgrade check is optional
    }
  }

  // For other platforms or if check fails, assume no upgrade available
  return { available: false };
}
