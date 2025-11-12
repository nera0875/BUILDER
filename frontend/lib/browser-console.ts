// Browser Console Capture Utility
// Captures all console.log/error/warn from client-side and sends to backend

export interface BrowserLog {
  timestamp: string
  level: 'log' | 'error' | 'warn' | 'info' | 'debug'
  message: string
  stack?: string
  url?: string
  projectName?: string
}

class BrowserConsoleCapture {
  private originalConsole = {
    log: console.log,
    error: console.error,
    warn: console.warn,
    info: console.info,
    debug: console.debug
  }

  private logs: BrowserLog[] = []
  private maxLogs = 1000
  private subscribers: ((log: BrowserLog) => void)[] = []

  constructor() {
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
        url: event.filename
      }
      this.addLog(log)
    })

    window.addEventListener('unhandledrejection', (event) => {
      const log: BrowserLog = {
        timestamp: new Date().toISOString(),
        level: 'error',
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack
      }
      this.addLog(log)
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
      message
    }

    this.addLog(log)
  }

  private addLog(log: BrowserLog) {
    this.logs.push(log)
    if (this.logs.length > this.maxLogs) {
      this.logs.shift()
    }

    // Notify subscribers
    this.subscribers.forEach(callback => callback(log))
  }

  public subscribe(callback: (log: BrowserLog) => void) {
    this.subscribers.push(callback)
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback)
    }
  }

  public getLogs() {
    return [...this.logs]
  }

  public clearLogs() {
    this.logs = []
  }
}

// Singleton instance
let instance: BrowserConsoleCapture | null = null

export function initBrowserConsoleCapture() {
  if (typeof window === 'undefined') return null
  if (!instance) {
    instance = new BrowserConsoleCapture()
  }
  return instance
}

export function getBrowserConsoleInstance() {
  return instance
}
