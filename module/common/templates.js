/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadTemplates = async function() {
  return loadTemplates([
    "systems/neph5e/templates/actor/parts/nephilim/main.hbs",
    "systems/neph5e/templates/actor/parts/conjuration/main.hbs",
    "systems/neph5e/templates/actor/parts/conjuration/header.hbs",
    "systems/neph5e/templates/actor/parts/conjuration/appel.hbs",
    "systems/neph5e/templates/actor/parts/necromancie/main.hbs",
    "systems/neph5e/templates/actor/parts/necromancie/header.hbs",
    "systems/neph5e/templates/actor/parts/necromancie/rite.hbs",
    "systems/neph5e/templates/actor/parts/combat/main.hbs",
    "systems/neph5e/templates/actor/parts/description/main.hbs",
    "systems/neph5e/templates/actor/parts/simulacre/main.hbs",
    "systems/neph5e/templates/actor/parts/vecus/main.hbs",
    "systems/neph5e/templates/actor/parts/vecus/savoirs.hbs",
    "systems/neph5e/templates/actor/parts/vecus/quetes.hbs",
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
    "systems/neph5e/templates/actor/parts/selenim/aspect.hbs",
    "systems/neph5e/templates/actor/parts/selenim/passe.hbs"
  ]);
};
