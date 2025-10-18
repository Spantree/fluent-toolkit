/**
 * Changelog Fetching and Parsing Utility
 * Fetches Claude Code changelog and extracts changes between versions
 */

import { parse as parseSemver, greaterOrEqual } from "@std/semver";

export interface ChangelogEntry {
  version: string;
  changes: string[];
}

const CHANGELOG_URL =
  "https://raw.githubusercontent.com/anthropics/claude-code/refs/heads/main/CHANGELOG.md";

/**
 * Fetch changelog from GitHub
 */
export async function fetchChangelog(): Promise<string | null> {
  try {
    const response = await fetch(CHANGELOG_URL);

    if (!response.ok) {
      console.error(`Failed to fetch changelog: ${response.status}`);
      return null;
    }

    return await response.text();
  } catch (error) {
    console.error(
      `Error fetching changelog: ${error instanceof Error ? error.message : String(error)}`,
    );
    return null;
  }
}

/**
 * Parse changelog markdown into structured entries
 */
export function parseChangelog(markdown: string): ChangelogEntry[] {
  const entries: ChangelogEntry[] = [];
  const lines = markdown.split("\n");

  let currentVersion: string | null = null;
  let currentChanges: string[] = [];

  for (const line of lines) {
    // Match version headers: ## [2.0.20] or ## 2.0.20
    const versionMatch = line.match(/^##\s+\[?(\d+\.\d+\.\d+)\]?/);

    if (versionMatch) {
      // Save previous entry if exists
      if (currentVersion && currentChanges.length > 0) {
        entries.push({
          version: currentVersion,
          changes: currentChanges,
        });
      }

      // Start new entry
      currentVersion = versionMatch[1];
      currentChanges = [];
    } else if (currentVersion && line.trim().startsWith("-")) {
      // Bullet point - extract change
      const change = line.trim().substring(1).trim();
      if (change) {
        currentChanges.push(change);
      }
    }
  }

  // Save last entry
  if (currentVersion && currentChanges.length > 0) {
    entries.push({
      version: currentVersion,
      changes: currentChanges,
    });
  }

  return entries;
}

/**
 * Get changes between two versions
 * Returns all changelog entries between currentVersion (exclusive) and targetVersion (inclusive)
 */
export function getChangesBetweenVersions(
  entries: ChangelogEntry[],
  currentVersion: string,
  targetVersion: string,
): ChangelogEntry[] {
  const changes: ChangelogEntry[] = [];

  try {
    const current = parseSemver(currentVersion);
    const target = parseSemver(targetVersion);

    for (const entry of entries) {
      try {
        const entryVersion = parseSemver(entry.version);

        // Include if: current < entry <= target
        if (
          greaterOrEqual(entryVersion, current) &&
          !greaterOrEqual(current, entryVersion) && // current < entry
          greaterOrEqual(target, entryVersion) // entry <= target
        ) {
          changes.push(entry);
        }
      } catch {
        // Skip entries with invalid version format
        continue;
      }
    }
  } catch (error) {
    console.error(
      `Error comparing versions: ${error instanceof Error ? error.message : String(error)}`,
    );
    return [];
  }

  return changes;
}

/**
 * Format changelog entries for display
 */
export function formatChangelog(
  entries: ChangelogEntry[],
  maxChanges = 10,
): string {
  if (entries.length === 0) {
    return "No changelog available";
  }

  const lines: string[] = [];

  for (const entry of entries) {
    lines.push(`\n📦 Version ${entry.version}:`);

    for (const change of entry.changes) {
      lines.push(`   • ${change}`);
    }
  }

  // Limit total changes displayed
  const changeCount = entries.reduce((sum, e) => sum + e.changes.length, 0);

  if (changeCount > maxChanges) {
    lines.push(`\n   ... and ${changeCount - maxChanges} more changes`);
  }

  return lines.join("\n");
}

/**
 * Get and format changes between versions
 * Fetches changelog, parses it, and returns formatted changes
 */
export async function getVersionChanges(
  currentVersion: string,
  targetVersion: string,
): Promise<string | null> {
  const changelog = await fetchChangelog();

  if (!changelog) {
    return null;
  }

  const entries = parseChangelog(changelog);
  const changes = getChangesBetweenVersions(
    entries,
    currentVersion,
    targetVersion,
  );

  if (changes.length === 0) {
    return null;
  }

  return formatChangelog(changes);
}
