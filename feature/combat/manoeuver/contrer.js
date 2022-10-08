import { AbstractManoeuver } from "./abstractManoeuver.js";

import { Constants } from "../../../module/common/constants.js";

export class Contrer extends AbstractManoeuver {

    static ID = "contrer";

    /**
     * Constructor.
     */
    constructor() {
        super(Contrer.ID,  Constants.PARADE);
        this.withApproches(['feu','terre', 'ka']);
    }

    /**
     * @Override
     */
    canBePerformed(action) {
        return action.attack.manoeuver.family === Constants.STRIKE ||
              (action.attack.manoeuver.family === Constants.BRAWL && action.weapon != null);
    }

}