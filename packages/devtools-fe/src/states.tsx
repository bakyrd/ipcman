import { create } from "zustand"

export const useCurrentPage = create<{
  currentPage: string
  setCurrentPage: (page: string) => void
}>(set => ({
  currentPage: 'timeline',
  setCurrentPage: (page) => set({currentPage: page})
}))
