/**
 * Pre-defined medical bot replies for the doctor chat.
 */

export const BOT_REPLIES = [
  'Je comprends. Pouvez-vous me décrire vos symptômes plus en détail ?',
  'Depuis combien de temps ressentez-vous ces symptômes ?',
  'Je vous recommande de consulter un médecin en personne. Souhaitez-vous trouver un centre proche ?',
  'Avez-vous déjà pris des médicaments pour ce problème ?',
  'Ces informations m\'aident à mieux vous orienter. Continuez.',
  'Y a-t-il d\'autres symptômes associés que vous souhaitez mentionner ?',
]

export const INITIAL_MESSAGES = [
  {
    id: '1',
    role: 'bot' as const,
    content:
      'Bonjour 👋 Je suis votre assistant médical. Comment puis-je vous aider aujourd\'hui ?',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    role: 'bot' as const,
    content:
      'Décrivez vos symptômes et je vous orienterai vers le bon spécialiste.',
    createdAt: new Date().toISOString(),
  },
]

/**
 * Simple keyword-based bot reply.
 * For production, replace with a real LLM API call (server-side only).
 */
export function getBotReply(userMessage: string): string {
  const lower = userMessage.toLowerCase()

  if (/fi[èe]vre|temp[ée]rature|chaud/.test(lower)) {
    return 'La fièvre peut avoir de nombreuses causes. Buvez beaucoup d\'eau, reposez-vous. Si elle dépasse 39°C ou dure plus de 3 jours, consultez immédiatement un centre de santé. Pensez aussi à faire un test de paludisme.';
  }
  if (/toux|tousse|gorge|rhume|nez/.test(lower)) {
    return 'Pour la toux : hydratez-vous bien, reposez votre voix. Si elle persiste plus d\'une semaine, s\'accompagne de sang ou de difficultés respiratoires, consultez un médecin.';
  }
  if (/mal de t[êe]te|t[êe]te|c[ée]phal/.test(lower)) {
    return 'Les maux de tête peuvent être liés au stress, à la déshydratation ou à la tension. Reposez-vous, buvez de l\'eau. En cas de maux intenses, soudains ou avec troubles visuels, consultez en urgence.';
  }
  if (/ventre|diarrh[ée]e|naus[ée]e|vomi/.test(lower)) {
    return 'Les troubles digestifs nécessitent une bonne hydratation (solution de réhydratation orale). Évitez les aliments lourds. Consultez si vous observez du sang, une fièvre élevée ou une déshydratation.';
  }
  if (/grossesse|enceinte|b[ée]b[ée]/.test(lower)) {
    return 'Pour un suivi de grossesse à Pointe-Noire, je recommande le CSI le plus proche ou la maternité de l\'Hôpital Général. Le suivi mensuel est important. Souhaitez-vous voir les centres ?';
  }
  if (/paludisme|malaria|moustique/.test(lower)) {
    return 'Le paludisme est fréquent au Congo. Symptômes : fièvre, frissons, maux de tête. Dormez sous moustiquaire imprégnée. En cas de suspicion, faites un TDR au centre de santé le plus proche.';
  }
  if (/rdv|rendez-vous|consult/.test(lower)) {
    return 'Vous pouvez prendre un rendez-vous directement depuis l\'application, ongle "Rendez-vous". Je peux aussi vous orienter vers le centre le plus proche.';
  }
  if (/merci|bonjour|salut|hello/.test(lower)) {
    return 'Bonjour ! Je suis là pour vous aider. Décrivez-moi ce qui ne va pas et je vous orienterons.';
  }
  if (/douleur|mal|souffrance/.test(lower)) {
    return 'Pouvez-vous préciser où se situe la douleur et depuis combien de temps ? L\'intensité aussi est importante à connaître.';
  }
  // Default rotation
  return BOT_REPLIES[Math.floor(Math.random() * BOT_REPLIES.length)];
}
