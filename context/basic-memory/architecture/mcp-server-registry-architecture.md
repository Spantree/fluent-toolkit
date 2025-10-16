---
title: mcp-server-registry-architecture
type: note
permalink: architecture/mcp-server-registry-architecture
tags:
  - architecture
  - registry
  - mcp
  - modularity
  - lifecycle
---

# MCP Server Registry Architecture

## Overview

The fluent-toolkit uses a modular architecture for managing MCP server configurations. Each server is a self-contained module with its own implementation and documentation.

## Directory Structure

```
registry/
├── index.ts                          # Registry discovery and loading
└── mcp-servers/
    ├── basic-memory/
    │   ├── index.ts                  # Server implementation
    │   └── claude.md                 # Usage documentation
    ├── context7/
    │   ├── index.ts
    │   └── claude.md
    ├── exa/
    │   ├── index.ts
    │   └── claude.md
    └── sequentialthinking/
        ├── index.ts
        └── claude.md
```

## Server Module Interface

Each server module exports a configuration object implementing the `McpServerConfig` interface:

```typescript
interface McpServerConfig {
  id: string; // Unique identifier
  name: string; // Display name
  description: string; // Short description
  homepage?: string; // Documentation URL
  exposeContextToGit?: boolean; // Whether to expose context dir

  // Lifecycle methods
  precheck?(ctx: LifecycleContext): Promise<PrecheckResult>;
  configure?(ctx: LifecycleContext): Promise<ConfigureResult>;
  install(ctx: LifecycleContext): Promise<InstallResult>;
  validate?(ctx: LifecycleContext): Promise<ValidateResult>;
}
```

## Lifecycle Methods

### 1. precheck() - Dependency Verification

Validates that prerequisites are met before installation:

```typescript
precheck: (async (ctx) => {
  // Check for required tools
  const hasUvx = await commandExists("uvx");

  return {
    ok: hasUvx,
    message: hasUvx ? "uvx is available" : "uvx not found. Install uv first.",
  };
});
```

**Returns**: `{ ok: boolean, message: string }`

### 2. configure() - Interactive Configuration

Collects secrets and configuration from user:

```typescript
configure: (async (ctx) => {
  const apiKey = await Secret.prompt("Enter API key:");

  return {
    secrets: { API_KEY: apiKey },
    config: { model: "default" },
  };
});
```

**Returns**: `{ secrets?: Record<string, string>, config?: Record<string, any> }`

### 3. install() - MCP Config Generation

Generates the MCP server configuration:

```typescript
install: (async (ctx) => {
  return {
    type: "stdio",
    command: "uvx",
    args: ["basic-memory", "--project=fluent-toolkit", "mcp"],
    env: {},
  };
});
```

**Returns**: MCP server configuration object

### 4. validate() - Post-Install Verification (Optional)

Verifies installation was successful:

```typescript
validate: (async (ctx) => {
  // Test server connection
  const working = await testConnection();

  return {
    ok: working,
    message: working ? "Server validated" : "Connection failed",
  };
});
```

**Returns**: `{ ok: boolean, message: string }`

## Context Object

All lifecycle methods receive a `LifecycleContext` object:

```typescript
interface LifecycleContext {
  projectRoot: string; // Project root directory
  contextDir?: string; // Optional context directory
  existingSecrets: Record<string, string>; // Current secrets
}
```

## Registry Discovery

The `registry/index.ts` file dynamically loads all server modules:

```typescript
export async function loadServers(): Promise<McpServerConfig[]> {
  const servers: McpServerConfig[] = [];
  const registryDir = join(import.meta.dirname, "mcp-servers");

  for await (const entry of Deno.readDir(registryDir)) {
    if (entry.isDirectory) {
      const indexPath = join(registryDir, entry.name, "index.ts");
      const module = await import(indexPath);
      servers.push(module.default);
    }
  }

  return servers;
}
```

## CLAUDE.md Integration

Each server's `claude.md` file is automatically appended to the project's `CLAUDE.md` during installation. This provides Claude Code with server-specific usage instructions.

Example structure:

```markdown
### Server Name

**Purpose**: Brief description

**Key Features**:

- Feature 1
- Feature 2

**Usage Patterns**:

- When to use this server
- Example workflows
```

## Configuration Storage

### .mcp.json

Generated MCP configuration file:

```json
{
  "mcpServers": {
    "server-id": {
      "type": "stdio",
      "command": "command",
      "args": ["arg1", "arg2"],
      "env": {}
    }
  }
}
```

### .env.mcp.secrets

Encrypted secrets storage (gitignored):

```
SERVER_API_KEY=secret_value
ANOTHER_SECRET=another_value
```

## Extension Points

To add a new MCP server:

1. Create directory in `registry/mcp-servers/`
2. Add `index.ts` with server configuration
3. Add `claude.md` with usage documentation
4. Implement required lifecycle methods
5. Server is automatically discovered by registry

## observations

- [architecture] Modular design allows easy server addition #extensibility
- [design-decision] Lifecycle methods provide standardized setup flow #patterns
- [integration] Dynamic discovery eliminates manual registry maintenance #automation
- [fact] Each server is fully self-contained in its directory #modularity

## relations

- relates-to: [[fluent-toolkit-project-overview]]
- relates-to: [[lifecycle-methods-pattern]]
- depends-on: [[model-context-protocol]]
- uses-technology: [typescript, deno]
