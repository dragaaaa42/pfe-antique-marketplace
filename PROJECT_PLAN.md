# Artisan's Echo - PFE Project Plan

## Session Continuation Note

When starting a new session, tell Codex: `continue from PROJECT_PLAN.md`.

This file is the source of truth for the project idea, scope, architecture, milestones, and next tasks. Before making changes, Codex should read this file, inspect the current codebase, then continue from the highest-priority unchecked task.

## Project Vision

**Artisan's Echo** is an antique marketplace transformed into an immersive 3D virtual gallery.

The core problem is that traditional online antique marketplaces feel flat: users only see static 2D photos, which makes it difficult to understand an object's texture, scale, age, story, and emotional value.

The solution is a web platform where antiques are displayed inside interactive 3D galleries. Visitors can explore themed rooms, inspect antiques in 3D, rotate and zoom objects, read their provenance, and move toward purchase with more confidence.

## Main Users

### Visitor

Can explore public galleries, view antique objects, and register for an account.

### Explorer / Buyer

Can log in, explore 3D galleries, inspect objects, add objects to wishlist/cart, and complete a simulated secure purchase.

### Artisan / Seller

Can upload antiques, add details and 3D models, manage personal gallery spaces, track interactions, and manage sales.

### Admin / Curator

Can manage users, validate antiques, moderate content, organize themed galleries, and monitor platform activity.

## MVP Scope

The PFE should focus on a strong but realistic MVP:

- Authentication with roles: buyer, seller, admin.
- Antique catalog with images, details, category, price, condition, provenance, and availability.
- 3D object viewer for GLB/GLTF models.
- Virtual gallery scene with multiple antique objects placed in a room.
- Seller dashboard for adding and managing antiques.
- Buyer wishlist/cart and simulated checkout.
- Admin dashboard for moderation and validation.
- Clean PFE documentation, UML diagrams, screenshots, and demo flow.

Future features such as AR, real payment integration, multi-user gallery presence, and AI curation should be kept as perspectives, not core MVP.

## Tech Stack

### Frontend

- React with Vite
- TypeScript
- Three.js or React Three Fiber for 3D
- CSS or Tailwind CSS depending on project setup
- Axios for API calls
- Protected routes and auth context

### Backend

- Django
- Django REST Framework
- JWT authentication
- PostgreSQL preferred for final version
- SQLite acceptable during early local development
- Local media storage for PFE demo, with S3-style storage as a future/scalable option

### 3D Assets

- Preferred model format: GLB
- Alternative: GLTF
- Models should be optimized before upload
- Blender can be used to reduce polygons, compress textures, and export clean GLB files

## API Plan

### Authentication

- `POST /api/auth/register/`
- `POST /api/auth/login/`
- `POST /api/auth/token/refresh/`
- `GET /api/auth/me/`

### Users

- `GET /api/users/`
- `GET /api/users/:id/`
- `PATCH /api/users/:id/`
- Admin-only user moderation endpoints

### Categories

- `GET /api/categories/`
- `POST /api/categories/`
- `PATCH /api/categories/:id/`
- `DELETE /api/categories/:id/`

### Artifacts / Antiques

- `GET /api/artifacts/`
- `POST /api/artifacts/`
- `GET /api/artifacts/:id/`
- `PATCH /api/artifacts/:id/`
- `DELETE /api/artifacts/:id/`
- Upload fields for image and 3D model path

### Galleries

- `GET /api/galleries/`
- `POST /api/galleries/`
- `GET /api/galleries/:id/`
- `PATCH /api/galleries/:id/`
- `DELETE /api/galleries/:id/`

### Exhibits

- Represents the placement of one artifact inside one gallery.
- Stores position, rotation, scale, and optional spotlight/label data.

### Transactions

- `POST /api/transactions/cart/add/`
- `GET /api/transactions/cart/`
- `POST /api/transactions/checkout/`
- `GET /api/orders/`

Payment can be simulated for the PFE.

