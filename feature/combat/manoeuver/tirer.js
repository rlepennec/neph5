import { AbstractManoeuver } from "./abstractManoeuver.js";
import { Constants } from "../../../module/common/constants.js";

export class Tirer extends AbstractManoeuver {

    static ID = "tirer";

    /**
     * Constructor.
     */
    constructor() {
        super(Tirer.ID, Constants.FIRE);
        this.withAdvanced(false);
        this.withApproches(['air', 'ka']);
        this.withImpact({modifier: 0});
    }

    /**
     * @Override
     */
    canBePerformed(action) {
        return action.weapon.system.type === 'trait' ||
              (action.weapon.system.munitions > action.weapon.system.tire);
    }

    /**
     * @Override
     */
    async apply(action) {
        await action.weapon.update({ ['system.tire']: action.weapon.system.tire + 1 });
    }

}