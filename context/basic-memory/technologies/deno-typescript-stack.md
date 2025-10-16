---
title: deno-typescript-stack
type: note
permalink: technologies/deno-typescript-stack
tags:
  - deno
  - typescript
  - runtime
  - compilation
  - cli
---

# Deno TypeScript Stack

## Overview

fluent-toolkit is built on Deno runtime with TypeScript in strict mode, providing type safety and modern JavaScript features without the complexity of Node.js toolchains.

## Why Deno?

### Advantages

- **No package.json**: Direct URL imports, no npm dependencies
- **Built-in TypeScript**: Native TypeScript support without transpilation
- **Secure by default**: Explicit permissions for file/network access
- **Single executable**: Compile to standalone binaries for distribution
- **Standard library**: Comprehensive std library without third-party deps
- **Modern APIs**: Web-standard APIs (fetch, WebSocket, etc.)

### Trade-offs

- **Ecosystem**: Smaller ecosystem than Node.js
- **Compatibility**: Not all npm packages work seamlessly
- **Tooling**: Less mature IDE support compared to Node.js

## TypeScript Configuration

### Strict Mode

All code uses TypeScript strict mode:

```typescript
// deno.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

### Type Safety Rules

1. **No implicit any**: All types must be explicit
2. **Null checks**: Handle null/undefined explicitly
3. **No unused vars**: Remove or prefix with `_`
4. **Error handling**: Always use `error instanceof Error`

Example:

```typescript
// ❌ Bad
async function getData() {
  const result = await fetch(url);
  return result.json();
}

// ✅ Good
async function getData(): Promise<DataType> {
  try {
    const result = await fetch(url);
    if (!result.ok) {
      throw new Error(`HTTP ${result.status}`);
    }
    return await result.json();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to fetch: ${error.message}`);
    }
    throw error;
  }
}
```

## Key Dependencies

### Cliffy (CLI Framework)

Interactive CLI framework for prompts and commands:

```typescript
import { Command } from "https://deno.land/x/cliffy@v1.0.0-rc.4/command/mod.ts";
import { Input, Select } from "https://deno.land/x/cliffy@v1.0.0-rc.4/prompt/mod.ts";

const server = await Select.prompt({
  message: "Select MCP server",
  options: servers.map((s) => ({ name: s.name, value: s.id })),
});

const apiKey = await Input.prompt({
  message: "Enter API key",
  type: "password",
});
```

### Deno Standard Library

Used for file operations and utilities:

```typescript
import { join } from "https://deno.land/std@0.224.0/path/mod.ts";
import { exists } from "https://deno.land/std@0.224.0/fs/mod.ts";
import { parse } from "https://deno.land/std@0.224.0/jsonc/mod.ts";
```

## Build and Compilation

### Development

```bash
# Run directly
deno run --allow-all src/main.ts init

# Development mode with watch
deno task dev init
```

### Compilation

Generate standalone binaries:

```bash
# Single platform
deno task compile

# All platforms
deno task compile:all
```

Compilation targets:

- macOS: `aarch64-apple-darwin`, `x86_64-apple-darwin`
- Linux: `x86_64-unknown-linux-gnu`, `aarch64-unknown-linux-gnu`
- Windows: `x86_64-pc-windows-msvc`

### Binary Structure

Compiled binaries are self-contained:

- All TypeScript code compiled to native code
- Dependencies bundled
- No runtime installation required
- ~50-80MB per binary (includes Deno runtime)

## File Operations

### Read Before Write

Always use Read tool before Write/Edit:

```typescript
// ✅ Good pattern
try {
  const existing = await Deno.readTextFile(path);
  const updated = modifyContent(existing);
  await Deno.writeTextFile(path, updated);
} catch (error) {
  if (error instanceof Deno.errors.NotFound) {
    // File doesn't exist, create new
    await Deno.writeTextFile(path, newContent);
  } else {
    throw error;
  }
}
```

### Path Handling

Use absolute paths and join properly:

```typescript
import { dirname, join } from "https://deno.land/std@0.224.0/path/mod.ts";

// ❌ Bad
const path = "../../config.json";

// ✅ Good
const projectRoot = Deno.cwd();
const configPath = join(projectRoot, "config.json");
```

## Error Handling Patterns

### Type Guards

```typescript
try {
  await riskyOperation();
} catch (error) {
  // Always check error type
  if (error instanceof Error) {
    console.error(`Operation failed: ${error.message}`);
  } else {
    console.error("Unknown error:", error);
  }
}
```

### Result Types

Use Result pattern for expected failures:

```typescript
interface Result<T, E = Error> {
  ok: boolean;
  value?: T;
  error?: E;
}

async function precheck(): Promise<Result<void>> {
  const hasCommand = await commandExists("uvx");
  return hasCommand ? { ok: true } : { ok: false, error: new Error("uvx not found") };
}
```

## Testing

### Unit Tests

```typescript
import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";

Deno.test("server config generation", async () => {
  const config = await generateConfig();
  assertEquals(config.type, "stdio");
});
```

### Run Tests

```bash
deno test --allow-all
```

## Permissions

Deno requires explicit permissions:

```bash
# Development (all permissions)
deno run --allow-all src/main.ts

# Production (specific permissions)
deno run \
  --allow-read \
  --allow-write \
  --allow-env \
  --allow-run \
  src/main.ts
```

## observations

- [fact] Deno provides native TypeScript without build tooling #typescript #tooling
- [design-decision] Strict mode catches errors at compile time #type-safety
- [architecture] Standalone binaries simplify distribution #deployment
- [limitation] Smaller ecosystem than Node.js #ecosystem
- [integration] Cliffy provides interactive CLI experience #ux

## relations

- relates-to: [[fluent-toolkit-project-overview]]
- relates-to: [[mcp-server-registry-architecture]]
- uses-technology: [deno, typescript, cliffy]
