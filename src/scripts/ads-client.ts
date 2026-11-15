// AdSense 待命載入 client（0007 實裝）。
// 依 0002 Resolution：捲動接近才插入 <ins>＋push({})、每單元只 push 一次、禁用 display:none 前置。
// 0003 定案：unfilled 保留空間顯示「此版位目前沒有廣告」（防 CLS 位移）；無 AdBlock 提示（不干擾讀者）。
import { ADS } from '~/config/ads'

declare global {
  interface Window {
    adsbygoogle?: unknown[]
  }
}

// 對齊 Ray 實作的 25s 未填滿判定常數。
const UNFILLED_TIMEOUT_MS = 25_000
const UNFILLED_COPY = '此版位目前沒有廣告'

let scriptPromise: Promise<void> | null = null

function loadAdsenseScript(): Promise<void> {
  scriptPromise ??= new Promise((resolve, reject) => {
    // BaseLayout <head> 已有驗證片段（0001）：同款腳本已在頁面即直接就緒，避免重複載入。
    if (document.querySelector('script[src*="adsbygoogle.js"]')) {
      resolve()
      return
    }
    const script = document.createElement('script')
    script.async = true
    script.crossOrigin = 'anonymous'
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADS.client}`
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('adsbygoogle.js load failed'))
    document.head.append(script)
  })
  return scriptPromise
}

function showFallback(stage: HTMLElement, text: string): void {
  const copy = document.createElement('p')
  copy.className = 'ad-slot__copy'
  copy.textContent = text
  stage.replaceChildren(copy)
}

function insertAd(stage: HTMLElement): void {
  const slot = stage.dataset.adUnit
  if (!slot) return
  const ins = document.createElement('ins')
  ins.className = 'adsbygoogle ad-slot__ins'
  ins.dataset.adClient = ADS.client
  ins.dataset.adSlot = slot
  ins.dataset.adFormat = 'auto'
  ins.dataset.fullWidthResponsive = 'true'
  stage.replaceChildren(ins)
  try {
    ;(window.adsbygoogle = window.adsbygoogle || []).push({})
  } catch {
    showFallback(stage, UNFILLED_COPY)
    return
  }
  window.setTimeout(() => {
    if (ins.dataset.adStatus === 'unfilled') {
      showFallback(stage, UNFILLED_COPY)
    }
  }, UNFILLED_TIMEOUT_MS)
}

function setup(): void {
  const stages = document.querySelectorAll<HTMLElement>('[data-ad-stage]')
  // 未啟用（0004 尚未填 ID）：保留待命框，不發任何請求。
  if (stages.length === 0 || !ADS.enabled) return
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        io.unobserve(entry.target)
        const stage = entry.target as HTMLElement
        loadAdsenseScript()
          .then(() => insertAd(stage))
          // 腳本載入失敗（多為攔截擴充）＝誠實留白，不提示、不打擾（0003 定案）。
          .catch(() => showFallback(stage, UNFILLED_COPY))
      }
    },
    { rootMargin: '200px 0px' }
  )
  stages.forEach((stage) => io.observe(stage))
}

setup()
