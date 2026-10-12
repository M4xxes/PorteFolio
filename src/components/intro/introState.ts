import { INTRO_STORAGE_KEY } from '@/lib/constants'

/**
 * État de l'introduction, porté par l'attribut `data-intro="on"` sur <html>.
 * Il est posé avant le premier rendu par un script en ligne (pas de flash) et
 * le CSS n'affiche l'introduction que dans ce cas : sans JavaScript, rien ne masque le site.
 */
const EVENT = 'portfolio:intro'

export function subscribeIntro(callback: () => void) {
  window.addEventListener(EVENT, callback)
  return () => window.removeEventListener(EVENT, callback)
}

export function isIntroOpen() {
  return document.documentElement.dataset.intro === 'on'
}

export function closeIntro() {
  try {
    sessionStorage.setItem(INTRO_STORAGE_KEY, '1')
  } catch {
    // stockage indisponible (navigation privée stricte) : l'introduction se fermera quand même
  }
  delete document.documentElement.dataset.intro
  window.dispatchEvent(new Event(EVENT))
}

// Compteur de lectures : change la clé du contenu pour relancer ses animations quand on rejoue l'introduction.
let run = 0
export const getIntroRun = () => run

export function replayIntro() {
  run += 1
  window.scrollTo(0, 0)
  document.documentElement.dataset.intro = 'on'
  window.dispatchEvent(new Event(EVENT))
}

/**
 * Script exécuté dans le <head> avant le premier rendu :
 * - affiche l'introduction lors de la première visite de la page d'accueil (par session) ;
 * - ferme l'introduction au clic sur « Entrer » même si l'application React n'a pas encore été chargée.
 */
export const introBootScript = `(function(){try{var d=document.documentElement,k=${JSON.stringify(INTRO_STORAGE_KEY)};
if(location.pathname==='/'&&!sessionStorage.getItem(k)){d.dataset.intro='on'}
document.addEventListener('click',function(e){var t=e.target;if(window.__introReady||!t||!t.closest||!t.closest('[data-intro-enter]'))return;try{sessionStorage.setItem(k,'1')}catch(_){}delete d.dataset.intro});
}catch(_){}})();`
