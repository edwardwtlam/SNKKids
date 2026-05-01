#!/usr/bin/env python3
"""
SNKKids News Refresh Script — CI/GitHub Actions version
Reads credentials from environment variables (set as GitHub Secrets).
Runs twice daily via GitHub Actions cron:
  - 9:00 AM HKT (01:00 UTC)
  - 2:00 PM HKT (06:00 UTC)
Generates 6 articles per run:
  - 香港新聞 (Hong Kong): 1 Chinese + 1 English
  - 中國新聞 (China):     1 Chinese + 1 English
  - 國際新聞 (International): 1 Chinese + 1 English
"""
import os
import json
import random
import logging
import sys
from datetime import datetime, timezone, timedelta
from openai import OpenAI
from supabase import create_client, Client

# ── Configuration — read from environment variables ────────────────────────────
SUPABASE_URL              = os.environ["SUPABASE_URL"]
SUPABASE_SERVICE_ROLE_KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
DEEPSEEK_API_KEY          = os.environ["DEEPSEEK_API_KEY"]

# HKT = UTC+8
HKT = timezone(timedelta(hours=8))

# ── Logging ────────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
log = logging.getLogger("snkkids")

# ── Categories ─────────────────────────────────────────────────────────────────
CATEGORIES = [
    {"key": "hong_kong",      "label_zh": "香港新聞",  "label_en": "Hong Kong News"},
    {"key": "china",          "label_zh": "中國新聞",  "label_en": "China News"},
    {"key": "international",  "label_zh": "國際新聞",  "label_en": "International News"},
]

# ── Evergreen topic pools ──────────────────────────────────────────────────────
EVERGREEN_TOPICS = {
    "hong_kong": [
        "Hong Kong's marine conservation efforts and coral reef protection",
        "The history and expansion of Hong Kong's MTR system",
        "Hong Kong's wetland parks and migratory bird watching",
        "Traditional Chinese medicine in modern Hong Kong healthcare",
        "Hong Kong's international airport and aviation industry",
        "Street food culture and local cuisine in Hong Kong",
        "Hong Kong's public libraries and reading programmes for kids",
        "The history of Hong Kong's iconic double-decker trams",
        "Hong Kong's hiking trails and country parks",
        "Recycling and environmental initiatives in Hong Kong schools",
        "Hong Kong's science and technology education for students",
        "The story of Hong Kong's fishing villages and maritime heritage",
        "Hong Kong's arts and cultural festivals throughout the year",
        "How Hong Kong manages its water supply from Dongjiang",
        "Hong Kong students winning international science competitions",
        "The history of Hong Kong's Star Ferry and Victoria Harbour",
        "Food safety and farm-to-table initiatives in Hong Kong",
        "Hong Kong's role as a global financial centre explained for kids",
        "Community helpers: firefighters, paramedics and lifeguards in HK",
        "Hong Kong's unique blend of Eastern and Western architecture",
    ],
    "china": [
        "China's high-speed rail network connecting cities across the country",
        "The story of giant pandas and conservation efforts in Sichuan",
        "China's space programme and the Tiangong space station",
        "The Yangtze River: wildlife, ecology and conservation",
        "China's renewable energy revolution — solar and wind power",
        "The Great Wall of China: history and preservation efforts",
        "China's ancient Silk Road and its modern revival",
        "How China is fighting desertification with tree planting",
        "China's deep-sea exploration and ocean research",
        "Traditional Chinese festivals and their cultural significance",
        "China's role in global scientific research and innovation",
        "The discovery of new species in China's biodiversity hotspots",
        "China's ancient inventions that changed the world",
        "How China is building smart cities for the future",
        "China's efforts to protect endangered species like the snow leopard",
        "The story of China's terracotta warriors and ancient history",
        "China's moon exploration missions and lunar discoveries",
        "How China produces and exports tea to the world",
        "China's traditional medicine and herbal remedies",
        "The story of China's Yangtze River dolphin conservation",
    ],
    "international": [
        "NASA's Mars rover discoveries and the search for life",
        "The history and values of the Olympic Games",
        "How scientists are fighting climate change around the world",
        "The Amazon rainforest: biodiversity and conservation challenges",
        "How vaccines protect children from diseases worldwide",
        "The story of the International Space Station and astronaut life",
        "Ocean plastic pollution and kids making a difference",
        "How the United Nations helps countries work together",
        "The history of the internet and how it changed the world",
        "Endangered animals around the world and conservation efforts",
        "How solar energy is powering homes and schools globally",
        "The story of the Great Barrier Reef and coral conservation",
        "How children around the world go to school differently",
        "The history of flight from the Wright Brothers to modern jets",
        "How scientists study earthquakes and volcanoes to keep us safe",
        "The story of Malala and children's right to education",
        "How the world is working to reduce food waste",
        "The discovery of new planets and exoplanets by telescopes",
        "How sign language connects deaf communities worldwide",
        "The history and science behind the Northern Lights",
    ],
}

