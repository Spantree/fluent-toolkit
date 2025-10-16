/**
 * Package Version Utilities
 *
 * Utilities for fetching latest package versions from npm and PyPI registries.
 */

export interface PackageVersionInfo {
  packageName: string;
  latestVersion: string;
  registry: "npm" | "pypi";
  error?: string;
}

/**
 * Fetch the latest version of an npm package
 * @param packageName - Package name (e.g., "@modelcontextprotocol/server-sequential-thinking")
 * @returns Latest version string or null if not found
 */
export async function fetchNpmLatestVersion(
  packageName: string,
): Promise<string | null> {
  try {
    const registryUrl = `https://registry.npmjs.org/${encodeURIComponent(packageName)}/latest`;
    const response = await fetch(registryUrl, {
      headers: { "Accept": "application/json" },
    });

    if (!response.ok) {
      // Consume the response body to prevent resource leak
      await response.text();
      console.error(
        `Failed to fetch npm package ${packageName}: ${response.status}`,
      );
      return null;
    }

    const data = await response.json();
    return data.version || null;
  } catch (error) {
    console.error(`Error fetching npm package ${packageName}:`, error);
    return null;
  }
}

/**
 * Fetch the latest version of a PyPI package
 * @param packageName - Package name (e.g., "mcp-server-exa")
 * @returns Latest version string or null if not found
 */
export async function fetchPypiLatestVersion(
  packageName: string,
): Promise<string | null> {
  try {
    const registryUrl = `https://pypi.org/pypi/${encodeURIComponent(packageName)}/json`;
    const response = await fetch(registryUrl, {
      headers: { "Accept": "application/json" },
    });

    if (!response.ok) {
      // Consume the response body to prevent resource leak
      await response.text();
      console.error(
        `Failed to fetch PyPI package ${packageName}: ${response.status}`,
      );
      return null;
    }

    const data = await response.json();
    return data.info?.version || null;
  } catch (error) {
    console.error(`Error fetching PyPI package ${packageName}:`, error);
    return null;
  }
}

/**
 * Fetch latest version for a package from the appropriate registry
 * @param packageName - Package name
 * @param registry - Registry type ("npm" or "pypi")
 * @returns PackageVersionInfo with version or error
 */
export async function fetchLatestVersion(
  packageName: string,
  registry: "npm" | "pypi",
): Promise<PackageVersionInfo> {
  const result: PackageVersionInfo = {
    packageName,
    latestVersion: "",
    registry,
  };

  try {
    const version = registry === "npm"
      ? await fetchNpmLatestVersion(packageName)
      : await fetchPypiLatestVersion(packageName);

    if (version) {
      result.latestVersion = version;
    } else {
      result.error = `Failed to fetch version from ${registry}`;
    }
  } catch (error) {
    result.error = error instanceof Error ? error.message : "Unknown error";
  }

  return result;
}
