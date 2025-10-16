/**
 * Interactive Prompts
 * Provides user-friendly CLI prompts using Cliffy
 */

import { Confirm, Input, Select, Checkbox } from "@cliffy/prompt";
import { colors } from "@cliffy/ansi/colors";
import type { MCPServer } from "../types/index.ts";

export class Prompts {
  /**
   * Confirm prompt
   */
  static async confirm(message: string, defaultValue = true): Promise<boolean> {
    return await Confirm.prompt({
      message,
      default: defaultValue,
    });
  }

  /**
   * Input prompt
   */
  static async input(
    message: string,
    options?: { default?: string; required?: boolean }
  ): Promise<string> {
    return await Input.prompt({
      message,
      default: options?.default,
      validate: (value) => {
        if (options?.required && !value.trim()) {
          return "This field is required";
        }
        return true;
      },
    });
  }

  /**
   * Secret input prompt (hidden input)
   */
  static async secret(message: string, required = true): Promise<string> {
    return await Input.prompt({
      message,
      validate: (value) => {
        if (required && !value.trim()) {
          return "This field is required";
        }
        return true;
      },
    });
  }

  /**
   * Select from list
   */
  static async select<T extends string>(
    message: string,
    options: Array<{ value: T; name: string }>
  ): Promise<T> {
    return await Select.prompt({
      message,
      options,
    }) as unknown as T;
  }

  /**
   * Multi-select from list
   */
  static async multiSelect(
    message: string,
    servers: MCPServer[]
  ): Promise<string[]> {
    const options = servers.map((server) => ({
      name: `${server.name} - ${server.description}`,
      value: server.id,
      checked: server.category === "core",
    }));

    return await Checkbox.prompt({
      message,
      options,
    }) as unknown as string[];
  }

  /**
   * Ask for validation permission
   */
  static async requestValidationPermission(): Promise<boolean> {
    console.log(
      colors.cyan("\n🔍 ftk needs to run validation checks to ensure dependencies are met.")
    );
    console.log(
      colors.dim("This will check for required tools like node, python, uv, etc.\n")
    );

    return await this.confirm("Allow validation checks?", true);
  }

  /**
   * Ask about installing a missing dependency
   */
  static async confirmInstall(
    dependency: string,
    command: string
  ): Promise<boolean> {
    console.log(colors.yellow(`\n⚠️  ${dependency} is not installed`));
    console.log(colors.dim(`To install, run: ${command}\n`));

    return await this.confirm(`Would you like to install ${dependency} now?`, false);
  }

  /**
   * Ask about server scope (user vs project)
   */
  static async selectServerScope(serverId: string): Promise<"user" | "project"> {
    console.log(
      colors.cyan(
        `\n📦 ${serverId} is already configured in your user-level MCP config`
      )
    );

    const choice = await this.select(
      "How would you like to proceed?",
      [
        { value: "user", name: "Use user-level configuration" },
        { value: "project", name: "Override with project-specific configuration" },
      ]
    );

    return choice;
  }

  /**
   * Ask for a secret with custom prompt
   */
  static async requestSecret(
    name: string,
    promptMessage: string,
    scope: "user" | "project"
  ): Promise<string> {
    console.log(
      colors.cyan(
        `\n🔐 ${name} is required for this server (scope: ${scope})`
      )
    );

    return await this.secret(promptMessage);
  }

  /**
   * Ask for context directory name
   */
  static async requestContextDirName(defaultName = "context"): Promise<string> {
    console.log(
      colors.cyan(
        "\n📁 AI assistants need a folder for context and resources"
      )
    );
    console.log(
      colors.dim(
        "This folder will store data for MCP servers like basic-memory, indexes, etc."
      )
    );

    const customName = await this.confirm(
      `Use default folder name "${defaultName}"?`,
      true
    );

    if (customName) {
      return defaultName;
    }

    return await this.input("Enter context folder name:", {
      default: defaultName,
      required: true,
    });
  }

  /**
   * Display success message
   */
  static success(message: string): void {
    console.log(colors.green(`\n✅ ${message}\n`));
  }

  /**
   * Display error message
   */
  static error(message: string): void {
    console.log(colors.red(`\n❌ ${message}\n`));
  }

  /**
   * Display warning message
   */
  static warning(message: string): void {
    console.log(colors.yellow(`\n⚠️  ${message}\n`));
  }

  /**
   * Display info message
   */
  static info(message: string): void {
    console.log(colors.cyan(`\nℹ️  ${message}\n`));
  }

  /**
   * Display progress message
   */
  static progress(message: string): void {
    console.log(colors.dim(`⏳ ${message}...`));
  }
}