## Database Model Plan

### User

Fields:

- `id`
- `email`
- `password`
- `role`: buyer, seller, admin
- `first_name`
- `last_name`
- `avatar_3d_path` optional
- `created_at`

Relations:

- One seller owns many artifacts.
- One buyer owns many orders.
- One admin/curator can own/manage many galleries.

### Category

Fields:

- `id`
- `name`
- `description`

Relations:

- One category has many artifacts.

### Artifact

Fields:

- `id`
- `seller`
- `category`
- `title`
- `description`
- `history`
- `provenance`
- `condition`
- `price`
- `image`
- `model_3d`
- `textures_path`
- `metadata_json`
- `status`: draft, pending, approved, rejected, sold
- `created_at`

Relations:

- Many artifacts belong to one seller.
- Many artifacts belong to one category.
- One artifact can appear in many exhibits.

### Gallery

Fields:

- `id`
- `owner`
- `name`
- `theme`
- `description`
- `layout_3d_path`
- `is_public`
- `created_at`

Relations:

- One gallery has many exhibits.

### Exhibit

Fields:

- `id`
- `gallery`
- `artifact`
- `position_x`
- `position_y`
- `position_z`
- `rotation_y`
- `scale`

Relations:

- Many exhibits belong to one gallery.
- Many exhibits reference one artifact.

### Order

Fields:

- `id`
- `buyer`
- `total_amount`
- `status`: pending, paid, cancelled
- `created_at`

### OrderItem

Fields:

- `id`
- `order`
- `artifact`
- `price`

## UML Text Plan

### Use Case Summary

Visitor:

- Register as buyer or seller.
- Explore public 3D galleries.
- View antique details.

Buyer:

- Log in.
- Manage profile.
- Explore 3D gallery.
- Rotate, zoom, and inspect 3D antique models.
- Add artifact to wishlist or cart.
- Complete simulated purchase.

Seller:

- Log in.
- Upload antique details and 3D model.
- Manage own artifacts.
- Arrange personal gallery.
- Track sales.

Admin:

- Manage users.
- Validate artifacts.
- Moderate sellers and content.
- Organize themed galleries.
- Review orders and engagement.

### Purchase Sequence

1. Buyer selects an antique in the 3D gallery.
2. Frontend sends artifact ID to cart endpoint.
3. Backend checks artifact availability.
4. Backend adds item to cart/order draft.
5. Buyer confirms simulated payment.
6. Backend marks order as paid and artifact as sold.
7. Frontend displays purchase confirmation.

## 3-Month Roadmap

### Month 1 - Foundations

Goal: Build the backend foundation and define the project clearly.

Week 1:

- Finalize project vision and MVP.
- Write functional and technical specification.
- Prepare UML diagrams.
- Design database schema.

Week 2:

- Set up Django apps.
- Configure authentication and roles.
- Implement core models: User, Category, Artifact, Gallery, Exhibit, Order.
- Create initial migrations.

Week 3:

- Build REST APIs.
- Add JWT authentication.
- Add CRUD for artifacts and galleries.
- Add upload handling for images and 3D models.

Week 4:

- Add permissions.
- Add validation rules.
- Add admin moderation workflow.
- Add backend tests.
- Add API documentation.

### Month 2 - Frontend and 3D Experience

Goal: Build the user-facing app and connect it to the backend.

Week 5:

- Build React layout and navigation.
- Create pages: home/gallery, catalog, artifact detail, login, register.
- Create reusable UI components.

Week 6:

- Add auth context.
- Connect login/register APIs.
- Add protected routes.
- Build buyer, seller, and admin dashboards.

Week 7:

- Add Three.js or React Three Fiber.
- Build reusable `Artifact3DViewer`.
- Load GLB/GLTF model files.
- Build basic virtual gallery room.
- Place artifacts inside the gallery.

Week 8:

- Add wishlist/cart.
- Add simulated checkout.
- Improve responsive design.
- Optimize 3D loading and controls.
- Polish demo flow.

