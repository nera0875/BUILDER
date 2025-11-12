// Browser Console Capture for Projects (sends to parent dashboard)
// Auto-captures all console.log/error/warn and sends via postMessage

export interface BrowserLog {
  timestamp: string
  level: 'log' | 'error' | 'warn' | 'info' | 'debug'
  message: string
  stack?: string
  url?: string
  projectName?: string
}

class BrowserConsoleIframe {
  private originalConsole = {
    log: console.log,
    error: console.error,
    warn: console.warn,
    info: console.info,
    debug: console.debug
  }

  private projectName: string

  constructor(projectName: string) {
    this.projectName = projectName
    this.interceptConsole()
    this.captureErrors()
  }

  private interceptConsole() {
    const self = this

    console.log = function(...args: any[]) {
      self.captureLog('log', args)
      self.originalConsole.log.apply(console, args)
    }

    console.error = function(...args: any[]) {
      self.captureLog('error', args)
      self.originalConsole.error.apply(console, args)
    }

    console.warn = function(...args: any[]) {
      self.captureLog('warn', args)
      self.originalConsole.warn.apply(console, args)
    }

    console.info = function(...args: any[]) {
      self.captureLog('info', args)
      self.originalConsole.info.apply(console, args)
    }

    console.debug = function(...args: any[]) {
      self.captureLog('debug', args)
      self.originalConsole.debug.apply(console, args)
    }
  }

  private captureErrors() {
    window.addEventListener('error', (event) => {
      const log: BrowserLog = {
        timestamp: new Date().toISOString(),
        level: 'error',
        message: event.message,
        stack: event.error?.stack,
        url: event.filename,
        projectName: this.projectName
      }
      this.sendToParent(log)
    })

    window.addEventListener('unhandledrejection', (event) => {
      const log: BrowserLog = {
        timestamp: new Date().toISOString(),
        level: 'error',
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
        projectName: this.projectName
      }
      this.sendToParent(log)
    })
  }

  private captureLog(level: BrowserLog['level'], args: any[]) {
    const message = args.map(arg => {
      if (typeof arg === 'object') {
        try {
          return JSON.stringify(arg, null, 2)
        } catch {
          return String(arg)
        }
      }
      return String(arg)
    }).join(' ')

    const log: BrowserLog = {
      timestamp: new Date().toISOString(),
      level,
      message,
      projectName: this.projectName
    }

    this.sendToParent(log)
  }

  private sendToParent(log: BrowserLog) {
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({
        type: 'BROWSER_CONSOLE_LOG',
        log
      }, '*')
    }
  }
}

// Auto-init if in iframe
export function initBrowserConsoleIframe(projectName?: string) {
  if (typeof window === 'undefined') return

  // Detect project name from parameter, URL path, or default
  if (!projectName) {
    // Try to get from URL path (e.g., http://ip:port/project-name)
    const pathname = window.location.pathname
    projectName = pathname.split('/')[1] || window.location.port || 'unknown'
  }

  new BrowserConsoleIframe(projectName)
}