# ── System prompt ──────────────────────────────────────────────────────────────
SYSTEM_PROMPT = """You are a bilingual (Traditional Chinese + English) children's news editor for SNK Kids, a Hong Kong primary school news platform for ages 8–14.

Your task: Given a news topic, write ONE complete bilingual article in JSON format.

CONTENT REQUIREMENTS:
- Both Chinese AND English versions must be written in full
- Each perspective must be LONG and DETAILED — minimum 500 Chinese characters per perspective, minimum 300 English words per perspective
- Use simple, engaging language appropriate for primary school children
- Include vivid examples, analogies, and relatable comparisons
- Be educational, positive, and thought-provoking
- NEVER include violent, disturbing, or age-inappropriate content

STRUCTURE: Return a single JSON object with ALL these fields:

{
  "title_zh": "Chinese title (engaging, 10-20 characters)",
  "title_en": "English title (engaging, 8-15 words)",
  "preview_text_zh": "Chinese preview/summary (50-80 characters)",
  "preview_text_en": "English preview/summary (30-50 words)",
  "perspective_a_title_zh": "Perspective A title in Chinese",
  "perspective_a_title_en": "Perspective A title in English",
  "perspective_a_content_zh": "LONG Chinese content for Perspective A — minimum 500 characters, use paragraphs, include facts, examples, and explanations",
  "perspective_a_content_en": "LONG English content for Perspective A — minimum 300 words, use paragraphs, include facts, examples, and explanations",
  "perspective_b_title_zh": "Perspective B title in Chinese",
  "perspective_b_title_en": "Perspective B title in English",
  "perspective_b_content_zh": "LONG Chinese content for Perspective B — minimum 500 characters, use paragraphs, include facts, examples, and explanations",
  "perspective_b_content_en": "LONG English content for Perspective B — minimum 300 words, use paragraphs, include facts, examples, and explanations",
  "vocabulary": [
    {
      "word_zh": "詞語",
      "word_en": "Word",
      "explanation_zh": "中文解釋（一句話，適合小學生）",
      "explanation_en": "English explanation (one sentence, child-friendly)"
    }
  ],
  "questions": [
    {
      "question_zh": "思考問題（中文）",
      "question_en": "Think-about-it question (English)"
    }
  ],
  "topic_area": "one of: 科學探索 / 地球環境 / 香港社會 / 教育學習 / 科技趣聞 / 健康文化 / 交通出行 / 兒童理財 / 歷史故事 / 保育生態 / 食物農業",
  "is_safe": true
}

VOCABULARY: Include exactly 5-7 vocabulary items. Each must have word_zh, word_en, explanation_zh, explanation_en.
QUESTIONS: Include exactly 3 thought-provoking questions. Each must have question_zh and question_en.
IMPORTANT: Return ONLY valid JSON. No markdown, no code blocks, no extra text."""

def pick_topic(category_key: str) -> str:
    """Pick a random topic from the evergreen pool."""
    return random.choice(EVERGREEN_TOPICS[category_key])

def call_deepseek(client: OpenAI, topic: str, category_zh: str, language: str) -> dict:
    """Call DeepSeek to generate a bilingual article for the given topic."""
    lang_instruction = (
        "Write the article primarily focusing on the CHINESE version. Make the Chinese content especially rich and detailed."
        if language == "zh"
        else "Write the article primarily focusing on the ENGLISH version. Make the English content especially rich and detailed."
    )
    user_prompt = f"""Category: {category_zh}
Topic: {topic}
{lang_instruction}

Write a complete, engaging bilingual article about this topic for Hong Kong primary school students.
Remember: BOTH perspectives must be LONG (500+ Chinese chars / 300+ English words each).
Include 5-7 vocabulary items and 3 thought-provoking questions.
Return ONLY valid JSON."""

    response = client.chat.completions.create(
        model="deepseek-chat",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user",   "content": user_prompt},
        ],
        temperature=0.7,
        max_tokens=8192,
        response_format={"type": "json_object"},
    )
    content = response.choices[0].message.content
    try:
        return json.loads(content)
    except json.JSONDecodeError:
        log.warning("JSON parse failed on first attempt, retrying...")
        retry_response = client.chat.completions.create(
            model="deepseek-chat",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user",   "content": user_prompt + "\n\nCRITICAL: Your previous response had a JSON syntax error. Return ONLY valid, complete JSON. No truncation."},
            ],
            temperature=0.5,
            max_tokens=8192,
            response_format={"type": "json_object"},
        )
        return json.loads(retry_response.choices[0].message.content)

