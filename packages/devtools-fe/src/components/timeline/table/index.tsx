import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import type { FC } from 'react'
import type { IpcManItem } from '../../../services/remote'
import { ipcManDataTypeMap } from './consts'
import styles from './index.module.scss'

const columnHelper = createColumnHelper<IpcManItem>()

const columns = [
  columnHelper.accessor('index', {}),
  columnHelper.accessor('data.type', {
    cell: (info) => ipcManDataTypeMap[info.getValue()].name,
  }),
  columnHelper.accessor('data.channel', {}),
  columnHelper.accessor(
    (x) => (x.data.requestArgs ? JSON.stringify(x.data.requestArgs) : ''),
    {
      id: 'requestArgs',
    },
  ),
  columnHelper.accessor(
    (x) => (x.data.responseArgs ? JSON.stringify(x.data.responseArgs) : ''),
    {
      id: 'responseArgs',
    },
  ),
]

export const TimelineTable: FC<{
  items: IpcManItem[]
}> = ({ items }) => {
  const table = useReactTable({
    columns,
    data: items,

    getCoreRowModel: getCoreRowModel(),

    enableColumnResizing: true,
    columnResizeMode: 'onChange',
  })
  return (
    <>
      <table className={styles.table}>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <th
                    key={header.id}
                    colSpan={header.colSpan}
                    style={{ position: 'relative', width: header.getSize() }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                    {header.column.getCanResize() && (
                      <div
                        onMouseDown={header.getResizeHandler()}
                        onTouchStart={header.getResizeHandler()}
                        className={`resizer ${
                          header.column.getIsResizing() ? 'isResizing' : ''
                        }`}
                      ></div>
                    )}
                  </th>
                )
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => {
            return (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => {
                  return (
                    <td key={cell.id} style={{ width: cell.column.getSize() }}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    </>
  )
}
