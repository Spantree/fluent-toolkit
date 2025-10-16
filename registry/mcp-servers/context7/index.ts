/**
 * Context7 MCP Server
 */

import { BaseMCPServer } from "../../../src/lib/base-server.ts";
import { createNpxConfig } from "../../../src/lib/utils/dotenv.ts";
import type { DependencyRequirement, SecretRequirement } from "../../../src/lib/base-server.ts";
import type { ServerMetadata } from "../../../src/types/lifecycle.ts";
import claudeMdContent from "./claude.md" with { type: "text" };

export class Context7Server extends BaseMCPServer {
  override metadata: ServerMetadata = {
    id: "context7",
    name: "Context7",
    description:
      "Up-to-date library documentation and code examples from the open source ecosystem",
    category: "core",
    packageName: "@upstash/context7-mcp",
    packageRegistry: "npm",
    homepage: "https://context7.ai",
    repository: "https://github.com/upstash/context7-mcp",
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
    // Context7 can work without API key for basic usage
    return [];
  }

  protected override generateMcpConfig(_secrets: Record<string, string>, version?: string) {
    return createNpxConfig("@upstash/context7-mcp", true, version);
  }

  override getClaudeMdContent(): string {
    return claudeMdContent;
  }
}

export default new Context7Server();
