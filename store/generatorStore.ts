import { create } from 'zustand'

export type GeneratorMode = 'halftone' | 'template'

export interface GeneratorState {
  // UI
  mode: GeneratorMode
  hasImage: boolean
  isGenerating: boolean
  // Params (all 0..1 normalized)
  rings: number        // → turns 25..90
  thickness: number   // → thickness% 10..90
  contrast: number    // → intensity 0.4..3.6 + css contrast
  organic: number     // → jitter 0..80%
  // Color
  color: string
  // Image data
  croppedBitmap: HTMLCanvasElement | null
  // Export paths
  spiralPaths: SpiralPath[]
}

export type SpiralPath =
  | { mode: 'solid'; x1:number; y1:number; x2:number; y2:number; lw:number }
  | { mode: 'template'; ox1:number; oy1:number; ox2:number; oy2:number;
                        ix1:number; iy1:number; ix2:number; iy2:number; edgeW:number }

export interface GeneratorActions {
  setMode: (m: GeneratorMode) => void
  setParam: (key: keyof Pick<GeneratorState,'rings'|'thickness'|'contrast'|'organic'>, v: number) => void
  setColor: (c: string) => void
  setCroppedBitmap: (b: HTMLCanvasElement) => void
  setGenerating: (v: boolean) => void
  setSpiralPaths: (p: SpiralPath[]) => void
  setHasImage: (v: boolean) => void
}

export const useGeneratorStore = create<GeneratorState & GeneratorActions>((set) => ({
  mode: 'halftone',
  hasImage: false,
  isGenerating: false,
  rings: 0.50,
  thickness: 0.50,
  contrast: 0.45,
  organic: 0.20,
  color: '#111111',
  croppedBitmap: null,
  spiralPaths: [],

  setMode: (mode) => set({ mode }),
  setParam: (key, v) => set({ [key]: v }),
  setColor: (color) => set({ color }),
  setCroppedBitmap: (croppedBitmap) => set({ croppedBitmap }),
  setGenerating: (isGenerating) => set({ isGenerating }),
  setSpiralPaths: (spiralPaths) => set({ spiralPaths }),
  setHasImage: (hasImage) => set({ hasImage }),
}))
