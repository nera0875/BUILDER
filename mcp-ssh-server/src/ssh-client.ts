import { Client } from 'ssh2';
import { readFileSync } from 'fs';

export interface SSHConfig {
  host: string;
  port: number;
  username: string;
  privateKeyPath?: string;
  password?: string;
}

export interface CommandResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  success: boolean;
}

/**
 * Execute SSH command
 */
export async function executeSSHCommand(
  config: SSHConfig,
  command: string,
  workingDir?: string
): Promise<CommandResult> {
  return new Promise((resolve, reject) => {
    const conn = new Client();

    let stdout = '';
    let stderr = '';
    let exitCode = 0;

    // Debug logging
    console.log('🔍 SSH Config:', {
      host: config.host,
      port: config.port,
      username: config.username,
      hasPassword: !!config.password,
      hasKey: !!config.privateKeyPath
    });

    conn
      .on('ready', () => {
        // Prepend cd command if workingDir specified
        const fullCommand = workingDir
          ? `cd ${workingDir} && ${command}`
          : command;

        conn.exec(fullCommand, (err, stream) => {
          if (err) {
            conn.end();
            reject(err);
            return;
          }

          stream
            .on('close', (code: number) => {
              exitCode = code;
              conn.end();

              resolve({
                stdout,
                stderr,
                exitCode,
                success: code === 0,
              });
            })
            .on('data', (data: Buffer) => {
              stdout += data.toString();
            })
            .stderr.on('data', (data: Buffer) => {
              stderr += data.toString();
            });
        });
      })
      .on('error', (err) => {
        reject(err);
      })
      .connect({
        host: config.host,
        port: config.port,
        username: config.username,
        privateKey: config.privateKeyPath
          ? readFileSync(config.privateKeyPath)
          : undefined,
        password: config.password,
      });
  });
}

/**
 * Test SSH connection
 */
export async function testSSHConnection(config: SSHConfig): Promise<boolean> {
  try {
    const result = await executeSSHCommand(config, 'echo "connection test"');
    return result.success;
  } catch (error) {
    console.error('SSH connection test failed:', error);
    return false;
  }
}
