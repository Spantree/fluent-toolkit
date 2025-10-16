/**
 * Exa Research MCP Server
 */

import { join } from "@std/path";
import { BaseMCPServer } from "../../../src/lib/base-server.ts";
import { createUvxConfigWithSecrets } from "../../../src/lib/utils/dotenv.ts";
import type { DependencyRequirement, SecretRequirement } from "../../../src/lib/base-server.ts";
import type { ServerMetadata } from "../../../src/types/lifecycle.ts";

export class ExaServer extends BaseMCPServer {
  override metadata: ServerMetadata = {
    id: "exa",
    name: "Exa Research",
    description: "Powerful web search and research capabilities with AI-powered content extraction",
    category: "optional",
    packageName: "mcp-server-exa",
    packageRegistry: "pypi",
    homepage: "https://exa.ai",
  };

  protected override getDependencies(): DependencyRequirement[] {
    return [
      {
        command: "python3",
        name: "Python",
        minVersion: "3.10.0",
      },
      {
        command: "uv",
        name: "uv",
      },
    ];
  }

  override getSecrets(): SecretRequirement[] {
    return [
      {
        key: "EXA_API_KEY",
        prompt: "Enter your Exa API key (get one at https://exa.ai):",
        optional: false,
      },
    ];
  }

  protected override generateMcpConfig(_secrets: Record<string, string>, version?: string) {
    // Use uvx with dotenv wrapper to inject EXA_API_KEY
    return createUvxConfigWithSecrets(
      "mcp-server-exa",
      ".env.mcp.secrets",
      version,
    );
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

export default new ExaServer();
