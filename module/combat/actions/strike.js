import { Actions } from "./actions.js";
import { Status } from "../data/status.js";

import { Liberer } from "./maneuver/liberer.js";
import { Relever } from "./maneuver/relever.js";

import { Frappe } from "./unarmed/frappe.js";
import { Immobiliser } from "./unarmed/immobiliser.js";
import { Projeter } from "./unarmed/projeter.js";

import { Etrange } from "./melee/etrange.js";
import { Force } from "./melee/force.js";
import { Puissante } from "./melee/puissante.js";
import { Rapide } from "./melee/rapide.js";
import { Standard } from "./melee/standard.js";
import { Subtile } from "./melee/subtile.js";
import { Desarmement } from "./melee/desarmement.js";

export class Strike extends Actions {

    /**
     * The identifer of the actions. 
     */
    static id = 'strike';

    /**
     * Constructor.
     * @param template The template used to display the allowed actions.
     * @param token    The token for which performs the action.
     */
     constructor(actor, token) {
        super(
            actor,
            token,
            "systems/neph5e/templates/dialog/combat/combat-actions.hbs",
            "Corps à corps de " + actor.name,
            true);
    }

    /**
     * @override
     */
    data() {

        // Registers all possible actions
        let actions = [];
        new Liberer(this.actor, this.token).register(actions);
        new Relever(this.actor, this.token).register(actions);
        new Standard(this.actor, this.token).register(actions);
        new Force(this.actor, this.token).register(actions);
        new Rapide(this.actor, this.token).register(actions);
        new Puissante(this.actor, this.token).register(actions);
        new Subtile(this.actor, this.token).register(actions);
        new Etrange(this.actor, this.token).register(actions);
        new Desarmement(this.actor, this.token).register(actions);
        new Frappe(this.actor, this.token).register(actions);
        new Immobiliser(this.actor, this.token).register(actions);
        new Projeter(this.actor, this.token).register(actions);

        // Returns all the data
        return {
            id: this.constructor.id,
            actions: actions,
            counters: this.counters(actions),
            melee: {
                weapon: new Status(this.token.combatant).melee.weapon()
            },
            ranged: {
                weapon: new Status(this.token.combatant).ranged.weapon(),
                state: {
                    visee: this.token.combatant.data.flags.world.combat.ranged.visee,
                    chargeur: this.token.combatant.data.flags.world.combat.ranged.chargeur,
                    reload: this.token.combatant.data.flags.world.combat.ranged.reload,
                }
            }
        };

    }

}