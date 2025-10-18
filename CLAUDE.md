# fluent-toolkit

MCP server setup toolkit for Claude Code. Helps developers quickly configure and install Model Context Protocol servers.

## Project Overview

This is a Deno-based CLI tool that:

- Provides an interactive wizard for selecting and configuring MCP servers
- Manages secrets securely via `.env.mcp.secrets`
- Generates `.mcp.json` configuration for Claude Code
- Updates `CLAUDE.md` with server-specific usage instructions
- Creates optional context directories for AI assistant resources

## Development Standards

### Commit Message Convention (STRICTLY ENFORCED)

All commits MUST follow Conventional Commits with 50/72 rule:

**Format:**

```
type(scope): subject line max 50 chars

Optional body wrapped at 72 characters. Explain what and why,
not how. Use imperative mood ("add" not "added").

Optional footer for breaking changes or issue references.
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, missing semicolons, etc.)
- `refactor`: Code refactoring without changing behavior
- `test`: Adding or updating tests
- `chore`: Maintenance tasks, dependencies, tooling
- `perf`: Performance improvements
- `ci`: CI/CD changes

**Scopes:**

- `init`: Init command
- `registry`: Server registry
- `config`: Configuration management
- `secrets`: Secrets management
- `ui`: User interface/prompts
- `cli`: CLI framework
- `formula`: Homebrew formula
- `release`: Release automation

**Examples:**

```
feat(registry): add modular server architecture

Refactored from JSON-based registry to TypeScript modules.
Each server now has its own directory with index.ts and
claude.md files. Supports lifecycle methods for interactive
configuration.

BREAKING CHANGE: servers.json no longer used
```

```
docs: reorganize documentation into docs/ folder

Moved all markdown files to docs/ directory for cleaner
project structure. Updated internal links and created
documentation index.
```

```
chore(deps): update Deno dependencies to latest
```

### Code Style

- **TypeScript strict mode**: All code must pass strict type checking
- **No unused variables**: Prefix with `_` if intentionally unused
- **Error handling**: Always use `error instanceof Error` checks
- **File operations**: Use Read tool before Write/Edit operations

### Documentation

- Keep root directory clean - all docs in `docs/`
- Update `docs/README.md` when adding new documentation
- Use relative links within docs/ directory
- Archive historical documents in `docs/archive/`

### Basic Memory Notes

All project documentation should be stored as Basic Memory notes, not regular markdown files:

**Folder Structure**:

- `features/` - Feature documentation (not prefixed with issue numbers, may span multiple issues)
- `plans/` - Issue-specific task management with status tracking (prefixed with `issue-N-`)
- `guides/` - How-to documentation and usage instructions
- `technologies/` - Technical documentation and architecture
- `research/` - Cached research results
- `meetings/` - Meeting notes

**Best Practices**:

- Use `related-to: [[issue-N-description]]` to link features to implementing issues
- Format all notes with Prettier after creation
- Include observations and relations sections
- Use kebab-case for note titles

## Architecture

### Modular Server Registry

Each MCP server is a self-contained module in `registry/mcp-servers/`:

```
registry/mcp-servers/sequentialthinking/
├── index.ts      # Server implementation with lifecycle methods
└── claude.md     # CLAUDE.md fragment for this server
```

### Lifecycle Methods

Servers implement:

- `precheck(ctx)` - Verify dependencies
- `configure(ctx)` - Collect secrets/config
- `install(ctx)` - Generate MCP config
- `validate(ctx)` - Optional post-install validation

### Context Directory (Optional)

The context directory feature allows MCP servers to store data:

- Default name: `context/` (user-configurable)
- Gitignored by default
- Servers can opt-in to git exposure via `exposeContextToGit: true`
- See `docs/context-directory.md` for details

### Basic Memory Conventions

When using Basic Memory MCP for project notes and plans:

**File Naming**:
- Use kebab-case for filenames (e.g., `claude-code-checks.md`, `mcp-authentication-setup.md`)
- Titles in frontmatter should use Title Case (e.g., `title: "Issue 1: Add Claude Code Installation and Version Checks"`)

**Frontmatter Requirements**:
```yaml
---
title: "Issue Title in Title Case"
kind: Plan  # or Note, Guide, etc.
created_at: 2025-10-16T15:00:00.000Z
status: active  # draft, active, complete
issue_permalink: https://github.com/org/repo/issues/1
pr_permalink: https://github.com/org/repo/pull/10
tags:
  - kebab-case-tag
  - another-tag
