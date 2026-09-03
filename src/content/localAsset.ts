function assertRootLocalPath(value: string, label: 'asset' | 'base') {
  let decoded = value
  try {
    for (let remaining = value.length; remaining > 0; remaining -= 1) {
      const next = decodeURIComponent(decoded)
      if (next === decoded) break
      decoded = next
    }
  } catch {
    throw new Error(`Invalid local ${label} path`)
  }

  const pathname = decoded.split(/[?#]/, 1)[0]
  const hasTraversal = pathname.replaceAll('\\', '/').split('/').includes('..')
  if (!value.startsWith('/') || value.startsWith('//') || decoded.includes('\\') || hasTraversal) {
    throw new Error(`Invalid local ${label} path`)
  }
}

export function resolveLocalAsset(src: string, baseUrl = import.meta.env.BASE_URL) {
  assertRootLocalPath(src, 'asset')
  assertRootLocalPath(baseUrl, 'base')
  if (/[?#]/.test(baseUrl)) throw new Error('Invalid local base path')

  const base = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`
  return `${base}${src.slice(1)}`
}
