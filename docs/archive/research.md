# Research Findings - Design Impact

## Research Date: October 2025

### Topics Researched
1. Claude Code Plugins (released Oct 2025)
2. Claude Agent SDK (renamed from Claude Code SDK)
3. CLAUDE.md file reference handling

---

## 1. CLAUDE.md File References

### Critical Discovery
**Markdown links in CLAUDE.md are NOT followed by Claude Code.**

```markdown
# ❌ Does NOT work (treated as plain text):
[MCP Servers](.ftk/docs/mcp-servers.md)

# ✅ DOES work (explicitly includes file):
@.ftk/docs/mcp-servers.md
```

### How Claude Code Loads Files

**Automatic Loading**:
- `CLAUDE.md` files in current directory
- `CLAUDE.md` files in parent directories (hierarchical)
- `CLAUDE.md` files in child directories (when relevant)
- Content is read **inline only**

**Explicit Loading** (@ syntax):
- `@path/to/file.md` - Includes full file contents
- `@path/to/directory/` - Shows file listing (NOT contents)
- Also loads associated `CLAUDE.md` files from that path

### Best Practices

**File Organization**:
- Keep `CLAUDE.md` files concise (100-200 lines)
- Use nested `CLAUDE.md` in subdirectories for modular context
- Root `CLAUDE.md` for project-wide conventions
- Subdirectory `CLAUDE.md` for domain-specific context

**Content Structure**:
```markdown
# Root CLAUDE.md
<system_context>
Project-level conventions and patterns
</system_context>

<file_map>
- src/auth/ - Authentication system
- src/api/ - API endpoints
- docs/ - Extended documentation
</file_map>

# For detailed docs, use @ syntax:
@docs/testing-guidelines.md
@docs/architecture-decisions.md
```

**Semantic Tags** (recommended):
- `<system_context>` - Project conventions
- `<file_map>` - Directory structure guide
- `<patterns>` - Code patterns and examples
- `<constraints>` - Technical constraints
- `<workflows>` - Common workflows

### Limitations
- No markdown link resolution
- No wildcard/glob patterns
- Text files only (binary formats not supported)
- Context window constraints (token limits)
- Directory references show listings only

### Impact on ftk Design

