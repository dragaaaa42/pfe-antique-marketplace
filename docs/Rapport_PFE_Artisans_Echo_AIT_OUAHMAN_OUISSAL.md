# Rapport de projet de fin d'études
## Artisan's Echo — Marketplace premium d'antiquités et d'objets de collection

| Élément | Information |
|---|---|
| Établissement | Racine |
| Filière | Développement Informatique |
| Réalisé par | AIT OUAHMAN OUISSAL |
| Encadré par | Ait Ben Hamou Khalid |
| Année universitaire | 2025/2026 |

Technologies : Django | React | Marketplace | Role-based Access | Admin Dashboard

---

## Remerciements

Je tiens à exprimer ma profonde gratitude envers toutes les personnes qui ont contribué, de près ou de loin, à la réalisation de ce projet de fin d'études.

Je remercie tout d'abord mon encadrant, **M. Ait Ben Hamou Khalid**, pour son accompagnement pédagogique, ses conseils avisés et sa disponibilité tout au long de ce travail. Ses orientations ont été déterminantes dans la réussite de ce projet, m'aidant à structurer ma démarche, à clarifier mes choix techniques et à maintenir une vision cohérente du résultat attendu.

J'adresse également mes remerciements à l'ensemble de l'équipe pédagogique et administrative de l'établissement **Racine** pour la qualité de la formation dispensée, ainsi que pour avoir mis à notre disposition l'environnement d'apprentissage et les ressources nécessaires à la conduite de nos projets académiques.

Enfin, je remercie ma famille et mes proches pour leur soutien inconditionnel, leur patience et leurs encouragements qui m'ont permis de mener à bien ce travail de conception et de réalisation.

---

## Résumé

Le présent rapport de projet de fin d'études porte sur la conception et la réalisation d'**Artisan's Echo**, une plateforme web de type marketplace premium dédiée à la vente, la découverte et l'acquisition d'objets antiques et rares. Le projet a été pensé pour offrir un environnement de confiance, raffiné et sécurisé, répondant aux exigences spécifiques des collectionneurs, des acheteurs passionnés et des vendeurs professionnels.

La solution repose sur une architecture moderne client-serveur. Le frontend est développé avec **React** (TypeScript, Vite) et offre une interface à forte identité visuelle inspirée des galeries d'art, adaptée à chaque rôle utilisateur. Le backend s'appuie sur **Django** et **Django REST Framework**, intégrant une authentification par **JWT**, un contrôle d'accès basé sur les rôles (RBAC), et une gestion robuste des entités telles que les utilisateurs, les artefacts, les commandes et les messages.

Le système intègre plusieurs modules distincts : un catalogue public filtrable, des tableaux de bord spécifiques (Acheteur/Collectionneur, Vendeur, Administrateur), une fiche produit détaillée avec galerie, un processus de commande avec paiement à la livraison (Cash on Delivery), un système de liste de souhaits (wishlist) et de panier, une messagerie interne entre acheteurs et vendeurs, ainsi qu'un journal d'audit et une modération des artefacts par l'administrateur.

**Mots-clés :** Marketplace, objets antiques, Django REST Framework, React, JWT, tableau de bord, commerce électronique, modération, rôles.

---

## Abstract

This graduation project report presents the design and implementation of **Artisan's Echo**, a premium web marketplace platform dedicated to the sale, discovery, and acquisition of antique and rare objects. The project was designed to provide a secure, refined, and trustworthy environment that meets the specific requirements of collectors, passionate buyers, and professional sellers.

The solution is based on a modern client-server architecture. The frontend is built with **React** (TypeScript, Vite), offering an interface with a strong visual identity inspired by art galleries, adapted to each user role. The backend relies on **Django** and **Django REST Framework**, featuring secure **JWT** authentication, Role-Based Access Control (RBAC), and robust data management for users, artifacts, orders, and messages.

The system incorporates several distinct modules: a filterable public catalogue, role-specific dashboards (Buyer/Collector, Seller, Administrator), detailed product pages with galleries, a checkout process with Cash on Delivery, a wishlist and cart system, internal messaging between buyers and sellers, as well as an audit trail and artifact moderation by the administrator.

**Keywords:** Marketplace, antique objects, Django REST Framework, React, JWT, dashboard, e-commerce, moderation, roles.

---

## Table des matières

- Remerciements
- Résumé / Abstract
- Table des matières
- Liste des figures
- Liste des tableaux
- Liste des abréviations
- Introduction générale
- **Chapitre I : Présentation générale du projet**
  - 1.1 Contexte du projet
  - 1.2 Problématique
  - 1.3 Objectifs du projet
  - 1.4 Valeur ajoutée
  - 1.5 Périmètre fonctionnel
- **Chapitre II : Analyse des besoins**
  - 2.1 Identification des acteurs
  - 2.2 Besoins fonctionnels
  - 2.3 Besoins non fonctionnels
  - 2.4 Parcours utilisateurs
  - 2.5 Diagramme des cas d'utilisation
- **Chapitre III : Conception**
  - 3.1 Architecture globale du système
  - 3.2 Gestion des rôles et des accès (RBAC)
  - 3.3 Modèle de données
  - 3.4 Diagrammes de séquence
    - 3.4.1 Séquence d'authentification
    - 3.4.2 Séquence de publication d'un produit
    - 3.4.3 Séquence de commande (Checkout)
  - 3.5 Règles de gestion
- **Chapitre IV : Réalisation de la solution**
  - 4.1 Technologies utilisées
  - 4.2 Structure du projet
  - 4.3 Interfaces et fonctionnalités développées
    - 4.3.1 Page d'accueil publique
    - 4.3.2 Catalogue des objets
    - 4.3.3 Dossier détaillé d'un objet
    - 4.3.4 Authentification et inscription
    - 4.3.5 Tableau de bord du collectionneur
    - 4.3.6 Tableau de bord du vendeur
    - 4.3.7 Tableau de bord administrateur
    - 4.3.8 Messagerie interne
    - 4.3.9 Profil utilisateur
  - 4.4 Responsive Design
- **Chapitre V : Tests, validation et perspectives**
  - 5.1 Stratégie de test
  - 5.2 Scénarios de tests fonctionnels
  - 5.3 Résultats de validation
  - 5.4 Limites actuelles
  - 5.5 Perspectives d'amélioration
- Conclusion générale
- Bibliographie
- Annexes
  - Annexe A : Structure du code source
  - Annexe B : Guide d'installation rapide
  - Annexe C : Captures d'écran complémentaires

---

## Liste des figures

