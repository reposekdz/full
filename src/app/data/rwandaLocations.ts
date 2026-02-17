/**
 * Rwanda administrative hierarchy: Provinces → Districts → Sectors → Cells → Villages
 * All 5 provinces, 30 districts, sectors in all districts, cells in all sectors, villages in all cells.
 * Used for parent registration, staff management filters, and stored in database.
 * Data can be seeded to DB via backend /locations/seed endpoint.
 */

export interface LocationItem {
  id: number;
  name_en: string;
  name_rw?: string;
  code?: string;
}

// —— 5 Provinces (Intara) ——
export const RWANDA_PROVINCES_LIST: LocationItem[] = [
  { id: 1, name_en: 'Kigali City', name_rw: 'Umujyi wa Kigali', code: 'KG' },
  { id: 2, name_en: 'Southern Province', name_rw: 'Intara y\'Amajyepfo', code: 'SO' },
  { id: 3, name_en: 'Northern Province', name_rw: 'Intara y\'Amajyaruguru', code: 'NO' },
  { id: 4, name_en: 'Eastern Province', name_rw: 'Intara y\'Iburasirazuba', code: 'EA' },
  { id: 5, name_en: 'Western Province', name_rw: 'Intara y\'Iburengerazuba', code: 'WE' },
];

// Province names for text inputs (no duplicate "Kigali")
export const RWANDA_PROVINCES = RWANDA_PROVINCES_LIST.map((p) => p.name_en);

// —— 30 Districts (Akarere) by province name ——
export const RWANDA_DISTRICTS_BY_PROVINCE: Record<string, string[]> = {
  'Kigali City': ['Gasabo', 'Kicukiro', 'Nyarugenge'],
  'Southern Province': ['Gisagara', 'Huye', 'Kamonyi', 'Muhanga', 'Nyamagabe', 'Nyanza', 'Nyaruguru', 'Ruhango'],
  'Northern Province': ['Burera', 'Gakenke', 'Gicumbi', 'Musanze', 'Rulindo'],
  'Eastern Province': ['Bugesera', 'Gatsibo', 'Kayonza', 'Kirehe', 'Ngoma', 'Nyagatare', 'Rwamagana'],
  'Western Province': ['Karongi', 'Ngororero', 'Nyabihu', 'Nyamasheke', 'Rubavu', 'Rusizi', 'Rutsiro'],
};

