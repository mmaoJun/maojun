const OSS_BASE = 'https://maojunweb.oss-cn-beijing.aliyuncs.com'

export function proxyUrl(url) {
  if (!url) return url
  if (import.meta.env.DEV && url.startsWith(OSS_BASE)) {
    return url.slice(OSS_BASE.length)
  }
  return url
}
