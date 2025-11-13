/**
 * Init Command
 * Interactive wizard for setting up MCP servers using lifecycle methods
 */

import { basename } from "@std/path";
import { ConfigManager } from "../core/config.ts";
import { ServerRegistry } from "../core/registry.ts";
import { SecretsManager } from "../core/secrets.ts";
import { ClaudeMdManager } from "../core/claude-md.ts";
import { ContextDirManager } from "../core/context-dir.ts";
import { Prompts } from "../ui/prompts.ts";
import { DefaultLifecycleContext } from "../lib/lifecycle-context.ts";
import {
  checkClaudeCodeInstallation,
  checkForUpgrade,
  clearVersionCache,
  getInstallationInstructions,
  getInstallCommand,
  getUpgradeCommand,
  MIN_CLAUDE_VERSION,
} from "../utils/claude-version.ts";
import { getVersionChanges } from "../utils/changelog.ts";
import type { InitOptions, MCPServerEntry, MCPServerModule } from "../types/index.ts";

export class InitCommand {
  /**
   * Execute the init command with new lifecycle-based approach
   */
  static async execute(options: InitOptions = {}): Promise<void> {
    try {
      Prompts.info("Welcome to Fluent Toolkit!");
      Prompts.info("From the Fluent Workshop - https://fluentwork.shop");

      // 1. Pre-flight check: Verify Claude Code installation
      if (!options.skipChecks) {
        Prompts.progress("Checking Claude Code installation");
        const versionCheck = await checkClaudeCodeInstallation();

        // Scenario 1: Not installed
        if (!versionCheck.installed) {
          Prompts.error("Claude Code is not installed");

          const installCmd = getInstallCommand(); // Synchronous now

          if (installCmd && !options.noPrompt) {
            // Offer automatic installation
            console.log("\nWould you like to install Claude Code now?");
            console.log(`Command to run: ${installCmd}\n`);

            const shouldInstall = await Prompts.confirm(
              "Install Claude Code?",
              false,
            );

            if (shouldInstall) {
              Prompts.progress("Installing Claude Code");

              try {
                // Parse command to avoid shell injection
                const [command, ...args] = installCmd.split(/\s+/);
                const installCommand = new Deno.Command(command, {
                  args,
                  stdout: "inherit",
                  stderr: "inherit",
                });

                const { code } = await installCommand.output();

                if (code === 0) {
                  Prompts.success("Claude Code installed successfully");

                  // Clear cache and re-check
                  clearVersionCache();
                  const recheckResult = await checkClaudeCodeInstallation();

                  if (recheckResult.installed && recheckResult.meetsRequirements) {
                    Prompts.success(`Claude Code ${recheckResult.version} is ready`);
                  } else {
                    Prompts.warning("Installation completed but version check failed");
                    console.log("Please verify the installation and try again.\n");
                    return;
                  }
                } else {
                  Prompts.error("Installation failed");
                  console.log("\nPlease install manually:");
                  console.log(getInstallationInstructions());
                  return;
                }
              } catch (error) {
                Prompts.error(
                  `Installation error: ${error instanceof Error ? error.message : String(error)}`,
                );
                console.log("\nPlease install manually:");
                console.log(getInstallationInstructions());
                return;
              }
            } else {
              console.log(getInstallationInstructions());
              console.log("\nAfter installing Claude Code, run 'ftk init' again.");
              console.log("Or use 'ftk init --skip-checks' to bypass this check.\n");
              return;
            }
          } else {
            // No automatic install available or --no-prompt mode
            console.log(getInstallationInstructions());
            console.log("\nAfter installing Claude Code, run 'ftk init' again.");
            console.log("Or use 'ftk init --skip-checks' to bypass this check.\n");
            return;
          }
        } // Scenario 2: Outdated version
        else if (!versionCheck.meetsRequirements) {
          Prompts.warning(
            `Claude Code version ${versionCheck.version} is outdated (minimum: v${MIN_CLAUDE_VERSION})`,
          );

          const upgradeCmd = await getUpgradeCommand();

          if (upgradeCmd && !options.noPrompt && versionCheck.version) {
            // Fetch and show changelog
            const upgradeCheck = await checkForUpgrade(versionCheck.version);

            console.log("\nWould you like to upgrade Claude Code now?");
            console.log(`Command to run: ${upgradeCmd}`);

            // Show changelog if available
            if (upgradeCheck.latestVersion) {
              Prompts.progress("Fetching changelog");
              const changelog = await getVersionChanges(
                versionCheck.version,
                upgradeCheck.latestVersion,
              );

              if (changelog) {
                console.log("\n📋 What's new:");
                console.log(changelog);
              }
            }

            console.log();

            const shouldUpgrade = await Prompts.confirm(
              "Upgrade Claude Code?",
              false,
            );

            if (shouldUpgrade) {
              Prompts.progress("Upgrading Claude Code");

              try {
                // Parse command to avoid shell injection
                const [command, ...args] = upgradeCmd.split(/\s+/);
                const upgradeCommand = new Deno.Command(command, {
                  args,
                  stdout: "inherit",
                  stderr: "inherit",
                });

                const { code } = await upgradeCommand.output();

                if (code === 0) {
                  Prompts.success("Claude Code upgraded successfully");

                  // Clear cache and re-check
                  clearVersionCache();
                  const recheckResult = await checkClaudeCodeInstallation();

                  if (recheckResult.meetsRequirements) {
                    Prompts.success(`Claude Code ${recheckResult.version} is ready`);
                  } else {
                    Prompts.warning(
                      "Upgrade completed but version still doesn't meet requirements",
                    );
                    console.log("Please verify the upgrade and try again.\n");

                    const shouldContinue = await Prompts.confirm(
                      "Continue anyway?",
                      false,
                    );

                    if (!shouldContinue) {
                      Prompts.info("Setup cancelled");
                      return;
                    }
                  }
                } else {
                  Prompts.error("Upgrade failed");
                  console.log("\nPlease upgrade manually:");
                  console.log(getInstallationInstructions());

                  const shouldContinue = await Prompts.confirm(
                    "Continue with current version?",
                    false,
                  );

                  if (!shouldContinue) {
                    Prompts.info("Setup cancelled");
                    return;
                  }
                }
              } catch (error) {
                Prompts.error(
                  `Upgrade error: ${error instanceof Error ? error.message : String(error)}`,
                );
                console.log("\nPlease upgrade manually:");
                console.log(getInstallationInstructions());

                const shouldContinue = await Prompts.confirm(
                  "Continue with current version?",
                  false,
                );

                if (!shouldContinue) {
                  Prompts.info("Setup cancelled");
                  return;
                }
              }
            } else {
              console.log("\nSome features may not work correctly with older versions.");

              const shouldContinue = await Prompts.confirm(
                "Continue anyway?",
                false,
              );

              if (!shouldContinue) {
                Prompts.info("Setup cancelled");
                return;
              }
            }
          } else {
            // No automatic upgrade available or --no-prompt mode
            console.log(getInstallationInstructions());
            console.log("\nSome features may not work correctly with older versions.");

            if (!options.noPrompt) {
              const shouldContinue = await Prompts.confirm(
                "Continue anyway?",
                false,
              );

              if (!shouldContinue) {
                Prompts.info("Setup cancelled");
                return;
              }
            }
          }
        } // Scenario 3: Up to date - check for upgrades
        else {
          Prompts.success(`Claude Code ${versionCheck.version} detected`);

          // Check for available upgrades
          if (versionCheck.version) {
            const upgradeCheck = await checkForUpgrade(versionCheck.version);

            if (upgradeCheck.available && upgradeCheck.latestVersion) {
              Prompts.info(`Newer version available: ${upgradeCheck.latestVersion}`);

              const upgradeCmd = await getUpgradeCommand();

              if (upgradeCmd && !options.noPrompt) {
                console.log(`\nCommand to upgrade: ${upgradeCmd}`);

                // Show changelog if available
                Prompts.progress("Fetching changelog");
                const changelog = await getVersionChanges(
                  versionCheck.version,
                  upgradeCheck.latestVersion,
                );

                if (changelog) {
                  console.log("\n📋 What's new:");
                  console.log(changelog);
                }

                console.log();

                const shouldUpgrade = await Prompts.confirm(
                  "Upgrade to latest version?",
                  false,
                );

                if (shouldUpgrade) {
                  Prompts.progress("Upgrading Claude Code");

                  try {
                    // Parse command to avoid shell injection
                    const [command, ...args] = upgradeCmd.split(/\s+/);
                    const upgradeCommand = new Deno.Command(command, {
                      args,
                      stdout: "inherit",
                      stderr: "inherit",
                    });

                    const { code } = await upgradeCommand.output();

                    if (code === 0) {
                      Prompts.success(`Upgraded to Claude Code ${upgradeCheck.latestVersion}`);
                      clearVersionCache();
                    } else {
                      Prompts.warning("Upgrade failed - continuing with current version");
                    }
                  } catch (error) {
                    Prompts.warning(
                      `Upgrade error: ${error instanceof Error ? error.message : String(error)}`,
                    );
                    Prompts.info("Continuing with current version");
                  }
                }
              }
            }
          }
        }
      }

      // 2. Check if already initialized
      const isInitialized = await ConfigManager.isProjectInitialized();
      if (isInitialized && !options.force) {
        if (options.noPrompt) {
          Prompts.info("Project already initialized (use --force to override)");
          return;
        }

        const shouldContinue = await Prompts.confirm(
          "This project is already initialized. Continue anyway?",
          false,
        );

        if (!shouldContinue) {
          Prompts.info("Initialization cancelled");
          return;
        }
      }

      // 3. Get available servers
      const allServers = ServerRegistry.getAll();
      const coreServers = ServerRegistry.getCore();
      const optionalServers = ServerRegistry.getOptional();

      Prompts.info(
        `Found ${coreServers.length} core servers and ${optionalServers.length} optional servers`,
      );

      // 4. Server selection
      let selectedServers: MCPServerModule[];

      if (options.servers && options.servers.length > 0) {
        // Use provided server IDs
        selectedServers = options.servers
          .map((id) => ServerRegistry.getById(id))
          .filter((s): s is MCPServerModule => s !== undefined);

        if (selectedServers.length === 0) {
          Prompts.warning("No valid servers selected. Exiting.");
          return;
        }
      } else if (options.noPrompt) {
        // Use all core servers as default when --no-prompt is set
        selectedServers = coreServers;
        Prompts.info(
          `Installing core servers: ${coreServers.map((s) => s.metadata.name).join(", ")}`,
        );
      } else {
        // Interactive selection
        const selectedIds = await Prompts.multiSelect(
          "Select MCP servers to install:",
          allServers.map((s) => ({
            id: s.metadata.id,
            name: s.metadata.name,
            description: s.metadata.description,
            category: s.metadata.category,
          })) as Array<{
            id: string;
            name: string;
            description: string;
            category: string;
          }>,
        );

        selectedServers = selectedIds
          .map((id) => ServerRegistry.getById(id))
          .filter((s): s is MCPServerModule => s !== undefined);
      }

      if (selectedServers.length === 0) {
        Prompts.warning("No servers selected. Exiting.");
        return;
      }

      // 5. Get context directory name
      const contextDirName = options.contextDir ||
        (options.noPrompt ? "context" : await Prompts.requestContextDirName());

      // 6. Create lifecycle context
      const ctx = new DefaultLifecycleContext();

      // 7. Run lifecycle for each server
      const mcpConfig: Record<string, MCPServerEntry> = {};
      const installedServers: MCPServerModule[] = [];

      for (const server of selectedServers) {
        Prompts.info(`\nConfiguring ${server.metadata.name}...`);

        // Precheck
        if (!options.skipValidation) {
          Prompts.progress("Checking dependencies");
          const precheckResult = await server.precheck(ctx);

          if (!precheckResult.success) {
            Prompts.warning(`Dependency issues for ${server.metadata.name}:`);

            if (precheckResult.missing) {
              for (const missing of precheckResult.missing) {
                console.log(`  ❌ ${missing.message}`);
                if (missing.installCommand) {
                  console.log(`     Install: ${missing.installCommand}`);
                }
              }
            }

            if (options.noPrompt) {
              Prompts.info(`Skipping ${server.metadata.name} (missing dependencies)`);
              continue;
            }

            const shouldContinue = await Prompts.confirm(
              `Continue with ${server.metadata.name} anyway?`,
              false,
            );

            if (!shouldContinue) {
              Prompts.info(`Skipping ${server.metadata.name}`);
              continue;
            }
          }
        }

        // Configure (collect secrets)
        Prompts.progress("Collecting configuration");
        const configResult = await server.configure(ctx);

        if (!configResult.success) {
          Prompts.error(
            `Configuration failed for ${server.metadata.name}: ${configResult.message}`,
          );
          continue;
        }

        // Save secrets if any
        if (configResult.secrets && Object.keys(configResult.secrets).length > 0) {
          await SecretsManager.initSecretsFile("project");
          for (const [key, value] of Object.entries(configResult.secrets)) {
            await SecretsManager.saveSecret(key, String(value), "project");
          }
        }

        // Install (generate MCP config)
        Prompts.progress("Generating configuration");
        const installResult = await server.install(ctx);

        if (!installResult.success) {
          Prompts.error(
            `Installation failed for ${server.metadata.name}: ${installResult.message}`,
          );
          continue;
        }

        if (installResult.mcpConfig) {
          mcpConfig[server.metadata.id] = installResult.mcpConfig;
          installedServers.push(server);
          Prompts.success(`${server.metadata.name} configured successfully`);
        }
      }

      if (installedServers.length === 0) {
        Prompts.warning("No servers were successfully configured");
        return;
      }

      // 8. Save configurations
      Prompts.progress("Saving configurations");

      // Save .mcp.json
      await ConfigManager.saveMCPConfig({ mcpServers: mcpConfig });

      // Save .ftk/config.json with context directory
      const projectConfig = await ConfigManager.initProjectConfig(contextDirName);
      for (const server of installedServers) {
        projectConfig.servers[server.metadata.id] = {
          source: "project",
        };
      }
      await ConfigManager.saveProjectConfig(projectConfig);

      // 9. Create context directory (if needed)
      if (contextDirName) {
        Prompts.progress(`Creating ${contextDirName} directory`);
        await ContextDirManager.initContextDir(contextDirName);

        // Create server-specific context subdirectories
        for (const server of installedServers) {
          if (server.metadata.contextFolder || server.metadata.exposeContextToGit) {
            await ContextDirManager.createServerContextDir(
              server.metadata.id,
              server.metadata.contextFolder,
            );
          }
        }

        // Update .gitignore for context directory
        const exposedFolders = ContextDirManager.getExposedFolders(installedServers);
        await ContextDirManager.updateGitignore(contextDirName, exposedFolders);
      }

      // 10. Update CLAUDE.md
      Prompts.progress("Updating CLAUDE.md");

      const projectName = basename(Deno.cwd());
      await ClaudeMdManager.initialize(projectName);

      // Add each server's CLAUDE.md fragment with server-specific marker
      for (const server of installedServers) {
        const content = server.getClaudeMdContent();
        await ClaudeMdManager.upsertSection(
          `mcp:${server.metadata.id}`,
          content,
        );
      }

      // Ensure .gitignore
      const hasSecrets = installedServers.some(
        (s) => s.getSecrets && s.getSecrets().length > 0,
      );
      if (hasSecrets) {
        await SecretsManager.ensureGitignore();
      }

      // 11. Success!
      Prompts.success("Setup complete!");

      console.log("\n📋 Summary:");
      console.log(`  • Configured ${installedServers.length} MCP server(s):`);
      for (const server of installedServers) {
        console.log(`    - ${server.metadata.name}`);
      }
      console.log(`  • Created .mcp.json`);
      console.log(`  • Created .ftk/config.json`);

      if (contextDirName) {
        console.log(`  • Created ${contextDirName}/ directory`);
      }

      console.log(`  • Updated CLAUDE.md`);
      console.log(`  • Updated .gitignore`);

      if (hasSecrets) {
        console.log(`  • Created .env.mcp.secrets`);
      }

      console.log("\n🚀 Next steps:");
      console.log("  1. Review the generated files");
      console.log("  2. Run 'claude' to start Claude Code");
      console.log("  3. Claude Code will automatically load your MCP servers");

      console.log("\n🎓 Learn more at https://fluentwork.shop\n");
    } catch (error) {
      Prompts.error(
        `Initialization failed: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }
}
