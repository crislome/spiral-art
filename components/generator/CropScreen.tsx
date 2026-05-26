'use client'
import { useEffect, useRef, useState, useCallback } from 'react'

interface CropScreenProps {
  srcImg: HTMLImageElement
  onConfirm: (bitmap: HTMLCanvasElement) => void
  onCancel: () => void
}

export function CropScreen({ srcImg, onConfirm, onCancel }: CropScreenProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const vpRef = useRef<HTMLDivElement>(null)
  const [zoom, setZoom] = useState(0.2)

  const stateRef = useRef({ x:0, y:0, scale:1, minScale:1, circleSize:0, vw:0, vh:0 })
  const dragRef = useRef<{ sx:number; sy:number; ox:number; oy:number } | null>(null)
  const pinchRef = useRef<{ dist0:number; scale0:number } | null>(null)

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const { x, y, scale, vw, vh } = stateRef.current
    ctx.clearRect(0, 0, vw, vh)
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, vw, vh)
    ctx.drawImage(srcImg, x, y, srcImg.naturalWidth * scale, srcImg.naturalHeight * scale)
  }, [srcImg])

  const clamp = useCallback(() => {
    const s = stateRef.current
    const w = srcImg.naturalWidth * s.scale
    const h = srcImg.naturalHeight * s.scale
    const cx = s.vw/2, cy = s.vh/2, r = s.circleSize/2
    s.x = Math.min(cx-r, Math.max(cx+r-w, s.x))
    s.y = Math.min(cy-r, Math.max(cy+r-h, s.y))
  }, [srcImg])

  useEffect(() => {
    const vp = vpRef.current
    if (!vp) return
    const vw = vp.offsetWidth, vh = vp.offsetHeight
    const cs = Math.min(vw, vh) * 0.82
    const aspect = srcImg.naturalWidth / srcImg.naturalHeight
    const minS = aspect > 1 ? cs / srcImg.naturalHeight : cs / srcImg.naturalWidth
    const scale = minS * 1.1
    stateRef.current = {
      vw, vh, circleSize: cs, minScale: minS, scale,
      x: (vw - srcImg.naturalWidth * scale) / 2,
      y: (vh - srcImg.naturalHeight * scale) / 2,
    }
    const canvas = canvasRef.current!
    canvas.width = vw; canvas.height = vh
    draw()
  }, [srcImg, draw])

  // Touch handlers
  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      dragRef.current = { sx: e.touches[0].clientX, sy: e.touches[0].clientY, ox: stateRef.current.x, oy: stateRef.current.y }
    } else if (e.touches.length === 2) {
      const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY)
      pinchRef.current = { dist0: dist, scale0: stateRef.current.scale }
      dragRef.current = null
    }
  }
  const onTouchMove = (e: React.TouchEvent) => {
    e.preventDefault()
    if (e.touches.length === 1 && dragRef.current) {
      stateRef.current.x = dragRef.current.ox + e.touches[0].clientX - dragRef.current.sx
      stateRef.current.y = dragRef.current.oy + e.touches[0].clientY - dragRef.current.sy
      clamp(); draw()
    } else if (e.touches.length === 2 && pinchRef.current) {
      const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY)
      stateRef.current.scale = Math.max(stateRef.current.minScale, pinchRef.current.scale0 * dist / pinchRef.current.dist0)
      syncZoom(); clamp(); draw()
    }
  }
  const syncZoom = () => {
    const t = (stateRef.current.scale / stateRef.current.minScale - 1) / 2.5
    setZoom(Math.max(0, Math.min(1, t)))
  }
  const onZoomChange = (v: number) => {
    setZoom(v)
    stateRef.current.scale = stateRef.current.minScale * (1 + v * 2.5)
    clamp(); draw()
  }

  const confirm = () => {
    const s = stateRef.current
    const size = 512
    const off = document.createElement('canvas')
    off.width = off.height = size
    const ctx = off.getContext('2d')!
    const cx = s.vw/2, cy = s.vh/2, r = s.circleSize/2
    ctx.drawImage(srcImg,
      (cx - r - s.x) / s.scale, (cy - r - s.y) / s.scale,
      s.circleSize / s.scale, s.circleSize / s.scale,
      0, 0, size, size
    )
    onConfirm(off)
  }

  const zoomPct = (zoom * 100).toFixed(0) + '%'

  return (
    <div className="fixed inset-0 flex flex-col" style={{ background:'#000', zIndex:50 }}>
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-5 pt-12 pb-4"
        style={{ background:'linear-gradient(to bottom, rgba(0,0,0,0.7), transparent)' }}>
        <span style={{ fontSize:'0.8rem', color:'rgba(255,255,255,0.6)', textTransform:'uppercase', letterSpacing:'0.08em' }}>Posicione a imagem</span>
        <div className="flex gap-2">
          <button onClick={onCancel} className="px-4 py-2 rounded-full text-white text-sm font-medium" style={{ background:'rgba(255,255,255,0.12)' }}>Cancelar</button>
          <button onClick={confirm} className="px-4 py-2 rounded-full text-sm font-bold" style={{ background:'var(--accent)', color:'#111' }}>Usar ✓</button>
        </div>
      </div>

      {/* Viewport */}
      <div ref={vpRef} className="flex-1 relative overflow-hidden"
        onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={() => { dragRef.current=null }}>
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        {/* Circle overlay - rendered via CSS */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div style={{
            position:'absolute',
            width: '82vmin', height: '82vmin',
            borderRadius:'50%',
            border:'2px solid var(--accent)',
            boxShadow:'0 0 0 9999px rgba(0,0,0,0.55)'
          }} />
        </div>
      </div>

      {/* Footer zoom */}
      <div className="absolute bottom-0 left-0 right-0 px-8 pb-12 pt-6"
        style={{ background:'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}>
        <div className="relative flex items-center cursor-pointer" style={{ height:36 }}
          onMouseDown={e => onZoomChange(Math.max(0,Math.min(1,(e.clientX - e.currentTarget.getBoundingClientRect().left)/e.currentTarget.getBoundingClientRect().width)))}
          onTouchStart={e => onZoomChange(Math.max(0,Math.min(1,(e.touches[0].clientX - e.currentTarget.getBoundingClientRect().left)/e.currentTarget.getBoundingClientRect().width)))}
          onTouchMove={e => { e.preventDefault(); onZoomChange(Math.max(0,Math.min(1,(e.touches[0].clientX - e.currentTarget.getBoundingClientRect().left)/e.currentTarget.getBoundingClientRect().width))) }}
        >
          <div className="w-full rounded-full" style={{ height:4, background:'rgba(255,255,255,0.2)' }}>
            <div className="h-full rounded-full" style={{ width:zoomPct, background:'var(--accent)' }} />
          </div>
          <div className="absolute bg-white rounded-full" style={{ width:22, height:22, left:zoomPct, top:'50%', transform:'translate(-50%,-50%)', boxShadow:'0 2px 8px rgba(0,0,0,0.4)' }} />
        </div>
        <p className="text-center mt-3" style={{ fontSize:'0.7rem', color:'rgba(255,255,255,0.35)', letterSpacing:'0.04em' }}>
          Arraste · Aperte para ampliar
        </p>
      </div>
    </div>
  )
}
