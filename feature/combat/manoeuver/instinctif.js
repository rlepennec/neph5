import { AbstractManoeuver } from "./abstractManoeuver.js";
import { Constants } from "../../../module/common/constants.js";

export class Instinctif extends AbstractManoeuver {

    static ID = "instinctif";

    /**
     * Constructor.
     */
    constructor(action) {
        super(Instinctif.ID, Constants.FIRE, action);
        this.approches = ['feu'];
        this.impact = {modifier: 0};
    }

    /**
     * @Override
     */
    isAllowed(action) {
        return action.weapon.system.type === 'trait' ||
              (action.weapon.system.munitions > action.weapon.system.tire);
    }

}