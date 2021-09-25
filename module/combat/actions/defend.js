import { Actions } from "./actions.js";
import { Action } from "./action.js";
import { Status } from "../data/status.js";

import { Defense } from "./defense/defense.js";
import { Bloquer } from "./defense/bloquer.js";
import { Contrer } from "./defense/contrer.js";
import { Desarmer } from "./defense/desarmer.js";
import { Esquiver } from "./defense/esquiver.js";
import { Eviter } from "./defense/eviter.js";
import { Parer } from "./defense/parer.js";

export class Defend extends Actions {

    /**
     * The identifer of the actions. 
     */
    static id = 'defense';

    /**
     * Constructor.
     * @param template The template used to display the allowed actions.
     * @param token    The token for which performs the action.
     * @param event    The chat message id which triggers the defense.
     * @param attack   The attack action which triggers the defense.
     */
    constructor(actor, token, event, attack) {
        super(
            actor,
            token,
            "systems/neph5e/templates/dialog/combat/combat-actions.hbs",
            "Défense de " + actor.name,
            false);
        this.event = event;
        this.attack = attack;
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

        // Skips the source message if already processed
        if (this.status.messages.includes(this.event)) {
            return;
        }

        // Registers the source message as processed
        this.status.messages.push(this.event);

        // Process the action
        return await super.doit();

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
            actions: actions,
            counters: this.counters(actions),
            weapon: new Status(this.token.combatant).ranged.weapon()
        };

    }

}