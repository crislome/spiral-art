import type { SpiralPath } from '@/store/generatorStore'

export function exportPNG(canvas: HTMLCanvasElement) {
  const link = document.createElement('a')
  link.download = 'spiral-art.png'
  link.href = canvas.toDataURL('image/png')
  link.click()
}

export function exportSVG(paths: SpiralPath[], color: string, size = 1200) {
  let svg = `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">\n<rect width="${size}" height="${size}" fill="white"/>\n`

  if (paths[0]?.mode === 'solid') {
    for (const p of paths as Extract<SpiralPath, { mode: 'solid' }>[])
      svg += `<line x1="${p.x1.toFixed(1)}" y1="${p.y1.toFixed(1)}" x2="${p.x2.toFixed(1)}" y2="${p.y2.toFixed(1)}" stroke="${color}" stroke-width="${p.lw.toFixed(2)}" stroke-linecap="round"/>\n`
  } else {
    const tp = paths as Extract<SpiralPath, { mode: 'template' }>[]
    const ew = tp[0].edgeW.toFixed(2)
    let od = `M ${tp[0].ox1.toFixed(1)} ${tp[0].oy1.toFixed(1)}`
    let id2 = `M ${tp[0].ix1.toFixed(1)} ${tp[0].iy1.toFixed(1)}`
    for (const p of tp) {
      od += ` L ${p.ox2.toFixed(1)} ${p.oy2.toFixed(1)}`
      id2 += ` L ${p.ix2.toFixed(1)} ${p.iy2.toFixed(1)}`
    }
    const last = tp[tp.length - 1]
    svg += `<path d="${od}" fill="none" stroke="${color}" stroke-width="${ew}" stroke-linecap="round" stroke-linejoin="round"/>\n`
    svg += `<path d="${id2}" fill="none" stroke="${color}" stroke-width="${ew}" stroke-linecap="round" stroke-linejoin="round"/>\n`
    svg += `<line x1="${last.ox2.toFixed(1)}" y1="${last.oy2.toFixed(1)}" x2="${last.ix2.toFixed(1)}" y2="${last.iy2.toFixed(1)}" stroke="${color}" stroke-width="${ew}" stroke-linecap="round"/>\n`
    svg += `<line x1="${tp[0].ox1.toFixed(1)}" y1="${tp[0].oy1.toFixed(1)}" x2="${tp[0].ix1.toFixed(1)}" y2="${tp[0].iy1.toFixed(1)}" stroke="${color}" stroke-width="${ew}" stroke-linecap="round"/>\n`
  }

  svg += '</svg>'
  const blob = new Blob([svg], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.download = 'spiral-art.svg'; a.href = url; a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function exportPDF(canvas: HTMLCanvasElement) {
  const PAGE_W = 595.28, PAGE_H = 841.89, MARGIN = 28
  const imgSide = Math.min(PAGE_W - MARGIN * 2, PAGE_H - MARGIN * 2)
  const imgX = ((PAGE_W - imgSide) / 2).toFixed(2)
  const imgY = ((PAGE_H - imgSide) / 2).toFixed(2)

  const b64 = canvas.toDataURL('image/jpeg', 0.95).split(',')[1]
  const binary = atob(b64)
  const imgBytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) imgBytes[i] = binary.charCodeAt(i)

  const enc = (s: string) => new TextEncoder().encode(s)
  const parts: Uint8Array[] = []
  const offsets: number[] = []
  const push = (s: string) => parts.push(enc(s))
  const pushB = (b: Uint8Array) => parts.push(b)
  const totalLen = () => parts.reduce((a, p) => a + p.length, 0)

  push('%PDF-1.4\n%\xFF\xFF\xFF\xFF\n')
  offsets.push(totalLen()); push('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n')
  offsets.push(totalLen()); push('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n')
  offsets.push(totalLen()); push(`3 0 obj\n<< /Type /Page /Parent 2 0 R\n   /MediaBox [0 0 ${PAGE_W.toFixed(2)} ${PAGE_H.toFixed(2)}]\n   /Contents 4 0 R /Resources << /XObject << /Im0 5 0 R >> >> >>\nendobj\n`)
  const sc = `q\n${imgSide.toFixed(2)} 0 0 ${imgSide.toFixed(2)} ${imgX} ${imgY} cm\n/Im0 Do\nQ\n`
  offsets.push(totalLen()); push(`4 0 obj\n<< /Length ${sc.length} >>\nstream\n${sc}endstream\nendobj\n`)
  offsets.push(totalLen())
  push(`5 0 obj\n<< /Type /XObject /Subtype /Image /Width ${canvas.width} /Height ${canvas.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${imgBytes.length} >>\nstream\n`)
  pushB(imgBytes)
  push('\nendstream\nendobj\n')

  const xrefPos = totalLen()
  let xref = `xref\n0 6\n0000000000 65535 f \n`
  for (const off of offsets) xref += String(off).padStart(10, '0') + ' 00000 n \n'
  push(xref)
  push(`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF\n`)

  const total = parts.reduce((a, p) => a + p.length, 0)
  const out = new Uint8Array(total)
  let pos = 0
  for (const p of parts) { out.set(p, pos); pos += p.length }

  const blob = new Blob([out], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.download = 'spiral-art.pdf'; a.href = url; a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
