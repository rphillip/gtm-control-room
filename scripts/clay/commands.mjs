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

export async function runClay(args) {
  if (!Array.isArray(args) || args.length === 0 || args.some((arg) => typeof arg !== 'string')) {
    throw new TypeError('Clay arguments must be a non-empty string array')
  }
  if (!ALLOWED_PREFIXES.some((prefix) => isAllowed(args, prefix))) {
    throw new Error(`Clay command is not read-only allowlisted: ${args.slice(0, 3).join(' ')}`)
  }

  const { stdout } = await execFileAsync('clay', args, { maxBuffer: 10_000_000 })
  return JSON.parse(stdout)
}
