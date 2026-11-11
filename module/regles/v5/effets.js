import { ActiveEffects } from "../../../feature/core/regles/v5/effects.js";
import { IncarnationsV5 } from "../../../feature/incarnation/regles/v5/incarnations.js";

/**
 * Les effets dans les règles v5 (voir Regles). Les états d'une figure (désorienté, immobilisé, à
 * terre, mort...) sont portés par ses incarnations, chacune les siens (voir ActiveEffects.porteur) :
 * seuls ceux de l'incarnation courante s'appliquent à la figure, les autres sont suspendus. Un token
 * non lié est un individu à part : les états posés sur son acteur ne le touchent pas.
 */
export const EffetsV5 = {

    /**
     * @param effect The active effect.
     * @returns true if suspended: carried by an incarnation which is not the current one, or
     *          inherited by an unlinked token from its actor (voir ActiveEffects.herite).
     */
    suspendu(effect) {
        const item = effect.parent;
        if (item instanceof foundry.documents.Item && item.type === 'incarnation' && item.parent != null) {
            if (item.sid !== new IncarnationsV5(item.parent).courante) return true;
        }
        return ActiveEffects.herite(effect);
    },

    /**
     * Les états posés par le HUD n'ont pas d'origine : sans elle, rien ne les distinguerait.
     * @param effect The active effect about to be created.
     */
    preparer(effect) {
        if (effect.origin == null && effect.statuses.size > 0 && effect.acteur != null) {
            effect.updateSource({ origin: effect.acteur.uuid });
        }
    },

    /**
     * Celui de Foundry ne voit actifs que les états posés sur l'acteur ; ceux d'une figure sont
     * portés par son incarnation courante (voir ActiveEffects.porteur).
     * @param hud     The token HUD.
     * @param choices The status choices computed by Foundry.
     * @returns the choices.
     */
    hud(hud, choices) {
        const porteur = ActiveEffects.porteur(hud.actor);
        if (porteur == null || (porteur === hud.actor && !hud.actor.isToken)) return choices;

        // Foundry a compté les états hérités de l'acteur d'un token non lié
        for (const status of Object.values(choices)) {
            status.isActive = false;
            status.isOverlay = false;
            status.cssClass = "";
        }

        // Même règle que Foundry, sur les effets du porteur, hors ceux hérités
        for (const effect of porteur.effects) {
            if (ActiveEffects.herite(effect)) continue;
            for (const statusId of effect.statuses) {
                const status = choices[statusId];
                if (!status) continue;
                if (status._id ? status._id !== effect.id : effect.statuses.size !== 1) continue;
                status.isActive = true;
                if (effect.getFlag("core", "overlay")) status.isOverlay = true;
                status.cssClass = [status.isActive ? "active" : null, status.isOverlay ? "overlay" : null].filterJoin(" ");
                break;
            }
        }
        return choices;
    }
};
