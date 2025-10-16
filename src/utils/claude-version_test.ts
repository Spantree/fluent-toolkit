/**
 * Tests for Claude Code version checking utilities
 */

import { assertEquals, assertExists } from "@std/assert";
import {
  compareVersions,
  getInstallationInstructions,
  MIN_CLAUDE_VERSION,
  parseVersion,
} from "./claude-version.ts";

// Test parseVersion function
Deno.test("parseVersion - extracts version from standard output", () => {
  const output = "claude 1.2.3";
  const result = parseVersion(output);
  assertEquals(result, "1.2.3");
});

Deno.test("parseVersion - extracts version without prefix", () => {
  const output = "1.2.3";
  const result = parseVersion(output);
  assertEquals(result, "1.2.3");
});

Deno.test("parseVersion - handles pre-release versions", () => {
  const output = "claude 1.2.3-beta.1";
  const result = parseVersion(output);
  assertEquals(result, "1.2.3-beta.1");
});

Deno.test("parseVersion - handles alpha versions", () => {
  const output = "1.2.3-alpha.4";
  const result = parseVersion(output);
  assertEquals(result, "1.2.3-alpha.4");
});

Deno.test("parseVersion - returns null for invalid input", () => {
  const output = "invalid version string";
  const result = parseVersion(output);
  assertEquals(result, null);
});

Deno.test("parseVersion - handles version with extra text", () => {
  const output = "Claude Code version 1.2.3 (build 456)";
  const result = parseVersion(output);
  assertEquals(result, "1.2.3");
});

// Test compareVersions function
Deno.test("compareVersions - equal versions return 0", () => {
  const result = compareVersions("1.2.3", "1.2.3");
  assertEquals(result, 0);
});

Deno.test("compareVersions - first version greater returns 1", () => {
  const result = compareVersions("2.0.0", "1.9.9");
  assertEquals(result, 1);
});

Deno.test("compareVersions - first version lesser returns -1", () => {
  const result = compareVersions("1.0.0", "2.0.0");
  assertEquals(result, -1);
});

Deno.test("compareVersions - compares major versions", () => {
  assertEquals(compareVersions("2.0.0", "1.9.9"), 1);
  assertEquals(compareVersions("1.0.0", "2.0.0"), -1);
});

Deno.test("compareVersions - compares minor versions", () => {
  assertEquals(compareVersions("1.5.0", "1.4.9"), 1);
  assertEquals(compareVersions("1.3.0", "1.4.0"), -1);
});

Deno.test("compareVersions - compares patch versions", () => {
  assertEquals(compareVersions("1.2.5", "1.2.4"), 1);
  assertEquals(compareVersions("1.2.3", "1.2.4"), -1);
});

Deno.test("compareVersions - handles pre-release versions", () => {
  // Pre-release tags are stripped, so these compare as equal base versions
  const result = compareVersions("1.2.3-beta.1", "1.2.3");
  assertEquals(result, 0);
});

Deno.test("compareVersions - handles different length versions", () => {
  assertEquals(compareVersions("1.2", "1.2.0"), 0);
  assertEquals(compareVersions("1", "1.0.0"), 0);
});

Deno.test("compareVersions - meets minimum version requirement", () => {
  // Test against actual MIN_CLAUDE_VERSION
  assertEquals(compareVersions("1.0.0", MIN_CLAUDE_VERSION), 0);
  assertEquals(compareVersions("1.0.1", MIN_CLAUDE_VERSION), 1);
  assertEquals(compareVersions("2.0.0", MIN_CLAUDE_VERSION), 1);
  assertEquals(compareVersions("0.9.9", MIN_CLAUDE_VERSION), -1);
});

// Test getInstallationInstructions function
Deno.test("getInstallationInstructions - returns platform-specific instructions", () => {
  const instructions = getInstallationInstructions();

  // Should return a non-empty string
  assertExists(instructions);
  assertEquals(typeof instructions, "string");
  assertEquals(instructions.length > 0, true);

  // Should contain Claude Code installation reference
  assertEquals(instructions.includes("Claude Code"), true);

  // Should contain documentation link
  assertEquals(instructions.includes("https://docs.claude.com/claude-code/install"), true);
});

Deno.test("getInstallationInstructions - contains platform-appropriate commands", () => {
  const instructions = getInstallationInstructions();
  const platform = Deno.build.os;

  if (platform === "darwin") {
    assertEquals(instructions.includes("brew install"), true);
  } else if (platform === "windows") {
    assertEquals(instructions.includes("winget"), true);
  }
  // Linux doesn't have a specific package manager command, just docs link
});

// Test MIN_CLAUDE_VERSION constant
Deno.test("MIN_CLAUDE_VERSION - is defined and valid", () => {
  assertExists(MIN_CLAUDE_VERSION);
  assertEquals(typeof MIN_CLAUDE_VERSION, "string");

  // Should be a valid version format
  const parsed = parseVersion(MIN_CLAUDE_VERSION);
  assertEquals(parsed, MIN_CLAUDE_VERSION);
});

// Integration-style tests for checkClaudeCodeInstallation
// Note: These tests actually execute the claude command if available
Deno.test("checkClaudeCodeInstallation - handles command not found", async () => {
  // This test will vary based on whether Claude Code is actually installed
  // We're just checking that the function returns the expected structure
  const result = await import("./claude-version.ts").then(
    (mod) => mod.checkClaudeCodeInstallation()
  );

  assertExists(result);
  assertEquals(typeof result.installed, "boolean");
  assertEquals(typeof result.meetsRequirements, "boolean");

  if (result.version) {
    assertEquals(typeof result.version, "string");
  }

  if (result.message) {
    assertEquals(typeof result.message, "string");
  }
});