- Figure 2.1 — Diagramme des cas d'utilisation
- Figure 3.1 — Architecture générale du système
- Figure 3.2 — Contrôle d'accès basé sur les rôles (RBAC)
- Figure 3.3 — Vue d'ensemble de la base de données / entités
- Figure 3.4 — Diagramme de séquence — Connexion (Login)
- Figure 3.5 — Diagramme de séquence — Publication produit
- Figure 3.6 — Diagramme de séquence — Checkout / Commande
- Figure 4.1 — Page d'accueil publique
- Figure 4.2 — Catalogue des objets
- Figure 4.3 — Dossier détaillé d'un objet
- Figure 4.4 — Page de connexion / inscription
- Figure 4.5 — Tableau de bord du collectionneur (acheteur)
- Figure 4.6 — Liste de souhaits (Wishlist)
- Figure 4.7 — Panier et processus de commande
- Figure 4.8 — Tableau de bord du vendeur
- Figure 4.9 — Gestion des produits du vendeur
- Figure 4.10 — Formulaire d'ajout / modification produit
- Figure 4.11 — Messagerie interne
- Figure 4.12 — Tableau de bord administrateur
- Figure 4.13 — Gestion des utilisateurs (Admin)
- Figure 4.14 — Modération des artefacts (Admin)
- Figure 4.15 — Journal d'audit (Audit Trail)
- Figure 4.16 — Paramètres du profil utilisateur

---

## Liste des tableaux

- Tableau 1.1 — Périmètre fonctionnel du projet
- Tableau 2.1 — Acteurs du système
- Tableau 2.2 — Besoins fonctionnels
- Tableau 2.3 — Besoins non fonctionnels
- Tableau 3.1 — Entités principales du modèle de données
- Tableau 3.2 — Matrice des permissions par rôle
- Tableau 3.3 — Principaux endpoints de l'API REST
- Tableau 4.1 — Stack technologique du projet
- Tableau 5.1 — Scénarios de test fonctionnels

---

## Liste des abréviations

| Abréviation | Signification |
|---|---|
| API | Application Programming Interface |
| COD | Cash on Delivery (Paiement à la livraison) |
| CRUD | Create, Read, Update, Delete |
| CSS | Cascading Style Sheets |
| DRF | Django REST Framework |
| HTTP | HyperText Transfer Protocol |
| JSON | JavaScript Object Notation |
| JWT | JSON Web Token |
| ORM | Object-Relational Mapping |
| RBAC | Role-Based Access Control |
| REST | Representational State Transfer |
| SPA | Single Page Application |
| SQL | Structured Query Language |
| UI | User Interface |
| UML | Unified Modeling Language |
| UX | User Experience |

## Conventions de lecture

Les noms techniques, routes, commandes et fichiers sont présentés en police `monospace`. Les figures sont citées dans le texte avant leur apparition et leur numérotation suit le chapitre correspondant (ex: Figure 3.1 = première figure du Chapitre III).

Les statuts fonctionnels sont conservés en anglais ou français selon leur implémentation technique pour rester cohérents avec le code (ex: `pending`, `sold`, `approved`). Les termes *frontend* et *backend* désignent respectivement l'interface utilisateur React et l'API serveur Django.

---

# Introduction générale

L'ère numérique a profondément transformé les modes de consommation et les échanges commerciaux. Si le commerce électronique grand public est aujourd'hui dominé par des plateformes généralistes telles qu'Amazon, eBay ou Leboncoin, le secteur des antiquités et des objets de collection requiert une approche distincte et spécialisée. Les collectionneurs, historiens amateurs et passionnés d'art ne recherchent pas seulement une transaction, mais une histoire, une garantie d'authenticité et une expérience visuelle à la hauteur de la rareté des pièces qu'ils convoitent.

Cependant, les solutions existantes pour la vente d'antiquités en ligne souffrent souvent d'un manque de curation, d'interfaces vieillissantes, et d'une séparation floue entre acheteurs professionnels et amateurs. Le besoin d'une plateforme de confiance, où les objets sont mis en valeur et les vendeurs modérés, est réel et croissant. Les acteurs de ce marché de niche aspirent à un espace qui respecte les codes du marché de l'art tout en tirant parti des technologies web modernes.

Le projet **Artisan's Echo** répond à cette problématique en proposant une plateforme marketplace premium, conçue comme une galerie virtuelle. Elle offre un espace dédié pour chaque type d'utilisateur : l'administrateur modère le contenu et les accès, le vendeur professionnel ou vérifié publie et gère ses artefacts, tandis que l'acheteur collectionneur explore, sauvegarde et acquiert des objets rares dans un environnement visuellement immersif et fonctionnellement complet.

Ce projet vise à structurer l'ensemble du cycle d'un marketplace spécialisé : de l'authentification sécurisée à la publication de produits détaillés, en passant par la gestion du panier, de la liste de souhaits, de la messagerie interne pour les négociations, et enfin, le processus de commande avec paiement à la livraison.

Ce rapport présente les différentes étapes de la conception et de la réalisation de cette plateforme, organisées en cinq chapitres :

1. Le premier chapitre introduit le contexte général, la problématique et les objectifs du projet.
2. Le deuxième chapitre détaille l'analyse des besoins fonctionnels et non fonctionnels.
3. Le troisième chapitre aborde la conception architecturale et logicielle, incluant les diagrammes UML.
4. Le quatrième chapitre présente la réalisation technique et les interfaces développées.
5. Le cinquième chapitre expose les tests, la validation et les perspectives d'évolution.

---

# Chapitre I : Présentation générale du projet

## 1.1 Contexte du projet

Le marché des objets antiques et de collection est un secteur de niche caractérisé par des transactions de forte valeur et une importance capitale accordée à la provenance et à l'authenticité des biens. Traditionnellement ancré dans les salles de vente aux enchères, les brocantes spécialisées et les galeries physiques, ce marché s'est progressivement numérisé au cours des deux dernières décennies.

Cependant, les plateformes généralistes de vente de pair à pair (C2C) ou de commerce électronique standard ne répondent pas aux attentes spécifiques de ce public exigeant. Elles manquent de mécanismes de vérification rigoureux, d'interfaces esthétiques adaptées à la mise en valeur du patrimoine culturel, et de tableaux de bord adaptés à la gestion d'inventaires de pièces uniques, chacune possédant son propre historique et sa propre valeur patrimoniale.

C'est dans ce contexte que s'inscrit le développement d'**Artisan's Echo**. Le projet est né de la volonté de créer une vitrine numérique qui respecte les codes du marché de l'art et de l'antiquité, tout en tirant parti des technologies web modernes pour offrir fluidité, sécurité et organisation. La plateforme se positionne comme un intermédiaire de confiance entre vendeurs professionnels et collectionneurs passionnés.

## 1.2 Problématique

La conception d'une plateforme dédiée aux antiquités soulève plusieurs défis majeurs. La problématique centrale peut se formuler ainsi :

