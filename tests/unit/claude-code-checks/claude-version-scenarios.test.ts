/**
 * Manual test scenarios for Claude Code version checking
 * These are intended to be run manually, not as automated tests
 */

import {
  checkClaudeCodeInstallation,
  checkForUpgrade,
  getInstallCommand,
  getUpgradeCommand,
  parseVersion,
  meetsMinimumVersion,
  MIN_CLAUDE_VERSION,
} from "../../../src/utils/claude-version.ts";

console.log("=== Claude Code Version Checking Tests ===\n");

// Test 1: Parse version strings
console.log("Test 1: Version parsing");
console.log("  '1.2.3' =>", parseVersion("1.2.3"));
console.log("  'claude 1.2.3' =>", parseVersion("claude 1.2.3"));
console.log("  '1.2.3-beta.1' =>", parseVersion("1.2.3-beta.1"));
console.log("  'invalid' =>", parseVersion("invalid"));
console.log();

// Test 2: Version comparison
console.log("Test 2: Version comparison");
console.log("  1.0.0 >= 1.0.0:", meetsMinimumVersion("1.0.0", "1.0.0"));
console.log("  1.1.0 >= 1.0.0:", meetsMinimumVersion("1.1.0", "1.0.0"));
console.log("  0.9.0 >= 1.0.0:", meetsMinimumVersion("0.9.0", "1.0.0"));
console.log("  1.0.0-beta >= 1.0.0:", meetsMinimumVersion("1.0.0-beta.1", "1.0.0"));
console.log();

// Test 3: Get install/upgrade commands
console.log("Test 3: Platform commands");
console.log("  Install command:", getInstallCommand());
console.log("  Upgrade command:", getUpgradeCommand());
console.log();

// Test 4: Check current installation
console.log("Test 4: Current installation check");
const versionCheck = await checkClaudeCodeInstallation();
console.log("  Installed:", versionCheck.installed);
console.log("  Version:", versionCheck.version);
console.log("  Meets requirements:", versionCheck.meetsRequirements);
console.log("  Message:", versionCheck.message);
console.log();

// Test 5: Check for upgrades (if installed)
if (versionCheck.installed && versionCheck.version) {
  console.log("Test 5: Upgrade check");
  const upgradeCheck = await checkForUpgrade(versionCheck.version);
  console.log("  Upgrade available:", upgradeCheck.available);
  console.log("  Latest version:", upgradeCheck.latestVersion);
  console.log();
}

console.log("=== Scenarios to test manually ===\n");
console.log("Scenario 1: Not installed");
console.log("  - Uninstall Claude Code: brew uninstall claude-code");
console.log("  - Run: deno task dev init");
console.log("  - Should offer to install with command preview");
console.log();

console.log("Scenario 2: Outdated version");
console.log("  - Install older version (if available)");
console.log("  - Run: deno task dev init");
console.log("  - Should offer to upgrade with command preview");
console.log();

console.log("Scenario 3: Up to date");
console.log("  - Install latest: brew install claude-code");
console.log("  - Run: deno task dev init");
console.log("  - Should check for upgrades and proceed");
console.log();

console.log("Scenario 4: Upgrade available");
console.log("  - If upgrade is available, should offer to upgrade");
console.log("  - Should show command before executing");
console.log();

console.log("Scenario 5: --no-prompt mode");
console.log("  - Run: deno task dev init --no-prompt");
console.log("  - Should show instructions but not offer automatic install/upgrade");
console.log();
