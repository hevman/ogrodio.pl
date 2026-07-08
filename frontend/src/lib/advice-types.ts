export type AdviceSeo = {
  description: string;
  keywords: string[];
  title: string;
};

export type AdviceDiscover = {
  angle?: string;
  description?: string;
  enabled?: boolean;
  freshness?: string;
  headline?: string;
  image?: string;
  imageAlt?: string;
};

export type AdviceDiscoverMeta = {
  angle?: string;
  description: string;
  enabled: boolean;
  headline: string;
  image: string;
  imageAlt: string;
  updatedAt: string;
};

export type AdviceSection = {
  heading: string;
  paragraphs: string[];
};

export type AdviceFaq = {
  question: string;
  answer: string;
};

export type AdviceInlineImage = {
  src: string;
  alt: string;
};

export type GanttChartRow = {
  name: string;
  group: string;
  start: number;
  end: number;
};

export type GanttMonth = {
  label: string;
  weeks: number;
};

export type GanttChart = {
  title?: string;
  subtitle?: string;
  months: GanttMonth[];
  rows: GanttChartRow[];
};

export type VarietyTableRow = {
  name: string;
  group: string;
  harvest: string;
  fruitSize: string;
  taste: string;
  yield: string;
  notes?: string;
};

export type VarietyTable = {
  caption?: string;
  tableIntro?: string;
  columns?: [string, string, string, string, string, string, string];
  rows: VarietyTableRow[];
};

export type AdviceArticle = {
  coverAlt: string;
  coverImage: string;
  discover?: AdviceDiscover;
  faq?: AdviceFaq[];
  inlineImage?: AdviceInlineImage;
  ganttChart?: GanttChart;
  varietyTable?: VarietyTable;
  readingMinutes: number;
  relatedArticles?: string[];
  sections: AdviceSection[];
  seo: AdviceSeo;
  slug: string;
  summary: string;
  tips: string[];
  title: string;
  topic: string;
  createdAt: string;
  updatedAt: string;
};
