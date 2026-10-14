import React, { useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { UserPlus } from 'lucide-react'
import { useTranslation } from '../../i18n'
import { lockBodyScroll } from '../../utils/bodyScrollLock'

interface NewUserConfirmModalProps {
  isOpen: boolean
  username: string
  isLoading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function NewUserConfirmModal({
  isOpen,
  username,
  isLoading = false,
  onConfirm,
  onCancel,
}: NewUserConfirmModalProps) {
  const { t } = useTranslation()

  const handleEsc = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' && !isLoading) {
      onCancel()
    }
  }, [isLoading, onCancel])

  useEffect(() => {
    if (!isOpen) return
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [isOpen, handleEsc])

  useEffect(() => {
    if (!isOpen) return
    return lockBodyScroll()
  }, [isOpen])

  if (!isOpen) return null

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="new-user-modal-title"
      aria-describedby="new-user-modal-desc"
      className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md trek-backdrop-enter"
      style={{
        paddingTop: 'max(1rem, env(safe-area-inset-top, 1rem))',
        paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 1rem))',
        paddingLeft: 'max(1rem, env(safe-area-inset-left, 1rem))',
        paddingRight: 'max(1rem, env(safe-area-inset-right, 1rem))',
      }}
      onClick={isLoading ? undefined : onCancel}
    >
      <div
        role="presentation"
        className="trek-modal-enter trek-modal-center flex flex-col items-center text-center rounded-2xl shadow-2xl w-full max-w-sm sm:max-w-md p-6 sm:p-7 bg-surface-card border border-edge-secondary"
        style={{
          margin: 'auto',
          alignSelf: 'center',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div className="w-14 h-14 rounded-2xl bg-accent/15 text-accent flex items-center justify-center mb-4">
          <UserPlus className="w-7 h-7" />
        </div>

        <h3 id="new-user-modal-title" className="text-lg sm:text-xl font-bold text-content">
          {t('login.createAccount') || 'Create Account'}
        </h3>

        <p id="new-user-modal-desc" className="mt-2 text-sm text-content-secondary leading-relaxed">
          No account found for <span className="font-semibold text-content">{username}</span>. Would you like to create a new account with this username?
        </p>

        <div className="flex flex-col-reverse sm:flex-row gap-2.5 sm:gap-3 w-full mt-6">
          <button
            type="button"
            disabled={isLoading}
            onClick={onCancel}
            className="w-full sm:flex-1 py-3 sm:py-2.5 px-4 text-sm font-medium rounded-xl border border-edge-secondary text-content-secondary hover:bg-surface-hover active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
          >
            {t('common.cancel') || 'Cancel'}
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className="w-full sm:flex-1 py-3 sm:py-2.5 px-4 text-sm font-medium rounded-xl bg-accent text-accent-text hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm cursor-pointer"
          >
            {isLoading
              ? (t('login.creating') || 'Creating…')
              : (t('login.createAccount') || 'Create Account')}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
