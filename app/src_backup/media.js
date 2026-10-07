/* Every image the app ships with. Swap a file at the same path and the app picks it up. */
import avRizal from './media/av-rizal.jpg';
import avMabini from './media/av-mabini.jpg';
import avBonifacio from './media/av-bonifacio.jpg';
import avDelPilar from './media/av-delpilar.jpg';
import avLuna from './media/av-juanluna.jpg';
import avHidalgo from './media/av-hidalgo.jpg';
import avLopezJaena from './media/av-lopezjaena.jpg';
import avAguinaldo from './media/av-aguinaldo.jpg';
import avAquino from './media/av-aquino.jpg';
import avGregoria from './media/av-gregoria.jpg';
import avAlonso from './media/av-alonso.jpg';
import avValenzuela from './media/av-valenzuela.jpg';
import avPonce from './media/av-ponce.jpg';

/* the work: canvases, printed documents and the places the events happened.
   Each keeps its own aspect ratio — post frames follow the picture, not the other way round. */
import spoliarium from './media/work-spoliarium.jpg';
import aqueronte from './media/work-aqueronte.jpg';
import espana from './media/work-espana.jpg';
import lunaStudio from './media/work-lunastudio.jpg';
import lunStudioWide from './media/work-lunastudio-wide.jpg';
import noli from './media/work-noli.jpg';
import solidaridad from './media/work-solidaridad.jpg';
import kartilya from './media/work-kartilya.jpg';
import ultimoAdios from './media/work-ultimo.jpg';
import barasoain from './media/work-barasoain.jpg';
import kawit from './media/work-kawit.jpg';
import flag1898 from './media/work-flag1898.jpg';
import sora from './media/work-sora.jpg';

/* the young Rizal — his own childhood, kept as documents and markers */
import kabata from './media/young-kabata.jpg';
import gomburza from './media/young-gomburza.jpg';
import binan from './media/young-binan.jpg';

/* the family, and the Madrid years.
   The six below are Wikimedia Commons files under CC BY-SA — credit per file:
     fam-calamba.jpg      Rizal Shrine Outdoor (Calamba, Laguna).jpg — Tsambaproductions, CC BY-SA 3.0
     fam-teodora.jpg      House of Teodora Alonzo and José Rizal's Relatives (San Nicolas) 01.jpg — Zarate123, CC BY-SA 4.0
     fam-paciano.jpg      Paciano Rizal Shrine.jpg — Ryomaandres, CC BY-SA 4.0
     fam-trinidad.jpg     Trinidad Rizal (1868–1951) NHCP Historical Marker.jpg — Kej Andrés, CC BY-SA 4.0
     fam-martyrdom.jpg    JOSE RIZAL - MOTHER.jpg — Alloizajean, CC BY-SA 4.0
     madrid-universidad.jpg  Universidad Central e Instituto Cardenal Cisneros (Madrid) 02.jpg — Luis García (Zaqarbal), CC BY-SA 3.0
     madrid-academia.jpg     Real Academia de Bellas Artes de San Fernando - 01.jpg — Carlos Delgado, CC BY-SA 3.0 es
     child-calamba.jpg    Rizal Shrine Indoor (Calamba, Laguna).jpg — Tsambaproductions, CC BY-SA 3.0
     child-antipolo.jpg   AntipoloCathedral.jpg — Jeff Basina, CC BY-SA 4.0
     child-ateneo.jpg     Ateneo de Manila Original Site.jpg — Ryomaandres, CC BY-SA 3.0
   The portraits, canvases and documents still shipped are public domain. */
import famCalamba from './media/fam-calamba.jpg';
import famTeodora from './media/fam-teodora.jpg';
import famPaciano from './media/fam-paciano.jpg';
import famTrinidad from './media/fam-trinidad.jpg';
import famMartyrdom from './media/fam-martyrdom.jpg';
import madridUniversidad from './media/madrid-universidad.jpg';
import madridAcademia from './media/madrid-academia.jpg';

/* the five childhood events, one picture each */
import childCalamba from './media/child-calamba.jpg';
import childAntipolo from './media/child-antipolo.jpg';
import childAteneo from './media/child-ateneo.jpg';

export {
  avRizal, avMabini, avBonifacio, avDelPilar, avLuna, avHidalgo, avLopezJaena,
  avAguinaldo, avAquino, avGregoria, avAlonso, avValenzuela, avPonce,
  spoliarium, aqueronte, espana, lunaStudio, lunStudioWide, noli, solidaridad,
  kartilya, ultimoAdios, barasoain, kawit, flag1898, sora,
  kabata, gomburza, binan,
  famCalamba, famTeodora, famPaciano, famTrinidad, famMartyrdom, madridUniversidad, madridAcademia,
  childCalamba, childAntipolo, childAteneo,
};

/* ratios as saved on disk, so a post frame can match its picture exactly */
export const RATIO = {
  spoliarium: 1000 / 539,
  aqueronte: 1000 / 680,
  espana: 760 / 1126,
  lunaStudio: 900 / 693,
  lunStudioWide: 900 / 485,
  noli: 810 / 1184,
  solidaridad: 648 / 900,
  kartilya: 1200 / 900,
  ultimoAdios: 1000 / 750,
  barasoain: 1200 / 900,
  kawit: 1400 / 551,
  flag1898: 900 / 450,
  sora: 1100 / 828,
  kabata: 561 / 900,
  gomburza: 900 / 675,
  binan: 900 / 823,
  famCalamba: 900 / 598,
  famTeodora: 900 / 675,
  famPaciano: 900 / 541,
  famTrinidad: 675 / 900,
  famMartyrdom: 900 / 506,
  madridUniversidad: 900 / 675,
  madridAcademia: 900 / 600,
  childCalamba: 900 / 597,
  childAntipolo: 900 / 795,
  childAteneo: 720 / 477,
};