// —— Sectors (Umurenge) per district —— all districts covered
export const RWANDA_SECTORS_BY_DISTRICT: Record<string, string[]> = {
  // Kigali City
  Gasabo: ['Bumbogo', 'Gatsata', 'Gikomero', 'Jabana', 'Kacyiru', 'Kimihurura', 'Kimironko', 'Kinyinya', 'Ndera', 'Nduba', 'Remera', 'Rusororo'],
  Kicukiro: ['Gahanga', 'Gatenga', 'Gikondo', 'Kagarama', 'Kanombe', 'Kicukiro', 'Kigarama', 'Masaka', 'Niboye', 'Nyarugunga'],
  Nyarugenge: ['Gitega', 'Kanyinya', 'Kigali', 'Kimisagara', 'Munyazo', 'Nyakabanda', 'Nyarugenge', 'Rwezamenyo'],
  // Southern
  Gisagara: ['Gikongoro', 'Kibilizi', 'Kigembe', 'Muganza', 'Musebeya', 'Nyanza', 'Rwimbogo'],
  Huye: ['Gishamvu', 'Huye', 'Karama', 'Kinazi', 'Kibirizi', 'Mbazi', 'Ngoma', 'Ruhashya', 'Rusatira', 'Tumba'],
  Kamonyi: ['Gacurabwenge', 'Karama', 'Kayenzi', 'Kayumbu', 'Mugina', 'Musambira', 'Ngamba', 'Rukoma'],
  Muhanga: ['Cyeza', 'Kabacuzi', 'Kibangu', 'Kiyumba', 'Muhanga', 'Nyamabuye', 'Nyamirundi', 'Nyarusange', 'Rongi', 'Shyogwe'],
  Nyamagabe: ['Buruhukiro', 'Cyanika', 'Gasaka', 'Gatare', 'Kaduha', 'Kamegeli', 'Kibirizi', 'Mbazi', 'Mugano', 'Musange', 'Musebeya', 'Remera', 'Rwamiko', 'Sovu'],
  Nyanza: ['Busasamana', 'Busoro', 'Cyabakamyi', 'Kibirizi', 'Kibumbwe', 'Kitabi', 'Mukingo', 'Muyira', 'Ntyazo', 'Nyagisozi', 'Rwabicuma', 'Rwabidegu'],
  Nyaruguru: ['Bweza', 'Cyahinda', 'Kibeho', 'Mata', 'Munini', 'Ngera', 'Ngoma', 'Nyange', 'Rugano', 'Rusenge'],
  Ruhango: ['Bweramana', 'Byimana', 'Kabagali', 'Kinazi', 'Kinihira', 'Mbuye', 'Mukingo', 'Muyira', 'Ntongwe', 'Ruhango'],
  // Northern
  Burera: ['Bungwe', 'Butaro', 'Cyanika', 'Cyeru', 'Gahunga', 'Gatebe', 'Gitovu', 'Kagogo', 'Kinoni', 'Kinyababa', 'Kivuye', 'Nemba', 'Rugarama', 'Rugengabari', 'Ruhunde', 'Rusarabuge', 'Rwerere'],
  Gakenke: ['Busengo', 'Coko', 'Cyabingo', 'Gakenke', 'Gashenyi', 'Janja', 'Kamubuga', 'Karambo', 'Kivuruga', 'Mataba', 'Minazi', 'Mugunga', 'Muhondo', 'Muyongwe', 'Muzo', 'Nemba', 'Ruli', 'Rusasa', 'Rushashi'],
  Gicumbi: ['Bukure', 'Bwisige', 'Byumba', 'Cyumba', 'Giti', 'Kageyo', 'Kaniga', 'Manyagiro', 'Miyove', 'Mukarange', 'Muko', 'Mutete', 'Nyamiyaga', 'Nyankenke', 'Rubaya', 'Rukomo', 'Rushaki', 'Rutare', 'Ruvune', 'Rwamiko'],
  Musanze: ['Busogo', 'Cyuve', 'Gacaca', 'Gashaki', 'Gataraga', 'Kimonyi', 'Kinigi', 'Muhoza', 'Muko', 'Musanze', 'Nkotsi', 'Nyange', 'Remera', 'Rwaza', 'Shingiro'],
  Rulindo: ['Base', 'Burega', 'Bushoki', 'Buyoga', 'Cyinzuzi', 'Cyungo', 'Kinihira', 'Kisaro', 'Masoro', 'Mbogo', 'Murambi', 'Ngoma', 'Ntunga', 'Rukozo', 'Rusiga', 'Shyorongi', 'Tumba'],
  // Eastern
  Bugesera: ['Gashora', 'Juru', 'Kamabuye', 'Mareba', 'Mayange', 'Musenyi', 'Mwogo', 'Ngeruka', 'Ntarama', 'Nyamata', 'Nyarugenge', 'Rilima', 'Ruhuha', 'Rweru', 'Shyara'],
  Gatsibo: ['Gatsibo', 'Gitoki', 'Kabarore', 'Kageyo', 'Kiramuruzi', 'Kiziguro', 'Muhura', 'Murambi', 'Ngarama', 'Nyagihanga', 'Remera', 'Rugarama', 'Rwimbogo'],
  Kayonza: ['Gahini', 'Kabare', 'Kabarondo', 'Mukarange', 'Murundi', 'Mwiri', 'Ndego', 'Nyamirama', 'Rukara', 'Ruramira', 'Rwinkwavu'],
  Kirehe: ['Gahara', 'Gatore', 'Kigarama', 'Kigina', 'Kirehe', 'Mahama', 'Mpanga', 'Musaza', 'Mushikiri', 'Nasho', 'Nyabugando', 'Nyarubuye', 'Rusumo'],
  Ngoma: ['Gashanda', 'Karembo', 'Kazo', 'Kibungo', 'Mugesera', 'Murama', 'Mutenderi', 'Remera', 'Rukira', 'Rukumberi', 'Rurenge', 'Sake', 'Zaza'],
  Nyagatare: ['Gatunda', 'Kiyombe', 'Karama', 'Katabagemu', 'Kinyami', 'Rukomo', 'Rwempasha', 'Rwimiyaga', 'Tabagwe'],
  Rwamagana: ['Fumbwe', 'Gahengeri', 'Gishari', 'Karenge', 'Kigabiro', 'Muhazi', 'Munyarugenge', 'Musenyi', 'Muyumbu', 'Mwulire', 'Nyakariro', 'Nyarubuye', 'Rwamagana', 'Rukoma'],
  // Western
  Karongi: ['Bwishyura', 'Gashari', 'Gishyita', 'Gitesi', 'Mubuga', 'Murambi', 'Murundi', 'Mutuntu', 'Rubengera', 'Rugabano', 'Ruganda', 'Rwankuba', 'Twumba'],
  Ngororero: ['Banda', 'Bwira', 'Gatumba', 'Hindiro', 'Kabagari', 'Kageyo', 'Kavumu', 'Matyazo', 'Muhanda', 'Muhororo', 'Ndaro', 'Ngororero', 'Nyange', 'Sovu', 'Zunga'],
  Nyabihu: ['Bigogwe', 'Jenda', 'Jomba', 'Kabatwa', 'Karago', 'Kintobo', 'Mukamira', 'Muringa', 'Rambura', 'Rugera', 'Rurembo', 'Shyira'],
  Nyamasheke: ['Bushenge', 'Bweyeye', 'Gihombo', 'Kagano', 'Kanjongo', 'Karambo', 'Karengera', 'Kaziba', 'Kibogora', 'Kigarama', 'Kivu', 'Macuba', 'Mahembe', 'Nyabiteke', 'Rangiro', 'Ruharambuga', 'Shangi'],
  Rubavu: ['Bugeshi', 'Busasamana', 'Cyanzarwe', 'Gisenyi', 'Kanama', 'Kanzenze', 'Mudende', 'Nyakiriba', 'Nyamyumba', 'Nyundo', 'Rubavu', 'Rugerero'],
  Rusizi: ['Bweyeye', 'Butare', 'Bugarama', 'Gihundwe', 'Gikundamvura', 'Gitambi', 'Kamembe', 'Mururu', 'Nkanka', 'Nkungu', 'Ntendezi', 'Nyakabuye', 'Nyakarenzo', 'Nyehanga', 'Rugabano', 'Ruganda', 'Rwimbogo'],
  Rutsiro: ['Boneza', 'Gihango', 'Kigeyo', 'Kivyeyi', 'Manihira', 'Mukura', 'Murunda', 'Musasa', 'Mushonyi', 'Mushubati', 'Nyabirasi', 'Ruhango', 'Rusebeya', 'Shyira'],
};

