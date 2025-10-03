# Copilot Instructions - The Aviation Business Podcast

## Project Overview

This is a podcast website for The Aviation Business Podcast built with **Astro v5.7.8**, based on the Astroplate template. The site focuses on flight school management, pilot training, and aviation business content with three main content types: episodes, guests, and static pages. It's SEO-optimized with comprehensive Schema.org markup and deployed to Netlify.

## Architecture & Content System

### Content Collections (Astro Content Layer v5)

Content is defined in `src/content.config.ts` using Astro's loader API:

- **Episodes** (`src/content/episodes/`): Podcast episodes with season/episode numbers, guest references, categories, and tags
- **Guests** (`src/content/guests/`): Guest profiles with social links and descriptions
- **Pages/About/Contact/Sections**: Static content and reusable sections (homepage banner, testimonials, CTA)

All collections use the **glob loader pattern**: `loader: glob({ pattern: "**/*.{md,mdx}", base: "..." })`

Files prefixed with `-` (e.g., `-index.md`) are indexes/config and filtered out in `contentParser.astro` via `data.id.match(/^(?!-)/)`.

### Routing & Data Fetching

- Use `getSinglePage(collectionName)` from `@/lib/contentParser.astro` - it filters drafts and index files
- Dynamic routes use `getStaticPaths()` - see `src/pages/episodes/[single].astro` for pattern
- Sort functions: `sortByDate()`, `sortBySeasonAndEpisode()`, `sortByWeight()` in `@/lib/utils/sortFunctions`
- Guest-episode relationship: episodes reference guests via `guest` frontmatter field (string), matched by slugified title

### Path Aliases (tsconfig.json)

```typescript
"@/components/*" → "src/layouts/components/*"
"@/shortcodes/*" → "src/layouts/shortcodes/*"
"@/helpers/*" → "src/layouts/helpers/*"
"@/partials/*" → "src/layouts/partials/*"
"@/*" → "src/*"
```

Always use these aliases in imports. Components live under `layouts/` not `components/`.

## SEO Implementation (Critical)

### Canonical URLs

**ALWAYS** use canonical utilities from `@/lib/canonical.ts`:

- `getEpisodeCanonical(episodeId)` for episode pages
- `getGuestCanonical(guestId)` for guest pages
- `getCategoryCanonical(category)` / `getTagCanonical(tag)` for taxonomy pages
- `getPaginatedCanonical(basePath, currentPage)` - page 1 canonicals to base path (e.g., `/episodes/page/1` → `/episodes`)
- Pass `canonical` prop to `<Base>` layout

See `docs/CANONICAL_STRATEGY.md` for full strategy.

### Schema.org Structured Data

Implemented via `@/lib/schema.ts` and `<Schema>` component:

- **Episodes**: `getPodcastEpisodeSchema()` - includes season, episode number, guest
- **Guests**: `getPersonSchema()` - Person type with social profiles
- **Homepage**: `getPodcastSeriesSchema()` with latest episodes
- **Collection pages**: `getCollectionPageSchema()` for episodes/guests indexes
- **Breadcrumbs**: `getBreadcrumbSchema()` for navigation hierarchy
- Combine multiple schemas with `combineSchemas([schema1, schema2])`

Example pattern from `src/pages/guests/[single].astro`:

```typescript
const personSchema = getPersonSchema(guest);
const breadcrumbSchema = getBreadcrumbSchema(breadcrumbs);
const schemas = combineSchemas([personSchema, breadcrumbSchema]);
```

## Development Workflow

### Essential Commands

```bash
yarn dev              # Dev server + JSON generation
yarn build            # Production build (includes JSON generation)
yarn generate-json    # Run manually if content changes (scripts/jsonGenerator.js)
yarn format           # Prettier formatting
```

**Important**: The build process runs `jsonGenerator.js` which creates `.json` files for search functionality. If adding/editing episodes or guests, the JSON must be regenerated.

### Build System

- **Package manager**: Yarn (v1.22.22) - specified in `packageManager` field
- **Image optimization**: Sharp (required dependency)
- **Tailwind v4**: Uses `@tailwindcss/vite` plugin in `astro.config.mjs`
- **Deployment**: Netlify (Node 20) - see `netlify.toml`
- **Docker**: Multi-stage build with nginx runner (see `Dockerfile`)

## Common Patterns & Conventions

### Episode/Guest Frontmatter Structure

Episodes require: `title`, `description`, `date`, `season`, `episode`, `guest`, `categories[]`, `tags[]`, `image`

Guests require: `title`, `description`, `image`, `social[]` (with `name`, `icon`, `link`)

### Pagination

- Configured in `src/config/config.json` (`settings.pagination: 6`)
- First page: `/episodes` or `/guests`
- Subsequent pages: `/episodes/page/2`, `/guests/page/2`, etc.
- Use `getPaginatedCanonical()` - ensures page 1 canonicals to base

### Image Handling

- Images stored in `public/images/`
- Use `<ImageMod>` component from `@/components/ImageMod.astro` for optimization
- Reference in frontmatter as `/images/filename.png` (not `./public/...`)
- Sharp handles WebP conversion and responsive sizing

### React Components in Astro

React components (shortcodes) in `src/layouts/shortcodes/*.tsx`:

- `<Youtube>`, `<Video>`, `<Accordion>`, `<Tabs>`, `<Notice>`, `<Button>`
- Automatically imported via `astro-auto-import` config in `astro.config.mjs`
- Use in MDX files without explicit imports

### Taxonomy System

- Categories and tags from episode frontmatter
- Use `getTaxonomy()` and `getAllTaxonomy()` from `@/lib/taxonomyParser.astro`
- Filter with `taxonomyFilter()` from `@/lib/utils/taxonomyFilter`
- Slugified via `slugify()` from `@/lib/utils/textConverter`

## Configuration Files

- **Site config**: `src/config/config.json` - site title, base URL, pagination, metadata
- **Navigation**: `src/config/menu.json` - header/footer menus
- **Social links**: `src/config/social.json` - organization social profiles
- **Theme**: `src/config/theme.json` - Tailwind theme customization

## Documentation

Comprehensive SEO/technical docs in `docs/`:

- `SEO_AUDIT_REPORT.md` - Full SEO analysis
- `CANONICAL_STRATEGY.md` - Canonical URL implementation details
- `SCHEMA_IMPLEMENTATION_REPORT.md` - Schema.org patterns
- `SITEMAP_ENHANCEMENT.md` - Sitemap priority configuration

Reference these when working on SEO features.

## Key Constraints

1. **No trailing slashes**: Set in config (`trailing_slash: false`) and sitemap config - maintain consistency
2. **Draft filtering**: Always filter `draft: true` content in queries (handled by `getSinglePage()`)
3. **Guest matching**: Guests are matched by slugified title, not by ID - ensure consistency
4. **JSON generation**: Must run before dev/build for search to work
5. **Astro v5 APIs**: Use `getCollection`, `getEntry`, `render` from `astro:content` (not deprecated APIs)
