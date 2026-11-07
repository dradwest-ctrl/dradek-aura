# AuroraLuxe — Guide de démarrage rapide

Bienvenue sur AuroraLuxe, une boutique e-commerce de luxe pour montres premium. Ce guide couvre l'installation, l'exécution, et le déploiement.

## Fonctionnalités principales

- **Frontend**: Boutique en ligne responsive pour homme et femme
- **Panier**: Gestion client-side des articles et commandes
- **Paiement Cash on Delivery**: Formulaire de commande complet pour la livraison au Maroc
- **Confirmation de commande**: Page de confirmation sécurisée avec référence de commande unique
- **Administration**: Système d'authentification administrateur sécurisé pour la gestion des commandes et produits
- **Gestion des produits**: CRUD complet des produits avec téléchargement d'images via l'interface admin
- **Clients**: Vue de gestion des clients dérivée des commandes
- **Thème**: Commutation claire/sombre avec mémoire utilisateur
- **WhatsApp**: Bouton d'appel WhatsApp flottant avec numéro d'entreprise configurable
- **Maillot**: Annonce de livraison configurable (ex: "LIVRAISON GRATUITE PARTOUT AU MAROC")

## Prérequis

- Node.js 18+
- PostgreSQL (ou SQLite pour le développement)
- npm ou pnpm

## Installation

```bash
# Clonez ce dépôt (si applicable)
git clone <votre-dépôt>
cd aurora-luxe

# Installez les dépendances
npm install

# Configurez l'environnement
cmp .env.example .env.local
# Remplissez les variables suivantes:
# - DATABASE_URL: URL de connexion PostgreSQL (ou fichier SQLite)
# - ADMIN_USERNAME: Nom d'utilisateur admin (défaut: "admin")
# - ADMIN_PASSWORD_HASH: Hash bcrypt du mot de passe admin (généré via scripts/hash-password.js)
# - JWT_SECRET: Secret pour signer les JWT
# - NEXT_PUBLIC_WHATSAPP_NUMBER: Numéro d'entreprise WhatsApp (format international sans +)
# - NEXT_PUBLIC_APP_URL: URL de la production (défaut: http://localhost:3000)

# Initialisez la base de données et créez le premier admin
npx prisma migrate dev
npx prisma db seed

# Exécutez la migration du hash du mot de passe admin si nécessaire
node scripts/hash-password.js [votre-mot-de-passe]
```

## Lancement du développement

```bash
# Démarrer le client Next.js + le serveur API
npm run dev
```

Visitez `http://localhost:3000` pour voir la démo.

## Scripts utiles

| Script | Description |
|--------|-------------|
| `npm run dev` | Lancer le serveur de développement Next.js |
| `npm run build` | Construire pour la production |
| `npm run start` | Démarrer le serveur de production |
| `npx prisma migrate dev` | Exécuter les migrations Prisma |
| `npx prisma db seed` | Charger les données démo (12 hommes + 12 femmes) |
| `node scripts/hash-password.js <password>` | Générer le hash bcrypt pour ADMIN_PASSWORD_HASH |

## Configuration avant production

### 1. Hash du mot de passe admin
```bash
# Générez un hash sécurisé
node scripts/hash-password.js MotDePasseFort2025

# Copiez le hash dans ADMIN_PASSWORD_HASH de .env.local
```

### 2. Base de données PostgreSQL
```
# Exemple de connection string
DATABASE_URL=postgresql://user:password@localhost:5432/aurora_luxe
```

### 3. Stockage d'images
Si vous déployez sur Vercel (filetère éphémère), migrez les téléchargements locaux vers :`UploadThing` ou `Cloudinary`.

