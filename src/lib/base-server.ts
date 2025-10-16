/**
 * Base MCP Server Module
 * Provides common patterns and default implementations
 */

import type {
  ConfigureResult,
  InstallResult,
  LifecycleContext,
  MCPServerModule,
  PrecheckResult,
  ServerMetadata,
  ValidationResult,
} from "../types/lifecycle.ts";
import type { MCPServerEntry } from "../types/index.ts";
import {
  commandExists,
  compareVersions,
  getCommandVersion,
  getInstallCommand,
} from "./utils/command.ts";
import { fetchLatestVersion } from "../utils/package-version.ts";

export interface DependencyRequirement {
  command: string;
  name: string;
  minVersion?: string;
  installCommand?: string;
}

export interface SecretRequirement {
  key: string;
  prompt: string;
  optional?: boolean;
}

export abstract class BaseMCPServer implements MCPServerModule {
  abstract metadata: ServerMetadata;

  /**
   * Resolve the version to use for this server
   * Returns the hardcoded metadata.version, or queries the registry for latest
   */
  async resolveVersion(): Promise<string | undefined> {
    // If version is explicitly set in metadata, use it
    if (this.metadata.version && this.metadata.version !== "latest") {
      return this.metadata.version;
    }

    // If package registry info is available, fetch latest version
    if (this.metadata.packageName && this.metadata.packageRegistry) {
      try {
        const versionInfo = await fetchLatestVersion(
          this.metadata.packageName,
          this.metadata.packageRegistry,
        );

        if (versionInfo.latestVersion) {
          return versionInfo.latestVersion;
        }

        // If fetch failed, log warning and fall back to undefined (latest)
        console.warn(
          `Failed to fetch latest version for ${this.metadata.packageName}: ${versionInfo.error}`,
        );
      } catch (error) {
        console.warn(
          `Error resolving version for ${this.metadata.name}:`,
          error,
        );
      }
    }

    // Fall back to undefined (let package manager use latest)
    return undefined;
  }

  /**
   * Override to specify system dependencies
   */
  protected getDependencies(): DependencyRequirement[] {
    return [];
  }

  /**
   * Override to specify required secrets
   */
  getSecrets(): SecretRequirement[] {
    return [];
  }

  /**
   * Override to provide custom CLAUDE.md content
   * By default, reads from claude.md in the server directory
   */
  abstract getClaudeMdContent(): string;

  /**
   * Override to provide custom MCP config generation
   * @param secrets - Configured secrets (usually empty as they're in .env.mcp.secrets)
   * @param version - Resolved version to use (from resolveVersion())
   */
  protected abstract generateMcpConfig(
    secrets: Record<string, string>,
    version?: string,
  ): MCPServerEntry;

  /**
   * Default precheck implementation
   * Checks all dependencies specified in getDependencies()
   */
  async precheck(ctx: LifecycleContext): Promise<PrecheckResult> {
    const dependencies = this.getDependencies();

    if (dependencies.length === 0) {
      return { success: true, message: "No dependencies required" };
    }

    const missing: Array<{
      dependency: string;
      message: string;
      installCommand?: string;
    }> = [];

    for (const dep of dependencies) {
      const exists = await commandExists(dep.command);

      if (!exists) {
        missing.push({
          dependency: dep.name,
          message: `${dep.name} is not installed`,
          installCommand: dep.installCommand || getInstallCommand(dep.command),
        });
        continue;
      }

      // Check version if specified
      if (dep.minVersion) {
        const version = await getCommandVersion(dep.command);

        if (!version) {
          ctx.warning(`Could not determine ${dep.name} version`);
          continue;
        }

        if (compareVersions(version, dep.minVersion) < 0) {
          missing.push({
            dependency: dep.name,
            message: `${dep.name} version ${version} is below minimum ${dep.minVersion}`,
            installCommand: dep.installCommand || getInstallCommand(dep.command),
          });
        } else {
          ctx.success(`${dep.name} version ${version} is installed`);
        }
      }
    }

    if (missing.length > 0) {
      return {
        success: false,
        message: `Missing ${missing.length} dependencies`,
        missing,
      };
    }

    return { success: true, message: "All dependencies satisfied" };
  }

  /**
   * Default configure implementation
   * Prompts for all secrets specified in getSecrets()
   */
  async configure(ctx: LifecycleContext): Promise<ConfigureResult> {
    const secretReqs = this.getSecrets();

    if (secretReqs.length === 0) {
      return { success: true, message: "No configuration required" };
    }

    const secrets: Record<string, string> = {};

    for (const req of secretReqs) {
      const value = await ctx.promptForSecret(req.key, req.prompt);

      if (!value && !req.optional) {
        return {
          success: false,
          message: `Required secret ${req.key} was not provided`,
        };
      }

      if (value) {
        secrets[req.key] = value;
      }
    }

    return {
      success: true,
      message: `Configured ${Object.keys(secrets).length} secret(s)`,
      secrets,
    };
  }

  /**
   * Default install implementation
   * Generates MCP config using generateMcpConfig()
   */
  async install(ctx: LifecycleContext): Promise<InstallResult> {
    try {
      // Resolve version before generating config
      const resolvedVersion = await this.resolveVersion();

      if (resolvedVersion && resolvedVersion !== this.metadata.version) {
        ctx.info(`Using latest version: ${resolvedVersion}`);
      }

      const secrets = {}; // Secrets are already saved by this point
      const mcpConfig = this.generateMcpConfig(secrets, resolvedVersion);

      return {
        success: true,
        message: `${this.metadata.name} configured successfully`,
        mcpConfig,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to generate configuration: ${
          error instanceof Error ? error.message : String(error)
        }`,
      };
    }
  }

  /**
   * Default validate implementation (optional)
   * Returns success by default - override for custom validation
   */
  async validate(_ctx: LifecycleContext): Promise<ValidationResult> {
    return {
      success: true,
      message: "No validation checks defined",
    };
  }

  /**
   * Display information for UI
   */
  getDisplayInfo(): { name: string; description: string; recommended: boolean } {
    return {
      name: this.metadata.name,
      description: this.metadata.description,
      recommended: this.metadata.category === "core",
    };
  }

  /**
   * Helper: Read CLAUDE.md content from file
   */
  protected async readClaudeMdFile(): Promise<string> {
    // Get the directory where this module is defined
    // This is a bit tricky - we'll need to pass the path from the concrete class
    throw new Error("readClaudeMdFile must be implemented by concrete class");
  }
}
