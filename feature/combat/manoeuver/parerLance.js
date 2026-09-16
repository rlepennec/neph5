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
        this.withNextDefenseModifier(-20);
        this.withAbsorption({modifier: 3});
    }

    /**
     * @Override
     */
    canBePerformed(action) {
        if (this.exclusiveDefensePlayed(action)) return false;
        return action.attack.manoeuver.family === Constants.THROW &&
               action.weapon != null &&
               action.weapon.system.blocage === true;
    }

}