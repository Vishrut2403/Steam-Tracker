// PS3 Game Serial Database
// Maps RetroAchievements game IDs or names to their PS3 serials for RPCS3 matching

export const PS3_SERIALS: Record<string, string> = {
  // God of War series
  '14974': 'BCUS98111',  // God of War III (USA)
  '15013': 'BCES00800',  // God of War III (EUR)
  '15014': 'BCJS30018',  // God of War III (JPN)
  '14975': 'BCUS98229',  // God of War: Ascension (USA)
  
  // Uncharted series
  '14979': 'BCUS98103',  // Uncharted: Drake's Fortune (USA)
  '14980': 'BCUS98123',  // Uncharted 2: Among Thieves (USA)
  '14981': 'BCUS98233',  // Uncharted 3: Drake's Deception (USA)
  
  // The Last of Us
  '14982': 'BCUS98174',  // The Last of Us (USA)
  
  // Infamous series
  '14983': 'BCUS98111',  // inFAMOUS (USA)
  '14984': 'BCUS98175',  // inFAMOUS 2 (USA)
  
  // Resistance series
  '14985': 'BCUS98107',  // Resistance: Fall of Man (USA)
  '14986': 'BCUS98120',  // Resistance 2 (USA)
  '14987': 'BCUS98176',  // Resistance 3 (USA)
  
  // LittleBigPlanet series
  '14988': 'BCUS98148',  // LittleBigPlanet (USA)
  '14989': 'BCUS98199',  // LittleBigPlanet 2 (USA)
  
  // Ratchet & Clank series
  '14990': 'BCUS98127',  // Ratchet & Clank Future: Tools of Destruction (USA)
  '14991': 'BCUS98134',  // Ratchet & Clank Future: A Crack in Time (USA)
  
  // Metal Gear Solid series
  '14992': 'BLUS30109',  // Metal Gear Solid 4: Guns of the Patriots (USA)
  
  // Add more as needed...
};

// Function to get serial by RA game ID
export function getPS3SerialByGameId(gameId: string | number): string | null {
  return PS3_SERIALS[String(gameId)] || null;
}

// Function to search by game name (fuzzy match)
export function getPS3SerialByName(gameName: string): string | null {
  const normalized = gameName.toLowerCase().trim();
  
  // Direct name matches
  const nameMap: Record<string, string> = {
    'god of war iii': 'BCUS98111',
    'god of war 3': 'BCUS98111',
    'god of war: ascension': 'BCUS98229',
    'uncharted: drake\'s fortune': 'BCUS98103',
    'uncharted 2: among thieves': 'BCUS98123',
    'uncharted 3: drake\'s deception': 'BCUS98233',
    'the last of us': 'BCUS98174',
    'infamous': 'BCUS98111',
    'infamous 2': 'BCUS98175',
    'littlebigplanet': 'BCUS98148',
    'littlebigplanet 2': 'BCUS98199',
    'metal gear solid 4': 'BLUS30109',
    'mgs4': 'BLUS30109',
    // Add more as needed
  };
  
  return nameMap[normalized] || null;
}

// Common PS3 serial patterns
export const PS3_SERIAL_PATTERNS = {
  USA: /^B[CL]US\d{5}$/,
  EUR: /^B[CL]ES\d{5}$/,
  JPN: /^B[CL]JS\d{5}$/,
  ASIA: /^B[CL]AS\d{5}$/,
};

// Validate if a string is a valid PS3 serial
export function isValidPS3Serial(serial: string): boolean {
  return Object.values(PS3_SERIAL_PATTERNS).some(pattern => pattern.test(serial));
}