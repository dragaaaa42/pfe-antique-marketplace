import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import confetti from 'canvas-confetti'
import {
  ArrowLeft,
  ArrowRight,
  Home,
  CheckCircle2,
  Layers,
  Database,
  Users,
  MessageSquare,
  Layout,
  Award,
  Sparkles,
  Code,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Check,
  Monitor,
  HelpCircle
} from 'lucide-react'

// Import project diagrams and screenshots
import architectureImg from './assets/docs/architecture.png'
import rbacImg from './assets/docs/rbac.png'
import dbErImg from './assets/docs/db_er.png'
import homeImg from './assets/docs/home.png'
import adminDashboardImg from './assets/docs/admin_dashboard.png'
import sellerDashboardImg from './assets/docs/seller_dashboard.png'
import catalogueImg from './assets/docs/catalogue.png'
import messagesImg from './assets/docs/messages.png'

export function SoutenanceDeck() {
  const navigate = useNavigate()
  const [currentSlide, setCurrentSlide] = useState(0)
  const [direction, setDirection] = useState(0)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Track mouse coordinates for background parallax effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 30,
        y: (e.clientY / window.innerHeight - 0.5) * 30,
      })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const SLIDES = [
    {
      id: 0,
      title: "Introduction & Présentation",
      type: "intro",
      content: {
        title: "Artisan's Echo",
        subtitle: "Marketplace Premium d'Antiquités et d'Objets de Collection",
        tagline: "Projet de Fin d'Études — Diplôme en Développement Informatique",
        author: "AIT OUAHMAN OUISSAL",
        supervisor: "M. Ait Ben Hamou Khalid",
        institution: "Établissement Racine",
        year: "Année Universitaire : 2025/2026",
        highlights: ["React / TypeScript", "Django REST Framework", "Role-Based Access Control", "3D Artifacts Showcase"]
      }
    },
    {
      id: 1,
      title: "Problématique & Contexte",
      type: "bento",
      content: {
        title: "Le Contexte & Les Défis du Marché",
        subtitle: "Pourquoi concevoir une plateforme sur-mesure pour les objets de collection ?",
        cards: [
          {
            title: "Curation & Confiance",
            description: "Les plateformes generalistes souffrent d'un manque de verification des antiquités, entrainant des fraudes. Artisan's Echo integre un flux d'approbation et de moderation obligatoire par l'administrateur.",
            icon: Award,
            color: "from-emerald-500/20 to-teal-500/5",
            border: "border-emerald-500/30"
          },
          {
            title: "Expérience Visuelle Galerie d'Art",
            description: "Les passionnés recherchent une histoire, des details historiques et une mise en valeur esthetique. L'interface propose une galerie immersive premium avec prise en charge de modeles 3D interactifs.",
            icon: Sparkles,
            color: "from-teal-500/20 to-cyan-500/5",
            border: "border-teal-500/30"
          },
          {
            title: "Cloisonnement des Rôles (RBAC)",
            description: "Acheteurs (Collectionneurs), Vendeurs (Brocanteurs) et Administrateurs exigent des outils de gestion distincts. Notre plateforme fournit des tableaux de bord specialises et hermetiques pour chaque role.",
            icon: Users,
            color: "from-mint-500/20 to-emerald-500/5",
            border: "border-emerald-400/30"
          }
        ]
      }
    },
    {
      id: 2,
      title: "Architecture & Technologies",
      type: "architecture",
      content: {
        title: "Architecture Globale",
        subtitle: "Conception client-serveur robuste avec echanges securises",
        details: [
          {
            label: "Frontend SPA",
            tech: "React, TypeScript, Tailwind CSS, Framer Motion",
            desc: "Interface moderne, fluide et responsive. State global securise avec routage dynamique et gestion d'avatars 3D."
          },
          {
            label: "Backend REST API",
            tech: "Django & Django REST Framework",
            desc: "Moteur logique robuste gérant le RBAC, les transactions, la messagerie interne et l'audit trail."
          },
          {
            label: "Persistance & Securite",
            tech: "SQLite (ORM Django) + Auth JWT",
            desc: "Base de donnees relationnelle bien developpee avec jetons JWT pour authentifier chaque requete REST."
          }
        ],
        diagram: architectureImg
      }
    },
    {
      id: 3,
      title: "Fonctionnalités Clés",
      type: "features",
      content: {
        title: "Périmètre Fonctionnel Réalisé",
        subtitle: "Une marketplace complete pour securiser et animer les echanges",
        columns: [
          {
            title: "Espace Collectionneur / Acheteur",
            items: [
              "Catalogue immersif avec filtres multicriteres",
              "Fiche detaillee complete (Provenance, Histoire, Etat)",
              "Panier d'achat & Liste de souhaits (Wishlist)",
              "Processus de checkout avec Paiement a la Livraison (COD)",
              "Messagerie directe avec le vendeur de l'objet"
            ]
          },
          {
            title: "Espace Vendeur & Administrateur",
            items: [
              "Vendeur : Tableaux de bord de suivi des gains & ventes",
              "Vendeur : Gestion des produits (Draft, Publication, Sold)",
              "Admin : Modération et validation des artefacts avant publication",
              "Admin : Journal d'audit complet (Audit Trail) pour traçabilité",
              "Admin : Gestion et activation des comptes utilisateurs"
            ]
          }
        ]
      }
    },
    {
      id: 4,
      title: "Démonstration & Captures",
      type: "screenshots",
      content: {
        title: "Aperçu de la Plateforme",
        subtitle: "Interfaces et experiences dashboards developpees",
        screens: [
          { title: "Page d'Accueil", img: homeImg, desc: "Design elegant noir et or/bleu qui accueille les visiteurs." },
          { title: "Catalogue", img: catalogueImg, desc: "Filtres interactifs par categorie, prix et condition." },
          { title: "Tableau de Bord Vendeur", img: sellerDashboardImg, desc: "Gestion des produits publies, des commandes et des statistiques." },
          { title: "Espace Administration", img: adminDashboardImg, desc: "Workspace central de moderation et d'activation utilisateur." },
          { title: "Messagerie Interne", img: messagesImg, desc: "Thread de discussion integre lie directement aux objets." }
        ]
      }
    },
    {
      id: 5,
      title: "Conclusion & Remerciements",
      type: "thankyou",
      content: {
        title: "Conclusion & Perspectives",
        subtitle: "Fin de la presentation de soutenance",
        text: "Artisan's Echo repond avec succes aux exigences fonctionnelles et securitaires d'une marketplace d'antiquités de confiance. Les perspectives futures incluent l'integration d'une passerelle de paiement en ligne (Stripe), d'une visualisation 3D en Realite Augmentee (AR), et d'une verification d'authenticite assistee par IA.",
        thanks: "Merci pour votre attention !"
      }
    }
  ]

  const nextSlide = () => {
    if (currentSlide < SLIDES.length - 1) {
      setDirection(1)
      setCurrentSlide(prev => prev + 1)
      setIsDropdownOpen(false)
    }
  }

  const prevSlide = () => {
    if (currentSlide > 0) {
      setDirection(-1)
      setCurrentSlide(prev => prev - 1)
      setIsDropdownOpen(false)
    }
  }

  const jumpToSlide = (index: number) => {
    setDirection(index > currentSlide ? 1 : -1)
    setCurrentSlide(index)
    setIsDropdownOpen(false)
  }

  // Keyboard navigation listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault()
        nextSlide()
      } else if (e.key === 'ArrowLeft' || e.key === 'Backspace') {
        e.preventDefault()
        prevSlide()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentSlide])

  // Debounced wheel listener for slide change
  useEffect(() => {
    let lastScrollTime = 0
    const handleWheel = (e: WheelEvent) => {
      const now = Date.now()
      if (now - lastScrollTime < 1000) return
      if (Math.abs(e.deltaY) > 30) {
        lastScrollTime = now
        if (e.deltaY > 0) {
          nextSlide()
        } else {
          prevSlide()
        }
      }
    }
    window.addEventListener('wheel', handleWheel, { passive: true })
    return () => window.removeEventListener('wheel', handleWheel)
  }, [currentSlide])

  // Trigger confetti on the final slide
  const handleFinalSlideConfetti = () => {
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 }
    })
  }

  // Auto trigger confetti when entering slide 5
  useEffect(() => {
    if (currentSlide === 5) {
      handleFinalSlideConfetti()
    }
  }, [currentSlide])

  const slide = SLIDES[currentSlide]

  // Slide content render helpers
  const renderSlideContent = () => {
    switch (slide.type) {
      case 'intro':
        return (
          <div className="flex flex-col items-center justify-center h-full text-center max-w-5xl mx-auto px-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 rounded-full text-xs font-mono tracking-widest text-emerald-400 mb-6 uppercase"
            >
              {slide.content.tagline}
            </motion.div>
            
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-6xl md:text-7xl font-extrabold tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200"
            >
              {slide.content.title}
            </motion.h1>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-lg md:text-2xl text-teal-100/70 font-light max-w-3xl mb-12"
            >
              {slide.content.subtitle}
            </motion.p>

            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl bg-white/[0.03] backdrop-blur-md border border-white/[0.08] p-6 rounded-2xl mb-10 text-left"
            >
              <div>
                <span className="text-xs uppercase font-mono text-emerald-400/70">Réalisé par :</span>
                <p className="text-lg font-semibold text-white mt-1">{slide.content.author}</p>
                <p className="text-xs text-teal-100/50 mt-1 font-mono">Filière Développement Informatique</p>
              </div>
              <div>
                <span className="text-xs uppercase font-mono text-emerald-400/70">Encadré par :</span>
                <p className="text-lg font-semibold text-white mt-1">{slide.content.supervisor}</p>
                <p className="text-xs text-teal-100/50 mt-1 font-mono">{slide.content.institution}</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="flex flex-wrap gap-3 justify-center"
            >
              {slide.content.highlights.map((h, i) => (
                <span key={i} className="px-3 py-1 bg-white/[0.05] border border-white/[0.05] rounded-full text-xs font-mono text-teal-200/80">
                  #{h}
                </span>
              ))}
            </motion.div>
          </div>
        )

      case 'bento':
        return (
          <div className="flex flex-col h-full max-w-6xl mx-auto px-4 justify-center">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">{slide.content.title}</h2>
              <p className="text-teal-100/60 text-sm md:text-base">{slide.content.subtitle}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {slide.content.cards.map((card, idx) => {
                const IconComponent = card.icon
                return (
                  <motion.div
                    key={idx}
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: idx * 0.15, duration: 0.5 }}
                    className={`bg-gradient-to-br ${card.color} backdrop-blur-md border ${card.border} p-6 rounded-2xl flex flex-col items-start hover:border-emerald-400/50 hover:shadow-[0_0_20px_rgba(52,211,153,0.1)] transition-all group`}
                  >
                    <div className="p-3 bg-emerald-500/10 rounded-xl mb-4 text-emerald-400 group-hover:scale-110 transition-transform">
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-3">{card.title}</h3>
                    <p className="text-teal-100/70 text-sm leading-relaxed font-light">{card.description}</p>
                  </motion.div>
                )
              })}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-8 bg-white/[0.02] border border-white/[0.05] rounded-2xl p-4 text-center max-w-3xl mx-auto flex items-center gap-4 text-xs font-mono text-emerald-400/80 justify-center"
            >
              <HelpCircle className="h-4 w-4 shrink-0" />
              <span>L'objectif clé d'Artisan's Echo est d'insuffler les codes du luxe et de la curation au commerce d'antiquités en ligne.</span>
            </motion.div>
          </div>
        )

      case 'architecture':
        return (
          <div className="flex flex-col h-full max-w-6xl mx-auto px-4 justify-center">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">{slide.content.title}</h2>
              <p className="text-teal-100/60 text-sm">{slide.content.subtitle}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Details */}
              <div className="lg:col-span-5 space-y-4">
                {slide.content.details.map((detail, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ x: -30, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: idx * 0.15, duration: 0.5 }}
                    className="bg-white/[0.02] border border-white/[0.06] p-4 rounded-xl hover:bg-white/[0.04] transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,1)]" />
                      <h3 className="font-semibold text-white text-base">{detail.label}</h3>
                    </div>
                    <p className="text-xs font-mono text-emerald-400 mb-1">{detail.tech}</p>
                    <p className="text-xs text-teal-100/70 leading-relaxed font-light">{detail.desc}</p>
                  </motion.div>
                ))}
              </div>

              {/* Right Architecture Diagram */}
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="lg:col-span-7 bg-white/[0.03] backdrop-blur-md border border-white/[0.08] p-3 rounded-2xl shadow-xl overflow-hidden group relative"
              >
                <div className="absolute top-3 left-3 bg-black/60 border border-white/10 px-2 py-0.5 rounded text-[10px] font-mono text-emerald-400 z-10">
                  UML Architecture Diagram
                </div>
                <img
                  src={slide.content.diagram}
                  alt="Architecture Diagram"
                  className="rounded-xl w-full max-h-[360px] object-contain group-hover:scale-[1.02] transition-transform duration-500 bg-[#061417]"
                />
              </motion.div>
            </div>
          </div>
        )

      case 'features':
        return (
          <div className="flex flex-col h-full max-w-6xl mx-auto px-4 justify-center">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">{slide.content.title}</h2>
              <p className="text-teal-100/60 text-sm">{slide.content.subtitle}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {slide.content.columns.map((col, idx) => (
                <motion.div
                  key={idx}
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: idx * 0.2, duration: 0.5 }}
                  className="bg-white/[0.03] backdrop-blur-md border border-white/[0.08] p-6 rounded-2xl flex flex-col"
                >
                  <h3 className="text-lg font-semibold text-emerald-400 mb-4 border-b border-emerald-500/20 pb-2 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5" />
                    {col.title}
                  </h3>
                  <ul className="space-y-3.5 flex-1">
                    {col.items.map((item, itemIdx) => (
                      <li key={itemIdx} className="flex items-start gap-3 text-sm">
                        <span className="p-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mt-0.5 shrink-0">
                          <Check className="h-3 w-3" />
                        </span>
                        <span className="text-teal-100/80 leading-relaxed font-light">{item}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
        )

      case 'screenshots':
        return (
          <div className="flex flex-col h-full max-w-6xl mx-auto px-4 justify-center">
            <div className="text-center mb-4">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">{slide.content.title}</h2>
              <p className="text-teal-100/60 text-sm">{slide.content.subtitle}</p>
            </div>

            <ScreenshotShowcase screens={slide.content.screens} />
          </div>
        )

      case 'thankyou':
        return (
          <div className="flex flex-col items-center justify-center h-full text-center max-w-4xl mx-auto px-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="p-4 bg-emerald-500/10 rounded-full border border-emerald-500/30 text-emerald-400 mb-6"
            >
              <Award className="h-10 w-10 animate-bounce" />
            </motion.div>

            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-3xl md:text-4xl font-bold text-white mb-4"
            >
              {slide.content.title}
            </motion.h2>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-sm md:text-base text-teal-100/75 leading-relaxed font-light max-w-2xl mb-8"
            >
              {slide.content.text}
            </motion.p>

            <motion.h1
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, type: 'spring' }}
              className="text-4xl md:text-6xl font-black mb-10 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-mint-300 to-teal-200"
            >
              {slide.content.thanks}
            </motion.h1>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex gap-4"
            >
              <button
                onClick={handleFinalSlideConfetti}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium hover:from-emerald-600 hover:to-teal-600 shadow-[0_0_20px_rgba(52,211,153,0.3)] transition-all hover:scale-105 active:scale-95"
              >
                <Sparkles className="h-5 w-5" />
                Confettis !
              </button>
              
              <Link
                to="/"
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-teal-100 font-medium hover:bg-white/10 transition-all hover:scale-105 active:scale-95"
              >
                <Home className="h-5 w-5" />
                Retour au Catalogue
              </Link>
            </motion.div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="bg-[#040c0e] text-white min-h-screen relative overflow-hidden font-sans flex flex-col justify-between selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Parallax Background Glowing Circles */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <motion.div
          animate={{ x: mousePos.x * 1.2, y: mousePos.y * 1.2 }}
          transition={{ type: 'spring', stiffness: 45, damping: 25 }}
          className="absolute -top-[10%] -left-[10%] w-[50vw] h-[50vw] rounded-full bg-emerald-800/10 blur-[150px]"
        />
        <motion.div
          animate={{ x: -mousePos.x * 1.5, y: -mousePos.y * 1.5 }}
          transition={{ type: 'spring', stiffness: 45, damping: 25 }}
          className="absolute -bottom-[20%] -right-[10%] w-[60vw] h-[60vw] rounded-full bg-teal-800/10 blur-[180px]"
        />
        <div className="absolute top-[40%] left-[60%] w-[30vw] h-[30vw] rounded-full bg-mint-900/5 blur-[120px]" />
        
        {/* Subtle grid lines background overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      </div>

      {/* TOP HEADER CONTROLS */}
      <header className="relative z-20 w-full px-6 py-4 flex items-center justify-between border-b border-white/[0.04] bg-[#040c0e]/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold font-mono">
            AE
          </div>
          <div>
            <h4 className="text-xs font-mono tracking-widest text-emerald-400 uppercase">Artisan's Echo</h4>
            <h5 className="text-[10px] text-teal-100/50 uppercase tracking-wider font-light">PFE Presentation Slideshow</h5>
          </div>
        </div>

        {/* Quick Jump Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.06] transition text-sm font-mono text-teal-200"
          >
            <span>{currentSlide + 1}. {slide.title}</span>
            {isDropdownOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 mt-2 w-64 rounded-xl bg-[#091a1d] border border-white/[0.08] shadow-2xl p-2 z-30"
              >
                {SLIDES.map((s, idx) => (
                  <button
                    key={s.id}
                    onClick={() => jumpToSlide(idx)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono transition flex items-center justify-between ${
                      currentSlide === idx
                        ? 'bg-emerald-500/20 text-emerald-300 font-semibold'
                        : 'text-teal-100/70 hover:bg-white/5'
                    }`}
                  >
                    <span>{idx + 1}. {s.title}</span>
                    {currentSlide === idx && <Check className="h-3 w-3 text-emerald-400" />}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* MAIN SLIDE CONTAINER */}
      <main className="relative z-10 flex-1 flex items-center justify-center py-10 w-full overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentSlide}
            custom={direction}
            variants={{
              enter: (dir: number) => ({
                x: dir > 0 ? 300 : -300,
                opacity: 0,
                scale: 0.95
              }),
              center: {
                x: 0,
                opacity: 1,
                scale: 1,
                transition: { type: 'spring', stiffness: 300, damping: 30 }
              },
              exit: (dir: number) => ({
                x: dir < 0 ? 300 : -300,
                opacity: 0,
                scale: 0.95,
                transition: { duration: 0.2 }
              })
            }}
            initial="enter"
            animate="center"
            exit="exit"
            className="w-full"
          >
            {renderSlideContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* BOTTOM NAVIGATION CONTROLS */}
      <footer className="relative z-20 w-full py-6 px-6 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-white/[0.04] bg-[#040c0e]/80 backdrop-blur-md">
        {/* Helper keys */}
        <div className="hidden md:flex items-center gap-4 text-[10px] font-mono text-teal-100/40">
          <div className="flex items-center gap-1.5">
            <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10">Space</span> /
            <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10">→</span>
            <span>Suivant</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10">←</span> /
            <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10">Backspace</span>
            <span>Précédent</span>
          </div>
        </div>

        {/* Central controller */}
        <div className="flex items-center gap-6 bg-white/[0.03] backdrop-blur-lg border border-white/[0.08] px-6 py-2.5 rounded-full shadow-lg">
          <button
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className={`p-1.5 rounded-full transition ${
              currentSlide === 0
                ? 'text-teal-100/20 cursor-not-allowed'
                : 'text-emerald-400 hover:bg-white/5'
            }`}
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          {/* Dots Indicator */}
          <div className="flex items-center gap-2">
            {SLIDES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => jumpToSlide(idx)}
                className={`h-2 rounded-full transition-all ${
                  currentSlide === idx ? 'w-6 bg-emerald-400' : 'w-2 bg-teal-100/20 hover:bg-teal-100/40'
                }`}
              />
            ))}
          </div>

          <button
            onClick={nextSlide}
            disabled={currentSlide === SLIDES.length - 1}
            className={`p-1.5 rounded-full transition ${
              currentSlide === SLIDES.length - 1
                ? 'text-teal-100/20 cursor-not-allowed'
                : 'text-emerald-400 hover:bg-white/5'
            }`}
          >
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>

        {/* Exit & Go Home */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-xs font-mono text-emerald-400 hover:text-emerald-300 bg-white/[0.02] border border-white/[0.05] hover:bg-white/5 px-4 py-2 rounded-xl transition"
        >
          <Home className="h-3.5 w-3.5" />
          <span>Exit to Shop</span>
        </button>
      </footer>
    </div>
  )
}

