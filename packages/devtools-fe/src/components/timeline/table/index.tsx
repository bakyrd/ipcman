import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import type { FC } from 'react'
import type { IpcManItem } from '../../services/remote'

const columnHelper = createColumnHelper<IpcManItem>()

const columns = [
  columnHelper.accessor('index', {}),
  columnHelper.accessor('data.type', {}),
  columnHelper.accessor('data.channel', {}),
  columnHelper.accessor('data.requestArgs', {}),
  columnHelper.accessor('data.responseArgs', {}),
]

export const TimelineTable: FC<{
  items: IpcManItem[]
}> = ({ items }) => {
  const table = useReactTable({
    columns,
    data: items,
    getCoreRowModel: getCoreRowModel(),
  })
  return (
    <>
      <table>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}
