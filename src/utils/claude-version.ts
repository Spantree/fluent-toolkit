/**
 * Claude Code Version Checking Utility
 * Detects Claude Code installation and validates version requirements
 */

import { parse as parseSemver, greaterOrEqual } from "@std/semver";

export interface ClaudeVersionCheck {
  installed: boolean;
  version?: string;
  meetsRequirements: boolean;
  message?: string;
}

// Minimum required Claude Code version
// MCP support was added in Claude Code 1.0.0
export const MIN_CLAUDE_VERSION = "1.0.0";

// Cache for version check to avoid repeated command execution
let cachedVersionCheck: ClaudeVersionCheck | null = null;

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
    console.error(`Failed to parse version: ${error instanceof Error ? error.message : String(error)}`);
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
  options: { forceRefresh?: boolean } = {}
): Promise<ClaudeVersionCheck> {
  // Return cached result if available and not forcing refresh
  if (!options.forceRefresh && cachedVersionCheck) {
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
      return result;
    }

    const result = {
      installed: false,
      meetsRequirements: false,
      message: `Error checking Claude Code: ${error instanceof Error ? error.message : String(error)}`,
    };
    cachedVersionCheck = result;
    return result;
  }
}

/**
 * Clear the version check cache
 * Useful for testing or when you know the version has changed
 */
export function clearVersionCache(): void {
  cachedVersionCheck = null;
}

/**
 * Get installation instructions based on platform
 */
export function getInstallationInstructions(): string {
  const platform = Deno.build.os;

  switch (platform) {
    case "darwin":
      return `
Claude Code is not installed. To install:

  brew install claude-code

Or visit: https://docs.claude.com/claude-code/install
`;
    case "linux":
      return `
Claude Code is not installed. To install:

  Visit: https://docs.claude.com/claude-code/install

Or use your package manager if available.
`;
    case "windows":
      return `
Claude Code is not installed. To install:

  Visit: https://docs.claude.com/claude-code/install

Or use winget if available:
  winget install Claude.ClaudeCode
`;
    default:
      return `
Claude Code is not installed.

Visit: https://docs.claude.com/claude-code/install
`;
  }
}
