import { AbstractRoll } from "../core/abstractRoll.js";
import { ActionDataBuilder } from "../core/actionDataBuilder.js";

export class Noyau extends AbstractRoll {

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
        return "Jet de Noyau";
    }

    /**
     * @Override
     */
    get sentence() {
        return 'NEPH5E.tente.self.noyau';
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