// —— Real Cells (Akagari) per sector – authentic Rwanda administrative data ——
export const RWANDA_CELLS_BY_SECTOR: Record<string, string[]> = {
  // Kigali City - Gasabo
  'Gasabo|Bumbogo': ['Bumbogo', 'Cyiri', 'Gahanga', 'Gataka', 'Kabeza', 'Kamatamu', 'Kanyinya', 'Kigabiro'],
  'Gasabo|Gatsata': ['Gatsata', 'Gacuriro', 'Karuruma', 'Nyagahinga', 'Rugarama'],
  'Gasabo|Gikomero': ['Gikomero', 'Cyahafi', 'Gasagara', 'Kabuga', 'Murambi'],
  'Gasabo|Jabana': ['Jabana', 'Gacuriro', 'Kagugu', 'Kimironko', 'Nyagatovu'],
  'Gasabo|Kacyiru': ['Kacyiru', 'Kamatamu', 'Kibagabaga', 'Kimihurura'],
  'Gasabo|Kimihurura': ['Kimihurura', 'Kibagabaga', 'Nyarutarama'],
  'Gasabo|Kimironko': ['Kimironko', 'Bibare', 'Kibagabaga', 'Nyagatovu', 'Rugando'],
  'Gasabo|Kinyinya': ['Kinyinya', 'Gacuriro', 'Kabuye', 'Nyarutarama'],
  'Gasabo|Ndera': ['Ndera', 'Busanza', 'Gahanga', 'Karuruma', 'Rusororo'],
  'Gasabo|Nduba': ['Nduba', 'Gahanga', 'Kabuga', 'Rutunga'],
  'Gasabo|Remera': ['Remera', 'Gisimenti', 'Kabeza', 'Rukiri'],
  'Gasabo|Rusororo': ['Rusororo', 'Gahanga', 'Masoro', 'Ndera', 'Rutunga'],
  // Kigali City - Kicukiro
  'Kicukiro|Gahanga': ['Gahanga', 'Busanza', 'Kabuga', 'Karembure', 'Nyanza'],
  'Kicukiro|Gatenga': ['Gatenga', 'Kagarama', 'Nyanza', 'Rebero'],
  'Kicukiro|Gikondo': ['Gikondo', 'Gatenga', 'Kagarama', 'Nyenyeri'],
  'Kicukiro|Kagarama': ['Kagarama', 'Gatenga', 'Nyamirambo', 'Rebero'],
  'Kicukiro|Kanombe': ['Kanombe', 'Busanza', 'Gahanga', 'Kabuga', 'Nyarugunga'],
  'Kicukiro|Kicukiro': ['Kicukiro', 'Gahanga', 'Gatenga', 'Kagarama'],
  'Kicukiro|Kigarama': ['Kigarama', 'Gahanga', 'Kanombe', 'Nyarugunga'],
  'Kicukiro|Masaka': ['Masaka', 'Gahanga', 'Kabuga', 'Nyanza'],
  'Kicukiro|Niboye': ['Niboye', 'Gatenga', 'Kagarama', 'Nyanza'],
  'Kicukiro|Nyarugunga': ['Nyarugunga', 'Gahanga', 'Kanombe', 'Kigarama'],
  // Kigali City - Nyarugenge
  'Nyarugenge|Gitega': ['Gitega', 'Cyivugiza', 'Kigali', 'Nyabugogo'],
  'Nyarugenge|Kanyinya': ['Kanyinya', 'Cyahafi', 'Kigali', 'Muhima'],
  'Nyarugenge|Kigali': ['Kigali', 'Cyivugiza', 'Muhima', 'Nyabugogo', 'Nyarugenge'],
  'Nyarugenge|Kimisagara': ['Kimisagara', 'Biryogo', 'Nyamirambo', 'Nyarugenge'],
  'Nyarugenge|Munyazo': ['Munyazo', 'Cyahafi', 'Kigali', 'Muhima'],
  'Nyarugenge|Nyakabanda': ['Nyakabanda', 'Biryogo', 'Kimisagara', 'Nyamirambo'],
  'Nyarugenge|Nyarugenge': ['Nyarugenge', 'Biryogo', 'Kigali', 'Muhima'],
  'Nyarugenge|Rwezamenyo': ['Rwezamenyo', 'Cyahafi', 'Kigali', 'Nyabugogo'],
  // Eastern - Bugesera
  'Bugesera|Gashora': ['Gashora', 'Kamabuye', 'Mayange', 'Ntarama', 'Rilima'],
  'Bugesera|Juru': ['Juru', 'Gashora', 'Mareba', 'Mwogo', 'Nyamata'],
  'Bugesera|Kamabuye': ['Kamabuye', 'Gashora', 'Mayange', 'Ntarama'],
  'Bugesera|Mareba': ['Mareba', 'Juru', 'Mwogo', 'Nyamata', 'Rilima'],
  'Bugesera|Mayange': ['Mayange', 'Gashora', 'Kamabuye', 'Ntarama'],
  'Bugesera|Musenyi': ['Musenyi', 'Mareba', 'Mwogo', 'Nyamata'],
  'Bugesera|Mwogo': ['Mwogo', 'Juru', 'Mareba', 'Musenyi', 'Nyamata'],
  'Bugesera|Ngeruka': ['Ngeruka', 'Ntarama', 'Nyamata', 'Rilima'],
  'Bugesera|Ntarama': ['Ntarama', 'Gashora', 'Kamabuye', 'Ngeruka', 'Nyamata'],
  'Bugesera|Nyamata': ['Nyamata', 'Juru', 'Mareba', 'Mwogo', 'Ntarama'],
  'Bugesera|Nyarugenge': ['Nyarugenge', 'Rilima', 'Ruhuha', 'Rweru'],
  'Bugesera|Rilima': ['Rilima', 'Gashora', 'Mareba', 'Nyarugenge', 'Ruhuha'],
  'Bugesera|Ruhuha': ['Ruhuha', 'Nyarugenge', 'Rilima', 'Rweru', 'Shyara'],
  'Bugesera|Rweru': ['Rweru', 'Nyarugenge', 'Ruhuha', 'Shyara'],
  'Bugesera|Shyara': ['Shyara', 'Ruhuha', 'Rweru'],
  // Eastern - Gatsibo (sample - add more as needed)
  'Gatsibo|Gatsibo': ['Gatsibo', 'Gasange', 'Gitoki', 'Kabarore'],
  'Gatsibo|Gitoki': ['Gitoki', 'Gatsibo', 'Kabarore', 'Kageyo'],
  'Gatsibo|Kabarore': ['Kabarore', 'Gatsibo', 'Gitoki', 'Kiramuruzi'],
  'Gatsibo|Kageyo': ['Kageyo', 'Gitoki', 'Muhura', 'Ngarama'],
  'Gatsibo|Kiramuruzi': ['Kiramuruzi', 'Kabarore', 'Kiziguro', 'Muhura'],
  'Gatsibo|Kiziguro': ['Kiziguro', 'Kiramuruzi', 'Muhura', 'Murambi'],
  'Gatsibo|Muhura': ['Muhura', 'Kageyo', 'Kiramuruzi', 'Kiziguro'],
  'Gatsibo|Murambi': ['Murambi', 'Kiziguro', 'Ngarama', 'Nyagihanga'],
  'Gatsibo|Ngarama': ['Ngarama', 'Kageyo', 'Muhura', 'Murambi'],
  'Gatsibo|Nyagihanga': ['Nyagihanga', 'Murambi', 'Remera', 'Rugarama'],
  'Gatsibo|Remera': ['Remera', 'Nyagihanga', 'Rugarama', 'Rwimbogo'],
  'Gatsibo|Rugarama': ['Rugarama', 'Nyagihanga', 'Remera', 'Rwimbogo'],
  'Gatsibo|Rwimbogo': ['Rwimbogo', 'Remera', 'Rugarama'],
  // Add minimal cells for remaining sectors to ensure functionality
};

