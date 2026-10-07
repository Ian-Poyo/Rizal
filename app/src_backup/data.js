import * as M from './media';
import { RATIO } from './media';

/* ------------------------------------------------------------------
   The account you are signed in as, and the people in their circle:
   figures of the Philippine reform and revolution, 1860s–1900s.
   All content is placeholder-style social copy written around the
   documented work of each person — swap any of it freely.
   ------------------------------------------------------------------ */
export const ME = 'joserizal';
const MIN = 60000, H = 60 * MIN, D = 24 * H;
const now = Date.now();

export const SEED_USERS = [
  { id: 'mabini', name: 'Apolinario Mabini', handle: 'mabini', avatar: M.avMabini, verified: true,
    bio: 'The Sublime Paralytic — brains of the Revolution. Author of the True Decalogue, 1898.',
    followers: 41200, following: 96, category: 'Lawyer · Statesman', cover: M.avMabini,
    about: '1864–1903. Called the Brains of the Revolution for the government he steered as the First Philippine Republic was being built. Paralysis took the use of his legs in 1896; his pen never stopped. Wrote the True Decalogue in 1898, was deported to Guam in 1901, and died in Manila two years after coming home.' },

  { id: 'bonifacio', name: 'Andrés Bonifacio', handle: 'bonifacio', avatar: M.avBonifacio, verified: true,
    bio: 'Founder of the Katipunan, 1892. The Great Plebeian.',
    followers: 96800, following: 140, category: 'Founder of the Katipunan', cover: M.kartilya,
    about: '1863–1897. Founded the Kataastaasan, Kagalanggalangang Katipunan ng mga Anak ng Bayan in 1892 and led the revolution it began in 1896. Wrote the decalogue the Katipunan lived by, the duties every member swore to. Died in 1897 in the mountains of Maragondon.' },

  { id: 'delpilar', name: 'Marcelo H. del Pilar', handle: 'delpilar', avatar: M.avDelPilar, verified: true,
    bio: 'Plaridel. Editor of La Solidaridad — the paper that argued the case abroad.',
    followers: 53400, following: 61, category: 'Editor · Propagandist', cover: M.solidaridad,
    about: '1850–1896. Lawyer, journalist and the sharpest pen of the Propaganda Movement under the name Plaridel. Took the editorial chair of La Solidaridad in 1889 and carried it until the last issue in 1895, writing from Madrid on little money and failing health. Died in Barcelona in July 1896.' },

  { id: 'juanluna', name: 'Juan Luna', handle: 'juanluna', avatar: M.avLuna, verified: true,
    bio: 'Painter. Spoliarium took the gold in Madrid, 1884.',
    followers: 74200, following: 88, category: 'Painter', cover: M.spoliarium,
    about: '1857–1899. Painter, and the first Filipino to win the Exposición Nacional de Bellas Artes in Madrid — the Spoliarium in 1884. Painted history at the size of a wall: gladiators, blood compacts, and España y Filipinas. Died in Hong Kong in 1899.' },

  { id: 'hidalgo', name: 'Félix Resurrección Hidalgo', handle: 'hidalgo', avatar: M.avHidalgo, verified: false,
    bio: 'Painter. La barca de Aqueronte — another gold for the Philippines in Madrid.',
    followers: 28700, following: 74, category: 'Painter', cover: M.aqueronte,
    about: '1853–1913. Painter of quiet, unsettling canvases — Las vírgenes cristianas expuestas al populacho in 1884, then La barca de Aqueronte, which took the gold medal in Madrid in 1887. Lived out his last years in Sarrià, near Barcelona, still painting.' },

  { id: 'lopezjaena', name: 'Graciano López Jaena', handle: 'lopezjaena', avatar: M.avLopezJaena, verified: false,
    bio: 'Orator from Iloilo. Founded La Solidaridad in 1889.',
    followers: 31200, following: 118, category: 'Orator · Writer', cover: M.avLopezJaena,
    about: '1856–1896. Orator, satirist and founder of La Solidaridad in Barcelona in 1889. His Fray Botod made a village priest famous across the islands; his voice in Madrid filled halls. Died in Barcelona in January 1896, months before the revolution he had spent his life arguing for.' },

  { id: 'aguinaldo', name: 'Emilio Aguinaldo', handle: 'aguinaldo', avatar: M.avAguinaldo, verified: true,
    bio: 'General of Cavite. First President of the Philippines, 1899.',
    followers: 88500, following: 132, category: 'General · Statesman', cover: M.avAguinaldo,
    about: '1869–1964. Led the revolution in Cavite, signed the Pact of Biak-na-Bato in 1897, and was proclaimed first President of the Philippines at Malolos in 1899. Captured in Palanan in 1901. Lived to see the flag raised again in 1946.' },

  { id: 'aquino', name: 'Melchora Aquino', handle: 'tandangsora', avatar: M.avAquino, verified: false,
    bio: 'Tandang Sora — Mother of the Katipunan. Her store fed and hid the revolution.',
    followers: 45600, following: 33, category: 'Mother of the Katipunan', cover: M.avAquino,
    about: '1812–1919. Kept a store in Balintawak that became a meeting place and a hiding place for the Katipuneros — she fed them, sheltered their wounded and asked for nothing. Arrested in 1896 and deported to Guam, she came home in 1903 and died at 107, called Tandang Sora by everyone.' },

  { id: 'gregoria', name: 'Gregoria de Jesús', handle: 'gregoriadejesus', avatar: M.avGregoria, verified: false,
    bio: 'Lakambini ng Katipunan. Keeper of the society’s papers.',
    followers: 26900, following: 57, category: 'Lakambini ng Katipunan', cover: M.avGregoria,
    about: '1875–1943. Married Andrés Bonifacio in 1893 and became the Lakambini of the Katipunan. She carried and hid the society’s records through searches and raids, riding out at night with the documents on her person. Kept them, and the memory, long after 1897.' },

  { id: 'alonso', name: 'Teodora Alonso', handle: 'teodoraalonso', avatar: M.avAlonso, verified: false,
    bio: 'Educated in Manila, ran her own business, taught her children to read first.',
    followers: 19800, following: 41, category: 'Rizal’s mother', cover: M.avAlonso,
    about: '1827–1911. Schooled at the Colegio de Santa Rosa, a businesswoman, and the first teacher of her children. The charge laid against her in 1872 — made to walk to Santa Cruz before she was cleared — was one her son never forgot, and never quite forgave. Died in Manila in 1911.' },

  { id: 'valenzuela', name: 'Pio Valenzuela', handle: 'pio.valenzuela', avatar: M.avValenzuela, verified: false,
    bio: 'Physician of the Katipunan. Sent to Dapitan in 1896.',
    followers: 14300, following: 66, category: 'Physician · Katipunan', cover: M.avValenzuela,
    about: '1869–1956. Doctor and Katipunan leader who was sent to Dapitan in 1896 to ask the exile there to support the coming revolution — and was told no. Survived the war, wrote down everything he remembered, and left historians their best account of the society.' },

  { id: 'ponce', name: 'Mariano Ponce', handle: 'marianoponce', avatar: M.avPonce, verified: false,
    bio: 'Tikbalang. Wrote, organised and kept the reform movement supplied.',
    followers: 17600, following: 84, category: 'Writer · Propagandist', cover: M.avPonce,
    about: '1863–1918. Co-founder of La Solidaridad and the movement’s organiser abroad, writing as Tikbalang and Naning, and later representing the Republic’s interests in Japan. Collected documents all his life; much of what we know of the Propaganda Movement survives because he kept it.' },

  { id: ME, name: 'José Protacio Rizal Mercado y Alonso Realonda', handle: 'joserizal', avatar: M.avRizal, verified: true, pro: true,
    bio: 'Born in Calamba in 1861, the seventh of eleven children, and taught to read at his mother’s knee before he was five. He wrote his first poem at eight, was sent to school in Biñan at ten, and was eleven the year the Gomburza priests were strangled and his own mother was arrested. Everything he became started in that childhood — the verses, the drawing, the two novels about a country he had only seen from a carabao cart.',
    link: 'joserizal.ph', followers: 246000, following: 313, category: 'Novelist · Reformer', cover: M.espana,

    /* the young Rizal, kept as the record he is: family, what he loved, what happened */
    family: 'Francisco Mercado Rizal and Teodora Alonso Realonda — his parents. Ten siblings: Saturnina, Paciano, Narcisa, Olympia, Lucía, María, Concepción, Josefa, Trinidad and Soledad. The family kept a rice farm and a house in Calamba, Laguna.',
    interests: 'Reading · drawing · writing · painting · clay modelling · arnis · riding · languages',
    about: 'Studied in Manila, Madrid, Paris and Heidelberg — eye surgeon, poet, linguist, and the quietest loud voice of the reform movement, writing for La Solidaridad out of Europe. Noli Me Tángere (1887) and El Filibusterismo (1891) named what was wrong with the country, and a movement grew around them. Exiled to Dapitan in 1892; shot at Bagumbayan in December 1896. He was 35.' },
];

