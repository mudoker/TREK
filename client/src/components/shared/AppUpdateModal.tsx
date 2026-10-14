import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { RefreshCw, Sparkles } from 'lucide-react'
import { useTranslation } from '../../i18n'
import { lockBodyScroll } from '../../utils/bodyScrollLock'
import { dropAppShell } from '../../utils/serviceWorkerShell'
import { reloadFresh } from '../../utils/chunkReload'
import { useAppUpdateStore } from '../../store/appUpdateStore'
import { useAuthStore } from '../../store/authStore'

interface AppUpdateModalProps {
  isOpen: boolean
  version?: string
}

export default function AppUpdateModal({ isOpen, version }: AppUpdateModalProps) {
  const { t } = useTranslation()
  const [isUpdating, setIsUpdating] = useState(false)
  const targetVersion = useAppUpdateStore(s => s.targetVersion)
  const authVersion = useAuthStore(s => s.appVersion)

  const rawVersion = version
    || targetVersion
    || (authVersion && authVersion !== 'dev' ? authVersion : '')
    || (typeof __TREK_UI_VERSION__ === 'string' && __TREK_UI_VERSION__)
    || ''
  const displayVersion = rawVersion ? `v${rawVersion.replace(/^v/, '')}` : ''

  // Block Escape key completely so the modal cannot be dismissed
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        e.stopPropagation()
      }
    }
    document.addEventListener('keydown', handleKeyDown, true)
    return () => document.removeEventListener('keydown', handleKeyDown, true)
  }, [isOpen])

  // Lock body scroll while modal is active
  useEffect(() => {
    if (!isOpen) return
    return lockBodyScroll()
  }, [isOpen])

  if (!isOpen) return null

  const handleUpdate = async () => {
    setIsUpdating(true)
    try {
      if (rawVersion) {
        try { localStorage.setItem('trek_app_version', rawVersion.replace(/^v/, '')) } catch { /* best effort */ }
      }
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.getRegistration()
        if (reg?.waiting) {
          reg.waiting.postMessage({ type: 'SKIP_WAITING' })
        }
      }
      await dropAppShell()
    } catch {
      // Best effort cache cleanup
    } finally {
      reloadFresh()
    }
  }

  return createPortal(
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="app-update-title"
      aria-describedby="app-update-desc"
      className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md trek-backdrop-enter"
      style={{
        paddingTop: 'max(1rem, env(safe-area-inset-top, 1rem))',
        paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 1rem))',
        paddingLeft: 'max(1rem, env(safe-area-inset-left, 1rem))',
        paddingRight: 'max(1rem, env(safe-area-inset-right, 1rem))',
      }}
      onClick={e => e.stopPropagation()}
    >
      <div
        role="presentation"
        className="trek-modal-enter trek-modal-center flex flex-col items-center text-center rounded-2xl shadow-2xl w-full max-w-sm p-6 sm:p-7 bg-surface-card border border-edge-secondary"
        style={{
          margin: 'auto',
          alignSelf: 'center',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div className="w-14 h-14 rounded-2xl bg-accent/15 text-accent flex items-center justify-center mb-4">
          <Sparkles className="w-7 h-7" />
        </div>

        <h3 id="app-update-title" className="text-lg font-bold text-content">
          {t('admin.update.available') || 'Update Available'}
        </h3>

        {displayVersion && (
          <div
            data-testid="app-update-version"
            className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full bg-accent/15 text-accent text-xs font-semibold tracking-wide"
          >
            {displayVersion}
          </div>
        )}

        <p id="app-update-desc" className="mt-2.5 text-sm text-content-secondary leading-relaxed">
          {t('common.errorUpdateBody') || 'TREK was updated while this tab was open. Reload to get the new version.'}
        </p>

        <div className="w-full mt-6">
          <button
            type="button"
            disabled={isUpdating}
            onClick={handleUpdate}
            className="w-full py-3 px-4 rounded-xl font-medium bg-accent text-accent-text flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-60 shadow-md cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isUpdating ? 'animate-spin' : ''}`} />
            {isUpdating
              ? (t('admin.update.installing') || 'Updating…')
              : (t('admin.update.confirm') || 'Update Now')}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
