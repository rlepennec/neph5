import { AbstractFeature } from "../core/abstractFeature.js";
import { ActionDataBuilder } from "../core/actionDataBuilder.js";

export class Noyau extends AbstractFeature {

    /**
     * @Override
     */
    get title() {
        return "Jet de Noyau";
    }

    /**
     * @Override
     */
    get sentence() {
        return 'NEPHILIM.tenteSelfNoyau';
    }


    /**
     * @Override
     */
    get data() {
        return new ActionDataBuilder(this)
            .withImage('systems/neph5e/assets/icons/noyau.webp')
            .withBase('Noyau', this.degre)
            .withBlessures('magique')
            .export();
    }

    /**
     * @Override
     */
    get purpose() {
        return "noyau";
    }

    /**
     * @Override
     */
    get degre() {
        return this.actor.system.ka.noyau;
    }

}