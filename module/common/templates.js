/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadTemplates = async function () {

    return foundry.applications.handlebars.loadTemplates([

        // Akasha
        "systems/neph5e/feature/akasha/actor/main.hbs",
    
        // Kabbale
        "systems/neph5e/feature/kabbale/actor/arbre.hbs",
        "systems/neph5e/feature/kabbale/actor/ordonnances.hbs",

        // Laboratoire
        "systems/neph5e/feature/alchimie/actor/laboratoire.hbs",
        "systems/neph5e/feature/alchimie/actor/materiae.hbs",

        // Nephilim
        "systems/neph5e/feature/nephilim/actor/main.hbs",

        // Periode
        "systems/neph5e/feature/savoir/actor/savoirs.hbs",
        "systems/neph5e/feature/quete/actor/quetes.hbs",
        "systems/neph5e/feature/chute/actor/chutes.hbs",
        "systems/neph5e/feature/competence/actor/competences.hbs",
        "systems/neph5e/feature/capacite/actor/capacites.hbs",
        
        // Selenim
        "systems/neph5e/feature/selenim/actor/main.hbs",

        // Science
        "systems/neph5e/feature/science/actor/elements.hbs",
        "systems/neph5e/feature/science/actor/sciences.hbs",
        "systems/neph5e/feature/science/actor/science.hbs",
    
        // Actor parts
        "systems/neph5e/templates/actor/parts/option.hbs",

        // Item parts
        "systems/neph5e/templates/item/parts/header/number.hbs",


        // New reboot
        "systems/neph5e/templates/chronology.hbs",
        "systems/neph5e/templates/header.hbs",
        "systems/neph5e/templates/input.hbs",
        "systems/neph5e/templates/label.hbs",
        "systems/neph5e/templates/list.hbs",
        "systems/neph5e/templates/select.hbs",
        "systems/neph5e/templates/checkbox.hbs",
        "systems/neph5e/templates/portrait.hbs",

        "systems/neph5e/feature/figurant/description.hbs",
        "systems/neph5e/feature/figurant/combat.hbs",

        // Figure
        "systems/neph5e/feature/figure/combat.hbs",
        "systems/neph5e/feature/figure/description.hbs",
        "systems/neph5e/feature/figure/incarnations.hbs",
        "systems/neph5e/feature/figure/vecus.hbs",

        "systems/neph5e/feature/baton/actor/header.hbs",
        "systems/neph5e/feature/bohemien/actor/header.hbs",
        "systems/neph5e/feature/coupe/actor/header.hbs",
        "systems/neph5e/feature/denier/actor/header.hbs",
        "systems/neph5e/feature/epee/actor/header.hbs",

        // Fraternite
        "systems/neph5e/feature/fraternite/description.hbs",
        "systems/neph5e/feature/fraternite/effectif.hbs",
        "systems/neph5e/feature/fraternite/incarnations.hbs",
        "systems/neph5e/feature/fraternite/ressources.hbs",
        "systems/neph5e/feature/fraternite/connaissances.hbs",

        "systems/neph5e/feature/fraternite/options.hbs",
    ]);

};