import os

FILE = r'c:\Users\boura\ouissal\pfe-antique-marketplace-1\docs\generate_report.py'

with open(FILE, 'r', encoding='utf-8') as f:
    content = f.read()

replacements = [
    (
        '''    pdf.screenshot_placeholder(
        "Figure 2.1",
        "Diagramme des cas d'utilisation",
        description_after="Ce diagramme illustre les frontieres du système et les relations entre Visiteurs, Acheteurs, Vendeurs et Administrateurs vis-a-vis des fonctionnalites majeures de la plateforme Artisan's Echo.")''',
        '''    pdf.insert_diagram(
        os.path.join(BASE, "diagrams", "usecase.png"),
        "Figure 2.1",
        "Diagramme des cas d'utilisation",
        description_after="Ce diagramme illustre les frontières du système et les relations entre Visiteurs, Acheteurs, Vendeurs et Administrateurs vis-à-vis des fonctionnalités majeures de la plateforme Artisan's Echo.")'''
    ),
    (
        '''    pdf.screenshot_placeholder(
        "Figure 3.1",
        "Architecture générale du système",
        description_after="Ce schema illustre la communication entre le frontend React et le backend Django via l'API REST, ainsi que les flux d'authentification JWT et l'accès a la base de données.")''',
        '''    pdf.insert_diagram(
        os.path.join(BASE, "diagrams", "architecture.png"),
        "Figure 3.1",
        "Architecture générale du système",
        description_after="Ce schéma illustre la communication entre le frontend React et le backend Django via l'API REST, ainsi que les flux d'authentification JWT et l'accès à la base de données.")'''
    ),
    (
        '''    pdf.screenshot_placeholder(
        "Figure 3.2",
        "Contrôle d'accès basé sur les rôles (RBAC)",
        description_after="Ce schema montre les différents niveaux d'accès et les permissions associees a chaque role utilisateur dans le système Artisan's Echo.")''',
        '''    pdf.insert_diagram(
        os.path.join(BASE, "diagrams", "rbac.png"),
        "Figure 3.2",
        "Contrôle d'accès basé sur les rôles (RBAC)",
        description_after="Ce schéma montre les différents niveaux d'accès et les permissions associées à chaque rôle utilisateur dans le système Artisan's Echo.")'''
    ),
    (
        '''    pdf.screenshot_placeholder(
        "Figure 3.3",
        "Vue d'ensemble de la base de données / entites",
        description_after="Ce diagramme de classes UML modelise les relations entre les entites, leurs attributs majeurs et les multiplicites. L'entite Artifact est centrale, liee au Vendeur, aux Categories, aux Images et aux Commandes.")''',
        '''    pdf.insert_diagram(
        os.path.join(BASE, "diagrams", "db_er.png"),
        "Figure 3.3",
        "Vue d'ensemble de la base de données / entités",
        description_after="Ce diagramme de classes ER modélise les relations entre les entités, leurs attributs majeurs et les multiplicités. L'entité Artifact est centrale, liée au Vendeur, aux Categories, aux Images et aux Commandes.")'''
    ),
    (
        '''    pdf.screenshot_placeholder(
        "Figure 3.4",
        "Diagramme de séquence - Connexion (Login)",
        description_after="Le flux d'authentification garantit que chaque utilisateur est redirige vers l'interface correspondant a son role apres connexion.")''',
        '''    pdf.insert_diagram(
        os.path.join(BASE, "diagrams", "seq_login.png"),
        "Figure 3.4",
        "Diagramme de séquence - Connexion (Login)",
        description_after="Le flux d'authentification garantit que chaque utilisateur est redirigé vers l'interface correspondant à son rôle après connexion.")'''
    ),
    (
        '''    pdf.screenshot_placeholder(
        "Figure 3.5",
        "Diagramme de séquence - Publication produit",
        description_after="Ce flux illustre le mecanisme de moderation : tout nouvel artefact doit etre approuve avant d'etre visible publiquement.")''',
        '''    pdf.insert_diagram(
        os.path.join(BASE, "diagrams", "seq_publish.png"),
        "Figure 3.5",
        "Diagramme de séquence - Publication produit",
        description_after="Ce flux illustre le mécanisme de modération : tout nouvel artefact doit être approuvé avant d'être visible publiquement.")'''
    ),
    (
        '''    pdf.screenshot_placeholder(
        "Figure 3.6",
        "Diagramme de séquence - Checkout / Commande",
        description_after="Le processus de commande couvre le checkout direct (Buy Now) et le checkout depuis le panier, tous deux avec paiement a la livraison (COD).")''',
        '''    pdf.insert_diagram(
        os.path.join(BASE, "diagrams", "seq_checkout.png"),
        "Figure 3.6",
        "Diagramme de séquence - Checkout / Commande",
        description_after="Le processus de commande couvre le checkout direct (Buy Now) et le checkout depuis le panier, tous deux avec paiement à la livraison (COD).")'''
    )
]

for old, new in replacements:
    if old not in content:
        print("COULD NOT FIND:\n", old)
    else:
        content = content.replace(old, new)
        print("Replaced one.")

with open(FILE, 'w', encoding='utf-8') as f:
    f.write(content)

print("Done replacing diagram placeholders.")
