import { AbstractManoeuver } from "./abstractManoeuver.js";
import { Constants } from "../../../module/common/constants.js";

export class Multiple extends AbstractManoeuver {

    static ID = "multiple";

    /**
     * Constructor.
     */
    constructor() {
        super(Multiple.ID, Constants.FIRE);
        this.withApproches(['air', 'ka']);
        this.withShots(-20, -20, -30, -50, -70);
        this.withImpact({modifier: 0});
    }

    /**
     * @Override
     */
    canBePerformed(action) {
        return action.weapon.system.munitions - action.weapon.system.tire > 0;
    }

}