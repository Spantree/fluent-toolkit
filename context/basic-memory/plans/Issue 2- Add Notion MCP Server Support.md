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

## 📌 BACKLOG — Phase 1: Registry Entry

- [ ] Create `registry/mcp-servers/notion/` directory
- [ ] Implement `index.ts` extending `BaseMCPServer`
- [ ] Add precheck for Node.js/npm availability
- [ ] Define metadata (name, description, category, version)

## 📌 BACKLOG — Phase 2: Authentication Setup

- [ ] Implement `getSecrets()` for Notion integration token
- [ ] Add interactive prompts for credentials using lifecycle context
- [ ] Store credentials in `.env.mcp.secrets`
- [ ] Implement `generateMcpConfig()` for npx-based server

## 📌 BACKLOG — Phase 3: Documentation

- [ ] Create `claude.md` fragment with usage examples
- [ ] Document Notion API capabilities
- [ ] Add "When to Use" and "When NOT to Use" sections
- [ ] Include links to Notion developer docs
- [ ] Add examples of database queries and page creation

## 📌 BACKLOG — Phase 4: Testing & Integration

- [ ] Test with valid Notion integration token
- [ ] Test installation via npx
- [ ] Verify CLAUDE.md integration
- [ ] Test server discovery in registry
- [ ] Manual testing with Claude Code

## Implementation Summary

Following modular server architecture pattern established by existing servers (Exa, Context7).

**Technical Approach**:

- Extend `BaseMCPServer` class
- Use npx to run `@modelcontextprotocol/server-notion`
- Store `NOTION_API_TOKEN` in secrets
- Node.js dependency check via precheck lifecycle

**Configuration**:

```typescript
{
  command: "npx",
  args: ["-y", "@modelcontextprotocol/server-notion"],
  env: { NOTION_API_TOKEN: fromSecrets }
}
```

## observations

- [architecture] Follows modular server pattern #mcp-registry #established-pattern
- [design-decision] Using npx for server execution #no-global-install
- [integration] Node.js required as system dependency #precheck-validation
- [use-case] Optional server for Notion workspace integration #productivity
