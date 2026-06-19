import type { Artifact } from './types'

const encodeFile = (fileName: string) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(fileName)}?width=1200`

const transparentImage = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=='

const imageLibrary = {
  art: [
    'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1578926375605-eaf7559b1458?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8d?auto=format&fit=crop&w=1200&q=85',
  ],
  furniture: [
    encodeFile('Old-table-and-chairs.jpg'),
    encodeFile('Antique Closet (3139773451).jpg'),
    encodeFile('Baleen and ebony table cabinet attributed to herman doomer.jpg'),
    encodeFile('Cabinet MET 210485.jpg'),
  ],
  jewelry: [
    encodeFile('AntiquejewelsHMM.jpg'),
    encodeFile('Beatrice-Cenci-Brosche-Gold-um-1850.jpeg'),
    encodeFile('English - Silver Ring Brooch - Walters 571990.jpg'),
    encodeFile('Luckenbooth brooches .jpg'),
    encodeFile('Ancient Assyria Jewelry (28089395963).jpg'),
  ],
  decor: [
    encodeFile('Antique clock in Katowice shop.JPG'),
    encodeFile('Grandfather clock.JPG'),
    encodeFile('Antique grandfather clock (26282562111).jpg'),
    encodeFile('Antique Grandfather Clock by Grantham Clockmaker 18th century.JPG'),
  ],
  lighting: [
    encodeFile('Argand Lamp MET ADA3409.jpg'),
    encodeFile('Antique clock in Katowice shop.JPG'),
  ],
  ceramics: [
    encodeFile('Saint Cloud soft porcelain vase with blue designs under glaze 1695-1700.jpg'),
    encodeFile('Blue & white porcelain lidded jar.jpg'),
    encodeFile('Export porcelain vase with European scene Kangxi period.jpg'),
    encodeFile('Ming Dynasty porcelain vase, Wanli Reign Period (2).JPG'),
  ],
  textiles: [encodeFile('Ardabil Carpet.jpg')],
  fashion: [encodeFile('Louis XIV of France.jpg')],
  instruments: [encodeFile('"The Gould" Violin MET DT669.jpg')],
  manuscripts: [encodeFile('JoanOfArcLarge.jpeg')],
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
