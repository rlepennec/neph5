import { Actions } from "../actions.js";
import { Etrange } from "./etrange.js";
import { Force } from "./force.js";
import { Puissante } from "./puissante.js";
import { Rapide } from "./rapide.js";
import { Standard } from "./standard.js";
import { Subtile } from "./subtile.js";

export class Strike extends Actions {

    /**
     * Constructor.
     * @param template The template used to display the allowed actions.
     * @param token    The token for which performs the action.
     * @param weapon   The weapon object used to perform the attack.
     */
    constructor(actor, token, weapon) {
        super(
            actor,
            token,
            weapon,
            "systems/neph5e/templates/dialog/combat/combat-strike.hbs",
            weapon.data.name,
            true,
            true);
    }

    someActionsAreAllowed() {
        if (!this.weapon.data.data.used) {
            ui.notifications.warn("Vous n'êtes pas équipé de " + this.weapon.name);
            return false;
        }
        if (Array.from(game.user.targets).length === 0) {
            ui.notifications.warn("Vous n'avez pas de cible");
            return false;
        }
        if (Array.from(game.user.targets).length > 1) {
            ui.notifications.warn("Vous avez trop de cible");
            return false;
        }
        if (this.immobilized()) {
            ui.notifications.warn("Vous êtes immobilisé");
            return false;
        }
        return true;
    }

    data() {

        let actions = [];
        new Standard(this.actor, this.token, this.weapon).register(actions);
        new Force(this.actor, this.token, this.weapon).register(actions);
        new Rapide(this.actor, this.token, this.weapon).register(actions);
        new Puissante(this.actor, this.token, this.weapon).register(actions);
        new Subtile(this.actor, this.token, this.weapon).register(actions);
        new Etrange(this.actor, this.token, this.weapon).register(actions);

        return {
            actions: actions,
            weapon: this.weapon
        };

    }

}