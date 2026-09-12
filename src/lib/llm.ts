/**
 * LLM service for the medical chatbot.
 * Uses z-ai-web-dev-sdk (server-side only) when ENABLE_LLM_CHAT=true.
 * Falls back to the rule-based bot otherwise.
 *
 * IMPORTANT: This module MUST only be imported from server-side code
 * (Route Handlers, Server Actions, Server Components).
 */

import type { ChatMessage } from '@prisma/client'
import { getBotReply, INITIAL_MESSAGES } from '@/lib/data/bot'

const MEDICAL_SYSTEM_PROMPT = `Tu es un assistant médical IA bienveillant qui aide les habitants de Pointe-Noire, République du Congo.

RÔLE ET LIMITES :
- Tu es un assistant de première orientation, PAS un médecin.
- Tu donnes des informations générales sur la santé, les symptômes courants, la prévention.
- Tu rappelles systématiquement qu'en cas d'urgence vitale il faut appeler le 118 (SAMU/Pompiers) ou le 117 (Police Secours).
- Tu ne fais JAMAIS de diagnostic définitif.
- Tu ne prescris JAMAIS de médicaments spécifiques avec posologie précise.
- Tu recommandes toujours de consulter un professionnel de santé en personne.

CONTEXTE LOCAL :
- Ville : Pointe-Noire, République du Congo (Afrique centrale).
- Maladies fréquentes : paludisme (très fréquent), fièvre typhoïde, choléra, hépatites, hypertension, diabète.
- Vaccins importants : BCG, VPO, DTC, rougeole, fièvre jaune, hépatite B.
- Numéros d'urgence : 118 (SAMU/Pompiers), 117 (Police Secours), 119 (Urgences électriques).

STYLE :
- Réponds en français, de manière claire, concise et empathique.
- Maximum 4-5 phrases par réponse.
- Utilise des bullet points si pertinent.
- Termine souvent par une question ouverte ou une recommandation de consultation.

SÉCURITÉ :
- Si symptômes d'urgence (douleur thoracique intense, difficulté respiratoire, perte de conscience, saignement abondant, convulsions), recommande immédiatement d'appeler le 118 ou de se rendre aux urgences.
- Ne demande jamais d'informations personnelles sensibles.
- Reste factuel, ne spécule pas.`

/**
 * Get a medical bot reply. Uses LLM if enabled, otherwise rule-based.
 *
 * @param userMessage - The user's message
 * @param history - Previous conversation messages for context
 * @returns The bot's response
 */
export async function getMedicalReply(
  userMessage: string,
  history: ChatMessage[] = []
): Promise<string> {
  const useLLM = process.env.ENABLE_LLM_CHAT === 'true'

  if (!useLLM) {
    return getBotReply(userMessage)
  }

  try {
    return await getLLMReply(userMessage, history)
  } catch (err) {
    console.error('[LLM] error, falling back to rules:', err)
    return getBotReply(userMessage)
  }
}

/**
 * Calls the z-ai-web-dev-sdk to generate a medical reply.
 * Server-side only — never import from client code.
 */
async function getLLMReply(
  userMessage: string,
  history: ChatMessage[]
): Promise<string> {
  // Dynamic import so the SDK is never bundled into client code
  const ZAI = (await import('z-ai-web-dev-sdk')).default
  const zai = await ZAI.create()

  // Build conversation context from history (last 10 messages)
  const recentHistory = history.slice(-10)
  const messages: Array<{ role: 'assistant' | 'user'; content: string }> = [
    { role: 'assistant', content: MEDICAL_SYSTEM_PROMPT },
    ...recentHistory.map((m) => ({
      role: (m.role === 'bot' ? 'assistant' : 'user') as 'assistant' | 'user',
      content: m.content,
    })),
    { role: 'user', content: userMessage },
  ]

  const completion = await zai.chat.completions.create({
    messages,
    thinking: { type: 'disabled' },
  })

  const reply = completion.choices[0]?.message?.content
  if (!reply || reply.trim().length === 0) {
    throw new Error('Empty LLM response')
  }

  return reply.trim()
}

/**
 * Returns the initial greeting messages.
 */
export function getInitialMessages() {
  return INITIAL_MESSAGES
}
