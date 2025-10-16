/**
 * MCP Server Registry
 * Discovers and exports all available MCP server modules
 */

import type { MCPServerModule } from "../src/types/lifecycle.ts";

// Import all server modules
import sequentialthinking from "./mcp-servers/sequentialthinking/index.ts";
import context7 from "./mcp-servers/context7/index.ts";
import exa from "./mcp-servers/exa/index.ts";
import basicmemory from "./mcp-servers/basic-memory/index.ts";
import notion from "./mcp-servers/notion/index.ts";

// Registry object
export const registry: Record<string, MCPServerModule> = {
  sequentialthinking,
  context7,
  exa,
  "basic-memory": basicmemory,
  notion,
};

// Helper functions
export function getAll(): MCPServerModule[] {
  return Object.values(registry);
}

export function getById(id: string): MCPServerModule | undefined {
  return registry[id];
}

export function getCore(): MCPServerModule[] {
  return getAll().filter((server) => server.metadata.category === "core");
}

export function getOptional(): MCPServerModule[] {
  return getAll().filter((server) => server.metadata.category === "optional");
}

export function getByCategory(category: "core" | "optional"): MCPServerModule[] {
  return getAll().filter((server) => server.metadata.category === category);
}

export function getIds(): string[] {
  return Object.keys(registry);
}

// Export default for convenience
export default {
  registry,
  getAll,
  getById,
  getCore,
  getOptional,
  getByCategory,
  getIds,
};
