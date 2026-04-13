const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const OpenAI = require("openai");

const app = express();
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
const DATA_FILE = path.join(__dirname, "ideas.json");
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-5-mini";
const DEFAULT_CATEGORY = "Feature Request";
const ALLOWED_CATEGORIES = ["Bug", "Performance", "UI/UX", DEFAULT_CATEGORY];
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

app.use(cors({
  origin: "*"
}));
app.use(express.json());

function ensureDataFile() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, "[]", "utf8");
  }
}

function readIdeas() {
  ensureDataFile();

  try {
    const raw = fs.readFileSync(DATA_FILE, "utf8").trim();

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      throw new Error("Data file must contain an array of ideas.");
    }

    return parsed;
  } catch (error) {
    if (error instanceof SyntaxError) {
      const invalidJsonError = new Error("Invalid JSON in ideas.json.");
      invalidJsonError.statusCode = 500;
      throw invalidJsonError;
    }

    if (error.code === "ENOENT") {
      return [];
    }

    if (!error.statusCode) {
      error.statusCode = 500;
    }

    throw error;
  }
}

function writeIdeas(ideas) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(ideas, null, 2), "utf8");
}

const CATEGORY_RULES = [
  {
    name: "Bug",
    keywords: [
      "bug",
      "error",
      "issue",
      "broken",
      "fail",
      "fails",
      "failed",
      "failing",
      "crash",
      "crashes",
      "crashed",
      "defect",
      "wrong",
      "incorrect",
      "fix"
    ]
  },
  {
    name: "Performance",
    keywords: [
      "slow",
      "slower",
      "slowdown",
      "lag",
      "laggy",
      "delay",
      "delayed",
      "performance",
      "optimize",
      "optimization",
      "fast",
      "faster",
      "speed",
      "memory",
      "cpu",
      "load time"
    ]
  },
  {
    name: "UI/UX",
    keywords: [
      "ui",
      "ux",
      "css",
      "frontend",
      "design",
      "layout",
      "layouts",
      "padding",
      "paddings",
      "margin",
      "margins",
      "spacing",
      "gap",
      "gaps",
      "alignment",
      "aligned",
      "misaligned",
      "alignment",
      "align",
      "position",
      "positioning",
      "display",
      "render",
      "rendering",
      "visible",
      "visibility",
      "overflow",
      "clipping",
      "responsive",
      "mobile",
      "desktop",
      "card",
      "cards",
      "modal",
      "dialog",
      "visual",
      "appearance",
      "look",
      "feel",
      "button",
      "screen",
      "page",
      "font",
      "color",
      "navigation",
      "theme",
      "style",
      "styling",
      "styled",
      "usability",
      "experience",
      "interface"
    ]
  }
];

function normalizeContent(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function buildTokenSet(content) {
  const tokens = content.split(" ").filter(Boolean);
  const expandedTokens = tokens.flatMap((token) => {
    const normalizedToken = token.endsWith("s") ? token.slice(0, -1) : token;
    const rootToken =
      normalizedToken.length > 4 && normalizedToken.endsWith("ing")
        ? normalizedToken.slice(0, -3)
        : normalizedToken;

    return [token, normalizedToken, rootToken].filter(Boolean);
  });

  return new Set(expandedTokens);
}

function scoreCategory(content, tokenSet, keywords) {
  return keywords.reduce((score, keyword) => {
    const normalizedKeyword = normalizeContent(keyword);
    const compactKeyword = normalizedKeyword.replace(/\s+/g, " ").trim();

    if (!compactKeyword) {
      return score;
    }

    if (compactKeyword.includes(" ")) {
      if (content.includes(compactKeyword)) {
        return score + 2;
      }
    } else if (content.includes(compactKeyword) || tokenSet.has(compactKeyword)) {
      return score + 1;
    }

    return score;
  }, 0);
}

function detectCategoryWithRules(title, description) {
  const content = normalizeContent(`${title} ${description}`);
  const tokenSet = buildTokenSet(content);

  if (!content) {
    return {
      category: DEFAULT_CATEGORY,
      matchedBy: "default",
      shouldUseAI: false
    };
  }

  const scoredRules = CATEGORY_RULES.map((rule) => ({
    name: rule.name,
    score: scoreCategory(content, tokenSet, rule.keywords)
  })).sort((left, right) => right.score - left.score);

  const topMatch = scoredRules[0];
  const nextMatch = scoredRules[1];

  if (!topMatch || topMatch.score === 0) {
    return {
      category: DEFAULT_CATEGORY,
      matchedBy: "default",
      shouldUseAI: true
    };
  }

  if (nextMatch && topMatch.score === nextMatch.score) {
    return {
      category: DEFAULT_CATEGORY,
      matchedBy: "ambiguous-rule-match",
      shouldUseAI: true
    };
  }

  return {
    category: topMatch.name,
    matchedBy: "rule",
    shouldUseAI: false
  };
}

async function getCategoryFromAI(title, description) {
  if (!openai) {
    return null;
  }

  const promptPayload = {
    title,
    description,
    allowedCategories: ALLOWED_CATEGORIES
  };

  const response = await openai.responses.create({
    model: OPENAI_MODEL,
    input: [
      {
        role: "system",
        content: [
          {
            type: "input_text",
            text:
              "Classify an idea into exactly one of these categories: Bug, Performance, UI/UX, Feature Request. " +
              "Return Feature Request if the idea does not clearly fit the others."
          }
        ]
      },
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: JSON.stringify(promptPayload)
          }
        ]
      }
    ],
    text: {
      format: {
        type: "json_schema",
        name: "idea_category",
        strict: true,
        schema: {
          type: "object",
          properties: {
            category: {
              type: "string",
              enum: ALLOWED_CATEGORIES
            }
          },
          required: ["category"],
          additionalProperties: false
        }
      }
    }
  });

  const parsed = JSON.parse(response.output_text);
  return parsed.category;
}

