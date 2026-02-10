// Global Trades and Levels Configuration
// Used across all staff management systems
// ONLY 3 TRADES EXIST: BDC, SOD, AUT

export const GLOBAL_TRADES = [
  { id: 1, code: 'BDC', name: 'Building Construction', name_rw: 'Kubaka' },
  { id: 2, code: 'SOD', name: 'Software Development', name_rw: 'Gutegura Porogaramu' },
  { id: 3, code: 'AUT', name: 'Automotive Technology', name_rw: 'Ikoranabuhanga rya Modoka' }
];

export const GLOBAL_LEVELS = [
  // BDC and SOD: Levels 3, 4, 5
  { id: 'bdc_sod_3', level_number: 3, level_suffix: '', name: 'Level 3', display: 'Level 3', trade_codes: ['BDC', 'SOD'] },
  { id: 'bdc_sod_4', level_number: 4, level_suffix: '', name: 'Level 4', display: 'Level 4', trade_codes: ['BDC', 'SOD'] },
  { id: 'bdc_sod_5', level_number: 5, level_suffix: '', name: 'Level 5', display: 'Level 5', trade_codes: ['BDC', 'SOD'] },
  
  // AUT: Levels 3, 4A, 4B, 5A, 5B
  { id: 'aut_3', level_number: 3, level_suffix: '', name: 'Level 3', display: 'Level 3', trade_codes: ['AUT'] },
  { id: 'aut_4a', level_number: 4, level_suffix: 'A', name: 'Level 4A', display: 'Level 4A', trade_codes: ['AUT'] },
  { id: 'aut_4b', level_number: 4, level_suffix: 'B', name: 'Level 4B', display: 'Level 4B', trade_codes: ['AUT'] },
  { id: 'aut_5a', level_number: 5, level_suffix: 'A', name: 'Level 5A', display: 'Level 5A', trade_codes: ['AUT'] },
  { id: 'aut_5b', level_number: 5, level_suffix: 'B', name: 'Level 5B', display: 'Level 5B', trade_codes: ['AUT'] }
];

export const getLevelsForTrade = (tradeCode: string) => {
  return GLOBAL_LEVELS.filter(level => level.trade_codes.includes(tradeCode));
};

export const getAllLevelNumbers = () => {
  return [...new Set(GLOBAL_LEVELS.map(l => l.level_number))].sort();
};

export const formatLevelDisplay = (levelNumber: number, levelSuffix: string = '') => {
  return levelSuffix ? `Level ${levelNumber}${levelSuffix}` : `Level ${levelNumber}`;
};
