/**
 * FTK Tester
 * Utilities for testing fluent-toolkit functionality
 */

import { SSHSession } from "./ssh-session.ts";

export interface TestResult {
  success: boolean;
  message: string;
  details?: unknown;
}

export interface ValidationResult {
  success: boolean;
  errors: string[];
}

export interface UserResponses {
  selectServers?: string[];
  secrets?: Record<string, string>;
  confirmations?: boolean[];
}

export class FtkTester {
  constructor(private verbose = false) {}

  /**
   * Configure Homebrew shell environment
   */
  async configureHomebrew(session: SSHSession): Promise<void> {
    this.log("Configuring Homebrew shell environment...");

    const result = await session.exec(
      "echo 'eval \"$(/opt/homebrew/bin/brew shellenv)\"' >> ~/.zshrc",
    );

    if (!result.success) {
      throw new Error(`Failed to configure Homebrew: ${result.stderr}`);
    }

    this.log("✅ Homebrew configured");
  }

  /**
   * Install dependencies
   */
  async installDependencies(
    session: SSHSession,
    packages: string[],
  ): Promise<void> {
    this.log(`Installing dependencies: ${packages.join(", ")}...`);

    const result = await session.exec(
      `brew install ${packages.join(" ")}`,
      300000, // 5 minute timeout for installations
    );

    if (!result.success) {
      throw new Error(`Failed to install dependencies: ${result.stderr}`);
    }

    this.log("✅ Dependencies installed");
  }

  /**
   * Install ftk via Homebrew
   */
  async installFtk(
    session: SSHSession,
    version?: string,
  ): Promise<void> {
    this.log(`Installing ftk${version ? ` version ${version}` : ""}...`);

    let command = "brew install fluent-toolkit";

    if (version) {
      // For specific versions, might need to tap or use formula URL
      command = `brew install fluent-toolkit@${version}`;
    }

    const result = await session.exec(command, 120000);

    if (!result.success) {
      throw new Error(`Failed to install ftk: ${result.stderr}`);
    }

    // Verify installation
    const versionResult = await session.exec("ftk --version");

    if (!versionResult.success) {
      throw new Error("ftk not found after installation");
    }

    this.log(`✅ ftk installed: ${versionResult.stdout.trim()}`);
  }

  /**
   * Test ftk init in --no-prompt mode
   */
  async testNoPrompt(
    session: SSHSession,
    workdir = "/tmp/ftk-test",
    servers?: string[],
  ): Promise<TestResult> {
    this.log("Testing ftk init --no-prompt...");

    // Create working directory
    await session.exec(`mkdir -p ${workdir} && cd ${workdir}`);

    // Build command
    let command = `cd ${workdir} && ftk init --no-prompt`;

    if (servers && servers.length > 0) {
      command += ` --servers ${servers.join(",")}`;
    }

    const result = await session.exec(command, 120000);

    if (!result.success) {
      return {
        success: false,
        message: "ftk init failed",
        details: {
          stdout: result.stdout,
          stderr: result.stderr,
          exitCode: result.exitCode,
        },
      };
    }

    // Check for success message
    if (result.stdout.includes("Setup complete!")) {
      return {
        success: true,
        message: "ftk init completed successfully",
        details: { output: result.stdout },
      };
    }

    return {
      success: false,
      message: "ftk init completed but no success message found",
      details: { output: result.stdout },
    };
  }

  /**
   * Validate .mcp.json configuration
   */
  async validateMcpConfig(
    session: SSHSession,
    workdir = "/tmp/ftk-test",
  ): Promise<ValidationResult> {
    this.log("Validating .mcp.json...");

    const errors: string[] = [];

    // Check file exists
    const existsResult = await session.exec(
      `test -f ${workdir}/.mcp.json && echo 'exists' || echo 'missing'`,
    );

    if (existsResult.stdout.trim() === "missing") {
      errors.push(".mcp.json file not found");
      return { success: false, errors };
    }

    // Read and parse JSON
    const contentResult = await session.exec(`cat ${workdir}/.mcp.json`);

    if (!contentResult.success) {
      errors.push("Failed to read .mcp.json");
      return { success: false, errors };
    }

    try {
      const config = JSON.parse(contentResult.stdout);

      // Validate structure
      if (!config.mcpServers || typeof config.mcpServers !== "object") {
        errors.push("mcpServers section missing or invalid");
      }

      // Check each server has required fields
      for (const [serverId, serverConfig] of Object.entries(config.mcpServers)) {
        const server = serverConfig as { command?: string; args?: string[] };

        if (!server.command) {
          errors.push(`Server ${serverId} missing command`);
        }

        if (!server.args || !Array.isArray(server.args)) {
          errors.push(`Server ${serverId} missing or invalid args`);
        }
      }
    } catch (error) {
      errors.push(`Invalid JSON: ${error instanceof Error ? error.message : String(error)}`);
    }

    return {
      success: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate CLAUDE.md file
   */
  async validateClaudeMd(
    session: SSHSession,
    workdir = "/tmp/ftk-test",
  ): Promise<ValidationResult> {
    this.log("Validating CLAUDE.md...");

    const errors: string[] = [];

    // Check file exists
    const existsResult = await session.exec(
      `test -f ${workdir}/CLAUDE.md && echo 'exists' || echo 'missing'`,
    );

    if (existsResult.stdout.trim() === "missing") {
      errors.push("CLAUDE.md file not found");
      return { success: false, errors };
    }

    // Read content
    const contentResult = await session.exec(`cat ${workdir}/CLAUDE.md`);

    if (!contentResult.success) {
      errors.push("Failed to read CLAUDE.md");
      return { success: false, errors };
    }

    const content = contentResult.stdout;

    // Basic validation - should contain server documentation
    if (!content.includes("# MCP Servers")) {
      errors.push("CLAUDE.md missing MCP Servers section");
    }

    return {
      success: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate server installation by checking lock file
   */
  async validateServerInstallation(
    session: SSHSession,
    serverId: string,
    workdir = "/tmp/ftk-test",
  ): Promise<boolean> {
    this.log(`Validating ${serverId} installation...`);

    // Check .ftk/config.json
    const result = await session.exec(`cat ${workdir}/.ftk/config.json`);

    if (!result.success) {
      return false;
    }

    try {
      const config = JSON.parse(result.stdout);

      if (!config.servers || !Array.isArray(config.servers)) {
        return false;
      }

      return config.servers.some((s: { id: string }) => s.id === serverId);
    } catch {
      return false;
    }
  }

  /**
   * Clean up test project
   */
  async cleanProject(
    session: SSHSession,
    workdir = "/tmp/ftk-test",
  ): Promise<void> {
    this.log(`Cleaning up ${workdir}...`);

    await session.exec(`rm -rf ${workdir}`);

    this.log("✅ Project cleaned");
  }

  /**
   * Get ftk version
   */
  async getFtkVersion(session: SSHSession): Promise<string> {
    const result = await session.exec("ftk --version");

    if (!result.success) {
      throw new Error("Failed to get ftk version");
    }

    // Parse version from output (e.g., "ftk 0.2.0")
    const match = result.stdout.match(/\d+\.\d+\.\d+/);

    return match ? match[0] : "unknown";
  }

  /**
   * Helper: log
   */
  private log(message: string): void {
    if (this.verbose) {
      console.log(`[FTK Tester] ${message}`);
    }
  }
}
