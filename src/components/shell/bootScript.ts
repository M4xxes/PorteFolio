import { BOOT_STORAGE_KEY, LITE_STORAGE_KEY } from '@/lib/motion'

/**
 * Exécuté avant le premier rendu : décide si l'écran de démarrage s'affiche.
 * Seulement sur l'accueil, une fois par session, sur un écran large à pointeur fin,
 * hors reduced motion et hors version légère. Sans JavaScript, il ne s'affiche jamais.
 * Filet de sécurité : si l'application ne démarre pas, l'écran disparaît après 4 s.
 */
export const bootScript = `(function(){try{
var d=document.documentElement,m=function(q){return window.matchMedia(q).matches};d.classList.add('js');
if(location.pathname!=='/'||sessionStorage.getItem('${BOOT_STORAGE_KEY}')||localStorage.getItem('${LITE_STORAGE_KEY}')==='1')return;
if(!m('(hover: hover) and (pointer: fine)')||!m('(min-width: 768px)')||m('(prefers-reduced-motion: reduce)'))return;
d.setAttribute('data-boot','on');
setTimeout(function(){if(!window.__bootReady)d.removeAttribute('data-boot')},4000);
}catch(e){}})();`
