import { AbstractFeature } from "../../core/abstractFeature.js";
import { ActionDataBuilder } from "../../core/actionDataBuilder.js";
import { Constants } from "../../../module/common/constants.js";

export class Menace extends AbstractFeature {

    /**
     * Constructor.
     * @param actor     The actor which performs the action.

     */
    constructor(actor) {
        super(actor);
    }

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
        return 'NEPH5E.tente.self.menace';
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