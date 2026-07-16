# Obrazy w projekcie

## Strategia optymalizacji

**Wszystkie obrazy artykułów są już zoptymalizowane na serwerze** i serwowane jako statyczne pliki WebP.

### Dlaczego natywne `<img>` zamiast Next.js Image?

1. **Obrazy są pre-optymalizowane** - wszystkie pliki w `/images/articles/` są już skompresowane i przekonwertowane do WebP
2. **Unikamy podwójnej optymalizacji** - Next.js Image Optimization zbędnie przetwarza obrazy
3. **Google crawlability** - natywne `<img>` są natychmiast widoczne dla Googlebot podczas SSR
4. **Prostota** - brak client-side state management, brak placeholderów, brak fallbacków
5. **Performance** - eliminujemy overhead Next.js Image Optimization API

### Struktura obrazów

```
frontend/public/images/articles/
├── *-cover.webp          # Obrazy główne (hero) artykułów
├── *-detail.webp         # Obrazy inline w treści artykułów
└── *-thumb.webp          # Miniatury (jeśli używane)
```

### Komponenty obrazów

**Dla artykułów:**
- `ArticleHeroImage` - hero image na górze artykułu (eager loading)
- `ArticleInlineImage` - obrazy w treści artykułu (lazy loading)
- `HomeLeadArticleImage` - featured article na stronie głównej
- `HomeSideArticleImage` - boczne artykuły na stronie głównej

**Wszystkie używają natywnego `<img>`** bez Next.js Image.

### SEO i Open Graph

Open Graph obrazy dla metadanych używają bezpośrednich URL:
```typescript
openGraph: {
  images: [{ url: '/images/articles/nazwa-obrazu.webp', width: 1200, height: 630 }]
}
```

### Migracja z Next.js Image

Jeśli znajdziesz kod używający Next.js Image dla obrazów artykułów:

❌ **Stary sposób:**
```tsx
import Image from "next/image";

<Image
  src={article.coverImage}
  alt={article.coverAlt}
  fill
  quality={70}
  sizes="100vw"
/>
```

✅ **Nowy sposób:**
```tsx
<img
  src={article.coverImage}
  alt={article.coverAlt}
  className="absolute inset-0 h-full w-full object-cover"
  loading="eager" // lub "lazy" dla obrazów poniżej fold
/>
```

### Kiedy używać Next.js Image?

Next.js Image może być używany dla:
- Obrazów produktów ze sklepu (jeśli nie są pre-optymalizowane)
- Obrazów użytkowników (avatary, uploads)
- Obrazów z zewnętrznych źródeł
- Obrazów które wymagają różnych rozmiarów (thumbnails generowane on-the-fly)

**Nie używaj** Next.js Image dla obrazów z `/images/articles/` - są już zoptymalizowane.