**Original Plan (doesn't work)**:
```markdown
<!-- ftk:begin:mcp-overview -->
See [MCP Server Details](.ftk/docs/mcp-servers.md)
<!-- ftk:end:mcp-overview -->
```

**Revised Approach (3 options)**:

**Option A: Inline with markers** (Recommended)
```markdown
<!-- ftk:begin:mcp-overview -->
## MCP Servers

This project uses the following servers:
- Sequential Thinking: Enhanced reasoning
- Exa: Web search and research
<!-- ftk:end:mcp-overview -->
```

**Option B: @ syntax references**
```markdown
<!-- ftk:begin:mcp-overview -->
@.ftk/docs/mcp-servers.md
<!-- ftk:end:mcp-overview -->
```

**Option C: Nested CLAUDE.md**
```
.ftk/
  CLAUDE.md  <- ftk-specific context
  docs/
    ...

# In root CLAUDE.md:
@.ftk/CLAUDE.md
```

**Recommendation**: Use **Option A** for core docs + **Option C** for extensibility.

---

## 2. Claude Code Plugins

### Overview
Released October 2025, plugins are the **official way to bundle and share Claude Code customizations**.

### What Plugins Can Include
- **Slash commands**: Custom shortcuts
- **Subagents**: Specialized agents
- **MCP servers**: Tool/data integrations
- **Hooks**: Workflow customizations

### Plugin Structure
```
my-plugin/
  .claude-plugin/
    plugin.json       # Metadata
    commands/         # Slash commands
    agents/           # Subagent definitions
    mcp-servers/      # MCP configs
    hooks/            # Hook scripts
```

### Distribution
**Plugin Marketplaces**:
- Any git repository with `.claude-plugin/marketplace.json`
- GitHub repos work out of the box
- Community-driven (anyone can create)

**Installation**:
```bash
/plugin marketplace add user/repo
/plugin install plugin-name
```

**Management**:
- Toggle on/off to manage context
- Enables/disables all bundled components

### Existing Examples
- [Dan Ávila's marketplace](https://www.aitmpl.com/plugins) - DevOps, docs, testing
- [Seth Hobson's agents](https://github.com/wshobson/agents) - 80+ subagents
- [Anthropic examples](https://github.com/anthropics/claude-code) - PR reviews, security

### Impact on ftk Design

**Evolution Path**:
```
Phase 1: MCP server setup tool
  ↓ ftk init installs MCP servers

Phase 2: Plugin generator
  ↓ ftk generates .claude-plugin/ structure
  ↓ Bundles MCP servers + slash commands + docs

Phase 3: Fluent Workshop marketplace
  ↓ Host curated plugins from workshop
  ↓ Distribute best practices as installable plugins
```

**New Capabilities**:
```typescript
// ftk could generate plugins:
ftk plugin create my-setup
  → Bundles current MCP servers
  → Includes custom slash commands
  → Packages CLAUDE.md docs
  → Creates .claude-plugin/ structure

ftk plugin publish
  → Pushes to Fluent Workshop marketplace
  → Makes shareable across teams
```

**Benefits**:
- **Shareability**: Easy distribution across teams
- **Versioning**: Plugin versions separate from ftk versions
- **Context Management**: Users toggle plugins on/off
- **Standards**: Teams can enforce plugin usage

---

## 3. Claude Agent SDK

### Overview
Renamed from "Claude Code SDK" to reflect broader use cases beyond coding.

### Purpose
General-purpose agent framework that powers Claude Code and other agent applications.

### Agent Loop Pattern
```
Gather Context → Take Action → Verify Work → Repeat
```

### Core Capabilities

**Context Gathering**:
- File system as searchable context (grep, tail, etc.)
- Semantic search (vectors)
- Subagents (parallel + isolated context)
- Auto-compaction (context management)

**Action Execution**:
- Custom tools (primary actions)
- Bash commands (flexible execution)
- Code generation (precise, composable)
- MCP integrations (external services)

**Work Verification**:
- Rule-based validation (linting, type checking)
- Visual feedback (screenshots, renders)
- LLM-as-judge (fuzzy evaluation)

### Subagents
- **Parallelization**: Run multiple tasks simultaneously
- **Context Isolation**: Each subagent has own context window
- **Result Filtering**: Only return relevant excerpts to orchestrator

### Impact on ftk Design

**Future Subagents Should Use SDK**:

**Deep Researcher**:
```typescript
// Built with Claude Agent SDK
- Gather: Search web via Exa MCP
- Action: Extract and analyze sources
- Verify: Cross-reference findings
- Iterate: Refine research questions
```

**Writing Coach**:
```typescript
// Built with Claude Agent SDK
- Gather: Read document drafts
- Action: Suggest improvements
- Verify: Check style guidelines
- Iterate: Refine until polished
```

**Distribution**:
- Package SDK-based agents as plugins
- Include in Fluent Workshop marketplace
- Users install via `/plugin install deep-researcher`

**Integration**:
```typescript
// ftk could scaffold Agent SDK projects
ftk agent create my-agent
  → Sets up Claude Agent SDK structure
  → Includes templates for agent loop
  → Configures MCP servers
  → Generates plugin structure
```

---

## Recommended Design Changes

### 1. CLAUDE.md Strategy

**Hybrid Approach**:
```
root/
  CLAUDE.md                    # Project conventions + @.ftk/CLAUDE.md
  .ftk/
    CLAUDE.md                  # ftk-managed content with markers
    docs/                      # Extended docs (referenced via @)
      mcp-servers.md
      workflows.md
```

**Marker Strategy**:
```markdown
<!-- ftk:begin:overview -->
Inline content that ftk manages
<!-- ftk:end:overview -->

<!-- ftk:begin:extended-docs -->
@.ftk/docs/mcp-servers.md
@.ftk/docs/workflows.md
<!-- ftk:end:extended-docs -->
```

### 2. Plugin Generation (Future)

Add to roadmap:
```
Phase 2: Plugin Generator
- [ ] ftk plugin create - Generate .claude-plugin/ structure
- [ ] Bundle MCP servers + CLAUDE.md + hooks
- [ ] ftk plugin publish - Publish to marketplace
- [ ] Fluent Workshop marketplace hosting
```

### 3. Agent SDK Integration (Future)

Add to roadmap:
```
Phase 3: Agent Development
- [ ] ftk agent create - Scaffold Agent SDK project
- [ ] Include agent loop templates
- [ ] Package agents as plugins
- [ ] Distribute via marketplace
```

### 4. Registry Updates Strategy

**Use Git Sparse Checkout** (as suggested):
```bash
# ~/.ftk/registry/ is a sparse checkout
git clone --filter=blob:none --sparse \
  https://github.com/spantree/fluent-toolkit.git \
  ~/.ftk/registry

cd ~/.ftk/registry
git sparse-checkout set registry/
```

**Update Flow**:
```bash
ftk update-registry
  → cd ~/.ftk/registry && git pull
  → Fetch latest server definitions
  → No binary update needed
```

**Versioning**:
```
Binary: 1.2.3
Registry: independent versioning
  → registry/servers.json has own version
  → ftk binary compatible with registry v1.x
```

---

## Open Questions (Resolved)

### ~~1. CLAUDE.md file references~~
**RESOLVED**: Use inline content with markers + @ syntax for extended docs.

### ~~2. Validation security~~
**RESOLVED**: Show code + confirm (as originally suggested).

### ~~3. Registry updates~~
**RESOLVED**: Use git sparse checkout to ~/.ftk/registry.

### 4. Subagent architecture
**RESOLVED**: Use Claude Agent SDK + package as plugins.

---

## Next Steps

1. **Update DESIGN.md** with revised CLAUDE.md strategy
2. **Add plugin generation** to future roadmap
3. **Add Agent SDK integration** to future roadmap
4. **Implement git sparse checkout** for registry updates
5. **Plan Fluent Workshop marketplace** structure
