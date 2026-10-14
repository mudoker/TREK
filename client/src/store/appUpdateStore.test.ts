import { describe, it, expect, beforeEach } from 'vitest'
import { useAppUpdateStore } from './appUpdateStore'

describe('appUpdateStore', () => {
  beforeEach(() => {
    useAppUpdateStore.setState({ updateAvailable: false })
  })

  it('initializes with updateAvailable false', () => {
    expect(useAppUpdateStore.getState().updateAvailable).toBe(false)
  })

  it('setUpdateAvailable updates state and targetVersion', () => {
    useAppUpdateStore.getState().setUpdateAvailable(true, '4.3.4')
    expect(useAppUpdateStore.getState().updateAvailable).toBe(true)
    expect(useAppUpdateStore.getState().targetVersion).toBe('4.3.4')

    useAppUpdateStore.getState().setUpdateAvailable(false)
    expect(useAppUpdateStore.getState().updateAvailable).toBe(false)
  })

  it('triggerUpdate sets updateAvailable true and targetVersion', () => {
    useAppUpdateStore.getState().triggerUpdate('4.3.5')
    expect(useAppUpdateStore.getState().updateAvailable).toBe(true)
    expect(useAppUpdateStore.getState().targetVersion).toBe('4.3.5')
  })
})
