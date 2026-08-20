import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "25mb" }));

// Lazy initialization helper for Gemini
function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is missing.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Health Check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    app: "IdeaForge AI",
    timestamp: new Date().toISOString(),
  });
});

// 1. AI Summarization Endpoint
app.post("/api/ai/summarize", async (req, res) => {
  try {
    const { title, content, mode = "key_points" } = req.body;
    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return res.status(400).json({ error: "Note content is required" });
    }

    const ai = getGeminiClient();

    let modeInstruction = "";
    if (mode === "executive") {
      modeInstruction = "Provide an executive 2-paragraph synthesis capturing the big picture, core insight, and strategic implications.";
    } else if (mode === "cornell") {
      modeInstruction = "Format as Cornell Notes: 1) Cue Keywords & Essential Questions, 2) Core Lecture/Concept Notes, 3) 2-sentence bottom synthesis summary.";
    } else if (mode === "cheat_sheet") {
      modeInstruction = "Produce an ultra-dense, bulleted 'Exam Cheat Sheet' highlighting definitions, formulas/rules, common pitfalls, and high-yield memory aids.";
    } else if (mode === "eli5") {
      modeInstruction = "Explain this note as if explaining to a 10-year-old using intuitive everyday analogies, zero jargon, and vivid storytelling.";
    } else {
      modeInstruction = "Provide a structured breakdown: 1) One-line TL;DR, 2) Top 5 Key Takeaways, 3) Actionable Insights / Real-world Application.";
    }

    const prompt = `You are the Lead Academic & Knowledge Synthesizer for IdeaForge.
Note Title: "${title || "Untitled"}"

${modeInstruction}

Here is the note content:
---
${content}
---

Format output with clean markdown headings and bullet points.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        temperature: 0.3,
      },
    });

    res.json({
      summary: response.text || "No summary generated.",
      mode,
      generatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("AI Summarize error:", error);
    res.status(500).json({ error: error.message || "Failed to generate summary" });
  }
});

// 2. AI Flashcard Generator Endpoint
app.post("/api/ai/flashcards", async (req, res) => {
  try {
    const { title, content, count = 8 } = req.body;
    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return res.status(400).json({ error: "Note content is required" });
    }

    const ai = getGeminiClient();

    const prompt = `You are a cognitive science expert specializing in spaced repetition and active recall for students.
Create exactly ${Math.min(Math.max(Number(count) || 8, 3), 15)} high-yield flashcards from this note.
Each card must test a fundamental concept, formula, mechanism, definition, or key relationship.
Avoid trivial verbatim trivia; focus on deep understanding and recall.

Note Title: "${title || "Study Material"}"
Content:
---
${content}
---`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: {
                type: Type.STRING,
                description: "Clear, concise prompt/question for the front of the card",
              },
              answer: {
                type: Type.STRING,
                description: "Precise, complete answer with key terms highlighted for the back of the card",
              },
              hint: {
                type: Type.STRING,
                description: "A subtle nudge or mnemonic hint to help recall",
              },
              category: {
                type: Type.STRING,
                description: "Sub-topic or concept tag (e.g. 'Definition', 'Mechanism', 'Formula')",
              },
              difficulty: {
                type: Type.STRING,
                description: "'easy', 'medium', or 'hard'",
              },
            },
            required: ["question", "answer", "difficulty"],
          },
        },
      },
    });

    const jsonText = response.text || "[]";
    const flashcards = JSON.parse(jsonText);
    res.json({ flashcards });
  } catch (error: any) {
    console.error("AI Flashcards error:", error);
    res.status(500).json({ error: error.message || "Failed to generate flashcards" });
  }
});

// 3. AI Quiz & Practice Test Maker Endpoint
app.post("/api/ai/quiz", async (req, res) => {
  try {
    const { title, content, questionCount = 6, difficulty = "mixed" } = req.body;
    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return res.status(400).json({ error: "Note content is required" });
    }

    const ai = getGeminiClient();

    const prompt = `You are a University Professor crafting a comprehensive diagnostic practice exam for a high-performing student.
Generate ${Math.min(Math.max(Number(questionCount) || 6, 3), 12)} questions testing concepts in this note.
Include a variety of questions: Multiple Choice (mcq), True/False (true_false), and Fill in the Blank (fill_blank).
Difficulty setting: ${difficulty}.
Provide thorough explanations for why the correct answer is right and why common misconceptions are wrong.

Note Title: "${title || "Study Note"}"
Content:
---
${content}
---`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "Engaging quiz title" },
            estimatedMinutes: { type: Type.INTEGER, description: "Estimated completion time in minutes" },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING, description: "Unique identifier for question" },
                  type: {
                    type: Type.STRING,
                    description: "Question type: 'mcq' or 'true_false' or 'fill_blank'",
                  },
                  question: { type: Type.STRING, description: "The exam question statement" },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "List of 4 choices for 'mcq', or ['True', 'False'] for 'true_false', or empty for 'fill_blank'",
                  },
                  correctAnswer: {
                    type: Type.STRING,
                    description: "The exact matching correct answer string",
                  },
                  explanation: {
                    type: Type.STRING,
                    description: "Deep, educational explanation of the answer and underlying concept",
                  },
                  hint: {
                    type: Type.STRING,
                    description: "Helpful hint if the student is stuck",
                  },
                },
                required: ["id", "type", "question", "correctAnswer", "explanation"],
              },
            },
          },
          required: ["title", "questions"],
        },
      },
    });

    const quizData = JSON.parse(response.text || "{}");
    res.json(quizData);
  } catch (error: any) {
    console.error("AI Quiz error:", error);
    res.status(500).json({ error: error.message || "Failed to generate quiz" });
  }
});

// 4. AI Study Tutor / Copilot Chat Endpoint
app.post("/api/ai/copilot", async (req, res) => {
  try {
    const { noteTitle, noteContent, message, history = [], actionType } = req.body;
    if (!message && !actionType) {
      return res.status(400).json({ error: "Message or actionType is required" });
    }

    const ai = getGeminiClient();

    let systemInstruction = `You are Socrates-AI, an empathetic, hyper-knowledgeable private academic tutor built into IdeaForge.
Your mission is to help the student deeply master the concepts in their note, prepare for exams, create mnemonics, and test their logic.
Respond with clarity, concise bullet points, formatting, and engaging pedagogical analogies.
Always ground your answers in the note provided when relevant, but feel free to add illuminating academic context.`;

    let userPrompt = "";
    if (actionType === "mnemonic") {
      userPrompt = `Based on the note "${noteTitle}", create 2 creative, memorable mnemonics or acronyms to memorize the hardest parts of this content easily.`;
    } else if (actionType === "explain_selection") {
      userPrompt = `Can you explain this specific concept in depth with intuitive real-world examples: "${message}"?`;
    } else if (actionType === "predict_exam") {
      userPrompt = `Act as an exam creator. Predict 3 probable tricky exam questions that could appear on a midterm or final from this note "${noteTitle}", and show how to answer them with full marks.`;
    } else if (actionType === "find_gaps") {
      userPrompt = `Review this note "${noteTitle}" critically. What prerequisites, missing nuances, or unaddressed counter-examples should I look up to complete my understanding?`;
    } else {
      userPrompt = message;
    }

    const formattedHistory = (history || []).slice(-6).map((h: any) => ({
      role: h.role === "user" ? "user" : "model",
      parts: [{ text: h.text || "" }],
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: [
        ...formattedHistory,
        {
          role: "user",
          parts: [
            {
              text: `[Active Note Context: "${noteTitle}"]
---
${(noteContent || "").slice(0, 8000)}
---

Student Question / Request:
${userPrompt}`,
            },
          ],
        },
      ],
      config: {
        systemInstruction,
        temperature: 0.5,
      },
    });

    res.json({ reply: response.text || "I'm thinking... could you rephrase?" });
  } catch (error: any) {
    console.error("AI Copilot error:", error);
    res.status(500).json({ error: error.message || "Copilot error" });
  }
});

// 5. AI Smart Polish & Format Endpoint
app.post("/api/ai/polish", async (req, res) => {
  try {
    const { content, style = "academic" } = req.body;
    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return res.status(400).json({ error: "Content is required" });
    }

    const ai = getGeminiClient();

    let stylePrompt = "Enhance the formatting with clean markdown, fix grammar, and make sentences clear and punchy.";
    if (style === "academic") {
      stylePrompt = "Elevate to formal academic rigor with precise scholarly terminology and structured paragraphs.";
    } else if (style === "concise") {
      stylePrompt = "Condense ruthlessly into high-density bullet points, removing filler words while keeping 100% of the facts.";
    } else if (style === "glossary") {
      stylePrompt = "Extract all key definitions and terminology into an alphabetical Master Glossary table/list at the top, followed by structured notes.";
    }

    const prompt = `You are IdeaForge's Smart Note Polisher.
Instruction: ${stylePrompt}
Preserve all factual details, equations, and code snippets.

Original Note:
---
${content}
---`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        temperature: 0.2,
      },
    });

    res.json({ polished: response.text || content });
  } catch (error: any) {
    console.error("AI Polish error:", error);
    res.status(500).json({ error: error.message || "Failed to polish note" });
  }
});

// 6. AI Concept Map & Knowledge Graph Endpoint
app.post("/api/ai/concept-map", async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return res.status(400).json({ error: "Content is required" });
    }

    const ai = getGeminiClient();

    const prompt = `Extract a clean hierarchical Knowledge Graph / Concept Map from this note.
Return 5 to 10 key concept nodes and directional links connecting them with relationship labels (e.g. "leads to", "comprises", "regulates", "exemplified by", "calculates").

Note Title: "${title || "Topic"}"
Content:
---
${content}
---`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            centralTheme: { type: Type.STRING, description: "Core topic of the map" },
            nodes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  label: { type: Type.STRING },
                  category: { type: Type.STRING, description: "'core' | 'subtopic' | 'example' | 'principle'" },
                  description: { type: Type.STRING },
                },
                required: ["id", "label", "category"],
              },
            },
            links: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  source: { type: Type.STRING },
                  target: { type: Type.STRING },
                  relation: { type: Type.STRING },
                },
                required: ["source", "target", "relation"],
              },
            },
          },
          required: ["centralTheme", "nodes", "links"],
        },
      },
    });

    const graphData = JSON.parse(response.text || "{}");
    res.json(graphData);
  } catch (error: any) {
    console.error("AI Concept Map error:", error);
    res.status(500).json({ error: error.message || "Failed to generate concept map" });
  }
});

// Vite middleware for development / static serving for production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`IdeaForge Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
