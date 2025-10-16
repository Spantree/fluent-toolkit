/**
 * MCP Server Registry
 * Manages the modular registry of available MCP servers
 */

import type { MCPServerModule } from "../types/lifecycle.ts";
import * as registryIndex from "../../registry/index.ts";

export class ServerRegistry {
  /**
   * Get all available MCP servers
   */
  static getAll(): MCPServerModule[] {
    return registryIndex.getAll();
  }

  /**
   * Get a specific server by ID
   */
  static getById(id: string): MCPServerModule | undefined {
    return registryIndex.getById(id);
  }

  /**
   * Get all core servers (recommended for all installations)
   */
  static getCore(): MCPServerModule[] {
    return registryIndex.getCore();
  }

  /**
   * Get all optional servers
   */
  static getOptional(): MCPServerModule[] {
    return registryIndex.getOptional();
  }

  /**
   * Get servers by category
   */
  static getByCategory(category: "core" | "optional"): MCPServerModule[] {
    return registryIndex.getByCategory(category);
  }

  /**
   * Get all server IDs
   */
  static getIds(): string[] {
    return registryIndex.getIds();
  }
}
