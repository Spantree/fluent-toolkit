/**
 * Sequential Thinking MCP Server
 */

import { join } from "@std/path";
import { BaseMCPServer } from "../../../src/lib/base-server.ts";
import { createNpxConfig } from "../../../src/lib/utils/dotenv.ts";
import type { DependencyRequirement, SecretRequirement } from "../../../src/lib/base-server.ts";
import type { ServerMetadata } from "../../../src/types/lifecycle.ts";

export class SequentialThinkingServer extends BaseMCPServer {
  override metadata: ServerMetadata = {
    id: "sequentialthinking",
    name: "Sequential Thinking",
    description: "Enhanced reasoning for complex multi-step problems and systematic analysis",
    category: "core",
    version: "1.0.0",
    repository: "https://github.com/modelcontextprotocol/servers",
  };

  protected override getDependencies(): DependencyRequirement[] {
    return [
      {
        command: "node",
        name: "Node.js",
        minVersion: "18.0.0",
      },
    ];
  }

  override getSecrets(): SecretRequirement[] {
    return []; // No secrets required
  }

  protected override generateMcpConfig(_secrets: Record<string, string>) {
    return createNpxConfig(
      "@modelcontextprotocol/server-sequential-thinking",
      true,
      this.metadata.version,
    );
  }

  override getClaudeMdContent(): string {
    // Read the claude.md file from this directory
    const modulePath = new URL(".", import.meta.url).pathname;
    const claudeMdPath = join(modulePath, "claude.md");

    try {
      return Deno.readTextFileSync(claudeMdPath);
    } catch (_error) {
      return `### ${this.metadata.name}\n\n${this.metadata.description}`;
    }
  }
}

// Export singleton instance
export default new SequentialThinkingServer();
