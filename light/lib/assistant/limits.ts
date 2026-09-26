// lib/assistant/limits.ts
// Limites de l'assistant IA (partagées entre le serveur et l'interface)

// Messages qu'un étudiant peut envoyer par période de 24 h (chaque réponse a un coût d'API)
export const ASSISTANT_DAILY_LIMIT = 40;
export const ASSISTANT_MAX_MESSAGE_LENGTH = 4000;
