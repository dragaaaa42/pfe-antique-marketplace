import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowUpRight, Check, ChevronLeft, ChevronRight, Heart, MessageCircle, ShoppingBag, ShoppingCart, Star, X } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import './ArtifactDetailPage.css'
import {
  addCartItem,
  addWishlistItem,
  createConversation,
  getArtifact,
  getArtifacts,
  getCart,
  getConversations,
  getWishlist,
  removeWishlistItem,
  approveAdminArtifact,
  rejectAdminArtifact,
  directCheckout,
} from './api'
import { useAuth } from './auth'
import { getDashboardPathForRole, getWorkspaceLabelForRole } from './roleRouting'
import { MarketplaceImage } from './components/MarketplaceImage'
import { resolveMarketplaceImage } from './marketplaceImages'
import type { Artifact } from './types'

/* ── Helpers ───────────────────────────────────────────────────── */

function formatPrice(value: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number(value))
}

/** Fade-up wrapper for scroll reveal */
function FadeIn({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  const reduced = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial={reduced ? undefined : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.55, delay, ease: [0.4, 0, 0.2, 1] }}
    >
      {children}
    </motion.div>
  )
}

/* ── Static Data ───────────────────────────────────────────────── */

const curated_reviews = [
  {
    name: 'Isabelle Moreau',
    initials: 'IM',
    date: 'Dec 2025',
    rating: 5,
    text: 'Extraordinary provenance and impeccable condition. The seller provided detailed documentation and the white-glove delivery was flawless. A remarkable addition to my collection.',
    verified: true,
    featured: true,
  },
  {
    name: 'James Whitfield',
    initials: 'JW',
    date: 'Nov 2025',
    rating: 5,
    text: 'The craftsmanship exceeded my expectations. Every detail speaks to centuries of artisanal tradition. Communication with the seller was prompt and professional.',
    verified: true,
  },
  {
    name: 'Yuki Tanaka',
    initials: 'YT',
    date: 'Oct 2025',
    rating: 4,
    text: 'Beautiful piece that photographs even better in person. The marketplace verification process gave me full confidence in the authenticity.',
    verified: true,
  },
  {
    name: 'Amara Osei',
    initials: 'AO',
    date: 'Sep 2025',
    rating: 5,
    text: 'This is my third acquisition through the platform and the curation keeps getting better. A trustworthy marketplace for serious collectors.',
    verified: true,
  },
]

/* ═══════════════════════════════════════════════════════════════════
   ArtifactDetailPage — Premium Redesign
   ═══════════════════════════════════════════════════════════════════ */

