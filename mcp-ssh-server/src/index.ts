import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import express from 'express';
import { randomUUID } from 'crypto';
import dotenv from 'dotenv';
import { requireAuth, isCommandAllowed } from './auth.js';
import { executeSSHCommand, testSSHConnection, SSHConfig } from './ssh-client.js';

// Load environment variables
dotenv.config();

const PORT = parseInt(process.env.PORT || '3000');
const HOST = process.env.HOST || '0.0.0.0';

// Default SSH config
const DEFAULT_SSH_CONFIG: SSHConfig = {
  host: process.env.DEFAULT_SSH_HOST || '89.116.27.88',
  port: parseInt(process.env.DEFAULT_SSH_PORT || '22'),
  username: process.env.DEFAULT_SSH_USER || 'pilote',
  privateKeyPath: process.env.SSH_PRIVATE_KEY_PATH,
  password: process.env.DEFAULT_SSH_PASSWORD,
};

// Express app
const app = express();
app.use(express.json());

// Store transports by session ID
const transports: Map<string, StreamableHTTPServerTransport> = new Map();

// Health check endpoint (no auth required)
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    version: '1.0.0',
    protocol: 'MCP/2025-06-18',
  });
});

// HEAD endpoint for protocol discovery
app.head('/', (req, res) => {
  res.setHeader('MCP-Protocol-Version', '2025-06-18');
  res.status(200).end();
});

