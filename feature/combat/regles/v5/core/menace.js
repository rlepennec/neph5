import { AbstractFeature } from "../../../../core/regles/v5/abstractFeature.js";
import { Version } from "../../../../../module/common/version.js";
import { ActionDataBuilder } from "../../../../core/regles/v5/actionDataBuilder.js";
import { Constants } from "../../../../../module/common/regles/v5/constants.js";

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
        return Version.data(this.actor).menace;
    }

}