### Month 3 - Testing, Deployment, Report

Goal: Stabilize the app and prepare the academic deliverables.

Week 9:

- Test main flows: register, login, seller upload, admin validation, gallery exploration, purchase.
- Fix frontend/backend bugs.
- Optimize API queries and 3D assets.

Week 10:

- Prepare production settings.
- Deploy backend and frontend or prepare local demo deployment.
- Start final PFE report structure.

Week 11:

- Write PFE report chapters.
- Add screenshots and diagrams.
- Document 3D implementation challenges and solutions.

Week 12:

- Finalize report.
- Prepare presentation slides.
- Prepare live demo scenario.
- Rehearse defense questions.

## Report Structure

1. Introduction
   - Context
   - Problem statement
   - Objectives
   - Proposed solution

2. State of the Art and Requirements
   - Existing antique marketplaces
   - Limits of 2D ecommerce
   - User needs
   - Functional and non-functional requirements

3. Analysis and Design
   - System architecture
   - UML use case diagram
   - UML class diagram
   - Sequence diagram for purchase
   - Database schema

4. Implementation
   - Backend with Django REST Framework
   - Frontend with React
   - 3D viewer and gallery implementation
   - Authentication and roles
   - Screenshots and code examples

5. Testing and Deployment
   - Test strategy
   - API tests
   - User flow tests
   - 3D performance considerations
   - Deployment/demo environment

6. Conclusion and Perspectives
   - Project summary
   - Difficulties and solutions
   - Future work: AR, AI curation, real payment, multiplayer gallery

## Presentation Plan

Slide 1: Project title, name, supervisor, year.

Slide 2: Presentation agenda.

Slide 3: Problem: antique ecommerce lacks immersion.

Slide 4: Proposed solution: 3D virtual antique gallery.

Slide 5: Main users and roles.

Slide 6: Technical architecture.

Slide 7: Database and UML overview.

Slide 8: Live demo or video: gallery exploration and object inspection.

Slide 9: Live demo or video: seller upload and buyer purchase.

Slide 10: Challenges, solutions, conclusion, and perspectives.

## Risk Management

### 3D Complexity

Risk: Three.js or React Three Fiber can take time to master.

Mitigation: Start with a simple 3D viewer, then build the gallery scene after the viewer works.

### Heavy 3D Models

Risk: Large models can make the app slow.

Mitigation: Use optimized GLB files, compressed textures, lazy loading, and simple lighting.

### Time Pressure

Risk: The project is ambitious for a PFE timeline.

Mitigation: Prioritize the MVP: auth, catalog, one 3D viewer, one gallery scene, seller/admin dashboards, simulated purchase.

### UX Difficulty

Risk: Users may not understand 3D controls.

Mitigation: Use familiar orbit controls, clear buttons, default camera positions, and simple labels.

### Academic Documentation

Risk: The report may not show enough technical depth.

Mitigation: Keep notes during development about choices, bugs, diagrams, and 3D optimization.

## Current Repo Notes

Existing structure:

- `backend/`: Django project.
- `frontend/`: Vite React frontend.
- `frontend/src/App.tsx`: current active frontend file.

Before implementing new features, inspect the existing files and preserve any user changes.

## Immediate Next Tasks

- [x] Inspect backend apps and current authentication setup.
- [x] Inspect frontend routes/components and current `App.tsx`.
- [x] Decide whether to keep SQLite for now or configure PostgreSQL later.
- [x] Implement or complete role-based authentication.
- [x] Create backend models for categories, artifacts, galleries, exhibits, and orders.
- [x] Create API serializers/views/routes.
- [x] Build frontend catalog and artifact detail page.
- [x] Add 3D viewer dependency and first GLB model demo.
- [ ] Build seller dashboard for artifact creation.
- [ ] Build admin validation workflow.
- [ ] Build buyer cart/wishlist and simulated checkout.
