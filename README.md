# Fluent Toolkit (`ftk`)

**An opinionated toolkit for supercharging your agentic coding workflow**

Fluent Toolkit streamlines the setup and configuration of Claude Code and its ecosystem of MCP (Model Context Protocol) servers, transforming the initial setup from a manual, error-prone process into a guided, intelligent experience.

## From the Fluent Workshop

Fluent Toolkit is a companion tool developed for **[Fluent](https://fluentwork.shop)**, an AI fluency workshop that helps teams master agentic coding workflows. While this tool stands on its own, it embodies the practices and patterns taught in the workshop, providing a hands-on implementation of AI-augmented development best practices.

Whether you're a workshop participant looking to apply what you've learned, or a developer discovering these tools independently, Fluent Toolkit provides the foundation for productive AI-assisted development.

## Why Fluent Toolkit?

Setting up Claude Code with MCP servers manually involves:
- Finding and configuring multiple MCP servers
- Managing API keys and secrets across different services
- Understanding which MCP servers work well together
- Learning the nuances of each tool through trial and error
- Risking credential exposure in configuration files

Fluent Toolkit eliminates these pain points by providing:
- **Intelligent Setup Wizard**: Guided configuration with smart prompts for required credentials
- **Secure Secrets Management**: Git-ignored environment files with automatic injection
- **Opinionated Best Practices**: Curated MCP server combinations that work well together
- **Enhanced Documentation**: Auto-generated project guidance in CLAUDE.md
- **Extensible Architecture**: Easy addition of new integrations and capabilities

## Core Features

### 🧙 Intelligent Setup Wizard

```bash
ftk init
```

Walk through an interactive setup process that:
- Detects your project type and suggests relevant MCP servers
- **Checks system dependencies** (e.g., won't install uvx-based servers without uv)
- Prompts for required API keys (EXA_API_KEY, Firecrawl API, etc.)
- Configures servers with sensible defaults
- Tests connectivity to ensure everything works

### ✅ Smart Dependency Checking

Fluent Toolkit validates your system environment before installing MCP servers:
- Checks for required runtimes (Node.js, Python, uv, etc.)
- Warns about missing dependencies before configuration
- Suggests installation commands for missing tools
- Prevents broken configurations from incompatible system setups

For example, it won't attempt to install a `uvx`-based server unless `uv` is already installed on your system.

### 🔐 Secrets Management

Unlike the basic `claude mcp add` command, Fluent Toolkit:
- Stores credentials in a `.env` file (automatically gitignored)
- Keeps `.mcp.json` free of sensitive information
- Uses dotenv-cli to securely inject environment variables at runtime
- Provides clear warnings when credentials are missing or invalid

### 📚 Curated MCP Server Library

#### Core Servers (Recommended for all projects)
- **Sequential Thinking**: Enhanced reasoning for complex multi-step problems
- **Basic Memory**: Persistent note-taking and knowledge management
- **Exa**: Powerful web search and research capabilities
- **Firecrawl**: Advanced web scraping and content extraction
- **Playwright**: Browser automation and E2E testing
- **Context7**: Up-to-date library documentation and code examples

#### Optional Servers (Project-specific)
- **Notion**: Integration with Notion workspaces
- **GitHub**: Repository management and code review
- **Filesystem**: Extended file operations
- **SQLite**: Database management and queries
- _(More coming soon...)_

### 📖 Opinionated Documentation

Fluent Toolkit augments your project's `CLAUDE.md` with:
- MCP server usage patterns and best practices
- Integration examples specific to your installed servers
- Common workflows and command patterns
- Tips for getting the most out of each tool

### 🤖 Future Capabilities

#### Specialized Subagents (Coming Soon)
- **Deep Researcher**: Background research using Exa with intelligent synthesis
- **Writing Coach**: Content improvement and style guidance
- **Code Reviewer**: Automated code quality analysis
- **Documentation Assistant**: Context-aware documentation generation

#### Third-Party Model Integration (Planned)
- **GPT-5**: Access to OpenAI's latest models
- **Ollama**: Local model support for privacy-sensitive projects
- **Anthropic API**: Direct Claude API integration
- **Custom Endpoints**: Bring your own model hosts

## Who Is This For?

Fluent Toolkit is designed for:

- **Developers new to Claude Code** who want a smooth onboarding experience
- **Teams standardizing** on agentic coding tools and workflows
- **Power users** who value security and best practices
- **Project leads** establishing conventions across multiple codebases

## Philosophy

### Opinionated by Design

Fluent Toolkit makes deliberate choices about:
- Which MCP servers work well together
- How to structure project documentation
- Where to store configuration and secrets
- What workflows to encourage

These opinions are based on real-world usage patterns and aim to provide the best developer experience out of the box.

### Security First

- Credentials never committed to version control
- Environment-based secret injection
- Clear separation between configuration and secrets
- Validation of API keys before use

### Progressive Enhancement

Start simple, add complexity as needed:
1. Begin with core MCP servers for immediate productivity
2. Add specialized servers as your needs grow
3. Integrate custom subagents for domain-specific workflows
4. Connect third-party models when appropriate

### Extensibility

While opinionated, Fluent Toolkit is designed to grow with you:
- Easy addition of new MCP servers
- Custom subagent integration
- Plugin architecture for community contributions
- Configuration overrides when needed

## Getting Started

### Installation

```bash
npm install -g fluent-toolkit
```

### Initialize Your Project

```bash
cd your-project
ftk init
```

Follow the interactive wizard to:
1. Select MCP servers to install
2. Provide necessary API credentials
3. Configure project-specific settings
4. Generate CLAUDE.md documentation

### Start Using Claude Code

```bash
claude
```

All configured MCP servers will be available with proper authentication automatically injected.

## Project Status

**Current Phase**: Initial Development

Fluent Toolkit is under active development. The roadmap includes:

- ✅ Core vision and architecture defined
- 🔄 Initial implementation (in progress)
- ⏳ Core MCP server integrations
- ⏳ Secrets management system
- ⏳ Setup wizard
- ⏳ CLAUDE.md augmentation
- ⏳ Subagent framework
- ⏳ Third-party model integration

## Contributing

This project is currently in early development. Contribution guidelines will be published as the architecture stabilizes.

## License

MIT

## Links

- [Claude Code Documentation](https://docs.claude.com/claude-code)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [MCP Servers Registry](https://github.com/modelcontextprotocol/servers)

---

**Note**: Fluent Toolkit is an independent project and is not officially affiliated with Anthropic or the Claude Code team. It is built by the community to enhance the Claude Code experience.