### 4. HTTPS et cookies sécurisés
Dans la production :`
- Assurez HTTPS (traefik, nginx, etc.)
- Activez le flag `Secure` sur les cookies `aurora_session`
- Configurez le `SameSite=Strict`

### 5. Numéro WhatsApp et annonce de livraison
Ajoutez votre véritable numéro d'entreprise dans `NEXT_PUBLIC_WHATSAPP_NUMBER` (format international, sans `+`).
Configurez `StoreSettings` pour l'annonce de livraison (texte, activation).

### 6. Données de marque
Remplacez tous les actifs démo (`public/assets/products/`, `public/assets/logo/`, `app/(store)/page.tsx` héros, etc.) avec vos vraies photos, texte et identifiants.

## Structure des données

### Produit (table `Product`)
- `id`, `name`, `slug`, `category` (MEN/WOMEN), `description`
- `price`, `salePrice`, `sku`, `stock`, `images[]`, `variants`
- `featured`, `active`, timestamps

### Commande (table `Order`)
- `reference` (unique), `customerName`, `phone`, `city`, `address`, `addressExtra`, `notes`
- `items[]` (référence snapshot), `subtotal`, `shipping`, `total`
- `paymentMethod` (COD), `status` (PENDING, CONFIRMED, etc.), timestamps

### OrderItem (table `OrderItem`)
- Lien vers `Order` et `Product` (nullable pour l'historique)
- Snapshot de nom de produit, prix, variante, quantité

### StoreSettings (table `StoreSettings`)
- Clé-valeur flexible : `whatsapp_number`, `announcement_text`, `announcement_enabled`, `shipping_fee`, `free_shipping_threshold`

## Sécurité

### Auth admin
- JWT signé avec `httpOnly`, `Secure` cookie `aurora_session`
- Rate limiting (5 tentatives/15min) via `lru-cache` (mémoire)
- Protection CSRF sur toutes les routes d'état modifiant l'état
- Accès middleware et API route check sur `/admin/**`

### Intégrité des prix
La route `POST /api/orders` n'accepte jamais de prix du client ; elle re-fetch les prix en temps réel depuis DB et calcule les totaux.

### Téléchargement d'images
Valide le type (jpg/png/webp), la taille (max 5MB), renomme en UUID + extension, stocke dans `public/uploads/` (ou service cloud).

### Error handling
Pas de détails d'erreur techniques exposés au frontend ; tous les logs sont console-édités.

## SEO et performance

- Toutes les routes de collection et produit sont pré-rendues (`ISR` 1h)
- Balises meta avec données structurées via `generateMetadata()`
- `next/image` avec `sizes` pour une charge rapide sur mobile
- En-têtes de sécurité (CSP, X-Frame-Options, Referrer-Policy)
- Pas de CSS ou JS non nécessaire sur le frontend

## Adaptation mobile

- Conception mobile-first, responsive jusqu'à 360px
- Indicateur de toucher de 44px+ pour les boutons et selects
- Éviter les layout shifts avec `width`/`height` explicite
- Animation réduite via `@media (prefers-reduced-motion)`

## Testez l'intégration e2e

1. `npm run dev` – lance le serveur.
2. **Homepage** – affiche les deux grilles de collections.
3. **Collection Homme** – au moins 10 produits affichés, filtrage et pagination fonctionnent.
4. **Produit détail** – cliquer ouvre la page produit, affiche les détails.
5. **Panier** – ajouter un produit, la quantité change, le total s'update.
6. **Checkout** – remplir le formulaire de livraison marocain, validation française, soumettre une commande.
7. **Page de confirmation** – référence unique, détails du client et des articles.
8. **Admin login** – connexion avec admin/password via les variables d'environnement.
9. **Admin dashboard** – overview stats, liste des commandes.
10. **Admin commande** – changer le statut, voir les détails du client.

Si des tests automatisés sont requis, ajoutez `jest`/`playwright` à `package.json` plus tard ; le site fonctionne déjà entièrement sans tests frontend.

## Fichiers supportés

- `app/(store)/` – routes storefront (`page.tsx`, `about/page.tsx`, `collections/[gender]/page.tsx`, `products/[slug]/page.tsx`, `checkout/page.tsx`, `order-confirmation/[ref]/page.tsx`)
- `app/admin/` – pages dashboard (`login/page.tsx`, `dashboard/page.tsx`, `orders/page.tsx`, `products/page.tsx`, `customers/page.tsx`, `settings/page.tsx`)
- `app/api/` – routes API (`products/`, `orders/`, `admin/auth/`, `admin/products/`, `admin/orders/`)
- `components/` – composants réutilisables (`ui/`, `layout/`, `products/`, `checkout/`, `admin/`, etc.)
- `lib/` – utilitaires (`prisma.ts`, `auth.ts`, `validations.ts`, `utils.ts`, `store/cart.ts`)
- `prisma/` – schéma et seed
- `public/` – actifs (`uploads/`, `assets/`, images démo)
- `scripts/` – utilitaires (`hash-password.js`)

## Documentation à venir

- `public/assets/products/README.md` – Guide d'intégration des images (version arabe/Darija)
- `SECURITY.md` – Présentation des contrôles de sécurité
- `DEPLOYMENT.md` – Notes de déploiement pour VPS et Vercel (à venir)

## Liens utiles

- [Next.js (App Router)](https://nextjs.org/docs/app)
- [Prisma (SQLite/PostgreSQL)](https://www.prisma.io/docs/orm)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Zod (validation)](https://zod.dev/)
- [bcrypt.js](https://github.com/bcryptjs/bcrypt.js)
- [next-themes](https://github.com/pacocampisi/next-themes)

## Crédit et inspiration

- Référence visuelle : [Royal Chrono](https://royalchrono.co/collections/best-watches) (élégance, mise en page luxe)
- Instagram de la marque : https://www.instagram.com/auror4luxe/

---

**Note :** Ce dépôt est un prototype de production orienté. Toutes les fonctionnalités démo sont entièrement fonctionnelles ; les seules étapes restantes sont le remplacement des actifs et la configuration de l'environnement avant le lancement.

Si vous avez des questions ou besoin d'aide sur une fonctionnalité spécifique, mentionnez simplement quelle partie et je peux approfondir !