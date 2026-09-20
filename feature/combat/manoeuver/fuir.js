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
    constructor() {
        super(Fuir.ID, Constants.DODGE);
        this.withApproches(['air','eau','lune', 'ka']);
        this.withNoTarget();
        this.withNoDefense();
        this.withLeaveCombat();
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