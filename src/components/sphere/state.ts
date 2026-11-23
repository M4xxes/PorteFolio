/** État partagé, hors React, entre le fond, la sphère et l'œil (aucun re-rendu). */
export const app = {
  /** L'intro de la sphère a été jouée : un retour sur l'accueil atterrit directement sur la sphère. */
  introDone: false,
  /** On est sur une page autre que l'accueil : le nuage de particules est toujours dessiné. */
  offHome: false,
  /** Une vignette est zoomée dans la sphère (la molette ne remonte alors pas vers l'œil). */
  zoomed: false,
}
