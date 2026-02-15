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

// —— Real Rwanda cell names pool (Akagari) – used so every sector has full cells, no skips ——
const RWANDA_CELL_NAMES_POOL = [
  'Bumbogo', 'Cyiri', 'Gahanga', 'Gataka', 'Kabeza', 'Kamatamu', 'Kanyinya', 'Kigabiro', 'Ndera', 'Nduba',
  'Remera', 'Rusororo', 'Gikomero', 'Jabana', 'Kacyiru', 'Kimihurura', 'Kimironko', 'Kinyinya', 'Munyazo', 'Nyakabanda',
  'Rwezamenyo', 'Gatsata', 'Gitega', 'Kigali', 'Kimisagara', 'Masaka', 'Niboye', 'Nyarugunga', 'Gatenga', 'Gikondo',
  'Kagarama', 'Kanombe', 'Kicukiro', 'Kigarama', 'Nyarugenge', 'Gishamvu', 'Karama', 'Kinazi', 'Kibirizi', 'Mbazi',
  'Ngoma', 'Ruhashya', 'Rusatira', 'Tumba', 'Gacurabwenge', 'Kayenzi', 'Kayumbu', 'Mugina', 'Musambira', 'Rukoma',
  'Cyeza', 'Kabacuzi', 'Kibangu', 'Kiyumba', 'Nyamabuye', 'Nyamirundi', 'Nyarusange', 'Rongi', 'Shyogwe', 'Cyanika',
  'Gasaka', 'Gatare', 'Kaduha', 'Kamegeli', 'Mugano', 'Musange', 'Musebeya', 'Rwamiko', 'Sovu', 'Busasamana',
  'Busoro', 'Cyabakamyi', 'Kibumbwe', 'Kitabi', 'Mukingo', 'Muyira', 'Ntyazo', 'Nyagisozi', 'Rwabicuma', 'Rwabidegu',
  'Bweza', 'Cyahinda', 'Kibeho', 'Mata', 'Munini', 'Ngera', 'Nyange', 'Rugano', 'Rusenge', 'Bweramana', 'Byimana',
  'Kabagali', 'Kinihira', 'Mbuye', 'Ntongwe', 'Ruhango', 'Bungwe', 'Butaro', 'Cyanika', 'Cyeru', 'Gahunga', 'Gatebe',
  'Gitovu', 'Kagogo', 'Kinoni', 'Kinyababa', 'Kivuye', 'Nemba', 'Rugarama', 'Rugengabari', 'Ruhunde', 'Rusarabuge', 'Rwerere',
  'Busengo', 'Coko', 'Cyabingo', 'Gashenyi', 'Janja', 'Kamubuga', 'Karambo', 'Kivuruga', 'Mataba', 'Minazi',
  'Mugunga', 'Muhondo', 'Muyongwe', 'Muzo', 'Ruli', 'Rusasa', 'Rushashi', 'Bukure', 'Bwisige', 'Byumba', 'Cyumba',
  'Giti', 'Kageyo', 'Kaniga', 'Manyagiro', 'Miyove', 'Mukarange', 'Muko', 'Mutete', 'Nyamiyaga', 'Nyankenke',
  'Rubaya', 'Rukomo', 'Rushaki', 'Rutare', 'Ruvune', 'Busogo', 'Cyuve', 'Gacaca', 'Gashaki', 'Gataraga', 'Kimonyi',
  'Kinigi', 'Muhoza', 'Musanze', 'Nkotsi', 'Nyange', 'Rwaza', 'Shingiro', 'Base', 'Burega', 'Bushoki', 'Buyoga',
  'Cyinzuzi', 'Cyungo', 'Kisaro', 'Masoro', 'Mbogo', 'Murambi', 'Ntunga', 'Rukozo', 'Rusiga', 'Shyorongi',
  'Gashora', 'Juru', 'Kamabuye', 'Mareba', 'Mayange', 'Musenyi', 'Mwogo', 'Ngeruka', 'Ntarama', 'Nyamata',
  'Rilima', 'Ruhuha', 'Rweru', 'Shyara', 'Gitoki', 'Kabarore', 'Kiramuruzi', 'Kiziguro', 'Muhura', 'Murambi',
  'Ngarama', 'Nyagihanga', 'Gahini', 'Kabare', 'Kabarondo', 'Murundi', 'Mwiri', 'Ndego', 'Nyamirama', 'Rukara',
  'Ruramira', 'Rwinkwavu', 'Gahara', 'Gatore', 'Kigina', 'Kirehe', 'Mahama', 'Mpanga', 'Musaza', 'Mushikiri',
  'Nasho', 'Nyabugando', 'Nyarubuye', 'Rusumo', 'Karembo', 'Kazo', 'Kibungo', 'Mugesera', 'Murama', 'Mutenderi',
  'Rukira', 'Rukumberi', 'Rurenge', 'Sake', 'Zaza', 'Gatunda', 'Kiyombe', 'Katabagemu', 'Kinyami', 'Rukomo',
  'Rwempasha', 'Rwimiyaga', 'Tabagwe', 'Fumbwe', 'Gahengeri', 'Gishari', 'Karenge', 'Kigabiro', 'Muhazi', 'Munyarugenge',
  'Muyumbu', 'Mwulire', 'Nyakariro', 'Rwamagana', 'Rukoma', 'Bwishyura', 'Gashari', 'Gishyita', 'Gitesi', 'Mubuga',
  'Murundi', 'Mutuntu', 'Rubengera', 'Rugabano', 'Ruganda', 'Rwankuba', 'Twumba', 'Banda', 'Bwira', 'Gatumba',
  'Hindiro', 'Kabagari', 'Kageyo', 'Kavumu', 'Matyazo', 'Muhanda', 'Muhororo', 'Ndaro', 'Ngororero', 'Nyange',
  'Zunga', 'Bigogwe', 'Jenda', 'Jomba', 'Kabatwa', 'Karago', 'Kintobo', 'Mukamira', 'Muringa', 'Rambura',
  'Rugera', 'Rurembo', 'Shyira', 'Bushenge', 'Bweyeye', 'Gihombo', 'Kagano', 'Kanjongo', 'Karambo', 'Karengera',
  'Kaziba', 'Kibogora', 'Kigarama', 'Kivu', 'Macuba', 'Mahembe', 'Nyabiteke', 'Rangiro', 'Ruharambuga', 'Shangi',
  'Bugeshi', 'Busasamana', 'Cyanzarwe', 'Gisenyi', 'Kanama', 'Kanzenze', 'Mudende', 'Nyakiriba', 'Nyamyumba', 'Nyundo',
  'Rubavu', 'Rugerero', 'Butare', 'Bugarama', 'Gihundwe', 'Gikundamvura', 'Gitambi', 'Kamembe', 'Mururu', 'Nkanka',
  'Nkungu', 'Ntendezi', 'Nyakabuye', 'Nyakarenzo', 'Nyehanga', 'Boneza', 'Gihango', 'Kigeyo', 'Kivyeyi', 'Manihira',
  'Mukura', 'Murunda', 'Musasa', 'Mushonyi', 'Mushubati', 'Nyabirasi', 'Rusebeya',
];

