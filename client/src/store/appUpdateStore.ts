import { create } from 'zustand'

interface AppUpdateState {
  updateAvailable: boolean
  targetVersion?: string
  setUpdateAvailable: (available: boolean, targetVersion?: string) => void
  triggerUpdate: (targetVersion?: string) => void
}

export const useAppUpdateStore = create<AppUpdateState>((set) => ({
  updateAvailable: false,
  targetVersion: undefined,
  setUpdateAvailable: (available: boolean, targetVersion?: string) =>
    set({ updateAvailable: available, ...(targetVersion !== undefined ? { targetVersion } : {}) }),
  triggerUpdate: (targetVersion?: string) =>
    set({ updateAvailable: true, ...(targetVersion !== undefined ? { targetVersion } : {}) }),
}))
