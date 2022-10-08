import { AbstractManoeuver } from "./abstractManoeuver.js";
import { Constants } from "../../../module/common/constants.js";

export class ParerProjectile extends AbstractManoeuver {

    static ID = "parerProjectile";

    /**
     * Constructor.
     */
    constructor() {
        super(ParerProjectile.ID, Constants.PARADE);
        this.withApproches(['terre', 'ka']);
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