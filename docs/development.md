# Development Guide

## Phase 1 Implementation Status

✅ **COMPLETE** - All Phase 1 features have been implemented!

### Implemented Features

- [x] Server registry with core servers (sequential-thinking, context7, exa, firecrawl, playwright)
- [x] Basic dependency checking (node, python, uv, docker)
- [x] `ftk init` command with interactive wizard
- [x] Secrets management (.env.mcp.secrets with gitignore integration)
- [x] .mcp.json generation with dotenv-cli wrapper support
- [x] CLAUDE.md augmentation with marker-based inline content

### Project Structure

```
fluent-toolkit/
├── src/
│   ├── main.ts                 # CLI entry point
│   ├── commands/               # Command handlers
│   │   └── init.ts             # ftk init implementation
│   ├── core/                   # Core modules
│   │   ├── registry.ts         # MCP server registry
│   │   ├── config.ts           # Config read/write
│   │   ├── dependencies.ts     # Dependency checking
│   │   ├── secrets.ts          # .env.mcp.secrets management
│   │   └── claude-md.ts        # CLAUDE.md augmentation
│   ├── services/               # Service layer
│   │   └── template-renderer.ts # Template rendering
│   ├── ui/                     # User interface
│   │   └── prompts.ts          # Interactive prompts
│   └── types/                  # TypeScript definitions
│       └── index.ts            # Type definitions
├── registry/
│   └── servers.json            # MCP server definitions
├── templates/
│   ├── env.template            # .env.mcp.secrets template
│   └── claude-md/              # CLAUDE.md section templates
│       └── mcp-overview.md
├── deno.json                   # Deno configuration
├── README.md                   # Marketing documentation
├── DESIGN.md                   # Design decisions
├── RESEARCH_FINDINGS.md        # Research notes
└── DEVELOPMENT.md              # This file
```

## Development Commands

### Run in development mode

```bash
deno task dev
```

### Run ftk init

```bash
deno task dev init
```

### Run with options

```bash
deno task dev init --help
deno task dev init --force
deno task dev init --skip-validation
deno task dev init --servers sequential-thinking,context7
```

### Compile binary

```bash
deno task compile
```

This creates `bin/ftk` executable.

### Format code

```bash
deno task fmt
```

### Lint code

```bash
deno task lint
```

## Testing the Implementation

### Test with a fresh project

1. Create a new test directory:

```bash
mkdir ~/test-ftk-project
cd ~/test-ftk-project
```

2. Run ftk init:

```bash
cd ~/src/spantree-fluent/fluent-toolkit
deno task dev init
```

3. Follow the interactive prompts to select servers and provide API keys

4. Verify the generated files:

```bash
ls -la ~/test-ftk-project
cat ~/test-ftk-project/.mcp.json
cat ~/test-ftk-project/CLAUDE.md
cat ~/test-ftk-project/.env.mcp.secrets
cat ~/test-ftk-project/.ftk/config.json
```

5. Start Claude Code and verify MCP servers load:

```bash
cd ~/test-ftk-project
claude
```

## Implementation Details

### Server Registry

The server registry (`registry/servers.json`) contains metadata for all available MCP servers:

- **sequential-thinking**: Enhanced reasoning (core)
- **context7**: Library documentation (core)
- **exa**: Web research (optional, requires API key)
- **firecrawl**: Web scraping (optional, requires API key)
- **playwright**: Browser automation (optional)

### Configuration Strategy

**Dual-layer configuration**:

- User-level: `~/.ftk/config.json` (global preferences)
- Project-level: `.ftk/config.json` (project-specific)

**MCP configuration**:

- `.mcp.json` in project root
- Uses dotenv-cli wrapper for servers requiring secrets

### Secrets Management

- Secrets stored in `.env.mcp.secrets` (gitignored automatically)
- dotenv-cli injects secrets at MCP server runtime
- Prevents credential exposure in version control

### CLAUDE.md Strategy

Uses marker-based inline content approach (validated in test project):

```markdown
<!-- ftk:begin:mcp-overview -->

## MCP Servers Configuration

...

<!-- ftk:end:mcp-overview -->
```

This allows ftk to manage specific sections without clobbering user content.

## Next Steps

### Phase 2 (Enhancement)

- [ ] `ftk doctor` command for diagnostics
- [ ] Advanced validation with custom validators
- [ ] Installation assistance (auto-run install commands)
- [ ] Better error messages
- [ ] Progress indicators for long operations

### Phase 3 (Extensibility)

- [ ] `ftk update-registry` command (git sparse checkout)
- [ ] Registry version compatibility checking
- [ ] Custom server definitions (local registry)

### Phase 4 (Plugin Generation)

- [ ] `ftk plugin create` command
- [ ] Bundle MCP servers + slash commands + hooks
- [ ] `ftk plugin publish` for marketplace

### Phase 5 (Agent SDK Integration)

- [ ] `ftk agent create` command
- [ ] Agent loop templates
- [ ] Deep Researcher agent
- [ ] Writing Coach agent

## Contributing

When adding new features:

1. Update type definitions in `src/types/index.ts`
2. Implement core functionality in appropriate module
3. Add CLI command in `src/commands/`
4. Update registry if adding new servers
5. Test manually before committing
6. Update this document with new features

## Architecture Decisions

See [DESIGN.md](./DESIGN.md) for detailed architecture decisions and rationale.

## Research Background

See [RESEARCH_FINDINGS.md](./RESEARCH_FINDINGS.md) for research on Claude Code plugins, Agent SDK, and CLAUDE.md behavior.
