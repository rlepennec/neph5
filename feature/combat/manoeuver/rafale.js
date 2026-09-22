import { AbstractManoeuver } from "./abstractManoeuver.js";
import { Constants } from "../../../module/common/constants.js";

export class Rafale extends AbstractManoeuver {

    static ID = "rafale";

    /**
     * Constructor.
     */
    constructor(action) {
        super(Rafale.ID, Constants.FIRE, action);
        this.approches = ['air', 'ka'];
        this.attack = {modifier: -50};
        this.impact = {modifier: 5};
    }

    /**
     * @Override
     */
     isAllowed(action) {
        return action.weapon.system.rafale === true &&
               action.weapon.system.munitions > action.weapon.system.tire + 5;
    }

    /**
     * @Override
     */
    async apply(action) {
        await action.weapon.update({ ['system.tire']: action.weapon.system.munitions });
    }

}