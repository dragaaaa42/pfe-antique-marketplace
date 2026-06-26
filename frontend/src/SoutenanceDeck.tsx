import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
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
  TrendingUp,
  FolderOpen
} from 'lucide-react'

// Import custom presentation CSS containing plaques, corners, watermarks, etc.
import './SoutenanceDeck.css'

// Import project diagrams and screenshots
import architectureImg from './assets/docs/architecture.png'
import rbacImg from './assets/docs/rbac.png'
import dbErImg from './assets/docs/db_er.png'
import homeImg from './assets/docs/home.png'
import adminDashboardImg from './assets/docs/admin_dashboard.png'
import sellerDashboardImg from './assets/docs/seller_dashboard.png'
import catalogueImg from './assets/docs/catalogue.png'
import messagesImg from './assets/docs/messages.png'
import collectorDashboardImg from './assets/docs/collector_dashboard.png'
import wishlistImg from './assets/docs/wishlist.png'
import cartImg from './assets/docs/cart.png'

// Reusable Filigree Corner Brackets Component
function FiligreeCorners({ colorClass = "border-[#c8d7ef]/20" }: { colorClass?: string }) {
  return (
    <>
      <div className={`corner-filigree corner-tl ${colorClass}`} />
      <div className={`corner-filigree corner-tr ${colorClass}`} />
      <div className={`corner-filigree corner-bl ${colorClass}`} />
      <div className={`corner-filigree corner-br ${colorClass}`} />
    </>
  )
}

