import { Actions } from "./actions.js";
import { Status } from "../data/status.js";

import { Cacher } from "./maneuver/cacher.js";
import { Couvert } from "./maneuver/couvert.js";
import { Liberer } from "./maneuver/liberer.js";
import { Recharger } from "./maneuver/recharger.js";
import { Relever } from "./maneuver/relever.js";
import { Viser } from "./maneuver/viser.js";

import { Rafale } from "./ranged/rafale.js";
import { Salve } from "./ranged/salve.js";
import { Tirer } from "./ranged/tirer.js";

export class Fire extends Actions {

    /**
     * The identifer of the actions. 
     */
    static id = 'fire';

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
            "Arme à distance de " + actor.name,
            true);
    }

    /**
     * @override
     */
    data() {

        // Registers all possible actions
        let actions = [];
        new Couvert(this.actor, this.token).register(actions);
        new Cacher(this.actor, this.token).register(actions);
        new Liberer(this.actor, this.token).register(actions);
        new Relever(this.actor, this.token).register(actions);
        new Viser(this.actor, this.token).register(actions);
        new Recharger(this.actor, this.token).register(actions);
        new Tirer(this.actor, this.token).register(actions);
        new Salve(this.actor, this.token).register(actions);
        new Rafale(this.actor, this.token).register(actions);

        // Returns all the data
        const rangedWeapon = new Status(this.token.combatant).ranged.weapon();
        return {
            id: this.constructor.id,
            actions: actions,
            counters: this.counters(actions),
            melee: {
                weapon: new Status(this.token.combatant).melee.weapon()
            },
            ranged: {
                armed: rangedWeapon !== undefined && rangedWeapon !== null,
                weapon: rangedWeapon,
                state: {
                    visee: this.token.combatant.data.flags.world.combat.ranged.visee,
                    utilise: this.token.combatant.data.flags.world.combat.ranged.utilise,
                    reload: this.token.combatant.data.flags.world.combat.ranged.reload,
                }
            }
        };

    }

}