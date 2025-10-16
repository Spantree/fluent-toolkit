/**
 * Type definitions for Fluent Toolkit
 */

// Re-export lifecycle types for convenience
export type { MCPServerModule, ServerMetadata, LifecycleContext } from "./lifecycle.ts";

// MCP Server Metadata
export interface MCPServer {
  id: string;
  name: string;
  description: string;
  category: "core" | "optional";

  // Installation
  installMethod: "npm" | "uvx" | "git" | "binary";
  packageName?: string;
  gitRepo?: string;

  // Dependencies
  systemDependencies: SystemDependency[];

  // Environment & Secrets
  requiredEnvVars: EnvVariable[];

  // Configuration
  mcpConfig: MCPConfig;

  // Documentation
  docsTemplate?: string;
  usageExamples?: string[];
}

export interface SystemDependency {
  runtime?: "node" | "python" | "uv" | "docker";
  minVersion?: string;
  validateFn?: string;
}

export interface EnvVariable {
  name: string;
  prompt: string;
  validateFn?: string;
  scope?: "user" | "project";
}

export interface MCPConfig {
  command: string;
  args?: string[];
  env?: Record<string, string>;
}

// Validation Results
export interface ValidationResult {
  success: boolean;
  message?: string;
  version?: string;
  installCommand?: string;
}

// User Configuration (~/.ftk/config.json)
export interface UserConfig {
  version: string;
  preferences: UserPreferences;
  servers: Record<string, ServerConfig>;
}

export interface UserPreferences {
  allowValidation: boolean;
  autoInstallDeps: boolean;
}

export interface ServerConfig {
  enabled: boolean;
  config?: Record<string, unknown>;
}

// Project Configuration (.ftk/config.json)
export interface ProjectConfig {
  version: string;
  projectType?: string;
  contextDir?: string; // Name of context directory (optional, only if servers need it)
  servers: Record<string, ProjectServerConfig>;
}

export interface ProjectServerConfig {
  source: "user" | "project";
  overrides?: Record<string, unknown>;
  config?: Record<string, unknown>;
}

// MCP Configuration (.mcp.json)
export interface MCPConfigFile {
  mcpServers: Record<string, MCPServerEntry>;
}

export interface MCPServerEntry {
  command: string;
  args?: string[];
  env?: Record<string, string>;
}

// Secrets Management
export interface Secret {
  key: string;
  value: string;
  scope: "user" | "project";
}

// CLAUDE.md Section Bounds
export interface SectionBounds {
  start: number;
  end: number;
}

// CLI Command Options
export interface InitOptions {
  skipValidation?: boolean;
  force?: boolean;
  servers?: string[];
}

// Registry Metadata
export interface RegistryMetadata {
  registryVersion: string;
  minFtkVersion: string;
  lastUpdated: string;
}

export interface ServerRegistry {
  metadata: RegistryMetadata;
  servers: MCPServer[];
}
