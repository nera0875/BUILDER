import { Request, Response, NextFunction } from 'express';

/**
 * Bearer token authentication middleware with query string fallback
 * Supports both:
 * - Authorization: Bearer <token> header (standard)
 * - ?token=<token> query parameter (fallback for Claude.ai bug)
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const expectedToken = process.env.BEARER_TOKEN;

  if (!expectedToken) {
    console.error('⚠️  BEARER_TOKEN not configured in environment');
    res.status(500).json({
      jsonrpc: '2.0',
      error: {
        code: -32603,
        message: 'Server configuration error',
      },
      id: null,
    });
    return;
  }

  let token: string | undefined;

  // Try 1: Authorization header (standard)
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const [scheme, headerToken] = authHeader.split(' ');
    if (scheme === 'Bearer' && headerToken) {
      token = headerToken;
      console.log('🔐 Auth via header');
    }
  }

  // Try 2: Query string (fallback for Claude.ai)
  if (!token && req.query.token) {
    token = req.query.token as string;
    console.log('🔐 Auth via query string (fallback)');
  }

  // No token found
  if (!token) {
    console.warn('❌ Auth failed: No token in header or query');
    res.status(401).json({
      jsonrpc: '2.0',
      error: {
        code: -32000,
        message: 'Missing authentication. Provide Authorization header or ?token= query parameter',
      },
      id: null,
    });
    return;
  }

  // Validate token
  if (token !== expectedToken) {
    console.warn('❌ Auth failed: Invalid token');
    res.status(403).json({
      jsonrpc: '2.0',
      error: {
        code: -32000,
        message: 'Invalid token',
      },
      id: null,
    });
    return;
  }

  // Token valid - attach to request for downstream use
  console.log('✅ Auth successful');
  (req as any).authToken = token;
  next();
}

/**
 * Validate command against allowed/blocked lists
 */
export function isCommandAllowed(command: string): { allowed: boolean; reason?: string } {
  const allowedCommands = process.env.ALLOWED_COMMANDS?.split(',').map(c => c.trim()) || [];
  const blockedCommands = process.env.BLOCKED_COMMANDS?.split(',').map(c => c.trim()) || [];

  // Check blocked commands first (security priority)
  for (const blocked of blockedCommands) {
    if (command.includes(blocked)) {
      return { allowed: false, reason: `Command contains blocked pattern: ${blocked}` };
    }
  }

  // If allowed list is empty, allow all (except blocked)
  if (allowedCommands.length === 0) {
    return { allowed: true };
  }

  // Check if command starts with any allowed pattern
  const isAllowed = allowedCommands.some(allowed =>
    command.startsWith(allowed) || command.includes(allowed)
  );

  if (!isAllowed) {
    return { allowed: false, reason: 'Command not in allowed list' };
  }

  return { allowed: true };
}
