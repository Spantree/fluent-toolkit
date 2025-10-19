/**
 * Tart VM Harness
 * Manages VM lifecycle for integration testing
 */

export interface VMInfo {
  name: string;
  running: boolean;
  ip?: string;
}

export interface TartVMOptions {
  verbose?: boolean;
}

export class TartVMHarness {
  constructor(private options: TartVMOptions = {}) {}

  /**
   * Clone a VM from a base image
   */
  async clone(baseImage: string, name: string): Promise<void> {
    this.log(`Cloning VM ${name} from ${baseImage}...`);

    // Check if VM already exists
    const exists = await this.exists(name);
    if (exists) {
      throw new Error(`VM ${name} already exists. Delete it first.`);
    }

    const cmd = new Deno.Command("tart", {
      args: ["clone", baseImage, name],
      stdout: "piped",
      stderr: "piped",
    });

    const { success, stderr } = await cmd.output();

    if (!success) {
      const error = new TextDecoder().decode(stderr);
      throw new Error(`Failed to clone VM: ${error}`);
    }

    this.log(`✅ VM ${name} cloned successfully`);
  }

  /**
   * Start a VM
   */
  async start(name: string, background = true): Promise<void> {
    this.log(`Starting VM ${name}...`);

    const args = background ? ["run", "--no-graphics", name] : ["run", name];

    const cmd = new Deno.Command("tart", {
      args,
      stdout: "piped",
      stderr: "piped",
    });

    if (background) {
      // Start in background and wait for SSH
      cmd.spawn(); // Process runs in background

      // Give it time to boot
      await this.sleep(5000);

      // Wait for SSH to be available
      const ip = await this.getIP(name);
      await this.waitForSSH(ip);

      this.log(`✅ VM ${name} started (IP: ${ip})`);
    } else {
      const { success, stderr } = await cmd.output();
      if (!success) {
        const error = new TextDecoder().decode(stderr);
        throw new Error(`Failed to start VM: ${error}`);
      }
    }
  }

  /**
   * Stop a VM
   */
  async stop(name: string): Promise<void> {
    this.log(`Stopping VM ${name}...`);

    const cmd = new Deno.Command("tart", {
      args: ["stop", name],
      stdout: "piped",
      stderr: "piped",
    });

    const { success, stderr } = await cmd.output();

    if (!success) {
      const error = new TextDecoder().decode(stderr);
      throw new Error(`Failed to stop VM: ${error}`);
    }

    this.log(`✅ VM ${name} stopped`);
  }

  /**
   * Delete a VM
   */
  async delete(name: string): Promise<void> {
    this.log(`Deleting VM ${name}...`);

    // Stop first if running
    if (await this.isRunning(name)) {
      await this.stop(name);
    }

    const cmd = new Deno.Command("tart", {
      args: ["delete", name],
      stdout: "piped",
      stderr: "piped",
    });

    const { success, stderr } = await cmd.output();

    if (!success) {
      const error = new TextDecoder().decode(stderr);
      throw new Error(`Failed to delete VM: ${error}`);
    }

    this.log(`✅ VM ${name} deleted`);
  }

  /**
   * Get VM IP address
   */
  async getIP(name: string): Promise<string> {
    const cmd = new Deno.Command("tart", {
      args: ["ip", name],
      stdout: "piped",
      stderr: "piped",
    });

    const { success, stdout, stderr } = await cmd.output();

    if (!success) {
      const error = new TextDecoder().decode(stderr);
      throw new Error(`Failed to get IP for ${name}: ${error}`);
    }

    const ip = new TextDecoder().decode(stdout).trim();
    return ip;
  }

  /**
   * Check if VM exists
   */
  async exists(name: string): Promise<boolean> {
    const vms = await this.list();
    return vms.some((vm) => vm.name === name);
  }

  /**
   * Check if VM is running
   */
  async isRunning(name: string): Promise<boolean> {
    const vms = await this.list();
    const vm = vms.find((v) => v.name === name);
    return vm?.running ?? false;
  }

  /**
   * List all VMs
   */
  async list(): Promise<VMInfo[]> {
    const cmd = new Deno.Command("tart", {
      args: ["list"],
      stdout: "piped",
      stderr: "piped",
    });

    const { success, stdout, stderr } = await cmd.output();

    if (!success) {
      const error = new TextDecoder().decode(stderr);
      throw new Error(`Failed to list VMs: ${error}`);
    }

    const output = new TextDecoder().decode(stdout);
    const lines = output.trim().split("\n").slice(1); // Skip header

    return lines.map((line) => {
      const parts = line.trim().split(/\s+/);
      return {
        name: parts[0],
        running: parts[2] === "running",
        ip: parts[3] !== "-" ? parts[3] : undefined,
      };
    });
  }

  /**
   * Execute a quick command via tart exec
   */
  async execQuick(name: string, command: string): Promise<string> {
    const cmd = new Deno.Command("tart", {
      args: ["exec", name, "/bin/zsh", "-c", `source ~/.zshrc 2>/dev/null; ${command}`],
      stdout: "piped",
      stderr: "piped",
    });

    const { success, stdout, stderr } = await cmd.output();

    if (!success) {
      const error = new TextDecoder().decode(stderr);
      throw new Error(`Command failed: ${error}`);
    }

    return new TextDecoder().decode(stdout).trim();
  }

  /**
   * Wait for SSH to be available
   */
  private async waitForSSH(ip: string, maxAttempts = 30): Promise<void> {
    for (let i = 0; i < maxAttempts; i++) {
      try {
        const cmd = new Deno.Command("ssh", {
          args: [
            "-o",
            "ConnectTimeout=2",
            "-o",
            "StrictHostKeyChecking=no",
            "-o",
            "UserKnownHostsFile=/dev/null",
            "-o",
            "LogLevel=ERROR",
            `admin@${ip}`,
            "echo 'ready'",
          ],
          stdout: "piped",
          stderr: "piped",
        });

        const { success } = await cmd.output();

        if (success) {
          return;
        }
      } catch {
        // Ignore errors, keep trying
      }

      await this.sleep(2000);
    }

    throw new Error(`SSH not available after ${maxAttempts} attempts`);
  }

  /**
   * Helper: sleep
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Helper: log
   */
  private log(message: string): void {
    if (this.options.verbose) {
      console.log(`[VM Harness] ${message}`);
    }
  }
}
