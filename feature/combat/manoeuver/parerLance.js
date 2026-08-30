import { AbstractManoeuver } from "./abstractManoeuver.js";
import { Constants } from "../../../module/common/constants.js";

export class ParerLance extends AbstractManoeuver {

    static ID = "parerLance";

    /**
     * Constructor.
     */
    constructor() {
        super(ParerLance.ID, Constants.PARADE);
        this.withApproches(['terre', 'ka']);
        this.withShots(0, -20, -40, -60, -80, -100);
        this.withAbsorption({modifier: 3});
    }

    /**
     * @Override
     */
    canBePerformed(action) {
        return action.attack.manoeuver.family === Constants.THROW &&
               action.weapon != null &&
               action.weapon.system.blocage === true;
    }

}