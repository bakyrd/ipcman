import type { Row } from '@tanstack/react-table'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'
import { clsx } from 'clsx/lite'
import type { FC } from 'react'
import { useRef } from 'react'
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

  const { rows } = table.getRowModel()

  const tableContainerRef = useRef<HTMLDivElement>(null)

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    estimateSize: () => 42, // Estimate row height for accurate scrollbar dragging
    getScrollElement: () => tableContainerRef.current,
    // Measure dynamic row height, except in firefox because it measures table border height incorrectly
    measureElement:
      typeof window !== 'undefined' &&
      navigator.userAgent.indexOf('Firefox') === -1
        ? (element) => element?.getBoundingClientRect().height
        : (undefined as unknown as () => number),
    overscan: 5,
  })

  return (
    <>
      <div className={styles.overflowContainer} ref={tableContainerRef}>
        {/* Even though we're still using sematic table tags, we must use CSS grid and flexbox for dynamic row heights */}
        <table className={styles.table}>
          <thead className={styles.tHead}>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr className={styles.tHeadRow} key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <th
                      className={styles.tHeadCell}
                      key={header.id}
                      colSpan={header.colSpan}
                      style={{
                        width: header.getSize(),
                      }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                      {header.column.getCanResize() && (
                        <div
                          className={clsx(
                            styles.resizer,
                            header.column.getIsResizing() && styles.isResizing,
                          )}
                          onMouseDown={header.getResizeHandler()}
                          onTouchStart={header.getResizeHandler()}
                        ></div>
                      )}
                    </th>
                  )
                })}
              </tr>
            ))}
          </thead>
          <tbody
            className={styles.tBody}
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`, // Tells scrollbar how big the table is
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const row = rows[virtualRow.index] as Row<IpcManItem>
              return (
                <tr
                  className={styles.tRow}
                  data-index={virtualRow.index} // Needed for dynamic row height measurement
                  ref={(node) => rowVirtualizer.measureElement(node)} // Measure dynamic row height
                  key={row.id}
                  style={{
                    transform: `translateY(${virtualRow.start}px)`, // This should always be a `style` as it changes on scroll
                  }}
                >
                  {row.getVisibleCells().map((cell) => {
                    return (
                      <td
                        className={styles.tCell}
                        key={cell.id}
                        style={{
                          width: cell.column.getSize(),
                        }}
                      >
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
      </div>
    </>
  )
}
