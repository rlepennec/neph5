import { Constants } from "../../../../../module/common/regles/v5/constants.js";

/**
 * La formule d'initiative des règles v5 (voir Regles, initiative) : 1d6, le malus de blessures
 * physiques, le bonus et l'initiative de l'acteur.
 * @param combatant The combatant.
 * @returns the formula.
 */
export function initiativeV5(combatant) {
    const actor = combatant.actor;
    if (!actor) return "1d6";
    let malus = actor.regles.getWoundsModifier(Constants.PHYSICAL) / 10;
    let bonus = actor.regles.bonus.initiative;
    let base = actor.regles.initiative;
    return "1d6" +
        (malus === 0 ? "" : malus.toString()) +
        (bonus === 0 ? "" : "+" + bonus.toString()) +
        (base === 0 ? "" : "+" + base.toString());
}