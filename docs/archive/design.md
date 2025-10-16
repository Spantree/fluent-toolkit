# Fluent Toolkit - Design Document

## Design Decisions

### Configuration Architecture

**Dual-Layer Configuration:**
- **User-level**: `~/.ftk/config.json` - Global preferences, user-scoped MCP servers
- **Project-level**: `.ftk/config.json` - Project-specific overrides and server selections

**User-scope Inheritance:**
- Check if MCP server already configured at user level (`~/.config/claude/mcp.json`)
- Prompt user: inherit user config or create project-specific override?

### MCP Server Registry

**Storage**: Hard-coded TypeScript/JSON in binary (extensible for future plugins)

**Server Metadata Schema:**
```typescript
interface MCPServer {
  id: string;                           // e.g., "sequential-thinking"
  name: string;                         // e.g., "Sequential Thinking"
  description: string;
  category: "core" | "optional";

  // Installation
  installMethod: "npm" | "uvx" | "git" | "binary";
  packageName?: string;                 // npm package or uvx module
  gitRepo?: string;                     // for git-based installs

  // Dependencies
  systemDependencies: {
    runtime?: "node" | "python" | "uv" | "docker";
    minVersion?: string;
    validateFn?: string;                // Optional validation code (requires user permission)
  }[];

  // Environment & Secrets
  requiredEnvVars: {
    name: string;                       // e.g., "EXA_API_KEY"
    prompt: string;                     // User-friendly prompt
    validateFn?: string;                // Optional validation (e.g., test API call)
    scope?: "user" | "project";         // Default: "project"
  }[];

  // Configuration
  mcpConfig: {
    command: string;
    args?: string[];
    env?: Record<string, string>;
  };

  // Documentation
  docsTemplate?: string;                // CLAUDE.md section template
  usageExamples?: string[];
}
```

### Secrets Management

**File Structure:**
- `.env.mcp.secrets` - Project-scoped secrets (gitignored)
- `~/.ftk/secrets.env` - User-scoped secrets (optional, for shared API keys)

**dotenv-cli Integration:**
- Managed via `npx dotenv-cli`
- Wrap MCP server commands in `.mcp.json`:
  ```json
  {
    "mcpServers": {
      "exa": {
        "command": "npx",
        "args": [
          "dotenv-cli",
          "-e",
          ".env.mcp.secrets",
          "--",
          "uvx",
          "mcp-server-exa"
        ]
      }
    }
  }
  ```

### CLAUDE.md Augmentation

**Critical Discovery**: Markdown links in CLAUDE.md are NOT followed. Only `@` syntax works.

**Strategy**: Hybrid approach with inline content + @ references

**File Structure:**
```
project/
  CLAUDE.md                    # Project conventions + @.ftk/CLAUDE.md reference
  .ftk/
    CLAUDE.md                  # ftk-managed content with markers
    docs/                      # Extended docs (optional, referenced via @)
      workflows.md
      examples.md
```

**Root CLAUDE.md** (user-editable):
```markdown
# Project Documentation

<system_context>
Your project-specific conventions and guidelines
</system_context>

# MCP Server Configuration
@.ftk/CLAUDE.md
```

**.ftk/CLAUDE.md** (ftk-managed with markers):
```markdown
<!-- ftk:begin:mcp-overview -->
## MCP Servers Configuration

This project uses the following MCP servers:

### Sequential Thinking
Enhanced reasoning for complex multi-step problems.

**Usage**: Available automatically in all Claude Code sessions.

### Exa Research
Powerful web search and research capabilities.

**Usage**: Request web searches or research tasks.
<!-- ftk:end:mcp-overview -->

<!-- ftk:begin:extended-docs -->
@.ftk/docs/workflows.md
<!-- ftk:end:extended-docs -->
```

**Update Behavior:**
- Only modify content between markers in `.ftk/CLAUDE.md`
- Never modify root `CLAUDE.md` directly
- If `.ftk/CLAUDE.md` doesn't exist, create it
- If root `CLAUDE.md` doesn't reference `.ftk/CLAUDE.md`, suggest adding `@.ftk/CLAUDE.md`
- Use semantic tags recommended by community: `<system_context>`, `<file_map>`, `<patterns>`

