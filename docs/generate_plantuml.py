import urllib.request
import urllib.parse
import zlib
import base64
import os

OUT_DIR = r'c:\Users\boura\ouissal\pfe-antique-marketplace-1\docs\diagrams'

uml = '''@startuml
!theme spacelab
left to right direction
skinparam packageStyle rectangle

actor Acheteur
actor Vendeur
actor Administrateur as Admin

package "Artisan's Echo" {
  usecase "Parcourir le catalogue" as UC1
  usecase "Gerer Wishlist et Panier" as UC2
  usecase "Passer une commande" as UC3
  usecase "Publier un artefact" as UC4
  usecase "Gerer ses commandes" as UC5
  usecase "Moderer les artefacts" as UC6
  usecase "Gerer les utilisateurs" as UC7
  usecase "Messagerie Interne" as UC8
}

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
@enduml'''

def encode(text):
    z = zlib.compress(text.encode('utf-8'))
    # PlantUML encoding
    # It's a bit complex, let's just use the plantuml web service via POST or a simple GET with hex encoding
    return z

# Actually PlantUML has a simple API if we just POST the text to https://kroki.io/plantuml/png
import requests

url = 'https://kroki.io/plantuml/png'
r = requests.post(url, data=uml)
if r.status_code == 200:
    path = os.path.join(OUT_DIR, 'usecase.png')
    with open(path, 'wb') as f:
        f.write(r.content)
    print("PlantUML Use Case diagram generated.")
else:
    print("Error:", r.status_code, r.text)
