import type { Artifact } from './types'
import amazighJewelryImage from './assets/marketplace/amazigh-jewelry.jpg'
import amazighNecklaceImage from './assets/marketplace/amazigh-necklace.jpg'
import antiqueTelephoneImage from './assets/marketplace/antique-telephone.jpg'
import ceramicVaseAltImage from './assets/marketplace/ceramic-vase-alt.jpg'
import ceramicVaseImage from './assets/marketplace/ceramic-vase.jpg'
import chronicleLeafImage from './assets/marketplace/chronicle-leaf.jpg'
import chronographWatchImage from './assets/marketplace/chronograph-watch.jpg'
import classicalBustImage from './assets/marketplace/classical-bust.jpg'
import luxuryBagImage from './assets/marketplace/luxury-bag.jpg'
import moroccanRugImage from './assets/marketplace/moroccan-rug.jpg'
import royalCarouselImage from './assets/marketplace/royal-carousel.jpg'
import silverTeaServiceImage from './assets/marketplace/silver-tea-service.jpg'
import traditionalCaftanImage from './assets/marketplace/traditional-caftan.jpg'
import walnutCabinetImage from './assets/marketplace/walnut-cabinet.jpg'

const transparentImage = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=='

const imageLibrary = {
  art: [luxuryBagImage, classicalBustImage, chronicleLeafImage, royalCarouselImage],
  furniture: [walnutCabinetImage, royalCarouselImage, silverTeaServiceImage, antiqueTelephoneImage],
  jewelry: [amazighJewelryImage, amazighNecklaceImage, classicalBustImage, chronographWatchImage],
  decor: [antiqueTelephoneImage, silverTeaServiceImage, royalCarouselImage, walnutCabinetImage],
  lighting: [silverTeaServiceImage, antiqueTelephoneImage, royalCarouselImage, chronographWatchImage],
  ceramics: [ceramicVaseImage, ceramicVaseAltImage, silverTeaServiceImage, royalCarouselImage],
  textiles: [moroccanRugImage, traditionalCaftanImage, chronicleLeafImage, luxuryBagImage],
  fashion: [traditionalCaftanImage, luxuryBagImage, amazighNecklaceImage, royalCarouselImage],
  instruments: [chronographWatchImage, antiqueTelephoneImage, silverTeaServiceImage, royalCarouselImage],
  manuscripts: [chronicleLeafImage, royalCarouselImage, silverTeaServiceImage, antiqueTelephoneImage],
  default: [transparentImage],
} as const

function normalizeCategory(value?: string) {
  return (value || '').toLowerCase().trim()
}

export function resolveMarketplaceImage(
  artifact: Pick<Artifact, 'id' | 'title' | 'category_name' | 'image'>,
  variant = 0,
) {
  const title = artifact.title.toLowerCase()
  const useFallbackLibrary = title.includes('japanese pine trees folding screen')

  if (artifact.image && !useFallbackLibrary) {
    return artifact.image
  }

  const category = normalizeCategory(artifact.category_name)

  const key =
    category.includes('furn') || title.includes('cabinet') || title.includes('table')
      ? 'furniture'
      : category.includes('art') || title.includes('vermeer') || title.includes('painting')
        ? 'art'
        : category.includes('jewel') || title.includes('brooch')
          ? 'jewelry'
          : category.includes('light') || title.includes('lamp')
            ? 'lighting'
            : category.includes('ceramic') || title.includes('vase') || title.includes('porcelain')
              ? 'ceramics'
              : category.includes('textile') || title.includes('carpet')
                ? 'textiles'
                : category.includes('fashion') || title.includes('robe')
                  ? 'fashion'
                  : category.includes('instrument') || title.includes('violin')
                    ? 'instruments'
                    : category.includes('manuscript') || title.includes('bible')
                      ? 'manuscripts'
                      : category.includes('decor') || title.includes('clock')
                        ? 'decor'
                        : 'default'

  const list = imageLibrary[key] ?? imageLibrary.default
  return list[(artifact.id + variant) % list.length]
}
