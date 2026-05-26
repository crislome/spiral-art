'use client'
import { useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react'
import { useGeneratorStore } from '@/store/generatorStore'
import { generateSpiral, buildSampler } from '@/lib/spiralEngine'

export interface SpiralCanvasHandle {
  getCanvas: () => HTMLCanvasElement | null
}

export const SpiralCanvas = forwardRef<SpiralCanvasHandle>((_, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { mode, rings, thickness, contrast, organic, color, croppedBitmap, hasImage, setGenerating, setSpiralPaths } = useGeneratorStore()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useImperativeHandle(ref, () => ({ getCanvas: () => canvasRef.current }))

  const runGenerate = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || !hasImage || !croppedBitmap) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const OUT = 1200
    canvas.width = canvas.height = OUT

    const turns = Math.round(25 + rings * 65)
    const thick = 0.1 + thickness * 0.8
    const gap = 0.28
    const intensity = 0.4 + contrast * 3.2
    const jitter = organic * 0.8
    const cssContrast = 0.5 + contrast * 3.5

    const getBrightness = buildSampler(croppedBitmap, cssContrast)

    const paths = generateSpiral(ctx, {
      turns, thickness: thick, gap, intensity, jitter,
      mode, color, outSize: OUT, getBrightness
    })
    setSpiralPaths(paths)
  }, [mode, rings, thickness, contrast, organic, color, croppedBitmap, hasImage, setSpiralPaths])

  // Debounced live generation
  useEffect(() => {
    if (!hasImage) return
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      runGenerate()
    }, 160)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [mode, rings, thickness, contrast, organic, color, hasImage, runGenerate])

  // Initial size
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const size = Math.min(canvas.parentElement?.offsetWidth ?? 300, 1200)
    canvas.style.width = '100%'
    canvas.style.height = '100%'
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{ display:'block', borderRadius:'50%', width:'100%', height:'100%' }}
    />
  )
})
SpiralCanvas.displayName = 'SpiralCanvas'
