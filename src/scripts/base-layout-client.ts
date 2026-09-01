import nprogress from 'nprogress'

const BACKLINK_NAV_KEY = 'backlink-nav'
const SCROLL_REVEAL_SELECTOR = '.field-post-row'
const REVEAL_SEEN_KEY = 'field-reveal-seen'
const ENTRANCE_CLASSES = ['scroll-reveal-enabled', 'enter-anim']

let scrollRevealObserver: IntersectionObserver | undefined

function normalizePath(value?: string) {
  if (!value) return ''
  return value.endsWith('/') ? value : `${value}/`
}

function getCurrentPathWithSearch() {
  return `${normalizePath(window.location.pathname)}${window.location.search}`
}

function revealAlreadyShown() {
  try {
    return sessionStorage.getItem(REVEAL_SEEN_KEY) === '1'
  } catch {
    return true
  }
}

function markRevealShown() {
  try {
    sessionStorage.setItem(REVEAL_SEEN_KEY, '1')
  } catch {
    /* ignore */
  }
}

function stripEntranceClasses() {
  document.documentElement.classList.remove(...ENTRANCE_CLASSES)
}

function setupScrollReveal() {
  scrollRevealObserver?.disconnect()
  scrollRevealObserver = undefined

  // The entrance plays once per tab session; afterwards lists must never be
  // hidden again by re-initialisation.
  if (revealAlreadyShown()) {
    stripEntranceClasses()
    return
  }

  const items = Array.from(
    document.querySelectorAll<HTMLElement>(SCROLL_REVEAL_SELECTOR)
  )

  if (
    items.length === 0 ||
    !('IntersectionObserver' in window) ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    stripEntranceClasses()
    markRevealShown()
    return
  }

  markRevealShown()
  document.documentElement.classList.add('scroll-reveal-enabled')

  scrollRevealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return

        entry.target.classList.add('is-scroll-revealed')
        observer.unobserve(entry.target)
      })
    },
    {
      rootMargin: '0px 0px -14% 0px',
      threshold: 0.05,
    }
  )

  items.forEach((item) => {
    // Rows already on screen (restored scroll included) show up at once, so
    // the reveal pass can never hide something the visitor is looking at.
    const rect = item.getBoundingClientRect()
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      item.classList.add('is-scroll-revealed')
    } else {
      scrollRevealObserver?.observe(item)
    }
  })
}

document.addEventListener('click', (event) => {
  const target = event.target
  if (!(target instanceof Element)) return

  const link = target.closest('a')
  if (!(link instanceof HTMLAnchorElement)) return
  if (!link.href) return
  if (
    link.target === '_blank' ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  ) {
    return
  }

  try {
    const nextUrl = new URL(link.href, window.location.href)
    if (nextUrl.origin !== window.location.origin) return
    if (
      nextUrl.hash &&
      normalizePath(nextUrl.pathname) ===
        normalizePath(window.location.pathname) &&
      nextUrl.search === window.location.search
    ) {
      return
    }

    sessionStorage.setItem(
      BACKLINK_NAV_KEY,
      JSON.stringify({
        from: getCurrentPathWithSearch(),
        to: `${normalizePath(nextUrl.pathname)}${nextUrl.search}`,
      })
    )
  } catch {
    return
  }
})

document.addEventListener('astro:before-preparation', () => {
  nprogress.start()
})

document.addEventListener('astro:after-swap', () => {
  // Strip the entrance classes before the swapped-in page can paint, so
  // revisited pages render fully visible instead of re-animating.
  if (revealAlreadyShown()) stripEntranceClasses()
})

document.addEventListener('astro:page-load', () => {
  nprogress.done()
  setupScrollReveal()
})
