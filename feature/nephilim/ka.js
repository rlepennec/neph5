import { AbstractRoll } from "../core/abstractRoll.js";
import { ActionDataBuilder } from "../core/actionDataBuilder.js";

export class Ka extends AbstractRoll {

    /**
     * Constructor.
     * @param actor The actor which performs the action.
     * @param ka    The ka to roll.
     * @param scope Indicates if scope is actor or simulacre.
     */
    constructor(actor, ka, scope) {
        super(actor);
        this.ka = ka;
        this.scope = scope;
    }

    /**
     * @Override
     */
    get title() {
        switch (this.actor.type) {
            case 'figure':
                switch (this.scope) {
                    case 'actor':
                        return "Jet de Ka " + this.ka;
                    case 'simulacre':
                        return "Jet de Ka soleil";
                    default:
                        throw new Error("Ka.title scope " + this.scope + " not implemented");
                }
            case 'figurant':
                return "Jet de Ka";
            default:
                throw new Error("Ka.title actor type " + this.actor.type + " not implemented");
        }
    }

    /**
     * @Override
     */
    get sentence() {
        switch (this.actor.type) {
            case 'figure':
                switch (this.scope) {
                    case 'actor':
                        return 'NEPH5E.tente.self.ka-de';
                    case 'simulacre':
                        return 'NEPH5E.tente.simulacre.ka-de';
                    default:
                        throw new Error("Ka.sentence scope " + this.scope + " not implemented");
                }
            case 'figurant':
                return 'NEPH5E.tente.self.ka';
            default:
                throw new Error("Ka.sentence actor type " + this.actor.type + " not implemented");
        }
    }

    /**
     * @Override
     */
    get data() {
        return new ActionDataBuilder(this)
            .withImage('systems/neph5e/assets/icons/ka.webp')
            .withBase('Ka', this.degre)
            .withBlessures('magique')
            .withKa(this.ka)
            .export();
    }

    /**
     * @Override
     */
     get purpose() {
        return "ka";
    }

    /**
     * @Override
     */
    get degre() {
        switch (this.actor.type) {
            case 'figure':
                switch (this.scope) {
                    case 'actor':
                        return this.actor.system.ka[this.ka];
                    case 'simulacre':
                        return game.actors.find(a => a.sid === this.actor.system.simulacre).system.ka;
                    default:
                        throw new Error("Ka.degre scope " + this.scope + " not implemented");
                }
            case 'figurant':
                return this.actor.system.ka;
            default:
                throw new Error("Ka.degre actor type " + this.actor.type + " not implemented");
        }
    }

}