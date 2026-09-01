import { AbstractFeature } from "../../core/abstractFeature.js";
import { ActionDataBuilder } from "../../core/actionDataBuilder.js";
import { Constants } from "../../../module/common/constants.js";

export class Menace extends AbstractFeature {

    /**
     * @Override
     */
    get title() {
        return 'Jet de Menace';
    }

    /**
     * @Override
     */
    get sentence() {
        return 'NEPHILIM.tenteSelfMenace';
    }

    /**
     * @Override
     */
    get data() {
        return new ActionDataBuilder(this)
            .withImage('systems/neph5e/assets/icons/menace.webp')
            .withBase('Menace', this.degre)
            .withBlessures(Constants.PHYSICAL)
            .export();
    }

    /**
     * @Override
     */
    get purpose() {
        return "menace";
    }

    /**
     * @Override
     */
    get degre() {
        return this.actor.system.menace;
    }

}