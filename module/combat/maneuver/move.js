import { Actions } from "../actions.js";
import { Liberer } from "./liberer.js";
import { Relever } from "./relever.js";
import { Couvert } from "./couvert.js";
import { Cacher } from "./cacher.js";

export class Move extends Actions {

    /**
     * Constructor.
     * @param template The template used to display the allowed actions.
     * @param token    The token for which performs the action.
     */
    constructor(actor, token) {
        super(
            actor,
            token,
            null,
            "systems/neph5e/templates/dialog/combat/combat-move.hbs",
            "Manoeuvres",
            true,
            true);
    }

    someActionsAreAllowed() {
        return true;
    }

    data() {

        let actions = [];
        new Liberer(this.actor, this.token).register(actions);
        new Relever(this.actor, this.token).register(actions);
        new Couvert(this.actor, this.token).register(actions);
        new Cacher(this.actor, this.token).register(actions);

        return {
            actions: actions
        };

    }

}