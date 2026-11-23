/**
 * Exécuté avant le premier rendu : pose `class="js"` sur <html> (les animations d'apparition n'existent qu'avec JavaScript).
 */
export const bootScript = `(function(){try{document.documentElement.classList.add('js')}catch(e){}})();`
