import { ActiveEffects } from "../../../../feature/core/regles/v5/effects.js";

/**
 * Le HUD des jetons. Celui de Foundry ne voit actifs que les états posés sur l'acteur ; ceux
 * d'une figure sont portés par son incarnation courante (voir ActiveEffects.porteur).
 */
export class NephilimTokenHUD extends foundry.applications.hud.TokenHUD {

    /**
     * @override
     */
    _getStatusEffectChoices() {
        const choices = super._getStatusEffectChoices();
        const porteur = ActiveEffects.porteur(this.actor);
        if (porteur == null || (porteur === this.actor && !this.actor.isToken)) return choices;

        // Foundry a compté les états hérités de l'acteur d'un token non lié
        for (const status of Object.values(choices)) {
            status.isActive = false;
            status.isOverlay = false;
            status.cssClass = "";
        }

        // Même règle que Foundry, sur les effets du porteur, hors ceux hérités
        for (const effect of porteur.effects) {
            if (effect.herite) continue;
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

}
