from __future__ import annotations

from itertools import cycle
from pathlib import Path

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.files import File
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils.text import slugify

from marketplace.models import (
    Artifact,
    CartItem,
    Category,
    Conversation,
    ConversationMessage,
    Exhibit,
    Gallery,
    ModerationAction,
    Order,
    OrderItem,
    WishlistItem,
)
from users.models import UserProfile


User = get_user_model()


class Command(BaseCommand):
    help = 'Seed the demo marketplace with local users, artifacts, galleries, and messages.'

    def handle(self, *args, **options):
        project_root = Path(settings.BASE_DIR).resolve().parent
        asset_dir = project_root / 'frontend' / 'src' / 'assets' / 'marketplace'
        avatar_dir = Path(settings.MEDIA_ROOT) / 'avatars'
        avatar_dir.mkdir(parents=True, exist_ok=True)

        category_specs = [
            ('Luxury Bags', 'Structured handbags and collectible leather pieces.'),
            ('Jewelry', 'Hand-finished rings, bracelets, and necklaces with presence.'),
            ('Watches', 'Mechanical timepieces with quiet mechanical charm.'),
            ('Traditional Clothing', 'Ceremonial garments and heritage textiles.'),
            ('Antique Furniture', 'Cabinets, stools, and display pieces with patina.'),
            ('Paintings and Artwork', 'Painted works and framed visual studies.'),
            ('Sculptures', 'Carved objects and gallery centerpieces.'),
            ('Decorative Objects', 'Mantel pieces, mirrors, and interior accents.'),
            ('Vintage Collectibles', 'Objects from mid-century and early consumer culture.'),
            ('Historical Artifacts', 'Archival pieces and study objects with documentary value.'),
            ('Ceramics', 'Vases and ceramic forms with glaze and pattern.'),
            ('Rugs and Textiles', 'Woven surfaces and layered textile works.'),
            ('Silverware', 'Serving pieces and formal hospitality objects.'),
            ('Lighting', 'Lamps and luminous objects for interiors.'),
        ]

        user_specs = [
            {'email': 'admin@artisan.local', 'first_name': 'Maya', 'last_name': 'Rossi', 'role': UserProfile.Role.ADMIN, 'avatar': 'classical-bust.jpg', 'staff': True},
            {'email': 'seller1@artisan.local', 'first_name': 'Nadia', 'last_name': 'Bennani', 'role': UserProfile.Role.SELLER, 'avatar': 'traditional-caftan.jpg', 'staff': False},
            {'email': 'seller2@artisan.local', 'first_name': 'Omar', 'last_name': 'Khalil', 'role': UserProfile.Role.SELLER, 'avatar': 'walnut-cabinet.jpg', 'staff': False},
            {'email': 'seller3@artisan.local', 'first_name': 'Leila', 'last_name': 'Amrani', 'role': UserProfile.Role.SELLER, 'avatar': 'luxury-bag.jpg', 'staff': False},
            {'email': 'seller4@artisan.local', 'first_name': 'Samir', 'last_name': 'Fassi', 'role': UserProfile.Role.SELLER, 'avatar': 'chronograph-watch.jpg', 'staff': False},
            {'email': 'seller5@artisan.local', 'first_name': 'Ines', 'last_name': 'El Idrissi', 'role': UserProfile.Role.SELLER, 'avatar': 'royal-carousel.jpg', 'staff': False},
            {'email': 'collector1@artisan.local', 'first_name': 'Amina', 'last_name': 'Rami', 'role': UserProfile.Role.BUYER, 'avatar': 'ceramic-vase.jpg', 'staff': False},
            {'email': 'collector2@artisan.local', 'first_name': 'Youssef', 'last_name': 'Khan', 'role': UserProfile.Role.BUYER, 'avatar': 'moroccan-rug.jpg', 'staff': False},
            {'email': 'collector3@artisan.local', 'first_name': 'Sara', 'last_name': 'Belhaj', 'role': UserProfile.Role.BUYER, 'avatar': 'amazigh-jewelry.jpg', 'staff': False},
            {'email': 'collector4@artisan.local', 'first_name': 'Hassan', 'last_name': 'Naji', 'role': UserProfile.Role.BUYER, 'avatar': 'antique-telephone.jpg', 'staff': False},
            {'email': 'collector5@artisan.local', 'first_name': 'Salma', 'last_name': 'Alaoui', 'role': UserProfile.Role.BUYER, 'avatar': 'silver-tea-service.jpg', 'staff': False},
            {'email': 'collector6@artisan.local', 'first_name': 'Hamza', 'last_name': 'Saidi', 'role': UserProfile.Role.BUYER, 'avatar': '', 'staff': False},
            {'email': 'collector7@artisan.local', 'first_name': 'Zineb', 'last_name': 'Cherif', 'role': UserProfile.Role.BUYER, 'avatar': '', 'staff': False},
            {'email': 'collector8@artisan.local', 'first_name': 'Karim', 'last_name': 'Berrada', 'role': UserProfile.Role.BUYER, 'avatar': '', 'staff': False},
            {'email': 'collector9@artisan.local', 'first_name': 'Aya', 'last_name': 'Daoud', 'role': UserProfile.Role.BUYER, 'avatar': '', 'staff': False},
        ]

        artifact_specs = [
            ('Ivory Suede Evening Bag', 'Luxury Bags', '3200.00', Artifact.Condition.EXCELLENT, Artifact.Status.APPROVED, 'luxury-bag.jpg'),
            ('Diamond Floral Bracelet', 'Jewelry', '14800.00', Artifact.Condition.EXCELLENT, Artifact.Status.APPROVED, 'amazigh-jewelry.jpg'),
            ('Sterling Chronograph Watch', 'Watches', '8600.00', Artifact.Condition.RESTORED, Artifact.Status.APPROVED, 'chronograph-watch.jpg'),
            ('Embroidered Silk Caftan', 'Traditional Clothing', '5400.00', Artifact.Condition.GOOD, Artifact.Status.APPROVED, 'traditional-caftan.jpg'),
            ('Walnut Display Cabinet', 'Antique Furniture', '12400.00', Artifact.Condition.RESTORED, Artifact.Status.APPROVED, 'walnut-cabinet.jpg'),
            ('Grand Tour Landscape Painting', 'Paintings and Artwork', '11200.00', Artifact.Condition.GOOD, Artifact.Status.APPROVED, 'royal-carousel.jpg'),
            ('Marble Classical Bust', 'Sculptures', '18900.00', Artifact.Condition.EXCELLENT, Artifact.Status.APPROVED, 'classical-bust.jpg'),
            ('Gilt Mantel Clock', 'Decorative Objects', '3800.00', Artifact.Condition.FAIR, Artifact.Status.PENDING, 'silver-tea-service.jpg'),
            ('Leica Rangefinder Camera', 'Vintage Collectibles', '7200.00', Artifact.Condition.GOOD, Artifact.Status.APPROVED, 'antique-telephone.jpg'),
            ('Illuminated Chronicle Leaf', 'Historical Artifacts', '9800.00', Artifact.Condition.GOOD, Artifact.Status.APPROVED, 'chronicle-leaf.jpg'),
            ('Blue and White Porcelain Vase', 'Ceramics', '6200.00', Artifact.Condition.EXCELLENT, Artifact.Status.APPROVED, 'ceramic-vase.jpg'),
            ('Ardabil Carpet', 'Rugs and Textiles', '16400.00', Artifact.Condition.GOOD, Artifact.Status.APPROVED, 'moroccan-rug.jpg'),
            ('Sterling Silver Tea Service', 'Silverware', '9400.00', Artifact.Condition.RESTORED, Artifact.Status.APPROVED, 'silver-tea-service.jpg'),
            ('Brass Arabesque Mirror', 'Decorative Objects', '4300.00', Artifact.Condition.GOOD, Artifact.Status.APPROVED, 'royal-carousel.jpg'),
            ('Inlaid Writing Box', 'Antique Furniture', '5800.00', Artifact.Condition.GOOD, Artifact.Status.APPROVED, 'walnut-cabinet.jpg'),
            ('Silk Prayer Rug', 'Rugs and Textiles', '7600.00', Artifact.Condition.EXCELLENT, Artifact.Status.PENDING, 'moroccan-rug.jpg'),
            ('Coral Bead Necklace', 'Jewelry', '11200.00', Artifact.Condition.GOOD, Artifact.Status.APPROVED, 'amazigh-necklace.jpg'),
            ('Delft Tulip Vase', 'Ceramics', '6900.00', Artifact.Condition.EXCELLENT, Artifact.Status.APPROVED, 'ceramic-vase-alt.jpg'),
            ('Bronze Table Lamp', 'Lighting', '5100.00', Artifact.Condition.RESTORED, Artifact.Status.APPROVED, 'silver-tea-service.jpg'),
            ('Carved Oak Stool', 'Antique Furniture', '2100.00', Artifact.Condition.GOOD, Artifact.Status.DRAFT, 'walnut-cabinet.jpg'),
            ('Miniature Portrait', 'Paintings and Artwork', '8700.00', Artifact.Condition.EXCELLENT, Artifact.Status.APPROVED, 'royal-carousel.jpg'),
            ('Travel Trunk', 'Vintage Collectibles', '3900.00', Artifact.Condition.FAIR, Artifact.Status.APPROVED, 'antique-telephone.jpg'),
            ('Lacquer Tea Caddy', 'Decorative Objects', '3600.00', Artifact.Condition.GOOD, Artifact.Status.APPROVED, 'silver-tea-service.jpg'),
            ('Ottoman Textile Panel', 'Traditional Clothing', '7600.00', Artifact.Condition.EXCELLENT, Artifact.Status.APPROVED, 'traditional-caftan.jpg'),
            ('Botanical Study Print', 'Historical Artifacts', '2900.00', Artifact.Condition.GOOD, Artifact.Status.REJECTED, 'chronicle-leaf.jpg'),
        ]

        category_descriptions = {
            'Luxury Bags': 'Structured handbags and collectible leather pieces.',
            'Jewelry': 'Hand-finished rings, bracelets, and necklaces with presence.',
            'Watches': 'Mechanical timepieces with quiet mechanical charm.',
            'Traditional Clothing': 'Ceremonial garments and heritage textiles.',
            'Antique Furniture': 'Cabinets, stools, and display pieces with patina.',
            'Paintings and Artwork': 'Painted works and framed visual studies.',
            'Sculptures': 'Carved objects and gallery centerpieces.',
            'Decorative Objects': 'Mantel pieces, mirrors, and interior accents.',
            'Vintage Collectibles': 'Objects from mid-century and early consumer culture.',
            'Historical Artifacts': 'Archival pieces and study objects with documentary value.',
            'Ceramics': 'Vases and ceramic forms with glaze and pattern.',
            'Rugs and Textiles': 'Woven surfaces and layered textile works.',
            'Silverware': 'Serving pieces and formal hospitality objects.',
            'Lighting': 'Lamps and luminous objects for interiors.',
        }

        image_dir = asset_dir
        avatar_sources = cycle([
            'classical-bust.jpg',
            'royal-carousel.jpg',
            'traditional-caftan.jpg',
            'luxury-bag.jpg',
            'chronograph-watch.jpg',
        ])

        self.stdout.write(self.style.NOTICE('Seeding demo marketplace data...'))

        with transaction.atomic():
            categories = {}
            for name, description in category_specs:
                categories[name], _ = Category.objects.update_or_create(
                    name=name,
                    defaults={'description': description},
                )

            def save_avatar(user: User, source_name: str) -> None:
                if not source_name:
                    return
                source = image_dir / source_name
                if not source.exists():
                    return
                target_name = f"{slugify(user.username)}{source.suffix.lower()}"
                target_path = avatar_dir / target_name
                target_path.write_bytes(source.read_bytes())
                profile, _ = UserProfile.objects.get_or_create(user=user)
                profile.role = getattr(profile, 'role', UserProfile.Role.BUYER)
                profile.avatar_3d_path = f'/media/avatars/{target_name}'
                profile.save(update_fields=['role', 'avatar_3d_path'])

            accounts = {}
            for spec in user_specs:
                user, _ = User.objects.get_or_create(username=spec['email'])
                user.email = spec['email']
                user.first_name = spec['first_name']
                user.last_name = spec['last_name']
                user.is_active = True
                user.is_staff = spec['staff']
                user.is_superuser = spec['staff'] and spec['role'] == UserProfile.Role.ADMIN
                user.set_password('Password123!')
                user.save()

                profile, _ = UserProfile.objects.get_or_create(user=user)
                profile.role = spec['role']
                profile.save(update_fields=['role'])
                save_avatar(user, spec['avatar'])
                accounts[spec['email']] = user

            sellers = [accounts[spec['email']] for spec in user_specs if spec['role'] == UserProfile.Role.SELLER]
            buyers = [accounts[spec['email']] for spec in user_specs if spec['role'] == UserProfile.Role.BUYER]
            admin = accounts['admin@artisan.local']

            def artifact_description(title: str, category_name: str) -> str:
                detail_map = {
                    'Luxury Bags': 'polished hardware, a tailored silhouette, and the kind of quiet luxury that reads instantly in a feed.',
                    'Jewelry': 'luminous stonework, delicate settings, and a collector-friendly profile.',
                    'Watches': 'brushed steel, balanced proportions, and a wrist presence that feels purposeful.',
                    'Traditional Clothing': 'fluid drape, fine embroidery, and ceremonial texture.',
                    'Antique Furniture': 'patina, joinery, and the visual weight of a room anchor.',
                    'Paintings and Artwork': 'editorial composition, subdued color, and gallery display energy.',
                    'Sculptures': 'carved form, balanced scale, and a strong silhouette from every angle.',
                    'Decorative Objects': 'ornamental detail, reflective surfaces, and shelf-ready charm.',
                    'Vintage Collectibles': 'nostalgia, compact mechanics, and a design-language that still feels current.',
                    'Historical Artifacts': 'archival clarity, surface detail, and the sense of something carefully preserved.',
                    'Ceramics': 'glaze variation, balanced curvature, and a refined tabletop presence.',
                    'Rugs and Textiles': 'woven pattern, soft depth, and the warmth of a piece that can hold a room.',
                    'Silverware': 'reflective surfaces, formal proportions, and ceremonial hosting appeal.',
                    'Lighting': 'warm metal, sculptural lines, and the soft glow of a useful object.',
                }
                return f'{title} brings {detail_map.get(category_name, "a refined collector presence")}.'

            artifact_history = {
                'Luxury Bags': 'Luxury accessories became collector objects through craft, materials, and the rituals of dressing well.',
                'Jewelry': 'Jewelry carries family stories, gifting rituals, and the precision of hand-set stones.',
                'Watches': 'Mechanical watches combine engineering, timing, and the language of status.',
                'Traditional Clothing': 'Traditional dress preserves identity through weave, cut, ornament, and ceremonial use.',
                'Antique Furniture': 'Furniture pieces often become heirlooms because they shape the rooms that hold memory.',
                'Paintings and Artwork': 'Painted works document taste, travel, and the visual culture of a time.',
                'Sculptures': 'Sculptural forms preserve portraiture, scale, and the memory of classical collecting.',
                'Decorative Objects': 'Decorative objects add rhythm to interiors and often become family keepsakes.',
                'Vintage Collectibles': 'Collectibles are valued for design, nostalgia, and the eras they document.',
                'Historical Artifacts': 'Historical objects preserve the texture of daily life, learning, and belief.',
                'Ceramics': 'Ceramics travel well through trade and collecting because they preserve both craft and exchange.',
                'Rugs and Textiles': 'Textiles introduce scale and pattern while reflecting trade routes and household taste.',
                'Silverware': 'Silverware was often created for hospitality, display, and the ritual of hosting.',
                'Lighting': 'Lighting pieces blend utility with the decorative language of the rooms they illuminate.',
            }

            image_cycle = cycle(
                [
                    'luxury-bag.jpg',
                    'amazigh-jewelry.jpg',
                    'chronograph-watch.jpg',
                    'traditional-caftan.jpg',
                    'walnut-cabinet.jpg',
                    'royal-carousel.jpg',
                    'classical-bust.jpg',
                    'silver-tea-service.jpg',
                    'antique-telephone.jpg',
                    'chronicle-leaf.jpg',
                    'ceramic-vase.jpg',
                    'moroccan-rug.jpg',
                    'silver-tea-service.jpg',
                    'royal-carousel.jpg',
                    'walnut-cabinet.jpg',
                    'moroccan-rug.jpg',
                    'amazigh-necklace.jpg',
                    'ceramic-vase-alt.jpg',
                    'silver-tea-service.jpg',
                    'walnut-cabinet.jpg',
                    'royal-carousel.jpg',
                    'antique-telephone.jpg',
                    'silver-tea-service.jpg',
                    'traditional-caftan.jpg',
                    'chronicle-leaf.jpg',
                ],
            )

            artifact_records = []
            for index, (title, category_name, price, condition, status, image_name) in enumerate(artifact_specs):
                seller = sellers[index % len(sellers)]
                category = categories[category_name]
                artifact, _ = Artifact.objects.update_or_create(
                    title=title,
                    defaults={
                        'seller': seller,
                        'category': category,
                        'description': artifact_description(title, category_name),
                        'history': artifact_history.get(category_name, 'Carefully documented for the demo marketplace.'),
                        'provenance': f'Seeded curatorial record for {title.lower()}.',
                        'condition': condition,
                        'price': price,
                        'textures_path': '',
                        'metadata_json': {'seeded': True, 'category': category_name},
                        'status': status,
                    },
                )
                source = image_dir / image_name
                if source.exists():
                    with source.open('rb') as handle:
                        artifact.image.save(f'{slugify(title)}{source.suffix.lower()}', File(handle), save=False)
                artifact.save()
                artifact_records.append(artifact)

            approved_artifacts = [artifact for artifact in artifact_records if artifact.status == Artifact.Status.APPROVED]

            for seller_index, seller in enumerate(sellers):
                gallery_name = f"{seller.first_name} cabinet"
                gallery, _ = Gallery.objects.update_or_create(
                    owner=seller,
                    name=gallery_name,
                    defaults={
                        'theme': f'{seller.first_name} collection',
                        'description': f'A compact public cabinet of objects curated by {seller.first_name} {seller.last_name}.',
                        'layout_3d_path': '',
                        'is_public': True,
                    },
                )
                Exhibit.objects.filter(gallery=gallery).delete()
                seller_artifacts = [artifact for artifact in approved_artifacts if artifact.seller_id == seller.id]
                for exhibit_index, artifact in enumerate(seller_artifacts[:3]):
                    Exhibit.objects.create(
                        gallery=gallery,
                        artifact=artifact,
                        position_x=float(exhibit_index * 1.5),
                        position_y=0.0,
                        position_z=float(exhibit_index * -1.2),
                        rotation_y=float(exhibit_index * 0.35),
                        scale=1.0 - (exhibit_index * 0.05),
                        label=artifact.title,
                        has_spotlight=exhibit_index == 0,
                    )

            for index, artifact in enumerate(approved_artifacts[:10]):
                buyer = buyers[index % len(buyers)]
                seller = artifact.seller
                conversation, _ = Conversation.objects.get_or_create(
                    artifact=artifact,
                    buyer=buyer,
                    seller=seller,
                )
                ConversationMessage.objects.filter(conversation=conversation).delete()
                ConversationMessage.objects.create(
                    conversation=conversation,
                    sender=buyer,
                    body=f'Hi, I would like to ask about {artifact.title.lower()}.',
                )
                ConversationMessage.objects.create(
                    conversation=conversation,
                    sender=seller,
                    body=f'Happy to share provenance, condition, and shipping details for {artifact.title}.',
                )

            for buyer_index, buyer in enumerate(buyers[:5]):
                selected_artifacts = approved_artifacts[buyer_index:buyer_index + 2]
                for artifact in selected_artifacts:
                    WishlistItem.objects.get_or_create(user=buyer, artifact=artifact)
                    CartItem.objects.get_or_create(user=buyer, artifact=artifact, defaults={'quantity': 1})

                if not buyer.orders.exists() and selected_artifacts:
                    order = Order.objects.create(
                        buyer=buyer,
                        total_amount=0,
                        status=Order.Status.PAID if buyer_index % 2 == 0 else Order.Status.PENDING,
                    )
                    total = 0
                    for artifact in selected_artifacts:
                        quantity = 1 if buyer_index % 2 == 0 else 2
                        OrderItem.objects.create(
                            order=order,
                            artifact=artifact,
                            quantity=quantity,
                            price=artifact.price,
                        )
                        total += float(artifact.price) * quantity
                    order.total_amount = total
                    order.save(update_fields=['total_amount'])

            for artifact in artifact_records:
                if artifact.status == Artifact.Status.APPROVED:
                    continue
                if ModerationAction.objects.filter(target_model='Artifact', target_id=artifact.id).exists():
                    continue
                ModerationAction.objects.create(
                    admin=admin,
                    action_type=ModerationAction.ActionType.ARTIFACT_REJECTED,
                    target_model='Artifact',
                    target_id=artifact.id,
                    target_label=artifact.title,
                    notes=f'Seeded moderation note for {artifact.title}.',
                    metadata_json={'seeded': True, 'status': artifact.status},
                )

        self.stdout.write(self.style.SUCCESS('Demo marketplace data seeded successfully.'))
