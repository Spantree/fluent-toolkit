/**
 * Dotenv utilities for wrapping MCP server commands with environment variables
 */

import type { MCPServerEntry } from "../../types/index.ts";

/**
 * Wrap a command with dotenv-cli to inject environment variables
 */
export function wrapWithDotenv(
  command: string,
  args: string[],
  envFile = ".env.mcp.secrets"
): MCPServerEntry {
  return {
    command: "npx",
    args: ["dotenv-cli", "-e", envFile, "--", command, ...args],
  };
}

/**
 * Create an npx-based MCP server configuration
 */
export function createNpxConfig(packageName: string, useYFlag = true): MCPServerEntry {
  const args = useYFlag ? ["-y", packageName] : [packageName];
  return {
    command: "npx",
    args,
  };
}

/**
 * Create a uvx-based MCP server configuration
 */
export function createUvxConfig(packageName: string): MCPServerEntry {
  return {
    command: "uvx",
    args: [packageName],
  };
}

/**
 * Create an npx config with dotenv wrapper
 */
export function createNpxConfigWithSecrets(
  packageName: string,
  envFile = ".env.mcp.secrets"
): MCPServerEntry {
  return wrapWithDotenv("npx", ["-y", packageName], envFile);
}

/**
 * Create a uvx config with dotenv wrapper
 */
export function createUvxConfigWithSecrets(
  packageName: string,
  envFile = ".env.mcp.secrets"
): MCPServerEntry {
  return wrapWithDotenv("uvx", [packageName], envFile);
}
