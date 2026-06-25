import base64
import requests
import os

OUT_DIR = r'c:\Users\boura\ouissal\pfe-antique-marketplace-1\docs\diagrams'
os.makedirs(OUT_DIR, exist_ok=True)

def generate(code, filename):
    encoded = base64.b64encode(code.strip().encode('utf-8')).decode('utf-8')
    url = f'https://mermaid.ink/img/{encoded}?type=png&bgColor=!white'
    r = requests.get(url)
    if r.status_code == 200:
        path = os.path.join(OUT_DIR, filename)
        with open(path, 'wb') as f:
            f.write(r.content)
        print(f'Saved {filename}')
    else:
        print(f'Error {filename}: {r.status_code}')

use_case = """
flowchart LR
    Acheteur([Acheteur])
    Vendeur([Vendeur])
    Admin([Admin])
    
    subgraph Artisan_Echo [Artisan's Echo Marketplace]
        direction TB
        UC1(Parcourir le catalogue)
        UC2(Gerer Wishlist et Panier)
        UC3(Passer une commande)
        UC4(Publier un artefact)
        UC5(Gerer ses commandes)
        UC6(Moderer les artefacts)
        UC7(Gerer les utilisateurs)
        UC8(Messagerie Interne)
    end
    
    Acheteur --> UC1
    Acheteur --> UC2
    Acheteur --> UC3
    Acheteur --> UC8
    
    Vendeur --> UC1
    Vendeur --> UC4
    Vendeur --> UC5
    Vendeur --> UC8
    
    Admin --> UC6
    Admin --> UC7
"""
generate(use_case, 'usecase.png')

architecture = """
flowchart TD
    subgraph Client [Frontend - React Vite]
        UI[Interfaces Utilisateurs]
        State[Gestion d'etat]
        API_Client[Client Axios]
    end
    subgraph Server [Backend - Django DRF]
        API_Routes[Routes API REST]
        Auth[Authentification JWT]
        Business[Logique Metier]
        ORM[Django ORM]
    end
    subgraph DB [Base de donnees]
        SQLite[(SQLite / PostgreSQL)]
    end
    
    UI --> State
    State --> API_Client
    API_Client -- HTTP/JSON --> API_Routes
    API_Routes --> Auth
    Auth --> Business
    Business --> ORM
    ORM --> SQLite
"""
generate(architecture, 'architecture.png')

rbac = """
flowchart TD
    User(Utilisateur Authentifie)
    Role{Role assigne ?}
    
    User --> Role
    
    Role -- buyer --> Buyer[Tableau de bord Acheteur]
    Role -- seller --> Seller[Tableau de bord Vendeur]
    Role -- admin --> Admin[Tableau de bord Admin]
    
    Buyer --> Action1[Acheter, Wishlist, Messages]
    Seller --> Action2[Publier Artefacts, Gerer Ventes]
    Admin --> Action3[Moderation, Gestion Utilisateurs]
"""
generate(rbac, 'rbac.png')

db_er = """
erDiagram
    USER ||--o{ ARTIFACT : publishes
    USER ||--o{ ORDER : places
    USER ||--o{ MESSAGE : sends
    ARTIFACT ||--o{ ORDER_ITEM : contains
    ORDER ||--|{ ORDER_ITEM : includes
    
    USER {
        int id
        string email
        string role
    }
    ARTIFACT {
        int id
        string title
        float price
        string status
    }
    ORDER {
        int id
        string status
        float total_amount
    }
    MESSAGE {
        int id
        string content
        datetime created_at
    }
"""
generate(db_er, 'db_er.png')

seq_login = """
sequenceDiagram
    actor U as Utilisateur
    participant F as Frontend (React)
    participant B as Backend (Django)
    participant DB as Base de Donnees
    
    U->>F: Saisit email et mot de passe
    F->>B: POST /api/token/ (credentials)
    B->>DB: Verifie l'utilisateur
    DB-->>B: Utilisateur valide
    B-->>F: Retourne JWT (Access, Refresh)
    F->>F: Stocke le token localement
    F-->>U: Redirige vers le tableau de bord
"""
generate(seq_login, 'seq_login.png')

seq_publish = """
sequenceDiagram
    actor V as Vendeur
    participant F as Frontend
    participant B as Backend
    participant DB as Base de Donnees
    
    V->>F: Remplit le formulaire produit avec images
    F->>B: POST /api/artifacts/ (FormData) avec JWT
    B->>B: Valide les donnees et autorisations
    B->>DB: Enregistre l'artefact (status: pending)
    DB-->>B: Succes
    B-->>F: Artefact cree
    F-->>V: Affiche message de confirmation
"""
generate(seq_publish, 'seq_publish.png')

seq_checkout = """
sequenceDiagram
    actor A as Acheteur
    participant F as Frontend
    participant B as Backend
    participant DB as Base de Donnees
    
    A->>F: Valide le panier (Checkout COD)
    F->>B: POST /api/orders/ (items, adresse)
    B->>B: Verifie disponibilite des artefacts
    B->>DB: Cree la commande et met a jour stocks
    DB-->>B: Confirme
    B-->>F: Commande creee (status: pending)
    F-->>A: Affiche confirmation de commande
"""
generate(seq_checkout, 'seq_checkout.png')

print('All diagrams generated.')
