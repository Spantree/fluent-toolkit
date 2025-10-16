/**
 * MCP Server Lifecycle Interface
 * Defines the contract for MCP server modules
 */

import type { MCPServerEntry } from "./index.ts";

// Server Metadata
export interface ServerMetadata {
  id: string;
  name: string;
  description: string;
  category: "core" | "optional";
  version?: string;
  homepage?: string;
  repository?: string;

  // Context directory settings
  contextFolder?: string; // Subfolder name in context dir (defaults to id)
  exposeContextToGit?: boolean; // Whether to expose this server's context folder to git

  // Package registry information (for dynamic version resolution)
  packageName?: string; // Package name in npm/PyPI (if different from id)
  packageRegistry?: "npm" | "pypi"; // Which registry to query for latest version
  packageVersion?: string; // Version or constraint (1.0.0, ^1.0.0, ~2.1.0, >=3.0.0, etc.)
}

// Lifecycle Results
export interface PrecheckResult {
  success: boolean;
  message?: string;
  missing?: Array<{
    dependency: string;
    message: string;
    installCommand?: string;
  }>;
}

export interface ConfigureResult {
  success: boolean;
  message?: string;
  secrets?: Record<string, string>;
  config?: Record<string, unknown>;
}

export interface InstallResult {
  success: boolean;
  message?: string;
  mcpConfig?: MCPServerEntry;
}

export interface ValidationResult {
  success: boolean;
  message?: string;
  details?: string;
}

// Lifecycle Context (utilities available to lifecycle methods)
export interface LifecycleContext {
  // Prompts
  promptForSecret(name: string, message: string): Promise<string>;
  promptConfirm(message: string, defaultValue?: boolean): Promise<boolean>;
  promptSelect<T extends string>(
    message: string,
    options: Array<{ value: T; name: string }>,
  ): Promise<T>;

  // Output
  info(message: string): void;
  success(message: string): void;
  warning(message: string): void;
  error(message: string): void;
  progress(message: string): void;

  // Environment
  getProjectPath(): string;
  getUserConfigPath(): string;

  // Utilities
  commandExists(command: string): Promise<boolean>;
  getCommandVersion(command: string): Promise<string | null>;
  runCommand(command: string, args: string[]): Promise<{ success: boolean; output: string }>;
}

// Main Lifecycle Interface
export interface MCPServerModule {
  metadata: ServerMetadata;

  /**
   * Pre-installation check
   * Verify system dependencies are available
   * Can be interactive (prompt to install) or declarative (return requirements)
   */
  precheck(ctx: LifecycleContext): Promise<PrecheckResult>;

  /**
   * Configuration phase
   * Collect API keys, secrets, and server-specific configuration
   * Can be interactive (prompt user) or declarative (return requirements)
   */
  configure(ctx: LifecycleContext): Promise<ConfigureResult>;

  /**
   * Installation phase
   * Generate MCP server configuration
   * Can perform additional setup if needed
   */
  install(ctx: LifecycleContext): Promise<InstallResult>;

  /**
   * Post-installation validation
   * Verify the server is configured correctly
   * Optional - can return success by default
   */
  validate?(ctx: LifecycleContext): Promise<ValidationResult>;

  /**
   * Get CLAUDE.md fragment content
   * Returns markdown content to be inserted in CLAUDE.md
   */
  getClaudeMdContent(): string;

  /**
   * Get display information for selection UI
   */
  getDisplayInfo(): {
    name: string;
    description: string;
    recommended: boolean;
  };

  /**
   * Get secret requirements (optional)
   * Used to check if the server has secrets that need to be configured
   */
  getSecrets?(): Array<{ key: string; prompt: string; optional?: boolean }>;
}
