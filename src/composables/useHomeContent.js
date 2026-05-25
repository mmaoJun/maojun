import { ref } from 'vue'
import { homePageConfig, siteFooter } from '../config/siteContent'

const sections = ref({})
export function useHomeContent() {
  const fetchContent = async () => {
    try {
      const res = await fetch('/api/home-content/public')
      const json = await res.json()
      if (json.data && json.data.length) {
        json.data.forEach((item) => {
          try {
            sections.value[item.sectionKey] = JSON.parse(item.contentJson)
          } catch {
            sections.value[item.sectionKey] = {}
          }
        })
      }
    } catch {
      // Fall back to siteContent.js defaults
    }
  }

  const get = (key, defaultGetter) => {
    const apiData = sections.value[key]
    if (apiData) return apiData
    return typeof defaultGetter === 'function' ? defaultGetter() : defaultGetter
  }

  const hero = () => {
    const data = sections.value['home/part1']
    const raw = data?.heroMedia || homePageConfig.heroMedia
    // backward compat: old format had { video } instead of { type, src }
    const heroMedia = {
      type: raw.type || (raw.video ? 'video' : 'image'),
      src: raw.src || raw.video || '',
      loaderCenterImage: raw.loaderCenterImage || homePageConfig.heroMedia.loaderCenterImage,
      fallbackPoster: raw.fallbackPoster || homePageConfig.heroMedia.fallbackPoster,
    }
    return {
      heroMedia,
      heroTip: data?.heroTip ?? homePageConfig.heroTip,
      revealText: data?.revealText ?? 'DESIGN BY AI',
    }
  }

  const collectionImages = () => {
    const data = sections.value['home/part2']
    if (data?.images) return data.images
    return Array.from({ length: 12 }, (_, i) => `/home/part1/${i + 1}.png`)
  }

  const animatedSlideshow = () => {
    const data = sections.value['home/part3']
    return {
      eyebrow: data?.eyebrow ?? homePageConfig.animatedSlideshow.eyebrow,
      slides: data?.slides || homePageConfig.animatedSlideshow.slides,
    }
  }

  const marqueeCards = () => {
    const data = sections.value['home/part4']
    return {
      heading: data?.heading ?? 'Design By AI',
      description: data?.description ?? 'The UI design is inspired by 21st.dev, and the image materials come from pexels.com.',
      cards: data?.cards || [],
    }
  }

  const cardFlip = () => {
    const data = sections.value['home/part5']
    return {
      cardsImage: data?.cardsImage || homePageConfig.cardsImage,
      cardBackImages: data?.cardBackImages || homePageConfig.cardBackImages,
      title: data?.title ?? 'DESIGN BY AI',
    }
  }

  const parallaxGallery = () => {
    const data = sections.value['home/part6']
    return {
      galleryTitle: data?.galleryTitle ?? 'MAOJUN',
      buttonLabel: data?.buttonLabel ?? 'about',
      route: data?.route || homePageConfig.parallaxFloatingGallery.route,
      images: data?.images || homePageConfig.parallaxFloatingGallery.images,
    }
  }

  const footerData = () => {
    const data = sections.value['home/part6']
    if (data?.footer) return { ...siteFooter, ...data.footer }
    return siteFooter
  }

  const loaderData = () => {
    const data = sections.value['home/part7']
    if (data) {
      if (data.items) {
        return {
          title: data.title || homePageConfig.loader.title,
          sideHeading: data.sideHeading || homePageConfig.loader.sideHeading,
          images: data.items.map(i => i.image).filter(Boolean),
          tracks: data.items.map(i => i.track),
        }
      }
      return { ...homePageConfig.loader, ...data }
    }
    return homePageConfig.loader
  }

  return {
    sections,
    fetchContent,
    get,
    hero,
    collectionImages,
    animatedSlideshow,
    marqueeCards,
    cardFlip,
    parallaxGallery,
    footerData,
    loaderData,
  }
}
