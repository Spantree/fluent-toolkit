/**
 * Base MCP Server Module
 * Provides common patterns and default implementations
 */

// Removed unused import
import type {
  ConfigureResult,
  InstallResult,
  LifecycleContext,
  MCPServerModule,
  PrecheckResult,
  ServerMetadata,
  ValidationResult,
} from "../types/lifecycle.ts";
import { commandExists, compareVersions, getCommandVersion, getInstallCommand } from "./utils/command.ts";

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
   */
  protected abstract generateMcpConfig(
    secrets: Record<string, string>
  ): { command: string; args?: string[]; env?: Record<string, string> };

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
  async install(_ctx: LifecycleContext): Promise<InstallResult> {
    try {
      const secrets = {}; // Secrets are already saved by this point
      const mcpConfig = this.generateMcpConfig(secrets);

      return {
        success: true,
        message: `${this.metadata.name} configured successfully`,
        mcpConfig,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to generate configuration: ${error instanceof Error ? error.message : String(error)}`,
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
