import { useLocalStorage } from "react-use"
import { create } from "zustand"

export const useCurrentPage = create<{
  currentPage: string
  setCurrentPage: (page: string) => void
}>(set => ({
  currentPage: 'timeline',
  setCurrentPage: (page) => set({ currentPage: page })
}))

export const useReqDataExtractorCode = () => useLocalStorage('req-data-extractor-code', 'return data.join(",")')
export const useRespDataExtractorCode = () => useLocalStorage('resp-data-extractor-code', 'return data.join(",")')
export const useDataColorFlag = () => useLocalStorage('data-color-flag', 'return "#141414"')
export const useDataFilter = () => useLocalStorage('data-filter', 'return true')

export const useSelectedRow = create<{
  selectedRow: number
  setSelectedRow: (row: number) => void
}>(set => ({
  selectedRow: -1,
  setSelectedRow: (row) => set({ selectedRow: row })
}))