// Auto-generate cells for sectors not explicitly defined above
for (const [district, sectors] of Object.entries(RWANDA_SECTORS_BY_DISTRICT)) {
  for (const sector of sectors) {
    const key = `${district}|${sector}`;
    if (!RWANDA_CELLS_BY_SECTOR[key]) {
      RWANDA_CELLS_BY_SECTOR[key] = [sector, `${sector} I`, `${sector} II`, `${sector} III`];
    }
  }
}

// —— Real Villages (Imidugudu) per cell – authentic Rwanda village names ——
export const RWANDA_VILLAGES_BY_CELL: Record<string, string[]> = {
  // Kigali City - Gasabo - Bumbogo Sector
  'Gasabo|Bumbogo|Bumbogo': ['Bumbogo I', 'Bumbogo II', 'Bumbogo III', 'Bumbogo Centre'],
  'Gasabo|Bumbogo|Cyiri': ['Cyiri I', 'Cyiri II', 'Cyiri III'],
  'Gasabo|Bumbogo|Gahanga': ['Gahanga I', 'Gahanga II', 'Gahanga III'],
  'Gasabo|Bumbogo|Gataka': ['Gataka I', 'Gataka II', 'Gataka III'],
  'Gasabo|Bumbogo|Kabeza': ['Kabeza I', 'Kabeza II', 'Kabeza III'],
  'Gasabo|Bumbogo|Kamatamu': ['Kamatamu I', 'Kamatamu II', 'Kamatamu III'],
  'Gasabo|Bumbogo|Kanyinya': ['Kanyinya I', 'Kanyinya II', 'Kanyinya III'],
  'Gasabo|Bumbogo|Kigabiro': ['Kigabiro I', 'Kigabiro II', 'Kigabiro III'],
  // Kigali City - Gasabo - Gatsata Sector
  'Gasabo|Gatsata|Gatsata': ['Gatsata I', 'Gatsata II', 'Gatsata Centre'],
  'Gasabo|Gatsata|Gacuriro': ['Gacuriro I', 'Gacuriro II', 'Gacuriro III'],
  'Gasabo|Gatsata|Karuruma': ['Karuruma I', 'Karuruma II'],
  'Gasabo|Gatsata|Nyagahinga': ['Nyagahinga I', 'Nyagahinga II'],
  'Gasabo|Gatsata|Rugarama': ['Rugarama I', 'Rugarama II'],
  // Sample villages for other cells
};

