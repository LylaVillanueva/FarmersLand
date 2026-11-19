/* =========================================================
   GAME DATA: everything you may want to edit in the intro game
   ---------------------------------------------------------
   • INTRO / FINALE ... what Tatay Ramon says at the start & end
   • STATIONS ......... the history posts (year label, dialog lines,
                        and which picture from story-scenes.js to show)
   • HEARTS ........... the "Alam mo ba?" facts and where the coins float
   • GLOSSARY ......... "?" explanations of hard words shown under the dialog
   • PLOTS / NPCS ..... the fields, farmers, carabaos and scarecrow
   • WORLD ............ size of the level and where it ends

   Positions (x) are in game pixels, left -> right. The player starts at
   WORLD.START_X and stops at the fence at WORLD.END_X. Keep stations and
   hearts between those two numbers, and in order from left to right.
   ========================================================= */
(function () {
  'use strict';

  /* ---------- world size ---------- */
  const WORLD = {
    H: 160,          // canvas height in game pixels (don't change)
    GROUND: 134,     // y of the ground line (don't change)
    START_X: 84,     // where Tatay Ramon starts
    END_X: 1630,     // where he stops (just before the fence)
    FENCE_X: 1648,   // the hacienda fence
    WORLD_W: 1960    // total level width
  };
  const GROUND = WORLD.GROUND;

  /* ---------- controls hint (shown as the last intro line) ---------- */
  const CONTROLS = {
    touch: 'Pindutin ang kaliwa at kanan sa ibaba para maglakad, at ang berdeng button para tumalon. Kunin ang mga puso at basahin ang mga poste sa daan! May bagong salita? Pindutin ang “?” sa ilalim ng usapan para sa paliwanag.',
    keyboard: 'Gamitin ang arrow keys (o A at D) para maglakad, at SPACE para tumalon. Kunin ang mga puso at basahin ang mga poste sa daan! May bagong salita? I-click ang “?” sa ilalim ng usapan (o pindutin ang H) para sa paliwanag.'
  };

  /* ---------- dialog: start of the game ---------- */
  const INTRO = [
    'Magandang umaga! Ako si Tatay Ramon. Bata pa lang ako, magsasaka na ako, gaya ng aking mga magulang, at ng mga lolo at lola ko.',
    'Araw-araw kong tinatamnan ang lupang ito... pero hanggang ngayon, hindi pa rin ito akin.',
    'Samahan mo akong maglakad, at ikukuwento ko kung bakit.',
    '{controls}' // replaced with the touch or keyboard line from CONTROLS above
  ];

  /* ---------- soil beds (x = left edge, w = width) ---------- */
  const PLOTS = [
    { x: 140, w: 120 }, { x: 300, w: 150 },
    { x: 520, w: 120 }, { x: 680, w: 150 }, { x: 880, w: 140 },
    { x: 1070, w: 170 }, { x: 1280, w: 130 }, { x: 1450, w: 140 }
  ];

  /* ---------- fellow farmers, carabaos & the scarecrow ----------
     type: 'carabao'   resting carabao        (x, y, dir: 1 right / -1 left)
           'plant'     farmer planting rice   (x, v: shirt 0-3, dir, off: animation offset)
           'hoe'       farmer with a hoe      (x, v, dir, off)
           'team'      carabao + plow + farmer walking between min and max
           'scarecrow' panakot with a maya bird (x)                                    */
  const NPCS = [
    { type: 'carabao', x: 100, y: GROUND - 2, dir: 1 },
    { type: 'plant', x: 160, v: 0, dir: 1, off: 0 },
    { type: 'scarecrow', x: 179 },
    { type: 'plant', x: 196, v: 3, dir: -1, off: 0.5 },
    { type: 'team', min: 334, max: 420, v: 1 },
    { type: 'plant', x: 540, v: 2, dir: 1, off: 0.25 },
    { type: 'plant', x: 576, v: 0, dir: -1, off: 0.75 },
    { type: 'team', min: 714, max: 800, v: 3 },
    { type: 'hoe', x: 900, v: 2, dir: 1, off: 0 },
    { type: 'plant', x: 946, v: 1, dir: 1, off: 0.3 },
    { type: 'hoe', x: 996, v: 0, dir: -1, off: 0.45 },
    { type: 'team', min: 1108, max: 1210, v: 2 },
    { type: 'carabao', x: 1248, y: GROUND - 2, dir: -1 },
    { type: 'plant', x: 1294, v: 3, dir: 1, off: 0.2 },
    { type: 'plant', x: 1326, v: 1, dir: 1, off: 0.7 },
    { type: 'plant', x: 1384, v: 0, dir: -1, off: 0.4 },
    { type: 'hoe', x: 1464, v: 3, dir: 1, off: 0.1 },
    { type: 'team', min: 1504, max: 1560, v: 0 }
  ];

  /* ---------- history posts ----------
     label  .... text carved on the stump (A-Z, 0-9 only)
     tag  ...... small tag shown in the dialog box
     scenes .... one picture id per line (see story-scenes.js), or null
     lines ..... what Tatay Ramon says, one dialog box per line          */
  const STATIONS = [
    { x: 236, label: '1570S', tag: 'ENKOMYENDA', scenes: ['enkomyenda', 'enkomyenda', 'asyenda'], lines: [
      'Noong panahon ng mga Espanyol, binigyan ng Hari ng Espanya ang kanyang mga opisyal at sundalo ng karapatang maningil ng buwis at magpatrabaho sa mga nakatira sa malalaking lugar. Ito ang enkomyenda.',
      'Unti-unti, naagaw ang mga lupang dati ay sama-samang tinatamnan ng aming mga ninuno sa barangay.',
      'Noong 1700s at 1800s, lumawak ang mga asyenda: malalaking taniman ng tabako, tubo at abaka na pag-aari ng iilan. Dito lumaganap ang sistemang kasamá: kami ang nagtatanim, pero malaking bahagi ng ani ay napupunta sa may-ari ng lupa.'
    ] },
    { x: 420, label: '1896', tag: 'REBOLUSYON', scenes: ['revolution', 'revolution', 'us-era'], lines: [
      'Lumaban ang mga tao. Tinatayang 200 pag-aalsa ang nangyari bago pa ang 1896, gaya ng pinamunuan nina Sumuroy at Dagohoy.',
      'Noong 1896, nagsimula ang Rebolusyon ng Katipunan para palayasin ang mga Espanyol at wakasan ang kanilang pang-aapi.',
      'Pero pagkatapos, dumating ang mga Amerikano. Hindi nila hinati ang mga asyenda para sa mga magsasaka. Lalo pa nilang pinalaki ang mga ito at tinulungan ang mga may-ari ng lupa.'
    ] },
    { x: 616, label: '1972', tag: 'PD 27', scenes: ['pd27', 'pd27'], lines: [
      'Noong 1972, may bagong batas: ang Presidential Decree 27. Sabi nito, ibibigay na ang lupa sa mga magsasaka ng palay at mais.',
      'Pero kailangan pala naming bayaran ang lupa nang hulugan, taon-taon. At ang mga taniman ng tubo at niyog? Hindi kasali.'
    ] },
    { x: 800, label: '1987', tag: 'MENDIOLA', video: 'mendiola', scenes: ['mendiola-march', 'mendiola-after', null], lines: [
      'Enero 22, 1987. Libu-libong magsasaka ang nagmartsa papuntang Mendiola para humingi ng tunay na reporma sa lupa.',
      'Pinaputukan sila. Labintatlong magsasaka ang namatay. Hanggang ngayon, humihingi pa rin ng hustisya ang kanilang mga pamilya.',
      'May totoong video na kinunan noong araw na iyon. Bago ito ipakita, may babala muna. Ikaw ang pipili kung manonood ka.'
    ] },
    { x: 984, label: '1988', tag: 'CARP · RA 6657', scenes: ['carp', 'carp', 'carp'], lines: [
      'Noong 1988, ipinasa ang CARP, isang batas na nangakong ibibigay ang lupa sa mga nagtatanim nito.',
      'Pero maraming butas ang batas. Puwedeng magbigay ang may-ari ng "shares" o maliit na bahagi sa kumpanya imbes na lupa. May mga lupang hindi isinama, at may mga sakahang ginawang subdivision.',
      'Kaya maraming malalaking asyenda ang hindi pa rin napunta sa mga magsasaka, kahit lumipas na ang maraming taon.'
    ] },
    { x: 1170, label: '2004', tag: 'HACIENDA LUISITA', video: 'luisita', scenes: ['luisita-strike', 'luisita-after', 'court', null], lines: [
      'Nobyembre 16, 2004. Nagwelga ang mga manggagawang-bukid ng Hacienda Luisita sa Tarlac. Iprinotesta nila ang napakababang sahod at ang pagtanggal sa trabaho ng daan-daang manggagawa.',
      'Marahas na pinaalis ang mga nagwewelga. Pito ang namatay.',
      'Noong 2012, nagdesisyon ang Korte Suprema na ibigay ang lupa sa mga manggagawa. Pero hanggang ngayon, hindi pa tapos ang laban nila para sa lupa.',
      'May totoong video ng pagbuwag sa welga. Bago ito ipakita, may babala muna. Ikaw ang pipili kung manonood ka.'
    ] },
    { x: 1346, label: '2014', tag: 'CARPER · RA 9700', scenes: ['carper', 'carper'], lines: [
      'Noong 2009, pinahaba ang CARP sa pamamagitan ng bagong batas, ang CARPER. Natapos ang huling araw nito noong Hunyo 30, 2014.',
      'Pero marami pa ring lupa ang hindi naibigay. At maraming magsasaka ang nawalan ulit ng lupa dahil sa utang at upa.'
    ] },
    { x: 1530, label: 'NGAYON', tag: 'SA KASALUKUYAN', video: 'pax', scenes: ['tenant', 'conversion', 'landuse', 'datacenter', 'datacenter', null], lines: [
      'Ngayon, marami pa rin sa amin ang umuupa ng lupa, nakikitanim sa lupa ng iba, o binabayaran lang bawat araw ng trabaho.',
      'At pinapaalis pa kami sa sakahan. Ang mga lumalaban ay ginigipit, kinakasuhan, at pinapatay pa.',
      'Hindi lang subdivision at resort ang ipinapalit sa aming lupa. Ginagawa rin itong minahan, tapunan ng basura, at ngayon, data center.',
      'Sa Capas, Tarlac, may planong 1,600 ektaryang Pax Silica hub para sa AI at mga data center. Pinamumunuan ito ng Estados Unidos.',
      'Nangangamba ang mga Aeta at magsasaka roon na mapaalis sa lupang tinitirhan at sinasaka nila. Sabi ng isang pinunong Aeta: hindi sila aalis sa kanilang lupa.',
      'May maikling bahagi ng dokumentaryo ni Jessica Soho tungkol sa mga residenteng nangangambang mawalan ng tirahan.'
    ] }
  ];

  /* ---------- “Alam mo ba?” heart coins (y: GROUND - 13 = walk into it, GROUND - 40 = jump) ---------- */
  const HEARTS = [
    { x: 176, y: GROUND - 40, fact: 'Sa sistemang kasamá, kadalasang kalahati o higit pa ng ani ang napupunta sa may-ari ng lupa bilang upa.' },
    { x: 340, y: GROUND - 13, fact: 'Limang paraan kung paano naaapi ang magsasaka: mataas na upa sa lupa, utang na sobrang taas ng tubo (usura), napakababang sahod, sapilitang trabaho nang walang bayad, at pag-agaw ng lupa.' },
    { x: 556, y: GROUND - 40, fact: 'Ang mga magsasaka ay kabilang sa pinakamahihirap sa bansa, pero sila ang nagpapakain sa ating lahat.' },
    { x: 720, y: GROUND - 13, fact: 'Hindi lang lupa ang kailangan: binhi, patubig, makinarya, pautang na mababa ang tubo, at patas na presyo ng ani. Kailangan din ang pagpapalakas ng kanilang karapatan, at ang pagbibigay sa kanila ng kapayapaan at katarungan.' },
    { x: 896, y: GROUND - 42, fact: 'Ang tunay na reporma sa lupa ay LIBRENG pagbibigay ng lupa sa mga nagtatanim nito.' },
    { x: 1086, y: GROUND - 13, fact: 'Kapag may sariling lupa at suporta ang mga magsasaka, mas sapat at mas mura ang pagkain para sa lahat.' },
    { x: 1260, y: GROUND - 44, fact: 'Ang Genuine Agrarian Reform Bill (GARB) ay panukalang batas para sa libreng pamimigay ng lupa. Ilang beses na itong inihain sa Kongreso, pero hindi pa rin naipapasa.' },
    { x: 1454, y: GROUND - 38, fact: 'Lupa ay buhay. Ang lupang walang magsasaka ay walang ani; ang magsasakang walang lupa ay walang kinabukasan.' }
  ];

  /* ---------- dialog: at the hacienda fence (then the ending screen) ---------- */
  const FINALE = [
    'Ito ang lupang tinamnan ng aming mga ninuno. Dito kami nagtanim, nag-ani, at nagpakapagod.',
    'Pero sa papel, pag-aari ito ng iilan. Bawal na kaming pumasok sa lupang pinaghirapan namin.',
    'Kaya kami ay nananawagan...'
  ];

  /* ---------- glossary: "?" explanations under the dialog box ----------
     When a dialog line contains `find`, a dropdown appears under the text
     with `term` and its explanation `def`. `find` is a regular expression
     (case-insensitive). Keep definitions short and simple.            */
  const GLOSSARY = [
    { find: 'kasamá', term: 'Sistemang kasamá',
      def: 'Ang magsasaka ang nagtatanim at nag-aalaga sa lupa ng iba. Pagdating ng anihan, hinahati ang ani, at ang malaking bahagi, kadalasang kalahati o higit pa, ay napupunta sa may-ari bilang upa. Madalas, sagot pa ng magsasaka ang malaking bahagi ng gastos, kaya nababaon sila sa utang. (Iba ito sa "kasama" na ibig sabihin ay kaibigan o kasabay.)' },
    { find: 'enkomyenda', term: 'Enkomyenda',
      def: 'Sistema noong panahon ng Espanyol. Binigyan ng Hari ang kanyang mga opisyal at sundalo ng karapatang maningil ng tributo (buwis) at magpatrabaho sa mga nakatira sa isang lugar. Hindi ito titulo ng lupa, pero ginamit ito ng ilan para makakuha ng lupain.' },
    { find: 'asyenda|hacienda', term: 'Asyenda (hacienda)',
      def: 'Napakalaking taniman (halimbawa ng tubo, tabako o abaka) na pag-aari ng isang mayamang pamilya o kumpanya. Ang mga nagtatrabaho rito ay hindi may-ari ng lupang tinatamnan nila.' },
    { find: 'ninuno', term: 'Ninuno', def: 'Ang mga nauna sa atin sa pamilya: ang mga lolo at lola ng ating mga lolo at lola.' },
    { find: 'pag-aalsa', term: 'Pag-aalsa', def: 'Sama-samang paglaban ng mga tao sa mga namumuno o nang-aapi sa kanila.' },
    { find: 'katipunan', term: 'Katipunan', def: 'Lihim na samahan na itinatag ni Andres Bonifacio noong 1892 para makamit ang kalayaan ng Pilipinas mula sa Espanya.' },
    { find: 'presidential decree', term: 'Presidential Decree (PD)', def: 'Batas na ginawa mismo ng Pangulo nang hindi dumadaan sa Kongreso. Ganito gumawa ng mga batas si Pangulong Marcos noong Martial Law.' },
    { find: 'hulugan', term: 'Hulugan', def: 'Pagbabayad nang paunti-unti sa loob ng maraming taon. Sa PD 27, binabayaran ng magsasaka ang lupa sa loob ng 15 taon.' },
    { find: 'mendiola', term: 'Mendiola', def: 'Kalye malapit sa Malacañang, ang tirahan at opisina ng Pangulo. Madalas dito nagpoprotesta ang mga tao.' },
    { find: 'reporma sa lupa', term: 'Reporma sa lupa', def: 'Pagbabago kung sino ang may-ari ng lupa: kinukuha ito mula sa iilang malalaking may-ari at ibinibigay sa mga magsasakang nagtatanim nito.' },
    { find: '\\bcarp\\b', term: 'CARP', def: 'Comprehensive Agrarian Reform Program: batas noong 1988 (RA 6657) para ipamahagi ang lupa sa mga magsasaka. Pero binabayaran pa rin ng magsasaka ang lupa, at maraming butas ang batas.' },
    { find: '"shares"', term: '"Shares" (stock distribution option)', def: 'Isang butas sa CARP. Imbes na ibigay ang lupa, puwedeng bigyan ng may-ari ang mga manggagawa ng maliit na bahagi sa kumpanya. Ganito ang nangyari sa Hacienda Luisita, kaya hindi agad napunta sa mga manggagawa ang lupa.' },
    { find: 'subdivision', term: 'Land conversion', def: 'Pagpapalit ng gamit ng sakahan. Halimbawa, ginagawa itong subdivision, mall o resort. Kapag nangyari ito, nawawalan ng lupa at trabaho ang mga magsasaka.' },
    { find: 'pax silica', term: 'Pax Silica', def: 'Isang inisyatibang pinamumunuan ng Estados Unidos, kasama ang mga kaalyadong bansa, para sa supply ng AI, semiconductor at critical minerals. Sa Pilipinas, may planong 1,600 ektaryang hub nito sa New Clark City, Capas, Tarlac.' },
    { find: 'data center', term: 'Data center', def: 'Malaking gusaling puno ng mga computer na nag-iimbak at nagpapatakbo ng mga app, website at AI. Kailangan nito ng napakaraming kuryente, tubig at lupa.' },
    { find: 'welga|nagwewelga', term: 'Welga (strike)', def: 'Sama-samang pagtigil sa trabaho ng mga manggagawa para iprotesta ang hindi makatarungang kalagayan, gaya ng napakababang sahod.' },
    { find: 'manggagawang-bukid', term: 'Manggagawang-bukid', def: 'Taong nagtatrabaho sa bukid o asyenda kapalit ng sahod, pero walang sariling lupa.' },
    { find: 'carper', term: 'CARPER', def: 'CARP Extension with Reforms (RA 9700): batas noong 2009 na nagpahaba sa CARP hanggang 2014.' },
    { find: '\\bupa\\b', term: 'Upa', def: 'Bayad sa may-ari para magamit ang lupa, pera man o bahagi ng ani.' },
    { find: 'usura', term: 'Usura', def: 'Pagpapautang na sobrang taas ng tubo (interes), kaya halos hindi na makabayad ang umutang.' },
    { find: 'plantasyon', term: 'Plantasyon', def: 'Malawak na taniman ng iisang pananim, gaya ng saging o palm oil, na kadalasang pag-aari ng malaking kumpanya.' }
  ];


  window.GameData = {
    WORLD: WORLD, CONTROLS: CONTROLS, INTRO: INTRO, FINALE: FINALE,
    PLOTS: PLOTS, NPCS: NPCS, STATIONS: STATIONS, HEARTS: HEARTS, GLOSSARY: GLOSSARY
  };
})();
