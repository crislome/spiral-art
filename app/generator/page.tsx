'use client'
import { useRef, useState, useCallback } from 'react'
import { useGeneratorStore } from '@/store/generatorStore'
import { SpiralCanvas } from '@/components/generator/SpiralCanvas'
import { CropScreen } from '@/components/generator/CropScreen'
import { ControlsPanel } from '@/components/generator/ControlsPanel'
import { ExportSheet } from '@/components/generator/ExportSheet'
import type { SpiralCanvasHandle } from '@/components/generator/SpiralCanvas'

export default function GeneratorPage() {
  const { hasImage, setHasImage, setCroppedBitmap } = useGeneratorStore()
  const [srcImg, setSrcImg] = useState<HTMLImageElement | null>(null)
  const [showCrop, setShowCrop] = useState(false)
  const [showExport, setShowExport] = useState(false)
  const canvasRef = useRef<SpiralCanvasHandle>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const triggerUpload = () => fileRef.current?.click()

  const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    const reader = new FileReader()
    reader.onload = ev => {
      const img = new Image()
      img.onload = () => { setSrcImg(img); setShowCrop(true) }
      img.src = ev.target?.result as string
    }
    reader.readAsDataURL(file)
  }, [])

  const handleCropConfirm = useCallback((bitmap: HTMLCanvasElement) => {
    setCroppedBitmap(bitmap)
    setHasImage(true)
    setShowCrop(false)
  }, [setCroppedBitmap, setHasImage])

  return (
    <div className="fixed inset-0 flex flex-col" style={{ background:'var(--bg)' }}>

      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-2 flex-shrink-0">
        <h1 style={{ fontFamily:'DM Serif Display, serif', fontStyle:'italic', fontSize:'1.5rem', color:'var(--text)', letterSpacing:'-0.02em' }}>
          Spiral <span style={{ color:'var(--accent)' }}>Art</span>
        </h1>
        {hasImage && (
          <button onClick={() => setShowExport(true)}
            className="w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all active:scale-90"
            style={{ background:'var(--surface2)', border:'1px solid var(--border)', color:'var(--text)' }}>
            ↓
          </button>
        )}
      </div>

      {/* Canvas area */}
      <div className="flex-1 flex items-center justify-center min-h-0 px-4" style={{ padding:'0.5rem 1rem' }}>
        <div className="relative flex items-center justify-center" style={{ width:'100%', maxWidth:520, aspectRatio:'1', margin:'0 auto' }}>
          <div className="w-full h-full rounded-full overflow-hidden"
            style={{ boxShadow:'0 0 0 1px var(--border), 0 20px 60px rgba(0,0,0,0.5)' }}>
            <SpiralCanvas ref={canvasRef} />
          </div>

          {!hasImage && (
            <div
              className="absolute inset-0 rounded-full flex flex-col items-center justify-center gap-3 cursor-pointer"
              style={{ background:'var(--surface)', border:'2px dashed var(--border)' }}
              onClick={triggerUpload}
            >
              <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl"
                style={{ background:'var(--surface2)', color:'var(--muted)' }}>🖼</div>
              <span style={{ fontSize:'0.72rem', color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.08em' }}>
                Toque para adicionar
              </span>
            </div>
          )}

          {hasImage && (
            <div className="absolute flex flex-col gap-2" style={{ right:'-3rem', top:'50%', transform:'translateY(-50%)' }}>
              <button onClick={triggerUpload}
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-90"
                style={{ background:'var(--surface2)', border:'1px solid var(--border)', color:'var(--text)', fontSize:'1rem', cursor:'pointer' }}>
                🔄
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <ControlsPanel />

      {showCrop && srcImg && (
        <CropScreen srcImg={srcImg} onConfirm={handleCropConfirm} onCancel={() => setShowCrop(false)} />
      )}

      {showExport && (
        <ExportSheet canvasRef={canvasRef} onClose={() => setShowExport(false)} />
      )}

      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  )
}
