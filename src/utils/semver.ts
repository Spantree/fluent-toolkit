/**
 * Semantic Versioning (Semver) Utilities
 *
 * Implements semver constraint resolution for MCP server versions
 */

/**
 * Parse a semantic version string into components
 * @param version - Version string (e.g., "1.2.3", "2.0.0-beta.1")
 * @returns Parsed version components or null if invalid
 */
export function parseVersion(version: string): {
  major: number;
  minor: number;
  patch: number;
  prerelease?: string;
} | null {
  // Match semver pattern: major.minor.patch[-prerelease]
  const match = version.match(/^(\d+)\.(\d+)\.(\d+)(?:-([a-zA-Z0-9.-]+))?$/);

  if (!match) return null;

  return {
    major: parseInt(match[1], 10),
    minor: parseInt(match[2], 10),
    patch: parseInt(match[3], 10),
    prerelease: match[4],
  };
}

/**
 * Compare two semantic versions
 * @returns -1 if v1 < v2, 0 if v1 === v2, 1 if v1 > v2
 */
export function compareVersions(v1: string, v2: string): number {
  const parsed1 = parseVersion(v1);
  const parsed2 = parseVersion(v2);

  if (!parsed1 || !parsed2) {
    throw new Error(`Invalid version format: ${!parsed1 ? v1 : v2}`);
  }

  // Compare major.minor.patch
  if (parsed1.major !== parsed2.major) return parsed1.major - parsed2.major > 0 ? 1 : -1;
  if (parsed1.minor !== parsed2.minor) return parsed1.minor - parsed2.minor > 0 ? 1 : -1;
  if (parsed1.patch !== parsed2.patch) return parsed1.patch - parsed2.patch > 0 ? 1 : -1;

  // Handle pre-release versions
  // Release versions are always greater than pre-release versions
  if (!parsed1.prerelease && parsed2.prerelease) return 1;
  if (parsed1.prerelease && !parsed2.prerelease) return -1;
  if (parsed1.prerelease && parsed2.prerelease) {
    return parsed1.prerelease.localeCompare(parsed2.prerelease);
  }

  return 0;
}

/**
 * Check if a version satisfies a constraint
 * @param version - Version to check (e.g., "1.2.3")
 * @param constraint - Constraint string (e.g., "^1.0.0", "~2.1.0", ">=3.0.0")
 * @returns true if version satisfies constraint
 */
export function satisfiesConstraint(version: string, constraint: string): boolean {
  const parsed = parseVersion(version);
  if (!parsed) return false;

  // Exact version match
  if (!constraint.match(/^[^0-9]/)) {
    return compareVersions(version, constraint) === 0;
  }

  // Parse constraint type and version
  const caretMatch = constraint.match(/^\^(\d+\.\d+\.\d+)$/);
  const tildeMatch = constraint.match(/^~(\d+\.\d+\.\d+)$/);
  const gteMatch = constraint.match(/^>=(\d+\.\d+\.\d+)$/);
  const gtMatch = constraint.match(/^>(\d+\.\d+\.\d+)$/);
  const lteMatch = constraint.match(/^<=(\d+\.\d+\.\d+)$/);
  const ltMatch = constraint.match(/^<(\d+\.\d+\.\d+)$/);

  // Caret (^): Allow changes that do not modify left-most non-zero digit
  // ^1.2.3 := >=1.2.3 <2.0.0
  // ^0.2.3 := >=0.2.3 <0.3.0
  // ^0.0.3 := >=0.0.3 <0.0.4
  if (caretMatch) {
    const constraintVer = parseVersion(caretMatch[1]);
    if (!constraintVer) return false;

    const cmp = compareVersions(version, caretMatch[1]);
    if (cmp < 0) return false; // version must be >= constraint

    if (constraintVer.major > 0) {
      return parsed.major === constraintVer.major;
    } else if (constraintVer.minor > 0) {
      return parsed.major === 0 && parsed.minor === constraintVer.minor;
    } else {
      return parsed.major === 0 && parsed.minor === 0 && parsed.patch === constraintVer.patch;
    }
  }

  // Tilde (~): Allow patch-level changes
  // ~1.2.3 := >=1.2.3 <1.3.0
  if (tildeMatch) {
    const constraintVer = parseVersion(tildeMatch[1]);
    if (!constraintVer) return false;

    const cmp = compareVersions(version, tildeMatch[1]);
    if (cmp < 0) return false; // version must be >= constraint

    return parsed.major === constraintVer.major && parsed.minor === constraintVer.minor;
  }

  // Greater than or equal (>=)
  if (gteMatch) {
    return compareVersions(version, gteMatch[1]) >= 0;
  }

  // Greater than (>)
  if (gtMatch) {
    return compareVersions(version, gtMatch[1]) > 0;
  }

  // Less than or equal (<=)
  if (lteMatch) {
    return compareVersions(version, lteMatch[1]) <= 0;
  }

  // Less than (<)
  if (ltMatch) {
    return compareVersions(version, ltMatch[1]) < 0;
  }

  // Invalid constraint format
  return false;
}

/**
 * Find the latest version that satisfies a constraint
 * @param versions - Array of available versions
 * @param constraint - Constraint string (e.g., "^1.0.0", "~2.1.0")
 * @returns Latest satisfying version or null if none found
 */
export function findLatestSatisfying(versions: string[], constraint: string): string | null {
  const satisfying = versions.filter((v) => satisfiesConstraint(v, constraint));

  if (satisfying.length === 0) return null;

  // Sort in descending order and return first (latest)
  satisfying.sort((a, b) => compareVersions(b, a));

  return satisfying[0];
}