// Subcomponent for screenshot gallery slide to avoid big blocks
function ScreenshotShowcase({ screens }: { screens: Array<{ title: string; img: string; desc: string }> }) {
  const [activeIdx, setActiveIdx] = useState(0)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mt-2">
      {/* Left Menu Selection */}
      <div className="lg:col-span-4 space-y-2">
        {screens.map((screen, idx) => (
          <button
            key={idx}
            onClick={() => setActiveIdx(idx)}
            className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center gap-3 ${
              activeIdx === idx
                ? 'bg-emerald-500/10 border-emerald-500/40 text-white shadow-[0_0_15px_rgba(52,211,153,0.05)]'
                : 'bg-white/[0.01] border-white/[0.05] text-teal-100/60 hover:bg-white/[0.03]'
            }`}
          >
            <span className={`h-6 w-6 rounded-lg flex items-center justify-center font-mono text-xs ${
              activeIdx === idx ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/5 text-teal-100/40'
            }`}>
              {idx + 1}
            </span>
            <div className="text-left">
              <p className="text-sm font-semibold leading-tight">{screen.title}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Right Image Preview Screen */}
      <div className="lg:col-span-8 flex flex-col bg-white/[0.02] border border-white/[0.06] p-4 rounded-2xl">
        <div className="relative rounded-xl overflow-hidden aspect-video bg-[#040e10] border border-white/[0.04]">
          <AnimatePresence mode="wait">
            <motion.img
              key={activeIdx}
              src={screens[activeIdx].img}
              alt={screens[activeIdx].title}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full object-cover max-h-[340px]"
            />
          </AnimatePresence>
        </div>
        <p className="text-xs text-teal-100/60 mt-3 font-mono leading-relaxed bg-white/[0.01] p-3 rounded-lg border border-white/[0.03]">
          💡 <span className="font-semibold text-emerald-400">{screens[activeIdx].title} :</span> {screens[activeIdx].desc}
        </p>
      </div>
    </div>
  )
}
