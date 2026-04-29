import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const CATEGORIES = [
  { key: "hong_kong", label_zh: "香港新聞" },
  { key: "china", label_zh: "中國新聞" },
  { key: "international", label_zh: "國際新聞" },
];

const DEEPSEEK_SYSTEM_PROMPT = `You are a professional children's news writer for a bilingual (Traditional Chinese & English) news platform for primary school students in Hong Kong.

Your task is to rewrite news articles into kid-friendly content with the following requirements:

1. LANGUAGE & READING LEVEL:
   - Use simple vocabulary and clear sentence structures suitable for primary school students (ages 6-12)
   - Traditional Chinese version should use common characters, avoid overly formal language
   - English version should use simple words, short sentences

2. MULTI-PERSPECTIVE FORMAT (CRITICAL):
   - You MUST write from at least TWO different angles/perspectives per article
   - Perspective A: Present the news from one viewpoint (e.g., economic benefits, technological progress)
   - Perspective B: Present the news from a different viewpoint (e.g., environmental concerns, social impact)
   - Each perspective MUST have a clear title that labels the specific angle/POV being taken
   - The two perspectives should genuinely differ in their framing and emphasis

3. EDUCATIONAL ELEMENTS:
   - Vocabulary Box (詞彙表): Include 3-5 keywords with bilingual explanations
   - Think About It (動腦筋): Include 2 comprehension/critical thinking questions in both languages

4. CONTENT SAFETY:
   - NO violent, bloody, or overly complex political content
   - Focus on positive, educational, and inspiring topics
   - If the source material is inappropriate, generate an "Evergreen" educational piece instead

5. OUTPUT FORMAT:
   Return a JSON object with this exact structure:
   {
     "title_zh": "Catchy kid-friendly title in Traditional Chinese",
     "title_en": "Catchy kid-friendly title in English",
     "preview_text_zh": "First 2 lines summary in Chinese (max 80 chars)",
     "preview_text_en": "First 2 lines summary in English (max 120 chars)",
     "perspective_a_title_zh": "Perspective A title in Chinese",
     "perspective_a_title_en": "Perspective A title in English",
     "perspective_a_content_zh": "Full Perspective A content in Chinese (200-300 chars)",
     "perspective_a_content_en": "Full Perspective A content in English (200-300 words)",
     "perspective_b_title_zh": "Perspective B title in Chinese",
     "perspective_b_title_en": "Perspective B title in English",
     "perspective_b_content_zh": "Full Perspective B content in Chinese (200-300 chars)",
     "perspective_b_content_en": "Full Perspective B content in English (200-300 words)",
     "vocabulary": [
       {"word_zh": "中文詞", "word_en": "English word", "explanation_zh": "中文解釋", "explanation_en": "English explanation"}
     ],
     "questions": [
       {"question_zh": "中文問題", "question_en": "English question"}
     ],
     "topic_area": "one of: science, environment, society, health, growth, animals, space, tech, history, conservation, food, transport, education, charity, sports, culture, arts, finance, inspiring, future",
     "is_safe": true
   }

IMPORTANT: You MUST return ONLY valid JSON. No markdown, no code fences, no extra text.`;

interface DeepSeekResponse {
  title_zh: string;
  title_en: string;
  preview_text_zh: string;
  preview_text_en: string;
  perspective_a_title_zh: string;
  perspective_a_title_en: string;
  perspective_a_content_zh: string;
  perspective_a_content_en: string;
  perspective_b_title_zh: string;
  perspective_b_title_en: string;
  perspective_b_content_zh: string;
  perspective_b_content_en: string;
  vocabulary: Array<{ word_zh: string; word_en: string; explanation_zh: string; explanation_en: string }>;
  questions: Array<{ question_zh: string; question_en: string }>;
  topic_area: string;
  is_safe: boolean;
}

