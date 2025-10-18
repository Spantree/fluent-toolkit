# Integration Testing with Tart VMs

Comprehensive test harness for testing fluent-toolkit in isolated macOS VMs using Tart.

## Overview

This testing infrastructure provides:

- **VM Lifecycle Management**: Clone, start, stop, delete Tart VMs
- **SSH Connectivity**: Persistent sessions with command execution
- **Interactive Testing**: Expect-style prompt interactions
- **FTK-Specific Utilities**: Install dependencies, run tests, validate output
- **Repeatable Tests**: Fresh VM state for each test run

## Quick Start

```bash
# Run all integration tests
deno task test:integration

# Run specific test
deno test --allow-all --no-check tests/integration/scenarios/init-no-prompt.test.ts
```

## Components

### VM Harness (`tart/vm-harness.ts`)

Manages Tart VM lifecycle:

```typescript
const vm = new TartVMHarness({ verbose: true });

// Clone from base image
await vm.clone("ghcr.io/cirruslabs/macos-sequoia-base:latest", "my-test-vm");

// Start VM
await vm.start("my-test-vm");

// Get IP address
const ip = await vm.getIP("my-test-vm");

// Quick command execution
const output = await vm.execQuick("my-test-vm", "ftk --version");

// Cleanup
await vm.stop("my-test-vm");
await vm.delete("my-test-vm");
```

### SSH Session (`tart/ssh-session.ts`)

Provides SSH connectivity and command execution:

```typescript
const session = new SSHSession(ip, { verbose: true });
await session.connect();

// Execute commands
const result = await session.exec("ftk init --no-prompt", 120000);
console.log(result.stdout);

// Upload/download files
await session.uploadFile("./local.txt", "/tmp/remote.txt");
await session.downloadFile("/tmp/output.json", "./output.json");

await session.disconnect();
```

### Interactive Sessions (`tart/ssh-session.ts`)

Handle interactive prompts:

```typescript
const interactive = await session.execInteractive("ftk init");

// Wait for prompt and respond
await interactive.expect(/Select MCP servers/);
await interactive.sendKeys(["Space", "Space", "Enter"]);

// Wait for completion
await interactive.expect(/Setup complete!/);
await interactive.close();
```

### FTK Tester (`tart/ftk-tester.ts`)

FTK-specific test utilities:

```typescript
const tester = new FtkTester(true);

// Setup environment
await tester.configureHomebrew(session);
await tester.installDependencies(session, ["node", "python", "uv"]);
await tester.installFtk(session);

// Run tests
const result = await tester.testNoPrompt(session, "/tmp/test-project");

// Validate output
const mcpValid = await tester.validateMcpConfig(session, "/tmp/test-project");
const serverInstalled = await tester.validateServerInstallation(
  session,
  "basic-memory",
  "/tmp/test-project",
);
```

## Writing Tests

Example test structure:

```typescript
import { assertEquals } from "@std/assert";
import { TartVMHarness } from "../tart/vm-harness.ts";
import { SSHSession } from "../tart/ssh-session.ts";
import { FtkTester } from "../tart/ftk-tester.ts";

Deno.test({
  name: "my test",
  async fn() {
    const vm = new TartVMHarness({ verbose: true });
    const tester = new FtkTester(true);
    let session: SSHSession | null = null;

    try {
      // Setup
      await vm.clone("ghcr.io/cirruslabs/macos-sequoia-base:latest", "test-vm");
      await vm.start("test-vm");

      const ip = await vm.getIP("test-vm");
      session = new SSHSession(ip, { verbose: true });
      await session.connect();

      // Test
      await tester.installDependencies(session, ["node", "python", "uv"]);
      await tester.installFtk(session);

      const result = await tester.testNoPrompt(session, "/tmp/test");
      assertEquals(result.success, true);
    } finally {
      // Cleanup
      if (session) await session.disconnect();
      if (await vm.exists("test-vm")) {
        await vm.delete("test-vm");
      }
    }
  },
  sanitizeOps: false,
  sanitizeResources: false,
});
```

## Best Practices

### VM Management

1. **Unique Names**: Use descriptive, unique VM names per test
2. **Cleanup**: Always delete VMs in `finally` block
3. **Reuse**: Comment out VM deletion during development for faster iterations
4. **Snapshots**: Consider using Tart snapshots for faster test cycles

