/**
 * Context Directory Manager
 * Manages the context folder for AI assistants and MCP servers
 */

import { join } from "@std/path";
import { ensureDir, exists } from "@std/fs";
import { ConfigManager } from "./config.ts";

export class ContextDirManager {
  /**
   * Get the context directory name from config
   * Returns null if no context directory is configured
   */
  static async getContextDirName(): Promise<string | null> {
    const config = await ConfigManager.getProjectConfig();
    return config?.contextDir || null;
  }

  /**
   * Get the full path to the context directory
   * Returns null if no context directory is configured
   */
  static async getContextDirPath(): Promise<string | null> {
    const dirName = await this.getContextDirName();
    if (!dirName) return null;
    return join(Deno.cwd(), dirName);
  }

  /**
   * Initialize the context directory
   * Creates the directory and .gitkeep file
   */
  static async initContextDir(dirName: string): Promise<void> {
    const contextPath = join(Deno.cwd(), dirName);
    await ensureDir(contextPath);

    // Create .gitkeep to ensure directory is tracked
    const gitkeepPath = join(contextPath, ".gitkeep");
    await Deno.writeTextFile(gitkeepPath, "");
  }

  /**
   * Create a subdirectory for a specific server
   * Returns null if no context directory is configured
   */
  static async createServerContextDir(
    serverId: string,
    customName?: string
  ): Promise<string | null> {
    const contextPath = await this.getContextDirPath();
    if (!contextPath) return null;

    const folderName = customName || serverId;
    const serverContextPath = join(contextPath, folderName);

    await ensureDir(serverContextPath);
    return serverContextPath;
  }

  /**
   * Check if context directory exists
   */
  static async exists(): Promise<boolean> {
    const contextPath = await this.getContextDirPath();
    if (!contextPath) return false;
    return await exists(contextPath);
  }

  /**
   * Update .gitignore for context directory
   * - Ignore all contents by default
   * - Keep .gitkeep
   * - Allowlist specific server folders if exposeContextToGit is true
   */
  static async updateGitignore(
    contextDirName: string,
    exposedFolders: string[] = []
  ): Promise<void> {
    const gitignorePath = join(Deno.cwd(), ".gitignore");

    let content = "";
    if (await exists(gitignorePath)) {
      content = await Deno.readTextFile(gitignorePath);
    }

    const lines = content.trim().split("\n");

    // Check if we already have context section
    const hasContextSection = lines.some((line) =>
      line.includes(`# ${contextDirName} directory`)
    );

    if (!hasContextSection) {
      // Add context section
      if (lines.length > 0 && lines[lines.length - 1] !== "") {
        lines.push("");
      }

      lines.push(`# ${contextDirName} directory (AI assistant context)`);
      lines.push(`${contextDirName}/*`);
      lines.push(`!${contextDirName}/.gitkeep`);

      // Add exposed folders
      for (const folder of exposedFolders) {
        lines.push(`!${contextDirName}/${folder}/`);
      }

      await Deno.writeTextFile(gitignorePath, lines.join("\n") + "\n");
    } else {
      // Update existing section with new exposed folders
      const contextIndex = lines.findIndex((line) =>
        line.includes(`# ${contextDirName} directory`)
      );

      if (contextIndex >= 0) {
        // Find the end of the context section
        let endIndex = contextIndex + 1;
        while (
          endIndex < lines.length &&
          lines[endIndex].startsWith(`${contextDirName}/`) ||
          lines[endIndex].startsWith(`!${contextDirName}/`)
        ) {
          endIndex++;
        }

        // Rebuild context section
        const newLines = [
          lines[contextIndex],
          `${contextDirName}/*`,
          `!${contextDirName}/.gitkeep`,
        ];

        for (const folder of exposedFolders) {
          newLines.push(`!${contextDirName}/${folder}/`);
        }

        // Replace old section with new
        lines.splice(contextIndex, endIndex - contextIndex, ...newLines);

        await Deno.writeTextFile(gitignorePath, lines.join("\n") + "\n");
      }
    }
  }

  /**
   * Check if any servers need a context directory
   */
  static needsContextDir(servers: Array<{ metadata: { contextFolder?: string; exposeContextToGit?: boolean } }>): boolean {
    return servers.some((s) => s.metadata.contextFolder || s.metadata.exposeContextToGit);
  }

  /**
   * Get the list of exposed context folders from installed servers
   */
  static getExposedFolders(servers: Array<{ metadata: { id: string; contextFolder?: string; exposeContextToGit?: boolean } }>): string[] {
    return servers
      .filter((s) => s.metadata.exposeContextToGit)
      .map((s) => s.metadata.contextFolder || s.metadata.id);
  }
}