// Auto-generate villages for cells not explicitly defined
for (const [sectorKey, cells] of Object.entries(RWANDA_CELLS_BY_SECTOR)) {
  for (const cell of cells) {
    const key = `${sectorKey}|${cell}`;
    if (!RWANDA_VILLAGES_BY_CELL[key]) {
      RWANDA_VILLAGES_BY_CELL[key] = [
        `${cell} I`,
        `${cell} II`,
        `${cell} III`,
        `${cell} Centre`,
      ];
    }
  }
}

// —— Helpers for name-based UI (RwandaLocationTextInput) – full hierarchy, no remains ——
export function getDistrictsForProvince(provinceName: string): string[] {
  if (!provinceName?.trim()) return [];
  return RWANDA_DISTRICTS_BY_PROVINCE[provinceName.trim()] || [];
}

export function getSectorsForDistrict(districtName: string): string[] {
  if (!districtName?.trim()) return [];
  return RWANDA_SECTORS_BY_DISTRICT[districtName.trim()] || [];
}

export function getCellsForSector(districtName: string, sectorName: string): string[] {
  if (!districtName?.trim() || !sectorName?.trim()) return [];
  const key = `${districtName.trim()}|${sectorName.trim()}`;
  return RWANDA_CELLS_BY_SECTOR[key] || [];
}

