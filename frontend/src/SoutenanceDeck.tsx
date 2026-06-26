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
  HelpCircle,
  ShieldAlert,
  Server,
  Terminal,
  Heart,
  TrendingUp
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
        x: (e.clientX / window.innerWidth - 0.5) * 40,
        y: (e.clientY / window.innerHeight - 0.5) * 40,
      })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeMouseMoveListener = () => window.removeEventListener('mousemove', handleMouseMove)
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
      title: "1. Accueil & Titre",
      type: "intro",
      content: {
        title: "Artisan's Echo",
        subtitle: "Plateforme Marketplace Premium d'Antiquités et d'Objets de Collection",
        tagline: "Projet de Fin d'Études — Diplôme en Développement Informatique",
        author: "AIT OUAHMAN OUISSAL",
        supervisor: "M. Ait Ben Hamou Khalid",
        institution: "Établissement Racine",
        year: "Année Académique : 2025/2026",
        highlights: ["React / TS", "Django REST Framework", "Role-Based Access Control", "3D / Image Gallery"]
      }
    },
    {
      id: 1,
      title: "2. Remerciements",
      type: "thanks_intro",
      content: {
        title: "Remerciements",
        subtitle: "Témoignage de gratitude envers les contributeurs du projet",
        paragraphs: [
          "Je tiens à exprimer ma profonde gratitude envers mon encadrant de projet, M. Ait Ben Hamou Khalid, pour ses conseils précieux, ses orientations méthodologiques rigoureuses et sa disponibilité.",
          "J'adresse également mes vifs remerciements à l'équipe pédagogique et administrative de l'Établissement Racine pour la qualité de l'accompagnement et des ressources mis à notre disposition.",
          "Enfin, je remercie chaleureusement les membres du jury pour l'évaluation de ce travail, ainsi que mes proches pour leur soutien indéfectible tout au long de mon cursus académique."
        ]
      }
    },
    {
      id: 2,
      title: "3. Contexte du Projet",
      type: "creative_cards",
      content: {
        title: "Contexte du Marché",
        subtitle: "L'évolution des antiquités et objets de collection vers le numérique",
        cards: [
          {
            title: "Marché de Niche Unique",
            description: "Les antiquités exigent une identification précise (époque, provenance, état) et une valorisation qui diffèrent des produits génériques de masse.",
            icon: Sparkles,
            metric: "Transactions à Forte Valeur"
          },
          {
            title: "Transition Digitale",
            description: "Les brocantes traditionnelles s'étendent en ligne, exigeant des galeries virtuelles interactives et sécurisées pour rassurer les passionnés.",
            icon: Monitor,
            metric: "Expérience Visuelle Exigée"
          },
          {
            title: "Relation de Confiance",
            description: "L'acheteur doit être assuré de la provenance et de l'authenticité d'un artefact avant d'engager une transaction.",
            icon: ShieldAlert,
            metric: "Curation & Sécurité"
          }
        ]
      }
    },
    {
      id: 3,
      title: "4. Problématique",
      type: "bento",
      content: {
        title: "La Problématique Centrale",
        subtitle: "Quels sont les défis majeurs à résoudre ?",
        cards: [
          {
            title: "Manque de Curation & Contrefaçons",
            description: "Sur les sites C2C classiques, aucun contrôle n'est opéré sur la véracité des antiquités. Comment valider la conformité des artefacts ?",
            icon: ShieldAlert,
            color: "from-amber-500/20 to-yellow-500/5",
            border: "border-amber-500/30"
          },
          {
            title: "Interfaces Standards Obsolètes",
            description: "Les objets précieux méritent d'être présentés avec une identité visuelle immersive (style galerie d'art, supports d'images multiples, 3D).",
            icon: Layout,
            color: "from-blue-500/20 to-indigo-500/5",
            border: "border-blue-500/30"
          },
          {
            title: "Confusion des Outils",
            description: "Les acteurs ont besoin d'espaces hermétiques : les vendeurs gèrent un stock unique, les acheteurs suivent des coups de cœur, l'admin surveille le tout.",
            icon: Users,
            color: "from-amber-400/20 to-amber-500/5",
            border: "border-amber-400/30"
          }
        ]
      }
    },
    {
      id: 4,
      title: "5. Objectifs du Projet",
      type: "features",
      content: {
        title: "Objectifs & Valeur Ajoutée",
        subtitle: "La solution Artisan's Echo en réponse aux problématiques",
        columns: [
          {
            title: "Instaurer un Cadre de Confiance",
            items: [
              "Vérification et modération obligatoire de chaque artefact par l'admin",
              "Séparation étanche des comptes : Acheteur, Vendeur, Administrateur",
              "Journalisation des actions d'administration (Audit Trail)",
              "Messagerie interne de négociation directe par produit"
            ]
          },
          {
            title: "Proposer une Expérience Premium",
            items: [
              "Fiche produit détaillée (histoire, provenance, état, matériaux)",
              "Galerie d'images multiples pour inspecter sous tous les angles",
              "Panier d'achat & Liste de souhaits (Wishlist) réactifs",
              "Design responsive s'adaptant du smartphone à la tablette"
            ]
          }
        ]
      }
    },
    {
      id: 5,
      title: "6. Identification des Acteurs",
      type: "actors",
      content: {
        title: "Acteurs & Rôles du Système",
        subtitle: "Trois profils d'utilisateurs distincts connectés sur le même écosystème",
        actors: [
          {
            name: "Collectionneur / Acheteur",
            role: "Explorateur & Acquéreur",
            desc: "Explore le catalogue public, sauvegarde dans sa wishlist, gère son panier, négocie avec le vendeur et valide ses commandes (Cash on Delivery).",
            icon: Heart
          },
          {
            name: "Vendeur Artisanal / Brocanteur",
            role: "Marchand d'Artéfacts",
            desc: "Publie ses créations et antiquités (état brouillon/soumis), suit ses ventes, expédie et change le statut des commandes associées à sa galerie.",
            icon: TrendingUp
          },
          {
            name: "Administrateur / Curateur",
            role: "Gestionnaire de la Marketplace",
            desc: "Modère les artefacts soumis (Approuver/Rejeter), active ou désactive les comptes utilisateurs, et consulte le journal d'audit des actions critiques.",
            icon: Award
          }
        ]
      }
    },
    {
      id: 6,
      title: "7. Besoins Fonctionnels",
      type: "usecase",
      content: {
        title: "Besoins Fonctionnels",
        subtitle: "Cas d'utilisation principaux développés sur l'application",
        columns: [
          {
            title: "Processus d'Achat & Échanges",
            items: [
              "Inscription & Authentification sécurisée (JWT)",
              "Recherche dynamique & Filtres par catégorie/état",
              "Achat rapide avec gestion du panier de commande",
              "Négociation intégrée via la messagerie produit"
            ]
          },
          {
            title: "Processus d'Administration & Vente",
            items: [
              "Ajout d'antiquités avec galerie d'images",
              "Modération d'objets (Approuver / Rejeter)",
              "Journal d'audit de sécurité des modérateurs",
              "Mise à jour du profil (avatar et rôles)"
            ]
          }
        ]
      }
    },
    {
      id: 7,
      title: "8. Architecture Système",
      type: "architecture",
      content: {
        title: "Architecture Logicielle Client-Serveur",
        subtitle: "Couplage moderne découplé garantissant flexibilité et rapidité",
        details: [
          {
            label: "Frontend SPA",
            tech: "React, TypeScript, Tailwind CSS, motion/react",
            desc: "Application monopage dynamique. Styles sur-mesure de type galerie d'art moderne. Animations d'états fluides."
          },
          {
            label: "Backend API REST",
            tech: "Django & Django REST Framework",
            desc: "API RESTful structurée avec gestion de session sécurisée (JWT), règles RBAC et serveurs de fichiers médias."
          },
          {
            label: "Base de Données",
            tech: "SQLite & Django ORM",
            desc: "Données structurées sous forme relationnelle avec liaisons intègres (ForeignKey et Cascade de suppression)."
          }
        ],
        diagram: architectureImg
      }
    },
    {
      id: 8,
      title: "9. Modèle de Données (BDD)",
      type: "data_model",
      content: {
        title: "Modèle Conceptuel de Données",
        subtitle: "Schéma relationnel structuré gérant les entités clés",
        text: "Le schéma de base de données comprend les entités utilisateurs (User, Profile), les produits (Artifact, Category, ArtifactImage), les commandes (Order, OrderItem), la messagerie (Conversation, Message) et l'audit (AuditLog).",
        diagram: dbErImg
      }
    },
    {
      id: 9,
      title: "10. Sécurisation & Rôles (RBAC)",
      type: "rbac_slide",
      content: {
        title: "Sécurité & Contrôle d'Accès",
        subtitle: "Comment les rôles et permissions sont isolés sur la plateforme",
        text: "Un middleware côté backend vérifie le rôle de l'utilisateur stocké dans le JWT lors de chaque appel d'API. Côté frontend, des 'Gares de Routage' (AdminGate, SellerGate, BuyerGate) redirigent ou bloquent les accès non autorisés.",
        diagram: rbacImg
      }
    },
    {
      id: 10,
      title: "11. Captures & Démonstration",
      type: "screenshots",
      content: {
        title: "Démonstration des Interfaces",
        subtitle: "Visualisation de l'application réelle en fonctionnement",
        screens: [
          { title: "Page d'Accueil", img: homeImg, desc: "Design d'art élégant noir et or accueillant les visiteurs avec des animations soignées." },
          { title: "Catalogue", img: catalogueImg, desc: "Filtres interactifs par catégorie, prix, et état avec rechargement d'API dynamique." },
          { title: "Tableau de Bord Vendeur", img: sellerDashboardImg, desc: "Suivi des statistiques de vente, de l'état des commandes et de son inventaire." },
          { title: "Espace Administration", img: adminDashboardImg, desc: "Workspace central de modération des artefacts et d'activation de comptes." },
          { title: "Messagerie Interne", img: messagesImg, desc: "Thread de discussion lié directement aux objets pour des négociations simples." }
        ]
      }
    },
    {
      id: 11,
      title: "12. Conclusion & Perspectives",
      type: "thankyou",
      content: {
        title: "Conclusion & Perspectives",
        subtitle: "Clôture de la présentation",
        text: "Artisan's Echo remplit avec succès les objectifs de conception d'une vitrine haut de gamme et d'outils cloisonnés. Les perspectives d'avenir incluent l'intégration de Stripe pour les paiements électroniques directs, de modules de réalité augmentée (3D AR) pour projeter les antiquités chez soi, et de filtres d'IA pour analyser automatiquement les photos d'artefacts.",
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
      origin: { y: 0.6 },
      colors: ['#c5a880', '#e5c590', '#1d4ed8', '#ffffff']
    })
  }

  // Auto trigger confetti when entering slide 11
  useEffect(() => {
    if (currentSlide === 11) {
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
              className="bg-amber-500/10 border border-amber-500/20 px-4 py-1.5 rounded-full text-xs font-mono tracking-widest text-amber-400 mb-6 uppercase"
            >
              {slide.content.tagline}
            </motion.div>
            
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-5xl md:text-7xl font-bold tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-300 to-yellow-500 font-serif"
            >
              {slide.content.title}
            </motion.h1>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-lg md:text-2xl text-amber-100/70 font-light max-w-3xl mb-12"
            >
              {slide.content.subtitle}
            </motion.p>

            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl bg-white/[0.02] backdrop-blur-md border border-white/[0.06] p-6 rounded-2xl mb-10 text-left"
            >
              <div>
                <span className="text-xs uppercase font-mono text-amber-400/70">Réalisé par :</span>
                <p className="text-lg font-semibold text-white mt-1 font-serif">{slide.content.author}</p>
                <p className="text-xs text-amber-100/50 mt-1 font-mono">Développement Informatique</p>
              </div>
              <div>
                <span className="text-xs uppercase font-mono text-amber-400/70">Encadré par :</span>
                <p className="text-lg font-semibold text-white mt-1 font-serif">{slide.content.supervisor}</p>
                <p className="text-xs text-amber-100/50 mt-1 font-mono">{slide.content.institution}</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="flex flex-wrap gap-3 justify-center"
            >
              {slide.content.highlights.map((h, i) => (
                <span key={i} className="px-3 py-1 bg-white/[0.04] border border-white/[0.04] rounded-full text-xs font-mono text-amber-200/80">
                  #{h}
                </span>
              ))}
            </motion.div>
          </div>
        )

      case 'thanks_intro':
        return (
          <div className="flex flex-col h-full max-w-4xl mx-auto px-4 justify-center">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-white font-serif mb-2">{slide.content.title}</h2>
              <div className="h-1 w-20 bg-amber-500 mx-auto mt-2 rounded-full" />
              <p className="text-amber-100/60 text-sm mt-3">{slide.content.subtitle}</p>
            </div>

            <div className="bg-white/[0.02] border border-white/[0.06] p-8 rounded-3xl backdrop-blur-md space-y-6">
              {slide.content.paragraphs.map((p, idx) => (
                <motion.p
                  key={idx}
                  initial={{ y: 15, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: idx * 0.15, duration: 0.5 }}
                  className="text-base text-teal-100/80 leading-relaxed font-light first-letter:text-2xl first-letter:font-bold first-letter:text-amber-400 first-letter:font-serif"
                >
                  {p}
                </motion.p>
              ))}
            </div>
          </div>
        )

      case 'creative_cards':
        return (
          <div className="flex flex-col h-full max-w-6xl mx-auto px-4 justify-center">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-white font-serif mb-2">{slide.content.title}</h2>
              <p className="text-amber-100/60 text-sm">{slide.content.subtitle}</p>
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
                    whileHover={{ y: -8, scale: 1.02 }}
                    className="bg-white/[0.02] border border-white/[0.06] hover:border-amber-500/40 p-6 rounded-2xl flex flex-col justify-between shadow-2xl relative overflow-hidden group transition-all"
                  >
                    {/* Glowing effect inside card */}
                    <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-colors pointer-events-none" />
                    
                    <div>
                      <div className="p-3 bg-amber-500/10 rounded-xl mb-4 text-amber-400 inline-block">
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <h3 className="text-lg font-bold text-white mb-2 font-serif">{card.title}</h3>
                      <p className="text-teal-100/70 text-xs leading-relaxed font-light mb-6">{card.description}</p>
                    </div>

                    <div className="border-t border-white/[0.05] pt-3 mt-auto">
                      <span className="text-[10px] uppercase font-mono text-amber-400/80 tracking-widest">{card.metric}</span>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        )

      case 'bento':
        return (
          <div className="flex flex-col h-full max-w-6xl mx-auto px-4 justify-center">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-white font-serif mb-2">{slide.content.title}</h2>
              <p className="text-amber-100/60 text-sm">{slide.content.subtitle}</p>
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
                    className={`bg-gradient-to-br ${card.color} backdrop-blur-md border ${card.border} p-6 rounded-2xl flex flex-col items-start hover:border-amber-400/50 hover:shadow-[0_0_20px_rgba(217,119,6,0.1)] transition-all group`}
                  >
                    <div className="p-3 bg-amber-500/10 rounded-xl mb-4 text-amber-400 group-hover:scale-110 transition-transform">
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-3 font-serif">{card.title}</h3>
                    <p className="text-teal-100/70 text-xs leading-relaxed font-light">{card.description}</p>
                  </motion.div>
                )
              })}
            </div>
          </div>
        )

      case 'features':
        return (
          <div className="flex flex-col h-full max-w-6xl mx-auto px-4 justify-center">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-white font-serif mb-2">{slide.content.title}</h2>
              <p className="text-amber-100/60 text-sm">{slide.content.subtitle}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {slide.content.columns.map((col, idx) => (
                <motion.div
                  key={idx}
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: idx * 0.2, duration: 0.5 }}
                  className="bg-white/[0.02] backdrop-blur-md border border-white/[0.06] p-6 rounded-2xl flex flex-col"
                >
                  <h3 className="text-lg font-semibold text-amber-400 mb-4 border-b border-amber-500/20 pb-2 flex items-center gap-2 font-serif">
                    <CheckCircle2 className="h-5 w-5 text-amber-400" />
                    {col.title}
                  </h3>
                  <ul className="space-y-3 flex-1">
                    {col.items.map((item, itemIdx) => (
                      <li key={itemIdx} className="flex items-start gap-3 text-xs">
                        <span className="p-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 mt-0.5 shrink-0">
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

      case 'actors':
        return (
          <div className="flex flex-col h-full max-w-6xl mx-auto px-4 justify-center">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-white font-serif mb-2">{slide.content.title}</h2>
              <p className="text-amber-100/60 text-sm">{slide.content.subtitle}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {slide.content.actors.map((actor, idx) => {
                const IconComponent = actor.icon
                return (
                  <motion.div
                    key={idx}
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: idx * 0.15, duration: 0.5 }}
                    className="bg-white/[0.02] border border-white/[0.06] hover:border-amber-500/30 p-6 rounded-2xl flex flex-col text-center relative overflow-hidden group transition-all"
                  >
                    <div className="mx-auto p-4 bg-amber-500/10 rounded-full mb-4 text-amber-400 group-hover:bg-amber-500/20 transition-all">
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <h3 className="text-base font-bold text-white mb-1 font-serif">{actor.name}</h3>
                    <span className="text-[10px] font-mono text-amber-400 mb-4 block uppercase tracking-wider">{actor.role}</span>
                    <p className="text-teal-100/70 text-xs leading-relaxed font-light">{actor.desc}</p>
                  </motion.div>
                )
              })}
            </div>
          </div>
        )

      case 'usecase':
        return (
          <div className="flex flex-col h-full max-w-6xl mx-auto px-4 justify-center">
            <div className="text-center mb-6">
              <h2 className="text-3xl md:text-4xl font-bold text-white font-serif mb-2">{slide.content.title}</h2>
              <p className="text-amber-100/60 text-sm">{slide.content.subtitle}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {slide.content.columns.map((col, idx) => (
                <motion.div
                  key={idx}
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: idx * 0.2, duration: 0.5 }}
                  className="bg-white/[0.02] backdrop-blur-md border border-white/[0.06] p-6 rounded-2xl flex flex-col"
                >
                  <h3 className="text-base font-bold text-amber-400 mb-4 border-b border-amber-500/20 pb-2 flex items-center gap-2 font-serif">
                    <CheckCircle2 className="h-4 w-4" />
                    {col.title}
                  </h3>
                  <ul className="space-y-3.5 flex-1">
                    {col.items.map((item, itemIdx) => (
                      <li key={itemIdx} className="flex items-start gap-3 text-xs">
                        <span className="p-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 mt-0.5 shrink-0">
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

      case 'architecture':
        return (
          <div className="flex flex-col h-full max-w-6xl mx-auto px-4 justify-center">
            <div className="text-center mb-6">
              <h2 className="text-3xl md:text-4xl font-bold text-white font-serif mb-2">{slide.content.title}</h2>
              <p className="text-amber-100/60 text-sm">{slide.content.subtitle}</p>
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
                      <span className="h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,1)]" />
                      <h3 className="font-semibold text-white text-base font-serif">{detail.label}</h3>
                    </div>
                    <p className="text-xs font-mono text-amber-400 mb-1">{detail.tech}</p>
                    <p className="text-xs text-teal-100/70 leading-relaxed font-light">{detail.desc}</p>
                  </motion.div>
                ))}
              </div>

              {/* Right Architecture Diagram */}
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="lg:col-span-7 bg-white/[0.02] backdrop-blur-md border border-white/[0.06] p-3 rounded-2xl shadow-xl overflow-hidden group relative"
              >
                <div className="absolute top-3 left-3 bg-black/60 border border-white/10 px-2 py-0.5 rounded text-[10px] font-mono text-amber-400 z-10">
                  Client-Server System Design
                </div>
                <img
                  src={slide.content.diagram}
                  alt="Architecture Diagram"
                  className="rounded-xl w-full max-h-[350px] object-contain group-hover:scale-[1.02] transition-transform duration-500 bg-[#061417]"
                />
              </motion.div>
            </div>
          </div>
        )

      case 'data_model':
        return (
          <div className="flex flex-col h-full max-w-6xl mx-auto px-4 justify-center">
            <div className="text-center mb-6">
              <h2 className="text-3xl md:text-4xl font-bold text-white font-serif mb-2">{slide.content.title}</h2>
              <p className="text-amber-100/60 text-sm">{slide.content.subtitle}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-4 space-y-4">
                <div className="bg-white/[0.02] border border-white/[0.06] p-5 rounded-2xl">
                  <h3 className="text-amber-400 font-bold mb-2 font-serif">Structure SQL Relationnelle</h3>
                  <p className="text-teal-100/70 text-xs leading-relaxed font-light mb-4">
                    {slide.content.text}
                  </p>
                  <ul className="space-y-2 text-xs text-teal-100/80">
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                      <span>Clés primaires et étrangères</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                      <span>Intégrité référentielle</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                      <span>Images et fichiers multiples</span>
                    </li>
                  </ul>
                </div>
              </div>

              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="lg:col-span-8 bg-white/[0.02] backdrop-blur-md border border-white/[0.06] p-3 rounded-2xl shadow-xl overflow-hidden group relative"
              >
                <div className="absolute top-3 left-3 bg-black/60 border border-white/10 px-2 py-0.5 rounded text-[10px] font-mono text-amber-400 z-10">
                  Database ER Entity Diagram
                </div>
                <img
                  src={slide.content.diagram}
                  alt="Database ER Diagram"
                  className="rounded-xl w-full max-h-[350px] object-contain group-hover:scale-[1.02] transition-transform duration-500 bg-[#061417]"
                />
              </motion.div>
            </div>
          </div>
        )

      case 'rbac_slide':
        return (
          <div className="flex flex-col h-full max-w-6xl mx-auto px-4 justify-center">
            <div className="text-center mb-6">
              <h2 className="text-3xl md:text-4xl font-bold text-white font-serif mb-2">{slide.content.title}</h2>
              <p className="text-amber-100/60 text-sm">{slide.content.subtitle}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-4 space-y-4">
                <div className="bg-white/[0.02] border border-white/[0.06] p-5 rounded-2xl">
                  <h3 className="text-amber-400 font-bold mb-2 font-serif">Cloisonnement RBAC</h3>
                  <p className="text-teal-100/70 text-xs leading-relaxed font-light mb-4">
                    {slide.content.text}
                  </p>
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex gap-3 text-red-400 text-xs">
                    <ShieldAlert className="h-5 w-5 shrink-0" />
                    <span>Sécurisation stricte contre l'exposition de données sensibles (endpoints API protégés).</span>
                  </div>
                </div>
              </div>

              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="lg:col-span-8 bg-white/[0.02] backdrop-blur-md border border-white/[0.06] p-3 rounded-2xl shadow-xl overflow-hidden group relative"
              >
                <div className="absolute top-3 left-3 bg-black/60 border border-white/10 px-2 py-0.5 rounded text-[10px] font-mono text-amber-400 z-10">
                  Role-Based Access Control Structure
                </div>
                <img
                  src={slide.content.diagram}
                  alt="RBAC Diagram"
                  className="rounded-xl w-full max-h-[350px] object-contain group-hover:scale-[1.02] transition-transform duration-500 bg-[#061417]"
                />
              </motion.div>
            </div>
          </div>
        )

      case 'screenshots':
        return (
          <div className="flex flex-col h-full max-w-6xl mx-auto px-4 justify-center">
            <div className="text-center mb-4">
              <h2 className="text-3xl md:text-4xl font-bold text-white font-serif mb-2">{slide.content.title}</h2>
              <p className="text-amber-100/60 text-sm">{slide.content.subtitle}</p>
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
              className="p-4 bg-amber-500/10 rounded-full border border-amber-500/30 text-amber-400 mb-6"
            >
              <Award className="h-10 w-10 animate-bounce" />
            </motion.div>

            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-2xl md:text-3xl font-bold text-white font-serif mb-4"
            >
              {slide.content.title}
            </motion.h2>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-xs md:text-sm text-teal-100/75 leading-relaxed font-light max-w-2xl mb-8"
            >
              {slide.content.text}
            </motion.p>

            <motion.h1
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, type: 'spring' }}
              className="text-4xl md:text-6xl font-black mb-10 text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-300 to-yellow-500 font-serif"
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
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 text-white font-medium hover:from-amber-600 hover:to-yellow-700 shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all hover:scale-105 active:scale-95"
              >
                <Sparkles className="h-5 w-5" />
                Confettis !
              </button>
              
              <Link
                to="/"
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-teal-100 font-medium hover:bg-white/10 transition-all hover:scale-105 active:scale-95"
              >
                <Home className="h-5 w-5 text-amber-400" />
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
    <div className="bg-[#02050a] text-white min-h-screen relative overflow-hidden font-sans flex flex-col justify-between selection:bg-amber-500/30 selection:text-amber-200">
      {/* Parallax Background Glowing Circles */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <motion.div
          animate={{ x: mousePos.x * 1.2, y: mousePos.y * 1.2 }}
          transition={{ type: 'spring', stiffness: 45, damping: 25 }}
          className="absolute -top-[10%] -left-[10%] w-[50vw] h-[50vw] rounded-full bg-amber-800/10 blur-[150px]"
        />
        <motion.div
          animate={{ x: -mousePos.x * 1.5, y: -mousePos.y * 1.5 }}
          transition={{ type: 'spring', stiffness: 45, damping: 25 }}
          className="absolute -bottom-[20%] -right-[10%] w-[60vw] h-[60vw] rounded-full bg-blue-900/10 blur-[180px]"
        />
        <div className="absolute top-[40%] left-[60%] w-[35vw] h-[35vw] rounded-full bg-amber-900/5 blur-[130px]" />
        
        {/* Subtle grid lines background overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      </div>

      {/* TOP HEADER CONTROLS */}
      <header className="relative z-20 w-full px-6 py-4 flex items-center justify-between border-b border-white/[0.04] bg-[#02050a]/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold font-serif">
            AE
          </div>
          <div>
            <h4 className="text-xs font-mono tracking-widest text-amber-400 uppercase">Artisan's Echo</h4>
            <h5 className="text-[10px] text-teal-100/50 uppercase tracking-wider font-light">PFE Presentation Slideshow</h5>
          </div>
        </div>

        {/* Quick Jump Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.06] transition text-sm font-mono text-amber-300"
          >
            <span>{currentSlide + 1}. {slide.title}</span>
            {isDropdownOpen ? <ChevronUp className="h-4 w-4 text-amber-400" /> : <ChevronDown className="h-4 w-4 text-amber-400" />}
          </button>

          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 mt-2 w-64 rounded-xl bg-[#070d14] border border-white/[0.08] shadow-2xl p-2 z-30 max-h-80 overflow-y-auto"
              >
                {SLIDES.map((s, idx) => (
                  <button
                    key={s.id}
                    onClick={() => jumpToSlide(idx)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono transition flex items-center justify-between ${
                      currentSlide === idx
                        ? 'bg-amber-500/20 text-amber-300 font-semibold'
                        : 'text-teal-100/70 hover:bg-white/5'
                    }`}
                  >
                    <span>{idx + 1}. {s.title.substring(3)}</span>
                    {currentSlide === idx && <Check className="h-3 w-3 text-amber-400" />}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* MAIN SLIDE CONTAINER */}
      <main className="relative z-10 flex-1 flex items-center justify-center py-6 w-full overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentSlide}
            custom={direction}
            variants={{
              enter: (dir: number) => ({
                x: dir > 0 ? 400 : -400,
                opacity: 0,
                scale: 0.96,
                rotateY: dir > 0 ? 10 : -10
              }),
              center: {
                x: 0,
                opacity: 1,
                scale: 1,
                rotateY: 0,
                transition: { type: 'spring', stiffness: 260, damping: 26 }
              },
              exit: (dir: number) => ({
                x: dir < 0 ? 400 : -400,
                opacity: 0,
                scale: 0.96,
                rotateY: dir < 0 ? 10 : -10,
                transition: { duration: 0.25 }
              })
            }}
            initial="enter"
            animate="center"
            exit="exit"
            className="w-full h-full flex items-center"
          >
            {renderSlideContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* BOTTOM NAVIGATION CONTROLS */}
      <footer className="relative z-20 w-full py-5 px-6 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-white/[0.04] bg-[#02050a]/80 backdrop-blur-md">
        {/* Helper keys */}
        <div className="hidden md:flex items-center gap-4 text-[10px] font-mono text-amber-100/40">
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
        <div className="flex items-center gap-6 bg-white/[0.03] backdrop-blur-lg border border-white/[0.08] px-6 py-2 rounded-full shadow-lg">
          <button
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className={`p-1.5 rounded-full transition ${
              currentSlide === 0
                ? 'text-teal-100/20 cursor-not-allowed'
                : 'text-amber-400 hover:bg-white/5'
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
                  currentSlide === idx ? 'w-5 bg-amber-400' : 'w-1.5 bg-teal-100/20 hover:bg-teal-100/40'
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
                : 'text-amber-400 hover:bg-white/5'
            }`}
          >
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>

        {/* Exit & Go Home */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-xs font-mono text-amber-400 hover:text-amber-300 bg-white/[0.02] border border-white/[0.05] hover:bg-white/5 px-4 py-2 rounded-xl transition"
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
                ? 'bg-amber-500/10 border-amber-500/40 text-white shadow-[0_0_15px_rgba(245,158,11,0.05)]'
                : 'bg-white/[0.01] border-white/[0.05] text-teal-100/60 hover:bg-white/[0.03]'
            }`}
          >
            <span className={`h-6 w-6 rounded-lg flex items-center justify-center font-mono text-xs ${
              activeIdx === idx ? 'bg-amber-500/20 text-amber-300' : 'bg-white/5 text-teal-100/40'
            }`}>
              {idx + 1}
            </span>
            <div className="text-left">
              <p className="text-sm font-semibold leading-tight font-serif">{screen.title}</p>
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
          💡 <span className="font-semibold text-amber-400 font-serif">{screens[activeIdx].title} :</span> {screens[activeIdx].desc}
        </p>
      </div>
    </div>
  )
}
