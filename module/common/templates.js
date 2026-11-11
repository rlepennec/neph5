import { Regles } from "../regles/regles.js";

/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering. Les gabarits
 * communs, et ceux de chaque jeu de règles (gabarits, voir Regles) : tous à la fois, la version
 * du monde pouvant changer à chaud. Un partial absent de ces listes lève « The partial ... could
 * not be found » au premier rendu.
 * @return {Promise}
 */
export const preloadTemplates = async function () {

    return foundry.applications.handlebars.loadTemplates([
        ...Regles.tous().flatMap(jeu => jeu.gabarits ?? []),

        // Les gabarits communs
        "systems/neph5e/templates/chronology.hbs",
        "systems/neph5e/templates/header.hbs",
        "systems/neph5e/templates/image.hbs",
        "systems/neph5e/templates/input.hbs",
        "systems/neph5e/templates/label.hbs",
        "systems/neph5e/templates/list.hbs",
        "systems/neph5e/templates/select.hbs",
        "systems/neph5e/templates/checkbox.hbs",
        "systems/neph5e/templates/pills.hbs",
        "systems/neph5e/templates/description.hbs",
        "systems/neph5e/templates/version-vide.html",
        "systems/neph5e/templates/version-vide-acteur.html",
        "systems/neph5e/templates/copy-uuid.hbs",
        "systems/neph5e/templates/item/options.hbs",
        "systems/neph5e/templates/video.hbs",
    ]);

};