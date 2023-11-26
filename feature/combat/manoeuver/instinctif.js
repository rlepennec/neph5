import { AbstractManoeuver } from "./abstractManoeuver.js";
import { Constants } from "../../../module/common/constants.js";

export class Instinctif extends AbstractManoeuver {

    static ID = "instinctif";

    /**
     * Constructor.
     */
    constructor() {
        super(Instinctif.ID, Constants.FIRE);
        this.withAdvanced(true);
        this.withApproches(['feu']);
        this.withAttack({modifier: -40});
        this.withImpact({modifier: 0});
    }

    /**
     * @Override
     */
    canBePerformed(action) {
        return action.weapon.system.type === 'trait' ||
              (action.weapon.system.munitions > action.weapon.system.tire);
    }

}