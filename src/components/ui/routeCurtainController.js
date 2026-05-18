let api = null
let readyResolve = null
let routeContentVisible = true
let routeCurtainEnabled = true
const visibilityListeners = new Set()
const revealStartListeners = new Set()
const routeCurtainEnabledListeners = new Set()
const readyPromise = new Promise((resolve) => {
  readyResolve = resolve
})

export const registerRouteCurtain = (instance) => {
  api = instance
  readyResolve?.(instance)
}

const waitForApi = async () => {
  if (api) return api
  return readyPromise
}

export const setRouteContentVisible = (visible) => {
  routeContentVisible = visible
  visibilityListeners.forEach((listener) => listener(routeContentVisible))
}

export const isRouteContentVisible = () => routeContentVisible

export const subscribeRouteContentVisible = (listener) => {
  visibilityListeners.add(listener)
  listener(routeContentVisible)
  return () => {
    visibilityListeners.delete(listener)
  }
}

export const setRouteCurtainEnabled = (enabled) => {
  routeCurtainEnabled = enabled
  routeCurtainEnabledListeners.forEach((listener) => listener(routeCurtainEnabled))
}

export const isRouteCurtainEnabled = () => routeCurtainEnabled

export const subscribeRouteCurtainEnabled = (listener) => {
  routeCurtainEnabledListeners.add(listener)
  listener(routeCurtainEnabled)
  return () => {
    routeCurtainEnabledListeners.delete(listener)
  }
}

export const emitRouteRevealStart = () => {
  revealStartListeners.forEach((listener) => listener())
}

export const subscribeRouteRevealStart = (listener) => {
  revealStartListeners.add(listener)
  return () => {
    revealStartListeners.delete(listener)
  }
}

export const coverRouteCurtain = async () => {
  const instance = await waitForApi()
  if (!instance?.cover) return
  return instance.cover()
}

export const revealRouteCurtain = async () => {
  const instance = await waitForApi()
  if (!instance?.reveal) return
  return instance.reveal()
}
