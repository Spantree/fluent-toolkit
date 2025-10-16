# Feature #008: Context7 Optional API Key Configuration

## Overview

Add optional API key configuration for Context7 MCP server. Context7 works without a key but has rate limits; providing a key increases quota.

## Implementation Plan

### Phase 1: Registry Updates
- [ ] Update `registry/mcp-servers/context7/index.ts`
- [ ] Add optional `configure()` lifecycle method
- [ ] Implement optional API key prompt

### Phase 2: Authentication Flow
- [ ] Add conditional prompt for Context7 API key
- [ ] Clearly communicate that key is optional
- [ ] Explain benefits of providing a key (higher rate limits)
- [ ] Store key in `.env.mcp.secrets` as `CONTEXT7_API_KEY` if provided
- [ ] Support both configurations (with/without key)

### Phase 3: Documentation
- [ ] Update `registry/mcp-servers/context7/claude.md`
- [ ] Document optional authentication
- [ ] Explain rate limits and quota differences
- [ ] Add instructions for getting an API key

### Phase 4: Configuration Generation
- [ ] Generate MCP config without env vars if no key provided
- [ ] Generate MCP config with dotenv-cli if key provided
- [ ] Ensure both configurations work correctly

## Technical Approach

```typescript
export const context7Server: MCPServer = {
  name: "context7",
  displayName: "Context7",
  description: "Up-to-date library documentation and code examples",

  async configure(ctx: SetupContext): Promise<void> {
    const useApiKey = await ctx.confirm({
      message: "Do you want to configure a Context7 API key? (optional, provides higher rate limits)",
      default: false
    });

    if (useApiKey) {
      const apiKey = await ctx.prompt({
        type: "input",
        name: "CONTEXT7_API_KEY",
        message: "Enter your Context7 API key (get one at https://context7.dev):"
      });

      await ctx.saveSecret("CONTEXT7_API_KEY", apiKey);
    }
  },

  install(ctx: SetupContext): MCPConfig {
    const hasApiKey = ctx.hasSecret("CONTEXT7_API_KEY");

    if (hasApiKey) {
      return {
        type: "stdio",
        command: "npx",
        args: [
          "-y",
          "dotenv-cli",
          "-e",
          ".env.mcp.secrets",
          "--",
          "npx",
          "-y",
          "@modelcontextprotocol/server-context7"
        ],
        env: {}
      };
    } else {
      return {
        type: "stdio",
        command: "npx",
        args: ["-y", "@modelcontextprotocol/server-context7"],
        env: {}
      };
    }
  }
};
```

## Testing Plan

- Test with API key provided
- Test without API key (skipped)
- Test rate limits with and without key
- Verify both MCP configurations work
- Test library documentation lookups
- Verify CLAUDE.md instructions are clear

## Areas for Feedback

1. Should we recommend getting an API key upfront?
2. How prominently should we display rate limit information?
3. Should we support adding a key later without re-running init?
4. How should we handle rate limit exceeded scenarios?

## Related Issues

- Issue #8: https://github.com/cedric/spantree-fluent/fluent-toolkit/issues/8

## References

- Context7 Website: https://context7.dev
- Context7 Docs: https://docs.context7.dev

## Context7 Capabilities to Document

### Library Documentation
- `resolve-library-id`: Find Context7-compatible library ID
- `get-library-docs`: Fetch up-to-date documentation with examples

### Use Cases
- Official framework documentation (React, Vue, Angular, etc.)
- API reference lookup
- Code example discovery
- Best practices and patterns
- Version-specific documentation

### Rate Limits
- **Without API Key**: Limited requests per IP
- **With API Key**: Higher quota and priority access
