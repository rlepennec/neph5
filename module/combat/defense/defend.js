import { Actions } from "../actions.js";
import { Action } from "../action.js";
import { Defense } from "./defense.js";
import { Bloquer } from "./bloquer.js";
import { Contrer } from "./contrer.js";
import { Desarmer } from "./desarmer.js";
import { Esquiver } from "./esquiver.js";
import { Eviter } from "./eviter.js";
import { Parer } from "./parer.js";

export class Defend extends Actions {

    /**
     * The identifer of the actions. 
     */
    static id = 'defense';

    /**
     * Constructor.
     * @param actor    The actor which performs the defense.
     * @param token    The token for which performs the defense.
     * @param event    The chat message id of the attack which triggers the defense.
     * @param attack   The attack action which triggers the defense.
     */
    constructor(actor, token, event, attack) {
        super(
            actor,
            token,
            null,
            "systems/neph5e/templates/dialog/combat/combat-defense.hbs",
            "Défense de " + actor.name,
            false);
        this.event = event;
        this.attack = attack;
        this.attack.attackEventId = event;
    }

    /**
     * @Override
     */
    async noData() {
        await new Defense(this.actor, this.token, this.attack).suffer();
    }

    /**
     * @Override
     */
    async doit() {

        // If no defense possible
        if (this.attack.type === Action.Types.ranged.id) {
            return await new Defense(this.actor, this.token, this.attack).suffer();
        }

        // Process the action
        return await super.doit();

    }

    someActionsAreAllowed() {
        return true;
    }

    /**
     * @override
     */
    data() {

        // Registers all possible actions
        let actions = [];
        new Eviter(this.actor, this.token, this.attack).register(actions);
        new Parer(this.actor, this.token, this.attack).register(actions);
        new Esquiver(this.actor, this.token, this.attack).register(actions);
        new Bloquer(this.actor, this.token, this.attack).register(actions);
        new Contrer(this.actor, this.token, this.attack).register(actions);
        new Desarmer(this.actor, this.token, this.attack).register(actions);

        // Returns all the data
        return {
            id: this.constructor.id,
            actions: actions
        };

    }

}