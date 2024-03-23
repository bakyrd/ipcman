import { useEffect, useMemo, useRef, useState } from 'react'
import { IpcManItem, useRemote } from '../../../services/remote'
import { createVelocity } from './tween'
import { BaseButton, CommandButton, DefaultButton, Toggle } from '@fluentui/react'
import s from './index.module.scss'
import { useDataColorFlag, useDataFilter, useReqDataExtractorCode, useRespDataExtractorCode } from '../../../states'

const lineHeight = 40
const padding = 10

interface RowInfo {
  title: string
  width: number
  data?(data: IpcManItem): string
  draw?(data: IpcManItem, ctx: CanvasRenderingContext2D, x: number, y: number): void
}


let cursorX = 0, cursorY = 0
const mmHandler: (e: MouseEvent) => void = e => {
  cursorX = e.offsetX
  cursorY = e.offsetY
}
let currentHoveringItem = -1

/* DONT REUSE THIS COMPONENT */
export const TimelineTable = ({
  rowSelection,
  handleRowSelection,
}: {
  rowSelection: number
  handleRowSelection: (rowSelection: number) => void
}) => {
  const [autoscroll, setAutoscroll] = useState(true)

  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  const remote = useRemote()

  const scrollHeightTween = useMemo(() => createVelocity({
    minVal: -lineHeight,
    value: -lineHeight
  }), [])

  useEffect(() => {
    if (autoscroll) {
      let lastDataIndex = remote.data.length
      const h = setInterval(() => {
        if (lastDataIndex === remote.data.length) return
        scrollHeightTween.value += lineHeight * (remote.data.length - lastDataIndex)
        lastDataIndex = remote.data.length
      }, 40)
      return () => {
        clearInterval(h)
      }
    }
  }, [autoscroll])

  // eslint-disable-next-line @typescript-eslint/ban-types
  const wrapTryCatch = (fn: Function) => {
    return (...args: unknown[]) => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return fn(...args) ?? ''
      } catch (e) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
        return e
      }
    }
  }

  const useCodeFunc = <T,>(hook: typeof useReqDataExtractorCode, defaultFunc: T) => {
    const [code] = hook()
    return useMemo(() => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-implied-eval
        const fn = new Function('data', 'type', 'index', code)
        return wrapTryCatch(fn)
      } catch (e) {
        return defaultFunc
      }
    }, [code])
  }
  const reqDataExtractor = useCodeFunc(useReqDataExtractorCode, (data: unknown[], type: string, index: number) => JSON.stringify(data))
  const respDataExtractor = useCodeFunc(useRespDataExtractorCode, (data: unknown[], type: string, index: number) => JSON.stringify(data))
  const dataColorFlagExtractor = useCodeFunc(useDataColorFlag, (data: unknown[], type: string, index: number) => 'black')
  const dataFilter = useCodeFunc(useDataFilter, (data: unknown[], type: string, index: number) => true)

  useEffect(() => {
    if (!canvasRef.current) return

    const ctx = canvasRef.current.getContext('2d')

    canvasRef.current.addEventListener('mousemove', mmHandler)

    canvasRef.current.onclick = () => {
      if (currentHoveringItem === -1) return
      handleRowSelection(currentHoveringItem - 1)
    }

    const canvasWidth = canvasRef.current.width
    const argWidth = (canvasWidth - 40 - 70 - 50 - padding * 5 * 2) / 2

    const rowInfo: RowInfo[] = [
      {
        title: '',
        width: 6,
        draw(data, ctx, x, y) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          ctx.fillStyle = dataColorFlagExtractor(data.data.requestArgs || [], data.data.type, data.index) ?? 'black'
          ctx.fillRect(x - padding, y, 15 + padding, lineHeight - padding * 2)
        },
      },
      {
        title: 'Index',
        width: 40,
        data(data) {
          return data.index.toString()
        }
      },
      {
        title: 'Timestamp',
        width: 70,
        data(data) {
          return new Date(data.timestamp).toLocaleTimeString()
        }
      },
      {
        title: 'Type',
        width: 50,
        data(data) {
          return data.data.type
        }
      },
      {
        title: 'Request Args',
        width: argWidth,
        data(data) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          return reqDataExtractor(data.data.requestArgs || [], data.data.type, data.index)
        }
      },
      {
        title: 'Response Args',
        width: argWidth,
        data(data) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          return respDataExtractor(data.data.responseArgs || [], data.data.type, data.index)
        }
      }
    ]

    const draw = (deltaT) => {
      if (!ctx) return
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

      const top = -scrollHeightTween.value;


      const firstDataIndex = Math.floor(-top / lineHeight)
      const lastDataIndex = Math.ceil((-top + ctx.canvas.height) / lineHeight)

      // Draw data
      for (let i = firstDataIndex; i < lastDataIndex; i++) {
        const data = remote.data[i]
        if (!data) continue

        const y = i * lineHeight + top + padding
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        ctx.fillStyle = rowSelection === data.index ? 'rgba(0, 0, 0, 0.1)' : 'transparent'
        ctx.fillRect(0, y, ctx.canvas.width, lineHeight - padding)
        ctx.font = '14px Noto Sans CJK SC'
        let x = 0
        for (const row of rowInfo) {
          // inner content(clipped)
          ctx.save()
          ctx.beginPath()
          x += padding
          ctx.rect(x, y, row.width, lineHeight - padding)
          ctx.clip()

          if (row.data) {
            ctx.fillStyle = 'white'
            ctx.textAlign = 'center'
            ctx.fillText(row.data(data), x +
              row.width / 2
              , y + padding + 7)
          } else if (row.draw) {
            row.draw(data, ctx, x, y)
          } else {
            ctx.fillText('Unknown', x, y + padding)
          }

          x += row.width + padding

          ctx.restore()

          // border
          ctx.fillStyle = '#3E4452'
          ctx.fillRect(x, y, 1, lineHeight + padding)
        }

        // border
        ctx.fillStyle = '#3E4452'
        ctx.fillRect(0, y - padding, ctx.canvas.width, 1)

        // hover effect
        if (cursorY > y && cursorY < y + lineHeight) {
          ctx.fillStyle = '#ffffff11'
          ctx.fillRect(0, y - padding, ctx.canvas.width, lineHeight)
          currentHoveringItem = data.index
        }

        // selected effect
        if (rowSelection === data.index - 1) {
          ctx.fillStyle = '#aaaaff22'
          ctx.fillRect(0, y - padding, ctx.canvas.width, lineHeight)
        }
      }

      // Draw header
      let x = 0
      for (const row of rowInfo) {
        const width = row.width + padding * 2
        ctx.fillStyle = '#252525'
        ctx.font = '14px Noto Sans CJK SC'
        ctx.fillRect(x, 0, width, lineHeight)
        ctx.fillStyle = 'white'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(row.title, x + width / 2, lineHeight / 2)

        // border
        ctx.fillStyle = '#3E4452'
        ctx.fillRect(x, 0, 1, lineHeight)
        x += width
        ctx.fillRect(x, 0, 1, lineHeight)
      }
    }

    let rAFHandle: number
    let lastTime: number = -1
    const loop = (time: number) => {
      if (lastTime === -1) lastTime = time
      const deltaT = time - lastTime
      lastTime = time
      scrollHeightTween.update(deltaT)
      draw(deltaT)

      rAFHandle = requestAnimationFrame(loop)
    }

    rAFHandle = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(rAFHandle)
      canvasRef.current?.removeEventListener('mousemove', mmHandler)
    }
  }, [rowSelection, remote])

  const [width, setWidth] = useState(0)
  const [height, setHeight] = useState(0)
  useEffect(() => {
    const handleResize = () => {
      if (!canvasRef.current) return
      const { width, height } = canvasRef.current.parentElement.getBoundingClientRect()
      setWidth(width)
      setHeight(height)
    }

    handleResize()
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <div className="timeline" style={{
      height: '100%'
    }}>
      <div className={s.options}>
        <div className={s.navigation}>
          <Toggle checked={autoscroll} onChange={(_, v) => setAutoscroll(v)} label="Autoscroll"
            inlineLabel />
          <DefaultButton onClick={() => {
            scrollHeightTween.value = 0
          }}>
            Scroll to top
          </DefaultButton>

          <DefaultButton onClick={() => {
            scrollHeightTween.value = remote.data.length * lineHeight - height + 100
          }}>
            Scroll to bottom
          </DefaultButton>
        </div>
      </div>
      <div style={{
        height: '100%',
      }}>
        <canvas ref={canvasRef} onWheel={e => {
          if (e.shiftKey) scrollHeightTween.speed = e.deltaY / 3
          else scrollHeightTween.speed = e.deltaY / 30
        }} width={width} height={height} />
      </div>
    </div>
  )
}
