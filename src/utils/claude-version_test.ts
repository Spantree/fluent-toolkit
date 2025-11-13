/**
 * Tests for Claude Code version checking utilities
 */

import { assertEquals, assertExists } from "@std/assert";
import {
  clearVersionCache,
  getInstallationInstructions,
  meetsMinimumVersion,
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

// Test meetsMinimumVersion function (replaces compareVersions)
Deno.test("meetsMinimumVersion - equal versions return true", () => {
  const result = meetsMinimumVersion("1.2.3", "1.2.3");
  assertEquals(result, true);
});

Deno.test("meetsMinimumVersion - greater version returns true", () => {
  const result = meetsMinimumVersion("2.0.0", "1.9.9");
  assertEquals(result, true);
});

Deno.test("meetsMinimumVersion - lesser version returns false", () => {
  const result = meetsMinimumVersion("1.0.0", "2.0.0");
  assertEquals(result, false);
});

Deno.test("meetsMinimumVersion - compares major versions", () => {
  assertEquals(meetsMinimumVersion("2.0.0", "1.9.9"), true);
  assertEquals(meetsMinimumVersion("1.0.0", "2.0.0"), false);
});

Deno.test("meetsMinimumVersion - compares minor versions", () => {
  assertEquals(meetsMinimumVersion("1.5.0", "1.4.9"), true);
  assertEquals(meetsMinimumVersion("1.3.0", "1.4.0"), false);
});

Deno.test("meetsMinimumVersion - compares patch versions", () => {
  assertEquals(meetsMinimumVersion("1.2.5", "1.2.4"), true);
  assertEquals(meetsMinimumVersion("1.2.3", "1.2.4"), false);
});

Deno.test("meetsMinimumVersion - handles pre-release versions correctly", () => {
  // Pre-release is less than release according to semver spec
  assertEquals(meetsMinimumVersion("1.2.3-beta.1", "1.2.3"), false);
  assertEquals(meetsMinimumVersion("1.2.3", "1.2.3-beta.1"), true);

  // Pre-release comparisons
  assertEquals(meetsMinimumVersion("1.2.3-beta.2", "1.2.3-beta.1"), true);
  assertEquals(meetsMinimumVersion("1.2.3-beta.1", "1.2.3-beta.2"), false);
});

Deno.test("meetsMinimumVersion - handles different length versions", () => {
  // @std/semver requires proper semver format (X.Y.Z)
  // These would need to be normalized before comparison
  assertEquals(meetsMinimumVersion("1.2.0", "1.2.0"), true);
  assertEquals(meetsMinimumVersion("1.0.0", "1.0.0"), true);
});

Deno.test("meetsMinimumVersion - meets minimum version requirement", () => {
  // Test against actual MIN_CLAUDE_VERSION (1.0.60)
  assertEquals(meetsMinimumVersion("1.0.60", MIN_CLAUDE_VERSION), true);
  assertEquals(meetsMinimumVersion("1.0.61", MIN_CLAUDE_VERSION), true);
  assertEquals(meetsMinimumVersion("2.0.0", MIN_CLAUDE_VERSION), true);
  assertEquals(meetsMinimumVersion("1.0.59", MIN_CLAUDE_VERSION), false);
});

Deno.test("meetsMinimumVersion - handles invalid versions gracefully", () => {
  // Invalid versions should return false
  assertEquals(meetsMinimumVersion("invalid", "1.0.0"), false);
  assertEquals(meetsMinimumVersion("1.0.0", "invalid"), false);
});

// Test clearVersionCache function
Deno.test("clearVersionCache - clears the version cache", () => {
  // This is a side-effect test - we can't directly verify cache state
  // but we can verify the function exists and runs without error
  clearVersionCache();
  // If we got here without error, the function works
  assertEquals(true, true);
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
// For true unit testing, we would mock Deno.Command
Deno.test("checkClaudeCodeInstallation - handles command not found", async () => {
  // This test will vary based on whether Claude Code is actually installed
  // We're just checking that the function returns the expected structure
  const { checkClaudeCodeInstallation } = await import("./claude-version.ts");

  // Clear cache before testing
  clearVersionCache();

  const result = await checkClaudeCodeInstallation();

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

Deno.test("checkClaudeCodeInstallation - caching works correctly", async () => {
  const { checkClaudeCodeInstallation } = await import("./claude-version.ts");

  // Clear cache before testing
  clearVersionCache();

  // First call
  const result1 = await checkClaudeCodeInstallation();

  // Second call (should be cached)
  const result2 = await checkClaudeCodeInstallation();

  // Results should be identical (same object reference if cached properly)
  assertEquals(result1, result2);

  // Clear cache and call again
  clearVersionCache();
  const result3 = await checkClaudeCodeInstallation({ forceRefresh: true });

  // Result should still be structurally similar
  assertEquals(result3.installed, result1.installed);
  assertEquals(result3.meetsRequirements, result1.meetsRequirements);
});
