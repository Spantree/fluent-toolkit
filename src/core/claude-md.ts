/**
 * CLAUDE.md Manager
 * Manages CLAUDE.md file with marker-based inline content
 */

import { join } from "@std/path";
import { exists } from "@std/fs";
import type { SectionBounds } from "../types/index.ts";

export class ClaudeMdManager {
  /**
   * Get the CLAUDE.md file path
   */
  private static getClaudeMdPath(): string {
    return join(Deno.cwd(), "CLAUDE.md");
  }

  /**
   * Check if CLAUDE.md exists
   */
  static async exists(): Promise<boolean> {
    return await exists(this.getClaudeMdPath());
  }

  /**
   * Read CLAUDE.md content
   */
  static async read(): Promise<string> {
    const path = this.getClaudeMdPath();

    if (!(await exists(path))) {
      return "";
    }

    return await Deno.readTextFile(path);
  }

  /**
   * Write CLAUDE.md content
   */
  private static async write(content: string): Promise<void> {
    const path = this.getClaudeMdPath();
    await Deno.writeTextFile(path, content);
  }

  /**
   * Get the bounds (start and end line numbers) of a marked section
   */
  static async getSectionBounds(sectionId: string): Promise<SectionBounds | null> {
    const content = await this.read();
    const lines = content.split("\n");

    const startMarker = `<!-- ftk:begin:${sectionId} -->`;
    const endMarker = `<!-- ftk:end:${sectionId} -->`;

    const startIndex = lines.findIndex((line) => line.trim() === startMarker);
    const endIndex = lines.findIndex((line) => line.trim() === endMarker);

    if (startIndex === -1 || endIndex === -1) {
      return null;
    }

    return {
      start: startIndex,
      end: endIndex,
    };
  }

  /**
   * Upsert (insert or update) a marked section in CLAUDE.md
   */
  static async upsertSection(sectionId: string, content: string): Promise<void> {
    const existingContent = await this.read();
    const lines = existingContent.split("\n");

    const startMarker = `<!-- ftk:begin:${sectionId} -->`;
    const endMarker = `<!-- ftk:end:${sectionId} -->`;

    const bounds = await this.getSectionBounds(sectionId);

    if (bounds) {
      // Section exists, replace it
      const newSection = [startMarker, content.trim(), endMarker];
      lines.splice(bounds.start, bounds.end - bounds.start + 1, ...newSection);
    } else {
      // Section doesn't exist, append it
      if (lines.length > 0 && lines[lines.length - 1].trim() !== "") {
        lines.push("");
      }
      lines.push("---");
      lines.push("");
      lines.push(startMarker);
      lines.push(content.trim());
      lines.push(endMarker);
    }

    await this.write(lines.join("\n") + "\n");
  }

  /**
   * Remove a marked section from CLAUDE.md
   */
  static async removeSection(sectionId: string): Promise<void> {
    const bounds = await this.getSectionBounds(sectionId);

    if (!bounds) {
      return; // Section doesn't exist
    }

    const content = await this.read();
    const lines = content.split("\n");

    // Remove the section including markers
    lines.splice(bounds.start, bounds.end - bounds.start + 1);

    await this.write(lines.join("\n") + "\n");
  }

  /**
   * Initialize CLAUDE.md with basic structure if it doesn't exist
   */
  static async initialize(projectName: string): Promise<void> {
    if (await this.exists()) {
      return;
    }

    const content = [
      `# ${projectName}`,
      "",
      "<system_context>",
      "Project-specific conventions and guidelines.",
      "</system_context>",
      "",
      "<file_map>",
      "- CLAUDE.md - This file (project documentation)",
      "- .mcp.json - MCP server configuration",
      "</file_map>",
      "",
    ].join("\n");

    await this.write(content);
  }

  /**
   * Get a section's content (without markers)
   */
  static async getSectionContent(sectionId: string): Promise<string | null> {
    const bounds = await this.getSectionBounds(sectionId);

    if (!bounds) {
      return null;
    }

    const content = await this.read();
    const lines = content.split("\n");

    // Get lines between markers (excluding the markers themselves)
    const sectionLines = lines.slice(bounds.start + 1, bounds.end);

    return sectionLines.join("\n").trim();
  }
}
