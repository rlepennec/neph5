import { AbstractManoeuver } from "./abstractManoeuver.js";
import { Version } from "../../../module/common/version.js";
import { Constants } from "../../../module/common/constants.js";

export class Lancer extends AbstractManoeuver {

    static ID = "lancer";

    /**
     * Constructor.
     */
    constructor(action) {
        super(Lancer.ID, Constants.THROW, action);
        this.strike = true;
        this.approches = ['feu'];
        this.impact = {modifier: 0};
    }

    /**
     * @Override
     */
    isAllowed(action) {
        return Version.data(action.weapon).lance === true;
    }

    /**
     * @Override
     */
    async apply(action) {
        await action.weapon.update({ [Version.path(action.weapon, 'used')]: false });
    }

}