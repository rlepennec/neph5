import { AbstractFeature } from "../core/abstractFeature.js";
import { ActionDataBuilder } from "../core/actionDataBuilder.js";

export class Pavane extends AbstractFeature {

    /**
     * @Override
     */
    get title() {
        return "Jet de Pavane";
    }

    /**
     * @Override
     */
    get sentence() {
        return 'NEPHILIM.tenteSelfPavane';
    }

    /**
     * @Override
     */
    get data() {
        return new ActionDataBuilder(this)
            .withImage('systems/neph5e/assets/icons/pavane.webp')
            .withBase('Pavane', this.degre)
            .withBlessures('magique')
            .export();
    }

    /**
     * @Override
     */
    get purpose() {
        return "pavane";
    }

    /**
     * @Override
     */
    get degre() {
        return this.actor.system.ka.pavane;
    }

}