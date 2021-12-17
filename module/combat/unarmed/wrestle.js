import { Actions } from "../actions.js";
import { Frappe } from "./frappe.js";
import { Projeter } from "./projeter.js";
import { Immobiliser } from "./immobiliser.js";

export class Wrestle extends Actions {

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
            "systems/neph5e/templates/dialog/combat/combat-wrestle.hbs",
            "Armes naturelles",
            true,
            true);
    }

    someActionsAreAllowed() {
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
        new Frappe(this.actor, this.token).register(actions);
        new Projeter(this.actor, this.token).register(actions);
        new Immobiliser(this.actor, this.token).register(actions);

        return {
            actions: actions
        };

    }

}