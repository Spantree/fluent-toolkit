/**
 * Configuration Manager
 * Handles user-level, project-level, and MCP configurations
 */

import { join } from "@std/path";
import { ensureDir, exists } from "@std/fs";
import type { MCPConfigFile, MCPServerEntry, ProjectConfig, UserConfig } from "../types/index.ts";

export class ConfigManager {
  /**
   * Get the user config directory (~/.ftk)
   */
  private static getUserConfigDir(): string {
    const home = Deno.env.get("HOME");
    if (!home) {
      throw new Error("HOME environment variable not set");
    }
    return join(home, ".ftk");
  }

  /**
   * Get the user config file path (~/.ftk/config.json)
   */
  private static getUserConfigPath(): string {
    return join(this.getUserConfigDir(), "config.json");
  }

  /**
   * Get the project config directory (.ftk)
   */
  private static getProjectConfigDir(): string {
    return join(Deno.cwd(), ".ftk");
  }

  /**
   * Get the project config file path (.ftk/config.json)
   */
  private static getProjectConfigPath(): string {
    return join(this.getProjectConfigDir(), "config.json");
  }

  /**
   * Get the MCP config file path (.mcp.json)
   */
  private static getMCPConfigPath(): string {
    return join(Deno.cwd(), ".mcp.json");
  }

  /**
   * Load user-level configuration
   */
  static async getUserConfig(): Promise<UserConfig | null> {
    const configPath = this.getUserConfigPath();

    if (!(await exists(configPath))) {
      return null;
    }

    try {
      const content = await Deno.readTextFile(configPath);
      return JSON.parse(content) as UserConfig;
    } catch (error) {
      throw new Error(
        `Failed to load user config: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Save user-level configuration
   */
  static async saveUserConfig(config: UserConfig): Promise<void> {
    const configDir = this.getUserConfigDir();
    const configPath = this.getUserConfigPath();

    await ensureDir(configDir);
    await Deno.writeTextFile(configPath, JSON.stringify(config, null, 2));
  }

  /**
   * Initialize default user configuration
   */
  static async initUserConfig(): Promise<UserConfig> {
    const config: UserConfig = {
      version: "1.0.0",
      preferences: {
        allowValidation: true,
        autoInstallDeps: false,
      },
      servers: {},
    };

    await this.saveUserConfig(config);
    return config;
  }

  /**
   * Load project-level configuration
   */
  static async getProjectConfig(): Promise<ProjectConfig | null> {
    const configPath = this.getProjectConfigPath();

    if (!(await exists(configPath))) {
      return null;
    }

    try {
      const content = await Deno.readTextFile(configPath);
      return JSON.parse(content) as ProjectConfig;
    } catch (error) {
      throw new Error(
        `Failed to load project config: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Save project-level configuration
   */
  static async saveProjectConfig(config: ProjectConfig): Promise<void> {
    const configDir = this.getProjectConfigDir();
    const configPath = this.getProjectConfigPath();

    await ensureDir(configDir);
    await Deno.writeTextFile(configPath, JSON.stringify(config, null, 2));
  }

  /**
   * Initialize default project configuration
   */
  static async initProjectConfig(contextDir?: string): Promise<ProjectConfig> {
    const config: ProjectConfig = {
      version: "1.0.0",
      servers: {},
    };

    // Only add contextDir if provided
    if (contextDir) {
      config.contextDir = contextDir;
    }

    await this.saveProjectConfig(config);
    return config;
  }

  /**
   * Load MCP configuration (.mcp.json)
   */
  static async getMCPConfig(): Promise<MCPConfigFile | null> {
    const configPath = this.getMCPConfigPath();

    if (!(await exists(configPath))) {
      return null;
    }

    try {
      const content = await Deno.readTextFile(configPath);
      return JSON.parse(content) as MCPConfigFile;
    } catch (error) {
      throw new Error(
        `Failed to load MCP config: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Save MCP configuration (.mcp.json)
   */
  static async saveMCPConfig(config: MCPConfigFile): Promise<void> {
    const configPath = this.getMCPConfigPath();
    await Deno.writeTextFile(configPath, JSON.stringify(config, null, 2) + "\n");
  }

  /**
   * Update MCP configuration with a new server
   */
  static async updateMCPConfig(
    serverId: string,
    serverConfig: MCPServerEntry,
  ): Promise<void> {
    let config = await this.getMCPConfig();

    if (!config) {
      config = { mcpServers: {} };
    }

    config.mcpServers[serverId] = serverConfig;
    await this.saveMCPConfig(config);
  }

  /**
   * Check if a server is configured in user-level MCP config
   */
  static async isServerInUserScope(serverId: string): Promise<boolean> {
    const home = Deno.env.get("HOME");
    if (!home) return false;

    const userMcpPath = join(home, ".config", "claude", "mcp.json");

    if (!(await exists(userMcpPath))) {
      return false;
    }

    try {
      const content = await Deno.readTextFile(userMcpPath);
      const config = JSON.parse(content) as MCPConfigFile;
      return serverId in config.mcpServers;
    } catch {
      return false;
    }
  }

  /**
   * Check if project is already initialized
   */
  static async isProjectInitialized(): Promise<boolean> {
    const mcpConfigExists = await exists(this.getMCPConfigPath());
    const projectConfigExists = await exists(this.getProjectConfigPath());
    return mcpConfigExists && projectConfigExists;
  }
}