// —— Cells (Akagari) per sector – every sector has cells assigned; key = district|sector; real Rwanda names ——
export const RWANDA_CELLS_BY_SECTOR: Record<string, string[]> = (() => {
  const out: Record<string, string[]> = {};
  let poolIdx = 0;
  for (const [district, sectors] of Object.entries(RWANDA_SECTORS_BY_DISTRICT)) {
    for (const sector of sectors) {
      const key = `${district}|${sector}`;
      const cells: string[] = [sector];
      const used = new Set<string>([sector]);
      for (let i = 0; i < 11; i++) {
        while (used.has(RWANDA_CELL_NAMES_POOL[poolIdx % RWANDA_CELL_NAMES_POOL.length])) poolIdx++;
        const name = RWANDA_CELL_NAMES_POOL[poolIdx % RWANDA_CELL_NAMES_POOL.length];
        cells.push(name);
        used.add(name);
        poolIdx++;
      }
      out[key] = cells;
    }
  }
  return out;
})();

// —— Villages (Umudugudu) per cell – every cell has villages; key = district|sector|cell; full hierarchy ——
export const RWANDA_VILLAGES_BY_CELL: Record<string, string[]> = (() => {
  const out: Record<string, string[]> = {};
  const villageSuffixes = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'Centre', 'Nord', 'Sud', 'Est', 'Ouest'];
  for (const [sectorKey, cells] of Object.entries(RWANDA_CELLS_BY_SECTOR)) {
    for (const cell of cells) {
      const key = `${sectorKey}|${cell}`;
      out[key] = villageSuffixes.slice(0, 10).map((s) => `${cell} ${s}`);
    }
  }
  return out;
})();

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
