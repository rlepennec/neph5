import { AbstractManoeuver } from "./abstractManoeuver.js";
import { Version } from "../../../module/common/version.js";
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
        return Version.data(action.weapon).rafale === true &&
               Version.data(action.weapon).munitions > Version.data(action.weapon).tire + 5;
    }

    /**
     * @Override
     */
    async apply(action) {
        await action.weapon.update({ [Version.path(action.weapon, 'tire')]: Version.data(action.weapon).munitions });
    }

}