import { AbstractFeature } from "../core/AbstractFeature.js";
import { ActionDataBuilder } from "../core/actionDataBuilder.js";

export class Pavane extends AbstractFeature {

    /**
     * Constructor.
     * @param actor The actor which performs the action.
     */
    constructor(actor) {
        super(actor);
    }

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
        return 'NEPH5E.tente.self.pavane';
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