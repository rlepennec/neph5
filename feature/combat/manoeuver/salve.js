import { AbstractManoeuver } from "./abstractManoeuver.js";
import { Constants } from "../../../module/common/constants.js";

export class Salve extends AbstractManoeuver {

    static ID = "salve";

    /**
     * Constructor.
     */
    constructor() {
        super(Salve.ID, Constants.FIRE);
        this.withApproches(['air', 'ka']);
        this.withShots(0, -30, -50);
        this.withImpact({modifier: 2});
    }

    /**
     * @Override
     */
    canBePerformed(action) {
        return action.weapon.system.salve === true &&
               action.weapon.system.munitions > action.weapon.system.tire + 2;
    }

    /**
     * @Override
     */
    async apply(action) {
        await action.weapon.update({ ['system.tire']: action.weapon.system.tire + 3 });
    }

}