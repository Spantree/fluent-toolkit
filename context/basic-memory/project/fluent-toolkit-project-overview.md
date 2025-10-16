---
title: fluent-toolkit-project-overview
type: note
permalink: project/fluent-toolkit-project-overview
tags:
  - project-overview
  - mcp
  - deno
  - cli
  - homebrew
  - architecture
---

# Fluent Toolkit Project Overview

## Description

MCP server setup toolkit for Claude Code - a Deno-based CLI tool that provides an interactive wizard for selecting, configuring, and installing Model Context Protocol servers.

## Purpose

Helps developers quickly configure and install MCP servers with:

- Interactive wizard for server selection and configuration
- Secure secret management via `.env.mcp.secrets`
- Automatic `.mcp.json` generation for Claude Code
- Dynamic `CLAUDE.md` updates with server-specific usage instructions
- Optional context directories for AI assistant resources

## Architecture

### Modular Server Registry

Self-contained server modules in `registry/mcp-servers/`:

```
registry/mcp-servers/sequentialthinking/
├── index.ts      # Server implementation with lifecycle methods
└── claude.md     # CLAUDE.md fragment for this server
```

### Lifecycle Methods

Servers implement standardized methods:

- `precheck(ctx)` - Verify dependencies before installation
- `configure(ctx)` - Collect secrets and configuration
- `install(ctx)` - Generate MCP config entries
- `validate(ctx)` - Optional post-install validation

### Key Components

- **CLI Entry**: `src/main.ts` - Main CLI entry point using Cliffy
- **Init Command**: `src/commands/init.ts` - Interactive setup wizard
- **Registry Discovery**: `registry/index.ts` - Server module loading
- **Distribution**: `Formula/fluent-toolkit.rb` - Homebrew formula
- **Release Automation**: `scripts/release.sh` - Release workflow

## Distribution Strategy

Uses Homebrew for distribution:

- Formula lives in repository (no separate tap needed)
- Binaries compiled via `deno task compile:all`
- Supports macOS (ARM64/x64), Linux (x64/ARM64), Windows (x64)
- Users install with: `brew install Formula/fluent-toolkit.rb`

## Development Workflow

### Feature Branch Pattern

All features MUST be developed in dedicated feature branches:

**Pattern**: `feat/{issue-number}-{short-description}`

**Examples**:

- `feat/001-add-claude-code-installation-and-version-checks`
- `feat/006-pin-mcp-server-versions`

**Workflow**:

1. Create branch from `main`: `git checkout -b feat/XXX-description`
2. Make changes and commit following commit message convention
3. Push branch: `git push -u origin feat/XXX-description`
4. Open PR with detailed description and feedback areas
5. Address review feedback
6. Merge via squash commit to maintain clean history

### Commit Convention (STRICTLY ENFORCED)

Conventional Commits with 50/72 rule:

```
type(scope): subject line max 50 chars

Optional body wrapped at 72 characters. Explain what and why,
not how. Use imperative mood ("add" not "added").

Optional footer for breaking changes or issue references.
```

**Types**: feat, fix, docs, style, refactor, test, chore, perf, ci

**Scopes**: init, registry, config, secrets, ui, cli, formula, release

## Technology Stack

- **Runtime**: Deno with TypeScript strict mode
- **CLI Framework**: Cliffy for interactive prompts
- **Distribution**: Homebrew formula
- **MCP Integration**: Model Context Protocol servers
- **Version Control**: Git with conventional commits

## Code Style

- TypeScript strict mode enabled
- No unused variables (prefix with `_` if intentional)
- Always use `error instanceof Error` checks
- Read tool before Write/Edit operations

## Project Status

- Current branch: `feat/006-pin-mcp-server-versions`
- Main branch for PRs: `main`
- Git status: clean working tree

## observations

- [architecture] Modular server registry enables extensibility #scalability
- [design-decision] Homebrew chosen for cross-platform CLI distribution #distribution
- [integration] MCP servers use lifecycle methods for standardized setup #mcp
- [fact] TypeScript strict mode enforced across entire codebase #code-quality

## relations

- relates-to: [[mcp-server-registry-architecture]]
- relates-to: [[homebrew-distribution-strategy]]
- uses-technology: [deno, typescript, cliffy, homebrew]
- depends-on: [[model-context-protocol]]
