import { useEffect } from 'react'
import { useAppUpdateStore } from '../store/appUpdateStore'

function getInitialMainScript(): string | null {
  if (typeof document === 'undefined') return null
  const script = document.querySelector('script[src*="/assets/index-"]')
  return script?.getAttribute('src') ?? null
}

export function useAppUpdateListener() {
  const setUpdateAvailable = useAppUpdateStore(s => s.setUpdateAvailable)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const initialScript = getInitialMainScript()

    const checkForUpdates = async () => {
      // 1. Service Worker check
      if ('serviceWorker' in navigator) {
        try {
          const reg = await navigator.serviceWorker.getRegistration()
          if (reg) {
            if (reg.waiting) {
              setUpdateAvailable(true)
              return
            }
            await reg.update()
            if (reg.waiting) {
              setUpdateAvailable(true)
              return
            }
          }
        } catch {
          // Network errors during check are swallowed safely
        }
      }

      // 2. Fresh index.html check for new script bundle hash
      if (initialScript) {
        try {
          const res = await fetch(`/?_trk_check=${Date.now()}`, {
            cache: 'no-store',
            headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' },
          })
          if (res.ok) {
            const html = await res.text()
            const match = html.match(/src="(\/assets\/index-[^"]+\.js)"/)
            if (match && match[1] && match[1] !== initialScript) {
              setUpdateAvailable(true)
              return
            }
          }
        } catch {
          // Network errors during check are swallowed safely
        }
      }
    }

    // Delay initial check slightly so startup is uninterrupted
    const initTimer = window.setTimeout(() => {
      void checkForUpdates()
    }, 4000)

    // Check periodically every 45 seconds
    const interval = window.setInterval(() => {
      void checkForUpdates()
    }, 45000)

    // Check on window focus and tab visibility change
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void checkForUpdates()
      }
    }
    document.addEventListener('visibilitychange', onVisibilityChange)
    window.addEventListener('focus', checkForUpdates)

    // Listen to service worker registration updatefound
    let cleanUpSw: (() => void) | undefined
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then(reg => {
        if (!reg) return
        if (reg.waiting) {
          setUpdateAvailable(true)
          return
        }
        const onUpdateFound = () => {
          const installing = reg.installing
          if (!installing) return
          installing.addEventListener('statechange', () => {
            if (installing.state === 'installed' && navigator.serviceWorker.controller) {
              setUpdateAvailable(true)
            }
          })
        }
        reg.addEventListener('updatefound', onUpdateFound)
        cleanUpSw = () => reg.removeEventListener('updatefound', onUpdateFound)
      }).catch(() => {})
    }

    return () => {
      window.clearTimeout(initTimer)
      window.clearInterval(interval)
      document.removeEventListener('visibilitychange', onVisibilityChange)
      window.removeEventListener('focus', checkForUpdates)
      cleanUpSw?.()
    }
  }, [setUpdateAvailable])
}