export function ArtifactDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  /* ── State ─────────────────────────────────────────────────── */
  const [artifact, setArtifact] = useState<Artifact | undefined>(undefined)
  const [catalogArtifacts, setCatalogArtifacts] = useState<Artifact[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [wishlistItemId, setWishlistItemId] = useState<number | null>(null)
  const [cartQuantity, setCartQuantity] = useState(0)
  const [actionStatus, setActionStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [actionMessage, setActionMessage] = useState('')
  const [reviewIndex, setReviewIndex] = useState(0)
  const [reviewDir, setReviewDir] = useState(1)

  /* ── Checkout State ────────────────────────────────────────── */
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [checkoutForm, setCheckoutForm] = useState({
    fullName: '',
    phone: '',
    city: '',
    address: '',
    notes: '',
    quantity: 1,
  })
  const [checkoutMessage, setCheckoutMessage] = useState('')

  /* ── Data Loading ──────────────────────────────────────────── */
  useEffect(() => {
    if (!id) return
    setLoading(true)
    getArtifact(id)
      .then((art) => {
        setArtifact(art)
        setLoading(false)
      })
      .catch(() => {
        setArtifact(undefined)
        setLoading(false)
      })

    getArtifacts()
      .then((items) => {
        setCatalogArtifacts(items)
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

  /* ── Scroll to top on artifact change ──────────────────────── */
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [id])

  /* ── Action Handlers ───────────────────────────────────────── */
  function requireBuyer(redirectTo?: string) {
    if (!artifact) return false
    if (!user) {
      navigate('/login', { state: { redirectTo: redirectTo ?? `/artifacts/${artifact.id}` } })
      return false
    }
    if (user.role !== 'buyer') {
      setActionStatus('error')
      setActionMessage('These actions are only for collector accounts.')
      return false
    }
    return true
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
    } catch (error: any) {
      setActionStatus('error')
      let msg = 'Wishlist update failed.'
      if (error?.response?.data) {
        msg = JSON.stringify(error.response.data)
      }
      setActionMessage(msg)
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
    } catch (error: any) {
      setActionStatus('error')
      let msg = 'Cart update failed.'
      if (error?.response?.data) {
        msg = JSON.stringify(error.response.data)
      }
      setActionMessage(msg)
    }
  }


  async function openSellerThread() {
    if (!artifact) return
    if (!requireBuyer(`/artifacts/${artifact.id}`)) return

    setActionStatus('loading')
    setActionMessage('Opening conversation...')
    try {
      const existing = await getConversations({ artifact: artifact.id })
      if (existing && existing.length > 0) {
        navigate(`/collector/messages/${existing[0].id}`)
        return
      }

      const newConv = await createConversation(
        artifact.id,
        `Hello, I am interested in acquiring this object.`
      )
      navigate(`/collector/messages/${newConv.id}`)
    } catch (error: any) {
      setActionStatus('error')
      let msg = 'Failed to open seller thread.'
      if (error?.response?.data) {
        msg = JSON.stringify(error.response.data)
      }
      setActionMessage(msg)
    }
  }

  function openCartPage() {
    if (!requireBuyer('/cart')) return
    navigate('/cart')
  }

  /* ── Admin Action Handlers ────────────────────────────────── */
  async function handleAdminApprove() {
    if (!artifact) return
    setActionStatus('loading')
    setActionMessage('')
    try {
      const updated = await approveAdminArtifact(artifact.id)
      setArtifact(updated)
      setActionStatus('success')
      setActionMessage('Artifact approved successfully.')
    } catch {
      setActionStatus('error')
      setActionMessage('Failed to approve artifact.')
    }
  }

  async function handleAdminReject() {
    if (!artifact) return
    const notes = prompt('Enter rejection notes (optional):')
    if (notes === null) return
    setActionStatus('loading')
    setActionMessage('')
    try {
      const updated = await rejectAdminArtifact(artifact.id, notes)
      setArtifact(updated)
      setActionStatus('success')
      setActionMessage('Artifact rejected successfully.')
    } catch {
      setActionStatus('error')
      setActionMessage('Failed to reject artifact.')
    }
  }





  /* ── Loading State ─────────────────────────────────────────── */
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0a0a0a', color: '#fff', fontFamily: 'sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ border: '4px solid rgba(255,255,255,0.1)', width: '36px', height: '36px', borderRadius: '50%', borderLeftColor: '#fff', animation: 'spin 1s linear infinite', margin: '0 auto 15px' }} />
          <div>Loading details...</div>
          <style>{`
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          `}</style>
        </div>
      </div>
    )
  }

  /* ── Empty State ───────────────────────────────────────────── */
  if (!artifact) {
    return (
      <main className="ad-empty">
        <Link to="/">Back to catalog</Link>
        <h1>Artifact not found</h1>
      </main>
    )
  }

  /* ── Derived Data ──────────────────────────────────────────── */
  const relatedArtifacts = catalogArtifacts
    .filter((item) => item.id !== artifact.id)
    .filter((item) => item.category_name === artifact.category_name)
    .concat(catalogArtifacts.filter((item) => item.id !== artifact.id))
    .filter((item, index, items) => items.findIndex((c) => c.id === item.id) === index)
    .slice(0, 3)

  const mainImage = resolveMarketplaceImage(artifact)
  const extraImages: string[] = (artifact.gallery_images ?? [])
    .slice(0, 3)
    .map((img) => img.image)
  const galleryImages = [mainImage, ...extraImages].filter(Boolean).slice(0, 4)
  const selectedImage = galleryImages[selectedImageIndex] ?? galleryImages[0]
  const sellerName = artifact.seller_email ? artifact.seller_email.split('@')[0] : 'Verified seller'
  const dashboardPath = user ? getDashboardPathForRole(user.role) : '/login'
  const dashboardLabel = user ? getWorkspaceLabelForRole(user.role) : 'Sign in'

  /* ── Reviews Carousel Logic ────────────────────────────────── */
  const visibleReviews = [
    curated_reviews[reviewIndex % curated_reviews.length],
    curated_reviews[(reviewIndex + 1) % curated_reviews.length],
    curated_reviews[(reviewIndex + 2) % curated_reviews.length],
  ]

  const nextReview = () => {
    setReviewDir(1)
    setReviewIndex((i) => (i + 1) % curated_reviews.length)
  }

  const prevReview = () => {
    setReviewDir(-1)
    setReviewIndex((i) => (i - 1 + curated_reviews.length) % curated_reviews.length)
  }
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

  /* ── Render ────────────────────────────────────────────────── */
  return (
    <main className="ad-page">
      {/* ═══ Hero Section ═══ */}
      <section className="ad-hero">
        <div className="ad-container">
          {/* Breadcrumb */}
          <FadeIn>
            <nav className="ad-breadcrumb" aria-label="Product navigation">
              <Link to="/">Marketplace</Link>
              <span className="ad-breadcrumb-sep" />
              <span>{categoryLabel}</span>
              <span className="ad-breadcrumb-sep" />
              <span>{lotNumber}</span>
              <div className="ad-breadcrumb-badges">
                <span className="ad-badge ad-badge--accent">{artifact.status}</span>
                <span className="ad-badge ad-badge--green">{artifact.condition}</span>
              </div>
            </nav>
          </FadeIn>

          {/* Hero Grid */}
          <div className="ad-hero-grid">
            {/* ─── Gallery Column ─── */}
            <FadeIn className="ad-gallery">
              {/* Main Image */}
              <motion.div
                className="ad-gallery-main"
                layoutId={`artifact-image-${artifact.id}`}
              >
                <div className="ad-gallery-overlay-top">
                  <span className="ad-gallery-overlay-label">Curated Object</span>
                  <span className="ad-gallery-overlay-label ad-gallery-overlay-label--gold">
                    {lotNumber}
                  </span>
                </div>
                <motion.div
                  key={selectedImageIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  <MarketplaceImage
                    alt={artifact.title}
                    className="ad-gallery-main-img"
                    src={selectedImage}
                  />
                </motion.div>
                <div className="ad-gallery-caption">
                  <span className="ad-gallery-caption-title">{artifact.title}</span>
                  <span className="ad-gallery-counter">
                    {selectedImageIndex + 1} / {galleryImages.length}
                  </span>
                </div>
              </motion.div>

              {/* Thumbnail Strip */}
              <div className="ad-thumbnails">
                {galleryImages.map((image, index) => (
                  <motion.button
                    aria-label={`View product image ${index + 1}`}
                    className={`ad-thumbnail ${index === selectedImageIndex ? 'is-active' : ''}`}
                    key={`thumb-${image}-${index}`}
                    onClick={() => setSelectedImageIndex(index)}
                    type="button"
                    whileHover={{ y: -3 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ duration: 0.2 }}
                  >
                    <MarketplaceImage alt="" className="ad-thumbnail-img" src={image} />
                  </motion.button>
                ))}
              </div>
            </FadeIn>

            {/* ─── Info Panel ─── */}
            <FadeIn delay={0.15} className="ad-info-panel">
              <div className="ad-info-card">
                {/* Header */}
                <div className="ad-info-header">
                  <p className="ad-info-eyebrow">Marketplace Listing</p>
                  <h1 className="ad-info-title">{artifact.title}</h1>
                  <div className="ad-info-tags">
                    <span className="ad-badge">{categoryLabel}</span>
                    <span className="ad-badge ad-badge--accent">Verified Seller</span>
                  </div>
                </div>

                {/* Price */}
                <div className="ad-price-block">
                  <div>
                    <p className="ad-price-label">Collector Price</p>
                    <p className="ad-price-value">{formatPrice(artifact.price)}</p>
                  </div>
                  <span className="ad-price-note">Acquisition-ready</span>
                </div>

                {/* Description */}
                <div className="ad-description">
                  <p>{artifact.description}</p>
                </div>

                {/* Seller Card */}
                <div className="flex flex-col gap-3 p-4 rounded-xl bg-blue-50/50 border border-blue-100/80">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                        {sellerName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="m-0 text-base font-semibold text-slate-900">{sellerName}</h3>
                          <span className="flex items-center justify-center w-4 h-4 rounded-full bg-blue-500 text-white shadow-sm" title="Verified Seller">
                            <Check size={10} strokeWidth={3} />
                          </span>
                        </div>
                        <p className="m-0 text-xs text-slate-500 font-medium">Verified Gallery</p>
                      </div>
                    </div>
                    {user?.role !== 'admin' && (
                      <button 
                        onClick={openSellerThread}
                        disabled={actionStatus === 'loading' || artifact.status !== 'approved'}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors shadow-sm ${artifact.status !== 'approved' ? 'border-slate-200 text-slate-400 cursor-not-allowed bg-slate-50 opacity-70' : 'border-blue-200 text-blue-700 bg-white hover:bg-blue-50'}`}
                      >
                        Message
                      </button>
                    )}
                  </div>
                  <p className="m-0 text-sm text-slate-600 leading-relaxed">
                    Verified seller. All objects undergo condition and provenance review prior to marketplace listing.
                  </p>
                </div>

                {/* Action Toast */}
                {actionMessage ? (
                  <motion.div
                    className={`ad-toast ${actionStatus === 'error' ? 'ad-toast--error' : 'ad-toast--success'}`}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {actionMessage}
                  </motion.div>
                ) : null}

                {/* CTA Buttons / Admin Moderation Panel */}
                {user?.role === 'admin' ? (
                  <div className="ad-cta-group border border-[var(--line)] p-4 rounded-xl bg-[var(--surface-soft)]">
                    <div className="flex items-center justify-between mb-3 border-b border-[var(--line)] pb-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-[#4658c6]">Admin Moderation</span>
                      <span className={`info-chip text-[0.65rem] font-bold px-2 py-0.5 rounded-full ${artifact.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          artifact.status === 'rejected' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                            'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                        Status: {artifact.status}
                      </span>
                    </div>

                    <div className="flex flex-col gap-2">
                      <div className="grid grid-cols-2 gap-2">
                        <motion.button
                          className="solid-button !text-xs !py-2 !px-3 bg-emerald-600 hover:bg-emerald-700 text-white border-transparent"
                          disabled={actionStatus === 'loading' || artifact.status === 'approved'}
                          onClick={() => void handleAdminApprove()}
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          Approve
                        </motion.button>
                        <motion.button
                          className="solid-button !text-xs !py-2 !px-3 bg-rose-600 hover:bg-rose-700 text-white border-transparent"
                          disabled={actionStatus === 'loading' || artifact.status === 'rejected'}
                          onClick={() => void handleAdminReject()}
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          Reject
                        </motion.button>
                      </div>

                      <motion.button
                        className="ghost-button !text-xs !py-2 !px-3 w-full"
                        onClick={() => navigate(`/admin/artifacts/${artifact.id}/edit`)}
                        type="button"
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        Edit in Admin
                      </motion.button>

                      <div className="border-t border-[var(--line)] pt-2 mt-1 flex justify-between items-center text-[11px] text-[var(--muted)]">
                        <Link to="/admin/artifacts" className="hover:underline text-[#4658c6]">
                          ← Back to moderation
                        </Link>
                        <Link to={`/artifacts/${artifact.id}`} className="hover:underline text-[#4658c6]" onClick={() => window.location.reload()}>
                          View public page
                        </Link>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="ad-cta-group">
                    <motion.button
                      className="ad-btn ad-btn--primary ad-btn--full"
                      disabled={actionStatus === 'loading'}
                      onClick={() => void handleCartAdd()}
                      type="button"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <ShoppingBag size={18} />
                      {cartQuantity > 0 ? `Add one more (${cartQuantity})` : 'Add to Cart'}
                    </motion.button>

                    <motion.button
                      className="ad-btn ad-btn--checkout ad-btn--full"
                      onClick={() => {
                        setCheckoutForm({
                          fullName: '',
                          phone: '',
                          city: '',
                          address: '',
                          notes: '',
                          quantity: 1,
                        })
                        setCheckoutMessage('')
                        setIsCheckoutOpen(true)
                      }}
                      type="button"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Buy Now / Checkout
                    </motion.button>

                    <div className="ad-cta-row">
                      <motion.button
                        className={`ad-btn ad-btn--secondary ${wishlistItemId ? 'is-active' : ''}`}
                        disabled={actionStatus === 'loading'}
                        onClick={() => void handleWishlistToggle()}
                        type="button"
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Heart size={16} fill={wishlistItemId ? 'currentColor' : 'none'} />
                        {wishlistItemId ? 'Saved' : 'Save'}
                      </motion.button>

                      <motion.button
                        className="ad-btn ad-btn--secondary"
                        onClick={openCartPage}
                        type="button"
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <ShoppingCart size={16} />
                        View Cart
                      </motion.button>
                    </div>

                    <motion.button
                      className="ad-btn ad-btn--accent ad-btn--full"
                      onClick={openSellerThread}
                      disabled={actionStatus === 'loading' || artifact.status !== 'approved'}
                      type="button"
                      whileHover={{ scale: artifact.status === 'approved' ? 1.01 : 1 }}
                      whileTap={{ scale: artifact.status === 'approved' ? 0.98 : 1 }}
                      style={{ opacity: artifact.status !== 'approved' ? 0.6 : 1, cursor: artifact.status !== 'approved' ? 'not-allowed' : 'pointer' }}
                    >
                      <MessageCircle size={16} />
                      {artifact.status !== 'approved' ? 'Messaging Unavailable (Not Approved)' : 'Message Seller'}
                    </motion.button>
                  </div>
                )}

                {/* Metadata Grid */}
                <dl className="ad-meta-grid">
                  {dossierHighlights.map(([label, value]) => (
                    <div className="ad-meta-cell" key={label}>
                      <dt className="ad-meta-label">{label}</dt>
                      <dd className="ad-meta-value">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ═══ Detail Cards ═══ */}
      <section className="ad-details-section">
        <div className="ad-container">
          <FadeIn>
            <div className="ad-section-header">
              <p className="ad-section-eyebrow">Object Dossier</p>
              <h2 className="ad-section-title">Complete Artifact Documentation</h2>
            </div>
          </FadeIn>

          <div className="ad-details-grid">
            {detailCards.map(([eyebrow, title, text], index) => (
              <FadeIn key={title} delay={index * 0.08}>
                <motion.article
                  className="ad-detail-card"
                  whileHover={{ y: -6 }}
                  transition={{ duration: 0.25 }}
                >
                  <p className="ad-detail-card-eyebrow">{eyebrow}</p>
                  <h3 className="ad-detail-card-title">{title}</h3>
                  <p className="ad-detail-card-text">{text}</p>
                </motion.article>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Reviews / Testimonials ═══ */}
      <section className="ad-reviews-section">
        <div className="ad-container">
          <FadeIn>
            <div className="ad-reviews-header">
              <div>
                <p className="ad-section-eyebrow">Collector Reviews</p>
                <h2 className="ad-section-title">What Collectors Say</h2>
              </div>
              <div className="ad-reviews-controls-wrapper">
                <div className="ad-reviews-stats">
                  <span className="ad-reviews-score">4.9</span>
                  <div>
                    <div className="ad-reviews-stars">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} size={18} fill="currentColor" strokeWidth={0} />
                      ))}
                    </div>
                    <p className="ad-reviews-count">Based on 47 verified acquisitions</p>
                  </div>
                </div>
                <div className="ad-reviews-nav">
                  <button onClick={prevReview} className="ad-nav-btn" aria-label="Previous reviews">
                    <ChevronLeft size={20} />
                  </button>
                  <button onClick={nextReview} className="ad-nav-btn" aria-label="Next reviews">
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            </div>
          </FadeIn>

          <div className="ad-reviews-slider-viewport">
            <AnimatePresence mode="popLayout" initial={false} custom={reviewDir}>
              <motion.div
                key={reviewIndex}
                custom={reviewDir}
                variants={{
                  enter: (dir: number) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
                  center: { x: 0, opacity: 1 },
                  exit: (dir: number) => ({ x: dir > 0 ? '-100%' : '100%', opacity: 0 }),
                }}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: 'spring', bounce: 0, duration: 0.6 }}
                className="ad-reviews-grid"
              >
                {visibleReviews.map((review) => (
                  <motion.div
                    key={review.name}
                    className="ad-review-card"
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.25 }}
                  >
                    <div className="ad-review-top">
                      <div className="ad-review-avatar">{review.initials}</div>
                      <div className="ad-review-author">
                        <p className="ad-review-name">{review.name}</p>
                        <p className="ad-review-date">{review.date}</p>
                      </div>
                    </div>
                    <div className="ad-review-stars">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          fill={i < review.rating ? 'currentColor' : 'none'}
                          strokeWidth={i < review.rating ? 0 : 1.5}
                          opacity={i < review.rating ? 1 : 0.25}
                        />
                      ))}
                    </div>
                    <p className="ad-review-text">{review.text}</p>
                    {review.verified && (
                      <span className="ad-review-verified">
                        <Check size={14} /> Verified Acquisition
                      </span>
                    )}
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* ═══ Related Products ═══ */}
      <section className="ad-related-section">
        <div className="ad-container">
          <div className="ad-related-inner">
            <FadeIn>
              <div className="ad-related-header">
                <div>
                  <p className="ad-section-eyebrow">Collection</p>
                  <h2 className="ad-section-title">Continue Through the Atlas</h2>
                </div>
                <Link className="ad-related-link" to="/">
                  Return to catalogue <ArrowUpRight size={16} />
                </Link>
              </div>
            </FadeIn>

            <div className="ad-related-grid">
              {relatedArtifacts.map((item, index) => (
                <FadeIn key={`related-${item.id}`} delay={index * 0.1}>
                  <RelatedProductCard artifact={item} />
                </FadeIn>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Secure Checkout Modal ═══ */}
      <AnimatePresence>
        {isCheckoutOpen && (
          <motion.div
            className="checkout-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCheckoutOpen(false)}
          >
            <motion.div
              className="checkout-modal-content"
              initial={{ opacity: 0, y: 30, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.98 }}
              transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="checkout-modal-header">
                <h2>Secure Checkout</h2>
                <button
                  className="checkout-modal-close"
                  onClick={() => setIsCheckoutOpen(false)}
                  aria-label="Close checkout"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="checkout-modal-body">
                <div className="checkout-product-summary">
                  <MarketplaceImage
                    alt={artifact.title}
                    className="checkout-product-img"
                    src={selectedImage}
                  />
                  <div className="checkout-product-info">
                    <h3 className="checkout-product-title">{artifact.title}</h3>
                    <p className="checkout-product-price">
                      {formatPrice(artifact.price)}
                    </p>
                  </div>
                </div>

                <form
                  className="checkout-form"
                  onSubmit={async (e) => {
                    e.preventDefault()
                    if (!requireBuyer()) return
                    setCheckoutMessage('Processing your order...')
                    try {
                      await directCheckout({
                        product_id: artifact.id,
                        quantity: checkoutForm.quantity,
                        payment_method: 'cod',
                        shipping_name: checkoutForm.fullName,
                        shipping_phone: checkoutForm.phone,
                        shipping_city: checkoutForm.city,
                        shipping_address: checkoutForm.address,
                        shipping_notes: checkoutForm.notes,
                      })
                      setCheckoutMessage('Order confirmed! Waiting for seller confirmation.')
                    } catch (error: any) {
                      let errDetail = 'Checkout failed. Please try again.'
                      if (error?.response?.data) {
                        errDetail = JSON.stringify(error.response.data)
                      }
                      setCheckoutMessage(errDetail)
                    }
                  }}
                >
                  <div className="checkout-input-group">
                    <label htmlFor="checkout-name">Full Name</label>
                    <input
                      id="checkout-name"
                      className="checkout-input"
                      type="text"
                      required
                      placeholder="Jane Doe"
                      value={checkoutForm.fullName}
                      onChange={(e) =>
                        setCheckoutForm({ ...checkoutForm, fullName: e.target.value })
                      }
                    />
                  </div>

                  <div className="checkout-input-group">
                    <label htmlFor="checkout-phone">Phone Number</label>
                    <input
                      id="checkout-phone"
                      className="checkout-input"
                      type="tel"
                      required
                      placeholder="+212 600-000000"
                      value={checkoutForm.phone}
                      onChange={(e) =>
                        setCheckoutForm({ ...checkoutForm, phone: e.target.value })
                      }
                    />
                  </div>

                  <div className="checkout-form-row">
                    <div className="checkout-input-group">
                      <label htmlFor="checkout-city">City</label>
                      <input
                        id="checkout-city"
                        className="checkout-input"
                        type="text"
                        required
                        placeholder="Rabat"
                        value={checkoutForm.city}
                        onChange={(e) =>
                          setCheckoutForm({ ...checkoutForm, city: e.target.value })
                        }
                      />
                    </div>

                    <div className="checkout-input-group">
                      <label htmlFor="checkout-qty">Quantity</label>
                      <div className="checkout-quantity-selector">
                        <button
                          type="button"
                          className="checkout-qty-btn"
                          onClick={() =>
                            setCheckoutForm({
                              ...checkoutForm,
                              quantity: Math.max(1, checkoutForm.quantity - 1),
                            })
                          }
                        >
                          -
                        </button>
                        <span className="checkout-qty-value">
                          {checkoutForm.quantity}
                        </span>
                        <button
                          type="button"
                          className="checkout-qty-btn"
                          onClick={() =>
                            setCheckoutForm({
                              ...checkoutForm,
                              quantity: checkoutForm.quantity + 1,
                            })
                          }
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="checkout-input-group">
                    <label htmlFor="checkout-address">Full Address</label>
                    <input
                      id="checkout-address"
                      className="checkout-input"
                      type="text"
                      required
                      placeholder="123 Avenue Mohammed V"
                      value={checkoutForm.address}
                      onChange={(e) =>
                        setCheckoutForm({ ...checkoutForm, address: e.target.value })
                      }
                    />
                  </div>

                  <div className="checkout-input-group">
                    <label htmlFor="checkout-notes">Delivery Notes</label>
                    <textarea
                      id="checkout-notes"
                      className="checkout-textarea"
                      placeholder="Special instructions for white-glove packaging or delivery schedule..."
                      value={checkoutForm.notes}
                      onChange={(e) =>
                        setCheckoutForm({ ...checkoutForm, notes: e.target.value })
                      }
                    />
                  </div>

                  <div className="checkout-payment-method">
                    <div className="checkout-payment-label">
                      <span>Payment Method</span>
                    </div>
                    <span className="checkout-payment-badge">Cash on Delivery</span>
                  </div>

                  {checkoutMessage && (
                    <div className="checkout-message-box">
                      <p>{checkoutMessage}</p>
                      {checkoutMessage.includes('Order confirmed') && (
                        <div className="checkout-success-actions" style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                          <Link to="/orders" className="checkout-submit-btn" style={{ textAlign: 'center', textDecoration: 'none' }}>
                            View My Orders
                          </Link>
                          <button
                            type="button"
                            className="ad-btn ad-btn--secondary ad-btn--full"
                            onClick={() => setIsCheckoutOpen(false)}
                          >
                            Continue Shopping
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {!checkoutMessage.includes('Order confirmed') && (
                    <button type="submit" className="checkout-submit-btn" disabled={checkoutMessage === 'Processing your order...'}>
                      {checkoutMessage === 'Processing your order...' ? 'Processing...' : 'Confirm Purchase'}
                    </button>
                  )}
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ Site Footer ═══ */}
      <footer className="atlas-site-footer" aria-label="Artisan's Echo footer">
        <div className="atlas-site-footer-inner">
          <div className="atlas-site-footer-grid">
            <div className="footer-brand-column">
              <Link className="footer-brand-logo" to="/" aria-label="Artisan's Echo home">
                <img src="/favicon.svg" alt="" width="36" height="36" />
                <span>artisan&apos;s echo</span>
              </Link>
              <p className="footer-brand-desc">
                A refined registry of rare objects, fine antiques, and historical artifacts. Curator-vetted and safely exchanged under premium verification.
              </p>
            </div>

            <div className="footer-nav-column">
              <h4>Catalogue</h4>
              <ul>
                <li><a href="/#catalog">Browse catalogue</a></li>
                <li><a href="/#featured-pieces">Featured pieces</a></li>
                <li><a href="/#departments">Collections</a></li>
              </ul>
            </div>

            <div className="footer-nav-column">
              <h4>Marketplace</h4>
              <ul>
                <li><Link to="/__legacy/catalog">Legacy Archive</Link></li>
                <li><a href="/#curators">Curators Circle</a></li>
                <li><a href="/#journal">The Journal</a></li>
              </ul>
            </div>

            <div className="footer-nav-column">
              <h4>Account</h4>
              <ul>
                <li><Link to="/login">Sign in</Link></li>
                <li><Link to="/signup">Create account</Link></li>
                <li><Link to={dashboardPath}>{dashboardLabel || 'Admin workspace'}</Link></li>
              </ul>
            </div>

            <div className="footer-nav-column">
              <h4>Support</h4>
              <ul>
                <li><a href="/#help">Help center</a></li>
                <li><a href="/#terms">Terms of service</a></li>
                <li><a href="/#privacy">Privacy policy</a></li>
              </ul>
            </div>
          </div>

          <div className="atlas-site-footer-bottom">
            <p className="footer-copyright">&copy; {new Date().getFullYear()} Artisan&apos;s Echo. All rights reserved.</p>
            <p className="footer-tagline">Preserving history, staging authenticity.</p>
          </div>
        </div>
      </footer>
    </main>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   RelatedProductCard — Inline related product card
   ═══════════════════════════════════════════════════════════════════ */

function RelatedProductCard({ artifact }: { artifact: Artifact }) {
  return (
    <motion.div whileHover={{ y: -6 }} transition={{ duration: 0.3 }}>
      <Link className="ad-product-card" to={`/artifacts/${artifact.id}`}>
        <div className="ad-product-card-image">
          <MarketplaceImage alt={artifact.title} src={resolveMarketplaceImage(artifact)} />
          <span className="ad-product-card-category">
            {artifact.category_name ?? 'Uncategorized'}
          </span>
          <span className="ad-product-card-price-tag">{formatPrice(artifact.price)}</span>
        </div>
        <div className="ad-product-card-body">
          <div className="ad-product-card-topline">
            <span>Verified seller</span>
            <span className="ad-product-card-condition">{artifact.condition}</span>
          </div>
          <h3>{artifact.title}</h3>
          <p className="ad-product-card-excerpt">{artifact.description}</p>
          <div className="ad-product-card-footer">
            <span className="ad-product-card-cta">
              View dossier <ArrowUpRight size={14} />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
