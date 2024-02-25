import { Stack, Toggle } from '@fluentui/react'
import type { Row, RowSelectionState } from '@tanstack/react-table'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'
import { clsx } from 'clsx/lite'
import type { IpcManBindData } from 'ipcman'
import type { Dispatch, FC, MouseEvent, SetStateAction } from 'react'
import { useCallback, useRef, useState } from 'react'
import type { IpcManItem } from '../../../services/remote'
import { useRemote } from '../../../services/remote'
import { HeaderCell, IndexCell, TextCell, TypeCell } from './cell'
import styles from './index.module.scss'

const columnHelper = createColumnHelper<IpcManItem>()

const columns = [
  // columnHelper.display({
  //   id: 'xref',
  //   header: '',
  //   size: 48,
  //   enableResizing: false,
  // }),
  columnHelper.accessor((x) => [x.index, x.timestamp], {
    id: 'indexcol',
    header: () => <HeaderCell children="Index" />,
    size: 72,
    enableResizing: false,
    cell: (info) => {
      const [index, timestamp] = info.getValue()
      return <IndexCell index={index!} timestamp={timestamp!} />
    },
  }),
  columnHelper.accessor('data.type', {
    header: () => <HeaderCell children="Type" />,
    size: 48,
    enableResizing: false,
    cell: (info) => <TypeCell type={info.getValue()} />,
  }),
  columnHelper.accessor(
    (x) => ((x.data as IpcManBindData).id ? (x.data as IpcManBindData).id : ''),
    {
      id: 'id',
      header: () => <HeaderCell children="ID" />,
      cell: (info) => <TextCell children={info.getValue()} />,
    },
  ),
  columnHelper.accessor('data.channel', {
    header: () => <HeaderCell children="Channel / Method" />,
    cell: (info) => <TextCell children={info.getValue()} />,
  }),
  columnHelper.accessor(
    (x) => (x.data.requestArgs ? JSON.stringify(x.data.requestArgs) : ''),
    {
      id: 'requestArgs',
      header: () => <HeaderCell children="Request" />,
      cell: (info) => <TextCell children={info.getValue()} />,
    },
  ),
  columnHelper.accessor(
    (x) => (x.data.responseArgs ? JSON.stringify(x.data.responseArgs) : ''),
    {
      id: 'responseArgs',
      header: () => <HeaderCell children="Response" />,
      cell: (info) => <TextCell children={info.getValue()} />,
    },
  ),
]

export const TimelineTable: FC<{
  rowSelection: RowSelectionState
  handleRowSelection: Dispatch<SetStateAction<RowSelectionState>>
}> = ({ rowSelection, handleRowSelection }) => {
  const { data } = useRemote()

  const [autoScroll, setAutoScroll] = useState(true)

  const handleAutoScrollToggle = useCallback(
    (_: MouseEvent, v: boolean | undefined) => setAutoScroll(v!),
    [],
  )

  const table = useReactTable({
    columns,
    data,

    getCoreRowModel: getCoreRowModel(),

    enableColumnResizing: true,
    columnResizeMode: 'onChange',

    getRowId: (row) => `${row.index}`,

    state: {
      rowSelection,
    },

    enableRowSelection: true,
    enableMultiRowSelection: false,
    enableSubRowSelection: false,
    onRowSelectionChange: handleRowSelection,
  })

  const { rows } = table.getRowModel()

  const tableContainerRef = useRef<HTMLDivElement>(null)

  const rowVirtualizer = useVirtualizer({
    count: rows.length,

    estimateSize: () => 48, // Estimate row height for accurate scrollbar dragging

    getScrollElement: () => tableContainerRef.current,

    // Measure dynamic row height, except in firefox because it measures table border height incorrectly
    // measureElement:
    //   typeof window !== 'undefined' &&
    //   navigator.userAgent.indexOf('Firefox') === -1
    //     ? (element) => element?.getBoundingClientRect().height
    //     : (undefined as unknown as () => number),

    measureElement: () => 48,

    overscan: 5,
  })

  const headerNodes = table.getHeaderGroups().map((headerGroup) => {
    const headerCellNodes = headerGroup.headers.map((header) => {
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
            : flexRender(header.column.columnDef.header, header.getContext())}
          {header.column.getCanResize() && (
            <div
              className={clsx(
                styles.resizer,
                header.column.getIsResizing() && styles.isResizing,
              )}
              onDoubleClick={() => header.column.resetSize()}
              onMouseDown={header.getResizeHandler()}
              onTouchStart={header.getResizeHandler()}
            ></div>
          )}
        </th>
      )
    })

    return (
      <tr
        className={styles.tHeadRow}
        key={headerGroup.id}
        children={headerCellNodes}
      />
    )
  })

  const bodyNodes = rowVirtualizer.getVirtualItems().map((virtualRow) => {
    const row = rows[virtualRow.index] as Row<IpcManItem>

    const rowCellNodes = row.getVisibleCells().map((cell) => {
      return (
        <td
          className={styles.tCell}
          key={cell.id}
          style={{
            width: cell.column.getSize(),
          }}
        >
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </td>
      )
    })

    return (
      <tr
        className={clsx(styles.tRow, row.getIsSelected() && 'selected')}
        data-index={virtualRow.index} // Needed for dynamic row height measurement
        ref={(node) => rowVirtualizer.measureElement(node)} // Measure dynamic row height
        key={row.id}
        style={{
          transform: `translateY(${virtualRow.start}px)`, // This should always be a `style` as it changes on scroll
        }}
        onClick={row.getToggleSelectedHandler()}
        children={rowCellNodes}
      />
    )
  })

  const tableNodes = (
    <div className={styles.overflowContainer} ref={tableContainerRef}>
      {/* Even though we're still using sematic table tags, we must use CSS grid and flexbox for dynamic row heights */}
      <table className={styles.table}>
        <thead className={styles.tHead} children={headerNodes} />
        <tbody
          className={styles.tBody}
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`, // Tells scrollbar how big the table is
          }}
          children={bodyNodes}
        />
      </table>
    </div>
  )

  return (
    <Stack grow>
      <Stack className={styles.header!} horizontal>
        <Stack horizontalAlign="end" verticalAlign="center">
          <Toggle
            className={styles.toggle}
            label="Auto Scroll"
            onText="On"
            offText="Off"
            inlineLabel
            checked={autoScroll}
            onChange={handleAutoScrollToggle}
          />
        </Stack>
      </Stack>
      {tableNodes}
    </Stack>
  )
}