export function SoutenanceDeck() {
  const navigate = useNavigate()
  const [currentSlide, setCurrentSlide] = useState(0)
  const [direction, setDirection] = useState(0)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Prevent vertical page scrolling globally during presentation
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

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
      title: "1. Page de Garde",
      type: "intro",
      content: {
        title: "Artisan's Echo",
        subtitle: "Plateforme Marketplace Premium d'Antiquités et d'Objets de Collection",
        tagline: "Projet de Fin d'Études — Option Développement Informatique",
        author: "AIT OUAHMAN OUISSAL",
        supervisor: "M. Ait Ben Hamou Khalid",
        institution: "Établissement Racine",
        year: "Année Académique : 2025/2026",
        highlights: ["React & TypeScript", "Django REST Framework", "Role-Based Access Control", "Dual Database & Multi-image"]
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
        title: "Contexte du Projet",
        subtitle: "L'évolution des antiquités et objets de collection vers le numérique",
        cards: [
          {
            title: "Marché de Niche Unique",
            description: "Les antiquités exigent une identification précise (époque, provenance, état) et une valorisation qui diffèrent des produits génériques de masse.",
            icon: Sparkles,
            metric: "Transactions de forte valeur",
            step: "01"
          },
          {
            title: "Transition Digitale",
            description: "Les brocantes traditionnelles s'étendent en ligne, exigeant des galeries virtuelles interactives et sécurisées pour rassurer les passionnés.",
            icon: Monitor,
            metric: "Fiche produit détaillée",
            step: "02"
          },
          {
            title: "Relation de Confiance",
            description: "L'acheteur doit être assuré de la provenance et de l'authenticité d'un artefact avant d'engager une transaction.",
            icon: ShieldAlert,
            metric: "Curation & Sécurité",
            step: "03"
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
            color: "from-blue-500/10 to-transparent",
            border: "border-blue-500/20"
          },
          {
            title: "Interfaces Standards Obsolètes",
            description: "Les objets précieux méritent d'être présentés avec une identité visuelle immersive (style galerie d'art, supports d'images multiples, 3D).",
            icon: Layout,
            color: "from-blue-600/15 to-transparent",
            border: "border-blue-400/20"
          },
          {
            title: "Confusion des Outils",
            description: "Les acteurs ont besoin d'espaces hermétiques : les vendeurs gèrent un stock unique, les acheteurs suivent des coups de cœur, l'admin surveille le tout.",
            icon: Users,
            color: "from-blue-700/10 to-transparent",
            border: "border-[#c8d7ef]/20"
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
            icon: Heart,
            shapeClass: "rounded-tl-[3.5rem] rounded-br-[3.5rem]",
            align: "left"
          },
          {
            name: "Vendeur / Brocanteur",
            role: "Marchand d'Artéfacts",
            desc: "Publie ses créations et antiquités (état brouillon/soumis), suit ses ventes, expédie et change le statut des commandes associées à sa galerie.",
            icon: TrendingUp,
            shapeClass: "rounded-tr-[3.5rem] rounded-bl-[3.5rem]",
            align: "top"
          },
          {
            name: "Administrateur / Curateur",
            role: "Gestionnaire de la Marketplace",
            desc: "Modère les artefacts soumis (Approuver/Rejeter), active ou désactive les comptes utilisateurs, et consulte le journal d'audit des actions critiques.",
            icon: Award,
            shapeClass: "rounded-[2rem]",
            align: "right"
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
      title: "11. Démo : Portail Public & Catalogue",
      type: "screenshots_public",
      content: {
        title: "Démonstration : Portail Public & Catalogue",
        subtitle: "Interfaces d'accueil et catalogue interactif d'Artisan's Echo",
        screens: [
          { title: "Page d'Accueil", img: homeImg, desc: "Portail d'accueil avec une hero video immersive, et des rubriques de decouvertes d'objets anciens." },
          { title: "Catalogue des Objets", img: catalogueImg, desc: "Catalogue interactif avec tris, filtres par categories et indicateurs d'etat de conservation." }
        ]
      }
    },
    {
      id: 11,
      title: "12. Démo : Espace Vendeur",
      type: "screenshots_public",
      content: {
        title: "Démonstration : Espace Vendeur",
        subtitle: "Workspace d'activité et de gestion pour le vendeur",
        screens: [
          { title: "Dashboard Vendeur", img: sellerDashboardImg, desc: "Outils de suivi des gains, d'expédition de commandes et d'inventaire d'artefacts." }
        ]
      }
    },
    {
      id: 12,
      title: "13. Démo : Messagerie & Négociations",
      type: "screenshots_public",
      content: {
        title: "Démonstration : Messagerie & Négociations",
        subtitle: "Messagerie filaire sécurisée reliant directement acheteurs et vendeurs autour d'un objet",
        screens: [
          { title: "Messagerie Interne", img: messagesImg, desc: "Fil de discussion direct entre acheteur et vendeur pour négocier le prix et valider les détails." }
        ]
      }
    },
    {
      id: 13,
      title: "14. Démo : Espace Collectionneur",
      type: "screenshots_public",
      content: {
        title: "Démonstration : Espace Collectionneur",
        subtitle: "Espace personnel du collectionneur, liste de souhaits et panier d'achat",
        screens: [
          { title: "Dashboard Collectionneur", img: collectorDashboardImg, desc: "Suivi des commandes passées, des articles achetés et de l'état de livraison." },
          { title: "Liste de Souhaits", img: wishlistImg, desc: "Liste de favoris (wishlist) pour conserver et suivre ses coups de cœur." },
          { title: "Panier d'Achat", img: cartImg, desc: "Panier d'achat réactif pour regrouper ses objets précieux avant la validation de commande." }
        ]
      }
    },
    {
      id: 14,
      title: "15. Démo : Espace Administration",
      type: "screenshots_public",
      content: {
        title: "Démonstration : Espace Administration",
        subtitle: "Workspace d'administration et de curation de la marketplace",
        screens: [
          { title: "Dashboard Administration", img: adminDashboardImg, desc: "Espace central pour approuver/rejeter les artefacts et gérer les utilisateurs et rôles." }
        ]
      }
    },
    {
      id: 15,
      title: "16. Bilan & Perspectives",
      type: "synthesis",
      content: {
        title: "Bilan du Projet & Perspectives",
        subtitle: "Synthèse professionnelle pour le jury de soutenance",
        metrics: [
          { value: "4", label: "Espaces Dashboards distincts" },
          { value: "19", label: "Scénarios de tests validés" },
          { value: "08", label: "Entités de base de données" },
          { value: "24+", label: "Fiches produits pré-chargées" }
        ],
        points: [
          "Mise en œuvre réussie d'une solution découplée React & Django REST",
          "Gestion intègre du cycle de vie des produits de la soumission à la vente",
          "Perspectives : Intégration de Stripe, Réalité Augmentée 3D et Analyse d'images IA",
          "Clôture : Artisan's Echo est prêt pour le déploiement opérationnel."
        ]
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

  const slide = SLIDES[currentSlide]

  // Slide content render helpers
  const renderSlideContent = () => {
    switch (slide.type) {
      case 'intro':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center max-w-[1400px] mx-auto px-8 w-full py-8">
            {/* Left Huge Frame Cover */}
            <div className="lg:col-span-8 flex flex-col justify-center text-left">
              <div className="bg-[#5f70ff]/10 border border-[#5f70ff]/30 px-6 py-2.5 rounded-full text-xs font-mono tracking-widest text-[#7d8bff] mb-8 uppercase inline-block w-fit">
                {slide.content.tagline}
              </div>
              
              <div className="cover-frame border-2 border-[#e5c590]/40 p-14 rounded-3xl relative overflow-hidden shadow-2xl mb-8">
                <FiligreeCorners colorClass="border-[#e5c590]/65 w-7 h-7" />

                <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white via-[#c8d7ef] to-[#e5c590] font-serif leading-tight">
                  {slide.content.title}
                </h1>

                <p className="text-xl md:text-2xl lg:text-3xl text-teal-100/70 font-light leading-relaxed">
                  {slide.content.subtitle}
                </p>
              </div>
            </div>

            {/* Right side Metadata plaques */}
            <div className="lg:col-span-4 space-y-8">
              <div className="metal-plaque p-10 rounded-3xl relative overflow-hidden shadow-xl">
                <FiligreeCorners colorClass="border-[#c8d7ef]/25" />
                <span className="text-xs uppercase font-mono text-[#7d8bff] tracking-wider font-semibold">Réalisé par :</span>
                <p className="text-3xl font-bold text-white mt-2 font-serif">{slide.content.author}</p>
                <p className="text-sm text-teal-100/60 mt-1 font-mono">Filière Développement Informatique</p>
              </div>

              <div className="metal-plaque p-10 rounded-3xl relative overflow-hidden shadow-xl">
                <FiligreeCorners colorClass="border-[#c8d7ef]/25" />
                <span className="text-xs uppercase font-mono text-[#7d8bff] tracking-wider font-semibold">Encadré par :</span>
                <p className="text-3xl font-bold text-white mt-2 font-serif">{slide.content.supervisor}</p>
                <p className="text-sm text-teal-100/60 mt-1 font-mono">{slide.content.institution}</p>
              </div>

              <div className="flex flex-wrap gap-3 justify-start pt-2">
                {slide.content.highlights.map((h, i) => (
                  <span key={i} className="px-4 py-2 bg-[#5f70ff]/10 border border-[#5f70ff]/20 rounded-full text-xs md:text-sm font-mono text-[#c8d7ef]">
                    #{h}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )

      case 'thanks_intro':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center max-w-[1400px] mx-auto px-8 w-full py-8">
            {/* Left Big Dedication Plaque */}
            <div className="lg:col-span-4 flex flex-col pr-4">
              <h2 className="text-5xl lg:text-6xl font-bold text-white font-serif mb-6 leading-tight">{slide.content.title}</h2>
              <div className="h-1.5 w-28 bg-[#5f70ff] rounded-full mb-6" />
              <p className="text-[#c8d7ef] text-base md:text-lg font-mono leading-relaxed">{slide.content.subtitle}</p>
              
              <div className="mt-10 p-8 bg-white/[0.01] border border-white/[0.04] rounded-2xl text-xs md:text-sm font-mono text-teal-100/40 leading-relaxed">
                ⚖️ "Le savoir et la reconnaissance sont les piliers de toute création durable."
              </div>
            </div>

            {/* Right Paragraph flow */}
            <div className="lg:col-span-8 metal-plaque p-12 rounded-3xl relative overflow-hidden">
              <FiligreeCorners colorClass="border-[#c8d7ef]/25" />
              <div className="space-y-8">
                {slide.content.paragraphs.map((p, idx) => (
                  <div key={idx}>
                    <p className="text-lg md:text-xl lg:text-2xl text-teal-100/90 leading-relaxed font-light first-letter:text-3xl first-letter:font-bold first-letter:text-[#e5c590] first-letter:font-serif">
                      {p}
                    </p>
                    {idx < slide.content.paragraphs.length - 1 && (
                      <div className="antique-separator">
                        <div className="separator-diamond" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case 'creative_cards':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 max-w-[1400px] mx-auto px-8 w-full py-8">
            {/* Left Header info */}
            <div className="lg:col-span-3 flex flex-col justify-center">
              <h2 className="text-4xl lg:text-5xl font-bold text-white font-serif mb-6 leading-tight">{slide.content.title}</h2>
              <div className="h-1.5 w-20 bg-[#5f70ff] rounded-full mb-6" />
              <p className="text-teal-100/70 text-base lg:text-lg leading-relaxed">{slide.content.subtitle}</p>
              
              <div className="mt-8 border-l-2 border-[#e5c590]/35 pl-4 py-2 font-mono text-xs md:text-sm text-[#e5c590]">
                Antiquités & Brocante
              </div>
            </div>

            {/* Right horizontal timeline steps */}
            <div className="lg:col-span-9 space-y-8 relative pl-10 border-l-2 border-[#5f70ff]/20">
              {slide.content.cards.map((card, idx) => {
                const IconComponent = card.icon
                return (
                  <motion.div
                    key={idx}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: idx * 0.1, duration: 0.5 }}
                    className="metal-plaque p-8 rounded-3xl flex items-center justify-between gap-8 shadow-xl relative overflow-hidden group timeline-dot"
                  >
                    <FiligreeCorners colorClass="border-[#c8d7ef]/20" />
                    
                    <div className="flex items-center gap-8">
                      <div className="p-4 bg-[#5f70ff]/10 rounded-2xl text-[#7d8bff] border border-[#5f70ff]/20 shrink-0">
                        <IconComponent className="h-7 w-7" />
                      </div>
                      <div>
                        <h3 className="text-xl lg:text-2xl font-bold text-white font-serif flex items-center gap-3">
                          <span className="text-sm font-mono text-[#e5c590]">{card.step}.</span>
                          {card.title}
                        </h3>
                        <p className="text-teal-100/80 text-base font-light mt-2 max-w-2xl">{card.description}</p>
                      </div>
                    </div>

                    <div className="text-right shrink-0 hidden sm:block">
                      <span className="text-xs font-mono text-[#e5c590] bg-[#e5c590]/10 px-4 py-1.5 rounded-full tracking-wider border border-[#e5c590]/20">
                        {card.metric}
                      </span>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        )

      case 'bento':
        return (
          <div className="flex flex-col max-w-[1400px] mx-auto px-8 w-full h-full justify-center py-6">
            <div className="text-center mb-10">
              <h2 className="text-4xl lg:text-5xl font-bold text-white font-serif mb-4">{slide.content.title}</h2>
              <p className="text-teal-100/60 text-lg">{slide.content.subtitle}</p>
            </div>
            
            {/* Asymmetrical Bento Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              {slide.content.cards.map((card, idx) => {
                const IconComponent = card.icon
                const gridSpan = idx === 0 ? "lg:col-span-8" : idx === 1 ? "lg:col-span-4" : "lg:col-span-12"
                return (
                  <motion.div
                    key={idx}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: idx * 0.1, duration: 0.5 }}
                    className={`metal-plaque plaque-cracked p-10 rounded-3xl flex flex-col items-start shadow-2xl relative overflow-hidden group ${gridSpan}`}
                  >
                    <FiligreeCorners colorClass="border-blue-400/25" />

                    <div className="p-4 bg-[#5f70ff]/10 rounded-2xl mb-6 text-[#7d8bff] border border-[#5f70ff]/20">
                      <IconComponent className="h-8 w-8" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3 font-serif">{card.title}</h3>
                    <p className="text-teal-100/75 text-base md:text-lg leading-relaxed font-light">{card.description}</p>
                  </motion.div>
                )
              })}
            </div>
          </div>
        )

      case 'features':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 max-w-[1400px] mx-auto px-8 w-full py-8">
            {/* Left side Large Objective Highlight Plaque */}
            <div className="lg:col-span-4 flex flex-col">
              <div className="metal-plaque plaque-objective p-10 rounded-3xl relative overflow-hidden h-full flex flex-col justify-between">
                <FiligreeCorners colorClass="border-[#e5c590]/35" />
                <div>
                  <h2 className="text-4xl font-bold text-white font-serif mb-6 leading-tight">{slide.content.title}</h2>
                  <div className="h-1.5 w-20 bg-[#5f70ff] rounded-full mb-6" />
                  <p className="text-teal-100/70 text-base md:text-lg leading-relaxed">{slide.content.subtitle}</p>
                </div>
                <div className="mt-10 text-xs md:text-sm font-mono text-[#e5c590] tracking-widest border-t border-white/5 pt-6">
                  VALEUR AJOUTÉE
                </div>
              </div>
            </div>

            {/* Right side Detail List checkmarks */}
            <div className="lg:col-span-8 space-y-8">
              {slide.content.columns.map((col, idx) => (
                <motion.div
                  key={idx}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: idx * 0.15, duration: 0.5 }}
                  className="metal-plaque p-8 rounded-3xl relative overflow-hidden"
                >
                  <FiligreeCorners colorClass="border-[#c8d7ef]/25" />
                  <h3 className="text-xl lg:text-2xl font-bold text-[#7d8bff] mb-6 flex items-center gap-3 font-serif border-b border-white/[0.04] pb-3">
                    <CheckCircle2 className="h-6 w-6 text-[#5f70ff]" />
                    {col.title}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {col.items.map((item, itemIdx) => (
                      <div key={itemIdx} className="flex items-start gap-4 text-sm md:text-base">
                        <span className="p-0.5 rounded-full bg-[#5f70ff]/10 text-[#7d8bff] border border-[#5f70ff]/20 mt-0.5 shrink-0">
                          <Check className="h-4 w-4" />
                        </span>
                        <span className="text-teal-100/80 leading-relaxed font-light">{item}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )

      case 'actors':
        return (
          <div className="flex flex-col max-w-[1400px] mx-auto px-8 w-full h-full justify-center py-6">
            <div className="text-center mb-10">
              <h2 className="text-4xl lg:text-5xl font-bold text-white font-serif mb-4">{slide.content.title}</h2>
              <p className="text-teal-100/60 text-lg md:text-xl">{slide.content.subtitle}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {slide.content.actors.map((actor, idx) => {
                const IconComponent = actor.icon
                const cardLayout = 
                  actor.align === "left" 
                    ? "items-start text-left" 
                    : actor.align === "right" 
                      ? "items-end text-right" 
                      : "items-center text-center"
                      
                return (
                  <motion.div
                    key={idx}
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: idx * 0.1, duration: 0.5 }}
                    className={`metal-plaque p-10 flex flex-col justify-between min-h-[360px] relative overflow-hidden group ${actor.shapeClass} ${cardLayout}`}
                  >
                    <FiligreeCorners colorClass="border-[#c8d7ef]/25" />

                    <div className="p-4 bg-[#5f70ff]/10 rounded-2xl mb-6 text-[#7d8bff] group-hover:bg-[#5f70ff]/20 transition-all border border-[#5f70ff]/20 inline-block w-fit">
                      <IconComponent className="h-8 w-8" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2 font-serif">{actor.name}</h3>
                      <span className="text-xs md:text-sm font-mono text-[#e5c590] mb-4 block uppercase tracking-wider font-semibold">{actor.role}</span>
                      <p className="text-teal-100/75 text-sm md:text-base leading-relaxed font-light">{actor.desc}</p>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        )

      case 'usecase':
        return (
          <div className="flex flex-col max-w-[1400px] mx-auto px-8 w-full h-full justify-center py-6">
            <div className="text-center mb-10">
              <h2 className="text-4xl lg:text-5xl font-bold text-white font-serif mb-4">{slide.content.title}</h2>
              <p className="text-teal-100/60 text-lg md:text-xl">{slide.content.subtitle}</p>
            </div>

            {/* Split Process Flow layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {slide.content.columns.map((col, idx) => (
                <motion.div
                  key={idx}
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: idx * 0.15, duration: 0.5 }}
                  className="metal-plaque p-10 rounded-3xl flex flex-col relative overflow-hidden"
                >
                  <FiligreeCorners colorClass="border-[#c8d7ef]/25" />

                  <h3 className="text-2xl font-bold text-[#7d8bff] mb-8 border-b border-[#c8d7ef]/10 pb-4 flex items-center gap-3 font-serif">
                    <CheckCircle2 className="h-6 w-6" />
                    {col.title}
                  </h3>
                  <ul className="space-y-5 flex-1">
                    {col.items.map((item, itemIdx) => (
                      <li key={itemIdx} className="flex items-start gap-4 text-sm md:text-base">
                        <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-[#5f70ff]/10 text-sm font-mono font-bold text-[#7d8bff] border border-[#5f70ff]/20 shrink-0">
                          {String(itemIdx + 1).padStart(2, '0')}
                        </span>
                        <span className="text-teal-100/80 leading-relaxed font-light mt-0.5">{item}</span>
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
          <div className="flex flex-col max-w-[1400px] mx-auto px-8 w-full h-full justify-center py-6">
            <div className="text-center mb-8">
              <h2 className="text-4xl lg:text-5xl font-bold text-white font-serif mb-2">{slide.content.title}</h2>
              <p className="text-teal-100/60 text-base md:text-lg">{slide.content.subtitle}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Details */}
              <div className="lg:col-span-4 space-y-6">
                {slide.content.details.map((detail, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ x: -30, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: idx * 0.1, duration: 0.5 }}
                    className="metal-plaque p-6 rounded-2xl relative overflow-hidden"
                  >
                    <FiligreeCorners colorClass="border-[#c8d7ef]/15" />

                    <div className="flex items-center gap-2 mb-2">
                      <span className="h-2 w-2 rounded-full bg-[#5f70ff] shadow-[0_0_8px_rgba(95,112,255,1)]" />
                      <h3 className="font-bold text-white text-lg font-serif">{detail.label}</h3>
                    </div>
                    <p className="text-xs md:text-sm font-mono text-[#7d8bff] mb-2">{detail.tech}</p>
                    <p className="text-xs md:text-sm text-teal-100/70 leading-relaxed font-light">{detail.desc}</p>
                  </motion.div>
                ))}
              </div>

              {/* Right Architecture Diagram (Etched on Glass Plate - Enormous display) */}
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="lg:col-span-8 diagram-glass-plate p-5 rounded-3xl overflow-hidden group relative"
              >
                <FiligreeCorners colorClass="border-[#e5c590]/45 w-6 h-6" />

                <div className="absolute top-4 left-4 bg-black/60 border border-white/10 px-3 py-1 rounded-lg text-[11px] font-mono text-[#7d8bff] z-10">
                  Client-Server System Design
                </div>
                <img
                  src={slide.content.diagram}
                  alt="Architecture Diagram"
                  className="rounded-2xl w-full h-[52vh] max-h-[480px] object-contain group-hover:scale-[1.01] transition-transform duration-500 bg-[#061417] p-2 border border-white/5"
                />
              </motion.div>
            </div>
          </div>
        )

      case 'data_model':
        return (
          <div className="flex flex-col max-w-[1400px] mx-auto px-8 w-full h-full justify-center py-6">
            <div className="text-center mb-8">
              <h2 className="text-4xl lg:text-5xl font-bold text-white font-serif mb-2">{slide.content.title}</h2>
              <p className="text-teal-100/60 text-base md:text-lg">{slide.content.subtitle}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              {/* Left Side brief text */}
              <div className="lg:col-span-3 flex flex-col justify-center">
                <div className="metal-plaque p-8 rounded-3xl relative overflow-hidden h-full flex flex-col justify-center">
                  <FiligreeCorners colorClass="border-[#c8d7ef]/20" />
                  <h3 className="text-[#7d8bff] text-xl font-bold mb-4 font-serif">Structure SQL</h3>
                  <p className="text-teal-100/75 text-sm md:text-base leading-relaxed font-light">
                    {slide.content.text}
                  </p>
                </div>
              </div>

              {/* Right BDD ERD Diagram */}
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="lg:col-span-9 diagram-glass-plate p-5 rounded-3xl overflow-hidden group relative flex items-center justify-center"
              >
                <FiligreeCorners colorClass="border-[#e5c590]/45 w-6 h-6" />

                <div className="absolute top-4 left-4 bg-black/60 border border-white/10 px-3 py-1 rounded-lg text-[11px] font-mono text-[#7d8bff] z-10">
                  UML Entity Relationship Diagram
                </div>
                <img
                  src={slide.content.diagram}
                  alt="Database ER Diagram"
                  className="rounded-2xl w-full h-[52vh] max-h-[480px] object-contain group-hover:scale-[1.01] transition-transform duration-500 bg-[#061417] p-2 border border-white/5"
                />
              </motion.div>
            </div>
          </div>
        )

      case 'rbac_slide':
        return (
          <div className="flex flex-col max-w-[1400px] mx-auto px-8 w-full h-full justify-center py-6">
            <div className="text-center mb-8">
              <h2 className="text-4xl lg:text-5xl font-bold text-white font-serif mb-2">{slide.content.title}</h2>
              <p className="text-teal-100/60 text-base md:text-lg">{slide.content.subtitle}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              {/* Left Side brief text */}
              <div className="lg:col-span-3 flex flex-col justify-center">
                <div className="metal-plaque p-8 rounded-3xl relative overflow-hidden h-full flex flex-col justify-center">
                  <FiligreeCorners colorClass="border-[#c8d7ef]/20" />
                  <h3 className="text-[#7d8bff] text-xl font-bold mb-4 font-serif">Contrôle RBAC</h3>
                  <p className="text-teal-100/75 text-sm md:text-base leading-relaxed font-light mb-6">
                    {slide.content.text}
                  </p>
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex gap-3 text-red-400 text-xs md:text-sm leading-relaxed">
                    <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5" />
                    <span>JWT token encryption security.</span>
                  </div>
                </div>
              </div>

              {/* Right RBAC matrix */}
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="lg:col-span-9 diagram-glass-plate p-5 rounded-3xl overflow-hidden group relative flex items-center justify-center"
              >
                <FiligreeCorners colorClass="border-[#e5c590]/45 w-6 h-6" />

                <div className="absolute top-4 left-4 bg-black/60 border border-white/10 px-3 py-1 rounded-lg text-[11px] font-mono text-[#7d8bff] z-10">
                  RBAC Permission Matrix
                </div>
                <img
                  src={slide.content.diagram}
                  alt="RBAC Diagram"
                  className="rounded-2xl w-full h-[52vh] max-h-[480px] object-contain group-hover:scale-[1.01] transition-transform duration-500 bg-[#061417] p-2 border border-white/5"
                />
              </motion.div>
            </div>
          </div>
        )

      case 'screenshots_public':
        return (
          <div className="flex flex-col max-w-[1400px] mx-auto px-8 w-full h-full justify-center py-6">
            <div className="text-center mb-6">
              <h2 className="text-4xl lg:text-5xl font-bold text-white font-serif mb-2">{slide.content.title}</h2>
              <p className="text-teal-100/60 text-base md:text-lg">{slide.content.subtitle}</p>
            </div>

            <ScreenshotShowcase screens={slide.content.screens} slideId={slide.id} />
          </div>
        )

      case 'screenshots_pro':
        return (
          <div className="flex flex-col max-w-[1400px] mx-auto px-8 w-full h-full justify-center py-6">
            <div className="text-center mb-6">
              <h2 className="text-4xl lg:text-5xl font-bold text-white font-serif mb-2">{slide.content.title}</h2>
              <p className="text-teal-100/60 text-base md:text-lg">{slide.content.subtitle}</p>
            </div>

            <ScreenshotShowcase screens={slide.content.screens} slideId={slide.id} />
          </div>
        )

      case 'synthesis':
        return (
          <div className="flex flex-col max-w-[1400px] mx-auto px-8 w-full h-full justify-center py-6">
            <div className="text-center mb-8">
              <h2 className="text-4xl lg:text-5xl font-bold text-white font-serif mb-2">{slide.content.title}</h2>
              <p className="text-teal-100/60 text-base md:text-lg">{slide.content.subtitle}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              {/* Left Quantitative Metrics */}
              <div className="lg:col-span-5 grid grid-cols-2 gap-6">
                {slide.content.metrics.map((metric, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: idx * 0.1, duration: 0.4 }}
                    className="metal-plaque p-8 rounded-3xl flex flex-col justify-center text-center shadow-xl relative overflow-hidden"
                  >
                    <FiligreeCorners colorClass="border-[#c8d7ef]/20" />
                    <span className="text-5xl md:text-6xl font-black text-[#e5c590] mb-3 font-serif leading-none">{metric.value}</span>
                    <span className="text-xs md:text-sm text-teal-100/60 leading-tight font-mono font-semibold">{metric.label}</span>
                  </motion.div>
                ))}
              </div>

              {/* Right Key Points & Conclusion */}
              <motion.div
                initial={{ x: 30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="lg:col-span-7 metal-plaque p-10 rounded-3xl flex flex-col justify-between shadow-xl relative overflow-hidden"
              >
                <FiligreeCorners colorClass="border-[#c8d7ef]/25" />

                <div>
                  <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3 font-serif">
                    <Award className="h-6 w-6 text-[#5f70ff]" />
                    Synthèse & Perspectives de Fin d'Études
                  </h3>
                  <ul className="space-y-5">
                    {slide.content.points.map((pt, pIdx) => (
                      <li key={pIdx} className="flex items-start gap-4 text-sm md:text-base">
                        <span className="p-0.5 rounded-full bg-[#5f70ff]/15 text-[#7d8bff] border border-[#5f70ff]/20 mt-0.5 shrink-0">
                          <Check className="h-4 w-4" />
                        </span>
                        <span className="text-teal-100/85 leading-relaxed font-light">{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border-t border-[#c8d7ef]/10 pt-8 mt-10 flex flex-col sm:flex-row items-center justify-between gap-6">
                  <span className="text-2xl md:text-3xl font-semibold text-[#e5c590] font-serif">Merci pour votre attention !</span>
                  <div className="flex gap-4">
                    <button
                      onClick={() => prevSlide()}
                      className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-teal-100 font-medium hover:bg-white/10 transition-all hover:scale-105 active:scale-95 text-xs font-mono"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Précédent
                    </button>
                    <Link
                      to="/"
                      className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#5f70ff] hover:bg-[#4255da] text-white font-medium shadow-[0_0_20px_rgba(95,112,255,0.35)] transition-all hover:scale-105 active:scale-95 text-sm font-mono"
                    >
                      <Home className="h-4 w-4" />
                      Exit to Shop
                    </Link>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="bg-[#0b0e1a] text-white min-h-screen relative overflow-hidden font-sans flex flex-col justify-between selection:bg-[#5f70ff]/30 selection:text-[#c8d7ef]">
      {/* Background Celestial Watermark Line Drawing */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <svg
          className="absolute top-[10%] left-[10%] w-[80vw] h-[80vw] text-[#5f70ff]/3 opacity-[0.02] faint-compass"
          viewBox="0 0 200 200"
          fill="none"
          stroke="currentColor"
        >
          <circle cx="100" cy="100" r="90" strokeWidth="0.5" />
          <circle cx="100" cy="100" r="70" strokeWidth="0.5" strokeDasharray="2 2" />
          <circle cx="100" cy="100" r="50" strokeWidth="0.3" />
          <line x1="100" y1="5" x2="100" y2="195" strokeWidth="0.5" />
          <line x1="5" y1="100" x2="195" y2="100" strokeWidth="0.5" />
          <line x1="33" y1="33" x2="167" y2="167" strokeWidth="0.3" strokeDasharray="1 3" />
          <line x1="33" y1="167" x2="167" y2="33" strokeWidth="0.3" strokeDasharray="1 3" />
          <polygon points="100,50 106,100 100,150 94,100" strokeWidth="0.4" />
          <polygon points="50,100 100,106 150,100 100,94" strokeWidth="0.4" />
        </svg>

        {/* Ambient background blur circles */}
        <motion.div
          animate={{ x: mousePos.x * 1.1, y: mousePos.y * 1.1 }}
          transition={{ type: 'spring', stiffness: 50, damping: 25 }}
          className="absolute -top-[10%] -left-[10%] w-[50vw] h-[50vw] rounded-full bg-[#18366f]/10 blur-[150px]"
        />
        <motion.div
          animate={{ x: -mousePos.x * 1.4, y: -mousePos.y * 1.4 }}
          transition={{ type: 'spring', stiffness: 50, damping: 25 }}
          className="absolute -bottom-[20%] -right-[10%] w-[60vw] h-[60vw] rounded-full bg-[#5f70ff]/5 blur-[180px]"
        />
        <div className="absolute top-[40%] left-[60%] w-[35vw] h-[35vw] rounded-full bg-[#e5c590]/3 blur-[140px]" />
        
        {/* Fine dotted line grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.004)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.004)_1px,transparent_1px)] bg-[size:3.5rem_3.5rem]" />
      </div>

      {/* TOP HEADER CONTROLS */}
      <header className="relative z-20 w-full px-6 py-4 flex items-center justify-between border-b border-[#c8d7ef]/10 bg-[#0b0e1a]/85 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-[#5f70ff]/10 border border-[#5f70ff]/30 flex items-center justify-center text-[#7d8bff] font-bold font-serif">
            AE
          </div>
          <div>
            <h4 className="text-xs font-mono tracking-widest text-[#7d8bff] uppercase">Artisan's Echo</h4>
            <h5 className="text-[10px] text-teal-100/50 uppercase tracking-wider font-light">PFE Presentation Slideshow</h5>
          </div>
        </div>

        {/* Quick Jump Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.02] border border-white/[0.08] hover:bg-white/[0.04] transition text-sm font-mono text-[#c8d7ef]"
          >
            <span>{currentSlide + 1}. {slide.title}</span>
            {isDropdownOpen ? <ChevronUp className="h-4 w-4 text-[#5f70ff]" /> : <ChevronDown className="h-4 w-4 text-[#5f70ff]" />}
          </button>

          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 mt-2 w-64 rounded-xl bg-[#0f1426] border border-[#c8d7ef]/20 shadow-2xl p-2 z-30 max-h-80 overflow-y-auto"
              >
                {SLIDES.map((s, idx) => (
                  <button
                    key={s.id}
                    onClick={() => jumpToSlide(idx)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono transition flex items-center justify-between ${
                      currentSlide === idx
                        ? 'bg-[#5f70ff]/20 text-[#7d8bff] font-semibold'
                        : 'text-teal-100/70 hover:bg-white/5'
                    }`}
                  >
                    <span>{idx + 1}. {s.title.substring(3)}</span>
                    {currentSlide === idx && <Check className="h-3 w-3 text-[#5f70ff]" />}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* MAIN SLIDE CONTAINER */}
      <main className="relative z-10 flex-1 flex items-center justify-center py-10 w-full overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            variants={{
              enter: {
                opacity: 0,
                y: 25,
                scale: 0.985
              },
              center: {
                opacity: 1,
                y: 0,
                scale: 1,
                transition: { type: 'spring', stiffness: 200, damping: 20 }
              },
              exit: {
                opacity: 0,
                y: -25,
                scale: 0.985,
                transition: { duration: 0.22 }
              }
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

      {/* BOTTOM NAVIGATION CONTROLS (Hidden on the final synthesis slide) */}
      {currentSlide < SLIDES.length - 1 && (
        <footer className="relative z-20 w-full py-5 px-6 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-[#c8d7ef]/10 bg-[#0b0e1a]/85 backdrop-blur-md">
          {/* Helper keys */}
          <div className="hidden md:flex items-center gap-4 text-[10px] font-mono text-[#7d8bff]/40">
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
          <div className="flex items-center gap-6 bg-[#0f1426]/50 backdrop-blur-lg border border-[#c8d7ef]/20 px-6 py-2.5 rounded-full shadow-lg">
            <button
              onClick={prevSlide}
              disabled={currentSlide === 0}
              className={`p-1.5 rounded-full transition ${
                currentSlide === 0
                  ? 'text-teal-100/20 cursor-not-allowed'
                  : 'text-[#7d8bff] hover:bg-white/5'
              }`}
            >
              <ArrowLeft className="h-5 w-5" />
            </button>

            {/* Dots Indicator */}
            <div className="flex items-center gap-2.5">
              {SLIDES.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => jumpToSlide(idx)}
                  className={`h-2.5 rounded-full transition-all ${
                    currentSlide === idx ? 'w-5 bg-[#5f70ff]' : 'w-2 bg-teal-100/20 hover:bg-teal-100/40'
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
                  : 'text-[#7d8bff] hover:bg-white/5'
              }`}
            >
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>

          {/* Exit & Go Home */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-xs font-mono text-[#7d8bff] hover:text-[#5f70ff] bg-[#0f1426]/40 border border-[#c8d7ef]/20 hover:bg-white/5 px-4 py-2 rounded-xl transition"
          >
            <Home className="h-3.5 w-3.5" />
            <span>Exit to Shop</span>
          </button>
        </footer>
      )}
    </div>
  )
}

// Subcomponent for screenshot gallery slide to avoid big blocks
function ScreenshotShowcase({ screens, slideId }: { screens: Array<{ title: string; img: string; desc: string }>; slideId: number }) {
  const [activeIdx, setActiveIdx] = useState(0)

  useEffect(() => {
    setActiveIdx(0)
  }, [slideId])

  const hasMultiple = screens.length > 1

  return (
    <div className="w-full max-w-[1400px] mx-auto px-8 mt-2">
      {hasMultiple ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Menu Selection (Takes 3 columns) */}
          <div className="lg:col-span-3 space-y-4 flex flex-col justify-center">
            {screens.map((screen, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIdx(idx)}
                className={`w-full text-left p-5 rounded-2xl border transition-all flex items-center gap-4 ${
                  activeIdx === idx
                    ? 'bg-[#5f70ff]/10 border-[#5f70ff] text-white shadow-[0_0_15px_rgba(95,112,255,0.08)]'
                    : 'bg-[#0f1426]/60 border-[#c8d7ef]/15 text-teal-100/60 hover:bg-white/[0.03]'
                }`}
              >
                <span className={`h-8 w-8 rounded-xl flex items-center justify-center font-mono text-sm ${
                  activeIdx === idx ? 'bg-[#5f70ff]/25 text-[#7d8bff]' : 'bg-white/5 text-teal-100/40'
                }`}>
                  {idx + 1}
                </span>
                <div className="text-left">
                  <p className="text-base md:text-lg font-semibold leading-tight font-serif">{screen.title}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Right Browser Chrome replica image view (Takes 9 columns) */}
          <div className="lg:col-span-9 flex flex-col browser-frame">
            {/* Browser Mock Header */}
            <div className="browser-header">
              <div className="browser-dots">
                <span className="browser-dot red" />
                <span className="browser-dot yellow" />
                <span className="browser-dot green" />
              </div>
              <div className="browser-address">
                localhost:5173/artifacts/showcase
              </div>
              <div className="w-16" />
            </div>

            {/* Screenshot Viewport (Enlarged) */}
            <div className="relative overflow-hidden h-[48vh] max-h-[440px] bg-[#0b0e1a]">
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeIdx}
                  src={screens[activeIdx].img}
                  alt={screens[activeIdx].title}
                  initial={{ opacity: 0, scale: 0.995 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.995 }}
                  transition={{ duration: 0.25 }}
                  className="w-full h-full object-cover object-top"
                />
              </AnimatePresence>
            </div>

            {/* Captions */}
            <p className="text-sm md:text-base text-teal-100/80 font-mono leading-relaxed bg-[#0e1428] p-5 border-t border-[#c8d7ef]/10">
              💡 <span className="font-semibold text-[#e5c590] font-serif">{screens[activeIdx].title} :</span> {screens[activeIdx].desc}
            </p>
          </div>
        </div>
      ) : (
        <div className="max-w-[1000px] mx-auto flex flex-col browser-frame">
          {/* Browser Mock Header */}
          <div className="browser-header">
            <div className="browser-dots">
              <span className="browser-dot red" />
              <span className="browser-dot yellow" />
              <span className="browser-dot green" />
            </div>
            <div className="browser-address">
              localhost:5173/artifacts/showcase
            </div>
            <div className="w-16" />
          </div>

          {/* Screenshot Viewport (Enlarged) */}
          <div className="relative overflow-hidden h-[48vh] max-h-[440px] bg-[#0b0e1a]">
            <AnimatePresence mode="wait">
              <motion.img
                key={activeIdx}
                src={screens[activeIdx].img}
                alt={screens[activeIdx].title}
                initial={{ opacity: 0, scale: 0.995 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.995 }}
                transition={{ duration: 0.25 }}
                className="w-full h-full object-cover object-top"
              />
            </AnimatePresence>
          </div>

          {/* Captions */}
          <p className="text-sm md:text-base text-teal-100/80 font-mono leading-relaxed bg-[#0e1428] p-5 border-t border-[#c8d7ef]/10">
            💡 <span className="font-semibold text-[#e5c590] font-serif">{screens[activeIdx].title} :</span> {screens[activeIdx].desc}
          </p>
        </div>
      )}
    </div>
  )
}