// POST endpoint - handle client-to-server communication (requires auth)
app.post('/', requireAuth, async (req, res) => {
  const sessionId = req.headers['mcp-session-id'] as string | undefined;
  let transport: StreamableHTTPServerTransport;

  if (sessionId && transports.has(sessionId)) {
    // Reuse existing transport
    transport = transports.get(sessionId)!;
  } else if (!sessionId) {
    // New session - create transport
    transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => randomUUID(),
      onsessioninitialized: (newSessionId) => {
        transports.set(newSessionId, transport);
        console.log(`✅ Session initialized: ${newSessionId}`);
      },
    });

    // Clean up on close
    transport.onclose = () => {
      if (transport.sessionId) {
        transports.delete(transport.sessionId);
        console.log(`🔌 Session closed: ${transport.sessionId}`);
      }
    };

    // Create MCP server instance
    const server = new Server(
      {
        name: 'mcp-ssh-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // Register tools
    server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'ssh_exec_command',
          description: 'Execute a command via SSH on the remote Linux server',
          inputSchema: {
            type: 'object',
            properties: {
              command: {
                type: 'string',
                description: 'The shell command to execute',
              },
              working_dir: {
                type: 'string',
                description: 'Optional working directory',
              },
              ssh_host: {
                type: 'string',
                description: 'Override SSH host (optional)',
              },
              ssh_port: {
                type: 'number',
                description: 'Override SSH port (optional)',
              },
              ssh_user: {
                type: 'string',
                description: 'Override SSH username (optional)',
              },
            },
            required: ['command'],
          },
        },
        {
          name: 'write_remote_file',
          description: 'Write content to a file on the remote server (creates or overwrites)',
          inputSchema: {
            type: 'object',
            properties: {
              path: {
                type: 'string',
                description: 'Absolute path to the file',
              },
              content: {
                type: 'string',
                description: 'File content to write',
              },
              mode: {
                type: 'string',
                description: 'File permissions (e.g., "644", "755"). Default: 644',
              },
            },
            required: ['path', 'content'],
          },
        },
        {
          name: 'read_remote_file',
          description: 'Read content from a file on the remote server',
          inputSchema: {
            type: 'object',
            properties: {
              path: {
                type: 'string',
                description: 'Absolute path to the file',
              },
            },
            required: ['path'],
          },
        },
        {
          name: 'edit_remote_file',
          description: 'Replace exact string match in a remote file (like str_replace)',
          inputSchema: {
            type: 'object',
            properties: {
              path: {
                type: 'string',
                description: 'Absolute path to the file',
              },
              old_string: {
                type: 'string',
                description: 'Exact string to replace',
              },
              new_string: {
                type: 'string',
                description: 'Replacement string',
              },
            },
            required: ['path', 'old_string', 'new_string'],
          },
        },
        {
          name: 'exec_batch',
          description: 'Execute multiple commands in sequence or parallel, returns structured results',
          inputSchema: {
            type: 'object',
            properties: {
              commands: {
                type: 'array',
                items: { type: 'string' },
                description: 'Array of commands to execute',
              },
              parallel: {
                type: 'boolean',
                description: 'Execute commands in parallel (default: false)',
              },
              working_dir: {
                type: 'string',
                description: 'Working directory for all commands',
              },
            },
            required: ['commands'],
          },
        },
        {
          name: 'list_remote_files',
          description: 'List files in a directory with optional glob pattern',
          inputSchema: {
            type: 'object',
            properties: {
              path: {
                type: 'string',
                description: 'Directory path to list',
              },
              pattern: {
                type: 'string',
                description: 'Glob pattern (e.g., "*.js", "**/*.tsx")',
              },
              recursive: {
                type: 'boolean',
                description: 'Recursive listing (default: false)',
              },
              skip_errors: {
                type: 'boolean',
                description: 'Skip permission denied errors (default: false)',
              },
            },
            required: ['path'],
          },
        },
      ],
    }));

    // Handle tool execution
    server.setRequestHandler(CallToolRequestSchema, async (request) => {
      if (request.params.name === 'ssh_exec_command') {
        const { command, working_dir, ssh_host, ssh_port, ssh_user } = request.params.arguments as any;

        // Validate command
        const validation = isCommandAllowed(command);
        if (!validation.allowed) {
          return {
            content: [
              {
                type: 'text',
                text: `❌ Command blocked: ${validation.reason}`,
              },
            ],
          };
        }

        // Build SSH config (use overrides if provided)
        const sshConfig: SSHConfig = {
          host: ssh_host || DEFAULT_SSH_CONFIG.host,
          port: ssh_port || DEFAULT_SSH_CONFIG.port,
          username: ssh_user || DEFAULT_SSH_CONFIG.username,
          privateKeyPath: DEFAULT_SSH_CONFIG.privateKeyPath,
          password: DEFAULT_SSH_CONFIG.password,
        };

        try {
          const result = await executeSSHCommand(sshConfig, command, working_dir);

          return {
            content: [
              {
                type: 'text',
                text: `
📡 SSH Command Executed

🔧 Command: ${command}
📂 Working Dir: ${working_dir || '(default)'}
🖥️  Host: ${sshConfig.host}:${sshConfig.port}

✅ Exit Code: ${result.exitCode}

📤 STDOUT:
${result.stdout || '(empty)'}

📥 STDERR:
${result.stderr || '(empty)'}

${result.success ? '✅ Success' : '❌ Failed'}
`,
              },
            ],
          };
        } catch (error: any) {
          return {
            content: [
              {
                type: 'text',
                text: `❌ SSH Error: ${error.message}`,
              },
            ],
            isError: true,
          };
        }
      }

      // write_remote_file
      if (request.params.name === 'write_remote_file') {
        const { path, content, mode } = request.params.arguments as any;
        const sshConfig: SSHConfig = { ...DEFAULT_SSH_CONFIG };

        try {
          // Escape content for heredoc
          const escapedContent = content.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$');
          const chmodCmd = mode ? ` && chmod ${mode} "${path}"` : '';
          const command = `cat > "${path}" << 'EOFMCP'\n${content}\nEOFMCP${chmodCmd}`;

          const result = await executeSSHCommand(sshConfig, command);

          if (result.success) {
            return {
              content: [{
                type: 'text',
                text: `✅ File written: ${path}\n📏 Size: ${content.length} bytes${mode ? `\n🔒 Mode: ${mode}` : ''}`,
              }],
            };
          } else {
            return {
              content: [{
                type: 'text',
                text: `❌ Failed to write file: ${result.stderr}`,
              }],
              isError: true,
            };
          }
        } catch (error: any) {
          return {
            content: [{ type: 'text', text: `❌ Error: ${error.message}` }],
            isError: true,
          };
        }
      }

      // read_remote_file
      if (request.params.name === 'read_remote_file') {
        const { path } = request.params.arguments as any;
        const sshConfig: SSHConfig = { ...DEFAULT_SSH_CONFIG };

        try {
          const result = await executeSSHCommand(sshConfig, `cat "${path}"`);

          if (result.success) {
            return {
              content: [{
                type: 'text',
                text: `📄 File: ${path}\n📏 Size: ${result.stdout.length} bytes\n\n${result.stdout}`,
              }],
            };
          } else {
            return {
              content: [{
                type: 'text',
                text: `❌ Failed to read file: ${result.stderr}`,
              }],
              isError: true,
            };
          }
        } catch (error: any) {
          return {
            content: [{ type: 'text', text: `❌ Error: ${error.message}` }],
            isError: true,
          };
        }
      }

      // edit_remote_file
      if (request.params.name === 'edit_remote_file') {
        const { path, old_string, new_string } = request.params.arguments as any;
        const sshConfig: SSHConfig = { ...DEFAULT_SSH_CONFIG };

        try {
          // Use Perl for exact string replacement (handles multiline better than sed)
          const perlCmd = `perl -i -pe 's/\\Q${old_string.replace(/\\/g, '\\\\').replace(/'/g, "'\\''")}\\E/${new_string.replace(/\\/g, '\\\\').replace(/'/g, "'\\''")}/g' "${path}"`;
          const result = await executeSSHCommand(sshConfig, perlCmd);

          if (result.success) {
            return {
              content: [{
                type: 'text',
                text: `✅ File edited: ${path}\n🔄 Replaced: ${old_string.length} → ${new_string.length} chars`,
              }],
            };
          } else {
            return {
              content: [{
                type: 'text',
                text: `❌ Failed to edit file: ${result.stderr}`,
              }],
              isError: true,
            };
          }
        } catch (error: any) {
          return {
            content: [{ type: 'text', text: `❌ Error: ${error.message}` }],
            isError: true,
          };
        }
      }

      // exec_batch
      if (request.params.name === 'exec_batch') {
        const { commands, parallel, working_dir } = request.params.arguments as any;
        const sshConfig: SSHConfig = { ...DEFAULT_SSH_CONFIG };

        try {
          if (parallel) {
            // Execute all commands in parallel
            const results = await Promise.all(
              commands.map((cmd: string) => executeSSHCommand(sshConfig, cmd, working_dir))
            );

            const summary = results.map((r, i) => ({
              command: commands[i],
              exitCode: r.exitCode,
              stdout: r.stdout,
              stderr: r.stderr,
              success: r.success,
            }));

            return {
              content: [{
                type: 'text',
                text: `✅ Batch executed (parallel)\n📊 Results:\n${JSON.stringify(summary, null, 2)}`,
              }],
            };
          } else {
            // Execute commands sequentially
            const results = [];
            for (const cmd of commands) {
              const result = await executeSSHCommand(sshConfig, cmd, working_dir);
              results.push({
                command: cmd,
                exitCode: result.exitCode,
                stdout: result.stdout,
                stderr: result.stderr,
                success: result.success,
              });

              // Stop on first failure in sequential mode
              if (!result.success) break;
            }

            return {
              content: [{
                type: 'text',
                text: `✅ Batch executed (sequential)\n📊 Results:\n${JSON.stringify(results, null, 2)}`,
              }],
            };
          }
        } catch (error: any) {
          return {
            content: [{ type: 'text', text: `❌ Error: ${error.message}` }],
            isError: true,
          };
        }
      }

      // list_remote_files
      if (request.params.name === 'list_remote_files') {
        const { path, pattern, recursive, skip_errors } = request.params.arguments as any;
        const sshConfig: SSHConfig = { ...DEFAULT_SSH_CONFIG };

        try {
          let command = recursive ? `find "${path}"` : `find "${path}" -maxdepth 1`;
          if (pattern) {
            command += ` -name "${pattern}"`;
          }
          command += ' -type f';

          // Skip permission denied errors
          if (skip_errors) {
            command += ' 2>/dev/null';
          }

          const result = await executeSSHCommand(sshConfig, command);

          if (result.success) {
            const files = result.stdout.trim().split('\n').filter(f => f);
            return {
              content: [{
                type: 'text',
                text: `📁 Directory: ${path}\n📊 Found: ${files.length} files\n\n${files.join('\n')}`,
              }],
            };
          } else {
            return {
              content: [{
                type: 'text',
                text: `❌ Failed to list files: ${result.stderr}`,
              }],
              isError: true,
            };
          }
        } catch (error: any) {
          return {
            content: [{ type: 'text', text: `❌ Error: ${error.message}` }],
            isError: true,
          };
        }
      }

      return {
        content: [
          {
            type: 'text',
            text: `Unknown tool: ${request.params.name}`,
          },
        ],
        isError: true,
      };
    });

    // Connect server to transport
    await server.connect(transport);
  } else {
    // Invalid request
    res.status(400).json({
      jsonrpc: '2.0',
      error: {
        code: -32000,
        message: 'Invalid session',
      },
      id: null,
    });
    return;
  }

  // Handle the request
  await transport.handleRequest(req, res, req.body);
});

