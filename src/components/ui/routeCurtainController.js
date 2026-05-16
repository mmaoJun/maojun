let api = null
let readyResolve = null
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
