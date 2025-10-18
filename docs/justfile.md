# Justfile Commands

The project uses [Just](https://github.com/casey/just) as a command runner for common development tasks.

## Installation

```bash
# macOS
brew install just

# Other platforms: https://github.com/casey/just#installation
```

## Quick Reference

```bash
# Show all available commands
just

# Show project info
just info
```

## Development Commands

### Code Quality

```bash
# Type check the project
just check

# Format code
just fmt

# Lint code
just lint

# Run all validations (type check + lint + format check)
just validate
```

### Running ftk

```bash
# Run ftk in development mode
just dev init

# Run with arguments
just dev init --no-prompt
just dev --version
```

### Building

```bash
# Compile binary for current platform
just compile

# Compile for all platforms (macOS, Linux, Windows)
just compile-all
```

## Testing Commands

### Unit Tests

```bash
# Run all unit tests
just test-unit

# Run Claude Code check tests specifically
just test-claude-checks
```

### Integration Tests

```bash
# Run integration tests (requires Tart VM setup)
just test-integration

# Run server validation tests (requires VM with Claude Code)
just test-server-validation

# Run specific server validation test
just test-server basic-memory
```

### Quick Workflows

```bash
# Quick test: validate + compile + unit tests
just quick-test

# Full test: validate + compile + unit + integration tests
just full-test
```

## VM Management Commands

### Setup

```bash
# Install Tart (macOS only)
just install-tart

# Pull macOS base image
just vm-pull-base

# Create and configure test VM (one command does it all!)
just vm-setup

# Create VM with custom name
just vm-setup my-test-vm
```

### VM Operations

```bash
# List all VMs
just vm-list

# Start test VM
just vm-start

# Stop test VM
just vm-stop

# Get VM IP address
just vm-ip

# SSH into VM
just vm-ssh

# Delete VM
just vm-delete

# Delete all test VMs (prompts for confirmation)
just vm-clean
```

### Testing in VM

```bash
# Install ftk binary in VM
just vm-install-ftk

# Test ftk in VM
just vm-test-ftk

# With custom VM name and workdir
just vm-test-ftk my-test-vm /tmp/custom-test

# Setup VM with all prerequisites for server validation tests
just vm-test-setup

# This will:
# 1. Start the VM (if not running)
# 2. Install ftk binary
# 3. Install Claude Code via npm
```

## Documentation Commands

```bash
# Format markdown files with prettier
just fmt-docs

# Format Basic Memory notes
just fmt-memory
```

## Release Commands

```bash
# Create a new release
just release 0.2.1

# Show instructions for updating formula
just update-formula
```

## Utility Commands

```bash
# Clean build artifacts
just clean

# Open project in VS Code
just edit

# Show project info (versions, etc.)
just info
```

## Common Workflows

### First Time Setup

```bash
# 1. Install dependencies
brew install just tart

# 2. Pull base image
just vm-pull-base

# 3. Create test VM
just vm-setup

# 4. Verify setup
just info
```

### Development Workflow

```bash
# 1. Make code changes
# 2. Run quick validation
just quick-test

# 3. If working on VM-related features
just vm-install-ftk
just vm-test-ftk

# 4. Before committing
just validate
```

### Testing Workflow

```bash
# 1. Run unit tests frequently
just test-claude-checks

# 2. Before pushing
just quick-test

# 3. Before releasing
just full-test
```

### VM Testing Workflow

```bash
# 1. Ensure VM is running
just vm-start

# 2. Install latest ftk build
just compile
just vm-install-ftk

# 3. Test in VM
just vm-test-ftk

# 4. SSH in for manual testing
just vm-ssh

# 5. Clean up when done
just vm-stop
```

### Server Validation Testing Workflow

```bash
# 1. One-time setup: Create VM with all prerequisites
just vm-setup
just vm-test-setup

# 2. Get VM IP for tests
VM_IP=$(just vm-ip)
echo $VM_IP

# 3. Run server validation tests
TEST_VM_IP=$VM_IP just test-server-validation

# 4. Or test specific server
TEST_VM_IP=$VM_IP just test-server basic-memory

# 5. SSH in for debugging if needed
just vm-ssh

# 6. Stop VM when done
just vm-stop
```

### Release Workflow

```bash
# 1. Run full tests
just full-test

# 2. Create release
just release 0.2.1

# 3. Upload binaries to GitHub

# 4. Update formula
just update-formula
# Then manually update Formula/fluent-toolkit.rb
```

## VM Setup Details

The `vm-setup` command does everything needed to prepare a test VM:

1. Pulls base macOS Sequoia image (if not already pulled)
2. Clones base image to create test VM
3. Starts the VM
4. Configures Homebrew PATH in VM
5. Installs dependencies (node, python, uv)
6. Shows VM IP and connection instructions

This typically takes 5-10 minutes on first run.

## Advanced Usage

### Custom VM Names

Most VM commands accept a custom VM name:

```bash
just vm-setup my-custom-vm
just vm-start my-custom-vm
just vm-ssh my-custom-vm
just vm-delete my-custom-vm
```

### Parallel Testing

Run multiple VMs for parallel testing:

```bash
just vm-setup test-vm-1
just vm-setup test-vm-2
just vm-setup test-vm-3

# Run tests in parallel
just vm-test-ftk test-vm-1 &
just vm-test-ftk test-vm-2 &
just vm-test-ftk test-vm-3 &
wait
```

### Custom Test Directories

```bash
# Test in specific directory
just vm-test-ftk FTK-test /tmp/my-test

# Multiple test runs
just vm-test-ftk FTK-test /tmp/test-1
just vm-test-ftk FTK-test /tmp/test-2
```

## Troubleshooting

### Command Not Found

```bash
# Install just
brew install just

# Verify installation
just --version
```

### VM Commands Fail

```bash
# Install Tart
just install-tart

# Verify Tart is installed
tart --version

# Check VM list
just vm-list
```

### SSH Connection Issues

```bash
# Check if VM is running
just vm-list

# Start VM if stopped
just vm-start

# Get IP address
just vm-ip

# Try manual SSH
ssh admin@$(just vm-ip)
```

### Type Checking Errors

```bash
# Run validation
just validate

# Check specific file
deno check --unstable-raw-imports src/file.ts
```

## Tips

1. **Use tab completion**: Just supports shell completion
2. **Check recipe source**: Use `just --show <recipe>` to see what a recipe does
3. **Dry run**: Use `just --dry-run <recipe>` to see what would be executed
4. **List all**: Run `just --list` or just `just` to see all commands
5. **Verbose mode**: Add `--verbose` flag for detailed output

## See Also

- [Just Manual](https://just.systems/man/en/)
- [Tart Documentation](https://tart.run/)
- [Integration Testing README](../tests/integration/README.md)
