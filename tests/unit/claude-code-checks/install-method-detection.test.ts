/**
 * Test installation method detection
 */

import {
  detectInstallationMethod,
  getInstallCommand,
  getUpgradeCommand,
} from "../../../src/utils/claude-version.ts";

console.log("=== Installation Method Detection Tests ===\n");

// Test 1: Detect current installation method
console.log("Test 1: Detecting installation method...");
const method = await detectInstallationMethod();
console.log(`   Current method: ${method}`);

// Show path for debugging
try {
  const whichCmd = new Deno.Command("which", {
    args: ["claude"],
    stdout: "piped",
  });
  const { stdout } = await whichCmd.output();
  const path = new TextDecoder().decode(stdout).trim();
  console.log(`   Claude path: ${path}`);
} catch {
  console.log("   Claude path: not found");
}
console.log();

// Test 2: Get install command
console.log("Test 2: Get install command...");
const installCmd = getInstallCommand();
console.log(`   Default: ${installCmd}`);

const installCmdBrew = getInstallCommand("brew");
console.log(`   With brew preference: ${installCmdBrew}`);

const installCmdNpm = getInstallCommand("npm");
console.log(`   With npm preference: ${installCmdNpm}`);
console.log();

// Test 3: Get upgrade command (auto-detects method)
console.log("Test 3: Get upgrade command...");
const upgradeCmd = await getUpgradeCommand();
console.log(`   Upgrade command: ${upgradeCmd}`);
console.log(`   (auto-detected based on: ${method})`);
console.log();

console.log("✅ All tests completed");