**Comment concevoir et réaliser une plateforme web marketplace premium qui garantit un environnement de confiance pour la vente d'objets rares, tout en offrant une expérience utilisateur esthétique et des outils de gestion cloisonnés et adaptés à chaque rôle (acheteur, vendeur, administrateur) ?**

Cette problématique implique plusieurs sous-questions fondamentales :
- Comment séparer efficacement les espaces vendeurs, acheteurs et administrateurs pour éviter toute confusion des fonctionnalités et garantir la sécurité des données ?
- Comment mettre en valeur les objets (les "artefacts") tout en structurant les données nécessaires à leur identification (époque, origine, condition, matériaux) ?
- Comment faciliter la communication et la transaction entre les parties tout en maintenant un contrôle et une modération rigoureuse par les administrateurs ?
- Comment assurer une expérience utilisateur premium et immersive qui reflète la valeur et le prestige des objets vendus ?

## 1.3 Objectifs du projet

Les objectifs principaux du projet Artisan's Echo sont clairement définis et guident l'ensemble du processus de conception et de développement :

- Concevoir une vitrine en ligne premium, avec un design moderne et immersif inspiré des galeries d'art contemporaines, offrant une expérience visuelle à la hauteur des objets présentés.
- Implémenter un système multi-rôles sécurisé avec des espaces et tableaux de bord dédiés pour les acheteurs (collectionneurs), les vendeurs professionnels et les administrateurs de la plateforme.
- Développer un catalogue riche, filtrable et recherchable pour faciliter la découverte des objets par catégories, mots-clés, fourchettes de prix et états de conservation.
- Mettre en place un processus de modération des utilisateurs et des artefacts pour garantir la qualité et l'intégrité de la plateforme, avec un journal d'audit traçable.
- Intégrer des fonctionnalités e-commerce complètes : panier d'achat, liste de souhaits, processus de commande avec paiement à la livraison (Cash on Delivery), et suivi des commandes.
- Fournir un canal de communication direct et privé via une messagerie interne entre acheteurs et vendeurs, liée à chaque artefact concerné.

## 1.4 Valeur ajoutée

La valeur ajoutée d'Artisan's Echo par rapport aux solutions existantes repose sur plusieurs piliers distinctifs :

- **Design Premium :** Une interface utilisateur élégante, épurée et dynamique, mettant l'accent sur la photographie des objets et utilisant des animations fluides pour créer une expérience immersive.
- **Séparation Stricte des Rôles :** Des tableaux de bord qui ne mélangent pas les actions d'achat et de vente, offrant une clarté fonctionnelle optimale à chaque type d'utilisateur.
- **Modération et Confiance :** Un flux d'approbation des artefacts par l'administration, assurant que seuls des objets de qualité et conformes apparaissent sur le catalogue public.
- **Dossier Produit Complet :** Des fiches produits détaillées qui informent l'acheteur sur l'histoire, la condition, les matériaux et l'authenticité de l'objet, au-delà d'une simple description marchande.

## 1.5 Périmètre fonctionnel

Le tableau suivant résume le périmètre fonctionnel couvert par la plateforme Artisan's Echo dans sa version actuelle :

| Module | Description |
|---|---|
| Page d'accueil | Hero banner immersif, navigation, featured items |
| Catalogue | Filtrage par catégorie, recherche, tri, grille responsive |
| Détail produit | Galerie d'images, infos vendeur, boutons d'action |
| Authentification | Inscription, connexion, JWT, gestion des rôles |
| Dashboard acheteur | Wishlist, commandes, panier, historique, profil |
| Dashboard vendeur | Artefacts, galeries, commandes, messagerie, stats |
| Dashboard admin | Utilisateurs, modération, audit trail, statistiques |
| Messagerie | Conversations acheteur-vendeur liées aux artefacts |
| Commandes | Checkout COD, suivi de statut, acceptation/rejet |

*Tableau 1.1 — Périmètre fonctionnel du projet*

Ce premier chapitre a posé les bases du projet Artisan's Echo en définissant son contexte, sa problématique, ses objectifs et son périmètre. Le chapitre suivant s'attachera à traduire ces intentions en besoins fonctionnels et non fonctionnels précis.

---

# Chapitre II : Analyse des besoins

L'analyse des besoins constitue une étape fondamentale dans le cycle de vie d'un projet logiciel. Elle permet de définir avec précision les fonctionnalités attendues par les différents utilisateurs du système, ainsi que les contraintes qualitatives et techniques auxquelles la solution doit répondre. Ce chapitre présente l'identification des acteurs, les besoins fonctionnels et non fonctionnels, les parcours utilisateurs et le diagramme des cas d'utilisation.

## 2.1 Identification des acteurs

Le système Artisan's Echo interagit avec plusieurs profils d'utilisateurs, chacun ayant des droits, des responsabilités et des interfaces spécifiques. L'identification rigoureuse de ces acteurs est essentielle pour garantir que chaque fonctionnalité est accessible uniquement aux utilisateurs autorisés.

| Acteur | Description | Actions clés |
|---|---|---|
| **Visiteur** | Utilisateur non authentifié | Parcourir le catalogue, visualiser les détails, s'inscrire |
| **Acheteur / Collectionneur** | Utilisateur authentifié (buyer) | Wishlist, panier, commander, messagerie, profil |
| **Vendeur** | Utilisateur authentifié (seller) | Publier artefacts, gérer commandes, répondre messages |
| **Administrateur** | Privilèges maximums (admin) | Modérer artefacts, gérer utilisateurs, audit trail |

*Tableau 2.1 — Acteurs du système*

## 2.2 Besoins fonctionnels

Les besoins fonctionnels décrivent les actions que le système doit permettre de réaliser. Ils ont été identifiés à partir de l'analyse des parcours utilisateurs et des objectifs du projet.

| ID | Domaine | Description | Priorité |
|---|---|---|---|
| BF01 | Authentification | Permettre la création d'un compte (Acheteur ou Vendeur) | Haute |
| BF02 | Authentification | Connexion sécurisée et gestion du profil utilisateur | Haute |
| BF03 | Catalogue | Afficher le catalogue public des artefacts approuvés | Haute |
| BF04 | Catalogue | Recherche par mots-clés et filtrage par catégories | Haute |
| BF05 | Catalogue | Afficher le dossier détaillé d'un objet (galerie, vendeur) | Haute |
| BF06 | Achat | Ajouter/retirer des objets de la liste de souhaits | Haute |
| BF07 | Achat | Gérer un panier d'achat temporaire | Haute |
| BF08 | Achat | Soumettre une commande (Checkout COD) | Haute |
| BF09 | Achat | Consulter l'historique et le statut des commandes | Haute |
| BF10 | Vente | Ajouter, modifier ou supprimer un artefact | Haute |
| BF11 | Vente | Gérer les commandes reçues (accepter, expédier) | Moyenne |
| BF12 | Vente | Consulter les statistiques de vente | Moyenne |
| BF13 | Communication | Messagerie interne acheteur-vendeur | Moyenne |
| BF14 | Administration | Approuver ou rejeter les artefacts soumis | Haute |
| BF15 | Administration | Gérer les utilisateurs (suspension, rôles) | Haute |
| BF16 | Administration | Consulter le journal d'audit | Basse |