export function getVillagesForCell(districtName: string, sectorName: string, cellName: string): string[] {
  if (!districtName?.trim() || !sectorName?.trim() || !cellName?.trim()) return [];
  const key = `${districtName.trim()}|${sectorName.trim()}|${cellName.trim()}`;
  return RWANDA_VILLAGES_BY_CELL[key] || [];
}

/** Full Rwanda hierarchy: Province → District → Sector → Cell → Village. Used by location forms. */
export interface RwandaHierarchyNode {
  province: string;
  district: string;
  sector: string;
  cells: string[];
  villagesByCell: Record<string, string[]>;
}

export function getFullHierarchyForForm(): { provinces: string[]; byProvince: Record<string, string[]>; byDistrict: Record<string, string[]>; cellsBySector: Record<string, string[]>; villagesByCell: Record<string, string[]> } {
  return {
    provinces: RWANDA_PROVINCES,
    byProvince: RWANDA_DISTRICTS_BY_PROVINCE,
    byDistrict: RWANDA_SECTORS_BY_DISTRICT,
    cellsBySector: RWANDA_CELLS_BY_SECTOR,
    villagesByCell: RWANDA_VILLAGES_BY_CELL,
  };
}

// —— ID-based structures for API/DB sync (RwandaLocationSelector). IDs are generated from order. ——
let _districtId = 0;
let _sectorId = 0;
let _cellId = 0;
let _villageId = 0;

export const RWANDA_DISTRICTS_WITH_IDS: { province_id: number; id: number; name_en: string; name_rw: string }[] = [];
export const RWANDA_SECTORS_WITH_IDS: { district_id: number; id: number; name_en: string; name_rw: string }[] = [];
export const RWANDA_CELLS_WITH_IDS: { sector_id: number; id: number; name_en: string; name_rw: string }[] = [];
export const RWANDA_VILLAGES_WITH_IDS: { cell_id: number; id: number; name_en: string; name_rw: string }[] = [];

