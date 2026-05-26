'use client'
import { useState } from 'react'
import { Slider } from '@/components/ui/Slider'
import { useGeneratorStore } from '@/store/generatorStore'

type Tab = 'rings' | 'thickness' | 'contrast' | 'organic'

const TABS: { id: Tab; label: string }[] = [
  { id: 'rings',     label: 'Voltas' },
  { id: 'thickness', label: 'Espessura' },
  { id: 'contrast',  label: 'Contraste' },
  { id: 'organic',   label: 'Orgânico' },
]

const SLIDER_CONFIG: Record<Tab, { left: string; right: string }> = {
  rings:     { left: 'Poucas',     right: 'Muitas'    },
  thickness: { left: 'Fino',       right: 'Espesso'   },
  contrast:  { left: 'Suave',      right: 'Intenso'   },
  organic:   { left: 'Geométrico', right: 'À mão'     },
}

export function ControlsPanel() {
  const [activeTab, setActiveTab] = useState<Tab>('rings')
  const { rings, thickness, contrast, organic, setParam, mode, setMode } = useGeneratorStore()

  const values: Record<Tab, number> = { rings, thickness, contrast, organic }
  const cfg = SLIDER_CONFIG[activeTab]

  return (
    <div className="flex flex-col gap-0" style={{ background:'var(--surface)', borderTop:'1px solid var(--border)', borderRadius:'20px 20px 0 0', padding:'1rem 1.25rem calc(1.25rem + env(safe-area-inset-bottom, 0px))' }}>

      {/* Mode toggle */}
      <div className="flex gap-2 mb-4 justify-center">
        {(['halftone','template'] as const).map(m => (
          <button key={m} onClick={() => setMode(m)}
            className="px-5 py-2 rounded-full text-sm font-medium transition-all"
            style={{
              background: mode === m ? 'var(--accent)' : 'transparent',
              color: mode === m ? '#111' : 'var(--muted)',
              fontWeight: mode === m ? 700 : 400,
              border: mode === m ? 'none' : '1px solid var(--border)',
            }}>
            {m === 'halftone' ? 'Revelado' : 'Para Pintar'}
          </button>
        ))}
      </div>

      {/* Tab bar */}
      <div className="flex rounded-xl p-0.5 mb-4" style={{ background:'var(--surface2)' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className="flex-1 text-center rounded-lg py-2 transition-all"
            style={{
              fontSize:'0.68rem', fontWeight:500, letterSpacing:'0.04em', textTransform:'uppercase',
              background: activeTab === t.id ? 'var(--bg)' : 'transparent',
              color: activeTab === t.id ? 'var(--text)' : 'var(--muted)',
              border: 'none', cursor:'pointer', fontFamily:'inherit'
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Active slider */}
      <Slider
        value={values[activeTab]}
        onChange={v => setParam(activeTab, v)}
        labelLeft={cfg.left}
        labelRight={cfg.right}
      />
    </div>
  )
}
