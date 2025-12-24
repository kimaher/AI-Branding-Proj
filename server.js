import "dotenv/config";
import express from "express";
import OpenAI from "openai";

const app = express();
const port = Number(process.env.PORT || 3000);

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(express.json({ limit: "2mb" }));
app.use(express.static("public"));

function splitIntoBeats(text, maxBeats = 6) {
  const cleaned = (text || "").trim().replace(/\s+/g, " ");
  if (!cleaned) return [];

  // Simple deterministic splitting: sentences, then chunk them.
  const sentences = cleaned
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(Boolean);

  if (sentences.length === 0) return [];

  // Aim for <= maxBeats chunks.
  const chunkSize = Math.ceil(sentences.length / maxBeats);
  const beats = [];
  for (let i = 0; i < sentences.length; i += chunkSize) {
    beats.push(sentences.slice(i, i + chunkSize).join(" "));
  }
  return beats.slice(0, maxBeats);
}

function buildFramePrompt({ beatText, style }) {
  const styleLine =
    style === "anime" ? "anime film still" :
    style === "noir" ? "black-and-white noir film still" :
    style === "sketch" ? "ink sketch storyboard panel" :
    "cinematic film still";

  // Keep prompts consistent to reduce randomness.
  return [
    `Storyboard frame, ${styleLine}.`,
    `Scene: ${beatText}`,
    `Composition: clear subject, simple background, strong silhouette.`,
    `Camera: wide or medium shot, readable staging.`,
    `Lighting: dramatic, high contrast, filmic.`,
    `No text, no captions, no speech bubbles.`
  ].join("\n");
}

app.post("/api/storyboard", async (req, res) => {
  try {
    const { story, style = "cinematic", maxBeats = 6, size = "1024x1024" } = req.body || {};

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: "Missing OPENAI_API_KEY" });
    }

    const beats = splitIntoBeats(story, Number(maxBeats) || 6);
    if (beats.length === 0) {
      return res.status(400).json({ error: "Provide non-empty story text." });
    }

    const frames = [];
    for (let i = 0; i < beats.length; i++) {
      const prompt = buildFramePrompt({ beatText: beats[i], style });

      // Image generation via the Image API. :contentReference[oaicite:1]{index=1}
      const img = await client.images.generate({
        model: "gpt-image-1.5",
        prompt,
        size
      });

      // The SDK returns base64 in img.data[0].b64_json for Image API responses.
      const b64 = img?.data?.[0]?.b64_json;
      if (!b64) throw new Error("No image returned for a frame.");

      frames.push({
        index: i + 1,
        beat: beats[i],
        prompt,
        dataUrl: `data:image/png;base64,${b64}`
      });
    }

    res.json({ beats, frames });
  } catch (err) {
    res.status(500).json({ error: err?.message || "Server error" });
  }
});

app.listen(port, () => {
  console.log(`Running on http://localhost:${port}`);
});