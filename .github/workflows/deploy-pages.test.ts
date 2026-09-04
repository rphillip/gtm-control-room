import { readFile } from 'node:fs/promises'

import { describe, expect, it } from 'vitest'

function assertImmutableActionRefs(workflow: string) {
  const uses = [...workflow.matchAll(/^\s*uses:\s+([^@\s]+)@([^\s#]+)(?:\s+#\s+(v\d+\.\d+\.\d+))?\s*$/gm)]
  if (uses.length === 0) throw new Error('Workflow has no pinned actions')

  for (const [, action, ref] of uses) {
    if (!/^[0-9a-f]{40}$/.test(ref)) {
      throw new Error(`Mutable action reference: ${action}@${ref}`)
    }
  }

  if (uses.some(([, , , version]) => version === undefined)) throw new Error('Action version provenance is missing')
}

describe('GitHub Actions supply-chain pins', () => {
  it('uses full immutable SHAs with version provenance comments', async () => {
    const workflow = await readFile('.github/workflows/deploy-pages.yml', 'utf8')

    expect(() => assertImmutableActionRefs(workflow)).not.toThrow()
  })

  it('rejects mutable action references', () => {
    expect(() => assertImmutableActionRefs('steps:\n    uses: actions/checkout@v6 # v6.0.2\n')).toThrow(
      /mutable action reference/i,
    )
  })
})
