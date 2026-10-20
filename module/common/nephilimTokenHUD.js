import { ActiveEffects } from "../../feature/core/effects.js";

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
        if (porteur == null || porteur === this.actor) return choices;

        // Même règle que Foundry, sur les effets de l'incarnation courante
        for (const effect of porteur.effects) {
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
