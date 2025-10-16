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

- `ftk init` - Interactive MCP server setup
- `ftk --version` - Show version
- `ftk --help` - Show help

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

1. **Local testing**: `deno task dev init`
2. **Type checking**: `deno check src/main.ts`
3. **Formatting**: `deno fmt`
4. **Linting**: `deno lint`
5. **Compile**: `deno task compile` or `deno task compile:all`
6. **Check CI status**: `gh run list` or `gh run view`

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
