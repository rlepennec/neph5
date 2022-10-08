import { AbstractManoeuver } from "./abstractManoeuver.js";
import { Constants } from "../../../module/common/constants.js";
import { Frapper } from "./frapper.js";

export class Parer extends AbstractManoeuver {

    static ID = "parer";

    /**
     * Constructor.
     */
    constructor() {
        super(Parer.ID, Constants.PARADE);
        this.withApproches(['feu','terre', 'ka']);
        this.withAbsorption({modifier: 2});
    }

    /**
     * @Override
     */
    canBePerformed(action) {
        return action.weapon != null &&
               action.attack.manoeuver.family === Constants.STRIKE ||
               action.attack.manoeuver.id === Frapper.ID;
    }

}