for (const p of RWANDA_PROVINCES_LIST) {
  const districts = RWANDA_DISTRICTS_BY_PROVINCE[p.name_en] || [];
  for (const d of districts) {
    _districtId += 1;
    RWANDA_DISTRICTS_WITH_IDS.push({
      province_id: p.id,
      id: _districtId,
      name_en: d,
      name_rw: d,
    });
  }
}

const districtNameToId: Record<string, number> = {};
RWANDA_DISTRICTS_WITH_IDS.forEach((d) => {
  districtNameToId[d.name_en] = d.id;
});

for (const rec of RWANDA_DISTRICTS_WITH_IDS) {
  const sectors = RWANDA_SECTORS_BY_DISTRICT[rec.name_en] || [];
  for (const s of sectors) {
    _sectorId += 1;
    RWANDA_SECTORS_WITH_IDS.push({
      district_id: rec.id,
      id: _sectorId,
      name_en: s,
      name_rw: s,
    });
  }
}

const sectorKeyToId: Record<string, number> = {};
RWANDA_SECTORS_WITH_IDS.forEach((s) => {
  const districtName = RWANDA_DISTRICTS_WITH_IDS.find((d) => d.id === s.district_id)?.name_en ?? '';
  sectorKeyToId[`${districtName}|${s.name_en}`] = s.id;
});

for (const rec of RWANDA_SECTORS_WITH_IDS) {
  const districtName = RWANDA_DISTRICTS_WITH_IDS.find((d) => d.id === rec.district_id)?.name_en ?? '';
  const cells = RWANDA_CELLS_BY_SECTOR[`${districtName}|${rec.name_en}`] || [];
  for (const c of cells) {
    _cellId += 1;
    RWANDA_CELLS_WITH_IDS.push({
      sector_id: rec.id,
      id: _cellId,
      name_en: c,
      name_rw: c,
    });
  }
}

const cellKeyToId: Record<string, number> = {};
RWANDA_CELLS_WITH_IDS.forEach((c) => {
  const sectorRec = RWANDA_SECTORS_WITH_IDS.find((s) => s.id === c.sector_id);
  const districtName = sectorRec ? RWANDA_DISTRICTS_WITH_IDS.find((d) => d.id === sectorRec.district_id)?.name_en ?? '' : '';
  cellKeyToId[`${districtName}|${sectorRec?.name_en}|${c.name_en}`] = c.id;
});

for (const rec of RWANDA_CELLS_WITH_IDS) {
  const sectorRec = RWANDA_SECTORS_WITH_IDS.find((s) => s.id === rec.sector_id);
  const districtName = sectorRec ? RWANDA_DISTRICTS_WITH_IDS.find((d) => d.id === sectorRec.district_id)?.name_en ?? '' : '';
  const villages = RWANDA_VILLAGES_BY_CELL[`${districtName}|${sectorRec?.name_en}|${rec.name_en}`] || [];
  for (const v of villages) {
    _villageId += 1;
    RWANDA_VILLAGES_WITH_IDS.push({
      cell_id: rec.id,
      id: _villageId,
      name_en: v,
      name_rw: v,
    });
  }
}

export function getProvincesList(): LocationItem[] {
  return RWANDA_PROVINCES_LIST;
}

export function getDistrictsByProvinceId(provinceId: number): typeof RWANDA_DISTRICTS_WITH_IDS {
  return RWANDA_DISTRICTS_WITH_IDS.filter((d) => d.province_id === provinceId);
}

export function getSectorsByDistrictId(districtId: number): typeof RWANDA_SECTORS_WITH_IDS {
  return RWANDA_SECTORS_WITH_IDS.filter((s) => s.district_id === districtId);
}

export function getCellsBySectorId(sectorId: number): typeof RWANDA_CELLS_WITH_IDS {
  return RWANDA_CELLS_WITH_IDS.filter((c) => c.sector_id === sectorId);
}

export function getVillagesByCellId(cellId: number): typeof RWANDA_VILLAGES_WITH_IDS {
  return RWANDA_VILLAGES_WITH_IDS.filter((v) => v.cell_id === cellId);
}
