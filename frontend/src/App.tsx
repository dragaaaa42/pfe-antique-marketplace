import { type FormEvent, useEffect, useMemo, useState } from 'react'
import { BrowserRouter, Link, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowUpRight,
  BookOpen,
  ChevronRight,
  Menu,
  Plus,
  Sparkles,
  Wand2,
} from 'lucide-react'
import { motion } from 'motion/react'
import './App.css'
import {
  addCartItem,
  addWishlistItem,
  getCart,
  getWishlist,
  removeWishlistItem,
  type RegisterPayload,
  demoArtifacts,
  fallbackArtifactImage,
  getArtifact,
  getArtifacts,
  registerUser,
} from './api'
import { AuthProvider, useAuth } from './auth'
import { AccountPage } from './account'
import { CartPage, CollectorDashboardPage, OrderDetailPage, OrdersPage, WishlistPage } from './buyer'
import {
  AdminArtifactsPage,
  AdminAuditPage,
  AdminDashboardPage,
  AdminGalleriesPage,
  AdminUserDetailPage,
  AdminUsersPage,
} from './admin'
import { Artifact3DViewer } from './components/Artifact3DViewer'
import { MarketplaceImage } from './components/MarketplaceImage'
import atlasPoster from './assets/marketplace/silver-tea-service.jpg'
import {
  SellerDashboardPage,
  SellerGalleriesPage,
  SellerOrderDetailPage,
  SellerOrdersPage,
  SellerProductsPage,
} from './seller'
import { resolveMarketplaceImage } from './marketplaceImages'
import type { Artifact } from './types'

type Language = 'en' | 'fr'

const siteCopy = {
  en: {
    nav: {
      Catalogue: 'Catalogue',
      Galleries: 'Galleries',
      Curators: 'Curators',
      Journal: 'Journal',
    },
    search: 'Search collection',
    signup: 'Sign up',
    language: 'Language',
    hero:
      'Browse Old Master art, period fashion, carved furniture, lighting and textiles in a cinematic marketplace built for 3D discovery.',
    enterCollection: 'Enter the collection',
    viewAll: 'View all objects',
    departments: 'Departments',
    chooseRoom: 'Choose a room to reveal the collection.',
    showAll: 'Show all',
    selectedAntiques: 'Selected antiques',
    curatedResults: 'curated results',
    footerEyebrow: 'Collector services',
    footerTitle: 'Confidence for rare objects.',
    footerText: 'Antique marketplace and immersive virtual gallery for collectors, sellers, and curators.',
    joinGallery: 'Join the gallery',
  },
  fr: {
    nav: {
      Catalogue: 'Catalogue',
      Galleries: 'Galeries',
      Curators: 'Curateurs',
      Journal: 'Journal',
    },
    search: 'Rechercher dans la collection',
    signup: "S'inscrire",
    language: 'Langue',
    hero:
      "Explorez l'art ancien, la mode d'epoque, le mobilier sculpte, les luminaires et les textiles dans une marketplace cinematographique avec inspection 3D.",
    enterCollection: 'Entrer dans la collection',
    viewAll: 'Voir les objets',
    departments: 'Departements',
    chooseRoom: 'Choisissez une salle pour reveler la collection.',
    showAll: 'Tout voir',
    selectedAntiques: 'Antiquites selectionnees',
    curatedResults: 'resultats curates',
    footerEyebrow: 'Services collectionneurs',
    footerTitle: 'Confiance pour les objets rares.',
    footerText:
      'Marketplace antiquaire et galerie virtuelle immersive pour collectionneurs, vendeurs et curateurs.',
    joinGallery: 'Rejoindre la galerie',
  },
} satisfies Record<
  Language,
  {
    nav: Record<string, string>
    search: string
    signup: string
    language: string
    hero: string
    enterCollection: string
    viewAll: string
    departments: string
    chooseRoom: string
    showAll: string
    selectedAntiques: string
    curatedResults: string
    footerEyebrow: string
    footerTitle: string
    footerText: string
    joinGallery: string
  }
>

function formatPrice(value: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number(value))
}

function ArtifactCard({
  artifact,
  variant = 'default',
}: {
  artifact: Artifact
  variant?: 'default' | 'compact'
}) {
  const sourceLabel = 'Verified seller'

  return (
    <motion.article
      className={variant === 'compact' ? 'artifact-card is-compact' : 'artifact-card'}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      <Link className="artifact-image" to={`/artifacts/${artifact.id}`}>
        <MarketplaceImage alt={artifact.title} src={resolveMarketplaceImage(artifact)} />
        <span className="artifact-ribbon">{artifact.category_name ?? 'Uncategorized'}</span>
        <span className="artifact-price-badge">{formatPrice(artifact.price)}</span>
      </Link>
      <div className="artifact-body">
        <div className="artifact-topline">
          <span>{sourceLabel}</span>
          <span className="artifact-condition">{artifact.condition}</span>
        </div>
        <h3>{artifact.title}</h3>
        <p className="artifact-excerpt">{artifact.description}</p>
        <div className="artifact-foot">
          <Link className="text-link" to={`/artifacts/${artifact.id}`}>
            View dossier <ArrowUpRight aria-hidden="true" size={14} />
          </Link>
        </div>
      </div>
    </motion.article>
  )
}

