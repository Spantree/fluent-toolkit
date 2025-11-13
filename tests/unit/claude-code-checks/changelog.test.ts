/**
 * Test changelog fetching and parsing
 */

import {
  fetchChangelog,
  formatChangelog,
  getChangesBetweenVersions,
  getVersionChanges,
  parseChangelog,
} from "../../../src/utils/changelog.ts";

console.log("=== Changelog Utility Tests ===\n");

// Test 1: Fetch changelog
console.log("Test 1: Fetching changelog from GitHub...");
const changelog = await fetchChangelog();

if (changelog) {
  console.log(`✅ Fetched ${changelog.length} characters`);
  console.log(`   First 100 chars: ${changelog.substring(0, 100)}...`);
} else {
  console.log("❌ Failed to fetch changelog");
}
console.log();

// Test 2: Parse changelog
if (changelog) {
  console.log("Test 2: Parsing changelog...");
  const entries = parseChangelog(changelog);
  console.log(`✅ Parsed ${entries.length} version entries`);

  if (entries.length > 0) {
    console.log(`   Latest version: ${entries[0].version}`);
    console.log(`   Latest changes: ${entries[0].changes.length} items`);
    console.log(`   First change: ${entries[0].changes[0]}`);
  }
  console.log();

  // Test 3: Get changes between versions
  console.log("Test 3: Getting changes between versions...");

  // Test case 1: 2.0.15 to 2.0.20
  const changes1 = getChangesBetweenVersions(entries, "2.0.15", "2.0.20");
  console.log(`   Changes from 2.0.15 to 2.0.20: ${changes1.length} versions`);
  for (const entry of changes1) {
    console.log(`     - v${entry.version}: ${entry.changes.length} changes`);
  }
  console.log();

  // Test case 2: 2.0.0 to 2.0.5
  const changes2 = getChangesBetweenVersions(entries, "2.0.0", "2.0.5");
  console.log(`   Changes from 2.0.0 to 2.0.5: ${changes2.length} versions`);
  for (const entry of changes2) {
    console.log(`     - v${entry.version}: ${entry.changes.length} changes`);
  }
  console.log();

  // Test 4: Format changelog
  console.log("Test 4: Formatting changelog...");
  const formatted = formatChangelog(changes1, 10);
  console.log(formatted);
  console.log();

  // Test 5: Get version changes (end-to-end)
  console.log("Test 5: End-to-end version changes...");
  const versionChanges = await getVersionChanges("2.0.15", "2.0.20");

  if (versionChanges) {
    console.log("✅ Successfully retrieved and formatted changes:");
    console.log(versionChanges);
  } else {
    console.log("❌ Failed to get version changes");
  }
}