### Dependency Validation

**Permission Model:**
- Start wizard by asking: "ftk needs to run validation checks. Allow? (Y/n)"
- If declined, skip optional validations, only check command existence

**Validation Levels:**
1. **Basic**: Check if command exists in PATH (`which uv`)
2. **Version** (optional): Run `--version` and parse
3. **Custom** (optional, requires permission): Run server-defined validation code

**Installation Assistance:**
- Detect missing dependencies
- Show installation command (e.g., `brew install uv`)
- Ask: "Run this command? (y/N)"
- If yes, execute and show output

### Versioning Strategy

**Binary Versioning:**
- `MAJOR.MINOR.PATCH` (standard semantic versioning)
- MAJOR: Breaking changes
- MINOR: New features (backward compatible)
- PATCH: Bug fixes

**Registry Versioning** (independent):
- Server registry has own version in `registry/servers.json`
- Updated via git sparse checkout (no binary update needed)
- Binary declares compatible registry version range

**Update Paths:**

**Binary Updates:**
```bash
ftk upgrade
  → runs `brew upgrade ftk`
  → New binary with new features
```

**Registry Updates** (without binary update):
```bash
ftk update-registry
  → Pulls latest from ~/.ftk/registry (git sparse checkout)
  → Updates server definitions, templates, docs
  → No binary replacement needed
```

**Registry Storage:**
```bash
# Initial setup (during ftk install)
git clone --filter=blob:none --sparse \
  https://github.com/spantree/fluent-toolkit.git \
  ~/.ftk/registry

cd ~/.ftk/registry
git sparse-checkout set registry/ templates/

# Updates
cd ~/.ftk/registry && git pull
```

**Version Compatibility:**
```json
// In binary
{
  "ftkVersion": "1.2.3",
  "compatibleRegistryVersions": "^1.0.0"
}

// In registry/servers.json
{
  "registryVersion": "1.5.2",
  "minFtkVersion": "1.0.0"
}
```

### Platform Support

**Phase 1**: macOS only
- Distribution: Homebrew
- Binary: Deno compile → single executable

**Future**: Linux, Windows (deferred)

## Architecture

### Directory Structure

```
fluent-toolkit/
├── src/
│   ├── main.ts                 # CLI entry point
│   ├── commands/               # Command handlers
│   │   ├── init.ts
│   │   ├── doctor.ts           # Future
│   │   ├── upgrade.ts          # Future
│   │   ├── update-registry.ts  # Phase 3
│   │   ├── plugin-create.ts    # Phase 4
│   │   └── agent-create.ts     # Phase 5
│   ├── core/
│   │   ├── config.ts           # Config read/write
│   │   ├── registry.ts         # MCP server registry
│   │   ├── dependencies.ts     # Dependency checking
│   │   ├── secrets.ts          # .env.mcp.secrets management
│   │   └── claude-md.ts        # CLAUDE.md augmentation
│   ├── services/
│   │   ├── mcp-installer.ts    # MCP server installation
│   │   ├── env-manager.ts      # Environment file management
│   │   └── validator.ts        # Validation orchestration
│   ├── ui/
│   │   ├── prompts.ts          # Interactive prompts
│   │   └── output.ts           # Formatted output
│   └── types/
│       └── index.ts            # TypeScript definitions
├── registry/
│   └── servers.json            # MCP server definitions
├── templates/
│   ├── env.template            # .env.mcp.secrets template
│   └── claude-md/              # CLAUDE.md section templates
│       ├── overview.md
│       ├── sequential-thinking.md
│       ├── exa.md
│       └── ...
└── deno.json                   # Deno configuration
```

### Core Modules