*Tableau 2.2 — Besoins fonctionnels*

## 2.3 Besoins non fonctionnels

Les besoins non fonctionnels définissent les critères de qualité et les contraintes techniques du système.

| Catégorie | Exigence |
|---|---|
| **Sécurité** | Protection des routes par JWT. Contrôle des autorisations côté serveur (RBAC). |
| **Performance** | Temps de réponse rapide de l'API. Chargement optimisé des images. |
| **Ergonomie** | Interface premium, claire et intuitive. Micro-animations fluides. |
| **Responsivité** | Utilisable sur mobile, tablette et desktop. |
| **Maintenabilité** | Code structuré, architecture séparée Frontend/Backend. |
| **Traçabilité** | Journal d'audit pour les actions d'administration critiques. |

*Tableau 2.3 — Besoins non fonctionnels*

## 2.4 Parcours utilisateurs

Pour mieux comprendre les interactions entre les acteurs et le système, les parcours typiques pour chaque rôle ont été définis.

### Le parcours Visiteur

Le visiteur arrive sur la page d'accueil, attiré par le design immersif et le hero banner. Il navigue vers le catalogue, utilise les filtres pour chercher une antiquité précise par catégorie ou par prix. Il consulte le dossier détaillé d'un objet, découvre sa galerie de photos et son historique. Pour ajouter l'objet à sa liste de souhaits ou contacter le vendeur, il est invité à créer un compte en choisissant son rôle (collectionneur ou vendeur).

### Le parcours Acheteur / Collectionneur

L'acheteur se connecte et arrive sur son tableau de bord collectionneur. Il peut voir un résumé de ses activités : nombre d'objets dans sa wishlist, articles dans le panier, commandes récentes. Il reprend son exploration du catalogue, ajoute un objet rare à son panier, puis procède au checkout en remplissant son adresse de livraison et en confirmant le paiement à la livraison (COD). Il suit ensuite l'évolution de sa commande dans son espace dédié et peut communiquer avec le vendeur via la messagerie interne.

### Le parcours Vendeur

Le vendeur se connecte et accède à son tableau de bord de gestion. Il décide de mettre en vente une nouvelle horloge ancienne. Il remplit le formulaire de création de produit avec des photos haute définition, des détails historiques (époque, origine, matériaux) et fixe un prix. L'artefact passe en statut `pending` (en attente de modération). Une fois approuvé par l'admin, l'objet apparaît dans le catalogue public. Le vendeur reçoit des commandes, discute avec les acheteurs via la messagerie pour les détails d'expédition, puis met à jour le statut de chaque commande.

### Le parcours Administrateur

L'administrateur a une vue d'ensemble sur l'activité de la plateforme. Son tableau de bord affiche des statistiques globales : nombre total d'utilisateurs, d'artefacts, de commandes. Il vérifie les artefacts en attente de modération, s'assurant que les descriptions sont adéquates et les photos conformes aux standards de qualité. Il valide ou rejette les objets. Il consulte également les nouveaux utilisateurs inscrits, peut modifier les rôles ou suspendre des comptes problématiques. Le journal d'audit lui permet de retracer toutes les actions de modération effectuées.

## 2.5 Diagramme des cas d'utilisation

Le diagramme des cas d'utilisation modélise les interactions globales entre les acteurs et le système, illustrant les périmètres d'action définis dans les sections précédentes.

[Capture d'écran à insérer — Figure 2.1 : Diagramme des cas d'utilisation]

*Ce diagramme illustre les frontières du système et les relations entre Visiteurs, Acheteurs, Vendeurs et Administrateurs vis-à-vis des fonctionnalités majeures de la plateforme Artisan's Echo.*

L'analyse des besoins a permis de cartographier avec précision les attentes fonctionnelles et qualitatives de la plateforme. La séparation claire des rôles et l'accent mis sur la modération et l'expérience premium guideront les choix d'architecture et de conception logicielle abordés dans le chapitre suivant.

---

# Chapitre III : Conception

La phase de conception traduit les besoins identifiés en une architecture logicielle cohérente et en modèles de données structurés. Ce chapitre présente l'architecture globale du système, le modèle de gestion des rôles et des accès, le modèle de données relationnel, les diagrammes de séquence illustrant les flux clés, et les règles de gestion métier.

## 3.1 Architecture globale du système

Le projet Artisan's Echo repose sur une architecture moderne de type **Single Page Application (SPA)** découplée du serveur via une API REST. Cette séparation stricte entre le frontend et le backend offre de nombreux avantages en termes de maintenabilité, d'évolutivité et de spécialisation des développements.

L'architecture s'organise en trois couches principales :

1. **Couche Présentation (Frontend) :** Développée en **React** avec **TypeScript** et **Vite**. Elle gère le routage côté client (React Router), la gestion d'état locale, l'affichage dynamique des composants et l'expérience utilisateur globale avec des animations fluides (Framer Motion).
2. **Couche Métier et Services (Backend API) :** Développée en Python avec **Django** et **Django REST Framework (DRF)**. Cette couche reçoit les requêtes HTTP, vérifie l'authentification via les jetons JWT, applique la logique métier, valide les données via les serializers et interroge la base de données via l'ORM Django.
3. **Couche Persistance (Base de données) :** Utilisation de **SQLite** en environnement de développement, modulaire pour PostgreSQL en production. Elle stocke de manière intègre et persistante l'ensemble des données.

Le frontend est servi sur le port 5173 (serveur de développement Vite) et communique avec le backend sur le port 8000 via des appels HTTP/JSON. Les tokens JWT (access + refresh) sont stockés côté client et transmis dans les en-têtes Authorization de chaque requête protégée.

