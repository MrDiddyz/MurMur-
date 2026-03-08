export const getMurmurText = (ok: boolean, hintLevel: number): string => {
  if (ok) return 'MurMur: Flott jobbet! Oppgaven er løst 🎉';
  if (hintLevel === 0) return 'MurMur: Kjør koden igjen og se nøye på utskriften.';
  if (hintLevel === 1) return 'MurMur: Nesten! Sjekk at teksten matcher oppgaven nøyaktig.';
  return 'MurMur: Tips: Se etter riktig antall utskrifter og riktig ordvalg.';
};
