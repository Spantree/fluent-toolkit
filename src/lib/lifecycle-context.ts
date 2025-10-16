/**
 * Lifecycle Context Implementation
 * Provides utilities to MCP server lifecycle methods
 */

import { join } from "@std/path";
import type { LifecycleContext } from "../types/lifecycle.ts";
import { Prompts } from "../ui/prompts.ts";
import { commandExists, getCommandVersion, runCommand } from "./utils/command.ts";

export class DefaultLifecycleContext implements LifecycleContext {
  // Prompts
  async promptForSecret(_name: string, message: string): Promise<string> {
    return await Prompts.secret(message);
  }

  async promptConfirm(message: string, defaultValue = true): Promise<boolean> {
    return await Prompts.confirm(message, defaultValue);
  }

  async promptSelect<T extends string>(
    message: string,
    options: Array<{ value: T; name: string }>
  ): Promise<T> {
    return await Prompts.select(message, options);
  }

  // Output
  info(message: string): void {
    Prompts.info(message);
  }

  success(message: string): void {
    Prompts.success(message);
  }

  warning(message: string): void {
    Prompts.warning(message);
  }

  error(message: string): void {
    Prompts.error(message);
  }

  progress(message: string): void {
    Prompts.progress(message);
  }

  // Environment
  getProjectPath(): string {
    return Deno.cwd();
  }

  getUserConfigPath(): string {
    const home = Deno.env.get("HOME");
    if (!home) {
      throw new Error("HOME environment variable not set");
    }
    return join(home, ".ftk");
  }

  // Utilities
  async commandExists(command: string): Promise<boolean> {
    return await commandExists(command);
  }

  async getCommandVersion(command: string): Promise<string | null> {
    return await getCommandVersion(command);
  }

  async runCommand(
    command: string,
    args: string[]
  ): Promise<{ success: boolean; output: string }> {
    return await runCommand(command, args);
  }
}
