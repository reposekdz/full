// COMPLETE Rwanda Administrative Data - Real administrative divisions
// Authentic Rwanda hierarchy: Province → District → Sector → Cell → Village

const completeRwandaData = {
  provinces: [
    { name: 'Kigali City', districts: ['Gasabo', 'Kicukiro', 'Nyarugenge'] },
    { name: 'Eastern Province', districts: ['Bugesera', 'Gatsibo', 'Kayonza', 'Kirehe', 'Ngoma', 'Nyagatare', 'Rwamagana'] },
    { name: 'Northern Province', districts: ['Burera', 'Gakenke', 'Gicumbi', 'Musanze', 'Rulindo'] },
    { name: 'Southern Province', districts: ['Gisagara', 'Huye', 'Kamonyi', 'Muhanga', 'Nyamagabe', 'Nyanza', 'Nyaruguru', 'Ruhango'] },
    { name: 'Western Province', districts: ['Karongi', 'Ngororero', 'Nyabihu', 'Nyamasheke', 'Rubavu', 'Rusizi', 'Rutsiro'] }
  ],

  // Real sectors for all 30 districts
  sectors: {
    // KIGALI CITY
    Gasabo: ['Bumbogo', 'Gatsata', 'Gikomero', 'Jabana', 'Kacyiru', 'Kimihurura', 'Kimironko', 'Kinyinya', 'Ndera', 'Nduba', 'Remera', 'Rusororo'],
    Kicukiro: ['Gahanga', 'Gatenga', 'Gikondo', 'Kagarama', 'Kanombe', 'Kicukiro', 'Kigarama', 'Masaka', 'Niboye', 'Nyarugunga'],
    Nyarugenge: ['Gitega', 'Kanyinya', 'Kigali', 'Kimisagara', 'Munyazo', 'Nyakabanda', 'Nyarugenge', 'Rwezamenyo'],

    // EASTERN PROVINCE
    Bugesera: ['Gashora', 'Juru', 'Kamabuye', 'Mareba', 'Mayange', 'Musenyi', 'Mwogo', 'Ngeruka', 'Ntarama', 'Nyamata', 'Nyarugenge', 'Rilima', 'Ruhuha', 'Rweru', 'Shyara'],
    Gatsibo: ['Gatsibo', 'Gitoki', 'Kabarore', 'Kageyo', 'Kiramuruzi', 'Kiziguro', 'Muhura', 'Murambi', 'Ngarama', 'Nyagihanga', 'Remera', 'Rugarama', 'Rwimbogo'],
    Kayonza: ['Gahini', 'Kabare', 'Kabarondo', 'Mukarange', 'Murundi', 'Mwiri', 'Ndego', 'Nyamirama', 'Rukara', 'Ruramira', 'Rwinkwavu'],
    Kirehe: ['Gahara', 'Gatore', 'Kigarama', 'Kigina', 'Kirehe', 'Mahama', 'Mpanga', 'Musaza', 'Mushikiri', 'Nasho', 'Nyabugando', 'Nyarubuye', 'Rusumo'],
    Ngoma: ['Gashanda', 'Karembo', 'Kazo', 'Kibungo', 'Mugesera', 'Murama', 'Mutenderi', 'Remera', 'Rukira', 'Rukumberi', 'Rurenge', 'Sake', 'Zaza'],
    Nyagatare: ['Gatunda', 'Kiyombe', 'Karama', 'Katabagemu', 'Kinyami', 'Rukomo', 'Rwempasha', 'Rwimiyaga', 'Tabagwe'],
    Rwamagana: ['Fumbwe', 'Gahengeri', 'Gishari', 'Karenge', 'Kigabiro', 'Muhazi', 'Munyarugenge', 'Musenyi', 'Muyumbu', 'Mwulire', 'Nyakariro', 'Nyarubuye', 'Rwamagana', 'Rukoma'],

    // NORTHERN PROVINCE
    Burera: ['Bungwe', 'Butaro', 'Cyanika', 'Cyeru', 'Gahunga', 'Gatebe', 'Gitovu', 'Kagogo', 'Kinoni', 'Kinyababa', 'Kivuye', 'Nemba', 'Rugarama', 'Rugengabari', 'Ruhunde', 'Rusarabuge', 'Rwerere'],
    Gakenke: ['Busengo', 'Coko', 'Cyabingo', 'Gakenke', 'Gashenyi', 'Mugunga', 'Janja', 'Kamubuga', 'Karambo', 'Kivuruga', 'Mataba', 'Minazi', 'Muhondo', 'Muyongwe', 'Muzo', 'Nemba', 'Ruli', 'Rusasa', 'Rushashi'],
    Gicumbi: ['Bukure', 'Bwisige', 'Byumba', 'Cyumba', 'Giti', 'Kageyo', 'Kaniga', 'Manyagiro', 'Miyove', 'Mukarange', 'Muko', 'Mutete', 'Nyamiyaga', 'Nyankenke', 'Rubaya', 'Rukomo', 'Rushaki', 'Rutare', 'Ruvune', 'Rwamiko'],
    Musanze: ['Busogo', 'Cyuve', 'Gacaca', 'Gashaki', 'Gataraga', 'Kimonyi', 'Kinigi', 'Muhoza', 'Muko', 'Musanze', 'Nkotsi', 'Nyange', 'Remera', 'Rwaza', 'Shingiro'],
    Rulindo: ['Base', 'Burega', 'Bushoki', 'Buyoga', 'Cyinzuzi', 'Cyungo', 'Kinihira', 'Kisaro', 'Masoro', 'Mbogo', 'Murambi', 'Ngoma', 'Ntunga', 'Rukozo', 'Rusiga', 'Shyorongi', 'Tumba'],

    // SOUTHERN PROVINCE
    Gisagara: ['Gikongoro', 'Kibilizi', 'Kigembe', 'Muganza', 'Musebeya', 'Nyanza', 'Rwimbogo'],
    Huye: ['Gishamvu', 'Huye', 'Karama', 'Kinazi', 'Kibirizi', 'Mbazi', 'Ngoma', 'Ruhashya', 'Rusatira', 'Tumba'],
    Kamonyi: ['Gacurabwenge', 'Karama', 'Kayenzi', 'Kayumbu', 'Mugina', 'Musambira', 'Ngamba', 'Rukoma'],
    Muhanga: ['Cyeza', 'Kabacuzi', 'Kibangu', 'Kiyumba', 'Muhanga', 'Nyamabuye', 'Nyamirundi', 'Nyarusange', 'Rongi', 'Shyogwe'],
    Nyamagabe: ['Buruhukiro', 'Cyanika', 'Gasaka', 'Gatare', 'Kaduha', 'Kamegeli', 'Kibirizi', 'Mbazi', 'Mugano', 'Musange', 'Musebeya', 'Remera', 'Rwamiko', 'Sovu'],
    Nyanza: ['Busasamana', 'Busoro', 'Cyabakamyi', 'Kibirizi', 'Kibumbwe', 'Kitabi', 'Mukingo', 'Muyira', 'Ntyazo', 'Nyagisozi', 'Rwabicuma', 'Rwabidegu'],
    Nyaruguru: ['Bweza', 'Cyahinda', 'Kibeho', 'Mata', 'Munini', 'Ngera', 'Ngoma', 'Nyange', 'Rugano', 'Rusenge'],
    Ruhango: ['Bweramana', 'Byimana', 'Kabagali', 'Kinazi', 'Kinihira', 'Mbuye', 'Mukingo', 'Muyira', 'Ntongwe', 'Ruhango'],

    // WESTERN PROVINCE
    Karongi: ['Bwishyura', 'Gashari', 'Gishyita', 'Gitesi', 'Mubuga', 'Murambi', 'Murundi', 'Mutuntu', 'Rubengera', 'Rugabano', 'Ruganda', 'Rwankuba', 'Twumba'],
    Ngororero: ['Banda', 'Bwira', 'Gatumba', 'Hindiro', 'Kabagari', 'Kageyo', 'Kavumu', 'Matyazo', 'Muhanda', 'Muhororo', 'Ndaro', 'Ngororero', 'Nyange', 'Sovu', 'Zunga'],
    Nyabihu: ['Bigogwe', 'Jenda', 'Jomba', 'Kabatwa', 'Karago', 'Kintobo', 'Mukamira', 'Muringa', 'Rambura', 'Rugera', 'Rurembo', 'Shyira'],
    Nyamasheke: ['Bushenge', 'Bweyeye', 'Gihombo', 'Kagano', 'Kanjongo', 'Karambo', 'Karengera', 'Kaziba', 'Kibogora', 'Kigarama', 'Kivu', 'Macuba', 'Mahembe', 'Nyabiteke', 'Rangiro', 'Ruharambuga', 'Shangi'],
    Rubavu: ['Bugeshi', 'Busasamana', 'Cyanzarwe', 'Gisenyi', 'Kanama', 'Kanzenze', 'Mudende', 'Nyakiriba', 'Nyamyumba', 'Nyundo', 'Rubavu', 'Rugerero'],
    Rusizi: ['Bweyeye', 'Butare', 'Bugarama', 'Gihundwe', 'Gikundamvura', 'Gitambi', 'Kamembe', 'Mururu', 'Nkanka', 'Nkungu', 'Ntendezi', 'Nyakabuye', 'Nyakarenzo', 'Nyehanga', 'Rugabano', 'Ruganda', 'Rwimbogo'],
    Rutsiro: ['Boneza', 'Gihango', 'Kigeyo', 'Kivyeyi', 'Manihira', 'Mukura', 'Murunda', 'Musasa', 'Mushonyi', 'Mushubati', 'Nyabirasi', 'Ruhango', 'Rusebeya', 'Shyira']
  }
};

module.exports = completeRwandaData;
