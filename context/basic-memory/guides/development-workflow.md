---
title: development-workflow
type: note
permalink: guides/development-workflow
tags:
  - workflow
  - git
  - commits
  - pull-requests
  - development
---

# Development Workflow

## Overview

fluent-toolkit follows strict conventions for feature development, commits, and releases to maintain code quality and project history.

## Feature Branch Pattern

### Branch Naming Convention

All features MUST be developed in dedicated feature branches:

**Pattern**: `feat/{issue-number}-{short-description}`

**Examples**:

- `feat/001-add-claude-code-installation-and-version-checks`
- `feat/002-add-notion-mcp-server-support`
- `feat/006-pin-mcp-server-versions`

### Workflow Steps

1. **Create Branch**: `git checkout -b feat/XXX-description main`
2. **Develop**: Make changes following code style guidelines
3. **Commit**: Follow conventional commit messages (see below)
4. **Push**: `git push -u origin feat/XXX-description`
5. **Open PR**: Create pull request with detailed description
6. **Review**: Address feedback and iterate
7. **Merge**: Squash merge to `main` for clean history

### Branch Types

- `feat/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `chore/` - Maintenance tasks

## Commit Message Convention

### STRICTLY ENFORCED

All commits MUST follow Conventional Commits with the 50/72 rule:

**Format**:

```
type(scope): subject line max 50 chars

Optional body wrapped at 72 characters. Explain what and why,
not how. Use imperative mood ("add" not "added").

Optional footer for breaking changes or issue references.
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, missing semicolons, etc.)
- `refactor`: Code refactoring without changing behavior
- `test`: Adding or updating tests
- `chore`: Maintenance tasks, dependencies, tooling
- `perf`: Performance improvements
- `ci`: CI/CD changes

### Scopes

- `init`: Init command functionality
- `registry`: Server registry system
- `config`: Configuration management
- `secrets`: Secrets handling
- `ui`: User interface/prompts
- `cli`: CLI framework
- `formula`: Homebrew formula
- `release`: Release automation

### Examples

#### Feature Commit

```
feat(registry): add modular server architecture

Refactored from JSON-based registry to TypeScript modules.
Each server now has its own directory with index.ts and
claude.md files. Supports lifecycle methods for interactive
configuration.

BREAKING CHANGE: servers.json no longer used
```

#### Documentation Commit

```
docs: reorganize documentation into docs/ folder

Moved all markdown files to docs/ directory for cleaner
project structure. Updated internal links and created
documentation index.
```

#### Chore Commit

```
chore(deps): update Deno dependencies to latest
```

### Breaking Changes

When introducing breaking changes:

```
feat(config): change config file format to YAML

Migrated from JSON to YAML for better readability and
comments support. Migration script included.

BREAKING CHANGE: .mcp.json is now .mcp.yaml
```

## Local Development

### Development Commands

```bash
# Run directly
deno run --allow-all src/main.ts init

# Development mode with watch
deno task dev init

# Type checking
deno check src/main.ts

# Formatting
deno fmt

# Linting
deno lint

# Testing
deno test --allow-all
```

### Compilation

```bash
# Single platform (current)
deno task compile

# All platforms
deno task compile:all
```

### Testing Changes

Before pushing:

1. Run type checker: `deno check src/main.ts`
2. Run formatter: `deno fmt`
3. Run linter: `deno lint`
4. Test locally: `deno task dev init`
5. Verify compilation: `deno task compile`

## Pull Request Process

### PR Description Template

```markdown
## Summary

Brief description of changes

## Changes Made

- List of specific changes
- Another change

## Testing

How changes were tested

## Feedback Areas

Specific areas where feedback is desired

## Related Issues

Closes #123
```

### Review Guidelines

- **Code Quality**: Follows TypeScript strict mode
- **Convention Compliance**: Commit messages follow convention
- **Testing**: Changes are tested locally
- **Documentation**: Relevant docs updated
- **No Breaking Changes**: Unless explicitly noted

### Merge Strategy

- **Squash and Merge**: Maintains clean commit history
- **PR title becomes commit message**: Must follow convention
- **Delete branch after merge**: Keeps repository clean

## CI/CD Integration

### GitHub Actions

Check CI status:

```bash
# List recent runs
gh run list

# View specific run
gh run view

# Watch latest run
gh run watch
```

### CI Checks

- TypeScript type checking
- Code formatting (deno fmt)
- Linting (deno lint)
- Test execution
- Build verification

## Release Workflow

See [[release-process]] for detailed release instructions.

Quick overview:

1. Run `./scripts/release.sh <version>`
2. Create GitHub release
3. Upload compiled binaries
4. Update Homebrew formula
5. Commit and push formula changes

## Code Style Guidelines

### TypeScript

- **Strict mode**: All code passes strict type checking
- **No unused variables**: Remove or prefix with `_`
- **Error handling**: Always use `error instanceof Error`
- **Type safety**: Explicit types, no `any`

### File Operations

- **Read before write**: Always read existing content first
- **Absolute paths**: Use `join()` for path construction
- **Error handling**: Handle file not found cases

### Example Patterns

```typescript
// ✅ Good: Proper error handling
async function updateConfig(path: string): Promise<void> {
  try {
    const existing = await Deno.readTextFile(path);
    const updated = modifyContent(existing);
    await Deno.writeTextFile(path, updated);
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      // Create new file
      await Deno.writeTextFile(path, newContent);
    } else if (error instanceof Error) {
      throw new Error(`Failed to update config: ${error.message}`);
    } else {
      throw error;
    }
  }
}

// ❌ Bad: No error handling
async function updateConfig(path: string) {
  const existing = await Deno.readTextFile(path);
  await Deno.writeTextFile(path, existing + "new");
}
```

## Documentation Standards

### Location

- Root directory: Clean, minimal files only
- `docs/`: All detailed documentation
- `docs/archive/`: Historical documents

### Format

- Use markdown
- Include code examples
- Link to related docs
- Update table of contents

### Basic Memory Notes

Project documentation stored as Basic Memory notes:

- `features/` - Feature documentation
- `plans/` - Issue-specific task management
- `guides/` - How-to documentation
- `technologies/` - Technical documentation
- `architecture/` - System architecture
- `research/` - Research results

## observations

- [design-decision] Squash merge keeps main branch history clean #git-workflow
- [fact] Conventional commits enable automated changelog generation #automation
- [integration] CI checks enforce code quality standards #quality
- [limitation] Manual formula updates required for releases #homebrew

## relations

- relates-to: [[fluent-toolkit-project-overview]]
- relates-to: [[deno-typescript-stack]]
- uses-technology: [git, github-actions, deno]
