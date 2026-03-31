/**
 * Locks the scroll position of the document.
 */
export function lockScroll() {
  const bodyEl = document.body

  const scrollbarWidth = window.innerWidth - bodyEl.clientWidth
  const hasRose = document.getElementById('bg-rose')
  if (scrollbarWidth > 0 && !hasRose)
    bodyEl.style.paddingRight = `${scrollbarWidth}px`
  bodyEl.style.overflow = 'hidden'
}

/**
 * Unlocks the scroll position of the document.
 */
export function unlockScroll() {
  const bodyEl = document.body

  bodyEl.style.removeProperty('overflow')
  bodyEl.style.removeProperty('padding-right')
}

/**
 * Controls the fading animation of an element,
 * showing or hiding it based on visibility.
 */
export function toggleFadeEffect(
  elementId: string,
  visible: boolean,
  hiddenClass: string
) {
  const element = document.getElementById(elementId)
  if (!element) return

  if (visible) {
    element.classList.remove(hiddenClass)
    if (elementId === 'backdrop') lockScroll()
    // if (elementId === 'backdrop') document.body.style.overflow = 'hidden'
    // if (elementId === 'backdrop') document.documentElement.style.overflow = 'hidden'
    if (window.matchMedia('(prefers-reduced-motion)').matches) return
    element.classList.add('fade-in')
  } else {
    if (window.matchMedia('(prefers-reduced-motion)').matches) {
      element.classList.add(hiddenClass)
      if (elementId === 'backdrop') unlockScroll()
      // if (elementId === 'backdrop') document.body.style.overflow = ''
      // if (elementId === 'backdrop') document.documentElement.style.overflow = ''
      return
    }
    element.classList.add('fade-out')
    element.addEventListener(
      'animationend',
      () => {
        element.classList.remove('fade-in', 'fade-out')
        element.classList.add(hiddenClass)
        if (elementId === 'backdrop') unlockScroll()
        // if (elementId === 'backdrop') document.body.style.overflow = ''
        // if (elementId === 'backdrop') document.documentElement.style.overflow = ''
      },
      { once: true }
    )
  }
}

/**
 * Normalizes a content title for social cards.
 *
 * Example: `Day 3 - 專案架構` -> `專案架構`
 */
export function normalizeOgTitle(title: string) {
  const trimmedTitle = title.trim()
  const normalizedTitle = trimmedTitle
    .replace(/^day\s+\d+\s*[-:：]\s*/i, '')
    .trim()

  return normalizedTitle || trimmedTitle
}
