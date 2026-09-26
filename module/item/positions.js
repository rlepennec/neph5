/**
 * Dimensions d'ouverture des fenêtres de fiche d'item, PAR TYPE et PAR STYLE.
 *
 * Pourquoi ici et pas dans chaque feuille : le style est un réglage utilisateur
 * (`styleItemSheet`, portée `user`), donc une valeur connue seulement à
 * l'exécution. Un `static DEFAULT_OPTIONS.position` est évalué une fois au
 * chargement de la classe : il ne peut pas dépendre du style. Il faut donc
 * choisir la taille à la construction de la fiche — et une table unique vaut
 * mieux que trente-deux paires de valeurs éparpillées, dans l'esprit de
 * `variables.less` pour la mise en page.
 *
 * COMMENT CONFIGURER : une ligne par type, deux couples de nombres.
 * Les colonnes sont alignées, on règle en lisant verticalement.
 *
 * Les valeurs livrées ici sont EXACTEMENT celles qui étaient déclarées dans les
 * trente-deux feuilles, recopiées à l'identique dans les deux colonnes. La mise
 * en place ne change donc rien à l'affichage : la colonne `classique` est le
 * bouton de réglage, encore vierge.
 *
 * Repères mesurés lors du portage ashbury, à garder en tête en réglant :
 *   - trois colonnes ne tiennent pas sous 950 px (l'illustration de l'habitus
 *     tombait à 77 px, le vécu embarqué à 27 px à 900) ;
 *   - 1220 convient aux fiches à trois colonnes, 1400 au métamorphe.
 */

//  type              classique          ashbury
//                  larg.  haut.       larg.  haut.
export const POSITIONS = {

    alchimie:     { classique: [  700, 500 ], ashbury: [  700, 500 ] },
    appel:        { classique: [ 1220, 720 ], ashbury: [ 1190, 585 ] },
    arcane:       { classique: [  850, 700 ], ashbury: [  850, 700 ] },
    arme:         { classique: [ 1000, 800 ], ashbury: [ 1000, 800 ] },
    armure:       { classique: [  750, 800 ], ashbury: [  750, 800 ] },
    aspect:       { classique: [  850, 700 ], ashbury: [  850, 700 ] },
    atlanteide:   { classique: [  960, 670 ], ashbury: [  960, 670 ] },
    capacite:     { classique: [  850, 680 ], ashbury: [  850, 680 ] },
    catalyseur:   { classique: [  700, 500 ], ashbury: [  700, 500 ] },
    chute:        { classique: [  850, 700 ], ashbury: [  850, 700 ] },
    competence:   { classique: [  800, 470 ], ashbury: [  800, 470 ] },
    divination:   { classique: [  960, 670 ], ashbury: [  960, 670 ] },
    dracomachie:  { classique: [  960, 670 ], ashbury: [  960, 670 ] },
    formule:      { classique: [ 1385, 780 ], ashbury: [ 1385, 780 ] },
    habitus:      { classique: [ 1220, 720 ], ashbury: [ 1220, 720 ] },
    invocation:   { classique: [ 1220, 700 ], ashbury: [ 1220, 700 ] },
    magie:        { classique: [  850, 650 ], ashbury: [  850, 650 ] },
    materiae:     { classique: [  700, 500 ], ashbury: [  700, 500 ] },
    metamorphe:   { classique: [ 1400, 820 ], ashbury: [ 1400, 820 ] },
    ordonnance:   { classique: [  600, 235 ], ashbury: [  600, 235 ] },
    passe:        { classique: [  850, 700 ], ashbury: [  850, 700 ] },
    periode:      { classique: [  900, 720 ], ashbury: [  900, 720 ] },
    pratique:     { classique: [  960, 670 ], ashbury: [  960, 670 ] },
    quete:        { classique: [  900, 750 ], ashbury: [  900, 750 ] },
    rite:         { classique: [  960, 670 ], ashbury: [  960, 670 ] },
    rituel:       { classique: [  960, 670 ], ashbury: [  960, 670 ] },
    savoir:       { classique: [  900, 750 ], ashbury: [  900, 750 ] },
    science:      { classique: [  820, 620 ], ashbury: [  820, 620 ] },
    sort:         { classique: [ 1220, 700 ], ashbury: [ 1220, 700 ] },
    technique:    { classique: [  960, 670 ], ashbury: [  960, 670 ] },
    tekhne:       { classique: [  960, 670 ], ashbury: [  960, 670 ] },
    vecu:         { classique: [ 1220, 760 ], ashbury: [ 1220, 760 ] },

};

/**
 * Repli pour un type absent de la table — un type ajouté dont on aurait oublié
 * la ligne ouvrira une fenêtre viable plutôt que la fenêtre par défaut de
 * Foundry, qui ignore la mise en page du système.
 */
export const POSITION_DEFAUT = { classique: [ 850, 650 ], ashbury: [ 1220, 720 ] };

/**
 * @param type  Le type d'item (`document.type`).
 * @param style La valeur du réglage `styleItemSheet`.
 * @returns { width, height } prêt à être posé dans les options d'application.
 */
export function positionOf(type, style) {
    const parType = POSITIONS[type] ?? POSITION_DEFAUT;
    // Un style inconnu (réglage corrompu, style ajouté sans mettre la table à
    // jour) retombe sur `classique`, qui est le défaut du réglage lui-même.
    const couple = parType[style] ?? parType.classique ?? POSITION_DEFAUT.classique;
    const [width, height] = couple;
    return { width, height };
}
