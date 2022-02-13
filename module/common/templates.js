/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadTemplates = async function () {

    return loadTemplates([

        "systems/neph5e/templates/actor/parts/nephilim/arcane.hbs",
        "systems/neph5e/templates/actor/parts/nephilim/attributs.hbs",
        "systems/neph5e/templates/actor/parts/nephilim/chutes.hbs",
        "systems/neph5e/templates/actor/parts/nephilim/main.hbs",
        "systems/neph5e/templates/actor/parts/nephilim/pentacle.hbs",
        "systems/neph5e/templates/actor/parts/nephilim/metamorphe.hbs",
        "systems/neph5e/templates/actor/parts/nephilim/stase.hbs",
        "systems/neph5e/templates/actor/parts/conjuration/main.hbs",
        "systems/neph5e/templates/actor/parts/conjuration/header.hbs",
        "systems/neph5e/templates/actor/parts/conjuration/appel.hbs",
        "systems/neph5e/templates/actor/parts/necromancie/main.hbs",
        "systems/neph5e/templates/actor/parts/necromancie/header.hbs",
        "systems/neph5e/templates/actor/parts/necromancie/rite.hbs",
        "systems/neph5e/templates/actor/parts/combat/main.hbs",
        "systems/neph5e/templates/actor/parts/combat/equipements.hbs",
        "systems/neph5e/templates/actor/parts/combat/bonus.hbs",
        "systems/neph5e/templates/actor/parts/combat/dommages.hbs",
        "systems/neph5e/templates/actor/parts/description/main.hbs",
        "systems/neph5e/templates/actor/parts/simulacre/main.hbs",
        "systems/neph5e/templates/actor/parts/vecus/main.hbs",
        "systems/neph5e/templates/actor/parts/vecus/savoirs.hbs",
        "systems/neph5e/templates/actor/parts/vecus/quetes.hbs",
        "systems/neph5e/templates/actor/parts/vecus/passes.hbs",
        "systems/neph5e/templates/actor/parts/vecus/competences.hbs",
        "systems/neph5e/templates/actor/parts/magie/main.hbs",
        "systems/neph5e/templates/actor/parts/magie/header.hbs",
        "systems/neph5e/templates/actor/parts/magie/sort.hbs",
        "systems/neph5e/templates/actor/parts/kabbale/main.hbs",
        "systems/neph5e/templates/actor/parts/kabbale/header.hbs",
        "systems/neph5e/templates/actor/parts/kabbale/invocation.hbs",
        "systems/neph5e/templates/actor/parts/kabbale/ordonnance.hbs",
        "systems/neph5e/templates/actor/parts/alchimie/main.hbs",
        "systems/neph5e/templates/actor/parts/alchimie/header.hbs",
        "systems/neph5e/templates/actor/parts/alchimie/formule.hbs",
        "systems/neph5e/templates/actor/parts/laboratoire/main.hbs",
        "systems/neph5e/templates/actor/parts/laboratoire/constructs.hbs",
        "systems/neph5e/templates/actor/parts/laboratoire/materiae.hbs",
        "systems/neph5e/templates/actor/parts/laboratoire/primae.hbs",
        "systems/neph5e/templates/actor/parts/laboratoire/catalyseur.hbs",
        "systems/neph5e/templates/actor/parts/akasha/main.hbs",
        "systems/neph5e/templates/actor/parts/incarnations/main.hbs",
        "systems/neph5e/templates/actor/parts/options/main.hbs",
        "systems/neph5e/templates/actor/parts/selenim/main.hbs",
        "systems/neph5e/templates/actor/parts/selenim/noyau.hbs",
        "systems/neph5e/templates/actor/parts/selenim/aspect.hbs",
        "systems/neph5e/templates/actor/parts/baton/main.hbs",
        "systems/neph5e/templates/actor/parts/baton/header.hbs",
        "systems/neph5e/templates/actor/parts/baton/technique.hbs",
        "systems/neph5e/templates/actor/parts/coupe/main.hbs",
        "systems/neph5e/templates/actor/parts/coupe/header.hbs",
        "systems/neph5e/templates/actor/parts/coupe/tekhne.hbs",
        "systems/neph5e/templates/actor/parts/denier/main.hbs",
        "systems/neph5e/templates/actor/parts/denier/header.hbs",
        "systems/neph5e/templates/actor/parts/denier/pratique.hbs",
        "systems/neph5e/templates/actor/parts/epee/main.hbs",
        "systems/neph5e/templates/actor/parts/epee/header.hbs",
        "systems/neph5e/templates/actor/parts/epee/rituel.hbs",

        "systems/neph5e/templates/item/parts/header/header.hbs",
        "systems/neph5e/templates/item/parts/header/input.hbs",
        "systems/neph5e/templates/item/parts/header/select.hbs",

        "systems/neph5e/templates/item/parts/body/description.hbs",
        "systems/neph5e/templates/item/parts/body/difficulte.hbs",
        "systems/neph5e/templates/item/parts/body/input.hbs",
        "systems/neph5e/templates/item/parts/body/list.hbs"

    ]);

};
