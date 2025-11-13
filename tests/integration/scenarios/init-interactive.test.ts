/**
 * Integration Test: ftk init - interactive mode
 * Tests interactive server selection and configuration
 */

import { assertEquals } from "@std/assert";
import { TartVMHarness } from "../tart/vm-harness.ts";
import { SSHSession } from "../tart/ssh-session.ts";
import { FtkTester } from "../tart/ftk-tester.ts";

// Test configuration
const VM_NAME = "FTK-test"; // Reuse existing configured VM
const WORKDIR = "/tmp/ftk-test-interactive";

Deno.test({
  name: "ftk init - interactive mode - select core servers",
  async fn() {
    const vm = new TartVMHarness({ verbose: true });
    const tester = new FtkTester(true);
    let session: SSHSession | null = null;

    try {
      console.log("\n🚀 Starting interactive test...\n");

      // Check if VM exists and is configured
      if (!(await vm.exists(VM_NAME))) {
        throw new Error(`VM ${VM_NAME} not found. Run setup first.`);
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

      // Verify ftk is installed
      const version = await tester.getFtkVersion(session);
      console.log(`\n✅ ftk version: ${version}\n`);

      console.log("\n🧪 Running ftk init in interactive mode...\n");

      // Clean up any previous test
      await tester.cleanProject(session, WORKDIR);
      await session.exec(`mkdir -p ${WORKDIR}`);

      // Start interactive ftk init
      const interactive = await session.execInteractive(
        `cd ${WORKDIR} && ftk init`,
        { verbose: true, timeout: 120000 },
      );

      console.log("\n📋 Expecting server selection prompt...\n");

      // Wait for server selection prompt
      await interactive.expect(/Select MCP servers/, 30000);
      console.log("✅ Found server selection prompt");

      // Select all three core servers (Space, Down, Space, Down, Space)
      console.log("\n⌨️  Selecting Sequential Thinking...");
      await interactive.sendKeys(["Space"]); // Select first (Sequential Thinking)
      await interactive.sleep(500);

      console.log("⌨️  Moving to Context7...");
      await interactive.sendKeys(["Down"]); // Move to second
      await interactive.sleep(500);

      console.log("⌨️  Selecting Context7...");
      await interactive.sendKeys(["Space"]); // Select Context7
      await interactive.sleep(500);

      console.log("⌨️  Moving to Basic Memory...");
      await interactive.sendKeys(["Down"]); // Move to third
      await interactive.sleep(500);

      console.log("⌨️  Selecting Basic Memory...");
      await interactive.sendKeys(["Space"]); // Select Basic Memory
      await interactive.sleep(500);

      console.log("⌨️  Submitting selection...\n");
      await interactive.sendKeys(["Enter"]); // Submit

      // Wait for completion
      console.log("\n⏳ Waiting for setup to complete...\n");
      await interactive.expect(/Setup complete!/, 90000);

      console.log("\n✅ Setup completed successfully!\n");

      await interactive.close();

      console.log("\n🔍 Validating generated files...\n");

      // Validate .mcp.json
      const mcpValidation = await tester.validateMcpConfig(session, WORKDIR);
      assertEquals(
        mcpValidation.success,
        true,
        `MCP config validation failed: ${mcpValidation.errors.join(", ")}`,
      );
      console.log("  ✅ .mcp.json validated");

      // Validate CLAUDE.md
      const claudeMdValidation = await tester.validateClaudeMd(session, WORKDIR);
      assertEquals(
        claudeMdValidation.success,
        true,
        `CLAUDE.md validation failed: ${claudeMdValidation.errors.join(", ")}`,
      );
      console.log("  ✅ CLAUDE.md validated");

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
        "/tmp/test-interactive-mcp.json",
      );
      console.log("  ✅ Downloaded .mcp.json to /tmp/test-interactive-mcp.json");

      await session.downloadFile(
        `${WORKDIR}/CLAUDE.md`,
        "/tmp/test-interactive-CLAUDE.md",
      );
      console.log("  ✅ Downloaded CLAUDE.md to /tmp/test-interactive-CLAUDE.md");

      console.log("\n🎉 All interactive tests passed!\n");
    } finally {
      // Cleanup
      if (session) {
        await session.disconnect();
      }

      console.log("\n💡 VM left running for inspection. Delete with:");
      console.log(`   tart stop ${VM_NAME} && tart delete ${VM_NAME}\n`);
    }
  },
  sanitizeOps: false,
  sanitizeResources: false,
});
