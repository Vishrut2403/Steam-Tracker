// PS2 Game Serial Database

export const PS2_SERIALS: Record<string, string> = {
  // God of War series
  '2782': 'SCUS-97399',  // God of War (USA)
  '11240': 'SCUS-97399', // Alternative ID
  '2841': 'SCUS-97481',  // God of War II (USA)
  
  '2779': 'SCUS-97416',  // Ratchet & Clank: Up Your Arsenal
  '2885': 'SCUS-97465',  // Jak 3
  '3000': 'SCES-50760',  // Gran Turismo 4 (PAL)
  '2830': 'SLUS-20770',  // Kingdom Hearts II
  '3016': 'SLUS-20064',  // Final Fantasy X
  
};

export function getSerialByGameId(gameId: string | number): string | null {
  return PS2_SERIALS[String(gameId)] || null;
}

export function getSerialByName(gameName: string): string | null {
  const normalized = gameName.toLowerCase().trim();
  
  const nameMap: Record<string, string> = {
    'god of war': 'SCUS-97399',
    'god of war ii': 'SCUS-97481',
    'kingdom hearts ii': 'SLUS-20770',
    'final fantasy x': 'SLUS-20064',
  };
  
  return nameMap[normalized] || null;
}