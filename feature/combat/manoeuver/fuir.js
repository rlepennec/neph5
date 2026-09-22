import { AbstractManoeuver } from "./abstractManoeuver.js";
import { Constants } from "../../../module/common/constants.js";

/**
 * Fuir : quitter le combat. Réussie, elle ne protège de rien — le combattant encaisse tous
 * les dommages du coup qu'il prend en partant — mais elle le sort du combat en cours.
 */
export class Fuir extends AbstractManoeuver {

    static ID = "fuir";

    /**
     * Constructor.
     */
    constructor(action) {
        super(Fuir.ID, Constants.DODGE, action);
        this.approches = ['air','eau','lune', 'ka'];
        this.target = false;
        this.noDefense = true;
        this.leaveCombat = true;
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