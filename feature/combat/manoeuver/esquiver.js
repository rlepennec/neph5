import { AbstractManoeuver } from "./abstractManoeuver.js";
import { Constants } from "../../../module/common/constants.js";

/**
 * Esquiver : se dérober entièrement à l'attaque. Elle couvre aussi les armes lancées, à ceci
 * près qu'esquiver un projectile demande de voir partir l'arme — voir update().
 */
export class Esquiver extends AbstractManoeuver {

    static ID = "esquiver";

    /**
     * Constructor.
     */
    constructor() {
        super(Esquiver.ID, Constants.DODGE);
        this.withApproches(['air','eau', 'ka']);
        this.withNextDefenseModifier(-20);
        this.withAbsorption({fix: 0});
    }

    /**
     * @Override
     * Esquiver une arme lancée suppose de l'avoir vue venir : seules l'eau et le ka s'y
     * prêtent. Face à toute autre attaque, l'air reste ouvert.
     */
    update(action) {
        return this.withApproches(
            action.attack?.manoeuver?.family === Constants.THROW ?
                ['eau', 'ka'] :
                ['air', 'eau', 'ka']);
    }

    /**
     * @Override
     */
    defenseSentenceOf(winner) {
        return this.defenseSentence(winner);
    }

    /**
     * @Override
     */
    canBePerformed(action) {
        if (this.exclusiveDefensePlayed(action)) return false;
        return action.attack.manoeuver.family !== Constants.FIRE &&
               action.actor.isEsquiveAvailable;
    }

}
