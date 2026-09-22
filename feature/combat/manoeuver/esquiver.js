import { AbstractManoeuver } from "./abstractManoeuver.js";
import { Constants } from "../../../module/common/constants.js";

/**
 * Esquiver : se dérober entièrement à l'attaque. Elle couvre aussi les armes lancées, à ceci
 * près qu'esquiver un projectile demande de voir partir l'arme — voir le constructeur.
 */
export class Esquiver extends AbstractManoeuver {

    static ID = "esquiver";

    /**
     * Constructor.
     * Esquiver une arme lancée suppose de l'avoir vue venir : seules l'eau et le ka s'y
     * prêtent. Face à toute autre attaque, l'air reste ouvert.
     */
    constructor(action) {
        super(Esquiver.ID, Constants.DODGE, action);
        this.approches = 
            action?.attack?.manoeuver?.family === Constants.THROW ?
                ['eau', 'ka'] :
                ['air', 'eau', 'ka'];
        this.nextDefenseModifier = -20;
        this.absorption = {fix: 0};
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
