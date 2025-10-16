# Context Directory Feature

## Overview

The context directory is a configurable folder that stores resources and data for AI assistants and MCP servers. By default it's called `context/`, but users can choose a custom name during `ftk init`.

## Purpose

MCP servers like `basic-memory`, search indexes, and other AI-related resources need a place to store their data. The context directory provides:

- **Centralized location** for all AI assistant resources
- **Per-server organization** with subdirectories for each MCP server
- **Git control** - contents are gitignored by default, but servers can opt-in to expose their data
- **User choice** - configurable folder name

## Structure

```
project/
├── context/                    # Default name (user-configurable)
│   ├── .gitkeep               # Ensures directory is tracked
│   ├── sequentialthinking/    # Auto-created for each server
│   ├── context7/
│   ├── exa/
│   └── basicmemory/           # Example: basic-memory MCP server data
│       └── notes/             # This folder could be exposed to git
```

## Configuration

### In .ftk/config.json

```json
{
  "version": "1.0.0",
  "contextDir": "context",  // Configurable during ftk init
  "servers": { ... }
}
```

### During ftk init

Users are prompted:

```
📁 AI assistants need a folder for context and resources
This folder will store data for MCP servers like basic-memory, indexes, etc.

Use default folder name "context"? (Y/n)
```

If they choose "n", they can specify a custom name.

## Git Behavior

### Default .gitignore Pattern

```gitignore
# context directory (AI assistant context)
context/*
!context/.gitkeep
```

This ignores all contents but keeps the directory in git via `.gitkeep`.

### Exposing Server Data to Git

Servers can opt-in to expose their context folder by setting `exposeContextToGit: true`:

```typescript
export class BasicMemoryServer extends BaseMCPServer {
  override metadata: ServerMetadata = {
    id: "basicmemory",
    name: "Basic Memory",
    description: "Persistent memory for Claude Code",
    category: "core",

    // Git settings
    contextFolder: "basic-memory", // Custom folder name (optional)
    exposeContextToGit: true, // Expose this folder to git
  };
}
```

This generates:

```gitignore
# context directory (AI assistant context)
context/*
!context/.gitkeep
!context/basic-memory/  # Allowlisted for git tracking
```

## Server Implementation

### Basic Usage (Gitignored by Default)

```typescript
export class ExaServer extends BaseMCPServer {
  override metadata: ServerMetadata = {
    id: "exa",
    name: "Exa Research",
    description: "Web search and research",
    category: "optional",
    // No contextFolder or exposeContextToGit specified
    // Context folder: context/exa/
    // Git behavior: Gitignored
  };
}
```

### Custom Folder Name

```typescript
export class SequentialThinkingServer extends BaseMCPServer {
  override metadata: ServerMetadata = {
    id: "sequentialthinking",
    name: "Sequential Thinking",
    description: "Multi-step reasoning",
    category: "core",
    contextFolder: "sequential-thinking", // Use dashes in folder name
    // Git behavior: Gitignored
  };
}
```

### Exposed to Git

```typescript
export class BasicMemoryServer extends BaseMCPServer {
  override metadata: ServerMetadata = {
    id: "basicmemory",
    name: "Basic Memory",
    description: "Persistent memory",
    category: "core",
    contextFolder: "basic-memory",
    exposeContextToGit: true, // Track in git
  };
}
```

## API

### ContextDirManager

```typescript
// Get context directory name
const dirName = await ContextDirManager.getContextDirName();
// Returns: "context" (or custom name)

// Get full path
const path = await ContextDirManager.getContextDirPath();
// Returns: "/path/to/project/context"

// Create server subdirectory
const serverPath = await ContextDirManager.createServerContextDir("exa");
// Returns: "/path/to/project/context/exa"

// Update .gitignore
await ContextDirManager.updateGitignore("context", ["basic-memory"]);
// Adds context/* and allowlists context/basic-memory/
```

## Use Cases

### MCP Server Examples

1. **basic-memory** - Store notes and memories (exposed to git for sharing)
2. **exa** - Cache search results (gitignored, ephemeral data)
3. **sequential-thinking** - Store thinking logs (gitignored)
4. **custom indexes** - Serena index, vector stores (user choice via config)

### Custom Resources

Projects can also use the context directory for:

- Custom prompts for Claude Code
- Project-specific AI instructions
- Shared knowledge bases
- Documentation indexes

## Migration

If a project already has a context-like folder, users can:

1. Specify the existing folder name during `ftk init`
2. Or rename their folder to match the chosen name
3. Or keep both and manually merge

## Future Enhancements

- [ ] Allow per-server git exposure configuration in .ftk/config.json
- [ ] Support for multiple context directories (e.g., context/ + .context/)
- [ ] Auto-migration from legacy folder structures
- [ ] Context directory templates for common use cases
