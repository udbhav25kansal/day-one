import Anthropic from "@anthropic-ai/sdk";

export const anthropic = new Anthropic(); // reads ANTHROPIC_API_KEY from env

// Model tiering: fast model for in-character chat / generation, capable model for
// multi-persona coherence and evaluation.
export const MODEL_CHAT = "claude-sonnet-4-6";
export const MODEL_JUDGE = "claude-opus-4-8";
