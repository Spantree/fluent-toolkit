# Feature #007: Exa MCP Server Authentication Setup

## Overview

Add authentication setup for Exa MCP server to enable AI-powered semantic search and deep research capabilities.

## Implementation Plan

### Phase 1: Registry Updates
- [ ] Update `registry/mcp-servers/exa/index.ts`
- [ ] Add `configure()` lifecycle method
- [ ] Implement API key prompt and validation

### Phase 2: Authentication Flow
- [ ] Add interactive prompt for Exa API key
- [ ] Validate key format (starts with `exa_`)
- [ ] Store key in `.env.mcp.secrets` as `EXA_API_KEY`
- [ ] Update MCP config to use environment variable

### Phase 3: Documentation
- [ ] Update `registry/mcp-servers/exa/claude.md`
- [ ] Add authentication setup instructions
- [ ] Document Exa capabilities and use cases
- [ ] Add troubleshooting guide for auth issues

### Phase 4: CLAUDE.md Integration
- [ ] Ensure CLAUDE.md gets updated during init
- [ ] Include Exa usage examples
- [ ] Document when to use Exa vs other research tools

## Technical Approach

```typescript
export const exaServer: MCPServer = {
  name: "exa",
  displayName: "Exa Research",
  description: "AI-powered semantic search and deep research",

  async configure(ctx: SetupContext): Promise<void> {
    const apiKey = await ctx.prompt({
      type: "input",
      name: "EXA_API_KEY",
      message: "Enter your Exa API key (get one at https://exa.ai):",
      validate: (value: string) => {
        if (!value.startsWith("exa_")) {
          return "Exa API keys should start with 'exa_'";
        }
        return true;
      }
    });

    await ctx.saveSecret("EXA_API_KEY", apiKey);
  },

  install(ctx: SetupContext): MCPConfig {
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
        "@modelcontextprotocol/server-exa"
      ],
      env: {}
    };
  }
};
```

## Testing Plan

- Test with valid Exa API key
- Test with invalid key format
- Test with missing API key
- Verify deep research capabilities work
- Test web search and crawling features
- Verify CLAUDE.md instructions are clear

## Areas for Feedback

1. Should we test the API key during setup (requires network call)?
2. How should we handle API rate limits or quota exceeded?
3. Should we document cost implications of deep research?
4. What example queries should we include in documentation?

## Related Issues

- Issue #7: https://github.com/cedric/spantree-fluent/fluent-toolkit/issues/7

## References

- Exa Website: https://exa.ai
- Exa API Docs: https://docs.exa.ai
- MCP Exa Server: https://github.com/modelcontextprotocol/servers/tree/main/src/exa

## Exa Capabilities to Document

### Deep Research
- AI-powered comprehensive research with sources
- Models: `exa-research` (fast) and `exa-research-pro` (comprehensive)
- Poll-based workflow with `deep_researcher_start` and `deep_researcher_check`

### Semantic Search
- `web_search_exa`: Intent-aware web search
- `company_research_exa`: Business intelligence
- `linkedin_search_exa`: Professional profiles
- `get_code_context_exa`: Technical documentation and code examples

### Content Extraction
- `crawling_exa`: URL-based content extraction with semantic processing
