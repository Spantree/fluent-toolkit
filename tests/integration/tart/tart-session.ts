/**
 * Tart Session Wrapper
 * Provides VM command execution via `tart exec` (no SSH required)
 */

export interface TartOptions {
  vmName: string;
  verbose?: boolean;
}

export interface CommandResult {
  success: boolean;
  stdout: string;
  stderr: string;
  exitCode: number;
}

export class TartSession {
  private vmName: string;
  private verbose: boolean;
  private _connected = false;

  constructor(options: TartOptions) {
    this.vmName = options.vmName;
    this.verbose = options.verbose ?? false;
  }

  /**
   * Test VM connection
   */
  async connect(): Promise<void> {
    this.log(`Connecting to VM: ${this.vmName}...`);

    const result = await this.exec("echo 'connected'");

    if (!result.success) {
      throw new Error(`Failed to connect to VM ${this.vmName}: ${result.stderr}`);
    }

    this._connected = true;
    this.log(`✅ Connected to VM: ${this.vmName}`);
  }

  /**
   * Execute a command via tart exec and return results
   */
  async exec(command: string, timeout = 30000): Promise<CommandResult> {
    this.log(`Executing: ${command}`);

    const cmd = new Deno.Command("tart", {
      args: [
        "exec",
        this.vmName,
        "/bin/zsh",
        "-c",
        `source ~/.zshrc 2>/dev/null; ${command}`,
      ],
      stdout: "piped",
      stderr: "piped",
    });

    const process = cmd.spawn();

    // Set up timeout
    const timeoutId = setTimeout(() => {
      process.kill("SIGTERM");
    }, timeout);

    try {
      const { success, stdout, stderr, code } = await process.output();

      clearTimeout(timeoutId);

      const result = {
        success,
        stdout: new TextDecoder().decode(stdout),
        stderr: new TextDecoder().decode(stderr),
        exitCode: code,
      };

      if (this.verbose) {
        this.log(`Exit code: ${code}`);
        if (result.stdout) this.log(`stdout: ${result.stdout.substring(0, 200)}`);
        if (result.stderr) this.log(`stderr: ${result.stderr.substring(0, 200)}`);
      }

      return result;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  /**
   * Get connection status
   */
  isConnected(): boolean {
    return this._connected;
  }

  /**
   * Helper: log
   */
  private log(message: string): void {
    if (this.verbose) {
      console.log(`[Tart Session] ${message}`);
    }
  }

  /**
   * Check if file or directory exists
   */
  async fileExists(path: string): Promise<boolean> {
    const result = await this.exec(`test -e ${path} && echo exists || echo notfound`);
    return result.stdout.trim() === "exists";
  }

  /**
   * Read file contents
   */
  async readFile(path: string): Promise<string> {
    const result = await this.exec(`cat ${path}`);

    if (result.exitCode !== 0) {
      throw new Error(`Failed to read file ${path}: ${result.stderr}`);
    }

    return result.stdout;
  }

  /**
   * Write file contents
   */
  async writeFile(path: string, content: string): Promise<void> {
    // Escape single quotes in content
    const escapedContent = content.replace(/'/g, "'\\''");
    const result = await this.exec(`echo '${escapedContent}' > ${path}`);

    if (result.exitCode !== 0) {
      throw new Error(`Failed to write file ${path}: ${result.stderr}`);
    }
  }

  /**
   * Create directory
   */
  async mkdir(path: string): Promise<void> {
    const result = await this.exec(`mkdir -p ${path}`);

    if (result.exitCode !== 0) {
      throw new Error(`Failed to create directory ${path}: ${result.stderr}`);
    }
  }

  /**
   * Remove file or directory
   */
  async remove(path: string): Promise<void> {
    const result = await this.exec(`rm -rf ${path}`);

    if (result.exitCode !== 0) {
      throw new Error(`Failed to remove ${path}: ${result.stderr}`);
    }
  }

  /**
   * List directory contents
   */
  async ls(path: string): Promise<string[]> {
    const result = await this.exec(`ls -1 ${path}`);

    if (result.exitCode !== 0) {
      throw new Error(`Failed to list directory ${path}: ${result.stderr}`);
    }

    return result.stdout
      .trim()
      .split('\n')
      .filter(line => line.length > 0);
  }

  /**
   * Disconnect (cleanup)
   */
  async disconnect(): Promise<void> {
    this._connected = false;
    this.log(`Disconnected from VM: ${this.vmName}`);
  }
}
