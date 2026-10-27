/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadTemplates = async function () {

    return foundry.applications.handlebars.loadTemplates([

        // Akasha
        "systems/neph5e/feature/akasha/regles/v5/actor/main.hbs",
    
        // Kabbale
        "systems/neph5e/feature/kabbale/regles/v5/actor/arbre.hbs",
        "systems/neph5e/feature/kabbale/regles/v5/actor/ordonnances.hbs",

        // Laboratoire
        "systems/neph5e/feature/alchimie/regles/v5/actor/laboratoire.hbs",
        "systems/neph5e/feature/alchimie/regles/v5/actor/materiae.hbs",

        // Nephilim
        "systems/neph5e/feature/nephilim/regles/v5/actor/main.hbs",

        // Periode
        "systems/neph5e/feature/savoir/regles/v5/actor/savoirs.hbs",
        "systems/neph5e/feature/quete/regles/v5/actor/quetes.hbs",
        "systems/neph5e/feature/chute/regles/v5/actor/chutes.hbs",
        "systems/neph5e/feature/competence/regles/v5/actor/competences.hbs",
        "systems/neph5e/feature/capacite/regles/v5/actor/capacites.hbs",
        
        // Selenim
        "systems/neph5e/feature/selenim/regles/v5/actor/main.hbs",

        // Science
        "systems/neph5e/feature/science/regles/v5/actor/elements.hbs",
        "systems/neph5e/feature/science/regles/v5/actor/sciences.hbs",
        "systems/neph5e/feature/science/regles/v5/actor/science.hbs",
    
        // Actor parts

        // Item parts

        // New reboot
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

        // Combat — les six blocs partages par les onglets combat de la figure et
        // du figurant. Un partial absent de cette liste leve « The partial ... could
        // not be found » au premier rendu.
        "systems/neph5e/feature/combat/regles/v5/actor/sante.hbs",
        "systems/neph5e/feature/combat/regles/v5/actor/armes.hbs",
        "systems/neph5e/feature/combat/regles/v5/actor/armures.hbs",
        "systems/neph5e/feature/combat/regles/v5/actor/ressources.hbs",
        "systems/neph5e/feature/combat/regles/v5/actor/etats.hbs",
        "systems/neph5e/feature/combat/regles/v5/actor/bonus.hbs",

        "systems/neph5e/feature/figurant/regles/v5/description.hbs",
        "systems/neph5e/feature/figurant/regles/v5/combat.hbs",

        // Figure
        "systems/neph5e/feature/figure/regles/v5/combat.hbs",
        "systems/neph5e/feature/figure/regles/v5/description.hbs",
        "systems/neph5e/feature/figure/regles/v5/incarnations.hbs",
        "systems/neph5e/feature/figure/regles/v5/vecus.hbs",

        // Formulaire d'incarnation : une ligne d'objet acquis
        "systems/neph5e/feature/incarnation/incarnation-ligne.hbs",

        "systems/neph5e/feature/baton/regles/v5/actor/header.hbs",
        "systems/neph5e/feature/bohemien/regles/v5/actor/header.hbs",
        "systems/neph5e/feature/coupe/regles/v5/actor/header.hbs",
        "systems/neph5e/feature/denier/regles/v5/actor/header.hbs",
        "systems/neph5e/feature/epee/regles/v5/actor/header.hbs",

        // Fraternite
        "systems/neph5e/feature/fraternite/regles/v5/description.hbs",
        "systems/neph5e/feature/fraternite/regles/v5/effectif.hbs",
        "systems/neph5e/feature/fraternite/regles/v5/incarnations.hbs",
        "systems/neph5e/feature/fraternite/regles/v5/ressources.hbs",
        "systems/neph5e/feature/fraternite/regles/v5/connaissances.hbs",

        "systems/neph5e/feature/fraternite/regles/v5/options.hbs",
    ]);

};