const c = (userId, text, ago) => ({ id: 'c' + Math.random().toString(36).slice(2, 9), userId, text, createdAt: now - ago });

export const SEED_POSTS = [
  {
    id: 'p1', userId: 'juanluna', kind: 'post', createdAt: now - 2 * H,
    media: [M.spoliarium, M.lunStudioWide], ratio: RATIO.spoliarium,
    caption: 'Spoliarium, 1884 — the fallen gladiators dragged off the sand while Rome looks away. It took the gold at the Exposición Nacional de Bellas Artes in Madrid. It hangs today in the National Museum in Manila.',
    tags: ['spoliarium', '1884'], location: 'Madrid',
    likes: 48310, likedByMe: true, saved: true, tagged: [], 
    comments: [
      c(ME, 'That room went quiet, and then it did not. I said it that night at the banquet and I will say it again — the two of you are the pride of the country.', 1.7 * H),
      c('hidalgo', 'I was there when they hung it. Nobody had seen a Filipino paint at that size before.', 1.2 * H),
      c('delpilar', 'Three gold medals, and a paper to write about it the next morning.', 52 * MIN),
    ],
  },
  {
    id: 'p2', userId: 'delpilar', kind: 'post', createdAt: now - 47 * MIN,
    media: [M.solidaridad], ratio: RATIO.solidaridad,
    caption: 'La Solidaridad — Barcelona, 1889, printed fortnightly and read wherever a Filipino could find it. López Jaena founded it; I took the chair and kept the light on until the last issue in 1895.',
    tags: ['lasolidaridad', 'propaganda'], location: 'Barcelona',
    likes: 24160, likedByMe: true, saved: false, tagged: [ME],
    comments: [
      c('lopezjaena', 'Not a printing press in the world was paying for itself, and you still got it out.', 30 * MIN),
      c('ponce', 'Every copy that reached Manila was carried by hand. Remember that half of them never made it.', 18 * MIN),
    ],
  },
  {
    id: 'p3', userId: ME, kind: 'post', createdAt: now - 5 * H,
    media: [M.noli], ratio: RATIO.noli,
    caption: 'Noli Me Tángere — written over three years and printed in Berlin in 1887. A dedication, a chapter on the schoolhouse, a man who dies in the river, and every reader who recognised the parish priest in the village. The title page shown here is the Manila printing that followed.',
    tags: ['noli1887', 'berlin'], location: 'Berlin',
    likes: 61240, likedByMe: false, saved: true, tagged: [],
    comments: [
      c('bonifacio', 'The book reached us, and then the news did. It was the push we needed, and you know it.', 4 * H),
      c('mabini', 'You wrote a novel. The country read it as a description of itself — which is why the friars banned it and the Katipunan read it aloud.', 3 * H),
      c('alonso', 'My son. Your father would have read the first page twice.', 2.5 * H),
    ],
  },
  {
    id: 'p4', userId: 'hidalgo', kind: 'reel', createdAt: now - 9 * H,
    media: [M.aqueronte], ratio: RATIO.aqueronte,
    caption: 'La barca de Aqueronte, 1887 — Charon’s boat on a river seen at night, and the medal that followed it home. Aqueronte crossed to Madrid; the painting never left Europe while I lived.',
    tags: ['aqueronte', '1887'],
    likes: 18720, likedByMe: false, saved: false, tagged: [],
    comments: [c('juanluna', 'The water in this one is the whole argument.', 6 * H)],
  },
  {
    id: 'p5', userId: 'bonifacio', kind: 'post', createdAt: now - 14 * H,
    media: [M.kartilya], ratio: RATIO.kartilya,
    caption: 'The Kartilya — the fourteen rules every Katipunero swore to. Jacinto set them down in 1896 on top of the duties I first wrote out in 1892: a life that is not for the shame of others, a leader I am not, a country I would give everything for.',
    tags: ['katipunan', 'kartilya'], location: 'Balintawak',
    likes: 33980, likedByMe: true, saved: true, tagged: [],
    comments: [
      c('aquino', 'The boys read it aloud in the back of the store before they left. I remember every one of them.', 11 * H),
      c('gregoria', 'I carried it, and the oaths, and the names. None of it was left behind.', 8 * H),
      c('aguinaldo', 'Cavite read it too. It travelled faster than we did.', 5 * H),
    ],
  },
  {
    id: 'p6', userId: ME, kind: 'post', createdAt: now - 20 * H,
    media: [M.ultimoAdios], ratio: RATIO.ultimoAdios,
    caption: 'Written in Fort Santiago on the last night of 1896, in Spanish, folded into an alcohol stove and left in the room you see here — the writing quarters they keep as the Rizal Shrine today. It was carried out by hand, and published after I could no longer be asked what I meant.',
    tags: ['1896', 'fortsantiago'], location: 'Fort Santiago',
    likes: 128400, likedByMe: false, saved: true, tagged: [],
    comments: [
      c('valenzuela', 'It reached us in Cavite in the last months of the war and it was copied and copied again. Nobody owns the original now, but everybody has read it.', 16 * H),
      c('mabini', 'Farewell, then. The rest of us are still reading it.', 12 * H),
    ],
  },
  {
    id: 'p7', userId: 'aguinaldo', kind: 'reel', createdAt: now - 1 * D,
    media: [M.flag1898], ratio: RATIO.flag1898,
    caption: 'Biak-na-Bato, 1897 — a truce signed in a cave in Bulacan and an exile in Hong Kong. I came back in 1898, and by the middle of that year the flag went up at Kawit instead.',
    tags: ['biaknabato', '1898'], location: 'Bulacan',
    likes: 27310, likedByMe: false, saved: false, tagged: [ME],
    comments: [c('bonifacio', 'A truce is not a peace. Watch the years ahead of you.', 20 * H)],
  },
  {
    id: 'p8', userId: 'aquino', kind: 'post', createdAt: now - 26 * H,
    media: [M.sora], ratio: RATIO.sora,
    caption: 'I am a storekeeper, and my store was open all night. Anyone who came was fed, whether they were hiding, bleeding, or only hungry. What the sun sees, the town talks about — that is why they took me to Guam in 1896, and why I came back in 1903.',
    tags: ['katipunan', 'balintawak'],
    likes: 51220, likedByMe: false, saved: true, tagged: [],
    comments: [
      c('gregoria', 'Nobody was ever turned away, and nothing was ever asked in return. That is the whole of it.', 22 * H),
      c('bonifacio', 'The revolution had a kitchen before it had a flag. That is not a small thing.', 18 * H),
    ],
  },
  {
    id: 'p9', userId: 'gregoria', kind: 'post', createdAt: now - 30 * H,
    media: [M.avGregoria], ratio: 1,
    caption: 'The Katipunan’s papers rode with me at night, hidden in my clothes, through every guard and every raid. I was sixteen when I took that job and I kept it. Whatever else was lost in 1897, the records were not.',
    tags: ['lakambini', 'katipunan'],
    likes: 22140, likedByMe: false, saved: false, tagged: [],
    comments: [c('valenzuela', 'You were the reason there was anything left to write memoirs from.', 26 * H)],
  },
  {
    id: 'p10', userId: 'mabini', kind: 'post', createdAt: now - 2 * D,
    media: [M.kartilya], ratio: RATIO.kartilya,
    caption: 'A code is only as good as the people who live it. The True Decalogue, 1898 — ten duties for a country that had just decided to exist, written by a man who could no longer walk and would not stop arguing.',
    tags: ['decalogue', '1898'], location: 'Malolos',
    likes: 29840, likedByMe: true, saved: false, tagged: [ME],
    comments: [
      c('delpilar', 'You put into a page what the paper spent five years arguing.', 1.8 * D),
      c(ME, 'The country has been governed by better men than it has been governed by. You were one of them.', 1.6 * D),
    ],
  },

  /* ---- the young Rizal: three posts, each on a documented event ---- */
  {
    id: 'p11', userId: ME, kind: 'post', createdAt: now - 35 * MIN,
    media: [M.kabata], ratio: RATIO.kabata,
    caption: 'Sa Aking Mga Kabata — I was eight years old, and my mother set me verses to write in the dining room at Calamba before I was allowed to eat. The poem says a people that loves its own tongue will never be a slave; at eight I only liked the sound the words made. If Young Rizal Had Social Media… this page would have been the first thing I posted. #YoungRizal',
    tags: ['YoungRizal', '1869', 'calamba'], location: 'Calamba, Laguna',
    likes: 41280, likedByMe: true, saved: true, tagged: [],
    comments: [
      c('alonso', 'You would not come to the table until the last stanza rhymed. I let it go cold, and I read it twice.', 22 * MIN),
      c('mabini', 'A tongue kept alive is a country kept alive. You were eight when you found the sentence for it.', 11 * MIN),
    ],
  },
  {
    id: 'p12', userId: ME, kind: 'post', createdAt: now - 4 * H,
    media: [M.binan], ratio: RATIO.binan,
    caption: 'June 1871 — packed off to Biñan to board with my aunt and sit under Maestro Justiniano Cruz. In my first week I fought a boy over a candle and took the caning for it; I came home with Latin, a swollen hand and a recommendation to study in Manila. #YoungRizal',
    tags: ['YoungRizal', '1871', 'binan'], location: 'Biñan, Laguna',
    likes: 33890, likedByMe: false, saved: true, tagged: [],
    comments: [
      c('delpilar', 'A caning and a recommendation in the same school year. The whole of the old education, written out in one line.', 3.2 * H),
      c('lopezjaena', 'Every boy from the provinces has a first week like this one, and only one of us wrote it down.', 2.4 * H),
    ],
  },
  {
    id: 'p13', userId: ME, kind: 'post', createdAt: now - 8 * H,
    media: [M.gomburza], ratio: RATIO.gomburza,
    caption: 'February 1872 — Burgos, Gómez and Zamora, strangled at Bagumbayan for a mutiny they did not lead. My mother was arrested that same year and made to walk to Santa Cruz before they let her come home. I was eleven, and I did not forget either thing; the ground under this marker is where I learned what the country was. #YoungRizal',
    tags: ['YoungRizal', '1872', 'gomburza'], location: 'Bagumbayan',
    likes: 88410, likedByMe: true, saved: true, tagged: [],
    comments: [
      c('bonifacio', 'We took their names as a watchword, and then we raised a society on them. Your book and my oath come from the same February.', 6.5 * H),
      c('alonso', 'They made me walk, and I walked. You were in the house when they took me, and you have been writing it back ever since.', 5 * H),
    ],
  },
];

