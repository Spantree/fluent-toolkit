/**
 * Tests for package version utilities
 */

import { assertEquals } from "jsr:@std/assert@^1.0.0";
import {
  fetchLatestVersion,
  fetchNpmLatestVersion,
  fetchPypiLatestVersion,
} from "./package-version.ts";

Deno.test("fetchNpmLatestVersion - valid package", async () => {
  const version = await fetchNpmLatestVersion("express");
  assertEquals(typeof version, "string");
  assertEquals(version !== null, true);
  // Version should match semantic versioning pattern
  assertEquals(/^\d+\.\d+\.\d+/.test(version!), true);
});

Deno.test("fetchNpmLatestVersion - scoped package", async () => {
  const version = await fetchNpmLatestVersion("@upstash/context7-mcp");
  assertEquals(typeof version, "string");
  assertEquals(version !== null, true);
  assertEquals(/^\d+\.\d+\.\d+/.test(version!), true);
});

Deno.test("fetchNpmLatestVersion - invalid package", async () => {
  const version = await fetchNpmLatestVersion("this-package-does-not-exist-123456");
  assertEquals(version, null);
});

Deno.test("fetchPypiLatestVersion - valid package", async () => {
  const version = await fetchPypiLatestVersion("requests");
  assertEquals(typeof version, "string");
  assertEquals(version !== null, true);
  assertEquals(/^\d+\.\d+\.\d+/.test(version!), true);
});

Deno.test("fetchPypiLatestVersion - invalid package", async () => {
  const version = await fetchPypiLatestVersion("this-package-does-not-exist-123456");
  assertEquals(version, null);
});

Deno.test("fetchLatestVersion - npm registry", async () => {
  const result = await fetchLatestVersion("express", "npm");
  assertEquals(result.registry, "npm");
  assertEquals(result.packageName, "express");
  assertEquals(typeof result.latestVersion, "string");
  assertEquals(result.latestVersion.length > 0, true);
  assertEquals(result.error, undefined);
});

Deno.test("fetchLatestVersion - pypi registry", async () => {
  const result = await fetchLatestVersion("requests", "pypi");
  assertEquals(result.registry, "pypi");
  assertEquals(result.packageName, "requests");
  assertEquals(typeof result.latestVersion, "string");
  assertEquals(result.latestVersion.length > 0, true);
  assertEquals(result.error, undefined);
});

Deno.test("fetchLatestVersion - handles errors gracefully", async () => {
  const result = await fetchLatestVersion("this-package-does-not-exist-123456", "npm");
  assertEquals(result.registry, "npm");
  assertEquals(result.packageName, "this-package-does-not-exist-123456");
  assertEquals(result.latestVersion, "");
  assertEquals(typeof result.error, "string");
});
