import { AbstractManoeuver } from "./abstractManoeuver.js";
import { Constants } from "../../../module/common/constants.js";

export class Salve extends AbstractManoeuver {

    static ID = "salve";

    /**
     * Constructor.
     */
    constructor(action) {
        super(Salve.ID, Constants.FIRE, action);
        this.approches = ['air', 'ka'];
        this.withShots(0, -30, -50);
        this.impact = {modifier: 2};
    }

    /**
     * @Override
     */
    isAllowed(action) {
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