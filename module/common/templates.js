/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadTemplates = async function () {

    return loadTemplates([

        // Akasha
        "systems/neph5e/feature/akasha/actor/main.hbs",

        // Alchimie
        "systems/neph5e/feature/alchimie/actor/construct.hbs",

        // Baton
        "systems/neph5e/feature/baton/actor/techniques.hbs",

        // Bohemien
        "systems/neph5e/feature/bohemien/actor/main.hbs",

        // Combat
        "systems/neph5e/feature/combat/actor/main.hbs",
    
        // Coupe
        "systems/neph5e/feature/coupe/actor/tekhnes.hbs",

        // Denier
        "systems/neph5e/feature/denier/actor/pratiques.hbs",

        // Epee
        "systems/neph5e/feature/epee/actor/rituels.hbs",

        // Humain
        "systems/neph5e/feature/humain/actor/main.hbs",

        // Kabbale
        "systems/neph5e/feature/kabbale/actor/arbre.hbs",
        "systems/neph5e/feature/kabbale/actor/ordonnances.hbs",

        // Laboratoire
        "systems/neph5e/feature/alchimie/actor/laboratoire.hbs",
        "systems/neph5e/feature/alchimie/actor/materiae.hbs",

        // Nephilim
        "systems/neph5e/feature/nephilim/actor/main.hbs",
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

        // Science
        "systems/neph5e/feature/science/actor/elements.hbs",
        "systems/neph5e/feature/science/actor/sciences.hbs",
        "systems/neph5e/feature/science/actor/science.hbs",

        // Figure
        "systems/neph5e/feature/figure/actor/options.hbs",
    
        // Figurant
        "systems/neph5e/feature/figurant/actor/options.hbs",

        // Fraternite
        "systems/neph5e/feature/fraternite/actor/effectif.hbs",
        "systems/neph5e/feature/fraternite/actor/ressources.hbs",
        "systems/neph5e/feature/fraternite/actor/options.hbs",

        // Actor parts
        "systems/neph5e/templates/actor/parts/header.hbs",
        "systems/neph5e/templates/actor/parts/option.hbs",
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