export const SEED_FOLLOWING = { mabini: true, juanluna: true, delpilar: true };
export const SEED_SEEN = { aguinaldo: now - 3 * D };

export const SEED_NOTIFS = [
  { id: 'n1', type: 'like', userId: 'juanluna', postId: 'p3', createdAt: now - 22 * MIN, unread: true },
  { id: 'n2', type: 'comment', userId: 'mabini', postId: 'p3', text: 'The country read it as a description of itself.', createdAt: now - 68 * MIN, unread: true },
  { id: 'n3', type: 'follow', userId: 'delpilar', createdAt: now - 3 * H, unread: true },
  { id: 'n4', type: 'like', userId: 'aquino', postId: 'p6', createdAt: now - 7 * H, unread: false },
  { id: 'n5', type: 'mention', userId: 'aguinaldo', postId: 'p7', text: 'tagged you in a post', createdAt: now - 1 * D, unread: false },
  { id: 'n6', type: 'follow', userId: 'ponce', createdAt: now - 2 * D, unread: false },
];

/* Moments: each person's story shows what they did — one or more slides,
   never their own portrait (the ring already shows the face). */
export const STORIES = [
  { userId: 'mabini',    media: M.barasoain,    createdAt: now - 2 * H,  caption: 'Barasoain, Malolos — where the First Republic was sworn in, 1899.' },
  { userId: 'bonifacio', media: M.kartilya,     createdAt: now - 4 * H,  caption: 'The Kartilya — fourteen rules every Katipunero swore to.' },
  { userId: 'delpilar',  media: M.solidaridad,  createdAt: now - 7 * H,  caption: 'La Solidaridad, Barcelona — the paper that argued the case abroad.' },
  { userId: 'juanluna',  media: M.spoliarium,   createdAt: now - 10 * H, caption: 'Spoliarium — gold at the Exposición Nacional, Madrid, 1884.' },
  { userId: 'hidalgo',   media: M.aqueronte,    createdAt: now - 13 * H, caption: 'La barca de Aqueronte — gold medal, Madrid, 1887.' },
  { userId: 'aguinaldo', media: M.kawit,        createdAt: now - 17 * H, caption: 'Kawit, Cavite — the flag went up here in 1898.' },
  { userId: 'aquino',    media: M.sora,         createdAt: now - 21 * H, caption: 'Tandang Sora — the shrine to the Mother of the Katipunan.' },
];
// library offered in the composer — the documents and canvases of the era
export const PHOTO_POOL = [
  { id: 'spoliarium',  src: M.spoliarium,  label: 'Spoliarium' },
  { id: 'aqueronte',   src: M.aqueronte,   label: 'Aqueronte' },
  { id: 'espana',      src: M.espana,      label: 'España y Filipinas' },
  { id: 'noli',        src: M.noli,        label: 'Noli, 1887' },
  { id: 'solidaridad', src: M.solidaridad, label: 'La Solidaridad' },
  { id: 'kartilya',    src: M.kartilya,    label: 'Kartilya' },
  { id: 'ultimo',      src: M.ultimoAdios, label: 'Rizal Shrine, 1896' },
  { id: 'barasoain',   src: M.barasoain,   label: 'Barasoain' },
  { id: 'kawit',       src: M.kawit,       label: 'Kawit, 1898' },
  { id: 'flag',        src: M.flag1898,    label: 'Flag, 1898' },
  { id: 'sora',        src: M.sora,        label: 'Tandang Sora' },
  { id: 'lunastudio',  src: M.lunaStudio,  label: 'Luna’s studio' },
  { id: 'kabata',      src: M.kabata,      label: 'Sa Aking Mga Kabata' },
  { id: 'binan',       src: M.binan,       label: 'Biñan, 1871' },
  { id: 'gomburza',    src: M.gomburza,    label: 'Gomburza, 1872' },
];
/* highlights live per account: { userId: [ {id,title,cover,items} ] } */
export const SEED_HIGHLIGHTS = {
  joserizal: [
    { id: 'h1', title: 'Noli', cover: M.noli, items: [M.noli, M.solidaridad] },
    { id: 'h2', title: 'Madrid', cover: M.madridUniversidad, items: [
        { media: M.madridUniversidad, caption: 'September 1882–1885, Universidad Central de Madrid on Calle San Bernardo — enrolled in Medicine and in Philosophy and Letters. Licentiate in Medicine, 21 June 1884; Licentiate in Philosophy and Letters, 1885, highest honours.' },
        { media: M.madridAcademia, caption: 'The other half of the timetable: painting and sculpture at the Real Academia de Bellas Artes de San Fernando, languages at the Ateneo de Madrid, fencing and shooting in the free hours between.' },
      ] },
    { id: 'h3', title: '1896', cover: M.ultimoAdios, items: [M.ultimoAdios] },
    { id: 'h4', title: 'Family', cover: M.famCalamba, items: [
        { media: M.famCalamba, caption: 'Calamba, Laguna — the house on the family’s rice farm where José was born on 19 June 1861, the seventh of eleven children.' },
        { media: M.famTeodora, caption: 'Teodora Alonso Realonda — his mother, schooled in Manila, a businesswoman, and the first teacher of her children. The family’s house in San Nicolas, Manila, kept by her and passed down to her grandchildren.' },
        { media: M.famPaciano, caption: 'Paciano — the eldest, schooled by Father Burgos, who sent his younger brother to Europe in 1882 and stayed home to hold the family up through 1872 and the Calamba land case. His shrine in Los Baños, Laguna.' },
        { media: M.famTrinidad, caption: 'Trinidad — “Trining”, born 1868, tenth of the siblings: Katipunan alongside Paciano and Josefa, relief work for wounded revolutionaries, and a founder of the Asociación Feminista Filipina in 1905.' },
        { media: M.famMartyrdom, caption: '29 December 1896 — his mother came to Fort Santiago with Trinidad and Lucía to say goodbye, and he handed Trinidad a small alcohol stove: “there is something inside.” Weeks later it was Narcisa who found the unmarked grave in Paco Cemetery and marked it RPJ. The Martyrdom tableau at Rizal Park.' },
      ] },
    { id: 'h5', title: 'Childhood', cover: M.childCalamba, items: [
        { media: M.childCalamba, caption: 'About 1864, Calamba — learned the alphabet and his first prayers from his mother, and read the books in the house before anyone thought to teach him.' },
        { media: M.childAntipolo, caption: '1869, Antipolo — his earliest long trip: a pilgrimage to the shrine of the Virgin, and his first sight of the countryside beyond Laguna.' },
        { media: M.binan, caption: 'June 1871, Biñan — sent to board with his aunt to study under Maestro Justiniano Cruz. Came home with Latin, a caning for a fight, and the maestro’s advice to go on to Manila.' },
        { media: M.gomburza, caption: '17 February 1872, Bagumbayan — the Gomburza priests were strangled, and his mother was arrested on a charge she was cleared of two years later. He was eleven.' },
        { media: M.childAteneo, caption: '1872–1877, Manila — Ateneo Municipal, six years of prizes. He left in 1877 with the highest grades in the school.' },
      ] },
  ],
  juanluna: [
    { id: 'l1', title: 'Spoliarium', cover: M.spoliarium, items: [M.spoliarium, M.lunaStudio] },
    { id: 'l2', title: 'España y Filipinas', cover: M.espana, items: [M.espana] },
    { id: 'l3', title: 'Paris', cover: M.lunaStudio, items: [M.lunaStudio] },
  ],
  hidalgo:   [{ id: 'hi1', title: 'Aqueronte', cover: M.aqueronte, items: [M.aqueronte, M.spoliarium] }],
  delpilar:  [{ id: 'd1', title: 'La Solidaridad', cover: M.solidaridad, items: [M.solidaridad, M.noli] }],
  bonifacio: [{ id: 'b1', title: 'Kartilya', cover: M.kartilya, items: [M.kartilya] }],
  mabini:    [{ id: 'mb1', title: 'Barasoain', cover: M.barasoain, items: [M.barasoain, M.kartilya] }],
  aguinaldo: [{ id: 'ag1', title: 'Kawit', cover: M.kawit, items: [M.kawit, M.flag1898] }],
  aquino:    [{ id: 'aq1', title: 'The shrine', cover: M.sora, items: [M.sora] }],
  lopezjaena:[{ id: 'lj1', title: 'Barcelona', cover: M.solidaridad, items: [M.solidaridad] }],
  gregoria:  [{ id: 'gr1', title: 'Lakambini', cover: M.avGregoria, items: [M.avGregoria, M.kartilya] }],
  alonso:    [{ id: 'al1', title: 'Her son’s book', cover: M.noli, items: [M.noli] }],
  valenzuela:[{ id: 'va1', title: 'Dapitan', cover: M.avValenzuela, items: [M.avValenzuela] }],
  ponce:     [{ id: 'po1', title: 'Abroad', cover: M.solidaridad, items: [M.solidaridad] }],
};

export const TRENDING = ['youngrizal', 'propaganda', 'katipunan', 'lasolidaridad', 'spoliarium', 'noli1887', 'biaknabato', 'lakambini', 'plaridel'];
