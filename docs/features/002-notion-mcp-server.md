# Feature #002: Notion MCP Server Support

## Overview

Add Notion MCP server to the registry with authentication setup and usage documentation.

## Implementation Plan

### Phase 1: Registry Entry
- [ ] Create `registry/mcp-servers/notion/` directory
- [ ] Implement `index.ts` with lifecycle methods
- [ ] Add precheck for Node.js/npm availability
- [ ] Implement configure method for Notion integration token

### Phase 2: Authentication Setup
- [ ] Add interactive prompts for Notion credentials
  - Integration token (required)
  - Database IDs (optional)
- [ ] Store credentials in `.env.mcp.secrets`
- [ ] Validate token format

### Phase 3: Documentation
- [ ] Create `claude.md` fragment with usage examples
- [ ] Document Notion API capabilities
- [ ] Add troubleshooting guide
- [ ] Include links to Notion developer docs

## Technical Approach

```typescript
export const notionServer: MCPServer = {
  name: "notion",
  displayName: "Notion",
  description: "Interact with Notion databases and pages",

  async configure(ctx: SetupContext): Promise<void> {
    const token = await ctx.prompt({
      type: "input",
      name: "NOTION_API_TOKEN",
      message: "Enter your Notion integration token:"
    });

    await ctx.saveSecret("NOTION_API_TOKEN", token);
  },

  install(ctx: SetupContext): MCPConfig {
    return {
      type: "stdio",
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-notion"]
    };
  }
};
```

## Testing Plan

- Test with valid Notion integration token
- Test with invalid/malformed token
- Test MCP server installation via npm
- Verify CLAUDE.md instructions are clear
- Test database query capabilities

## Areas for Feedback

1. Should we pre-configure specific Notion databases during setup?
2. How should we handle Notion API rate limits?
3. Should we support multiple Notion workspaces?
4. What Notion capabilities should be documented first?

## Related Issues

- Issue #2: https://github.com/cedric/spantree-fluent/fluent-toolkit/issues/2

## References

- Notion API: https://developers.notion.com
- MCP Notion Server: https://github.com/modelcontextprotocol/servers/tree/main/src/notion
