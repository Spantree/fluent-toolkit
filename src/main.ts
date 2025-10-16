#!/usr/bin/env -S deno run --allow-all

/**
 * Fluent Toolkit (ftk)
 * An opinionated toolkit for agentic engineers
 * From the Fluent Workshop - https://fluentwork.shop
 */

import { Command } from "@cliffy/command";
import { InitCommand } from "./commands/init.ts";
import type { InitOptions } from "./types/index.ts";

const VERSION = "0.2.0";

await new Command()
  .name("ftk")
  .version(VERSION)
  .description(
    "Fluent Toolkit - An opinionated toolkit for agentic engineers\n" +
      "From the Fluent Workshop - https://fluentwork.shop",
  )
  .globalOption("-v, --verbose", "Enable verbose output")
  // Init command
  .command("init", "Initialize MCP servers for Claude Code in current project")
    .option("-f, --force", "Force re-initialization even if already configured")
    .option("--skip-validation", "Skip dependency validation checks")
    .option("--skip-checks", "Skip Claude Code installation and version checks")
    .option("-s, --servers <servers:string[]>", "Specify servers to install (comma-separated)")
    .option("--no-prompt", "Accept all defaults without prompting")
    .action(async (options) => {
      const initOptions: InitOptions = {
        force: options.force,
        skipValidation: options.skipValidation,
        skipChecks: options.skipChecks,
        servers: options.servers,
        noPrompt: !options.prompt, // Cliffy's --no-prompt becomes prompt: false
      };

      await InitCommand.execute(initOptions);
    })
    .reset()  // Reset to root command before adding default action
  // Default action (show help)
  .action(function () {
    this.showHelp();
  })
  .parse(Deno.args);
