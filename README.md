# fluent-toolkit

> ⚠️ **Work in Progress** - This tool is under active development. Features and APIs may change.

MCP server setup toolkit for Claude Code. Simplifies the installation and configuration of Model Context Protocol servers.

## Prerequisites

- **Claude Code 1.0.0+** - [Installation Guide](https://docs.claude.com/claude-code/install)
- Node.js or Python (depending on which MCP servers you install)

The `ftk init` command will automatically check for Claude Code and guide you through installation if needed.

## Installation

### Homebrew (macOS/Linux)

```bash
brew install spantree/fluent-toolkit/fluent-toolkit
```

### Manual Installation

Download the latest binary from [releases](https://github.com/spantree/fluent-toolkit/releases) and place it in your PATH.

## Usage

Initialize MCP servers in your project:

```bash
cd your-project
ftk init
```

The interactive wizard will:
- Verify Claude Code is installed and up to date
- Let you select which MCP servers to install
- Check for required system dependencies
- Prompt for API keys and secrets
- Generate `.mcp.json` configuration
- Update `CLAUDE.md` with usage instructions
- Create optional context directory for AI resources

### Command Options

```bash
ftk init [options]

Options:
  -f, --force              Force re-initialization even if already configured
  --skip-validation        Skip dependency validation checks
  --skip-checks           Skip Claude Code installation and version checks
  -s, --servers <list>     Specify servers to install (comma-separated)
  --no-prompt             Accept all defaults without prompting
```

Use `--skip-checks` to bypass the Claude Code version check (useful for CI/CD or advanced users).

## Features

### Currently Implemented

- ✅ **Claude Code version checking** - Ensures compatible version is installed
- ✅ **Interactive setup wizard** - Guided MCP server installation
- ✅ **Modular server architecture** - Easy to add new servers
- ✅ **Dependency checking** - Validates system requirements before installation
- ✅ **Secrets management** - Stores API keys in `.env.mcp.secrets` (gitignored)
- ✅ **CLAUDE.md integration** - Auto-updates project documentation
- ✅ **Context directory** - Optional folder for AI assistant resources

### Available MCP Servers

**Core Servers:**
- **Sequential Thinking** - Enhanced reasoning for complex problems
- **Context7** - Up-to-date library documentation and code examples
- **Basic Memory** - Persistent memory and note-taking across sessions

**Optional Servers:**
- **Exa** - Web search and research (requires API key)

More servers coming soon!

## Development

Built with [Deno](https://deno.land).

```bash
# Run locally
deno task dev init

# Type check
deno check src/main.ts

# Format and lint
deno fmt
deno lint
```

See [CLAUDE.md](CLAUDE.md) for development standards and commit conventions.

## Documentation

- [Installation Guide](docs/installation.md) - Detailed installation instructions
- [Quick Start](docs/quickstart.md) - Release workflow for maintainers
- [Development Guide](docs/development.md) - Contributing guidelines

## Project Status

**Early Development** - Core functionality working, but many features planned:

- ⏳ Additional MCP server integrations
- ⏳ User-level vs project-level configuration
- ⏳ Server validation and health checks
- ⏳ Configuration migration tools

## License

MIT

## Links

- [Claude Code Documentation](https://docs.claude.com/claude-code)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [MCP Servers Registry](https://github.com/modelcontextprotocol/servers)

---

From the [Fluent Workshop](https://fluentwork.shop) - AI fluency for engineering teams.