async function callDeepSeek(apiKey: string, prompt: string): Promise<DeepSeekResponse> {
  const response = await fetch(
    "https://api.deepseek.com/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: DEEPSEEK_SYSTEM_PROMPT },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 4096,
        response_format: { type: "json_object" },
      }),
    }
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`DeepSeek API error: ${response.status} - ${err}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error("No response from DeepSeek");

  return JSON.parse(text) as DeepSeekResponse;
}

async function generateEvergreenTopic(category: string): Promise<string> {
  const evergreenTopics: Record<string, string[]> = {
    hong_kong: [
      "Hong Kong's marine conservation efforts and coral reef protection",
      "The history of Hong Kong's MTR system and its expansion",
      "Hong Kong's wetland parks and migratory bird watching",
      "Traditional Chinese medicine in modern Hong Kong healthcare",
      "Hong Kong's food safety testing and standards",
    ],
    china: [
      "China's space station Tiangong and scientific experiments",
      "Giant panda conservation success stories in Sichuan",
      "China's high-speed rail network expansion",
      "Ancient Chinese inventions that changed the world",
      "China's renewable energy achievements",
    ],
    international: [
      "NASA's Mars rover discoveries and what they mean",
      "Ocean cleanup projects removing plastic waste",
      "New species discovered in the Amazon rainforest",
      "How satellites help predict weather and natural disasters",
      "International Space Station experiments and daily life in space",
    ],
  };

  const topics = evergreenTopics[category] || evergreenTopics.international;
  const randomTopic = topics[Math.floor(Math.random() * topics.length)];
  return randomTopic;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    let apiKey = (Deno.env.get("DEEPSEEK_API_KEY") || "").trim();

    const headerKey = req.headers.get("X-DeepSeek-Key");
    if (headerKey) apiKey = headerKey.trim();

    if (!apiKey && req.method === "POST") {
      try {
        const body = await req.json();
        if (body.api_key) apiKey = String(body.api_key).trim();
      } catch {
        // ignore parse errors
      }
    }

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "DEEPSEEK_API_KEY not configured. Set it as an environment variable or pass via X-DeepSeek-Key header.",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const results: Array<{ category: string; language: string; status: string }> = [];

    for (const category of CATEGORIES) {
      for (const language of ["zh", "en"] as const) {
        try {
          const topic = await generateEvergreenTopic(category.key);
          const langInstruction = language === "zh"
            ? "Write the article in Traditional Chinese. All content fields ending with _zh should be in Traditional Chinese."
            : "Write the article in English. All content fields ending with _en should be in English.";
          const prompt = `Category: ${category.label_zh}\nLanguage: ${langInstruction}\n\nTopic: ${topic}\n\nGenerate a kid-friendly news article. Include two perspectives, vocabulary, and questions. Return ONLY valid JSON.`;

          const result = await callDeepSeek(apiKey, prompt);

          if (!result.is_safe) {
            results.push({ category: category.key, language, status: "filtered_unsafe" });
            continue;
          }

          const article = {
            category: category.key,
            language,
            title: language === "zh" ? result.title_zh : result.title_en,
            preview_text: language === "zh" ? result.preview_text_zh : result.preview_text_en,
            perspective_a_title: language === "zh" ? result.perspective_a_title_zh : result.perspective_a_title_en,
            perspective_a_content: language === "zh" ? result.perspective_a_content_zh : result.perspective_a_content_en,
            perspective_b_title: language === "zh" ? result.perspective_b_title_zh : result.perspective_b_title_en,
            perspective_b_content: language === "zh" ? result.perspective_b_content_zh : result.perspective_b_content_en,
            vocabulary: result.vocabulary,
            questions: result.questions,
            source_url: `https://example.com/evergreen/${category.key}/${Date.now()}`,
            source_name: "小小新聞通編輯部",
            topic_area: result.topic_area,
            is_featured: false,
            published_at: new Date().toISOString().split("T")[0],
          };

          const { error } = await supabase.from("articles").insert(article);
          if (error) {
            results.push({ category: category.key, language, status: `error: ${error.message}` });
          } else {
            results.push({ category: category.key, language, status: "success" });
          }
        } catch (err) {
          results.push({ category: category.key, language, status: `error: ${err instanceof Error ? err.message : "unknown"}` });
        }
      }
    }

    const { data: todayArticles } = await supabase
      .from("articles")
      .select("id")
      .eq("published_at", new Date().toISOString().split("T")[0])
      .limit(1);

    if (todayArticles && todayArticles.length > 0) {
      await supabase.from("articles").update({ is_featured: true }).eq("id", todayArticles[0].id);
    }

    return new Response(
      JSON.stringify({ success: true, results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
