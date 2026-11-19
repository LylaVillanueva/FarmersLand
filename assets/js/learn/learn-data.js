/* =========================================================
   LEARN PAGE DATA: the text and links you may want to edit
   ---------------------------------------------------------
   • ICONS ....... small 12×12 pixel icons used in the menu & cards
                   (each letter in `map` is a colour from `colors`, '.' = empty)
   • ORGS ........ organizations used by the "Hanapin" finder
   • FINDER ...... what the finder recommends for each kind of visitor
   • DATES ....... commemoration dates for the calendar section
   • LETTER ...... the letter visitors can copy for their lawmakers
   • SHARE ....... text used by the share buttons

   Links shown directly on the page (donate, join, references) are
   written in learn.html, search for "MAG-DONATE", "SUMALI" or "SANGGUNIAN".
   ========================================================= */
(function () {
  'use strict';

  /* ---------- pixel icons ---------- */
  const ICONS = {
    sprout: { map: [
      '............', '..GG....GG..', '.GGGG..GGGG.', '.GGGGG.GGGG.', '..GGGGGGGG..', '....GGGG....',
      '.....GG.....', '.....GG.....', '..BBBBBBBB..', '.BbBBbBBbBB.', 'BBBBBBBBBBBB', 'bbbbbbbbbbbb'
    ], colors: { G: '#5fae48', B: '#8a6136', b: '#5e3f22' } },
    scroll: { map: [
      '............', '.WWWWWWWWWW.', '.WkkkkkkkkW.', '.WWWWWWWWWW.', '.WkkkkkkWWW.', '.WWWWWWWWWW.',
      '.WkkkW..kkW.', '.WWWW....WW.', '.WkkW....kW.', '.WWWWW..WWW.', '.WkkkkkkkkW.', '.WWWWWWWWWW.'
    ], colors: { W: '#f3e2b6', k: '#8a6136' } },
    building: { map: [
      '..DDDDDD....', '..DwDwDw....', '..DDDDDD.DDD', '..DwDwDwDwDw', '..DDDDDDDDDD', '..DwDwDwDwDw',
      '..DDDDDDDDDD', '..DwDDwDDDwD', '..DDDddDDDDD', 'G.DDDddDDDDD', 'GGGGGGGGGGGG', 'bbbbbbbbbbbb'
    ], colors: { D: '#7d8a99', w: '#dff0fa', d: '#3d4f66', G: '#7cc35a', b: '#5e3f22' } },
    check: { map: [
      '............', '..........GG', '.........GGG', '........GGG.', '.......GGG..', 'GG....GGG...',
      'GGG..GGG....', '.GGGGGG.....', '..GGGG......', '...GG.......', '............', '............'
    ], colors: { G: '#7cc35a' } },
    megaphone: { map: [
      '..........R.', '........RRR.', '......RRRRR.', '..WWRRRRRRR.', 'WWWWRRRRRRR.', 'WWWWRRRRRRR.',
      '..WWRRRRRRR.', '...K..RRRRR.', '...K....RRR.', '...KK.....R.', '............', '............'
    ], colors: { R: '#d24a4a', W: '#f3e2b6', K: '#8a5c33' } },
    question: { map: [
      '...YYYYY....', '..YYYYYYY...', '.YYY...YYY..', '.YY.....YY..', '........YY..', '.......YYY..',
      '......YYY...', '.....YYY....', '.....YY.....', '............', '.....YY.....', '.....YY.....'
    ], colors: { Y: '#f8cf55' } },
    calendar: { map: [
      '..K......K..', '.RRRRRRRRRR.', '.RRRRRRRRRR.', '.WWWWWWWWWW.', '.WKWWKWWKWW.', '.WWWWWWWWWW.',
      '.WKWWKWWRRW.', '.WWWWWWWRRW.', '.WKWWKWWWWW.', '.WWWWWWWWWW.', '............', '............'
    ], colors: { R: '#d24a4a', W: '#fff6dc', K: '#8a6136' } },
    book: { map: [
      '............', '.BBBB..BBBB.', 'BWWWWBBWWWWB', 'BWKKWBBWKKWB', 'BWWWWBBWWWWB', 'BWKKWBBWKKWB',
      'BWWWWBBWWWWB', 'BWKKWBBWKKWB', 'BWWWWBBWWWWB', '.BBBBBBBBBB.', '............', '............'
    ], colors: { B: '#4a9ad8', W: '#fff6dc', K: '#c9b88e' } },
    people: { map: [
      '............', '..HH....HH..', '.HHHH..HHHH.', '.SSSS..SSSS.', '.SSSS..SSSS.', '..SS....SS..',
      '.BBBB..GGGG.', 'BBBBBBGGGGGG', 'BBBBBBGGGGGG', 'BBBBBBGGGGGG', '............', '............'
    ], colors: { H: '#7a4a2c', S: '#a8693f', B: '#4a9ad8', G: '#7cc35a' } },
    search: { map: [
      '..KKKK......', '.KWWWWK.....', 'KWWWWWWK....', 'KWWWWWWK....', 'KWWWWWWK....', 'KWWWWWWK....',
      '.KWWWWK.....', '..KKKKKK....', '......KKK...', '.......KKK..', '........KKK.', '.........KK.'
    ], colors: { K: '#2a1a14', W: '#cfe8f6' } },
    heart: { map: [
      '..RR....RR..', '.RRRR..RRRR.', 'RRrRRR.RRRRR', 'RrRRRR.RRRRR', 'RRRRR.RRRRRR', 'RRRRRR.RRRRR',
      '.RRRR.RRRRR.', '..RRRR.RRR..', '...RR.RRR...', '....RR.R....', '.....R......', '............'
    ], colors: { R: '#a3262a', r: '#e06a6a' } }
  };

  /* ---------- organizations for the finder ---------- */
  const ORGS = {
    KMP: { name: 'Kilusang Magbubukid ng Pilipinas (KMP)', url: 'https://peasantmovementph.com/' },
    AMIHAN: { name: 'AMIHAN: National Federation of Peasant Women', url: 'https://amihanwomen.org/' },
    PAKISAMA: { name: 'PAKISAMA', url: 'https://www.pakisama.com/' },
    MASIPAG: { name: 'MASIPAG', url: 'https://masipag.org/' },
    IBON: { name: 'IBON Foundation', url: 'https://www.ibon.org/' },
    ANAKBAYAN: { name: 'Anakbayan: organisasyon ng kabataan', url: 'https://www.facebook.com/anakbayanphils/' },
    SAKA: { name: 'SAKA: Sama-samang Artista para sa Kilusang Agraryo', url: 'https://www.facebook.com/saka.pilipinas' }
  };

  /* ---------- finder: who are you? -> which orgs ----------
     keys must match the data-who="" buttons in learn.html         */
  const FINDER = {
    estudyante: { title: 'PARA SA ESTUDYANTE', orgs: ['ANAKBAYAN', 'KMP', 'MASIPAG'], tip: 'Tingnan kung may chapter ng Anakbayan sa inyong paaralan. Magtanong tungkol sa mga talakayan, exposure trip at volunteer work. Puwede mo ring gamitin ang aming “Para sa Klase” na mga tanong.' },
    magsasaka: { title: 'PARA SA MAGSASAKA', orgs: ['KMP', 'PAKISAMA'], tip: 'Mga pambansang samahan ng magsasaka na may mga kasaping organisasyon sa iba’t ibang probinsya.' },
    kababaihan: { title: 'PARA SA KABABAIHAN', orgs: ['AMIHAN', 'PAKISAMA'], tip: 'Ang AMIHAN ay pederasyon ng kababaihang magsasaka. Kasama rin sa PAKISAMA ang kababaihan sa kanayunan.' },
    artista: { title: 'PARA SA ARTISTA AT MANLILIKHA', orgs: ['SAKA'], tip: 'Gamitin ang sining, musika, pagsulat at disenyo para ikuwento ang laban ng magsasaka para sa lupa at pagkain.' },
    agrikultura: { title: 'PARA SA MAHILIG SA PAGSASAKA', orgs: ['MASIPAG', 'PAKISAMA'], tip: 'Matuto tungkol sa binhi, organikong pagsasaka, agroecology at food sovereignty.' },
    mananaliksik: { title: 'PARA SA MANANALIKSIK', orgs: ['IBON', 'KMP'], tip: 'Pananaliksik at datos tungkol sa agrikultura, lupa at kanayunan. Tingnan din ang aming Mga Mapagkukunan.' },
    donor: { title: 'PARA SA GUSTONG MAG-DONATE', orgs: [], tip: '' }
  };

  /* ---------- calendar (m = month 1-12, d = day) ---------- */
  const DATES = [
    { m: 1, d: 22, title: 'Paggunita sa Mendiola Massacre', text: '13 magsasaka ang napatay noong 1987 habang humihingi ng tunay na reporma sa lupa.' },
    { m: 4, d: 17, title: 'International Day of Peasant Struggle', text: 'Pandaigdigang araw ng pakikibaka ng mga magsasaka.' },
    { m: 6, d: 10, title: 'Anibersaryo ng CARP', text: 'Nilagdaan ang RA 6657 noong 1988.' },
    { m: 10, d: 15, title: 'International Day of Rural Women', text: 'Pagkilala sa kababaihan sa kanayunan.' },
    { m: 10, d: 16, title: 'World Food Day', text: 'Paalala na ang pagkain ay galing sa magsasaka.' },
    { m: 10, d: 21, title: 'Anibersaryo ng PD 27', text: 'Inilabas ang Presidential Decree 27 noong 1972.' },
    { m: 11, d: 16, title: 'Paggunita sa Hacienda Luisita Massacre', text: '7 manggagawang-bukid ang napatay noong 2004.' }
  ];
  const MONTHS = ['ENE', 'PEB', 'MAR', 'ABR', 'MAY', 'HUN', 'HUL', 'AGO', 'SET', 'OKT', 'NOB', 'DIS'];
  const MONTHS_LONG = ['Enero', 'Pebrero', 'Marso', 'Abril', 'Mayo', 'Hunyo', 'Hulyo', 'Agosto', 'Setyembre', 'Oktubre', 'Nobyembre', 'Disyembre'];

  /* ---------- letter to lawmakers (copied by "Kopyahin ang Liham") ---------- */
  const LETTER = 'Mahal na [Pangalan ng Senador o Kinatawan],\n\n' +
    'Ako po ay isang estudyante mula sa [Iyong Lugar]. Sumusulat po ako upang hilingin na suportahan ninyo ang tunay na reporma sa lupa: ang libreng pamamahagi ng lupa sa mga magsasaka, ang pagbabawal sa land conversion ng mga sakahan, at sapat na suporta sa produksyon.\n\n' +
    'Ang mga magsasaka ang nagpapakain sa bayan, pero marami pa rin sa kanila ang walang sariling lupa. Umaasa po ako na ipaglalaban ninyo ang kanilang karapatan, kasama ang pagpasa ng Genuine Agrarian Reform Bill.\n\n' +
    'Maraming salamat po.\n\n[Iyong Pangalan]';

  /* ---------- share buttons ---------- */
  const SHARE = {
    title: 'Tunay na Reporma para sa Lupa',
    text: 'Laruin at alamin kung bakit kailangan ang tunay na reporma sa lupa. #TunayNaRepormaSaLupa'
  };

  window.LearnData = {
    ICONS: ICONS, ORGS: ORGS, FINDER: FINDER, DATES: DATES,
    MONTHS: MONTHS, MONTHS_LONG: MONTHS_LONG, LETTER: LETTER, SHARE: SHARE
  };
})();
