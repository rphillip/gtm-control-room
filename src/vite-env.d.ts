/// <reference types="vite/client" />

declare module 'virtual:public-clay-snapshot' {
  import type { PublicClaySnapshot } from './content/types'

  const snapshot: PublicClaySnapshot | undefined
  export default snapshot
}