### Timeouts

Adjust timeouts based on operation:

- SSH connection: 5-10 seconds
- Command execution: 30-60 seconds
- Package installation: 120-300 seconds
- ftk init: 60-120 seconds

### Debugging

Leave VMs running for inspection:

```typescript
// Comment out in finally block:
// await vm.delete("test-vm");

console.log("VM left running. Delete with:");
console.log(`  tart stop test-vm && tart delete test-vm`);
```

Connect manually:

```bash
# Get VM IP
tart ip test-vm

# SSH into VM
ssh admin@$(tart ip test-vm)
```

## Environment Setup

### Prerequisites

1. Install Tart:
   ```bash
   brew install tart
   ```

2. Pull base image:
   ```bash
   tart clone ghcr.io/cirruslabs/macos-sequoia-base:latest sequoia-base
   ```

### CI/CD Integration

For GitHub Actions:

```yaml
- name: Install Tart
  run: brew install tart

- name: Run integration tests
  run: deno task test:integration
```

## Troubleshooting

### VM won't start

- Check Tart is running: `tart list`
- Verify virtualization: System Settings → Privacy & Security → Allow

### SSH connection fails

- Wait longer for VM boot (increase sleep time)
- Check VM has IP: `tart ip vm-name`
- Verify SSH is enabled in VM

### Type checking errors

- Run with `--no-check` flag for faster iteration
- Fix unused variable warnings with underscore prefix

### Tests hang

- Check timeouts are sufficient
- Verify commands complete successfully
- Use verbose mode to see output

## Interactive Testing Patterns

The harness supports full interactive testing with expect-style patterns:

```typescript
// Start interactive session
const interactive = await session.execInteractive("ftk init");

// Wait for server selection prompt
await interactive.expect(/Select MCP servers/);

// Select servers using keyboard navigation
await interactive.sendKeys(["Space"]); // Select first
await interactive.sleep(500);
await interactive.sendKeys(["Down"]); // Move to second
await interactive.sendKeys(["Space"]); // Select second
await interactive.sendKeys(["Enter"]); // Submit

// Wait for completion
await interactive.expect(/Setup complete!/);
await interactive.close();
```

### Available Key Commands

- `Space` - Toggle selection
- `Enter` - Submit / Confirm
- `Up`/`Down`/`Left`/`Right` - Navigation
- `Ctrl-C` - Cancel
- `Ctrl-D` - EOF
- `Tab` - Next field
- `Escape` - Exit

### Pattern Matching

```typescript
// String patterns (converted to regex)
await interactive.expect("Welcome to");

// Regex patterns
await interactive.expect(/Setup.*complete/);

// With custom timeout
await interactive.expect(/Pattern/, 60000);

// Read without expecting
const output = await interactive.read(1000);
```

## VM Setup for Testing

### Prerequisites

Tart VMs require setup before testing ftk:

```bash
# 1. Clone base image
tart clone ghcr.io/cirruslabs/macos-sequoia-base:latest FTK-test

# 2. Start VM
tart run FTK-test &

# 3. Configure Homebrew (CRITICAL for PATH)
tart exec FTK-test /bin/zsh -c "echo 'eval \"\$(/opt/homebrew/bin/brew shellenv)\"' >> ~/.zshrc"

# 4. Install dependencies
tart exec FTK-test /bin/zsh -c "source ~/.zshrc && brew install node python uv"

# 5. Install ftk (requires tapping formula or local build)
# Option A: From local build
tart exec FTK-test /bin/zsh -c "scp user@host:/path/to/ftk /usr/local/bin/"

# Option B: From Homebrew tap (when available)
tart exec FTK-test /bin/zsh -c "brew tap spantree/tap && brew install fluent-toolkit"
```

### Test VM Snapshots

For faster iteration, create snapshots after setup:

```bash
# After setup is complete
tart stop FTK-test
tart clone FTK-test FTK-test-snapshot

# Restore from snapshot
tart clone FTK-test-snapshot FTK-test --force
```

## Future Enhancements

- [x] Interactive mode test infrastructure
- [x] Expect-style pattern matching
- [x] Comprehensive keyboard input support
- [ ] VM snapshots for faster test iterations
- [ ] Fixture VMs with pre-installed dependencies
- [ ] Parallel test execution
- [ ] GitHub Actions CI integration
- [ ] Performance benchmarking
