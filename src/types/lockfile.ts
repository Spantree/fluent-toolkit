/**
 * Type definitions for .ftk-lock.yaml
 *
 * The lock file stores version constraints and resolved versions for MCP servers
 */

export interface FtkLockFile {
  // Lock file format version for future compatibility
  version: string;

  // When the lock file was last updated
  updated: string; // ISO 8601 timestamp

  // MCP server version locks
  mcpServers: Record<string, McpServerLock>;
}

export interface McpServerLock {
  // Package name in registry (npm: @org/package, pypi: package-name)
  packageName: string;

  // Which package registry (npm or pypi)
  registry: "npm" | "pypi";

  // Version constraint (1.0.0, ^1.0.0, ~2.1.0, >=3.0.0, etc.)
  packageConstraint: string;

  // Actual resolved version that satisfies the constraint
  packageResolution: string;

  // Optional: When this version was resolved
  resolvedAt?: string; // ISO 8601 timestamp
}

// YAML representation (snake_case for YAML conventions)
interface McpServerLockYaml {
  package_name: string;
  registry: "npm" | "pypi";
  package_constraint: string;
  package_resolution: string;
  resolved_at?: string;
}

// Convert TypeScript camelCase to YAML snake_case
export function toYaml(lock: McpServerLock): McpServerLockYaml {
  return {
    package_name: lock.packageName,
    registry: lock.registry,
    package_constraint: lock.packageConstraint,
    package_resolution: lock.packageResolution,
    resolved_at: lock.resolvedAt,
  };
}

// Convert YAML snake_case to TypeScript camelCase
export function fromYaml(yaml: McpServerLockYaml): McpServerLock {
  return {
    packageName: yaml.package_name,
    registry: yaml.registry,
    packageConstraint: yaml.package_constraint,
    packageResolution: yaml.package_resolution,
    resolvedAt: yaml.resolved_at,
  };
}

/**
 * Default lock file structure
 */
export function createDefaultLockFile(): FtkLockFile {
  return {
    version: "1.0.0",
    updated: new Date().toISOString(),
    mcpServers: {},
  };
}

/**
 * Validate lock file structure
 */
export function isValidLockFile(data: unknown): data is FtkLockFile {
  if (typeof data !== "object" || data === null) return false;

  const lockFile = data as Partial<FtkLockFile>;

  // Check required fields
  if (typeof lockFile.version !== "string") return false;
  if (typeof lockFile.updated !== "string") return false;
  if (typeof lockFile.mcpServers !== "object" || lockFile.mcpServers === null) return false;

  // Validate each server entry (YAML format with snake_case)
  for (const [_serverId, serverLock] of Object.entries(lockFile.mcpServers)) {
    if (typeof serverLock !== "object" || serverLock === null) return false;

    // Check for YAML snake_case format
    const yamlLock = serverLock as unknown as Record<string, unknown>;
    if (typeof yamlLock.package_name !== "string") return false;
    if (yamlLock.registry !== "npm" && yamlLock.registry !== "pypi") return false;
    if (typeof yamlLock.package_constraint !== "string") return false;
    if (typeof yamlLock.package_resolution !== "string") return false;
  }

  return true;
}
