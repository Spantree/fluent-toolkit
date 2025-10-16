/**
 * Dependency Validator
 * Checks for required system dependencies and validates versions
 */

import type { SystemDependency, ValidationResult } from "../types/index.ts";

export class DependencyValidator {
  /**
   * Check if a runtime is available and validate version if specified
   */
  static async checkRuntime(
    runtime: string,
    minVersion?: string
  ): Promise<ValidationResult> {
    // Check if command exists
    const exists = await this.commandExists(runtime);
    if (!exists) {
      return {
        success: false,
        message: `${runtime} is not installed`,
        installCommand: this.getInstallCommand(runtime),
      };
    }

    // Get version if minVersion is specified
    if (minVersion) {
      const version = await this.getVersion(runtime);
      if (!version) {
        return {
          success: false,
          message: `Could not determine ${runtime} version`,
        };
      }

      const meetsMinVersion = this.compareVersions(version, minVersion) >= 0;
      if (!meetsMinVersion) {
        return {
          success: false,
          message: `${runtime} version ${version} is below minimum required version ${minVersion}`,
          version,
          installCommand: this.getInstallCommand(runtime),
        };
      }

      return {
        success: true,
        message: `${runtime} version ${version} is installed`,
        version,
      };
    }

    return {
      success: true,
      message: `${runtime} is installed`,
    };
  }

  /**
   * Check if a command exists in PATH
   */
  private static async commandExists(command: string): Promise<boolean> {
    try {
      const process = new Deno.Command("which", {
        args: [command],
        stdout: "null",
        stderr: "null",
      });
      const { success } = await process.output();
      return success;
    } catch {
      return false;
    }
  }

  /**
   * Get the version of a runtime
   */
  private static async getVersion(runtime: string): Promise<string | null> {
    try {
      const versionArg = this.getVersionArg(runtime);
      const process = new Deno.Command(runtime, {
        args: [versionArg],
        stdout: "piped",
        stderr: "piped",
      });

      const { stdout, stderr } = await process.output();
      const output = new TextDecoder().decode(stdout || stderr);

      // Extract version number (e.g., "v18.0.0" or "18.0.0" or "Python 3.10.0")
      const versionMatch = output.match(/(\d+\.\d+\.\d+)/);
      return versionMatch ? versionMatch[1] : null;
    } catch {
      return null;
    }
  }

  /**
   * Get the version argument for different runtimes
   */
  private static getVersionArg(runtime: string): string {
    switch (runtime) {
      case "node":
        return "--version";
      case "python":
      case "python3":
        return "--version";
      case "uv":
        return "--version";
      case "docker":
        return "--version";
      default:
        return "--version";
    }
  }

  /**
   * Compare two semantic version strings
   * Returns: -1 if v1 < v2, 0 if v1 === v2, 1 if v1 > v2
   */
  private static compareVersions(v1: string, v2: string): number {
    const parts1 = v1.split(".").map(Number);
    const parts2 = v2.split(".").map(Number);

    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const num1 = parts1[i] || 0;
      const num2 = parts2[i] || 0;

      if (num1 > num2) return 1;
      if (num1 < num2) return -1;
    }

    return 0;
  }

  /**
   * Get installation command for a runtime
   */
  static getInstallCommand(runtime: string): string {
    switch (runtime) {
      case "node":
        return "brew install node";
      case "python":
      case "python3":
        return "brew install python";
      case "uv":
        return "brew install uv";
      case "docker":
        return "brew install --cask docker";
      default:
        return `# Install ${runtime} manually`;
    }
  }

  /**
   * Validate all dependencies for a list of system dependencies
   */
  static async validateDependencies(
    dependencies: SystemDependency[]
  ): Promise<Record<string, ValidationResult>> {
    const results: Record<string, ValidationResult> = {};

    for (const dep of dependencies) {
      if (dep.runtime) {
        results[dep.runtime] = await this.checkRuntime(dep.runtime, dep.minVersion);
      }
    }

    return results;
  }

  /**
   * Check if all dependencies are satisfied
   */
  static areAllDependenciesSatisfied(
    results: Record<string, ValidationResult>
  ): boolean {
    return Object.values(results).every((result) => result.success);
  }
}
