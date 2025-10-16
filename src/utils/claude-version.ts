/**
 * Claude Code Version Checking Utility
 * Detects Claude Code installation and validates version requirements
 */

export interface ClaudeVersionCheck {
  installed: boolean;
  version?: string;
  meetsRequirements: boolean;
  message?: string;
}

// Minimum required Claude Code version
// MCP support was added in Claude Code 1.0.0
export const MIN_CLAUDE_VERSION = "1.0.0";

/**
 * Parse version string from claude --version output
 * Handles formats like "claude 1.2.3" or "1.2.3"
 */
export function parseVersion(output: string): string | null {
  // Try to match version pattern: X.Y.Z or X.Y.Z-beta.N
  const versionMatch = output.match(/(\d+\.\d+\.\d+(?:-[\w.]+)?)/);
  return versionMatch ? versionMatch[1] : null;
}

/**
 * Compare two semantic versions
 * Returns: -1 if v1 < v2, 0 if v1 === v2, 1 if v1 > v2
 */
export function compareVersions(v1: string, v2: string): number {
  // Extract base version (strip pre-release tags)
  const cleanV1 = v1.split("-")[0];
  const cleanV2 = v2.split("-")[0];

  const parts1 = cleanV1.split(".").map(Number);
  const parts2 = cleanV2.split(".").map(Number);

  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const num1 = parts1[i] || 0;
    const num2 = parts2[i] || 0;

    if (num1 > num2) return 1;
    if (num1 < num2) return -1;
  }

  return 0;
}

/**
 * Check if Claude Code is installed and meets version requirements
 */
export async function checkClaudeCodeInstallation(): Promise<ClaudeVersionCheck> {
  try {
    const command = new Deno.Command("claude", {
      args: ["--version"],
      stdout: "piped",
      stderr: "piped",
    });

    const { code, stdout, stderr } = await command.output();

    if (code !== 0) {
      const errorOutput = new TextDecoder().decode(stderr);
      return {
        installed: false,
        meetsRequirements: false,
        message: `Claude Code command failed: ${errorOutput}`,
      };
    }

    const output = new TextDecoder().decode(stdout);
    const version = parseVersion(output);

    if (!version) {
      return {
        installed: true,
        meetsRequirements: false,
        message: `Could not parse version from output: ${output}`,
      };
    }

    const meetsRequirements = compareVersions(version, MIN_CLAUDE_VERSION) >= 0;

    return {
      installed: true,
      version,
      meetsRequirements,
      message: meetsRequirements
        ? `Claude Code ${version} is installed`
        : `Claude Code ${version} is outdated (minimum: ${MIN_CLAUDE_VERSION})`,
    };
  } catch (error) {
    // Command not found or other execution error
    if (error instanceof Deno.errors.NotFound) {
      return {
        installed: false,
        meetsRequirements: false,
        message: "Claude Code is not installed or not in PATH",
      };
    }

    return {
      installed: false,
      meetsRequirements: false,
      message: `Error checking Claude Code: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
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