// GET endpoint - handle server-to-client notifications via SSE (requires auth)
app.get('/', requireAuth, async (req, res) => {
  const sessionId = req.headers['mcp-session-id'] as string | undefined;

  if (!sessionId || !transports.has(sessionId)) {
    res.status(400).send('Invalid or missing session ID');
    return;
  }

  const transport = transports.get(sessionId)!;
  await transport.handleRequest(req, res);
});

// DELETE endpoint - session termination (requires auth)
app.delete('/', requireAuth, async (req, res) => {
  const sessionId = req.headers['mcp-session-id'] as string | undefined;

  if (!sessionId || !transports.has(sessionId)) {
    res.status(400).send('Invalid or missing session ID');
    return;
  }

  const transport = transports.get(sessionId)!;
  await transport.handleRequest(req, res);
});

// Start server
app.listen(PORT, HOST, async () => {
  console.log(`
🚀 MCP SSH Server Started

📡 Listening: ${HOST}:${PORT}
🔐 Auth: Bearer token required
🔑 Token configured: ${process.env.BEARER_TOKEN ? '✅' : '❌'}

🖥️  Default SSH Target:
   Host: ${DEFAULT_SSH_CONFIG.host}:${DEFAULT_SSH_CONFIG.port}
   User: ${DEFAULT_SSH_CONFIG.username}
   Key: ${DEFAULT_SSH_CONFIG.privateKeyPath}

🛡️  Security:
   Allowed commands: ${process.env.ALLOWED_COMMANDS || 'ALL (⚠️  configure whitelist!)'}
   Blocked commands: ${process.env.BLOCKED_COMMANDS || 'NONE'}

📋 Endpoints:
   HEAD / → Protocol discovery
   GET /health → Health check
   POST / → Client messages (auth required)
   GET / → SSE stream (auth required)
   DELETE / → Session termination (auth required)
  `);

  // Test SSH connection
  console.log('🔍 Testing SSH connection...');
  const connected = await testSSHConnection(DEFAULT_SSH_CONFIG);
  if (connected) {
    console.log('✅ SSH connection successful\n');
  } else {
    console.log('❌ SSH connection failed - check configuration\n');
  }
});
