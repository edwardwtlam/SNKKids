export type Category = 'hong_kong' | 'china' | 'international';
export type Language = 'zh' | 'en';

export interface VocabItem {
  word_zh: string;
  word_en: string;
  explanation_zh: string;
  explanation_en: string;
}

export interface QuestionItem {
  question_zh: string;
  question_en: string;
}

export interface Article {
  id: string;
  category: Category;
  language: Language;
  title: string;
  preview_text: string;
  perspective_a_title: string;
  perspective_a_content: string;
  perspective_b_title: string;
  perspective_b_content: string;
  vocabulary: VocabItem[];
  questions: QuestionItem[];
  source_url: string;
  source_name: string;
  topic_area: string;
  is_featured: boolean;
  published_at: string;
  created_at: string;
}

export interface Profile {
  id: string;
  username: string;
  display_name: string;
  reading_streak: number;
  last_read_date: string | null;
  total_points: number;
  articles_read_today: number;
  created_at: string;
}

export interface ReadingHistoryItem {
  id: string;
  article_id: string;
  read_at: string;
  articles: Article;
}

export interface SavedVocabItem {
  id: string;
  article_id: string;
  word_zh: string;
  word_en: string;
  explanation_zh: string;
  explanation_en: string;
  saved_at: string;
  articles: { title: string };
}

export const CATEGORY_LABELS: Record<Category, string> = {
  hong_kong: '香港新聞',
  china: '中國新聞',
  international: '國際新聞',
};

export const CATEGORY_COLORS: Record<Category, { bg: string; text: string; light: string; border: string }> = {
  hong_kong: { bg: 'bg-rose-500', text: 'text-rose-600', light: 'bg-rose-50', border: 'border-rose-200' },
  china: { bg: 'bg-amber-500', text: 'text-amber-600', light: 'bg-amber-50', border: 'border-amber-200' },
  international: { bg: 'bg-teal-500', text: 'text-teal-600', light: 'bg-teal-50', border: 'border-teal-200' },
};

export const TOPIC_AREA_LABELS: Record<string, string> = {
  science: '科學探索',
  environment: '地球環境',
  society: '香港社會',
  health: '健康文化',
  growth: '成長未來',
  animals: '動物世界',
  space: '太空探索',
  tech: '科技趣聞',
  history: '歷史故事',
  conservation: '保育生態',
  food: '食物農業',
  transport: '交通出行',
  education: '教育學習',
  charity: '慈善公益',
  sports: '體育運動',
  culture: '世界文化',
  arts: '藝術創作',
  finance: '兒童理財',
  inspiring: '啟發人物',
  future: '未來世界',
};
