---
title: 'Issue 2: Add Notion MCP Server Support'
type: note
permalink: plans/issue-2-add-notion-mcp-server-support
tags:
- mcp-registry,notion,authentication,optional-server
---

# Issue 2: Add Notion MCP Server Support

## Overview

Add Notion MCP server to the registry with authentication setup and comprehensive usage documentation.

## ✅ COMPLETED — Phase 1: Registry Entry

- [x] Create `registry/mcp-servers/notion/` directory
- [x] Implement `index.ts` extending `BaseMCPServer`
- [x] Add precheck for Node.js/npm availability
- [x] Define metadata (name, description, category, version)

## ✅ COMPLETED — Phase 2: Authentication Setup

- [x] Implement `getSecrets()` for Notion integration token
- [x] Add interactive prompts for credentials using lifecycle context
- [x] Store credentials in `.env.mcp.secrets`
- [x] Implement `generateMcpConfig()` for npx-based server

## ✅ COMPLETED — Phase 3: Documentation

- [x] Create `claude.md` fragment with usage examples
- [x] Document Notion API capabilities
- [x] Add "When to Use" and "When NOT to Use" sections
- [x] Include links to Notion developer docs
- [x] Add examples of database queries and page creation

## 📌 BACKLOG — Phase 4: Testing & Integration

- [ ] Test with valid Notion integration token
- [ ] Test installation via npx
- [ ] Verify CLAUDE.md integration
- [ ] Test server discovery in registry
- [ ] Manual testing with Claude Code

## Implementation Summary

Following modular server architecture pattern established by existing servers (Exa, Context7).

**Core Module** (`registry/mcp-servers/notion/index.ts`):

- Extends `BaseMCPServer` class
- Implements Node.js v18.0.0+ dependency checking
- Uses npx to run `@modelcontextprotocol/server-notion`
- Stores `NOTION_API_TOKEN` in secrets via lifecycle context
- Generates MCP config with environment variables

**Documentation** (`registry/mcp-servers/notion/claude.md`):

- Comprehensive usage examples
- Database operations, page management, content creation
- "When to Use" and "When NOT to Use" sections
- Setup requirements and troubleshooting
- Links to Notion API documentation

**Registry Integration**:

- Added to `registry/index.ts` for discovery
- Categorized as "optional" server
- Full lifecycle support (precheck, configure, install, validate)

**Configuration**:

```typescript
{
  command: "npx",
  args: ["-y", "@modelcontextprotocol/server-notion"],
  env: { NOTION_API_TOKEN: "${NOTION_API_TOKEN}" }
}
```

## observations

- [architecture] Follows modular server pattern #mcp-registry #established-pattern
- [design-decision] Using npx for server execution #no-global-install
- [integration] Node.js required as system dependency #precheck-validation
- [use-case] Optional server for Notion workspace integration #productivity
- [fact] Notion integration tokens start with 'secret_' prefix #authentication
- [limitation] Requires explicit page/database sharing with integration #permissions

## relations

- issue-permalink: https://github.com/Spantree/fluent-toolkit/issues/2
- pr-permalink: https://github.com/Spantree/fluent-toolkit/pull/11
- relates-to: [[mcp-registry]], [[authentication]]
- uses-technology: [deno, typescript, notion-api, npx, basic-memory]
- implemented-in: [registry/mcp-servers/notion/index.ts, registry/mcp-servers/notion/claude.md, registry/index.ts]
