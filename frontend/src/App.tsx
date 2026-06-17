import { type FormEvent, useEffect, useMemo, useState } from 'react'
import { BrowserRouter, Link, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom'
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
import { CartPage, OrderDetailPage, OrdersPage, WishlistPage } from './buyer'
import { Artifact3DViewer } from './components/Artifact3DViewer'
import { SellerDashboardPage, SellerGalleriesPage, SellerProductsPage } from './seller'
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

function ArtifactCard({ artifact }: { artifact: Artifact }) {
  return (
    <article className="artifact-card">
      <Link className="artifact-image" to={`/artifacts/${artifact.id}`}>
        <img alt={artifact.title} src={artifact.image || fallbackArtifactImage} />
      </Link>
      <div className="artifact-body">
        <div className="artifact-meta">
          <span>{artifact.category_name ?? 'Uncategorized'}</span>
          <strong>{formatPrice(artifact.price)}</strong>
        </div>
        <h3>{artifact.title}</h3>
        <p>{artifact.description}</p>
        <div className="artifact-foot">
          <span className={`status-pill status-${artifact.status}`}>{artifact.status}</span>
          <Link className="text-link" to={`/artifacts/${artifact.id}`}>
            View
          </Link>
        </div>
      </div>
    </article>
  )
}

function CatalogPage() {
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

function ArtifactDetailPage() {
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

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<CatalogPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/orders/:id" element={<OrderDetailPage />} />
          <Route path="/seller" element={<SellerDashboardPage />} />
          <Route path="/seller/products" element={<SellerProductsPage />} />
          <Route path="/seller/galleries" element={<SellerGalleriesPage />} />
          <Route path="/artifacts/:id" element={<ArtifactDetailPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
