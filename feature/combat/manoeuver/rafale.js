import { AbstractManoeuver } from "./abstractManoeuver.js";
import { Constants } from "../../../module/common/constants.js";

export class Rafale extends AbstractManoeuver {

    static ID = "rafale";

    /**
     * Constructor.
     */
    constructor() {
        super(Rafale.ID, Constants.FIRE);
        this.withAdvanced(true);
        this.withApproches(['air', 'ka']);
        this.withAttack({modifier: -50});
        this.withImpact({modifier: 5});
    }

    /**
     * @Override
     */
     canBePerformed(action) {
        return action.weapon.system.salve === true &&
               action.weapon.system.munitions > action.weapon.system.tire + 5;
    }

    /**
     * @Override
     */
    async apply(action) {
        await action.weapon.update({ ['system.tire']: action.weapon.system.munitions });
    }

}