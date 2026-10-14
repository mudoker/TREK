import { describe, it, expect, beforeEach } from 'vitest'
import { useAppUpdateStore } from './appUpdateStore'

describe('appUpdateStore', () => {
  beforeEach(() => {
    useAppUpdateStore.setState({ updateAvailable: false })
  })

  it('initializes with updateAvailable false', () => {
    expect(useAppUpdateStore.getState().updateAvailable).toBe(false)
  })

  it('setUpdateAvailable updates state', () => {
    useAppUpdateStore.getState().setUpdateAvailable(true)
    expect(useAppUpdateStore.getState().updateAvailable).toBe(true)

    useAppUpdateStore.getState().setUpdateAvailable(false)
    expect(useAppUpdateStore.getState().updateAvailable).toBe(false)
  })

  it('triggerUpdate sets updateAvailable true', () => {
    useAppUpdateStore.getState().triggerUpdate()
    expect(useAppUpdateStore.getState().updateAvailable).toBe(true)
  })
})
