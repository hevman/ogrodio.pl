import * as fs from 'fs';
import * as path from 'path';

const ARTICLES_DIR = path.join(__dirname, '../../content/articles');

interface ArticleInput {
  slug: string;
  title: string;
  topic: string;
  summary: string;
  target_audience: string;
  key_points: string[];
  region: string;
}

interface GeneratedArticle {
  slug: string;
  title: string;
  topic: string;
  summary: string;
  reading_minutes: number;
  cover_image: string;
  cover_alt: string;
  sections: Array<{
    heading: string;
    paragraphs: string[];
  }>;
  faq: Array<{
    question: string;
    answer: string;
  }>;
  tips: string[];
  related_services: string[];
  related_articles: string[];
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
  status: string;
  published_at: string;
  created_at: string;
  updated_at: string;
}

async function generateArticle(input: ArticleInput): Promise<GeneratedArticle> {
  console.log(`🤖 Generuję artykuł: ${input.title}`);
  
  // TODO: Integrate with AI API (OpenAI, Anthropic, etc.)
  // For now, return a template structure
  
  const now = new Date().toISOString();
  
  return {
    slug: input.slug,
    title: input.title,
    topic: input.topic,
    summary: input.summary,
    reading_minutes: 10,
    cover_image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=1400&q=85',
    cover_alt: `${input.topic} w ogrodzie`,
    sections: [
      {
        heading: `Dlaczego ${input.topic.toLowerCase()} jest ważne?`,
        paragraphs: [
          `To jest sekcja wstępna. Tutaj AI powinno wygenerować treść na temat: ${input.summary}`,
          `Kluczowe punkty do omówienia: ${input.key_points.join(', ')}`,
          `Celowana grupa odbiorców: ${input.target_audience}`
        ]
      },
      {
        heading: 'Praktyczne wskazówki',
        paragraphs: [
          'Tutaj AI powinno wygenerować praktyczne wskazówki i porady.',
          'Każdy paragraf powinien być konkretny i użyteczny dla czytelnika.',
          'Unikaj ogólników - podaj konkretne liczby, terminy, procedury.'
        ]
      }
    ],
    faq: [
      {
        question: 'Jakie są najczęstsze pytania?',
        answer: 'Tutaj AI powinno wygenerować odpowiedzi na najczęstsze pytania związane z tematem.'
      }
    ],
    tips: [
      'Tutaj AI powinno wygenerować krótkie, konkretne wskazówki.',
      'Każda porada powinna być praktyczna i łatwa do zapamiętania.'
    ],
    related_services: ['Zakładanie ogrodów', 'Pielęgnacja sezonowa'],
    related_articles: [],
    seo: {
      title: input.title,
      description: input.summary,
      keywords: [input.topic.toLowerCase(), input.region, 'poradnik']
    },
    status: 'draft',
    published_at: now,
    created_at: now,
    updated_at: now
  };
}

async function saveArticle(article: GeneratedArticle): Promise<void> {
  const filePath = path.join(ARTICLES_DIR, `${article.slug}.json`);
  fs.writeFileSync(filePath, JSON.stringify(article, null, 2), 'utf-8');
  console.log(`💾 Zapisano: ${filePath}`);
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('📖 Użycie: npm run generate-article -- <slug> "<tytuł>" "<temat>" "<podsumowanie>"');
    console.log('Przykład: npm run generate-article -- nowy-artykul "Nowy artykuł" "Trawnik" "Opis artykułu"');
    process.exit(1);
  }

  const [slug, title, topic, summary] = args;
  
  const input: ArticleInput = {
    slug,
    title,
    topic,
    summary,
    target_audience: 'Właściciele ogrodów w Wielkopolsce',
    key_points: [],
    region: 'Wielkopolska'
  };

  try {
    const article = await generateArticle(input);
    await saveArticle(article);
    console.log('✅ Artykuł wygenerowany i zapisany!');
    console.log(`📝 Edytuj plik: ${path.join(ARTICLES_DIR, `${slug}.json`)}`);
    console.log('🔄 Następnie uruchom: npm run import-articles');
  } catch (error: any) {
    console.error('❌ Błąd:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { generateArticle, saveArticle };