[Capture d'écran à insérer — Figure 3.1 : Architecture générale du système]

*Ce schéma illustre la communication entre le frontend React et le backend Django via l'API REST, ainsi que les flux d'authentification JWT et l'accès à la base de données.*

## 3.2 Gestion des rôles et des accès (RBAC)

L'architecture de sécurité repose sur un modèle **Role-Based Access Control (RBAC)**. Après authentification, le backend vérifie l'identité de l'utilisateur via le JSON Web Token, puis lit son rôle (`buyer`, `seller`, `admin`) depuis le profil associé.

Des classes de permissions personnalisées ont été créées côté serveur pour protéger les endpoints de l'API :

- `IsAdminOrReadOnly` : permet à tous de lire les données, mais seul l'admin peut les modifier ou les supprimer.
- `IsSeller` : limite l'accès à la création et la gestion de produits aux utilisateurs ayant le rôle vendeur.
- `IsOwnerOrAdmin` : garantit qu'un utilisateur ne peut voir ou modifier que ses propres commandes, messages ou informations de profil.

Le frontend s'adapte dynamiquement en fonction du rôle retourné par l'API, en affichant ou masquant des éléments de navigation, des boutons d'action et des sections entières du tableau de bord.

| Fonctionnalité | Visiteur | Acheteur | Vendeur | Admin |
|---|---|---|---|---|
| Voir catalogue | Oui | Oui | Oui | Oui |
| Ajouter au panier | Non | Oui | Non | Non |
| Commander | Non | Oui | Non | Non |
| Publier artefact | Non | Non | Oui | Oui |
| Modérer artefact | Non | Non | Non | Oui |
| Gérer utilisateurs | Non | Non | Non | Oui |
| Messagerie | Non | Oui | Oui | Non |

*Tableau 3.2 — Matrice des permissions par rôle*

[Capture d'écran à insérer — Figure 3.2 : Contrôle d'accès basé sur les rôles (RBAC)]

*Ce schéma montre les différents niveaux d'accès et les permissions associées à chaque rôle utilisateur dans le système Artisan's Echo.*

## 3.3 Modèle de données

La conception de la base de données est cruciale pour structurer l'information de la marketplace. Le modèle relationnel s'articule autour de plusieurs entités interconnectées.

| Entité | Description | Relations principales |
|---|---|---|
| **User** | Compte utilisateur (authentification) | 1-1 avec Profile |
| **Profile** | Informations étendues (rôle, adresse, bio) | 1-1 avec User |
| **Category** | Taxonomie pour classer les artefacts | 1-N avec Artifact |
| **Artifact** | Objet en vente (titre, prix, description, statut) | N-1 avec User (vendeur), N-1 avec Category |
| **ArtifactImage** | Images multiples pour la galerie produit | N-1 avec Artifact |
| **Order** | Commande globale effectuée par un acheteur | N-1 avec User (acheteur) |
| **OrderItem** | Ligne de commande liant artefact à commande | N-1 avec Order, 1-1 avec Artifact |
| **CartItem** | Article dans le panier temporaire | N-1 avec User, N-1 avec Artifact |
| **WishlistItem** | Article dans la liste de souhaits | N-1 avec User, N-1 avec Artifact |
| **Conversation** | Fil de discussion lié à un artefact | N-1 avec Artifact, N-N avec Users |
| **Message** | Message dans une conversation | N-1 avec Conversation, N-1 avec User |
| **AuditLog** | Trace des actions d'administration | N-1 avec User (admin) |

*Tableau 3.1 — Entités principales du modèle de données*

[Capture d'écran à insérer — Figure 3.3 : Vue d'ensemble de la base de données / entités]

*Ce diagramme de classes UML modélise les relations entre les entités, leurs attributs majeurs et les multiplicités.*

## 3.4 Diagrammes de séquence

Pour illustrer la dynamique du système, plusieurs séquences clés ont été modélisées.

### 3.4.1 Séquence d'authentification (Login)

Cette séquence montre le processus complet de connexion : l'utilisateur saisit ses identifiants dans le formulaire de login. Le frontend envoie une requête POST à l'endpoint `/api/auth/login/` avec les credentials. Le backend vérifie les informations, génère une paire de tokens JWT (access + refresh) et retourne le profil utilisateur avec son rôle. Le frontend stocke les tokens et redirige l'utilisateur vers son tableau de bord spécifique.

[Capture d'écran à insérer — Figure 3.4 : Diagramme de séquence — Connexion (Login)]

*Le flux d'authentification garantit que chaque utilisateur est redirigé vers l'interface correspondant à son rôle après connexion.*

### 3.4.2 Séquence de publication d'un produit

Le vendeur remplit le formulaire de création d'artefact avec les informations détaillées (titre, description, prix, catégorie, images). Le frontend envoie une requête POST multipart à l'API. Le backend crée l'entité Artifact avec le statut `pending` (en attente de modération), enregistre les images associées, et retourne une confirmation au frontend. L'artefact n'apparaîtra dans le catalogue public qu'après approbation par l'administrateur.

[Capture d'écran à insérer — Figure 3.5 : Diagramme de séquence — Publication produit]

*Ce flux illustre le mécanisme de modération : tout nouvel artefact doit être approuvé avant d'être visible publiquement.*

### 3.4.3 Séquence de commande (Checkout)

L'acheteur valide son panier ou utilise le bouton 'Buy Now' pour un achat direct. Le frontend envoie les données de livraison à l'endpoint `/api/orders/direct_checkout/`. Le backend crée l'entité Order avec les OrderItems correspondants, met à jour le statut des artefacts commandés, et retourne le succès de la transaction.

[Capture d'écran à insérer — Figure 3.6 : Diagramme de séquence — Checkout / Commande]

*Le processus de commande couvre le checkout direct (Buy Now) et le checkout depuis le panier, tous deux avec paiement à la livraison (COD).*

## 3.5 Règles de gestion

Plusieurs règles métiers fortes assurent la cohérence et l'intégrité du système :

- Un artefact vendu (statut `sold`) ne peut plus être ajouté au panier par un autre utilisateur.
- Seul un artefact au statut `approved` est visible publiquement dans le catalogue.
- Un vendeur ne peut pas acheter ses propres artefacts.
- Une commande passe par plusieurs statuts : `pending_confirmation`, `processing`, `shipped`, `delivered`, `cancelled`.
- Seul l'administrateur peut changer le rôle d'un utilisateur ou suspendre un compte.
- La messagerie est liée à un artefact spécifique : un acheteur ne peut contacter un vendeur qu'à propos d'un objet précis.

La phase de conception a permis de définir une architecture robuste, modulaire et sécurisée. Le modèle de données relationnel et le système de rôles garantissent que les exigences de ségrégation des données et de traçabilité seront respectées lors de l'implémentation détaillée dans le chapitre suivant.

---

# Chapitre IV : Réalisation de la solution

Ce chapitre présente la phase de réalisation technique du projet Artisan's Echo. Il détaille les technologies utilisées, la structure du code source, et les différentes interfaces développées pour chaque rôle utilisateur.

## 4.1 Technologies utilisées

La phase de réalisation s'est appuyée sur des technologies modernes, reconnues pour leur fiabilité et leur vaste écosystème.

| Composant | Technologie | Justification |
|---|---|---|
| **Frontend Framework** | React 19.x | Architecture composants, large communauté |
| **Langage Frontend** | TypeScript | Typage statique, prévention d'erreurs |
| **Outil de Build** | Vite 8.x | Dev server rapide, optimisation build |
| **Animations** | Motion (Framer Motion) | Micro-interactions fluides et premium |
| **Icônes** | Lucide React | Icônes modernes et cohérentes |
| **HTTP Client** | Axios 1.x | Gestion des requêtes API robuste |
| **Routage Frontend** | React Router DOM 7.x | Navigation SPA fluide |
| **Backend Framework** | Django 5.x | Robustesse, sécurité native (ORM, CSRF) |
| **API REST** | Django REST Framework | Sérialisation, vues, permissions |
| **Authentification** | Simple JWT 5.x | Tokens access/refresh, sécurisé |
| **Base de données** | SQLite 3.x | Légèreté pour le développement |
| **Gestion de code** | Git | Versionnage et collaboration |

*Tableau 4.1 — Stack technologique du projet*

## 4.2 Structure du projet

Le projet est organisé en deux répertoires principaux, suivant le principe de séparation des préoccupations :

- **frontend/** : Application React contenant les composants, pages, services API, types TypeScript et assets statiques. Le point d'entrée est `App.tsx` qui gère le routage principal.
- **backend/** : Projet Django organisé en deux applications principales — `marketplace` (artefacts, commandes, messages, modération) et `users` (authentification, profils, rôles).

## 4.3 Interfaces et fonctionnalités développées

Le développement a suivi une approche orientée utilisateur, en matérialisant les parcours définis lors de l'analyse des besoins.

### 4.3.1 Page d'accueil publique

La première impression est cruciale pour une plateforme premium. La page d'accueil a été entièrement repensée avec un thème professionnel et élégant. La barre de navigation (navbar) offre un espacement épuré, avec le logo (format PNG transparent sans arrière-plan) judicieusement placé à gauche. La section "Hero" adopte un design raffiné, tandis que la typographie, l'espacement, les cartes et la palette de couleurs ont été optimisés pour un rendu visuel luxueux, tout en garantissant un affichage parfaitement responsive.

[Capture d'écran à insérer — Figure 4.1 : Page d'accueil publique (redesign premium)]

*Le design utilise une palette de couleurs sombres et dorées, renforçant l'aspect luxueux et historique des antiquités.*

### 4.3.2 Catalogue des objets

Le catalogue est le cœur de la découverte sur la plateforme. Il affiche les artefacts approuvés sous forme de cartes élégantes, présentant la photographie principale, le titre, le prix, la catégorie et le badge de vérification du vendeur. Des fonctionnalités de filtrage par catégorie, par fourchette de prix, et une barre de recherche par mots-clés permettent d'affiner l'exploration.

[Capture d'écran à insérer — Figure 4.2 : Catalogue des objets]

*L'interface du catalogue est pensée pour maximiser la visibilité des images, tout en offrant une navigation fluide.*

### 4.3.3 Dossier détaillé d'un objet

Lorsqu'un utilisateur clique sur un objet, il accède à sa fiche détaillée. Celle-ci comprend une galerie de photos interactive avec navigation par miniatures, une description riche retraçant l'histoire de l'objet, des informations structurées sur sa condition, sa provenance, ses matériaux et ses dimensions.

[Capture d'écran à insérer — Figure 4.3 : Dossier détaillé d'un objet]

*La mise en page aérée rappelle la scénographie d'une exposition artistique.*

### 4.3.4 Authentification et inscription

Les formulaires de connexion et d'inscription sont épurés et sécurisés. L'inscription propose le choix du rôle (Collectionneur ou Vendeur), ce qui conditionnera l'expérience future sur la plateforme et le type de tableau de bord accessible.

[Capture d'écran à insérer — Figure 4.4 : Page de connexion / inscription]

*Les formulaires incluent des validations côté client pour garantir des données propres avant la soumission à l'API.*

### 4.3.5 Tableau de bord du collectionneur (Acheteur)

Une fois connecté, l'acheteur accède à son espace personnel. Ce tableau de bord offre une vue synthétique sur ses activités récentes : nombre d'objets dans sa wishlist, articles dans le panier, commandes en cours et leur statut.

[Capture d'écran à insérer — Figure 4.5 : Tableau de bord du collectionneur (acheteur)]

*Un environnement centré sur l'utilisateur, facilitant le suivi de ses acquisitions.*

#### Gestion de la liste de souhaits

L'acheteur peut mettre de côté des objets remarquables dans sa liste de souhaits pour y revenir plus tard.

[Capture d'écran à insérer — Figure 4.6 : Liste de souhaits (Wishlist)]

*La wishlist est présentée sous forme de galerie privée.*

#### Panier et processus de commande

Le panier récapitule les articles choisis avec leurs prix et quantités. Le processus de commande (Checkout) recueille les informations de livraison et valide la transaction avec le mode de paiement Cash on Delivery (COD).

[Capture d'écran à insérer — Figure 4.7 : Panier et processus de commande]

*Le checkout est conçu pour être fluide et rassurant, minimisant les frictions lors de l'achat.*

### 4.3.6 Tableau de bord du vendeur

L'espace du vendeur est un centre de contrôle de son activité commerciale. Le tableau de bord affiche des métriques clés : nombre d'objets en vente, artefacts en attente de modération, commandes reçues, revenus générés.

[Capture d'écran à insérer — Figure 4.8 : Tableau de bord du vendeur]

*L'interface met en évidence les actions requises, comme les nouvelles commandes à traiter.*

#### Gestion des produits et formulaire

Le vendeur dispose d'un tableau listant ses artefacts avec leurs statuts (Approuvé, En attente, Vendu, Rejeté).

[Capture d'écran à insérer — Figure 4.9 : Gestion des produits du vendeur]

*La liste de gestion de l'inventaire vendeur.*

Le formulaire d'ajout ou de modification est exhaustif, permettant de spécifier tous les détails qui feront la valeur de l'objet.

[Capture d'écran à insérer — Figure 4.10 : Formulaire d'ajout / modification produit]

*Le formulaire gère l'upload multiple d'images et la saisie de données structurées.*

### 4.3.7 Tableau de bord administrateur

L'administrateur dispose du niveau d'accès le plus élevé. Son tableau de bord est un centre de supervision de la plateforme, avec des statistiques globales et des alertes sur les actions en attente.

[Capture d'écran à insérer — Figure 4.12 : Tableau de bord administrateur]

*Une vue d'ensemble des métriques de santé de la marketplace.*

#### Gestion des utilisateurs

L'administrateur peut visualiser tous les utilisateurs inscrits, changer leurs rôles ou suspendre des comptes problématiques.

[Capture d'écran à insérer — Figure 4.13 : Gestion des utilisateurs (Admin)]

*Le tableau de bord de gestion des membres et des privilèges.*

#### Modération des artefacts

La modération des artefacts est une responsabilité clé de l'administrateur.

[Capture d'écran à insérer — Figure 4.14 : Modération des artefacts (Admin)]

*L'interface de modération permet d'approuver ou de rejeter un objet en un clic.*

#### Journal d'audit

Toutes les actions critiques sont consignées dans un journal d'audit accessible par l'administration.

[Capture d'écran à insérer — Figure 4.15 : Journal d'audit (Audit Trail)]

*L'historique des actions permet de retracer les décisions prises sur la plateforme.*

### 4.3.8 Messagerie interne

La plateforme intègre une messagerie interne permettant aux acheteurs de contacter les vendeurs directement depuis la fiche produit.

[Capture d'écran à insérer — Figure 4.11 : Messagerie interne]

*L'interface de chat permet des échanges structurés et contextualisés.*

### 4.3.9 Profil utilisateur

Chaque utilisateur peut personnaliser son compte via la page des paramètres du profil.

[Capture d'écran à insérer — Figure 4.16 : Paramètres du profil utilisateur]

*Une gestion simple et centralisée des données personnelles.*

## 4.4 Responsive Design

Un soin particulier a été apporté à l'ergonomie sur les différents terminaux. L'ensemble des interfaces s'adaptent dynamiquement aux petites résolutions. Les éléments s'empilent intelligemment sur mobile, la navigation se transforme en menu hamburger, et les tableaux de données deviennent scrollables horizontalement.

La phase de réalisation a permis de concrétiser les spécifications en une application web fonctionnelle et esthétique. Le chapitre suivant vérifiera la qualité de ce travail à travers des campagnes de tests.

---

# Chapitre V : Tests, validation et perspectives

Ce chapitre présente la stratégie de validation mise en place pour s'assurer de la fiabilité et de la qualité de l'application Artisan's Echo.

## 5.1 Stratégie de test

Pour s'assurer de la fiabilité de l'application, une stratégie de validation multi-niveaux a été mise en place :

- **Tests fonctionnels :** Vérification systématique que chaque bouton, formulaire, lien et fonctionnalité répond comme prévu selon les spécifications.
- **Tests d'intégration :** Validation de la bonne communication entre le frontend React et l'API Django.
- **Tests de sécurité et permissions :** Vérification rigoureuse qu'un utilisateur n'a accès qu'aux ressources autorisées par son rôle.
- **Tests d'interface (UI/UX) :** Vérification de l'adaptabilité visuelle (Responsive Design) sur différentes résolutions.
- **Tests de compilation :** Vérification que le projet compile sans erreurs (npm run build, python manage.py check).

## 5.2 Scénarios de tests fonctionnels

| ID | Scénario testé | Résultat attendu | Statut |
|---|---|---|---|
| ST01 | Inscription vendeur | Compte créé avec rôle seller | **Succès** |
| ST02 | Routage après connexion | Redirection vers dashboard spécifique | **Succès** |
| ST03 | Accès non autorisé (RBAC) | Erreur 403, accès refusé | **Succès** |
| ST04 | Soumission d'un artefact | Statut pending, non visible public | **Succès** |
| ST05 | Modération par l'admin | Artefact approved, visible catalogue | **Succès** |
| ST06 | Workflow de commande | Commande créée, artefact sold | **Succès** |
| ST07 | Messagerie interne | Message envoyé et reçu correctement | **Succès** |
| ST08 | Ajout au panier | Article ajouté, total mis à jour | **Succès** |
| ST09 | Gestion wishlist | Objet ajouté/retiré de la wishlist | **Succès** |
| ST10 | Modification de rôle | Rôle mis à jour par l'admin | **Succès** |

*Tableau 5.1 — Scénarios de test fonctionnels*

## 5.3 Résultats de validation

La vérification complète du projet a confirmé que l'application fonctionne correctement :

- **Frontend :** `npm run build` exécuté avec succès — TypeScript compilé sans erreurs, bundle optimisé généré. Taille du bundle JavaScript : ~723 KB (197 KB compressé). CSS : ~168 KB (31 KB compressé).
- **Backend :** `python manage.py check` exécuté sans aucun problème identifié.
- **API REST :** Tous les endpoints répondent correctement avec les codes HTTP attendus (200, 201, 400, 401, 403, 404).

## 5.4 Limites actuelles

Bien que la plateforme soit pleinement fonctionnelle pour sa version initiale, certaines limites ont été identifiées :

- **Paiement en ligne :** Le système repose exclusivement sur le Cash on Delivery. Pas d'intégration de passerelle de paiement en ligne.
- **Temps réel :** La messagerie fonctionne via des requêtes HTTP classiques avec polling. L'implémentation de WebSockets améliorerait la réactivité du chat.
- **Optimisation des médias :** Les images sont servies dans leur format original. Un service de compression et conversion côté serveur serait nécessaire en production.
- **Base de données :** SQLite ne convient pas pour un déploiement en production à grande échelle. Migration vers PostgreSQL recommandée.
- **Internationalisation :** Interface disponible uniquement en anglais. Support multi-langues à envisager.

## 5.5 Perspectives d'amélioration

- **Intégration bancaire :** Paiements sécurisés par carte bancaire avec gestion de séquestre (escrow).
- **Système d'enchères :** Module d'enchères programmées pour les pièces d'exception.
- **Certificats d'authenticité numériques :** Garantir la provenance des objets vendus.
- **Notifications push :** Informer les utilisateurs en temps réel des nouvelles commandes et messages.
- **Application mobile :** Version mobile native (React Native) avec accès hors-ligne.
- **Moteur de recherche avancé :** Intégration d'Elasticsearch pour des résultats plus pertinents.

La phase de test a validé la robustesse et l'ergonomie de l'application. Les limites identifiées ouvrent des perspectives d'évolution stimulantes, démontrant que la plateforme est une base solide capable de s'adapter aux exigences futures du marché.

---

# Conclusion générale

Le projet de fin d'études **Artisan's Echo** a consisté en la conception et le développement d'une plateforme web marketplace premium dédiée aux objets antiques et de collection. Face aux manques des plateformes généralistes actuelles pour ce marché de niche, l'objectif était de fournir une solution élégante, sécurisée et segmentée par rôles, capable de restaurer la confiance entre acheteurs exigeants et vendeurs professionnels.

Tout au long de ce travail, une méthodologie rigoureuse a été suivie, débutant par une analyse approfondie des besoins spécifiques du domaine des antiquités. Cette analyse a abouti à une architecture logicielle robuste, s'appuyant sur les technologies Django et React, qui a permis de séparer clairement les responsabilités (backend / frontend) et de gérer finement les autorisations d'accès via un système RBAC complet.

La réalisation technique a couvert un large spectre fonctionnel : de l'interface publique immersive au catalogue dynamique, en passant par les systèmes de panier et de wishlist, la messagerie interne entre acheteurs et vendeurs, le processus de commande avec paiement à la livraison, et la création de trois tableaux de bord distincts adaptés aux besoins spécifiques des acheteurs, des vendeurs et de l'administration.

Un soin particulier a été apporté à l'ergonomie (UI/UX) pour s'assurer que l'expérience visuelle reflète la valeur et le prestige des objets vendus. Le design premium, les micro-animations, la palette de couleurs raffinée et l'attention portée aux détails visuels contribuent à créer une atmosphère de galerie virtuelle qui distingue Artisan's Echo des plateformes de vente conventionnelles.

Ce projet m'a permis de mobiliser et d'approfondir mes compétences en développement Full-Stack, en conception de bases de données relationnelles, en sécurité des API REST et en intégration d'interfaces modernes. Il représente une étape majeure dans mon parcours de formation en développement informatique à l'établissement Racine, constituant une expérience concrète et valorisante de création d'une application web de bout en bout.

Artisan's Echo se révèle aujourd'hui être une preuve de concept fonctionnelle et prometteuse. Ses perspectives d'évolution, comme l'intégration de paiements en ligne sécurisés, de systèmes d'enchères ou de certificats d'authenticité numériques, confirment son potentiel pour devenir une véritable référence numérique dans le secteur des antiquités et des objets de collection.

---

# Bibliographie

- [1] Django Software Foundation. *Django Documentation*. https://docs.djangoproject.com/
- [2] Encode OSS Ltd. *Django REST Framework Documentation*. https://www.django-rest-framework.org/
- [3] Meta Platforms. *React Documentation*. https://react.dev/
- [4] Microsoft. *TypeScript Documentation*. https://www.typescriptlang.org/docs/
- [5] Evan You. *Vite Documentation*. https://vite.dev/
- [6] Jazzband. *Simple JWT Documentation*. https://django-rest-framework-simplejwt.readthedocs.io/
- [7] Axios. *Axios HTTP Client Documentation*. https://axios-http.com/docs/
- [8] Remix Inc. *React Router Documentation*. https://reactrouter.com/
- [9] Framer. *Motion Library Documentation*. https://motion.dev/
- [10] Lucide. *Lucide Icons Documentation*. https://lucide.dev/
- [11] SQLite Consortium. *SQLite Documentation*. https://www.sqlite.org/docs.html
- [12] Mozilla. *MDN Web Docs — Web Technologies*. https://developer.mozilla.org/
- [13] Tailwind Labs. *Tailwind CSS Documentation*. https://tailwindcss.com/docs

---

# Annexes

## Annexe A : Structure globale du code source

L'arborescence du projet illustre la séparation des préoccupations :

```text
pfe-antique-marketplace/
├── frontend/
│   ├── src/
│   │   ├── App.tsx              — Page d'accueil, routage principal
│   │   ├── ArtifactDetailPage.tsx — Détail produit avec galerie
│   │   ├── api.ts               — Configuration Axios, appels API
│   │   ├── auth.tsx             — Contexte d'authentification JWT
│   │   ├── buyer.tsx            — Dashboard acheteur/collectionneur
│   │   ├── seller.tsx           — Dashboard vendeur
│   │   ├── admin.tsx            — Dashboard administrateur
│   │   ├── account.tsx          — Page profil et paramètres
│   │   ├── types.ts             — Types et interfaces TypeScript
│   │   └── index.css            — Styles globaux et design system
│   ├── public/                  — Assets statiques
│   ├── package.json             — Dépendances frontend
│   └── vite.config.ts           — Configuration Vite
└── backend/
    ├── config/                  — Settings Django, URLs racine
    ├── marketplace/
    │   ├── models.py            — Modèles de données
    │   ├── views.py             — Vues API (ViewSets)
    │   ├── serializers.py       — Serializers DRF
    │   ├── urls.py              — Routage API REST
    │   └── permissions.py       — Classes de permissions RBAC
    ├── users/
    │   ├── models.py            — UserProfile, rôles
    │   └── views.py             — Authentification, profil
    ├── manage.py                — Django management
    └── requirements.txt         — Dépendances Python
```

## Annexe B : Guide d'installation rapide

Pour déployer la plateforme en environnement de développement local :

### Backend (Django)

```bash
cd backend
python -m venv venv
source venv/Scripts/activate    # Windows
# ou : source venv/bin/activate # Linux/Mac
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser  # Créer un admin
python manage.py runserver 127.0.0.1:8000
```

### Frontend (React)

```bash
cd frontend
npm install
npm run dev
```

L'application est alors accessible sur `http://localhost:5173`.

## Annexe C : Captures d'écran complémentaires

Cette annexe regroupe des captures d'écran additionnelles illustrant diverses fonctionnalités et états de la plateforme Artisan's Echo.

### Interface responsive sur mobile

La plateforme est entièrement responsive et s'adapte aux écrans de smartphones et tablettes.

[Capture d'écran à insérer — Figure A.1 : Vue responsive — Catalogue sur mobile]

*Le catalogue s'adapte aux petits écrans en passant d'une grille multi-colonnes à une colonne unique.*

[Capture d'écran à insérer — Figure A.2 : Vue responsive — Dashboard sur tablette]

*Les tableaux de bord conservent leur fonctionnalité complète sur tablette.*

### Flux de modération complet

[Capture d'écran à insérer — Figure A.3 : Flux de modération — Artefact en attente]

*Un artefact en statut 'pending' dans l'interface de modération de l'administrateur.*

### Principaux endpoints de l'API REST

| Endpoint | Méthodes | Description |
|---|---|---|
| /api/auth/register/ | POST | Inscription |
| /api/auth/login/ | POST | Connexion (JWT) |
| /api/auth/me/ | GET, PATCH | Profil courant |
| /api/artifacts/ | GET, POST | Liste/création artefacts |
| /api/orders/direct_checkout/ | POST | Checkout direct COD |
| /api/cart/ | GET, POST, DEL | Gestion du panier |
| /api/wishlist/ | GET, POST, DEL | Gestion wishlist |
| /api/conversations/ | GET, POST | Messagerie |
| /api/admin/dashboard/ | GET | Stats admin |
| /api/admin/users/ | GET, PATCH | Gestion utilisateurs |

*Tableau 3.3 — Principaux endpoints de l'API REST*
