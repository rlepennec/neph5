import { AbstractManoeuver } from "./abstractManoeuver.js";
import { Version } from "../../../module/common/version.js";
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
        return Version.data(action.weapon).salve === true &&
               Version.data(action.weapon).munitions > Version.data(action.weapon).tire + 2;
    }

    /**
     * @Override
     */
    async apply(action) {
        await action.weapon.update({ [Version.path(action.weapon, 'tire')]: Version.data(action.weapon).tire + 3 });
    }

}