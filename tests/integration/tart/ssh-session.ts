/**
 * SSH Session Wrapper
 * Provides SSH connection and command execution capabilities
 */

export interface SSHOptions {
  user?: string;
  port?: number;
  verbose?: boolean;
}

export interface CommandResult {
  success: boolean;
  stdout: string;
  stderr: string;
  exitCode: number;
}

export interface InteractiveSessionOptions {
  timeout?: number;
  verbose?: boolean;
}

export class SSHSession {
  private ip: string;
  private user: string;
  private _port: number;
  private verbose: boolean;
  private _connected = false;

  constructor(ip: string, options: SSHOptions = {}) {
    this.ip = ip;
    this.user = options.user || "admin";
    this._port = options.port || 22;
    this.verbose = options.verbose ?? false;
  }

  /**
   * Test SSH connection
   */
  async connect(): Promise<void> {
    this.log(`Connecting to ${this.user}@${this.ip}...`);

    const result = await this.exec("echo 'connected'");

    if (!result.success) {
      throw new Error(`Failed to connect: ${result.stderr}`);
    }

    this._connected = true;
    this.log(`✅ Connected to ${this.user}@${this.ip}`);
  }

  /**
   * Execute a command and return results
   */
  async exec(command: string, timeout = 30000): Promise<CommandResult> {
    this.log(`Executing: ${command}`);

    const cmd = new Deno.Command("ssh", {
      args: [
        "-o",
        "ConnectTimeout=5",
        "-o",
        "StrictHostKeyChecking=no",
        "-o",
        "UserKnownHostsFile=/dev/null",
        "-o",
        "LogLevel=ERROR",
        `${this.user}@${this.ip}`,
        `/bin/zsh -c 'source ~/.zshrc 2>/dev/null; ${command}'`,
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
   * Start an interactive session
   */
  async execInteractive(
    command: string,
    options: InteractiveSessionOptions = {},
  ): Promise<InteractiveSession> {
    this.log(`Starting interactive session: ${command}`);

    const session = new InteractiveSession(
      this.ip,
      this.user,
      command,
      options,
    );

    await session.start();

    return session;
  }

  /**
   * Upload a file to the VM
   */
  async uploadFile(localPath: string, remotePath: string): Promise<void> {
    this.log(`Uploading ${localPath} to ${remotePath}...`);

    const cmd = new Deno.Command("scp", {
      args: [
        "-o",
        "StrictHostKeyChecking=no",
        "-o",
        "UserKnownHostsFile=/dev/null",
        "-o",
        "LogLevel=ERROR",
        localPath,
        `${this.user}@${this.ip}:${remotePath}`,
      ],
      stdout: "piped",
      stderr: "piped",
    });

    const { success, stderr } = await cmd.output();

    if (!success) {
      const error = new TextDecoder().decode(stderr);
      throw new Error(`Failed to upload file: ${error}`);
    }

    this.log(`✅ File uploaded`);
  }

  /**
   * Download a file from the VM
   */
  async downloadFile(remotePath: string, localPath: string): Promise<void> {
    this.log(`Downloading ${remotePath} to ${localPath}...`);

    const cmd = new Deno.Command("scp", {
      args: [
        "-o",
        "StrictHostKeyChecking=no",
        "-o",
        "UserKnownHostsFile=/dev/null",
        "-o",
        "LogLevel=ERROR",
        `${this.user}@${this.ip}:${remotePath}`,
        localPath,
      ],
      stdout: "piped",
      stderr: "piped",
    });

    const { success, stderr } = await cmd.output();

    if (!success) {
      const error = new TextDecoder().decode(stderr);
      throw new Error(`Failed to download file: ${error}`);
    }

    this.log(`✅ File downloaded`);
  }

  /**
   * Get connection status
   */
  isConnected(): boolean {
    return this._connected;
  }

  /**
   * Get port number
   */
  getPort(): number {
    return this._port;
  }

  /**
   * Helper: log
   */
  private log(message: string): void {
    if (this.verbose) {
      console.log(`[SSH Session] ${message}`);
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
    this.log(`Disconnected from ${this.user}@${this.ip}`);
  }
}

/**
 * Interactive SSH Session
 * Allows sending input and expecting output patterns
 */
export class InteractiveSession {
  private process?: Deno.ChildProcess;
  private stdout: ReadableStreamDefaultReader<Uint8Array> | null = null;
  private stdin: WritableStreamDefaultWriter<Uint8Array> | null = null;
  private buffer = "";
  private verbose: boolean;
  private defaultTimeout: number;

  constructor(
    private ip: string,
    private user: string,
    private command: string,
    options: InteractiveSessionOptions = {},
  ) {
    this.verbose = options.verbose ?? false;
    this.defaultTimeout = options.timeout ?? 30000;
  }

  /**
   * Start the interactive session
   */
  async start(): Promise<void> {
    this.log(`Starting: ${this.command}`);

    const cmd = new Deno.Command("ssh", {
      args: [
        "-tt", // Force pseudo-terminal
        "-o",
        "StrictHostKeyChecking=no",
        "-o",
        "UserKnownHostsFile=/dev/null",
        "-o",
        "LogLevel=ERROR",
        `${this.user}@${this.ip}`,
        `/bin/zsh -c 'source ~/.zshrc 2>/dev/null; ${this.command}'`,
      ],
      stdin: "piped",
      stdout: "piped",
      stderr: "piped",
    });

    this.process = cmd.spawn();

    if (!this.process.stdout || !this.process.stdin) {
      throw new Error("Failed to create interactive session");
    }

    this.stdout = this.process.stdout.getReader();
    this.stdin = this.process.stdin.getWriter();

    // Start reading in background
    this.startReading();

    // Give it a moment to start
    await this.sleep(500);
  }

  /**
   * Send text (no newline)
   */
  async send(text: string): Promise<void> {
    if (!this.stdin) {
      throw new Error("Session not started");
    }

    this.log(`Sending: ${text}`);
    await this.stdin.write(new TextEncoder().encode(text));
  }

  /**
   * Send text with newline
   */
  async sendLine(text: string): Promise<void> {
    await this.send(text + "\n");
  }

  /**
   * Send special keys
   */
  async sendKeys(keys: string[]): Promise<void> {
    for (const key of keys) {
      let code: string;

      switch (key) {
        case "Enter":
          code = "\n";
          break;
        case "Ctrl-C":
          code = "\x03";
          break;
        case "Ctrl-D":
          code = "\x04";
          break;
        case "Tab":
          code = "\t";
          break;
        case "Escape":
          code = "\x1b";
          break;
        case "Up":
          code = "\x1b[A";
          break;
        case "Down":
          code = "\x1b[B";
          break;
        case "Right":
          code = "\x1b[C";
          break;
        case "Left":
          code = "\x1b[D";
          break;
        case "Space":
          code = " ";
          break;
        default:
          code = key;
      }

      this.log(`Sending key: ${key}`);
      await this.send(code);
      await this.sleep(100); // Brief pause between keys
    }
  }

  /**
   * Expect a pattern in the output
   */
  async expect(pattern: RegExp | string, timeout?: number): Promise<string> {
    const timeoutMs = timeout ?? this.defaultTimeout;
    const regex = typeof pattern === "string" ? new RegExp(pattern) : pattern;

    this.log(`Expecting pattern: ${regex}`);

    const startTime = Date.now();

    while (Date.now() - startTime < timeoutMs) {
      const match = regex.exec(this.buffer);

      if (match) {
        this.log(`✅ Pattern matched: ${match[0].substring(0, 50)}`);
        return match[0];
      }

      await this.sleep(100);
    }

    throw new Error(
      `Timeout waiting for pattern: ${regex}\nBuffer: ${this.buffer.substring(0, 500)}`,
    );
  }

  /**
   * Read all available output
   */
  async read(timeout = 1000): Promise<string> {
    const before = this.buffer;
    await this.sleep(timeout);
    const output = this.buffer.substring(before.length);

    this.log(`Read: ${output.substring(0, 200)}`);

    return output;
  }

  /**
   * Check if session is still alive
   */
  isAlive(): boolean {
    return this.process !== undefined && this.stdout !== null;
  }

  /**
   * Close the session
   */
  async close(): Promise<void> {
    this.log("Closing session");

    if (this.stdin) {
      try {
        await this.stdin.close();
      } catch {
        // Ignore
      }
    }

    if (this.stdout) {
      try {
        await this.stdout.cancel();
      } catch {
        // Ignore
      }
    }

    if (this.process) {
      try {
        this.process.kill("SIGTERM");
        await this.process.status;
      } catch {
        // Ignore
      }
    }

    this.process = undefined;
    this.stdout = null;
    this.stdin = null;
  }

  /**
   * Start reading from stdout in background
   */
  private startReading(): void {
    (async () => {
      try {
        while (this.stdout) {
          const { done, value } = await this.stdout.read();

          if (done) break;

          const chunk = new TextDecoder().decode(value);
          this.buffer += chunk;

          if (this.verbose) {
            console.log(`[Interactive] ${chunk}`);
          }
        }
      } catch (error) {
        if (this.verbose) {
          console.error(`[Interactive] Read error:`, error);
        }
      }
    })();
  }

  /**
   * Helper: sleep
   */
  sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Helper: log
   */
  private log(message: string): void {
    if (this.verbose) {
      console.log(`[Interactive] ${message}`);
    }
  }
}
