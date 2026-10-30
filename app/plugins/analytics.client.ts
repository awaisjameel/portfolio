export default defineNuxtPlugin(() => {
  const { analyticsSrc, analyticsWebsiteId } = useRuntimeConfig().public
  if (!analyticsSrc || !analyticsWebsiteId) return

  const script = document.createElement('script')
  script.defer = true
  script.src = analyticsSrc
  script.dataset.websiteId = analyticsWebsiteId
  document.head.appendChild(script)
})
