import { AbstractManoeuver } from "./abstractManoeuver.js";
import { Constants } from "../../../module/common/constants.js";

export class Lancer extends AbstractManoeuver {

    static ID = "lancer";

    /**
     * Constructor.
     */
    constructor() {
        super(Lancer.ID, Constants.THROW);
        this.withApproches(['feu']);
        this.withImpact({modifier: 0});
    }

    /**
     * @Override
     */
    canBePerformed(action) {
        return action.weapon.system.lance === true;
    }

    /**
     * @Override
     */
    async apply(action) {
        await action.weapon.update({ ['system.used']: false });
    }

}