#### 1. Registry (`src/core/registry.ts`)
```typescript
export class ServerRegistry {
  static getAll(): MCPServer[]
  static getById(id: string): MCPServer | undefined
  static getCore(): MCPServer[]
  static getOptional(): MCPServer[]
  static getByCategory(category: string): MCPServer[]
}
```

#### 2. Config Manager (`src/core/config.ts`)
```typescript
export class ConfigManager {
  // User-level config
  static getUserConfig(): UserConfig
  static saveUserConfig(config: UserConfig): void

  // Project-level config
  static getProjectConfig(): ProjectConfig
  static saveProjectConfig(config: ProjectConfig): void

  // MCP config (.mcp.json)
  static getMCPConfig(): MCPConfig
  static updateMCPConfig(serverConfig: ServerConfig): void

  // Check inheritance
  static isServerInUserScope(serverId: string): boolean
}
```

#### 3. Dependency Validator (`src/core/dependencies.ts`)
```typescript
export class DependencyValidator {
  static async checkRuntime(
    runtime: string,
    minVersion?: string
  ): Promise<ValidationResult>

  static async runCustomValidation(
    validationCode: string,
    withPermission: boolean
  ): Promise<ValidationResult>

  static suggestInstallCommand(dependency: string): string
}
```

#### 4. Secrets Manager (`src/core/secrets.ts`)
```typescript
export class SecretsManager {
  static async loadSecrets(): Promise<Record<string, string>>
  static async saveSecret(key: string, value: string, scope?: 'user' | 'project'): void
  static async validateSecret(key: string, validationFn?: string): Promise<boolean>
  static ensureGitignore(): void
}
```

#### 5. CLAUDE.md Manager (`src/core/claude-md.ts`)
```typescript
export class ClaudeMdManager {
  static async exists(): Promise<boolean>
  static async read(): Promise<string>

  static async upsertSection(
    sectionId: string,
    content: string
  ): Promise<void>

  static async removeSection(sectionId: string): Promise<void>

  static async getSectionBounds(
    sectionId: string
  ): Promise<{ start: number; end: number } | null>
}
```

### Command Flows

#### `ftk init`

```
1. Check if already initialized
   ├─ If yes: Confirm before proceeding
   └─ If no: Continue

2. Request validation permission
   ├─ "ftk needs to run validation checks. Allow? (Y/n)"
   └─ Store preference for session

3. System dependency check
   ├─ Check node, python, uv availability
   ├─ Show missing dependencies
   └─ Offer to install missing tools

4. MCP Server selection
   ├─ Show core servers (recommended)
   ├─ Show optional servers
   ├─ Multi-select prompt
   └─ For each selected:
       ├─ Check if in user scope
       ├─ If yes: "Use user config or override? (user/project)"
       └─ If no: Continue

5. Dependency validation
   └─ For each selected server:
       ├─ Validate system dependencies
       ├─ If missing: Show install command + confirm
       └─ If validation fails: Warn + offer to skip

6. Secrets collection
   └─ For each server requiring env vars:
       ├─ Prompt for API key
       ├─ Ask scope (user/project) if applicable
       ├─ Optionally validate (test API call)
       └─ Save to .env.mcp.secrets or ~/.ftk/secrets.env

7. Configuration generation
   ├─ Update .mcp.json with dotenv-cli wrappers
   ├─ Create .ftk/config.json
   ├─ Ensure .env.mcp.secrets in .gitignore
   └─ Update CLAUDE.md with server docs

8. Validation & testing
   ├─ Test each MCP server connection (if possible)
   └─ Report success/failures

9. Success message
   └─ "Setup complete! Run 'claude' to start."
```

#### `ftk doctor` (Future)

```
1. Check ftk version
2. Check Claude Code installation
3. Validate .mcp.json syntax
4. Check all configured servers:
   ├─ Dependency availability
   ├─ Environment variables present
   └─ Connectivity test (if applicable)
5. Report issues with suggested fixes
```

## Data Models

### User Config (`~/.ftk/config.json`)
```json
{
  "version": "1.0.0",
  "preferences": {
    "allowValidation": true,
    "autoInstallDeps": false
  },
  "servers": {
    "sequential-thinking": { /* user-scoped config */ },
    "exa": { /* user-scoped config */ }
  }
}
```

