### Basic Memory

**Purpose**: Persistent knowledge graph for Claude Code sessions. Stores notes with relationships, observations, and metadata.

**File Conventions** (CRITICAL):

- **Titles**: kebab-case filenames (e.g., `authentication-flow`, `api-design-patterns`)
- **Frontmatter**: Title Case in YAML `title` field
- **Access**: ALL operations through MCP tools only, NEVER direct file edits
- **Format**: Run Prettier on content before writing: `echo "$content" | npx prettier --parser markdown`

**Folder Structure**:

```
features/         # Feature documentation (not prefixed with issue numbers, may span multiple issues)
guides/           # How-to documentation and usage instructions
plans/            # Issue-specific task management with status tracking (prefixed with issue-N-)
notes/            # Project-specific documentation
technologies/     # Technical documentation and architecture
meetings/         # Meeting notes and transcripts (YYYY-MM-DDTHH-MM-SS_topic.md)
research/         # Cached Exa deep research results with full prompt and response
```

**Feature Files** (`features/` folder):
Document implemented features without issue number prefixes. Features may span multiple issues over time. Use `related-to` relations to link to implementing issues:

```markdown
## relations

- related-to: [[issue-6-pin-mcp-server-versions]]
- related-to: [[issue-12-version-caching]]
```

**Plan Files** (`plans/` folder):
Multi-phase task tracking with status indicators and detailed work items:

```markdown
---
kind: Plan
created_at: 2025-01-15T10:30:00.000Z
status: active # draft | active | complete
---

# Plan

## ✅ COMPLETED — Phase 1 Name

- [x] Completed task with details
- [x] Another completed task

## ⏳ IN PROGRESS — Phase 2 Name

- [x] Completed subtask
- [ ] Current work item with context
- [ ] Upcoming task

## 📌 BACKLOG — Phase 3 Name

- [ ] Future work item
- [ ] Another upcoming task
```

**Plan Management**:

- Use Sequential (if available) to break down complex objectives into phases
- Update plan status as work progresses (📌 BACKLOG → ⏳ IN PROGRESS → ✅ COMPLETED)
- Edit notes to check off tasks `[x]` and add discovered work items
- Plans track multi-session objectives, not single-session todos

**Required Metadata** (append to all notes):

```markdown
## observations

- [category] insight #tag (optional context)

## relations

- depends-on: [[prerequisite]]
- relates-to: [[topic]]
- uses-technology: [tech1, tech2]
```

**Observation Categories**: `[fact]`, `[architecture]`, `[design-decision]`, `[business-insight]`, `[integration]`, `[use-case]`, `[limitation]`

**Workflow**:

1. Search existing notes before creating new ones
2. Use `build_context` for gathering related notes
3. Create plan files in `plans/` for multi-step work
4. Always include observations + relations sections
5. Format with Prettier before writing

**Tags**: lowercase-hyphenated, avoid qualifiers ("comprehensive", "complete")

**Cooperation with Other MCPs**:

- Sequential: Track complex multi-step processes in `plan/*.md` note
- Exa: Conduct deep research, then document raw results in a `research/*.md` note
- Context7: Capture key patterns from official docs in notes
- Firecrawl: Store raw page content with source attribution in `sites/domain/path/*.md` files
