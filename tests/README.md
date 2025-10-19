# Fluent Toolkit Test Suite

Comprehensive testing infrastructure for fluent-toolkit.

## Test Organization

### Unit Tests (`unit/`)

Test individual utilities and functions in isolation.

- **`claude-code-checks/`** - Claude Code installation detection, version checking, and changelog parsing
  - No external dependencies
  - Tests pure functions and logic
  - Fast execution
  - See: [`unit/claude-code-checks/README.md`](unit/claude-code-checks/README.md)

### Integration Tests (`integration/`)

Test complete workflows in isolated Tart VM environments.

- **Tart VM Infrastructure** - Full ftk init testing in clean macOS VMs
  - SSH session management
  - Interactive prompt testing
  - End-to-end validation
  - See: [`integration/README.md`](integration/README.md)

## Running Tests

### All Unit Tests
```bash
deno run --allow-all tests/unit/**/*.test.ts
```

### Claude Code Check Unit Tests
```bash
# All tests
deno run --allow-all tests/unit/claude-code-checks/*.test.ts

# Individual tests
deno run --allow-all tests/unit/claude-code-checks/claude-version-scenarios.test.ts
deno run --allow-net tests/unit/claude-code-checks/changelog.test.ts
deno run --allow-all tests/unit/claude-code-checks/install-method-detection.test.ts
```

### Integration Tests
```bash
# All integration tests
deno task test:integration

# Specific scenario
deno test --allow-all tests/integration/scenarios/init-no-prompt.test.ts
```

## Test Categories

### Unit Tests
- ✅ Fast execution (milliseconds to seconds)
- ✅ No external dependencies
- ✅ Test pure functions and utilities
- ✅ Run frequently during development
- ✅ Part of CI pipeline

### Integration Tests
- ✅ Slower execution (minutes)
- ✅ Require Tart VMs
- ✅ Test complete workflows
- ✅ Run before releases
- ✅ Optional in CI (resource intensive)

## Writing Tests

### Unit Tests
Place in `tests/unit/` organized by feature:
```typescript
import { functionToTest } from "../../src/utils/module.ts";

Deno.test("descriptive test name", () => {
  const result = functionToTest(input);
  assertEquals(result, expected);
});
```

### Integration Tests
Place in `tests/integration/scenarios/`:
```typescript
import { TartVMHarness } from "../tart/vm-harness.ts";
import { SSHSession } from "../tart/ssh-session.ts";
import { FtkTester } from "../tart/ftk-tester.ts";

Deno.test({
  name: "scenario description",
  async fn() {
    const vm = new TartVMHarness({ verbose: true });
    // ... test implementation
  },
  sanitizeOps: false,
  sanitizeResources: false,
});
```

## Coverage Areas

### Unit Test Coverage
- ✅ Version parsing and comparison
- ✅ Installation method detection
- ✅ Command generation
- ✅ Changelog fetching and parsing
- ✅ Semver operations
- ✅ Configuration validation

### Integration Test Coverage
- ✅ Full ftk init workflow
- ✅ Interactive mode (keyboard simulation)
- ✅ No-prompt mode
- ✅ Server installation
- ✅ File generation (.mcp.json, CLAUDE.md)
- ✅ Environment setup (Homebrew, dependencies)

## CI/CD Integration

### Current Setup
- Unit tests: Run on every commit
- Integration tests: Manual execution (VM requirements)

### Future Enhancements
- Parallel test execution
- GitHub Actions with Tart support
- Performance benchmarking
- Coverage reporting
