// lib/assistant/types.ts
// Types partagés serveur / client de l'assistant IA

export interface AssistantSource {
  url: string;
  title: string;
}

export interface AssistantChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources: AssistantSource[];
}

export interface AssistantThreadSummary {
  id: string;
  title: string;
  projectId: string | null;
  projectTitle: string | null;
  updatedAt: string;
}
