import nprogress from 'nprogress'

const BACKLINK_NAV_KEY = 'backlink-nav'
const SCROLL_REVEAL_SELECTOR = [
  '.post-document .post-content > *',
  '.post-document .post-navigation',
  '.field-post-row',
].join(', ')

let scrollRevealObserver: IntersectionObserver | undefined

function normalizePath(value?: string) {
  if (!value) return ''
  return value.endsWith('/') ? value : `${value}/`
}

function getCurrentPathWithSearch() {
  return `${normalizePath(window.location.pathname)}${window.location.search}`
}

function setupScrollReveal() {
  scrollRevealObserver?.disconnect()
  scrollRevealObserver = undefined

  const items = Array.from(
    document.querySelectorAll<HTMLElement>(SCROLL_REVEAL_SELECTOR)
  )

  items.forEach((item) => item.classList.remove('is-scroll-revealed'))

  if (
    items.length === 0 ||
    !('IntersectionObserver' in window) ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    document.documentElement.classList.remove('scroll-reveal-enabled')
    return
  }

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

  items.forEach((item) => scrollRevealObserver?.observe(item))
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

document.addEventListener('astro:page-load', () => {
  nprogress.done()
  setupScrollReveal()
})
