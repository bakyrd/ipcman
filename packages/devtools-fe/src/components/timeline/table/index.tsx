import { useEffect, useMemo, useRef, useState } from 'react'
import { IpcManItem, useRemote } from '../../../services/remote'
import { createVelocity } from './tween'
import { BaseButton, CommandButton, DefaultButton, Toggle } from '@fluentui/react'
import s from './index.module.scss'
import { useReqDataExtractorCode, useRespDataExtractorCode } from '../../../states'

const lineHeight = 40
const padding = 10

interface RowInfo {
  title: string
  width: number
  data?(data: IpcManItem): string
  draw?(data: IpcManItem, x: number, y: number): void
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

  const [reqDataExtractorCode] = useReqDataExtractorCode()
  const reqDataExtractor = useMemo(() => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-implied-eval
      return new Function('data', reqDataExtractorCode)
    } catch (e) {
      return (data: unknown[]) => data.join(', ')
    }
  }, [reqDataExtractorCode])
  const [respDataExtractorCode] = useRespDataExtractorCode()
  const respDataExtractor = useMemo(() => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-implied-eval
      return new Function('data', respDataExtractorCode)
    } catch (e) {
      return (data: unknown[]) => data.join(', ')
    }
  }, [])

  useEffect(() => {
    if (!canvasRef.current) return

    const ctx = canvasRef.current.getContext('2d')

    canvasRef.current.addEventListener('mousemove', mmHandler)

    canvasRef.current.onclick = () => {
      if (currentHoveringItem === -1) return
      handleRowSelection(currentHoveringItem)
    }

    const rowInfo: RowInfo[] = [
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
        width: 100,
        data(data) {
          return data.data.type
        }
      },
      {
        title: 'Request Args',
        width: 200,
        data(data) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          return reqDataExtractor(data.data.requestArgs || [])
        }
      },
      {
        title: 'Response Args',
        width: 200,
        data(data) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          return respDataExtractor(data.data.responseArgs || [])
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
            row.draw(data, x, y)
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
        if (rowSelection === data.index) {
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
            scrollHeightTween.value = remote.data.length * lineHeight - 400
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
