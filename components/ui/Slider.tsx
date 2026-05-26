'use client'
import { useRef, useCallback } from 'react'

interface SliderProps {
  value: number
  onChange: (v: number) => void
  labelLeft?: string
  labelRight?: string
  dots?: number
}

export function Slider({ value, onChange, labelLeft, labelRight, dots = 9 }: SliderProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  const getVal = useCallback((clientX: number) => {
    if (!trackRef.current) return 0
    const rect = trackRef.current.getBoundingClientRect()
    return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
  }, [])

  const handleMove = useCallback((clientX: number) => {
    if (dragging.current) onChange(getVal(clientX))
  }, [getVal, onChange])

  const pct = (value * 100).toFixed(1) + '%'
  const activeDots = Math.round(value * (dots - 1))

  return (
    <div className="flex flex-col gap-2 select-none">
      {(labelLeft || labelRight) && (
        <div className="flex justify-between" style={{ fontSize:'0.68rem', color:'var(--muted)' }}>
          <span>{labelLeft}</span><span>{labelRight}</span>
        </div>
      )}
      <div
        ref={trackRef}
        className="relative flex items-center cursor-pointer"
        style={{ height: 36 }}
        onMouseDown={e => { dragging.current = true; onChange(getVal(e.clientX)) }}
        onMouseMove={e => handleMove(e.clientX)}
        onMouseUp={() => { dragging.current = false }}
        onMouseLeave={() => { dragging.current = false }}
        onTouchStart={e => { dragging.current = true; onChange(getVal(e.touches[0].clientX)) }}
        onTouchMove={e => { e.preventDefault(); handleMove(e.touches[0].clientX) }}
        onTouchEnd={() => { dragging.current = false }}
      >
        <div className="w-full rounded-full" style={{ height:6, background:'var(--surface2)' }}>
          <div className="h-full rounded-full" style={{ width: pct, background:'linear-gradient(90deg, var(--border), var(--accent))' }} />
        </div>
        <div className="absolute bg-white rounded-full pointer-events-none"
          style={{ width:26, height:26, left:pct, top:'50%', transform:'translate(-50%,-50%)', boxShadow:'0 2px 10px rgba(0,0,0,0.35)' }} />
      </div>
      <div className="flex justify-between px-0.5">
        {Array.from({ length: dots }, (_, i) => (
          <div key={i} className="rounded-full" style={{ width:3, height:3, background: i<=activeDots ? 'var(--accent)' : 'var(--border)', transition:'background 0.1s' }} />
        ))}
      </div>
    </div>
  )
}
