import { AbstractManoeuver } from "./abstractManoeuver.js";
import { Constants } from "../../../module/common/constants.js";

export class ParerProjectile extends AbstractManoeuver {

    static ID = "parerProjectile";

    /**
     * Constructor.
     */
    constructor() {
        super(ParerProjectile.ID, Constants.PARADE);
        this.withAdvanced(true);
        this.withApproches(['terre', 'ka']);
        this.withShots(0, -20, -40, -60, -80, -100);
        this.withAbsorption({modifier: 2});
    }

    /**
     * @Override
     */
    canBePerformed(action) {
        return action.attack.manoeuver.family === Constants.FIRE &&
               action.attack.weapon.system.type === 'trait' &&
               action.weapon != null &&
               action.weapon.system.blocage === true;
    }

}