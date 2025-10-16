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
  envFile = ".env.mcp.secrets",
): MCPServerEntry {
  return {
    command: "npx",
    args: ["dotenv-cli", "-e", envFile, "--", command, ...args],
  };
}

/**
 * Create an npx-based MCP server configuration
 * @param packageName - Package name (e.g., "@modelcontextprotocol/server-notion")
 * @param useYFlag - Whether to use -y flag (default: true)
 * @param version - Optional version to pin (e.g., "0.3.0")
 */
export function createNpxConfig(
  packageName: string,
  useYFlag = true,
  version?: string,
): MCPServerEntry {
  const packageWithVersion = version ? `${packageName}@${version}` : packageName;
  const args = useYFlag ? ["-y", packageWithVersion] : [packageWithVersion];
  return {
    command: "npx",
    args,
  };
}

/**
 * Create a uvx-based MCP server configuration
 * @param packageName - Package name (e.g., "mcp-server-exa")
 * @param version - Optional version to pin (e.g., "0.1.0")
 */
export function createUvxConfig(packageName: string, version?: string): MCPServerEntry {
  const packageWithVersion = version ? `${packageName}==${version}` : packageName;
  return {
    command: "uvx",
    args: [packageWithVersion],
  };
}

/**
 * Create an npx config with dotenv wrapper
 * @param packageName - Package name (e.g., "@modelcontextprotocol/server-github")
 * @param envFile - Path to environment file (default: ".env.mcp.secrets")
 * @param version - Optional version to pin (e.g., "0.2.0")
 */
export function createNpxConfigWithSecrets(
  packageName: string,
  envFile = ".env.mcp.secrets",
  version?: string,
): MCPServerEntry {
  const packageWithVersion = version ? `${packageName}@${version}` : packageName;
  return wrapWithDotenv("npx", ["-y", packageWithVersion], envFile);
}

/**
 * Create a uvx config with dotenv wrapper
 * @param packageName - Package name (e.g., "mcp-server-exa")
 * @param envFile - Path to environment file (default: ".env.mcp.secrets")
 * @param version - Optional version to pin (e.g., "0.1.0")
 */
export function createUvxConfigWithSecrets(
  packageName: string,
  envFile = ".env.mcp.secrets",
  version?: string,
): MCPServerEntry {
  const packageWithVersion = version ? `${packageName}==${version}` : packageName;
  return wrapWithDotenv("uvx", [packageWithVersion], envFile);
}