async function getCategory(title, description) {
  const ruleResult = detectCategoryWithRules(title, description);

  if (!ruleResult.shouldUseAI) {
    return ruleResult.category;
  }

  try {
    if (!openai) {
      console.warn("AI category fallback skipped because OPENAI_API_KEY is not loaded.");
      return ruleResult.category;
    }

    const aiCategory = await getCategoryFromAI(title, description);

    if (ALLOWED_CATEGORIES.includes(aiCategory)) {
      return aiCategory;
    }
  } catch (error) {
    console.error("AI category fallback failed:", error.message);
  }

  return ruleResult.category;
}

function validateIdeaInput(req, res, next) {
  const { title, description } = req.body;

  if (
    typeof title !== "string" ||
    typeof description !== "string" ||
    !title.trim() ||
    !description.trim()
  ) {
    return res.status(400).json({
      error: "title and description are required and must be non-empty strings."
    });
  }

  req.ideaInput = {
    title: title.trim(),
    description: description.trim()
  };

  next();
}

function parseIdeaId(req, res, next) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "Invalid idea id." });
  }

  req.ideaId = id;
  next();
}

app.get("/ideas", (req, res, next) => {
  try {
    const ideas = readIdeas();
    res.status(200).json(ideas);
  } catch (error) {
    next(error);
  }
});

app.post("/ideas", validateIdeaInput, async (req, res, next) => {
  try {
    const ideas = readIdeas();
    const { title, description } = req.ideaInput;
    const category = await getCategory(title, description);

    const newIdea = {
      id: Date.now(),
      title,
      description,
      category,
      votes: 0
    };

    ideas.push(newIdea);
    writeIdeas(ideas);

    res.status(201).json(newIdea);
  } catch (error) {
    next(error);
  }
});

app.post("/ideas/:id/upvote", parseIdeaId, (req, res, next) => {
  try {
    const ideas = readIdeas();
    const idea = ideas.find((item) => item.id === req.ideaId);

    if (!idea) {
      return res.status(404).json({ error: "Idea not found." });
    }

    idea.votes += 1;
    writeIdeas(ideas);

    res.status(200).json(idea);
  } catch (error) {
    next(error);
  }
});

app.delete("/ideas/:id", parseIdeaId, (req, res, next) => {
  try {
    const ideas = readIdeas();
    const index = ideas.findIndex((item) => item.id === req.ideaId);

    if (index === -1) {
      return res.status(404).json({ error: "Idea not found." });
    }

    const deletedIdea = ideas[index];
    ideas.splice(index, 1);
    writeIdeas(ideas);

    res.status(200).json({
      message: "Idea deleted successfully.",
      idea: deletedIdea
    });
  } catch (error) {
    next(error);
  }
});

app.use((error, req, res, next) => {
  const statusCode = error.statusCode || 500;
  const message =
    statusCode === 500 ? error.message || "Internal server error." : error.message;

  res.status(statusCode).json({ error: message });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
