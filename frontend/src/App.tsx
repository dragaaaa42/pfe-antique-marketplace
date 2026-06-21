import {
  type ChangeEvent,
  type ComponentType,
  type FormEvent,
  type ReactNode,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { BrowserRouter, Link, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowUpRight,
  BookOpen,
  ChevronRight,
  Circle,
  Eye,
  EyeOff,
  Menu,
  Plus,
  Sparkles,
  Wand2,
} from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import './App.css'
import {
  addCartItem,
  addWishlistItem,
  applyAccessToken,
  buildSocialAuthStartUrl,
  clearAuthSession,
  createConversation,
  getCart,
  getConversation,
  getConversations,
  getCurrentUser,
  getWishlist,
  removeWishlistItem,
  replyConversation,
  saveAuthSession,
  type SocialAuthProvider,
  type RegisterPayload,
  demoArtifacts,
  fallbackArtifactImage,
  getArtifact,
  getArtifacts,
  registerUser,
} from './api'
import { AuthProvider, useAuth } from './auth'
import { AccountPage } from './account'
import {
  CartPage,
  CollectorDashboardPage,
  CollectorMessagesPage,
  OrderDetailPage,
  OrdersPage,
  WishlistPage,
} from './buyer'
import {
  AdminArtifactsPage,
  AdminAuditPage,
  AdminDashboardPage,
  AdminUserDetailPage,
  AdminUsersPage,
} from './admin'
import { MarketplaceImage } from './components/MarketplaceImage'
import atlasPoster from './assets/marketplace/silver-tea-service.jpg'
import {
  SellerDashboardPage,
  SellerMessagesPage,
  SellerOrderDetailPage,
  SellerOrdersPage,
  SellerProductsPage,
} from './seller'
import { resolveMarketplaceImage } from './marketplaceImages'
import { getDashboardPathForRole, getWorkspaceLabelForRole } from './roleRouting'
import type { Artifact, ConversationDetail, ConversationMessage } from './types'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<CatalogPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/auth/callback" element={<SocialAuthCallbackPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/collector" element={<CollectorDashboardPage />} />
          <Route path="/collector/messages" element={<CollectorMessagesPage />} />
          <Route path="/collector/messages/:id" element={<CollectorMessagesPage />} />
          <Route path="/collector/collections" element={<WishlistPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/orders/:id" element={<OrderDetailPage />} />
          <Route path="/seller" element={<SellerDashboardPage />} />
          <Route path="/seller/products" element={<SellerProductsPage />} />
          <Route path="/seller/messages" element={<SellerMessagesPage />} />
          <Route path="/seller/messages/:id" element={<SellerMessagesPage />} />
          <Route path="/seller/orders" element={<SellerOrdersPage />} />
          <Route path="/seller/orders/:id" element={<SellerOrderDetailPage />} />
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/users/:id" element={<AdminUserDetailPage />} />
          <Route path="/admin/artifacts" element={<AdminArtifactsPage />} />
          <Route path="/admin/audit" element={<AdminAuditPage />} />
          <Route path="/artifacts/:id" element={<ArtifactDetailPage />} />
          <Route path="/artifacts/:id/message" element={<ProductMessagePage />} />
          <Route path="/__legacy/catalog" element={<LegacyCatalogPage />} />
          <Route path="/__legacy/artifacts/:id" element={<LegacyArtifactDetailPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

function launchSocialAuth(
  provider: SocialAuthProvider,
  options: {
    mode: 'login' | 'signup'
    role?: RegisterPayload['role']
    redirectTo?: string
  },
) {
  window.location.assign(buildSocialAuthStartUrl(provider, options))
}

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
      'Browse Old Master art, period fashion, carved furniture, lighting and textiles in a cinematic marketplace built for curated discovery.',
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
      "Explorez l'art ancien, la mode d'epoque, le mobilier sculpte, les luminaires et les textiles dans une marketplace cinematographique et curatee.",
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
  const [conversationBadge, setConversationBadge] = useState(0)
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

  useEffect(() => {
    if (!user) {
      setConversationBadge(0)
      return
    }

    let cancelled = false

    const loadBadge = async () => {
      try {
        const conversations = await getConversations()
        if (cancelled) return
        setConversationBadge(conversations.reduce((total, conversation) => total + conversation.unread_count, 0))
      } catch {
        if (cancelled) return
      }
    }

    void loadBadge()
    const interval = window.setInterval(() => {
      void loadBadge()
    }, 5000)

    return () => {
      cancelled = true
      window.clearInterval(interval)
    }
  }, [user])

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
                  <Link className="ghost-button" to="/collector/messages">
                    Messages
                    {conversationBadge > 0 ? <span className="nav-badge">{conversationBadge}</span> : null}
                  </Link>
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
                  <Link className="ghost-button" to="/seller/messages">
                    Messages
                    {conversationBadge > 0 ? <span className="nav-badge">{conversationBadge}</span> : null}
                  </Link>
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
            <span>Image Study</span>
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
              collectors explore them through editorial catalogues, vintage film moments, and refined image study.
            </p>
            <div className="story-stats" aria-label="Marketplace values">
              <span>Curated provenance</span>
              <span>Seller validation</span>
              <span>Object previews</span>
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
                condition note, image preview, and acquisition request can be reviewed before collectors
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
              ['01', 'Seller dossier', 'Images, history, price, and category details are prepared.'],
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
            <Link className="promise-cta" to={user ? getDashboardPathForRole(user.role) : '/signup'}>
              {user ? 'Open workspace' : t.joinGallery}
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
          <Link className="footer-cta" to={user ? getDashboardPathForRole(user.role) : '/signup'}>
            {user ? 'Open workspace' : t.joinGallery}
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
  const [conversationBadge, setConversationBadge] = useState(0)

  useEffect(() => {
    getArtifacts()
      .then((items) => {
        if (items.length > 0) {
          setArtifacts(items)
        }
      })
      .catch(() => undefined)
  }, [])

  useEffect(() => {
    if (!user) {
      setConversationBadge(0)
      return
    }

    let cancelled = false

    const loadBadge = async () => {
      try {
        const conversations = await getConversations()
        if (cancelled) return
        setConversationBadge(conversations.reduce((total, conversation) => total + conversation.unread_count, 0))
      } catch {
        if (cancelled) return
      }
    }

    void loadBadge()
    const interval = window.setInterval(() => {
      void loadBadge()
    }, 5000)

    return () => {
      cancelled = true
      window.clearInterval(interval)
    }
  }, [user])

  useEffect(() => {
    if (!user) {
      setConversationBadge(0)
      return
    }

    let cancelled = false

    const loadBadge = async () => {
      try {
        const conversations = await getConversations()
        if (cancelled) return
        setConversationBadge(conversations.reduce((total, conversation) => total + conversation.unread_count, 0))
      } catch {
        if (cancelled) return
      }
    }

    void loadBadge()
    const interval = window.setInterval(() => {
      void loadBadge()
    }, 5000)

    return () => {
      cancelled = true
      window.clearInterval(interval)
    }
  }, [user])

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
  const dashboardPath = user ? getDashboardPathForRole(user.role) : '/login'
  const dashboardLabel = user ? getWorkspaceLabelForRole(user.role) : 'Sign in'
  const messagePath =
    user?.role === 'buyer'
      ? '/collector/messages'
      : user?.role === 'seller' || user?.role === 'admin'
        ? '/seller/messages'
        : '/login'
  const messageLabel =
    user?.role === 'buyer'
      ? 'Messages'
      : user?.role === 'seller' || user?.role === 'admin'
        ? 'Inbox'
        : 'Messages'
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
                {user ? (
                  <Link className="video-pill-button secondary" to={messagePath}>
                    <span>
                      <ArrowUpRight aria-hidden="true" size={18} />
                    </span>
                    {messageLabel}
                    {conversationBadge > 0 ? <strong className="hero-count-badge">{conversationBadge}</strong> : null}
                  </Link>
                ) : null}
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
        <div className="section-heading section-heading--framed marketplace-heading">
          <span className="section-heading-line" aria-hidden="true" />
          <div className="section-hero-card">
            <p className="eyebrow">Featured pieces</p>
            <h2>Pieces worth opening first</h2>
            <span className="section-caption">Freshly curated from the marketplace</span>
          </div>
          <span className="section-heading-line" aria-hidden="true" />
        </div>
        <div className="artifact-grid marketplace-grid">
          {featuredPieces.map((artifact) => (
            <ArtifactCard artifact={artifact} key={`featured-${artifact.id}`} />
          ))}
        </div>
      </section>

      <section className="page-section marketplace-section" id="new-arrivals">
        <div className="section-heading section-heading--framed marketplace-heading">
          <span className="section-heading-line" aria-hidden="true" />
          <div className="section-hero-card">
            <p className="eyebrow">New arrivals</p>
            <h2>Recently added objects</h2>
            <span className="section-caption">Newest listings from verified sellers</span>
          </div>
          <span className="section-heading-line" aria-hidden="true" />
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
            <Link className="hero-secondary" to={user ? getDashboardPathForRole(user.role) : '/signup'}>
              {user ? 'Open workspace' : 'Create account'}
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
        <div className="catalog-header catalog-header--framed">
          <div className="section-heading section-heading--framed catalog-heading">
            <span className="section-heading-line" aria-hidden="true" />
            <div className="section-hero-card section-hero-card--catalog">
              <p className="eyebrow">Browse catalogue</p>
              <h2>Curated collection atlas</h2>
              <p className="catalog-summary">
                A live index of verified listings, tuned for quick comparison and cleaner discovery.
              </p>
            </div>
            <span className="section-heading-line" aria-hidden="true" />
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
                  {['Curated Gallery', 'Rare Objects', 'Display Rooms'].map((label) => (
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
                  <p>Inspect rare pieces in detailed listings and immersive display rooms.</p>
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

          <div className="atlas-site-footer-hero">
            <div className="atlas-site-footer-hero-copy">
              <p className="eyebrow">Archive room</p>
              <h2>Objects with history, staged softly.</h2>
            </div>
            <p>
              The footer closes the page like a final room in the gallery, with the same calm tone,
              clearer navigation, and a bit more breathing space for the brand.
            </p>
          </div>

          <div className="atlas-site-footer-panels">
            <article>
              <span>Catalogue</span>
              <strong>Browse the featured edit, new arrivals, and the full collection atlas.</strong>
            </article>
            <article>
              <span>Curators</span>
              <strong>Seller stories and provenance notes stay visible.</strong>
            </article>
            <article>
              <span>Collector care</span>
              <strong>Protected checkout, saved objects, and account routes are ready.</strong>
            </article>
          </div>

          <div className="atlas-site-footer-detail" aria-hidden="true">
            <span className="atlas-site-footer-detail-label">Archive note</span>
            <span className="atlas-site-footer-detail-rule" />
            <span className="atlas-site-footer-detail-text">
              Curated objects and provenance in one calm catalogue.
            </span>
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
  const [form, setForm] = useState<RegisterPayload>({
    email: '',
    password: '',
    role: 'buyer',
    first_name: '',
    last_name: '',
  })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  function updateField(field: keyof RegisterPayload, value: string) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('loading')
    setMessage('')

    try {
      const submittedEmail = form.email
      await registerUser(form)
      setStatus('success')
      setMessage('Your account is ready. Continue with the same email on the login page.')
      setForm({ email: '', password: '', role: 'buyer', first_name: '', last_name: '' })
      navigate('/login', { state: { email: submittedEmail } })
    } catch {
      setStatus('error')
      setMessage('Signup was not accepted. Check that the backend is running on port 8000.')
    }
  }

  return (
    <AuroraAuthShell
      activeStep={1}
      footer={
        <p className="text-sm text-[#556b97]">
          Already part of the gallery?{' '}
          <Link
            className="font-medium text-[#355bb7] transition hover:text-[#294895]"
            state={form.email ? { email: form.email } : undefined}
            to="/login"
          >
            Log in
          </Link>
        </p>
      }
      message={message}
      messageTone={status}
      mode="signup"
      redirectTo={undefined}
      socialRole={form.role}
      subtitle="Open your Artisan's Echo account to collect, save, and request rare objects."
      title="Create Your Profile"
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-3">
          <p className="text-sm font-medium text-white">Choose your profile type</p>
          <div className="grid grid-cols-2 gap-3">
            {(['buyer', 'seller'] as const).map((role) => {
              const active = form.role === role
              return (
                <button
                  className={`h-12 rounded-xl border text-sm font-medium transition ${
                    active
                      ? 'border-[#93abdb] bg-[#eef4ff] text-[#18366f]'
                      : 'border-[#c8d7ef] bg-[#f7faff] text-[#556b97] hover:bg-[#edf3ff]'
                  }`}
                  key={role}
                  onClick={() => updateField('role', role)}
                  type="button"
                >
                  {role === 'buyer' ? 'Collector' : 'Seller'}
                </button>
              )
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <InputGroup
            autoComplete="given-name"
            label="First Name"
            name="first_name"
            onChange={(event) => updateField('first_name', event.target.value)}
            placeholder="Nora"
            required
            type="text"
            value={form.first_name}
          />
          <InputGroup
            autoComplete="family-name"
            label="Last Name"
            name="last_name"
            onChange={(event) => updateField('last_name', event.target.value)}
            placeholder="Avery"
            required
            type="text"
            value={form.last_name}
          />
        </div>

        <InputGroup
          autoComplete="email"
          label="Email"
          name="email"
          onChange={(event) => updateField('email', event.target.value)}
          placeholder="name@aurora.com"
          required
          type="email"
          value={form.email}
        />

        <InputGroup
          autoComplete="new-password"
          helperText="Requires at least 8 symbols."
          inputClassName="pr-12"
          label="Password"
          minLength={8}
          name="password"
          onChange={(event) => updateField('password', event.target.value)}
          placeholder="Create a secure password"
          required
          trailing={
            <button
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="text-white/45 transition hover:text-white"
              onClick={() => setShowPassword((current) => !current)}
              type="button"
            >
              {showPassword ? (
                <EyeOff className="h-[18px] w-[18px]" />
              ) : (
                <Eye className="h-[18px] w-[18px]" />
              )}
            </button>
          }
          type={showPassword ? 'text' : 'password'}
          value={form.password}
        />

        <button
          className="mt-4 h-14 w-full rounded-xl bg-[#355bb7] font-semibold text-white transition hover:bg-[#294895] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={status === 'loading'}
          type="submit"
        >
          {status === 'loading' ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>
    </AuroraAuthShell>
  )
}

function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, login, user } = useAuth()
  const locationState = location.state as { email?: string; redirectTo?: string } | null
  const [form, setForm] = useState({
    email: locationState?.email ?? '',
    password: '',
  })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      navigate(locationState?.redirectTo ?? getDashboardPathForRole(user?.role), { replace: true })
    }
  }, [isAuthenticated, locationState?.redirectTo, navigate, user?.role])

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

  return (
    <AuroraAuthShell
      activeStep={3}
      footer={
        <p className="text-sm text-[#556b97]">
          New to Artisan&apos;s Echo?{' '}
          <Link className="font-medium text-[#355bb7] transition hover:text-[#294895]" to="/signup">
            Create account
          </Link>
        </p>
      }
      message={message}
      messageTone={status}
      mode="login"
      redirectTo={locationState?.redirectTo}
      subtitle="Use the email and password linked to your collector or seller profile."
      title="Access Your Gallery Account"
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <InputGroup
          autoComplete="email"
          label="Email"
          name="email"
          onChange={(event) => updateField('email', event.target.value)}
          placeholder="name@aurora.com"
          required
          type="email"
          value={form.email}
        />

        <InputGroup
          autoComplete="current-password"
          helperText="Use the same password you created during signup."
          inputClassName="pr-12"
          label="Password"
          name="password"
          onChange={(event) => updateField('password', event.target.value)}
          placeholder="Enter your password"
          required
          trailing={
            <button
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="text-white/45 transition hover:text-white"
              onClick={() => setShowPassword((current) => !current)}
              type="button"
            >
              {showPassword ? (
                <EyeOff className="h-[18px] w-[18px]" />
              ) : (
                <Eye className="h-[18px] w-[18px]" />
              )}
            </button>
          }
          type={showPassword ? 'text' : 'password'}
          value={form.password}
        />

        <button
          className="mt-4 h-14 w-full rounded-xl bg-[#355bb7] font-semibold text-white transition hover:bg-[#294895] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={status === 'loading'}
          type="submit"
        >
          {status === 'loading' ? 'Signing In...' : 'Log In'}
        </button>
      </form>
    </AuroraAuthShell>
  )
}

function SocialAuthCallbackPage() {
  const location = useLocation()
  const [message, setMessage] = useState('Completing your secure sign-in...')

  useEffect(() => {
    const params = new URLSearchParams(location.hash.replace(/^#/, ''))
    const error = params.get('error')
    const access = params.get('access')
    const refresh = params.get('refresh')
    const redirectTo = params.get('redirect_to')

    if (error) {
      clearAuthSession()
      applyAccessToken(null)
      setMessage(error)
      return
    }

    if (!access || !refresh) {
      clearAuthSession()
      applyAccessToken(null)
      setMessage('Social login did not return a complete session.')
      return
    }

    let cancelled = false

    const finalizeSession = async () => {
      try {
        applyAccessToken(access)
        const user = await getCurrentUser()
        if (cancelled) return

        saveAuthSession({
          access,
          refresh,
          user,
        })

        window.location.replace(redirectTo || getDashboardPathForRole(user.role))
      } catch {
        if (cancelled) return

        clearAuthSession()
        applyAccessToken(null)
        setMessage('Social login completed, but the app could not restore your account session.')
      }
    }

    void finalizeSession()

    return () => {
      cancelled = true
    }
  }, [location.hash])

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#d8e6fb] px-6 text-[#18366f]">
      <div className="w-full max-w-md rounded-3xl border border-[#c8d7ef] bg-[#f7faff] px-8 py-10 text-center shadow-[0_24px_60px_rgba(24,54,111,0.12)]">
        <p className="text-sm font-medium uppercase tracking-[0.28em] text-[#7a90ba]">Social Auth</p>
        <h1 className="mt-4 text-3xl font-medium tracking-tight">Finishing your access</h1>
        <p className="mt-4 text-sm leading-relaxed text-[#556b97]">{message}</p>
      </div>
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

  function requireBuyer(redirectTo?: string) {
    if (!artifact) {
      return false
    }

    if (!user) {
      navigate('/login', { state: { redirectTo: redirectTo ?? `/artifacts/${artifact.id}` } })
      return false
    }

    if (user.role === 'buyer') {
      return true
    }

    setActionStatus('error')
    setActionMessage(
      'These actions are only for collector accounts. You are currently in seller workspace, so switch to a buyer login to use cart, wishlist, or seller messages.',
    )
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
              <span>Study</span>
              <strong>{artifact.image ? 'Image-led' : 'Curated set'}</strong>
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

          {galleryImages.length > 1 && (
            <section className="viewer-dossier">
              <div>
                <p className="eyebrow">Image study</p>
                <h2>Compare the hero shot with the supporting views.</h2>
                <p className="product-description">
                  Each listing uses editorial photography, close crops, and detail shots so collectors
                  can inspect the surface without a model viewer.
                </p>
              </div>
            </section>
          )}
        </div>

        <aside className="product-summary">
          <p className="eyebrow">Acquisition dossier</p>
          <h2>Collector purchase panel</h2>
          <p className="product-price">{formatPrice(artifact.price)}</p>
          <p className="product-description">
            Review condition, seller validation, and image study before moving approved objects
            into your cart or wishlist.
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
              <dd>{artifact.image ? 'Curated image set available' : 'Image set available'}</dd>
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
            This listing is composed like a collector dossier: image evidence, object story, and
            purchase confidence in one focused experience.
          </p>
          <div className="curator-seal">
            <span>Archive grade</span>
            <strong>{artifact.condition}</strong>
          </div>
        </article>
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

        <section className="service-strip" aria-label="Buyer services">
          {[
          ['Protected checkout', 'Simulated payment workflow for the PFE demo.'],
          ['Curator validation', 'Admin review can approve or reject marketplace objects.'],
          ['Seller contact', 'Buyer and seller flows are prepared for marketplace expansion.'],
          ['Gallery placement', 'Artifacts can be arranged as exhibits in display rooms.'],
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
            The product page now behaves like a gallery dossier: image study, condition review,
            concierge action, and nearby objects for a complete acquisition path.
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
  const [cartQuantity, setCartQuantity] = useState(0)
  const [actionStatus, setActionStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [actionMessage, setActionMessage] = useState('')

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

  function requireBuyer(redirectTo?: string) {
    if (user?.role === 'buyer' && artifact) {
      return true
    }

    if (!artifact) {
      return false
    }

    navigate('/login', { state: { redirectTo: redirectTo ?? `/artifacts/${artifact.id}` } })
    return false
  }

  async function handleWishlistToggle() {
    if (!requireBuyer() || !artifact) return

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
      setActionMessage('Wishlist update failed. Please try again.')
    }
  }

  async function handleCartAdd() {
    if (!requireBuyer() || !artifact) return

    setActionStatus('loading')
    setActionMessage('')

    try {
      const cartItem = await addCartItem(artifact.id, 1)
      setCartQuantity(cartItem.quantity)
      setActionStatus('success')
      setActionMessage(cartQuantity > 0 ? 'Added one more copy to your cart.' : 'Added to your cart.')
    } catch {
      setActionStatus('error')
      setActionMessage('Cart update failed. Please try again.')
    }
  }

  function openSellerThread() {
    if (!artifact) return
    if (!requireBuyer(`/artifacts/${artifact.id}/message`)) return

    navigate(`/artifacts/${artifact.id}/message`, {
      state: {
        artifactTitle: artifact.title,
        sellerName: artifact.seller_email || 'Verified seller',
      },
    })
  }

  function openCartPage() {
    if (!requireBuyer('/cart')) return
    navigate('/cart')
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
  const lotNumber = `AE-${String(artifact.id).padStart(4, '0')}`
  const categoryLabel = artifact.category_name ?? 'Uncategorized'
  const detailCards = [
    ['Description', 'Object details', artifact.description],
    ['Provenance', 'Recorded history', provenance],
    [
      'Shipping',
      'Delivery on request',
      'White-glove packing, insured shipping, and delivery scheduling can be arranged directly with the seller.',
    ],
    [
      'Condition',
      'Current state',
      artifact.history || 'Condition notes come directly from the seller listing and curator review.',
    ],
  ] as const
  const dossierHighlights = [
    ['Condition', artifact.condition],
    ['Status', artifact.status],
    ['Materials', materials],
    ['Dimensions', dimensions],
    ['Seller', sellerName],
    ['Catalogue ID', lotNumber],
  ] as const
  const atmosphereNotes = [
    [
      '01',
      'Collector presentation',
      'The product page opens like a private dossier, with image-led storytelling and immediate acquisition cues.',
    ],
    [
      '02',
      'Surface inspection',
      'Thumbnail swaps, scale framing, and image review help the object feel tangible before checkout.',
    ],
    [
      '03',
      'Seller conversation',
      'Ask seller now opens a separate protected-style message page with the artifact already attached to the thread.',
    ],
  ] as const

  return (
    <main className="min-h-screen bg-[#eef3f9] text-[#18212f]">
      <section className="relative overflow-hidden border-b border-[#d7e0ec] bg-[radial-gradient(circle_at_top_left,_rgba(134,165,205,0.26),_transparent_32%),linear-gradient(180deg,#f7f9fc_0%,#eef3f9_100%)]">
        <div className="absolute inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_center,_rgba(126,167,214,0.18),_transparent_58%)]" />
        <div className="relative px-4 pb-12 pt-6 sm:px-8 lg:px-12 xl:px-16 xl:pb-16">
          <nav
            aria-label="Product navigation"
            className="flex flex-col gap-4 border-b border-[#d7e0ec] pb-4 text-sm text-[#64748b] sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex flex-wrap items-center gap-3">
              <Link className="font-medium text-[#18212f] transition hover:text-[#3857a6]" to="/">
                Back to marketplace
              </Link>
              <span className="hidden h-1 w-1 rounded-full bg-[#94a3b8] sm:block" />
              <span>{categoryLabel}</span>
              <span className="hidden h-1 w-1 rounded-full bg-[#94a3b8] sm:block" />
              <span>{lotNumber}</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-[#d7e0ec] bg-white/75 px-3 py-1 font-medium text-[#3857a6] shadow-sm backdrop-blur">
                {artifact.status}
              </span>
              <span className="rounded-full border border-[#d7e0ec] bg-white/75 px-3 py-1 font-medium text-[#18212f] shadow-sm backdrop-blur">
                {artifact.condition}
              </span>
            </div>
          </nav>

          <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1.3fr)_minmax(360px,0.7fr)]">
            <div className="space-y-8">
              <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_180px]">
                <figure className="relative overflow-hidden rounded-[2rem] border border-white/60 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
                  <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-5 py-5 text-xs font-semibold uppercase tracking-[0.28em] text-white/90">
                    <span className="rounded-full bg-[#18212f]/50 px-3 py-2 backdrop-blur">Curated Object</span>
                    <span className="rounded-full bg-[#3857a6]/60 px-3 py-2 backdrop-blur">{lotNumber}</span>
                  </div>
                  <div className="min-h-[26rem] bg-[#edf2f7] sm:min-h-[32rem] xl:min-h-[43rem]">
                    <MarketplaceImage alt={artifact.title} src={selectedImage} />
                  </div>
                  <figcaption className="flex flex-col gap-3 border-t border-[#e5ebf3] bg-white px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-[#7c8aa0]">Presentation Frame</p>
                      <strong className="mt-2 block text-lg font-medium text-[#18212f]">{artifact.title}</strong>
                    </div>
                    <div className="rounded-2xl bg-[#f4f7fb] px-4 py-3 text-sm text-[#526277]">
                      Best suited for a salon, collector wall, or private gallery sequence.
                    </div>
                  </figcaption>
                </figure>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 xl:grid-cols-1" aria-label="Object image set">
                  {galleryImages.map((image, index) => (
                    <button
                      aria-label={`View product image ${index + 1}`}
                      className={`overflow-hidden rounded-[1.4rem] border bg-white text-left shadow-[0_18px_48px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 ${
                        index === selectedImageIndex
                          ? 'border-[#3857a6] ring-2 ring-[#3857a6]/15'
                          : 'border-[#d7e0ec] hover:border-[#9fb2d0]'
                      }`}
                      key={`${image}-${index}`}
                      onClick={() => setSelectedImageIndex(index)}
                      type="button"
                    >
                      <div className="aspect-[4/4.2] bg-[#edf2f7]">
                        <MarketplaceImage alt="" src={image} />
                      </div>
                      <div className="px-3 py-3 text-xs uppercase tracking-[0.24em] text-[#70829a]">
                        Frame {String(index + 1).padStart(2, '0')}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
                <section className="rounded-[2rem] border border-[#d7e0ec] bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.05)] sm:p-6">
                  <div className="flex flex-col gap-3 border-b border-[#e7edf5] pb-5 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-[#7c8aa0]">Image study</p>
                      <h2 className="mt-2 text-2xl font-medium tracking-tight text-[#18212f]">
                        Full object study with curated photography
                      </h2>
                    </div>
                    <p className="max-w-sm text-sm leading-7 text-[#5c6c82]">
                      Rotate through the supplied photos and review the object from every angle before deciding whether to save, acquire, or message the seller.
                    </p>
                  </div>
                  <div className="mt-6 grid gap-3 sm:grid-cols-3">
                    {galleryImages.slice(0, 3).map((image, index) => (
                      <div
                        className="overflow-hidden rounded-[1.4rem] border border-[#e7edf5] bg-[#f4f7fb]"
                        key={`${image}-${index}`}
                      >
                        <img alt="" className="h-40 w-full object-cover" src={image} />
                      </div>
                    ))}
                  </div>
                </section>

                <section className="rounded-[2rem] border border-[#d7e0ec] bg-[#18212f] p-5 text-white shadow-[0_24px_70px_rgba(15,23,42,0.18)] sm:p-6">
                  <p className="text-xs uppercase tracking-[0.3em] text-white/55">Collector Readiness</p>
                  <div className="mt-5 space-y-4">
                    {atmosphereNotes.map(([index, title, text]) => (
                      <article
                        className="rounded-[1.4rem] border border-white/10 bg-white/5 px-4 py-4 backdrop-blur"
                        key={index}
                      >
                        <span className="text-xs uppercase tracking-[0.24em] text-white/45">{index}</span>
                        <h3 className="mt-2 text-lg font-medium">{title}</h3>
                        <p className="mt-2 text-sm leading-7 text-white/68">{text}</p>
                      </article>
                    ))}
                  </div>
                </section>
              </div>
            </div>

            <aside className="space-y-6 xl:sticky xl:top-8 xl:self-start">
              <section className="overflow-hidden rounded-[2rem] border border-[#d7e0ec] bg-white shadow-[0_28px_80px_rgba(15,23,42,0.08)]">
                <div className="border-b border-[#e7edf5] bg-[linear-gradient(180deg,rgba(244,247,251,0.9),rgba(255,255,255,0.96))] px-5 py-5 sm:px-6">
                  <p className="text-xs uppercase tracking-[0.3em] text-[#7c8aa0]">Marketplace Listing</p>
                  <h1 className="mt-3 text-4xl font-medium tracking-tight text-[#18212f]">{artifact.title}</h1>
                  <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-[#607086]">
                    <span className="rounded-full border border-[#d7e0ec] bg-white/80 px-3 py-1.5">{categoryLabel}</span>
                    <span>Verified seller route enabled</span>
                  </div>
                  <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
                    <div>
                      <p className="text-sm uppercase tracking-[0.28em] text-[#7c8aa0]">Collector Price</p>
                      <strong className="mt-2 block text-4xl font-medium text-[#3857a6]">
                        {formatPrice(artifact.price)}
                      </strong>
                    </div>
                    <div className="rounded-[1.3rem] bg-[#f4f7fb] px-4 py-3 text-sm text-[#526277]">
                      Dossier status: acquisition-ready
                    </div>
                  </div>
                  <p className="mt-6 max-w-xl text-base leading-8 text-[#5c6c82]">{artifact.description}</p>
                </div>

                <div className="space-y-6 px-5 py-5 sm:px-6 sm:py-6">
                  <section className="rounded-[1.5rem] border border-[#d7e0ec] bg-[#f7f9fc] p-4">
                    <p className="text-xs uppercase tracking-[0.28em] text-[#7c8aa0]">Presented by</p>
                    <strong className="mt-3 block text-xl font-medium text-[#18212f]">{sellerName}</strong>
                    <p className="mt-2 text-sm leading-7 text-[#5c6c82]">
                      Verified listing from the marketplace catalog with provenance notes and protected collector access.
                    </p>
                  </section>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <button
                      className="h-14 rounded-2xl bg-[#18212f] px-5 text-sm font-medium text-white transition hover:bg-[#0f1724] disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={actionStatus === 'loading'}
                      onClick={() => {
                        void handleCartAdd()
                      }}
                      type="button"
                    >
                      {cartQuantity > 0 ? `Add one more (${cartQuantity})` : 'Add to cart'}
                    </button>
                    <button
                      className={`h-14 rounded-2xl border px-5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${
                        wishlistItemId
                          ? 'border-[#3857a6] bg-[#eef4ff] text-[#3857a6]'
                          : 'border-[#d7e0ec] bg-white text-[#18212f] hover:border-[#9fb2d0]'
                      }`}
                      disabled={actionStatus === 'loading'}
                      onClick={() => {
                        void handleWishlistToggle()
                      }}
                      type="button"
                    >
                      {wishlistItemId ? 'Saved to wishlist' : 'Save to wishlist'}
                    </button>
                    <button
                      className="flex h-14 items-center justify-center rounded-2xl border border-[#d7e0ec] bg-white px-5 text-sm font-medium text-[#18212f] transition hover:border-[#9fb2d0]"
                      onClick={openCartPage}
                      type="button"
                    >
                      Go to cart
                    </button>
                    <button
                      className="flex h-14 items-center justify-center rounded-2xl bg-[#3857a6] px-5 text-sm font-medium text-white transition hover:bg-[#2f4c93]"
                      onClick={openSellerThread}
                      type="button"
                    >
                      Ask seller in messages
                    </button>
                  </div>

                  {actionMessage ? (
                    <p
                      className={`rounded-2xl border px-4 py-3 text-sm ${
                        actionStatus === 'error'
                          ? 'border-red-200 bg-red-50 text-red-700'
                          : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                      }`}
                    >
                      {actionMessage}
                    </p>
                  ) : null}

                  <dl className="grid gap-3 sm:grid-cols-2">
                    {dossierHighlights.map(([label, value]) => (
                      <div
                        className="rounded-[1.3rem] border border-[#e7edf5] bg-white px-4 py-4"
                        key={label}
                      >
                        <dt className="text-xs uppercase tracking-[0.26em] text-[#7c8aa0]">{label}</dt>
                        <dd className="mt-2 text-sm leading-7 text-[#1f2937]">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </section>
            </aside>
          </div>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-8 lg:px-12 xl:px-16">
        <div className="grid gap-5 lg:grid-cols-4">
          {detailCards.map(([eyebrow, title, text]) => (
            <article
              className="rounded-[2rem] border border-[#d7e0ec] bg-white p-5 shadow-[0_18px_54px_rgba(15,23,42,0.04)] sm:p-6"
              key={title}
            >
              <p className="text-xs uppercase tracking-[0.3em] text-[#7c8aa0]">{eyebrow}</p>
              <h2 className="mt-3 text-2xl font-medium tracking-tight text-[#18212f]">{title}</h2>
              <p className="mt-4 text-sm leading-8 text-[#5c6c82]">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="px-4 pb-8 sm:px-8 lg:px-12 xl:px-16">
        <div className="rounded-[2.2rem] border border-[#d7e0ec] bg-[linear-gradient(180deg,#ffffff_0%,#f7f9fc_100%)] p-5 shadow-[0_22px_70px_rgba(15,23,42,0.05)] sm:p-6 lg:p-8">
          <div className="flex flex-col gap-4 border-b border-[#e7edf5] pb-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[#7c8aa0]">Related Objects</p>
              <h2 className="mt-3 text-3xl font-medium tracking-tight text-[#18212f]">
                Continue through the collection atlas
              </h2>
            </div>
            <Link className="text-sm font-medium text-[#3857a6] transition hover:text-[#243b73]" to="/">
              Return to catalogue
            </Link>
          </div>
          <div className="mt-6 grid gap-5 xl:grid-cols-3">
            {relatedArtifacts.map((item) => (
              <ArtifactCard artifact={item} key={`related-${item.id}`} variant="compact" />
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}

function formatConversationTimestamp(value: string) {
  return new Date(value).toLocaleString([], {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

function ProductMessagePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { status, user } = useAuth()
  const locationState = location.state as { artifactTitle?: string; sellerName?: string } | null
  const [artifact, setArtifact] = useState<Artifact | undefined>(() =>
    demoArtifacts.find((item) => String(item.id) === id),
  )
  const [conversation, setConversation] = useState<ConversationDetail | null>(null)
  const [threadStatus, setThreadStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [threadMessage, setThreadMessage] = useState('')
  const [composerStatus, setComposerStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [draft, setDraft] = useState(
    locationState?.artifactTitle
      ? `Hi, I would like to ask about ${locationState.artifactTitle}. `
      : 'Hi, I would like to ask about this object. ',
  )

  useEffect(() => {
    if (!id) return
    getArtifact(id)
      .then(setArtifact)
      .catch(() => {
        setArtifact(demoArtifacts.find((item) => String(item.id) === id))
      })
  }, [id])

  useEffect(() => {
    if (!id || status === 'loading') return
    if (!user) {
      navigate('/login', { replace: true, state: { redirectTo: `/artifacts/${id}/message` } })
      return
    }
    if (user.role === 'buyer') return
    if (user.role === 'seller' || user.role === 'admin') {
      navigate('/seller/messages', { replace: true })
    }
  }, [id, navigate, status, user])

  useEffect(() => {
    if (!artifact || status !== 'authenticated' || user?.role !== 'buyer') return

    let cancelled = false

    const loadConversation = async (showLoader = true) => {
      if (showLoader) {
        setThreadStatus('loading')
      }
      setThreadMessage('')

      try {
        const existing = await getConversations({ artifact: artifact.id })
        if (cancelled) return

        if (existing.length === 0) {
          setConversation(null)
          setThreadStatus('idle')
          return
        }

        const detail = await getConversation(existing[0].id)
        if (cancelled) return

        setConversation(detail)
        setThreadStatus('idle')
      } catch {
        if (cancelled) return
        setThreadStatus('error')
        setThreadMessage('Unable to load the live seller thread right now.')
      }
    }

    void loadConversation()
    const interval = window.setInterval(() => {
      void loadConversation(false)
    }, 5000)

    return () => {
      cancelled = true
      window.clearInterval(interval)
    }
  }, [artifact, status, user?.role])

  if (status === 'loading') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#eef3f9] px-6">
        <div className="rounded-[2rem] border border-[#d7e0ec] bg-white px-8 py-10 text-center shadow-[0_24px_70px_rgba(15,23,42,0.06)]">
          <p className="text-sm uppercase tracking-[0.28em] text-[#7c8aa0]">Messages</p>
          <h1 className="mt-4 text-3xl font-medium tracking-tight text-[#18212f]">Opening your thread</h1>
          <p className="mt-4 text-sm leading-7 text-[#5c6c82]">
            Restoring your collector session before loading the seller conversation.
          </p>
        </div>
      </main>
    )
  }

  if (!artifact) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#eef3f9] px-6">
        <div className="rounded-[2rem] border border-[#d7e0ec] bg-white px-8 py-10 text-center shadow-[0_24px_70px_rgba(15,23,42,0.06)]">
          <p className="text-sm uppercase tracking-[0.28em] text-[#7c8aa0]">Messages</p>
          <h1 className="mt-4 text-3xl font-medium tracking-tight text-[#18212f]">Object not found</h1>
          <Link className="mt-6 inline-flex text-sm font-medium text-[#3857a6]" to="/">
            Return to marketplace
          </Link>
        </div>
      </main>
    )
  }

  const currentArtifact = artifact
  const sellerName = currentArtifact.seller_email || locationState?.sellerName || 'Verified seller'
  const heroImage = resolveMarketplaceImage(currentArtifact)
  const lotNumber = `AE-${String(currentArtifact.id).padStart(4, '0')}`
  const messages = conversation?.messages ?? []

  async function handleSendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const cleanedDraft = draft.trim()
    if (!cleanedDraft) return

    setComposerStatus('loading')
    setThreadMessage('')

    try {
      const nextConversation = conversation
        ? await replyConversation(conversation.id, cleanedDraft)
        : await createConversation(currentArtifact.id, cleanedDraft)
      setConversation(nextConversation)
      setDraft('')
      setComposerStatus('idle')
    } catch {
      setComposerStatus('error')
      setThreadMessage('Message delivery failed. Please try again in a moment.')
    }
  }

  return (
    <main className="min-h-screen bg-[#edf3f9] px-4 py-4 text-[#18212f] sm:px-6 lg:px-8 xl:px-10">
      <div className="grid min-h-[calc(100vh-2rem)] gap-5 lg:grid-cols-[22rem_minmax(0,1fr)]">
        <aside className="rounded-[2rem] border border-[#d7e0ec] bg-white p-5 shadow-[0_24px_70px_rgba(15,23,42,0.05)] sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-[#7c8aa0]">Seller Thread</p>
              <h1 className="mt-2 text-2xl font-medium tracking-tight">Collector messages</h1>
            </div>
            <Link className="text-sm font-medium text-[#3857a6] transition hover:text-[#243b73]" to={`/artifacts/${currentArtifact.id}`}>
              Back to object
            </Link>
          </div>

          <div className="mt-6 overflow-hidden rounded-[1.7rem] border border-[#d7e0ec] bg-[#f8fbff]">
            <div className="aspect-[1.05/1] bg-[#edf2f7]">
              <MarketplaceImage alt={currentArtifact.title} src={heroImage} />
            </div>
            <div className="space-y-3 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.28em] text-[#7c8aa0]">{lotNumber}</p>
              <h2 className="text-xl font-medium text-[#18212f]">{currentArtifact.title}</h2>
              <p className="text-sm leading-7 text-[#5c6c82]">{currentArtifact.description}</p>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[#eef4ff] px-3 py-1 text-xs font-medium text-[#3857a6]">
                  {currentArtifact.category_name ?? 'Object'}
                </span>
                <span className="rounded-full bg-[#18212f] px-3 py-1 text-xs font-medium text-white">
                  {formatPrice(currentArtifact.price)}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div className="rounded-[1.4rem] border border-[#d7e0ec] bg-[#f7f9fc] px-4 py-4">
              <p className="text-xs uppercase tracking-[0.26em] text-[#7c8aa0]">Seller</p>
              <strong className="mt-2 block text-lg font-medium text-[#18212f]">{sellerName}</strong>
              <p className="mt-2 text-sm leading-7 text-[#5c6c82]">
                Verified listing contact with lot number, catalog context, and buyer thread history attached.
              </p>
            </div>
            <div className="rounded-[1.4rem] border border-[#d7e0ec] bg-[#18212f] px-4 py-4 text-white">
              <p className="text-xs uppercase tracking-[0.26em] text-white/45">Thread notes</p>
              <ul className="mt-3 space-y-3 text-sm leading-7 text-white/72">
                <li>The artifact preview stays pinned while you talk.</li>
                <li>Each thread is now stored in the backend and visible to the real seller dashboard.</li>
                <li>Your message automatically belongs to this exact object conversation.</li>
              </ul>
            </div>
          </div>
        </aside>

        <section className="flex min-h-[70vh] flex-col overflow-hidden rounded-[2rem] border border-[#d7e0ec] bg-white shadow-[0_28px_80px_rgba(15,23,42,0.06)]">
          <header className="flex flex-col gap-4 border-b border-[#e7edf5] bg-[linear-gradient(180deg,#ffffff_0%,#f7f9fc_100%)] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[#7c8aa0]">Protected conversation</p>
              <h2 className="mt-2 text-3xl font-medium tracking-tight text-[#18212f]">
                Message seller about {currentArtifact.title}
              </h2>
            </div>
            <div className="rounded-[1.2rem] bg-[#eef4ff] px-4 py-3 text-sm text-[#3857a6]">
              Attached artifact: {lotNumber}
            </div>
          </header>

          <div className="flex-1 space-y-5 overflow-y-auto bg-[linear-gradient(180deg,#fbfdff_0%,#f4f7fb_100%)] px-4 py-5 sm:px-6">
            {!conversation && threadStatus !== 'loading' ? (
              <div className="flex h-full items-center justify-center">
                <article className="max-w-xl rounded-[1.8rem] border border-[#d7e0ec] bg-white px-6 py-6 text-center shadow-sm">
                  <p className="text-xs uppercase tracking-[0.3em] text-[#7c8aa0]">Start thread</p>
                  <h3 className="mt-3 text-2xl font-medium tracking-tight text-[#18212f]">
                    Your first message creates the seller conversation
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-[#5c6c82]">
                    The seller will receive this as a live inbox item inside the seller workspace with the artifact already attached.
                  </p>
                </article>
              </div>
            ) : null}

            {threadStatus === 'loading' ? (
              <div className="flex h-full items-center justify-center">
                <div className="rounded-[1.8rem] border border-[#d7e0ec] bg-white px-6 py-5 text-sm text-[#5c6c82] shadow-sm">
                  Loading live seller conversation...
                </div>
              </div>
            ) : null}

            {messages.map((message: ConversationMessage) => {
              const isBuyerMessage = message.sender === user?.id
              const isSellerMessage = message.sender_role === 'seller' && message.sender !== user?.id

              return (
              <div
                className={`flex ${isBuyerMessage ? 'justify-end' : isSellerMessage ? 'justify-start' : 'justify-center'}`}
                key={`message-${message.id}`}
              >
                <article
                  className={`max-w-2xl rounded-[1.6rem] px-4 py-4 text-sm leading-7 shadow-sm ${
                    isBuyerMessage
                      ? 'bg-[#3857a6] text-white'
                      : isSellerMessage
                        ? 'border border-[#d7e0ec] bg-white text-[#18212f]'
                        : 'border border-[#d7e0ec] bg-[#f7f9fc] text-[#5c6c82]'
                  }`}
                >
                  <div className="mb-2 flex items-center justify-between gap-4 text-[11px] uppercase tracking-[0.24em]">
                    <span>
                      {isBuyerMessage
                        ? 'Collector'
                        : isSellerMessage
                          ? sellerName
                          : 'Conversation'}
                    </span>
                    <span className={isBuyerMessage ? 'text-white/60' : 'text-[#8da0b8]'}>
                      {formatConversationTimestamp(message.created_at)}
                    </span>
                  </div>
                  <p>{message.body}</p>
                </article>
              </div>
              )
            })}
          </div>

          <form
            className="border-t border-[#e7edf5] bg-white px-4 py-4 sm:px-6"
            onSubmit={handleSendMessage}
          >
            <div className="rounded-[1.6rem] border border-[#d7e0ec] bg-[#f8fbff] p-4">
              <div className="mb-3 flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.28em] text-[#7c8aa0]">
                <span className="rounded-full border border-[#d7e0ec] bg-white px-3 py-1.5">{lotNumber}</span>
                <span className="rounded-full border border-[#d7e0ec] bg-white px-3 py-1.5">Artifact attached</span>
              </div>
              <textarea
                className="min-h-[10rem] w-full resize-none rounded-[1.2rem] border border-[#d7e0ec] bg-white px-4 py-4 text-sm leading-7 text-[#18212f] outline-none transition focus:border-[#9fb2d0] focus:ring-2 focus:ring-[#3857a6]/15"
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Ask about provenance, condition, delivery city, pricing discussion, or viewing details."
                required
                value={draft}
              />
              {threadMessage ? (
                <p className="mt-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {threadMessage}
                </p>
              ) : null}
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm leading-7 text-[#5c6c82]">
                  Your message is sent inside the live thread for <strong>{currentArtifact.title}</strong>.
                </p>
                <button
                  className="inline-flex h-12 items-center justify-center rounded-2xl bg-[#18212f] px-6 text-sm font-medium text-white transition hover:bg-[#0f1724] disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={composerStatus === 'loading'}
                  type="submit"
                >
                  {composerStatus === 'loading' ? 'Sending...' : conversation ? 'Send reply' : 'Start conversation'}
                </button>
              </div>
            </div>
          </form>
        </section>
      </div>
    </main>
  )
}

type AuroraAuthShellProps = {
  title: string
  subtitle: string
  message: string
  messageTone: 'idle' | 'loading' | 'success' | 'error'
  footer: ReactNode
  children: ReactNode
  activeStep: 1 | 2 | 3
  mode: 'signup' | 'login'
  socialRole?: RegisterPayload['role']
  redirectTo?: string
}

function AuroraAuthShell({
  title,
  subtitle,
  message,
  messageTone,
  footer,
  children,
  activeStep,
  mode,
  socialRole,
  redirectTo,
}: AuroraAuthShellProps) {
  const reduceMotion = useReducedMotion()
  const easeOut = [0.22, 1, 0.36, 1] as const

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: reduceMotion
        ? { duration: 0.01 }
        : {
            staggerChildren: 0.15,
            delayChildren: 0.2,
          },
    },
  }

  const childVariants = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: reduceMotion ? 0.01 : 0.5,
        ease: easeOut,
      },
    },
  }

  const heroCopy =
    mode === 'signup'
      ? 'Complete these 3 curated steps to open your collector or seller space.'
      : 'Return to your verified marketplace profile and continue your collection.'

  return (
    <main className="flex min-h-screen w-full bg-[#d8e6fb] p-2 text-[#18366f] transition-all duration-500 selection:bg-[#99baf5]/40 lg:h-screen lg:overflow-hidden lg:p-4">
      <section className="relative hidden h-full w-[52%] flex-col items-center justify-end overflow-hidden rounded-3xl px-12 pb-32 shadow-[0_32px_80px_rgba(22,14,10,0.22)] lg:flex">
        <video
          autoPlay
          className="absolute inset-0 h-full w-full object-cover"
          loop
          muted
          playsInline
        >
          <source
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260506_081238_406ed0e3-5d83-436e-a512-0bbff7ec5b95.mp4"
            type="video/mp4"
          />
        </video>

        <motion.div
          animate="visible"
          className="z-10 w-full max-w-xs space-y-8"
          initial="hidden"
          variants={containerVariants}
        >
          <motion.div className="flex items-center gap-3" variants={childVariants}>
            <Circle className="h-5 w-5 fill-[#dbe6fb] text-[#dbe6fb]" />
            <span className="text-xl font-semibold tracking-tight text-white">Artisan&apos;s Echo</span>
          </motion.div>

          <motion.div className="space-y-3" variants={childVariants}>
            <h1 className="text-4xl font-medium tracking-tight whitespace-nowrap text-white">
              {mode === 'signup' ? 'Join the Marketplace' : 'Return to the Marketplace'}
            </h1>
            <p className="px-4 text-sm leading-relaxed text-white/60">{heroCopy}</p>
          </motion.div>

          <motion.div className="space-y-3" variants={childVariants}>
            <StepItem active={activeStep === 1} number={1} text="Create your identity" />
            <StepItem active={activeStep === 2} number={2} text="Choose your collector access" />
            <StepItem active={activeStep === 3} number={3} text="Enter the curated market" />
          </motion.div>
        </motion.div>
      </section>

      <section className="flex flex-1 flex-col items-center justify-center overflow-y-auto px-4 py-12 sm:px-12 lg:overflow-hidden lg:px-16 lg:py-6 xl:px-24">
        <motion.div
          animate={{ opacity: 1 }}
          className="w-full max-w-xl space-y-8 sm:space-y-10 lg:space-y-6"
          initial={{ opacity: 0 }}
          transition={{
            duration: reduceMotion ? 0.01 : 0.8,
            ease: easeOut,
          }}
        >
          <header className="space-y-3">
            <h2 className="text-3xl font-medium tracking-tight text-[#18366f]">{title}</h2>
            <p className="text-sm text-[#556b97]">{subtitle}</p>
          </header>

          <div className="grid grid-cols-2 gap-4">
            <SocialButton
              icon={ChromeBrandIcon}
              label="Google"
              onClick={() => launchSocialAuth('google', { mode, role: socialRole, redirectTo })}
            />
            <SocialButton
              icon={GithubBrandIcon}
              label="GitHub"
              onClick={() => launchSocialAuth('github', { mode, role: socialRole, redirectTo })}
            />
          </div>

          <div className="relative">
            <div className="border-t border-[#c8d7ef]" />
            <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 bg-[#d8e6fb] px-4 text-xs font-medium uppercase tracking-[0.32em] text-[#7a90ba]">
              Or
            </span>
          </div>

          {children}

          {message ? (
            <p
              aria-live="polite"
              className={`rounded-xl border px-4 py-3 text-sm ${
                messageTone === 'error'
                  ? 'border-red-300 bg-red-50 text-red-700'
                  : 'border-emerald-300 bg-emerald-50 text-emerald-700'
              }`}
            >
              {message}
            </p>
          ) : null}

          <div>{footer}</div>
        </motion.div>
      </section>
    </main>
  )
}

function StepItem({
  number,
  text,
  active = false,
}: {
  number: number
  text: string
  active?: boolean
}) {
  return (
    <div
      className={`flex items-center gap-4 rounded-2xl px-4 py-4 transition ${
        active
          ? 'border border-[#c8d7ef] bg-[#eef4ff] text-[#18366f]'
          : 'border-none bg-[rgba(199,216,244,0.2)] text-white'
      }`}
    >
      <span
        className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold ${
          active ? 'bg-[#18366f] text-white' : 'bg-white/10 text-white/55'
        }`}
      >
        {number}
      </span>
      <span className="text-sm font-medium">{text}</span>
    </div>
  )
}

function SocialButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: ComponentType<{ className?: string }>
  label: string
  onClick: () => void
}) {
  return (
    <button
      className="flex h-14 items-center justify-center gap-3 rounded-xl border border-[#c8d7ef] bg-[#f7faff] text-sm font-medium text-[#18366f] transition hover:bg-[#edf3ff]"
      onClick={onClick}
      type="button"
    >
      <Icon className="h-5 w-5" />
      <span>{label}</span>
    </button>
  )
}

function ChromeBrandIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" fill="currentColor" opacity="0.12" r="9" />
      <circle cx="12" cy="12" r="3.25" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 8.5h8" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
      <path d="m15.8 8.7-3.4 5.9" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
      <path d="m8.2 8.7 3.4 5.9" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    </svg>
  )
}

function GithubBrandIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M9.25 18.4c-3.2.95-3.2-1.55-4.5-1.95m9 3.9v-2.45c0-.7.08-1.08-.34-1.52 1.43-.16 2.94-.7 2.94-3.18a2.5 2.5 0 0 0-.67-1.74 2.33 2.33 0 0 0-.04-1.72s-.55-.17-1.8.66a6.3 6.3 0 0 0-3.28 0c-1.25-.83-1.8-.66-1.8-.66a2.33 2.33 0 0 0-.04 1.72 2.5 2.5 0 0 0-.67 1.74c0 2.46 1.5 3.02 2.93 3.18-.42.44-.42.88-.42 1.62v2.35"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  )
}

function InputGroup({
  label,
  placeholder,
  type,
  value,
  onChange,
  name,
  autoComplete,
  required,
  minLength,
  helperText,
  trailing,
  inputClassName = '',
}: {
  label: string
  placeholder: string
  type: string
  value: string
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
  name?: string
  autoComplete?: string
  required?: boolean
  minLength?: number
  helperText?: string
  trailing?: ReactNode
  inputClassName?: string
}) {
  return (
    <label className="block space-y-3">
      <span className="text-sm font-medium text-[#18366f]">{label}</span>
      <div className="relative">
        <input
          autoComplete={autoComplete}
          className={`h-11 w-full rounded-xl border border-[#c8d7ef] bg-[#f7faff] px-4 text-[#18366f] placeholder:text-[#92a8cf] focus:outline-none focus:ring-2 focus:ring-[#7da3ea]/40 ${inputClassName}`}
          minLength={minLength}
          name={name}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          type={type}
          value={value}
        />
        {trailing ? <div className="absolute inset-y-0 right-4 flex items-center text-[#7f756c]">{trailing}</div> : null}
      </div>
      {helperText ? <p className="text-xs text-[#7a90ba]">{helperText}</p> : null}
    </label>
  )
}
