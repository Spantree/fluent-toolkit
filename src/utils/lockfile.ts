/**
 * Lock File Utilities
 *
 * Handles reading, writing, and updating .ftk-lock.yaml
 */

import { parse, stringify } from "@std/yaml";
import { join } from "@std/path";
import type { FtkLockFile, McpServerLock } from "../types/lockfile.ts";
import {
  createDefaultLockFile,
  fromYaml,
  isValidLockFile,
  toYaml,
} from "../types/lockfile.ts";

/**
 * Read lock file from project directory
 * @param projectPath - Path to project directory
 * @returns Lock file data or default if not found
 */
export async function readLockFile(projectPath: string): Promise<FtkLockFile> {
  const lockFilePath = join(projectPath, ".ftk-lock.yaml");

  try {
    const content = await Deno.readTextFile(lockFilePath);
    const parsed = parse(content);

    if (isValidLockFile(parsed)) {
      // Convert YAML snake_case to TypeScript camelCase
      const lockFile = parsed as unknown as {
        version: string;
        updated: string;
        mcpServers: Record<string, unknown>;
      };

      const convertedServers: Record<string, McpServerLock> = {};
      for (const [serverId, serverLock] of Object.entries(lockFile.mcpServers)) {
        convertedServers[serverId] = fromYaml(serverLock as never);
      }

      return {
        version: lockFile.version,
        updated: lockFile.updated,
        mcpServers: convertedServers,
      };
    }

    console.warn("Invalid lock file format, creating new lock file");
    return createDefaultLockFile();
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      // Lock file doesn't exist yet, return default
      return createDefaultLockFile();
    }

    // Handle YAML parsing errors or invalid format
    if (error instanceof SyntaxError || error instanceof Error) {
      console.warn("Failed to parse lock file, creating new lock file:", error.message);
      return createDefaultLockFile();
    }

    console.error("Error reading lock file:", error);
    throw error;
  }
}

/**
 * Write lock file to project directory
 * @param projectPath - Path to project directory
 * @param lockFile - Lock file data to write
 */
export async function writeLockFile(
  projectPath: string,
  lockFile: FtkLockFile,
): Promise<void> {
  const lockFilePath = join(projectPath, ".ftk-lock.yaml");

  // Update timestamp
  lockFile.updated = new Date().toISOString();

  // Convert TypeScript camelCase to YAML snake_case
  const yamlServers: Record<string, unknown> = {};
  for (const [serverId, serverLock] of Object.entries(lockFile.mcpServers)) {
    yamlServers[serverId] = toYaml(serverLock);
  }

  const yamlLockFile = {
    version: lockFile.version,
    updated: lockFile.updated,
    mcpServers: yamlServers,
  };

  const content = stringify(yamlLockFile, {
    skipInvalid: true,
    sortKeys: true,
  });

  await Deno.writeTextFile(lockFilePath, content);
}

/**
 * Update a server entry in the lock file
 * @param lockFile - Current lock file data
 * @param serverId - Server ID to update
 * @param serverLock - Server lock data
 * @returns Updated lock file
 */
export function updateServerLock(
  lockFile: FtkLockFile,
  serverId: string,
  serverLock: McpServerLock,
): FtkLockFile {
  return {
    ...lockFile,
    mcpServers: {
      ...lockFile.mcpServers,
      [serverId]: {
        ...serverLock,
        resolvedAt: new Date().toISOString(),
      },
    },
  };
}

/**
 * Get server lock entry from lock file
 * @param lockFile - Lock file data
 * @param serverId - Server ID to look up
 * @returns Server lock data or undefined if not found
 */
export function getServerLock(
  lockFile: FtkLockFile,
  serverId: string,
): McpServerLock | undefined {
  return lockFile.mcpServers[serverId];
}

/**
 * Remove a server entry from the lock file
 * @param lockFile - Current lock file data
 * @param serverId - Server ID to remove
 * @returns Updated lock file
 */
export function removeServerLock(
  lockFile: FtkLockFile,
  serverId: string,
): FtkLockFile {
  const { [serverId]: _removed, ...remaining } = lockFile.mcpServers;

  return {
    ...lockFile,
    mcpServers: remaining,
  };
}
