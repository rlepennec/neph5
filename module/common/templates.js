/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadTemplates = async function () {

    return loadTemplates([

        // Akasha
        "systems/neph5e/feature/akasha/actor/main.hbs",
        "systems/neph5e/feature/akasha/actor/direction.hbs",
        "systems/neph5e/feature/akasha/actor/vaisseau.hbs",

        // Alchimie
        "systems/neph5e/feature/alchimie/actor/construct.hbs",

        // Combat
        "systems/neph5e/feature/combat/actor/main.hbs",
        "systems/neph5e/feature/combat/actor/blessure.hbs",
        "systems/neph5e/feature/combat/actor/etat.hbs",

        // Kabbale
        "systems/neph5e/feature/kabbale/actor/arbre.hbs",

        // Laboratoire
        "systems/neph5e/feature/alchimie/actor/laboratoire.hbs",

        // Nephilim
        "systems/neph5e/feature/nephilim/actor/arcane.hbs",
        "systems/neph5e/feature/nephilim/actor/attributs.hbs",
        "systems/neph5e/feature/nephilim/actor/main.hbs",
        "systems/neph5e/feature/nephilim/actor/pentacle.hbs",
        "systems/neph5e/feature/nephilim/actor/chutes.hbs",
        "systems/neph5e/feature/nephilim/actor/metamorphe.hbs",
        "systems/neph5e/feature/nephilim/actor/stase.hbs",
        "systems/neph5e/feature/nephilim/item/metamorphose.hbs",

        // Periode
        "systems/neph5e/feature/periode/actor/savoirs.hbs",
        "systems/neph5e/feature/periode/actor/quetes.hbs",
        "systems/neph5e/feature/periode/actor/chutes.hbs",
        "systems/neph5e/feature/periode/actor/passes.hbs",
        "systems/neph5e/feature/periode/actor/competences.hbs",
        "systems/neph5e/feature/periode/actor/incarnations.hbs",
        
        // Selenim
        "systems/neph5e/feature/selenim/actor/main.hbs",
        "systems/neph5e/feature/selenim/actor/noyau.hbs",
        "systems/neph5e/feature/selenim/actor/aspect.hbs",
        "systems/neph5e/feature/selenim/actor/attributs.hbs",

        // Science
        "systems/neph5e/feature/science/actor/elements.hbs",
        "systems/neph5e/feature/science/actor/sciences.hbs",
        "systems/neph5e/feature/science/actor/science.hbs",

        // Actor parts
        "systems/neph5e/templates/actor/parts/options.hbs",
        "systems/neph5e/templates/actor/parts/header.hbs",
        "systems/neph5e/templates/actor/parts/check.hbs",
        "systems/neph5e/templates/actor/parts/checkbox.hbs",
        "systems/neph5e/templates/actor/parts/top.hbs",

        // Item parts
        "systems/neph5e/templates/item/parts/header/header.hbs",
        "systems/neph5e/templates/item/parts/header/number.hbs",
        "systems/neph5e/templates/item/parts/header/select.hbs",
        "systems/neph5e/templates/item/parts/header/text.hbs",
        "systems/neph5e/templates/item/parts/header/label.hbs",
        "systems/neph5e/templates/item/parts/body/chronology.hbs",
        "systems/neph5e/templates/item/parts/body/description.hbs",
        "systems/neph5e/templates/item/parts/body/difficulte.hbs",
        "systems/neph5e/templates/item/parts/body/checkbox.hbs",
        "systems/neph5e/templates/item/parts/body/input.hbs",
        "systems/neph5e/templates/item/parts/body/label.hbs",
        "systems/neph5e/templates/item/parts/body/list.hbs"

    ]);

};
