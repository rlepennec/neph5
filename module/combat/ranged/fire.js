import { Actions } from "../actions.js";
import { Reload } from "./reload.js";
import { Aim } from "./aim.js";
import { Rafale } from "./rafale.js";
import { Salve } from "./salve.js";
import { Tirer } from "./tirer.js";

export class Fire extends Actions {

    /**
     * Constructor.
     * @param template The template used to display the allowed actions.
     * @param token    The token for which performs the action.
     * @param weapon   The weapon object used to perform the action.
     */
    constructor(actor, token, weapon) {
        super(
            actor,
            token,
            weapon,
            "systems/neph5e/templates/dialog/combat/combat-fire.hbs",
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
        const reste = this.weapon.data.data.ranged.munitions - this.weapon.data.data.ranged.utilise;
        if (this.constructor.required > reste) {
            ui.notifications.warn("Vous n'avez pas assez de munitions");
            return false;
        }
        return true;
    }

    data() {

        let actions = [];
        new Aim(this.actor, this.token, this.weapon).register(actions);
        new Reload(this.actor, this.token, this.weapon).register(actions);
        new Tirer(this.actor, this.token, this.weapon).register(actions);
        new Salve(this.actor, this.token, this.weapon).register(actions);
        new Rafale(this.actor, this.token, this.weapon).register(actions);

        return {
            actions: actions,
            weapon: this.weapon
        };

    }

}