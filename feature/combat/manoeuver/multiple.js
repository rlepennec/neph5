import { AbstractManoeuver } from "./abstractManoeuver.js";
import { Version } from "../../../module/common/version.js";
import { Constants } from "../../../module/common/constants.js";

export class Multiple extends AbstractManoeuver {

    static ID = "multiple";

    /**
     * Constructor.
     */
    constructor(action) {
        super(Multiple.ID, Constants.FIRE, action);
        this.approches = ['air', 'ka'];
        this.withShots(-20, -20, -30, -50, -70);
        this.impact = {modifier: 0};
    }

    /**
     * @Override
     */
    isAllowed(action) {
        return Version.data(action.weapon).munitions - Version.data(action.weapon).tire > 0;
    }

    /**
     * @Override
     * Chaque tir du tir multiple est une attaque à part entière : une balle par tir.
     */
    async apply(action) {
        await action.weapon.update({ [Version.path(action.weapon, 'tire')]: Version.data(action.weapon).tire + 1 });
    }

}