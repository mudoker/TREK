import { create } from 'zustand'

interface AppUpdateState {
  updateAvailable: boolean
  setUpdateAvailable: (available: boolean) => void
  triggerUpdate: () => void
}

export const useAppUpdateStore = create<AppUpdateState>((set) => ({
  updateAvailable: false,
  setUpdateAvailable: (available: boolean) => set({ updateAvailable: available }),
  triggerUpdate: () => set({ updateAvailable: true }),
}))
