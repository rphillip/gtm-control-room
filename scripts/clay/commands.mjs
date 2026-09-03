import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)
const ALLOWED_PREFIXES = [
  ['whoami'],
  ['workbooks', 'list'],
  ['tables', 'list'],
  ['tables', 'get'],
  ['tables', 'columns', 'get'],
  ['tables', 'rows', 'list'],
  ['tables', 'query-live'],
  ['signals', 'list'],
  ['signals', 'get'],
  ['functions', 'list'],
  ['functions', 'get'],
  ['workflows', 'list'],
  ['workflows', 'graph', 'get'],
  ['campaigns', 'list'],
]

function isAllowed(args, prefix) {
  return args.length >= prefix.length && prefix.every((part, index) => args[index] === part)
}

export function createClayRunner(execute = execFileAsync) {
  return async function runClayCommand(args) {
    if (!Array.isArray(args) || args.length === 0 || args.some((arg) => typeof arg !== 'string')) {
      throw new TypeError('Clay arguments must be a non-empty string array')
    }
    const allowedPrefix = ALLOWED_PREFIXES.find((prefix) => isAllowed(args, prefix))
    if (!allowedPrefix) throw new Error('Clay command is not read-only allowlisted')

    try {
      const { stdout } = await execute('clay', args, { maxBuffer: 10_000_000 })
      return JSON.parse(stdout)
    } catch {
      throw new Error(`Clay read failed for ${allowedPrefix.join(' ')}`)
    }
  }
}

export const runClay = createClayRunner()