### Project Config (`.ftk/config.json`)
```json
{
  "version": "1.0.0",
  "projectType": "web-dev",
  "servers": {
    "sequential-thinking": {
      "source": "user",
      "overrides": {}
    },
    "exa": {
      "source": "project",
      "config": { /* project-specific */ }
    }
  }
}
```

### Environment File (`.env.mcp.secrets`)
```bash
# Generated by ftk - DO NOT COMMIT
# MCP Server Secrets

EXA_API_KEY=your_key_here
FIRECRAWL_API_KEY=your_key_here
NOTION_API_KEY=your_key_here
```

## Implementation Phases

### Phase 1: MVP (Core Functionality)
- [ ] Server registry with core servers
- [ ] Basic dependency checking
- [ ] `ftk init` command
- [ ] Secrets management
- [ ] .mcp.json generation
- [ ] Basic CLAUDE.md augmentation

### Phase 2: Enhancement
- [ ] `ftk doctor` command
- [ ] Advanced validation
- [ ] Installation assistance
- [ ] Better error messages
- [ ] Progress indicators

### Phase 3: Extensibility
- [ ] Declarative config support
- [ ] `ftk update-registry` command (git sparse checkout)
- [ ] Registry version compatibility checking
- [ ] Custom server definitions (local registry)

### Phase 4: Plugin Generation (Future)
- [ ] `ftk plugin create` - Generate `.claude-plugin/` structure
- [ ] Bundle MCP servers + slash commands + hooks
- [ ] `ftk plugin publish` - Publish to marketplace
- [ ] Fluent Workshop marketplace hosting
- [ ] Plugin versioning and dependencies

### Phase 5: Agent SDK Integration (Future)
- [ ] `ftk agent create` - Scaffold Claude Agent SDK project
- [ ] Agent loop templates (gather → act → verify)
- [ ] Package agents as plugins
- [ ] Deep Researcher agent (Exa-based research)
- [ ] Writing Coach agent (content improvement)
- [ ] Distribution via Fluent Workshop marketplace

## Resolved Design Questions

### ~~1. CLAUDE.md file references~~
**RESOLVED**: Markdown links are NOT followed. Use:
- Inline content with markers in `.ftk/CLAUDE.md`
- `@.ftk/CLAUDE.md` reference in root `CLAUDE.md`
- `@` syntax for additional docs (e.g., `@.ftk/docs/workflows.md`)

### ~~2. Validation security~~
**RESOLVED**: Show code + confirm (user approval required).
- Display validation code to user
- Ask permission before execution
- Store preference for session

### ~~3. Registry updates between releases~~
**RESOLVED**: Use git sparse checkout to `~/.ftk/registry`.
- Independent versioning for registry
- `ftk update-registry` command
- No binary update needed for registry changes

### ~~4. Subagent architecture~~
**RESOLVED**: Use Claude Agent SDK + package as plugins.
- Build agents with official Claude Agent SDK
- Package as Claude Code plugins
- Distribute via plugin marketplaces
- Install with `/plugin install agent-name`

## Open Questions

### 1. Plugin Marketplace Strategy
- Should ftk create its own marketplace or contribute to existing ones?
- What's the governance model for Fluent Workshop marketplace?
- How to handle plugin versioning and dependencies?

### 2. Agent SDK Scaffolding
- What templates should `ftk agent create` provide?
- How deep should ftk integrate with Agent SDK?
- Should ftk manage agent dependencies separately?

### 3. Multi-Framework Support
- Should ftk support other agent frameworks beyond Claude Agent SDK?
- OpenAI Assistants API? LangChain? Others?

## Next Steps

1. Set up Deno project structure
2. Define TypeScript types/interfaces
3. Implement server registry
4. Build config management
5. Create interactive prompts
6. Implement `ftk init` command
7. Test with real MCP servers
8. Package as binary
9. Create Homebrew formula