def build_article_row(result: dict, category_key: str, language: str) -> dict:
    """Build the Supabase articles table row from the DeepSeek result."""
    today = datetime.now(HKT).strftime("%Y-%m-%d")
    is_zh = language == "zh"
    return {
        "category":              category_key,
        "language":              language,
        "title":                 result["title_zh"] if is_zh else result["title_en"],
        "preview_text":          result["preview_text_zh"] if is_zh else result["preview_text_en"],
        "perspective_a_title":   result["perspective_a_title_zh"] if is_zh else result["perspective_a_title_en"],
        "perspective_a_content": result["perspective_a_content_zh"] if is_zh else result["perspective_a_content_en"],
        "perspective_b_title":   result["perspective_b_title_zh"] if is_zh else result["perspective_b_title_en"],
        "perspective_b_content": result["perspective_b_content_zh"] if is_zh else result["perspective_b_content_en"],
        "vocabulary":            result.get("vocabulary", []),
        "questions":             result.get("questions", []),
        "source_url":            f"https://snkkids.com/evergreen/{category_key}/{today}",
        "source_name":           "SNK Kids 編輯部",
        "topic_area":            result.get("topic_area", "education"),
        "is_featured":           False,
        "published_at":          today,
    }

def run_refresh():
    """Main entry point: generate and save 6 articles (3 categories × 2 languages)."""
    log.info("=" * 60)
    log.info("SNKKids News Refresh — %s HKT", datetime.now(HKT).strftime("%Y-%m-%d %H:%M"))
    log.info("=" * 60)

    deepseek = OpenAI(
        api_key=DEEPSEEK_API_KEY,
        base_url="https://api.deepseek.com",
    )
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    results_summary = []
    first_inserted_id = None

    for cat in CATEGORIES:
        for lang in ["zh", "en"]:
            label = f"{cat['label_zh']} ({lang.upper()})"
            try:
                topic = pick_topic(cat["key"])
                log.info("[%s] Topic: %s", label, topic)
                article_data = call_deepseek(deepseek, topic, cat["label_zh"], lang)

                if not article_data.get("is_safe", True):
                    log.warning("[%s] Article flagged as unsafe — skipping", label)
                    results_summary.append({"category": cat["key"], "language": lang, "status": "filtered_unsafe"})
                    continue

                row = build_article_row(article_data, cat["key"], lang)
                resp = supabase.table("articles").insert(row).execute()

                if resp.data:
                    inserted_id = resp.data[0].get("id")
                    log.info("[%s] ✅ Saved: %s", label, row["title"])
                    results_summary.append({"category": cat["key"], "language": lang, "status": "success"})
                    if first_inserted_id is None:
                        first_inserted_id = inserted_id
                else:
                    log.error("[%s] Insert returned no data", label)
                    results_summary.append({"category": cat["key"], "language": lang, "status": "error: no data"})

            except Exception as exc:
                log.error("[%s] Error: %s", label, exc)
                results_summary.append({"category": cat["key"], "language": lang, "status": f"error: {exc}"})

    # Mark the first article as featured
    if first_inserted_id:
        try:
            supabase.table("articles").update({"is_featured": True}).eq("id", first_inserted_id).execute()
            log.info("Marked article id=%s as featured", first_inserted_id)
        except Exception as exc:
            log.warning("Could not mark featured article: %s", exc)

    # Summary
    log.info("-" * 60)
    success = sum(1 for r in results_summary if r["status"] == "success")
    log.info("Refresh complete: %d/%d articles saved successfully", success, len(results_summary))
    for r in results_summary:
        log.info("  %s/%s → %s", r["category"], r["language"], r["status"])
    log.info("=" * 60)

    # Exit with error code if any article failed (so GitHub Actions marks the run as failed)
    if success < len(results_summary):
        sys.exit(1)

if __name__ == "__main__":
    run_refresh()
