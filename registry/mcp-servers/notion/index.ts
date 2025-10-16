/**
 * Notion MCP Server
 * Provides integration with Notion databases and pages
 */

import { join } from "@std/path";
import { BaseMCPServer } from "../../../src/lib/base-server.ts";
import type { DependencyRequirement, SecretRequirement } from "../../../src/lib/base-server.ts";
import type { ServerMetadata } from "../../../src/types/lifecycle.ts";

export class NotionServer extends BaseMCPServer {
  override metadata: ServerMetadata = {
    id: "notion",
    name: "Notion",
    description: "Interact with Notion databases, pages, and workspaces",
    category: "optional",
    version: "1.0.0",
    homepage: "https://developers.notion.com",
  };

  protected override getDependencies(): DependencyRequirement[] {
    return [
      {
        command: "node",
        name: "Node.js",
        minVersion: "18.0.0",
      },
      {
        command: "npx",
        name: "npx",
      },
    ];
  }

  override getSecrets(): SecretRequirement[] {
    return [
      {
        key: "NOTION_API_TOKEN",
        prompt:
          "Enter your Notion integration token (get one at https://www.notion.so/my-integrations):",
        optional: false,
      },
    ];
  }

  protected override generateMcpConfig(_secrets: Record<string, string>) {
    return {
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-notion"],
      env: {
        NOTION_API_TOKEN: "${NOTION_API_TOKEN}",
      },
    };
  }

  override getClaudeMdContent(): string {
    const modulePath = new URL(".", import.meta.url).pathname;
    const claudeMdPath = join(modulePath, "claude.md");

    try {
      return Deno.readTextFileSync(claudeMdPath);
    } catch (_error) {
      return `### ${this.metadata.name}\n\n${this.metadata.description}`;
    }
  }
}

export default new NotionServer();
