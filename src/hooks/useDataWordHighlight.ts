import { useEffect } from 'react'

type HighlightRegistry = {
  delete(name: string): void
  set(name: string, highlight: unknown): void
}

type HighlightWindow = Window & typeof globalThis & {
  Highlight?: new (...ranges: Range[]) => unknown
}

type HighlightCSS = typeof CSS & {
  highlights?: HighlightRegistry
}

const highlightName = 'themed-data'
const dataWord = /\bdata\b/gi

export function useDataWordHighlight() {
  useEffect(() => {
    const HighlightConstructor = (window as HighlightWindow).Highlight
    const registry = (CSS as HighlightCSS).highlights
    const root = document.body
    if (!HighlightConstructor || !registry || !root) return

    let animationFrame = 0

    const refresh = () => {
      animationFrame = 0
      const ranges: Range[] = []
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
          const parent = node.parentElement
          if (!parent || parent.closest('script, style, noscript, textarea')) return NodeFilter.FILTER_REJECT
          dataWord.lastIndex = 0
          return dataWord.test(node.textContent ?? '') ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT
        },
      })

      let node = walker.nextNode()
      while (node) {
        const text = node.textContent ?? ''
        dataWord.lastIndex = 0
        for (const match of text.matchAll(dataWord)) {
          const start = match.index
          const range = document.createRange()
          range.setStart(node, start)
          range.setEnd(node, start + match[0].length)
          ranges.push(range)
        }
        node = walker.nextNode()
      }

      registry.set(highlightName, new HighlightConstructor(...ranges))
    }

    const scheduleRefresh = () => {
      if (!animationFrame) animationFrame = window.requestAnimationFrame(refresh)
    }

    const observer = new MutationObserver(scheduleRefresh)
    observer.observe(root, { childList: true, characterData: true, subtree: true })
    refresh()

    return () => {
      observer.disconnect()
      if (animationFrame) window.cancelAnimationFrame(animationFrame)
      registry.delete(highlightName)
    }
  }, [])
}
