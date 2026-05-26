'use client'
import { useGeneratorStore } from '@/store/generatorStore'
import { exportPNG, exportSVG, exportPDF } from '@/lib/exportUtils'

interface ExportSheetProps {
  canvasRef: React.RefObject<{ getCanvas: () => HTMLCanvasElement | null } | null>
  onClose: () => void
}

export function ExportSheet({ canvasRef, onClose }: ExportSheetProps) {
  const { spiralPaths, color } = useGeneratorStore()

  const handle = (fn: () => void) => { fn(); onClose() }

  const opts = [
    {
      icon: '🖼', label: 'Imagem PNG', sub: 'Alta resolução · compartilhar',
      bg: '#1e2a1e',
      action: () => handle(() => { const c = canvasRef.current?.getCanvas(); if (c) exportPNG(c) })
    },
    {
      icon: '✦', label: 'Vetorial SVG', sub: 'Qualidade infinita · corte a laser',
      bg: '#1a1a2e',
      action: () => handle(() => exportSVG(spiralPaths, color))
    },
    {
      icon: '📄', label: 'PDF para Impressão', sub: 'Página A4 centralizada',
      bg: '#2e1a1a',
      action: () => handle(() => { const c = canvasRef.current?.getCanvas(); if (c) exportPDF(c) })
    },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-end" style={{ background:'rgba(0,0,0,0.6)', backdropFilter:'blur(4px)' }} onClick={onClose}>
      <div className="w-full rounded-t-2xl p-5" style={{ background:'var(--surface)' }} onClick={e => e.stopPropagation()}>
        <div className="w-9 h-1 rounded-full mx-auto mb-5" style={{ background:'var(--border)' }} />
        <p className="font-semibold text-base mb-4">Salvar arte</p>
        <div className="flex flex-col gap-2">
          {opts.map(o => (
            <button key={o.label} onClick={o.action}
              className="flex items-center gap-4 w-full text-left rounded-xl p-4 transition-all active:opacity-70"
              style={{ background:'var(--surface2)', border:'none', color:'var(--text)', fontFamily:'inherit', cursor:'pointer' }}>
              <div className="rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ width:40, height:40, background:o.bg }}>
                {o.icon}
              </div>
              <div>
                <div className="font-medium text-sm">{o.label}</div>
                <div className="text-xs mt-0.5" style={{ color:'var(--muted)' }}>{o.sub}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
