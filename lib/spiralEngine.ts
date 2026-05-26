import type { SpiralPath } from '@/store/generatorStore'

interface GenerateParams {
  turns: number
  thickness: number   // 0..1
  gap: number         // 0..1
  intensity: number   // gamma
  jitter: number      // 0..1
  mode: 'halftone' | 'template'
  color: string
  outSize: number
  getBrightness: (nx: number, ny: number) => number
}

export function generateSpiral(
  ctx: CanvasRenderingContext2D,
  params: GenerateParams
): SpiralPath[] {
  const { turns, thickness, gap, intensity, jitter, mode, color, outSize, getBrightness } = params

  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, outSize, outSize)

  const cx = outSize / 2, cy = outSize / 2
  const maxR = outSize * 0.48
  const totalAngle = turns * 2 * Math.PI
  const steps = turns * 360

  // Spacing guard
  const spiralSpacing = maxR / turns
  const paintZone = spiralSpacing * (1 - gap)
  const maxLw = Math.max(0.5, paintZone * thickness)
  const minLw = Math.max(0.3, maxLw * 0.07)

  // Smooth noise (unique per call)
  const s = Array.from({ length: 4 }, () => Math.random() * 1000)
  const noise = (t: number) =>
    Math.sin(t * 23.7 + s[0]) * 0.5 +
    Math.sin(t * 7.3  + s[1]) * 0.3 +
    Math.sin(t * 41.1 + s[2]) * 0.13 +
    Math.sin(t * 3.1  + s[3]) * 0.07

  // Build points
  const points: { x: number; y: number; lw: number }[] = []
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const angle = t * totalAngle
    const r = t * maxR
    const x = cx + r * Math.cos(angle)
    const y = cy + r * Math.sin(angle)
    const nx = (x - cx) / maxR
    const ny = (y - cy) / maxR

    let b = getBrightness(nx, ny)
    b = Math.pow(Math.max(0, Math.min(1, b)), 1 / intensity)

    const base = minLw + (1 - b) * (maxLw - minLw)
    const lw = Math.max(0.3, base + jitter * base * 0.4 * noise(t))
    points.push({ x, y, lw })
  }

  const paths: SpiralPath[] = []

  if (mode === 'halftone') {
    for (let i = 1; i < points.length; i++) {
      const p0 = points[i - 1], p1 = points[i]
      const lw = (p0.lw + p1.lw) / 2
      ctx.beginPath()
      ctx.moveTo(p0.x, p0.y)
      ctx.lineTo(p1.x, p1.y)
      ctx.lineWidth = lw
      ctx.strokeStyle = color
      ctx.lineCap = 'round'
      ctx.stroke()
      paths.push({ mode: 'solid', x1: p0.x, y1: p0.y, x2: p1.x, y2: p1.y, lw })
    }
  } else {
    const EDGE = Math.max(0.5, outSize / 2500)
    const normals = points.map((p, i) => {
      const prev = points[Math.max(0, i - 1)]
      const next = points[Math.min(points.length - 1, i + 1)]
      const dx = next.x - prev.x, dy = next.y - prev.y
      const len = Math.sqrt(dx * dx + dy * dy) || 1
      return { nx: -dy / len, ny: dx / len }
    })
    const outer = points.map((p, i) => ({ x: p.x + normals[i].nx * (p.lw / 2), y: p.y + normals[i].ny * (p.lw / 2) }))
    const inner = points.map((p, i) => ({ x: p.x - normals[i].nx * (p.lw / 2), y: p.y - normals[i].ny * (p.lw / 2) }))
    const last = points.length - 1

    ctx.beginPath()
    ctx.moveTo(outer[0].x, outer[0].y)
    for (let i = 1; i <= last; i++) ctx.lineTo(outer[i].x, outer[i].y)
    ctx.lineTo(inner[last].x, inner[last].y)
    for (let i = last - 1; i >= 0; i--) ctx.lineTo(inner[i].x, inner[i].y)
    ctx.closePath()
    ctx.fillStyle = 'white'
    ctx.lineWidth = EDGE
    ctx.strokeStyle = color
    ctx.lineJoin = 'round'
    ctx.fill()
    ctx.stroke()

    for (let i = 1; i < points.length; i++) {
      const p0 = points[i-1], p1 = points[i]
      const n0 = normals[i-1], n1 = normals[i]
      const h0 = p0.lw / 2, h1 = p1.lw / 2
      paths.push({
        mode: 'template',
        ox1: p0.x + n0.nx * h0, oy1: p0.y + n0.ny * h0,
        ox2: p1.x + n1.nx * h1, oy2: p1.y + n1.ny * h1,
        ix1: p0.x - n0.nx * h0, iy1: p0.y - n0.ny * h0,
        ix2: p1.x - n1.nx * h1, iy2: p1.y - n1.ny * h1,
        edgeW: EDGE,
      })
    }
  }

  return paths
}

export function buildSampler(bitmap: HTMLCanvasElement, contrast: number) {
  const SZ = 512
  const c = document.createElement('canvas')
  c.width = c.height = SZ
  const ctx = c.getContext('2d')!
  ctx.filter = `grayscale(1) contrast(${contrast})`
  ctx.drawImage(bitmap, 0, 0, SZ, SZ)
  return (nx: number, ny: number): number => {
    const px = Math.max(0, Math.min(SZ - 1, Math.round((nx + 1) / 2 * (SZ - 1))))
    const py = Math.max(0, Math.min(SZ - 1, Math.round((ny + 1) / 2 * (SZ - 1))))
    return ctx.getImageData(px, py, 1, 1).data[0] / 255
  }
}
