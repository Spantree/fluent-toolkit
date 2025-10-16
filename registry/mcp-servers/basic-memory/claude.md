### Basic Memory

**Purpose**: Persistent knowledge graph for Claude Code sessions. Stores notes with relationships, observations, and metadata.

**File Conventions** (CRITICAL):
- **Titles**: kebab-case filenames (e.g., `oracle-health-integration`)
- **Frontmatter**: Title Case in YAML `title` field
- **Access**: ALL operations through MCP tools only, NEVER direct file edits
- **Format**: Run Prettier on content before writing: `echo "$content" | npx prettier --parser markdown`

**Folder Structure**:
```
guides/           # How-to documentation
plans/            # Multi-step research with task checklists
notes/            # Project-specific docs
technologies/     # Technical documentation
meetings/         # Transcripts (YYYY-MM-DDTHH-MM-SS_topic.md)
```

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
