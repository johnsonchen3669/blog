import nprogress from 'nprogress'

const BACKLINK_NAV_KEY = 'backlink-nav'

function normalizePath(value?: string) {
  if (!value) return ''
  return value.endsWith('/') ? value : `${value}/`
}

function getCurrentPathWithSearch() {
  return `${normalizePath(window.location.pathname)}${window.location.search}`
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
})