function LegacyCatalogPage() {
  const [artifacts, setArtifacts] = useState<Artifact[]>(demoArtifacts)
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [catalogOpen, setCatalogOpen] = useState(false)
  const [language, setLanguage] = useState<Language>('en')
  const { isAuthenticated, logout, status, user } = useAuth()
  const t = siteCopy[language]

  useEffect(() => {
    getArtifacts()
      .then((items) => {
        if (items.length > 0) {
          setArtifacts(items)
        }
      })
      .catch(() => undefined)
  }, [])

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(artifacts.map((item) => item.category_name ?? 'Uncategorized')))],
    [artifacts],
  )

  const visibleArtifacts = artifacts.filter((artifact) => {
    const matchesCategory =
      activeCategory === 'All' || (artifact.category_name ?? 'Uncategorized') === activeCategory
    const text = `${artifact.title} ${artifact.description} ${artifact.provenance ?? ''}`.toLowerCase()
    return matchesCategory && text.includes(query.toLowerCase())
  })

  const featuredArtifact = artifacts[0] ?? demoArtifacts[0]
  const heroArtifacts = artifacts.slice(0, 8)
  const navItems = ['Catalogue', 'Galleries', 'Curators', 'Journal'] as const
  const navTargets: Record<(typeof navItems)[number], string> = {
    Catalogue: '#catalog',
    Galleries: '#departments',
    Curators: '#curators',
    Journal: '#journal',
  }
  const categoryTiles = categories
    .filter((category) => category !== 'All')
    .slice(0, 4)
    .map((category, index) => {
      const categoryArtifacts = artifacts.filter(
        (item) => (item.category_name ?? 'Uncategorized') === category,
      )
      const artifact = categoryArtifacts[0]
      return {
        name: category,
        count: categoryArtifacts.length,
        image: artifact?.image || fallbackArtifactImage,
        caption:
          [
            'Salon-worthy pieces with documented character.',
            'Aged surfaces, handwork, and serious collector presence.',
            'Statement objects selected for rooms with memory.',
            'Museum mood, marketplace practicality.',
          ][index % 4],
      }
    })

  return (
    <>
      <header className="public-header">
        <Link className="brand-mark" to="/">
          Artisan&apos;s Echo
        </Link>
        <nav className="public-nav" aria-label="Marketplace navigation">
          {navItems.map((item) => (
            <a
              href={navTargets[item]}
              key={item}
              onClick={() => {
                if (item === 'Catalogue') {
                  setActiveCategory('All')
                  setCatalogOpen(true)
                }
              }}
            >
              {t.nav[item]}
            </a>
          ))}
        </nav>
        <div className="header-search">
          <input
            aria-label="Search antiques"
            placeholder={t.search}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <nav className="public-actions" aria-label="Account">
          {isAuthenticated ? (
            <>
              {user?.role === 'buyer' && (
                <>
                  <Link className="ghost-button" to="/wishlist">
                    Wishlist
                  </Link>
                  <Link className="ghost-button" to="/cart">
                    Cart
                  </Link>
                  <Link className="ghost-button" to="/orders">
                    Orders
                  </Link>
                </>
              )}
              {(user?.role === 'seller' || user?.role === 'admin') && (
                <>
                  <Link className="ghost-button" to="/seller">
                    Seller dashboard
                  </Link>
                  <Link className="ghost-button" to="/seller/products">
                    Products
                  </Link>
                  <Link className="ghost-button" to="/seller/galleries">
                    Galleries
                  </Link>
                </>
              )}
              <span className="account-summary">
                {status === 'authenticated' && user
                  ? `${user.first_name || user.email} - ${user.role}`
                  : 'Signed in'}
              </span>
              <button className="ghost-button" onClick={logout} type="button">
                Log out
              </button>
            </>
          ) : (
            <>
              <Link className="ghost-button" to="/login">
                Log in
              </Link>
              <Link className="solid-button" to="/signup">
                {t.signup}
              </Link>
            </>
          )}
          <label className="language-select" title={t.language}>
            <span className="language-icon" aria-hidden="true" />
            <span>{t.language}</span>
            <select
              aria-label="Website language"
              value={language}
              onChange={(event) => setLanguage(event.target.value as Language)}
            >
              <option value="en">EN</option>
              <option value="fr">FR</option>
            </select>
          </label>
        </nav>
      </header>

      <main>
        <section className="cinema-hero" aria-label="Featured antique collection">
          <div className="hero-film" aria-hidden="true">
            <div className="film-track">
              {[...heroArtifacts, ...heroArtifacts].map((artifact, index) => (
                <figure className="film-frame" key={`${artifact.id}-${index}`}>
                  <img src={artifact.image || fallbackArtifactImage} alt="" />
                  <figcaption>{artifact.category_name}</figcaption>
                </figure>
              ))}
            </div>
          </div>

          <div className="hero-vignette" />
          <div className="hero-grain" />

          <div className="hero-content">
            <div className="hero-copy">
              <p>{t.hero}</p>
              <div className="hero-actions">
                <Link className="hero-primary" to={`/artifacts/${featuredArtifact.id}`}>
                  {t.enterCollection}
                </Link>
                <a
                  className="hero-secondary"
                  href="#catalog"
                  onClick={() => {
                    setActiveCategory('All')
                    setCatalogOpen(true)
                  }}
                >
                  {t.viewAll}
                </a>
              </div>
            </div>

            <div className="hero-showcase" aria-label="Featured objects">
              {heroArtifacts.slice(0, 4).map((artifact, index) => (
                <Link
                  className={`showcase-card showcase-card-${index + 1}`}
                  key={artifact.id}
                  to={`/artifacts/${artifact.id}`}
                >
                  <img src={artifact.image || fallbackArtifactImage} alt={artifact.title} />
                  <span>{artifact.category_name}</span>
                  <strong>{artifact.title}</strong>
                </Link>
              ))}
            </div>
          </div>

          <div className="hero-card-river" aria-hidden="true">
            <div className="river-track">
              {[...heroArtifacts, ...heroArtifacts].map((artifact, index) => (
                <div className="river-card" key={`river-${artifact.id}-${index}`}>
                  <img src={artifact.image || fallbackArtifactImage} alt="" />
                  <span>{artifact.category_name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="hero-marquee" aria-hidden="true">
            <span>Old Master Art</span>
            <span>Carved Furniture</span>
            <span>Period Fashion</span>
            <span>Gilt Lighting</span>
            <span>Historic Textiles</span>
            <span>3D Inspection</span>
          </div>
        </section>

        <section className="page-section departments-section" id="departments">
          <div className="section-heading stacked-heading">
            <p className="eyebrow">{t.departments}</p>
            <div>
              <h2>{t.chooseRoom}</h2>
              <button
                className="section-button"
                onClick={() => {
                  setActiveCategory('All')
                  setCatalogOpen(true)
                }}
                type="button"
              >
                {t.showAll}
              </button>
            </div>
          </div>
          <div className="department-carousel">
            <div className="department-track">
              {[...categoryTiles, ...categoryTiles].map((category, index) => (
                <button
                  className={
                    category.name === activeCategory ? 'department-card active' : 'department-card'
                  }
                  key={`${category.name}-${index}`}
                  onClick={() => {
                    setActiveCategory('All')
                    setCatalogOpen(true)
                  }}
                  type="button"
                >
                  <span className="department-index">{String(category.count).padStart(2, '0')}</span>
                  <img src={category.image} alt="" />
                  <span className="department-name">{category.name}</span>
                  <span className="department-caption">{category.caption}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="page-section catalog-shell" id="catalog">
          {catalogOpen && (
            <>
              <div className="section-heading catalog-heading">
                <div>
                  <h2>{t.selectedAntiques}</h2>
                  <p>{`${visibleArtifacts.length} ${t.curatedResults}`}</p>
                </div>
                <div className="category-tabs" role="tablist" aria-label="Categories">
                  {categories.map((category) => (
                    <button
                      className={category === activeCategory ? 'active' : ''}
                      key={category}
                      onClick={() => setActiveCategory(category)}
                      type="button"
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              <section className="artifact-grid" aria-label="Artifacts">
                {visibleArtifacts.map((artifact) => (
                  <ArtifactCard artifact={artifact} key={artifact.id} />
                ))}
              </section>
            </>
          )}
        </section>

        <section className="story-section" aria-label="About Artisan&apos;s Echo">
          <div className="story-copy">
            <p className="eyebrow">About Artisan&apos;s Echo</p>
            <h2>We turn antique listings into living archives.</h2>
            <p>
              Artisan&apos;s Echo is built for objects that deserve atmosphere: pieces with provenance,
              age, surface, and story. Sellers can prepare rare finds for curator review, while
              collectors explore them through editorial catalogues, vintage film moments, and 3D
              inspection.
            </p>
            <div className="story-stats" aria-label="Marketplace values">
              <span>Curated provenance</span>
              <span>Seller validation</span>
              <span>3D object previews</span>
            </div>
          </div>
          <div className="story-video" aria-label="Vintage film preview">
            <div className="story-reel">
              {[...heroArtifacts.slice(0, 6), ...heroArtifacts.slice(0, 6)].map((artifact, index) => (
                <figure className="story-frame" key={`story-${artifact.id}-${index}`}>
                  <img src={artifact.image || fallbackArtifactImage} alt="" />
                  <figcaption>{artifact.title}</figcaption>
                </figure>
              ))}
            </div>
            <div className="story-video-overlay">
              <span>Archive film 01</span>
              <strong>Objects, rooms, memory.</strong>
            </div>
          </div>
        </section>

        <section className="curators-section" id="curators" aria-label="Curator services">
          <div className="curator-atlas">
            <div className="curator-intro">
              <div>
                <p className="eyebrow">Curators</p>
                <h2>Expert review before an object enters the room.</h2>
              </div>
              <p>
                Our curatorial desk gives the marketplace a professional layer: every seller story,
                condition note, 3D preview, and acquisition request can be reviewed before collectors
                commit.
              </p>
              <div className="curator-metrics" aria-label="Curator desk metrics">
                <span>3 desks</span>
                <span>Provenance first</span>
                <span>Buyer confidence</span>
              </div>
            </div>

            <div className="curator-desk">
              <div className="curator-object-orbit" aria-hidden="true">
                {heroArtifacts.slice(0, 5).map((artifact, index) => (
                  <img
                    className={`curator-orbit-image curator-orbit-image-${index + 1}`}
                    key={`curator-orbit-${artifact.id}`}
                    src={artifact.image || fallbackArtifactImage}
                    alt=""
                  />
                ))}
              </div>

              <div className="curator-board">
                {[
                  {
                    name: 'Mina El Idrissi',
                    role: 'Old Master and provenance review',
                    image: artifacts[0]?.image || fallbackArtifactImage,
                    note: 'Checks archive notes, attribution language, and collector-facing history.',
                  },
                  {
                    name: 'Lucien Darrow',
                    role: 'Furniture and restoration desk',
                    image: artifacts[3]?.image || fallbackArtifactImage,
                    note: 'Reviews patina, restoration status, material claims, and room-readiness.',
                  },
                  {
                    name: 'Sofia Marchand',
                    role: 'Fashion and textile specialist',
                    image: artifacts[2]?.image || fallbackArtifactImage,
                    note: 'Validates period garments, fragile textiles, display care, and condition language.',
                  },
                ].map((curator, index) => (
                  <article className={`curator-card curator-card-${index + 1}`} key={curator.name}>
                    <img src={curator.image} alt="" />
                    <div>
                      <span>{curator.role}</span>
                      <strong>{curator.name}</strong>
                      <p>{curator.note}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>

          <div className="curator-process" aria-label="Curator workflow">
            {[
              ['01', 'Seller dossier', 'Images, history, price, category, and 3D files are prepared.'],
              ['02', 'Desk review', 'Curators inspect provenance, condition, and marketplace readiness.'],
              ['03', 'Collector release', 'Approved objects become part of the public catalogue experience.'],
            ].map(([number, title, text]) => (
              <article key={title}>
                <span>{number}</span>
                <strong>{title}</strong>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="journal-section" id="journal" aria-label="Marketplace journal">
          <div className="journal-heading">
            <div>
              <p className="eyebrow">Journal</p>
              <h2>Editorial notes for collectors with taste and patience.</h2>
            </div>
            <Link className="section-button journal-link" to={`/artifacts/${featuredArtifact.id}`}>
              Read the featured dossier
            </Link>
          </div>

          <div className="journal-issue-strip" aria-hidden="true">
            <div>
              <span>Condition reports</span>
              <span>Dealer interviews</span>
              <span>Room studies</span>
              <span>Object care</span>
              <span>Provenance language</span>
              <span>Market notes</span>
              <span>Condition reports</span>
              <span>Dealer interviews</span>
              <span>Room studies</span>
              <span>Object care</span>
              <span>Provenance language</span>
              <span>Market notes</span>
            </div>
          </div>

          <div className="journal-layout">
            <article className="journal-feature">
              <img src={featuredArtifact.image || fallbackArtifactImage} alt="" />
              <div>
                <span>Collector essay</span>
                <h3>How to read age, surface, and story before buying online.</h3>
                <p>
                  A good antique page should do more than show a price. It should explain why the
                  object matters, how it has aged, and what a collector can inspect before purchase.
                </p>
                <Link to={`/artifacts/${featuredArtifact.id}`}>Open article</Link>
              </div>
            </article>

            <div className="journal-stack">
              {[
                {
                  title: 'The quiet value of restored furniture',
                  type: 'Guide',
                  image: artifacts[1]?.image || fallbackArtifactImage,
                },
                {
                  title: 'Why old textiles need careful product photography',
                  type: 'Essay',
                  image: artifacts[8]?.image || fallbackArtifactImage,
                },
                {
                  title: 'Building collector trust through provenance language',
                  type: 'Notes',
                  image: artifacts[5]?.image || fallbackArtifactImage,
                },
              ].map((entry) => (
                <article className="journal-card" key={entry.title}>
                  <img src={entry.image} alt="" />
                  <div>
                    <span>{entry.type}</span>
                    <strong>{entry.title}</strong>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="promise-section">
          <div className="promise-copy">
            <p className="eyebrow">{t.footerEyebrow}</p>
            <h2>{t.footerTitle}</h2>
            <p>{t.footerText}</p>
            <Link className="promise-cta" to="/signup">
              {t.joinGallery}
            </Link>
          </div>
          <div className="promise-objects" aria-hidden="true">
            <div className="promise-seal">
              <span>AE</span>
              <strong>Protected</strong>
            </div>
            {[...heroArtifacts.slice(0, 4)].map((artifact, index) => (
              <img
                className={`promise-object promise-object-${index + 1}`}
                key={`promise-${artifact.id}`}
                src={artifact.image || fallbackArtifactImage}
                alt=""
              />
            ))}
          </div>
          <div className="promise-grid">
            {[
              ['Protected checkout', 'The MVP simulates protected buying before real payment integration.'],
              ['Seller onboarding', 'Role-based signup helps separate collectors from sellers.'],
              ['Virtual rooms', 'Objects can be staged in immersive gallery settings.'],
              ['Curated archive', 'Editorial product pages keep the marketplace feeling premium.'],
            ].map(([title, text], index) => (
              <article key={title}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <strong>{title}</strong>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="footer-bottom">
          <Link className="brand-mark" to="/">
            Artisan&apos;s Echo
          </Link>
          <p>{t.footerText}</p>
          <Link className="footer-cta" to="/signup">
            {t.joinGallery}
          </Link>
        </section>
      </main>
    </>
  )
}

function CatalogPage() {
  const [artifacts, setArtifacts] = useState<Artifact[]>(demoArtifacts)
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'title'>('featured')
  const { user } = useAuth()

  useEffect(() => {
    getArtifacts()
      .then((items) => {
        if (items.length > 0) {
          setArtifacts(items)
        }
      })
      .catch(() => undefined)
  }, [])

  const marketplaceArtifacts =
    artifacts.length > 0
      ? [...artifacts, ...demoArtifacts.filter((demo) => !artifacts.some((item) => item.id === demo.id))]
      : demoArtifacts
  const publicArtifacts = marketplaceArtifacts.filter((artifact) => artifact.status === 'approved')
  const catalogSource = publicArtifacts.length >= 4 ? publicArtifacts : marketplaceArtifacts

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(catalogSource.map((item) => item.category_name ?? 'Uncategorized')))],
    [catalogSource],
  )

  const visibleArtifacts = catalogSource.filter((artifact) => {
    const matchesCategory =
      activeCategory === 'All' || (artifact.category_name ?? 'Uncategorized') === activeCategory
    const text = `${artifact.title} ${artifact.description} ${artifact.provenance ?? ''}`.toLowerCase()
    return matchesCategory && text.includes(query.toLowerCase())
  })

  const sortedArtifacts = useMemo(() => {
    const items = [...visibleArtifacts]

    switch (sortBy) {
      case 'price-asc':
        return items.sort((left, right) => Number(left.price) - Number(right.price))
      case 'price-desc':
        return items.sort((left, right) => Number(right.price) - Number(left.price))
      case 'title':
        return items.sort((left, right) => left.title.localeCompare(right.title))
      default:
        return items
    }
  }, [sortBy, visibleArtifacts])

  const homeFeatureCategories = new Set(['Luxury Bags', 'Traditional Clothing', 'Watches'])
  const homeArrivalCategories = new Set(['Historical Artifacts', 'Ceramics', 'Rugs and Textiles', 'Vintage Collectibles'])
  const featuredPieces = catalogSource.filter((artifact) => homeFeatureCategories.has(artifact.category_name ?? ''))
  const newArrivals = catalogSource
    .filter((artifact) => homeArrivalCategories.has(artifact.category_name ?? ''))
    .slice(0, 3)
  const catalogPreviewArtifacts = sortedArtifacts
  const catalogResultCount = catalogPreviewArtifacts.length
  const categoryCount = Math.max(categories.length - 1, 0)
  const heroArtifact = featuredPieces[0] ?? catalogSource[0] ?? demoArtifacts[0]
  const heroStats = [
    ['Curated lots', String(catalogSource.length).padStart(2, '0')],
    ['Featured pieces', String(featuredPieces.length).padStart(2, '0')],
    ['New arrivals', String(newArrivals.length).padStart(2, '0')],
  ]
  const atlasShowcaseArtifact = newArrivals[0] ?? featuredPieces[0] ?? catalogSource[1] ?? heroArtifact
  const singularArtifact = featuredPieces[1] ?? newArrivals[1] ?? atlasShowcaseArtifact
  const atlasModules = [
    {
      icon: Wand2,
      title: 'Processing',
      text: 'Seller review, condition notes, and live inventory stay connected.',
    },
    {
      icon: BookOpen,
      title: 'Growth Archive',
      text: 'Wishlists, provenance, and collection history grow with every discovery.',
    },
  ]
  const heroMenuItems = [
    { label: 'Catalogue', target: 'All', hasDropdown: false },
    { label: 'Furniture', target: 'Furniture', hasDropdown: true },
    { label: 'Jewelry', target: 'Jewelry', hasDropdown: false },
    { label: 'Decor', target: 'Decor', hasDropdown: true },
  ]
  const popularSearches = ['Watches', 'Jewelry', 'Ceramics', 'Textiles']
  const dashboardPath =
    user?.role === 'buyer' ? '/collector' : user?.role === 'seller' ? '/seller' : user?.role === 'admin' ? '/admin' : '/login'
  const dashboardLabel =
    user?.role === 'buyer'
      ? 'Collector room'
      : user?.role === 'seller'
        ? 'Seller studio'
        : user?.role === 'admin'
          ? 'Admin desk'
          : 'Sign in'
  const sortLabel =
    sortBy === 'featured'
      ? 'Featured'
      : sortBy === 'price-asc'
        ? 'Price low to high'
        : sortBy === 'price-desc'
          ? 'Price high to low'
          : 'Title'
  const countByCategory = (category: string) =>
    catalogSource.filter((artifact) => (artifact.category_name ?? '').toLowerCase().includes(category)).length
  const applyHeroFilter = (value: string) => {
    if (value === 'All') {
      setActiveCategory('All')
      setQuery('')
    } else {
      const matchingCategory = categories.find((category) =>
        category.toLowerCase().includes(value.toLowerCase()),
      )
      setActiveCategory(matchingCategory ?? 'All')
      setQuery(matchingCategory ? '' : value)
    }

    document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <main>
      <div className="video-hero-wrap">
        <motion.section
          animate={{ opacity: 1, scale: 1 }}
          aria-labelledby="marketplace-hero-title"
          className="video-hero"
          initial={{ opacity: 0, scale: 0.985 }}
          transition={{ duration: 0.75 }}
        >
          <video
            aria-hidden="true"
            autoPlay
            className="video-hero-bg"
            loop
            muted
            playsInline
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260428_193507_4286c423-2fd9-4efd-92bd-91a939453fc1.mp4"
          />
          <div className="video-hero-scrim" />

          <div className="video-hero-layer">
            <nav className="video-hero-nav" aria-label="Hero catalogue shortcuts">
              <div className="video-hero-spacer" />
              <ul>
                {heroMenuItems.map((item) => (
                  <li key={item.label}>
                    <button onClick={() => applyHeroFilter(item.target)} type="button">
                      <span>{item.label}</span>
                      {item.hasDropdown && <ChevronRight aria-hidden="true" size={16} />}
                    </button>
                  </li>
                ))}
              </ul>
              <div className="video-hero-action">
                <Link className="video-pill-button" to={dashboardPath}>
                  <span>
                    <ArrowUpRight aria-hidden="true" size={18} />
                  </span>
                  {dashboardLabel}
                </Link>
              </div>
            </nav>

            <div className="video-hero-copy">
              <motion.div
                animate={{ opacity: 1, y: 0 }}
                className="hero-badge"
                initial={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              >
                <Sparkles aria-hidden="true" size={16} />
                <span>Verified provenance</span>
              </motion.div>
              <motion.h1
                animate={{ opacity: 1, scale: 1 }}
                id="marketplace-hero-title"
                initial={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Rare Object Streams
              </motion.h1>
              <motion.p
                animate={{ opacity: 1 }}
                initial={{ opacity: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                Move from cinematic discovery to a filtered catalogue of antiques, jewelry,
                furniture, art, and decor from verified sellers.
              </motion.p>
              <form
                className="video-hero-search"
                onSubmit={(event) => {
                  event.preventDefault()
                  setActiveCategory('All')
                  document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })
                }}
              >
                <input
                  aria-label="Search the antique catalogue"
                  placeholder="Search watches, porcelain, textiles..."
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
                <button type="submit">Search</button>
              </form>
              <div className="video-hero-chips" aria-label="Popular searches">
                {popularSearches.map((term) => (
                  <button key={term} onClick={() => applyHeroFilter(term)} type="button">
                    {term}
                  </button>
                ))}
              </div>
            </div>

            <motion.aside
              animate={{ x: 0, opacity: 1 }}
              className="video-hero-card"
              initial={{ x: -20, opacity: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div>
                <strong>{String(catalogSource.length).padStart(2, '0')}</strong>
                <span>Curated listings</span>
              </div>
              <button onClick={() => applyHeroFilter('All')} type="button">
                <span>
                  <ArrowUpRight aria-hidden="true" size={15} />
                </span>
                Open catalogue
              </button>
            </motion.aside>

            <motion.aside
              animate={{ y: 0, opacity: 1 }}
              className="video-hero-corner"
              initial={{ y: 20, opacity: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <Link className="corner-icon" to={`/artifacts/${heroArtifact.id}`}>
                <ArrowUpRight aria-hidden="true" size={22} />
              </Link>
              <div>
                <strong>{heroArtifact.title}</strong>
                <Link to={`/artifacts/${heroArtifact.id}`}>
                  <span>{heroArtifact.category_name ?? 'Featured object'}</span>
                  <ChevronRight aria-hidden="true" size={15} />
                </Link>
              </div>
            </motion.aside>

            <div className="video-hero-stats" aria-label="Marketplace summary">
              {heroStats.map(([label, value]) => (
                <article key={label}>
                  <strong>{value}</strong>
                  <span>{label}</span>
                </article>
              ))}
            </div>
          </div>
        </motion.section>
      </div>

      <section className="page-section marketplace-section" id="featured-pieces">
        <div className="section-heading marketplace-heading">
          <div>
            <p className="eyebrow">Featured pieces</p>
            <h2>Pieces worth opening first</h2>
          </div>
          <span className="section-caption">Freshly curated from the marketplace</span>
        </div>
        <div className="artifact-grid marketplace-grid">
          {featuredPieces.map((artifact) => (
            <ArtifactCard artifact={artifact} key={`featured-${artifact.id}`} />
          ))}
        </div>
      </section>

      <section className="page-section marketplace-section" id="new-arrivals">
        <div className="section-heading marketplace-heading">
          <div>
            <p className="eyebrow">New arrivals</p>
            <h2>Recently added objects</h2>
          </div>
          <span className="section-caption">Newest listings from verified sellers</span>
        </div>
        <div className="artifact-grid marketplace-grid">
          {newArrivals.map((artifact) => (
            <ArtifactCard artifact={artifact} key={`new-${artifact.id}`} />
          ))}
        </div>
      </section>

      <section className="page-section marketplace-intro">
        <div className="marketplace-intro-copy">
          <p className="eyebrow">Marketplace intelligence</p>
          <h2>Built for confident buying, clean selling, and curated discovery.</h2>
          <p>
            Search quickly, inspect detailed listings, save objects, and move from discovery to
            checkout with clear role-based dashboards.
          </p>
          <div className="marketplace-intro-actions">
            <a className="hero-primary" href="#catalog">
              Browse catalogue
            </a>
            <Link className="hero-secondary" to="/signup">
              Create account
            </Link>
          </div>
        </div>
        <div className="marketplace-quicklist" aria-label="Quick categories">
          {[
            ['Featured', featuredPieces.length],
            ['New arrivals', newArrivals.length],
            ['Furniture', countByCategory('furniture')],
            ['Art', countByCategory('art')],
            ['Jewelry', countByCategory('jewel')],
          ].map(([label, count]) => (
            <a
              className="quicklist-chip"
              href={label === 'Featured' ? '#featured-pieces' : '#catalog'}
              key={label}
            >
              <span>{label}</span>
              <strong>{String(count).padStart(2, '0')}</strong>
            </a>
          ))}
        </div>
      </section>

      <section className="page-section catalog-shell" id="catalog">
        <div className="catalog-header">
          <div className="catalog-copy">
            <p className="eyebrow">Browse catalogue</p>
            <h2>Curated collection atlas</h2>
            <p className="catalog-summary">
              A live index of verified listings, tuned for quick comparison and cleaner discovery.
            </p>
            <div className="catalog-metrics" aria-label="Catalogue highlights">
              <article>
                <strong>{String(catalogResultCount).padStart(2, '0')}</strong>
                <span>{catalogResultCount === 1 ? 'Live listing' : 'Live listings'}</span>
              </article>
              <article>
                <strong>{String(categoryCount).padStart(2, '0')}</strong>
                <span>{categoryCount === 1 ? 'Curated category' : 'Curated categories'}</span>
              </article>
              <article>
                <strong>{String(featuredPieces.length).padStart(2, '0')}</strong>
                <span>{featuredPieces.length === 1 ? 'Featured pick' : 'Featured picks'}</span>
              </article>
            </div>
          </div>
          <div className="catalog-controls">
            <label className="catalog-sort">
              <span>Sort by</span>
              <select value={sortBy} onChange={(event) => setSortBy(event.target.value as typeof sortBy)}>
                <option value="featured">Featured</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
                <option value="title">Title</option>
              </select>
            </label>
            <div className="catalog-badges" aria-label="Browse status">
              <span className="catalog-status">Verified sellers</span>
              <span className="catalog-status">{sortLabel}</span>
            </div>
          </div>
        </div>

        <div className="catalog-layout">
          <aside className="catalog-sidebar" aria-label="Catalogue filters">
            <div className="sidebar-section">
              <p className="eyebrow">Filters</p>
              <h3>Refine collection</h3>
              <p className="sidebar-copy">Pick a lane to keep the grid focused and easy to compare.</p>
              <div className="filter-list">
                {categories.map((category) => (
                  <button
                    className={category === activeCategory ? 'filter-chip active' : 'filter-chip'}
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    type="button"
                  >
                    <span>{category}</span>
                    <strong>
                      {category === 'All'
                        ? catalogSource.length
                        : catalogSource.filter(
                            (item) => (item.category_name ?? 'Uncategorized') === category,
                          ).length}
                    </strong>
                  </button>
                ))}
              </div>
            </div>

            <div className="sidebar-section">
              <p className="eyebrow">Search</p>
              <h3>Search intent</h3>
              <p>Use the hero search bar to narrow by title, history, or provenance.</p>
            </div>
          </aside>

          <div className="catalog-results">
            <div className="catalog-results-head">
              <span>{catalogResultCount === 1 ? '1 live result' : `${catalogResultCount} live results`}</span>
              <span>{activeCategory === 'All' ? 'All categories' : activeCategory}</span>
            </div>
            <section className="artifact-grid catalog-grid" aria-label="Artifacts">
              {catalogPreviewArtifacts.map((artifact) => (
                <ArtifactCard artifact={artifact} key={artifact.id} variant="compact" />
              ))}
            </section>
          </div>
        </div>
      </section>

      <section className="curated-atlas-section" aria-labelledby="curated-atlas-title">
        <img className="curated-atlas-poster" src={atlasPoster} alt="" aria-hidden="true" />
        <video
          aria-hidden="true"
          autoPlay
          className="curated-atlas-video"
          loop
          muted
          playsInline
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260315_073750_51473149-4350-4920-ae24-c8214286f323.mp4"
        />
        <div className="curated-atlas-scrim" />

        <div className="curated-atlas-layout">
          <div className="curated-atlas-left">
            <div className="liquid-glass-strong curated-atlas-left-glass" />
            <div className="curated-atlas-left-content">
              <nav className="curated-atlas-nav" aria-label="Collection atlas navigation">
                <Link className="curated-atlas-brand" to="/">
                  <img src="/favicon.svg" alt="" width="32" height="32" />
                  <span>artisan&apos;s echo</span>
                </Link>
                <a className="liquid-glass curated-atlas-menu-pill" href="#catalog">
                  <Menu aria-hidden="true" size={17} />
                  <span>Menu</span>
                </a>
              </nav>

              <div className="curated-atlas-hero-center">
                <img
                  className="curated-atlas-hero-logo"
                  src="/favicon.svg"
                  alt="Artisan's Echo"
                  width="80"
                  height="80"
                />
                <h2 id="curated-atlas-title">
                  Discovering the
                  <br />
                  <em>spirit of rare objects</em>
                </h2>
                <Link className="liquid-glass-strong curated-atlas-explore" to={`/artifacts/${heroArtifact.id}`}>
                  <span>View Collection</span>
                  <span className="curated-atlas-action-icon" aria-hidden="true">
                    <ArrowUpRight size={15} />
                  </span>
                </Link>
                <div className="curated-atlas-pills" aria-label="Collection capabilities">
                  {['Curated Gallery', 'Rare Objects', '3D Structures'].map((label) => (
                    <span className="liquid-glass curated-atlas-pill" key={label}>
                      {label}
                    </span>
                  ))}
                </div>
              </div>

              <div className="curated-atlas-quote">
                <span>Visionary collecting</span>
                <p>
                  We imagined a <em>collection</em> with no ending.
                </p>
                <div className="curated-atlas-author">
                  <span />
                  <strong>Artisan&apos;s Echo</strong>
                  <span />
                </div>
              </div>
            </div>
          </div>

          <aside className="curated-atlas-right" aria-label="Marketplace ecosystem">
            <div className="curated-atlas-right-top">
              <a className="liquid-glass-strong curated-atlas-explore-top" href="#catalog">
                <span>Open Archive</span>
                <span className="curated-atlas-action-icon" aria-hidden="true">
                  <ArrowUpRight size={15} />
                </span>
              </a>
              <div className="curated-atlas-account-cluster">
                <Link className="liquid-glass curated-atlas-account" to={dashboardPath}>
                  Account
                </Link>
                <Link className="liquid-glass curated-atlas-icon-button" to={dashboardPath} aria-label={dashboardLabel}>
                  <Sparkles aria-hidden="true" size={17} />
                </Link>
              </div>
            </div>

            <article className="liquid-glass curated-atlas-community">
              <h3>Enter our ecosystem</h3>
              <p>Collect, sell, and curate verified objects through one living marketplace.</p>
            </article>

            <div className="liquid-glass curated-atlas-feature-shell">
              <div className="curated-atlas-feature-grid">
                {atlasModules.map(({ icon: Icon, title, text }) => (
                  <article className="liquid-glass curated-atlas-module" key={title}>
                    <span className="curated-atlas-module-icon" aria-hidden="true">
                      <Icon size={18} />
                    </span>
                    <h3>{title}</h3>
                    <p>{text}</p>
                  </article>
                ))}
              </div>

              <article className="liquid-glass curated-atlas-showcase">
                <div className="curated-atlas-showcase-media">
                  <MarketplaceImage
                    alt={atlasShowcaseArtifact.title}
                    src={resolveMarketplaceImage(atlasShowcaseArtifact, 1)}
                  />
                </div>
                <div className="curated-atlas-showcase-copy">
                  <h3>Advanced Object Staging</h3>
                  <p>Inspect rare pieces in detailed listings and immersive 3D rooms.</p>
                </div>
                <Link className="liquid-glass curated-atlas-plus" to={dashboardPath} aria-label={`Open ${dashboardLabel}`}>
                  <Plus aria-hidden="true" size={18} />
                </Link>
              </article>
            </div>
          </aside>
        </div>
      </section>

      <section className="singular-object-section" aria-labelledby="singular-object-title">
        <div className="singular-object-inner">
          <header className="singular-object-heading">
            <div>
              <p>The singular edit</p>
              <h2 id="singular-object-title">
                One object.<br />
                <em>One remarkable history.</em>
              </h2>
            </div>
            <span aria-label="Edition one of one">01 / 01</span>
          </header>

          <article className="singular-object-feature">
            <Link className="singular-object-media" to={`/artifacts/${singularArtifact.id}`}>
              <MarketplaceImage
                alt={singularArtifact.title}
                src={resolveMarketplaceImage(singularArtifact)}
              />
              <span className="singular-object-badge">
                <Sparkles aria-hidden="true" size={15} />
                Curator&apos;s choice
              </span>
            </Link>

            <div className="singular-object-copy">
              <p className="singular-object-category">
                {singularArtifact.category_name ?? 'Private collection'}
              </p>
              <h3>{singularArtifact.title}</h3>
              <p className="singular-object-description">{singularArtifact.description}</p>

              <dl className="singular-object-facts">
                <div>
                  <dt>Provenance</dt>
                  <dd>{singularArtifact.provenance || 'Verified private collection'}</dd>
                </div>
                <div>
                  <dt>Condition</dt>
                  <dd>{singularArtifact.condition}</dd>
                </div>
                <div>
                  <dt>Material</dt>
                  <dd>{singularArtifact.materials || 'Documented in the object dossier'}</dd>
                </div>
              </dl>

              <div className="singular-object-action-row">
                <div>
                  <span>Collector price</span>
                  <strong>{formatPrice(singularArtifact.price)}</strong>
                </div>
                <Link className="singular-object-action" to={`/artifacts/${singularArtifact.id}`}>
                  <span>View object</span>
                  <ArrowUpRight aria-hidden="true" size={18} />
                </Link>
              </div>
            </div>
          </article>
        </div>
      </section>

      <footer className="atlas-site-footer" aria-label="Artisan's Echo footer">
        <div className="atlas-site-footer-inner">
          <div className="atlas-site-footer-top">
            <Link className="atlas-site-footer-brand" to="/" aria-label="Artisan's Echo home">
              <img src="/favicon.svg" alt="" width="36" height="36" />
              <span>artisan&apos;s echo</span>
            </Link>
          <nav className="atlas-site-footer-nav" aria-label="Footer navigation">
              <a href="#catalog">Catalogue</a>
              <a href="#featured-pieces">Featured</a>
              <Link to={dashboardPath}>{dashboardLabel}</Link>
              <Link to="/login">Sign in</Link>
          </nav>
          </div>

          <div className="atlas-site-footer-bottom">
            <p>Curated for the objects worth remembering.</p>
            <p>&copy; 2026 Artisan&apos;s Echo</p>
          </div>
        </div>
      </footer>
    </main>
  )
}

function SignupPage() {
  const navigate = useNavigate()
  const signupObjects = demoArtifacts.slice(0, 4)
  const [form, setForm] = useState<RegisterPayload>({
    email: '',
    password: '',
    role: 'buyer',
    first_name: '',
    last_name: '',
  })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  function updateField(field: keyof RegisterPayload, value: string) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('loading')
    setMessage('')

    try {
      await registerUser(form)
      setStatus('success')
      setMessage('Your account is ready. Go to the login page to sign in with the same email.')
      setForm({ email: '', password: '', role: 'buyer', first_name: '', last_name: '' })
      navigate('/login', { state: { email: form.email } })
    } catch {
      setStatus('error')
      setMessage('Signup was not accepted. Check that the backend is running on port 8000.')
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-hero">
        <p className="eyebrow">Private access</p>
        <h1>Join a gallery built for objects with a past.</h1>
        <p>
          Create a collector or seller account to follow rare pieces, prepare antiques for curator
          validation, and access the marketplace with the right role.
        </p>
        <div className="auth-role-grid" aria-hidden="true">
          {[
            ['Collector', 'Browse, save, and request objects.'],
            ['Seller', 'Prepare inventory for review.'],
            ['3D ready', 'Every account can inspect the model view.'],
            ['Verified flow', 'Login uses the same email you registered with.'],
          ].map(([title, text]) => (
            <article key={title}>
              <strong>{title}</strong>
              <p>{text}</p>
            </article>
          ))}
        </div>
        <div className="hero-stats" aria-hidden="true">
          {signupObjects.slice(0, 3).map((artifact) => (
            <article key={artifact.id}>
              <strong>{artifact.category_name}</strong>
              <span>{artifact.title}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="auth-card">
        <div className="auth-card-head">
          <p className="eyebrow">Artisan&apos;s Echo membership</p>
          <h2>Professional access request</h2>
          <p>Build a verified collector or seller profile for curated antique discovery.</p>
        </div>
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="role-toggle" aria-label="Account type">
            {(['buyer', 'seller'] as const).map((role) => (
              <button
                className={form.role === role ? 'active' : ''}
                key={role}
                onClick={() => updateField('role', role)}
                type="button"
              >
                {role === 'buyer' ? 'Collector' : 'Seller'}
              </button>
            ))}
          </div>
          <div className="editor-grid">
            <label>
              First name
              <input
                value={form.first_name}
                onChange={(event) => updateField('first_name', event.target.value)}
                required
              />
            </label>
            <label>
              Last name
              <input
                value={form.last_name}
                onChange={(event) => updateField('last_name', event.target.value)}
                required
              />
            </label>
          </div>
          <label className="full-field">
            Email
            <input
              type="email"
              value={form.email}
              onChange={(event) => updateField('email', event.target.value)}
              required
            />
          </label>
          <label className="full-field">
            Password
            <input
              minLength={8}
              type="password"
              value={form.password}
              onChange={(event) => updateField('password', event.target.value)}
              required
            />
          </label>
          <button className="solid-button auth-submit" disabled={status === 'loading'} type="submit">
            {status === 'loading' ? 'Creating account...' : 'Create account'}
          </button>
        </form>
        {message && (
          <p className={status === 'error' ? 'error-message' : 'success-message'}>{message}</p>
        )}
        <p className="auth-switch">
          Already registered?{' '}
          <Link to="/login" state={form.email ? { email: form.email } : undefined}>
            Log in
          </Link>
        </p>
      </section>
    </main>
  )
}

function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, login } = useAuth()
  const locationState = location.state as { email?: string; redirectTo?: string } | null
  const [form, setForm] = useState({
    email: locationState?.email ?? '',
    password: '',
  })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true })
    }
  }, [isAuthenticated, navigate])

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('loading')
    setMessage('')

    try {
      await login(form)
      setStatus('success')
      setMessage('You are signed in.')
      navigate(locationState?.redirectTo ?? '/', { replace: true })
    } catch {
      setStatus('error')
      setMessage('Login failed. Check your email, password, and backend server.')
    }
  }

  const loginObjects = demoArtifacts.slice(4, 8)

  return (
    <main className="auth-page">
      <section className="auth-hero">
        <p className="eyebrow">Welcome back</p>
        <h1>Sign in to continue your collection.</h1>
        <p>
          Use the same email you registered with to access your account, keep your place in the
          marketplace, and continue into the protected flow later.
        </p>
        <div className="auth-role-grid" aria-hidden="true">
          {[
            ['Email login', 'The backend authenticates with JWT tokens.'],
            ['Session restore', 'Stored credentials reload on page refresh.'],
            ['Buyer ready', 'Collectors can continue browsing after sign in.'],
            ['Seller ready', 'Sellers can return to their account later.'],
          ].map(([title, text]) => (
            <article key={title}>
              <strong>{title}</strong>
              <p>{text}</p>
            </article>
          ))}
        </div>
        <div className="hero-stats" aria-hidden="true">
          {loginObjects.slice(0, 3).map((artifact) => (
            <article key={artifact.id}>
              <strong>{artifact.category_name}</strong>
              <span>{artifact.title}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="auth-card">
        <div className="auth-card-head">
          <p className="eyebrow">Account sign in</p>
          <h2>Login to your gallery account</h2>
          <p>Enter the email and password you used during signup.</p>
        </div>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="full-field">
            Email
            <input
              type="email"
              value={form.email}
              onChange={(event) => updateField('email', event.target.value)}
              required
            />
          </label>
          <label className="full-field">
            Password
            <input
              type="password"
              value={form.password}
              onChange={(event) => updateField('password', event.target.value)}
              required
            />
          </label>
          <button className="solid-button auth-submit" disabled={status === 'loading'} type="submit">
            {status === 'loading' ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        {message && (
          <p className={status === 'error' ? 'error-message' : 'success-message'}>{message}</p>
        )}
        <p className="auth-switch">
          Need an account? <Link to="/signup">Create one</Link>
        </p>
      </section>
    </main>
  )
}

function LegacyArtifactDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [artifact, setArtifact] = useState<Artifact | undefined>(() =>
    demoArtifacts.find((item) => String(item.id) === id),
  )
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [wishlistItemId, setWishlistItemId] = useState<number | null>(null)
  const [cartItemId, setCartItemId] = useState<number | null>(null)
  const [cartQuantity, setCartQuantity] = useState(0)
  const [inquiryMode, setInquiryMode] = useState<'purchase' | 'curator' | null>(null)
  const [conciergeMessage, setConciergeMessage] = useState('')
  const [actionMessage, setActionMessage] = useState('')
  const [actionStatus, setActionStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  useEffect(() => {
    if (!id) return
    getArtifact(id)
      .then(setArtifact)
      .catch(() => {
        setArtifact(demoArtifacts.find((item) => String(item.id) === id))
      })
  }, [id])

  useEffect(() => {
    if (!artifact || user?.role !== 'buyer') {
      setWishlistItemId(null)
      setCartItemId(null)
      setCartQuantity(0)
      return
    }

    let cancelled = false

    const loadSelections = async () => {
      try {
        const [wishlist, cart] = await Promise.all([getWishlist(), getCart()])
        if (cancelled) return

        const savedItem = wishlist.find((item) => item.artifact_detail.id === artifact.id)
        const cartedItem = cart.find((item) => item.artifact_detail.id === artifact.id)

        setWishlistItemId(savedItem?.id ?? null)
        setCartItemId(cartedItem?.id ?? null)
        setCartQuantity(cartedItem?.quantity ?? 0)
      } catch {
        if (cancelled) return
      }
    }

    void loadSelections()

    return () => {
      cancelled = true
    }
  }, [artifact, user?.role])

  function requireBuyer() {
    if (user?.role === 'buyer' && artifact) {
      return true
    }

    if (!artifact) {
      return false
    }

    navigate('/login', { state: { redirectTo: `/artifacts/${artifact.id}` } })
    return false
  }

  async function handleWishlistToggle() {
    if (!requireBuyer()) return
    if (!artifact) return

    setActionStatus('loading')
    setActionMessage('')

    try {
      if (wishlistItemId) {
        await removeWishlistItem(wishlistItemId)
        setWishlistItemId(null)
        setActionMessage('Removed from your wishlist.')
      } else {
        const saved = await addWishlistItem(artifact.id)
        setWishlistItemId(saved.id)
        setActionMessage('Saved to your wishlist.')
      }
      setActionStatus('success')
    } catch {
      setActionStatus('error')
      setActionMessage('Wishlist update failed. Check that you are signed in as a collector.')
    }
  }

  async function handleCartAdd() {
    if (!requireBuyer()) return
    if (!artifact) return

    setActionStatus('loading')
    setActionMessage('')

    try {
      const cartItem = await addCartItem(artifact.id, 1)
      setCartItemId(cartItem.id)
      setCartQuantity(cartItem.quantity)
      setActionStatus('success')
      setActionMessage('Added to your cart.')
    } catch {
      setActionStatus('error')
      setActionMessage('Cart update failed. Check that you are signed in as a collector.')
    }
  }

  if (!artifact) {
    return (
      <main className="app-shell empty-state">
        <Link to="/">Back to catalog</Link>
        <h1>Artifact not found</h1>
      </main>
    )
  }

  const relatedArtifacts = demoArtifacts
    .filter((item) => item.id !== artifact.id)
    .filter((item) => item.category_name === artifact.category_name)
    .concat(demoArtifacts.filter((item) => item.id !== artifact.id))
    .slice(0, 4)

  const galleryImages = [
    artifact.image || fallbackArtifactImage,
    ...relatedArtifacts.slice(0, 3).map((item) => item.image || fallbackArtifactImage),
  ]

  const selectedImage = galleryImages[selectedImageIndex] ?? galleryImages[0]

  const inspectionNotes = [
    ['Surface', `${artifact.condition} collector presentation with visible age and character.`],
    ['Dossier', artifact.provenance || 'Seller provenance is pending curator validation.'],
    ['Handling', 'White-glove delivery path prepared for the demo marketplace.'],
    ['Room fit', 'Best suited for a library, private salon, studio, or gallery wall.'],
  ]

  function handleConciergeSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setConciergeMessage(
      inquiryMode === 'curator'
        ? 'Curator question prepared. In the full product flow this becomes a protected message thread.'
        : 'Purchase request prepared. In the full product flow this moves into checkout and seller review.',
    )
  }

  return (
    <main className="product-page">
      <nav className="product-topbar" aria-label="Product navigation">
        <Link className="back-link" to="/">
          Marketplace
        </Link>
        <span>{artifact.category_name ?? 'Uncategorized'}</span>
        <span>Lot AE-{String(artifact.id).padStart(4, '0')}</span>
      </nav>

      <section className="product-studio" aria-label="Product studio overview">
        <div className="product-studio-media">
          <img src={artifact.image || fallbackArtifactImage} alt="" />
          <div className="studio-proof">
            <span>AE-{String(artifact.id).padStart(4, '0')}</span>
            <strong>{artifact.condition}</strong>
          </div>
        </div>
        <div className="product-studio-copy">
          <p className="eyebrow">{artifact.category_name ?? 'Uncategorized'}</p>
          <h1>{artifact.title}</h1>
          <p>{artifact.description}</p>
          <div className="studio-actions">
            <button
              className={cartQuantity > 0 ? 'saved' : ''}
              onClick={() => {
                void handleCartAdd()
              }}
              disabled={actionStatus === 'loading'}
              type="button"
            >
              {cartQuantity > 0 ? `Add one more (${cartQuantity})` : 'Add to cart'}
            </button>
            <button
              className={wishlistItemId ? 'saved' : ''}
              onClick={() => {
                void handleWishlistToggle()
              }}
              disabled={actionStatus === 'loading'}
              type="button"
            >
              {wishlistItemId ? 'Remove from wishlist' : 'Save to wishlist'}
            </button>
          </div>
          {actionMessage && (
            <p className={actionStatus === 'error' ? 'error-message' : 'success-message'}>
              {actionMessage}
            </p>
          )}
          <div className="studio-ledger">
            <article>
              <span>Price</span>
              <strong>{formatPrice(artifact.price)}</strong>
            </article>
            <article>
              <span>Inspection</span>
              <strong>{artifact.model_3d ? '3D ready' : 'Demo 3D'}</strong>
            </article>
            <article>
              <span>Status</span>
              <strong>{artifact.status}</strong>
            </article>
          </div>
        </div>
      </section>

      <section className="product-hero-detail">
        <div className="product-gallery">
          <figure className="product-primary-image">
            <img src={selectedImage} alt={artifact.title} />
            <figcaption>
              <span>Curated object</span>
              <strong>{artifact.condition}</strong>
            </figcaption>
          </figure>
          <div className="product-thumbs" aria-label="Object image set">
            {galleryImages.map((image, index) => (
              <button
                aria-label={`View product image ${index + 1}`}
                className={index === selectedImageIndex ? 'active' : ''}
                key={`${image}-${index}`}
                onClick={() => setSelectedImageIndex(index)}
                type="button"
              >
                <img alt="" src={image} />
              </button>
            ))}
          </div>
          <section className="viewer-dossier">
            <div>
              <p className="eyebrow">3D inspection</p>
              <h2>Rotate, inspect, and study the object surface.</h2>
            </div>
            <Artifact3DViewer modelUrl={artifact.model_3d || '/models/demo-antique.glb'} />
          </section>
        </div>

        <aside className="product-summary">
          <p className="eyebrow">Acquisition dossier</p>
          <h2>Collector purchase panel</h2>
          <p className="product-price">{formatPrice(artifact.price)}</p>
          <p className="product-description">
            Review condition, seller validation, 3D inspection, and move approved objects into your
            cart or wishlist before checkout.
          </p>

          <div className="purchase-panel">
            <button
              onClick={() => {
                void handleCartAdd()
              }}
              disabled={actionStatus === 'loading'}
              type="button"
            >
              {cartQuantity > 0 ? 'Add another copy' : 'Add to cart'}
            </button>
            <button
              className={wishlistItemId ? 'saved' : ''}
              onClick={() => {
                void handleWishlistToggle()
              }}
              disabled={actionStatus === 'loading'}
              type="button"
            >
              {wishlistItemId ? 'Remove from wishlist' : 'Save to wishlist'}
            </button>
            <Link className="ghost-button" to="/cart">
              Go to cart
            </Link>
            <button
              onClick={() => {
                setInquiryMode('curator')
                setConciergeMessage('')
              }}
              type="button"
            >
              Ask curator
            </button>
          </div>

          {(wishlistItemId || cartItemId) && (
            <p className="collector-action-message">
              {wishlistItemId && cartItemId
                ? 'Saved in your wishlist and added to your cart.'
                : wishlistItemId
                  ? 'Saved in your wishlist.'
                  : 'Added to your cart.'}
            </p>
          )}

          <dl className="product-facts">
            <div>
              <dt>Condition</dt>
              <dd>{artifact.condition}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>{artifact.status}</dd>
            </div>
            <div>
              <dt>Inspection</dt>
              <dd>{artifact.model_3d ? '3D model available' : 'Demo 3D model available'}</dd>
            </div>
            <div>
              <dt>Catalogue ID</dt>
              <dd>AE-{String(artifact.id).padStart(4, '0')}</dd>
            </div>
          </dl>

          <section className="seller-card">
            <span>Presented by</span>
            <strong>Artisan&apos;s Echo Curatorial Desk</strong>
            <p>Validated seller dossier, provenance notes, and buyer protection prepared for demo.</p>
          </section>

          {inquiryMode && (
            <form className="concierge-panel" onSubmit={handleConciergeSubmit}>
              <div>
                <span>Collector concierge</span>
                <strong>
                  {inquiryMode === 'curator'
                    ? 'Send a focused curator question'
                    : 'Prepare a protected purchase request'}
                </strong>
              </div>
              <label>
                Email or phone
                <input required placeholder="collector@example.com" />
              </label>
              <label>
                Message
                <textarea
                  required
                  rows={4}
                  placeholder={
                    inquiryMode === 'curator'
                      ? 'Ask about provenance, restoration, scale, or condition.'
                      : 'Share delivery city, viewing needs, or offer details.'
                  }
                />
              </label>
              <button type="submit">
                {inquiryMode === 'curator' ? 'Send question' : 'Submit request'}
              </button>
              {conciergeMessage && <p>{conciergeMessage}</p>}
            </form>
          )}
        </aside>
      </section>

      <section className="condition-report" aria-label="Condition and acquisition report">
        <div className="report-heading">
          <p className="eyebrow">Acquisition report</p>
          <h2>Everything a collector checks before saying yes.</h2>
        </div>
        <div className="report-grid">
          {inspectionNotes.map(([title, text], index) => (
            <article key={title}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <strong>{title}</strong>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="product-story-grid">
        <article className="provenance-chapter">
          <p className="eyebrow">Provenance</p>
          <h2>Known story and collector notes.</h2>
          <p>{artifact.provenance || 'Seller provenance is pending curator validation.'}</p>
          <ol>
            <li>
              <span>01</span>
              <strong>Origin record</strong>
              <p>{artifact.history || 'Historic context is prepared from seller and curator notes.'}</p>
            </li>
            <li>
              <span>02</span>
              <strong>Condition review</strong>
              <p>Surface, restoration, and display readiness are recorded before marketplace approval.</p>
            </li>
            <li>
              <span>03</span>
              <strong>Digital exhibit</strong>
              <p>The object can be placed in a virtual gallery with scale, lighting, and inspection data.</p>
            </li>
          </ol>
        </article>

        <article className="curator-note">
          <p className="eyebrow">Curator note</p>
          <h2>Why it matters</h2>
          <p>
            This listing is composed like a collector dossier: image evidence, object story, 3D
            presence, and purchase confidence in one focused experience.
          </p>
          <div className="curator-seal">
            <span>Archive grade</span>
            <strong>{artifact.condition}</strong>
          </div>
        </article>
      </section>

        <section className="service-strip" aria-label="Buyer services">
          {[
          ['Protected checkout', 'Simulated payment workflow for the PFE demo.'],
          ['Curator validation', 'Admin review can approve or reject marketplace objects.'],
          ['Seller contact', 'Buyer and seller flows are prepared for marketplace expansion.'],
          ['Gallery placement', 'Artifacts can be arranged as exhibits in 3D rooms.'],
        ].map(([title, text]) => (
          <article key={title}>
            <strong>{title}</strong>
            <span>{text}</span>
          </article>
        ))}
      </section>

      <section className="collector-room" aria-label="Collector room preview">
        <div className="collector-room-copy">
          <p className="eyebrow">Room staging</p>
          <h2>Picture the object inside a private interior.</h2>
          <p>
            The product page now behaves like a gallery dossier: image study, 3D inspection,
            condition review, concierge action, and nearby objects for a complete acquisition path.
          </p>
        </div>
        <div className="collector-room-board">
          {relatedArtifacts.slice(0, 3).map((item, index) => (
            <Link className={`room-object room-object-${index + 1}`} key={item.id} to={`/artifacts/${item.id}`}>
              <img src={item.image || fallbackArtifactImage} alt={item.title} />
              <span>{item.category_name}</span>
              <strong>{item.title}</strong>
            </Link>
          ))}
        </div>
      </section>

      <section className="related-section">
        <div className="section-heading">
          <h2>Related objects</h2>
          <Link to="/">Return to collection</Link>
        </div>
        <div className="product-rail">
          {relatedArtifacts.map((item) => (
            <ArtifactCard artifact={item} key={`related-${item.id}`} />
          ))}
        </div>
      </section>
    </main>
  )
}

function ArtifactDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [artifact, setArtifact] = useState<Artifact | undefined>(() =>
    demoArtifacts.find((item) => String(item.id) === id),
  )
  const [catalogArtifacts, setCatalogArtifacts] = useState<Artifact[]>(demoArtifacts)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [wishlistItemId, setWishlistItemId] = useState<number | null>(null)
  const [cartItemId, setCartItemId] = useState<number | null>(null)
  const [cartQuantity, setCartQuantity] = useState(0)
  const [inquiryMode, setInquiryMode] = useState<'purchase' | 'seller' | null>(null)
  const [conciergeMessage, setConciergeMessage] = useState('')
  const [actionStatus, setActionStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  useEffect(() => {
    if (!id) return
    getArtifact(id)
      .then(setArtifact)
      .catch(() => {
        setArtifact(demoArtifacts.find((item) => String(item.id) === id))
      })

    getArtifacts()
      .then((items) => {
        if (items.length > 0) {
          setCatalogArtifacts([
            ...items,
            ...demoArtifacts.filter((demo) => !items.some((item) => item.id === demo.id)),
          ])
        }
      })
      .catch(() => undefined)
  }, [id])

  useEffect(() => {
    if (!artifact || user?.role !== 'buyer') {
      setWishlistItemId(null)
      setCartItemId(null)
      setCartQuantity(0)
      return
    }

    let cancelled = false

    const loadSelections = async () => {
      try {
        const [wishlist, cart] = await Promise.all([getWishlist(), getCart()])
        if (cancelled) return

        const savedItem = wishlist.find((item) => item.artifact_detail.id === artifact.id)
        const cartedItem = cart.find((item) => item.artifact_detail.id === artifact.id)

        setWishlistItemId(savedItem?.id ?? null)
        setCartItemId(cartedItem?.id ?? null)
        setCartQuantity(cartedItem?.quantity ?? 0)
      } catch {
        if (cancelled) return
      }
    }

    void loadSelections()

    return () => {
      cancelled = true
    }
  }, [artifact, user?.role])

  function requireBuyer() {
    if (user?.role === 'buyer' && artifact) {
      return true
    }

    if (!artifact) {
      return false
    }

    navigate('/login', { state: { redirectTo: `/artifacts/${artifact.id}` } })
    return false
  }

  async function handleWishlistToggle() {
    if (!requireBuyer() || !artifact) return

    setActionStatus('loading')

    try {
      if (wishlistItemId) {
        await removeWishlistItem(wishlistItemId)
        setWishlistItemId(null)
      } else {
        const saved = await addWishlistItem(artifact.id)
        setWishlistItemId(saved.id)
      }
      setActionStatus('success')
    } catch {
      setActionStatus('error')
    }
  }

  async function handleCartAdd() {
    if (!requireBuyer() || !artifact) return

    setActionStatus('loading')

    try {
      const cartItem = await addCartItem(artifact.id, 1)
      setCartItemId(cartItem.id)
      setCartQuantity(cartItem.quantity)
      setActionStatus('success')
    } catch {
      setActionStatus('error')
    }
  }

  function handleConciergeSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setConciergeMessage(
      inquiryMode === 'seller'
        ? 'Message prepared. In the full product flow this becomes a protected seller thread.'
        : 'Purchase request prepared. In the full product flow this moves into checkout and seller review.',
    )
  }

  if (!artifact) {
    return (
      <main className="app-shell empty-state">
        <Link to="/">Back to catalog</Link>
        <h1>Artifact not found</h1>
      </main>
    )
  }

  const relatedArtifacts = catalogArtifacts
    .filter((item) => item.id !== artifact.id)
    .filter((item) => item.category_name === artifact.category_name)
    .concat(catalogArtifacts.filter((item) => item.id !== artifact.id))
    .filter((item, index, items) => items.findIndex((candidate) => candidate.id === item.id) === index)
    .slice(0, 3)

  const galleryImages = [
    resolveMarketplaceImage(artifact),
    ...relatedArtifacts.slice(0, 3).map((item) => resolveMarketplaceImage(item)),
  ]
  const selectedImage = galleryImages[selectedImageIndex] ?? galleryImages[0]
  const sellerName = artifact.seller_email || 'Verified seller'
  const provenance = artifact.provenance || 'Private collection, Rabat.'
  const materials = artifact.materials || 'Material details available on request'
  const dimensions = artifact.dimensions || 'Dimensions available in the seller notes'

  return (
    <main className="product-page">
      <nav className="product-topbar" aria-label="Product navigation">
        <Link className="back-link" to="/">
          Marketplace
        </Link>
        <span>{artifact.category_name ?? 'Uncategorized'}</span>
        <span>Lot AE-{String(artifact.id).padStart(4, '0')}</span>
      </nav>

      <section className="product-hero-detail">
        <aside className="product-summary">
          <p className="eyebrow">Marketplace listing</p>
          <h1>{artifact.title}</h1>
          <p className="product-kicker">{artifact.category_name ?? 'Uncategorized'}</p>
          <p className="product-price">{formatPrice(artifact.price)}</p>
          <p className="product-description">
            Review the object details, seller information, and delivery notes before adding it to
            your cart or wishlist.
          </p>

          <section className="seller-card">
            <span>Seller</span>
            <strong>{sellerName}</strong>
            <p>Verified listing from the marketplace catalog.</p>
          </section>

          <div className="purchase-panel">
            <button
              onClick={() => {
                void handleCartAdd()
              }}
              disabled={actionStatus === 'loading'}
              type="button"
            >
              {cartQuantity > 0 ? 'Add another copy' : 'Add to cart'}
            </button>
            <button
              className={wishlistItemId ? 'saved' : ''}
              onClick={() => {
                void handleWishlistToggle()
              }}
              disabled={actionStatus === 'loading'}
              type="button"
            >
              {wishlistItemId ? 'Remove from wishlist' : 'Save to wishlist'}
            </button>
            <Link className="ghost-button" to="/cart">
              Go to cart
            </Link>
            <button
              onClick={() => {
                setInquiryMode('seller')
                setConciergeMessage('')
              }}
              type="button"
            >
              Ask seller
            </button>
          </div>

          {(wishlistItemId || cartItemId) && (
            <p className="collector-action-message">
              {wishlistItemId && cartItemId
                ? 'Saved in your wishlist and added to your cart.'
                : wishlistItemId
                  ? 'Saved in your wishlist.'
                  : 'Added to your cart.'}
            </p>
          )}

          <dl className="product-facts">
            <div>
              <dt>Condition</dt>
              <dd>{artifact.condition}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>{artifact.status}</dd>
            </div>
            <div>
              <dt>Materials</dt>
              <dd>{materials}</dd>
            </div>
            <div>
              <dt>Dimensions</dt>
              <dd>{dimensions}</dd>
            </div>
            <div>
              <dt>Seller</dt>
              <dd>{sellerName}</dd>
            </div>
            <div>
              <dt>Catalogue ID</dt>
              <dd>AE-{String(artifact.id).padStart(4, '0')}</dd>
            </div>
          </dl>

          {inquiryMode && (
            <form className="concierge-panel" onSubmit={handleConciergeSubmit}>
              <div>
                <span>Buyer inquiry</span>
                <strong>
                  {inquiryMode === 'seller' ? 'Send a message to the seller' : 'Prepare a purchase request'}
                </strong>
              </div>
              <label>
                Email or phone
                <input required placeholder="collector@example.com" />
              </label>
              <label>
                Message
                <textarea
                  required
                  rows={4}
                  placeholder={
                    inquiryMode === 'seller'
                      ? 'Ask about provenance, materials, dimensions, or condition.'
                      : 'Share delivery city, viewing needs, or offer details.'
                  }
                />
              </label>
              <button type="submit">
                {inquiryMode === 'seller' ? 'Send message' : 'Submit request'}
              </button>
              {conciergeMessage && <p>{conciergeMessage}</p>}
            </form>
          )}
        </aside>

        <div className="product-gallery">
          <figure className="product-primary-image">
            <MarketplaceImage alt={artifact.title} src={selectedImage} />
            <figcaption>
              <span>Object preview</span>
              <strong>{artifact.condition}</strong>
            </figcaption>
          </figure>
          <div className="product-thumbs" aria-label="Object image set">
            {galleryImages.map((image, index) => (
              <button
                aria-label={`View product image ${index + 1}`}
                className={index === selectedImageIndex ? 'active' : ''}
                key={`${image}-${index}`}
                onClick={() => setSelectedImageIndex(index)}
                type="button"
              >
                <MarketplaceImage alt="" src={image} />
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="product-detail-notes">
        <article>
          <p className="eyebrow">Description</p>
          <h2>Object details</h2>
          <p>{artifact.description}</p>
        </article>
        <article>
          <p className="eyebrow">Provenance</p>
          <h2>Recorded history</h2>
          <p>{provenance}</p>
        </article>
        <article>
          <p className="eyebrow">Shipping</p>
          <h2>Delivery on request</h2>
          <p>White-glove packing, insured shipping, and delivery scheduling can be arranged by the seller.</p>
        </article>
        <article>
          <p className="eyebrow">Condition</p>
          <h2>Current state</h2>
          <p>{artifact.history || 'Condition notes come directly from the seller listing.'}</p>
        </article>
      </section>

      <section className="related-section">
        <div className="section-heading">
          <h2>Related objects</h2>
          <Link to="/">Return to catalogue</Link>
        </div>
        <div className="product-rail">
          {relatedArtifacts.map((item) => (
            <ArtifactCard artifact={item} key={`related-${item.id}`} variant="compact" />
          ))}
        </div>
      </section>
    </main>
  )
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<CatalogPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/collector" element={<CollectorDashboardPage />} />
          <Route path="/collector/collections" element={<WishlistPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/orders/:id" element={<OrderDetailPage />} />
          <Route path="/seller" element={<SellerDashboardPage />} />
          <Route path="/seller/products" element={<SellerProductsPage />} />
          <Route path="/seller/galleries" element={<SellerGalleriesPage />} />
          <Route path="/seller/orders" element={<SellerOrdersPage />} />
          <Route path="/seller/orders/:id" element={<SellerOrderDetailPage />} />
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/users/:id" element={<AdminUserDetailPage />} />
          <Route path="/admin/artifacts" element={<AdminArtifactsPage />} />
          <Route path="/admin/galleries" element={<AdminGalleriesPage />} />
          <Route path="/admin/audit" element={<AdminAuditPage />} />
          <Route path="/artifacts/:id" element={<ArtifactDetailPage />} />
          <Route path="/__legacy/catalog" element={<LegacyCatalogPage />} />
          <Route path="/__legacy/artifacts/:id" element={<LegacyArtifactDetailPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
