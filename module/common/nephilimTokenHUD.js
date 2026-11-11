import { Regles } from "../regles/regles.js";

/**
 * Le HUD des jetons. Les règles de la version du monde peuvent dire quels états y sont actifs
 * (effets.hud) ; sans elles, ceux de Foundry (voir Regles).
 */
export class NephilimTokenHUD extends foundry.applications.hud.TokenHUD {

    /**
     * @override
     */
    _getStatusEffectChoices() {
        const choices = super._getStatusEffectChoices();
        return Regles.courantes.effets?.hud?.(this, choices) ?? choices;
    }

}
