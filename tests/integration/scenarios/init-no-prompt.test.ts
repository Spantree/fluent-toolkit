/**
 * Integration Test: ftk init --no-prompt
 * Tests automated installation of MCP servers
 */

import { assertEquals } from "@std/assert";
import { TartVMHarness } from "../tart/vm-harness.ts";
import { SSHSession } from "../tart/ssh-session.ts";
import { FtkTester } from "../tart/ftk-tester.ts";

// Test configuration
const VM_NAME = "FTK-test"; // Reuse existing VM
const BASE_IMAGE = "ghcr.io/cirruslabs/macos-sequoia-base:latest";
const WORKDIR = "/tmp/ftk-test-no-prompt";

Deno.test({
  name: "ftk init --no-prompt - all core servers",
  async fn() {
    const vm = new TartVMHarness({ verbose: true });
    const tester = new FtkTester(true);
    let session: SSHSession | null = null;

    try {
      console.log("\n🚀 Starting VM setup...\n");

      // Check if VM already exists from previous run
      if (await vm.exists(VM_NAME)) {
        console.log(`⚠️  VM ${VM_NAME} exists, using it...`);
      } else {
        // Clone and start VM
        await vm.clone(BASE_IMAGE, VM_NAME);
      }

      // Start VM if not running
      if (!(await vm.isRunning(VM_NAME))) {
        await vm.start(VM_NAME);
      }

      // Get IP and create SSH session
      const ip = await vm.getIP(VM_NAME);
      console.log(`\n📡 VM IP: ${ip}\n`);

      session = new SSHSession(ip, { verbose: true });
      await session.connect();

      console.log("\n📦 Installing dependencies...\n");

      // Configure Homebrew environment
      await tester.configureHomebrew(session);

      // Install dependencies
      await tester.installDependencies(session, ["node", "python", "uv"]);

      // Install ftk
      await tester.installFtk(session);

      // Verify ftk version
      const version = await tester.getFtkVersion(session);
      console.log(`\n✅ ftk version: ${version}\n`);

      console.log("\n🧪 Running ftk init --no-prompt...\n");

      // Clean up any previous test
      await tester.cleanProject(session, WORKDIR);

      // Run ftk init
      const testResult = await tester.testNoPrompt(session, WORKDIR);

      assertEquals(testResult.success, true, testResult.message);
      console.log(`\n${testResult.message}\n`);

      console.log("\n✅ Validating generated files...\n");

      // Validate .mcp.json
      const mcpValidation = await tester.validateMcpConfig(session, WORKDIR);
      assertEquals(
        mcpValidation.success,
        true,
        `MCP config validation failed: ${mcpValidation.errors.join(", ")}`,
      );

      // Validate CLAUDE.md
      const claudeMdValidation = await tester.validateClaudeMd(session, WORKDIR);
      assertEquals(
        claudeMdValidation.success,
        true,
        `CLAUDE.md validation failed: ${claudeMdValidation.errors.join(", ")}`,
      );

      // Validate individual servers
      console.log("\n🔍 Checking server installations...\n");

      const sequentialInstalled = await tester.validateServerInstallation(
        session,
        "sequentialthinking",
        WORKDIR,
      );
      assertEquals(sequentialInstalled, true, "Sequential Thinking not installed");
      console.log("  ✅ Sequential Thinking installed");

      const context7Installed = await tester.validateServerInstallation(
        session,
        "context7",
        WORKDIR,
      );
      assertEquals(context7Installed, true, "Context7 not installed");
      console.log("  ✅ Context7 installed");

      const basicMemoryInstalled = await tester.validateServerInstallation(
        session,
        "basic-memory",
        WORKDIR,
      );
      assertEquals(basicMemoryInstalled, true, "Basic Memory not installed");
      console.log("  ✅ Basic Memory installed");

      // Download generated files for inspection
      console.log("\n📥 Downloading generated files...\n");

      await session.downloadFile(
        `${WORKDIR}/.mcp.json`,
        "/tmp/test-mcp.json",
      );
      console.log("  ✅ Downloaded .mcp.json to /tmp/test-mcp.json");

      await session.downloadFile(
        `${WORKDIR}/CLAUDE.md`,
        "/tmp/test-CLAUDE.md",
      );
      console.log("  ✅ Downloaded CLAUDE.md to /tmp/test-CLAUDE.md");

      console.log("\n🎉 All tests passed!\n");
    } finally {
      // Cleanup
      if (session) {
        await session.disconnect();
      }

      // Comment out VM deletion to allow inspection
      // Uncomment to clean up after tests
      // if (await vm.exists(VM_NAME)) {
      //   await vm.delete(VM_NAME);
      // }

      console.log("\n💡 VM left running for inspection. Delete with:");
      console.log(`   tart stop ${VM_NAME} && tart delete ${VM_NAME}\n`);
    }
  },
  sanitizeOps: false,
  sanitizeResources: false,
});