---
```

**Plan Structure**:
- Use status emojis: 📌 BACKLOG, ⏳ IN PROGRESS, ✅ COMPLETED
- Include observations and relations sections
- Reference source files and implementations
- Update status as work progresses

## Distribution

This project uses Homebrew for distribution:

- Formula lives in `Formula/fluent-toolkit.rb`
- No separate homebrew-tap repository needed
- Binaries compiled via `deno task compile:all`
- See `docs/quickstart.md` for release workflow

## Key Files

- `src/main.ts` - CLI entry point
- `src/commands/init.ts` - Main initialization command
- `registry/index.ts` - Server registry discovery
- `Formula/fluent-toolkit.rb` - Homebrew formula
- `scripts/release.sh` - Release automation

## Available Commands

- `ftk init` - Interactive MCP server setup with automatic Claude Code installation/upgrade
- `ftk --version` - Show version
- `ftk --help` - Show help

### Claude Code Installation Checking

The `ftk init` command includes comprehensive Claude Code installation checking:

**Scenarios Handled:**

1. **Not Installed**: Offers automatic installation with command preview
   - Uses official npm method: `npm install -g @anthropic-ai/claude-code`
   - Alternative methods available (brew, winget)
   - Requires user confirmation before executing
   - Re-validates installation after completion

2. **Outdated Version**: Offers automatic upgrade with command preview
   - Auto-detects installation method (npm, brew, etc.)
   - Shows appropriate upgrade command
   - Displays changelog with changes between versions
   - Requires user confirmation before executing
   - Allows continuing with old version or cancelling

3. **Upgrade Available**: Optionally offers upgrade to latest version
   - Checks package manager for newer versions
   - Shows available version and changelog
   - Displays what's new between current and latest
   - Non-blocking - setup continues regardless

**Installation Method Detection:**
- Automatically detects if Claude Code was installed via npm or brew
- Uses npm commands for npm installations
- Uses brew commands for Homebrew installations
- Defaults to npm (official method) for new installations

**Flags:**
- `--skip-checks` - Skip Claude Code version checking entirely
- `--no-prompt` - Show instructions but don't offer automatic install/upgrade

## Development Workflow

### Feature Branch Pattern

All features MUST be developed in dedicated feature branches following this naming convention:

**Pattern**: `feat/{issue-number}-{short-description}`

**Examples**:

- `feat/001-add-claude-code-installation-and-version-checks`
- `feat/002-add-notion-mcp-server-support`
- `feat/006-pin-mcp-server-versions`

**Workflow**:

1. Create branch from `main`: `git checkout -b feat/XXX-description`
2. Make changes and commit following commit message convention
3. Push branch: `git push -u origin feat/XXX-description`
4. Open PR with detailed description and feedback areas
5. Address review feedback
6. Merge via squash commit to maintain clean history

### Local Development

**Using Justfile (Recommended):**
```bash
just dev init              # Run ftk in development mode
just check                 # Type check
just validate              # Type check + lint + format check
just quick-test            # Validate + compile + unit tests
just vm-setup              # Setup Tart VM for integration testing
```

**Using Deno directly:**
1. **Local testing**: `deno task dev init`
2. **Type checking**: `deno check src/main.ts`
3. **Formatting**: `deno fmt`
4. **Linting**: `deno lint`
5. **Compile**: `deno task compile` or `deno task compile:all`
6. **Check CI status**: `gh run list` or `gh run view`

**See [docs/justfile.md](docs/justfile.md) for complete command reference.**

## Release Workflow

1. Run `./scripts/release.sh <version>`
2. Create GitHub release and upload binaries
3. Update `Formula/fluent-toolkit.rb` with checksums
4. Commit and push formula changes

See `docs/quickstart.md` for detailed instructions.

## Resources

- **Documentation**: See `docs/README.md` for complete documentation index
- **Installation**: `docs/installation.md`
- **Distribution**: `docs/quickstart.md`
- **Contributing**: `docs/development.md`
