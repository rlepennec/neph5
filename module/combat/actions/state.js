import { CancellableDialog } from "../../common/cancellableDialog.js";
import { Status } from "../data/status.js";
import { Game } from "../../common/game.js";

export class State {

    /**
     * Constructor.
     * @param template The template used to display the allowed actions.
     * @param token    The token for which performs the action.
     */
    constructor(actor, token) {
        this.actor = actor;
        this.token = token;
        this.status = new Status(token.combatant);
    }

    /**
     * Opens the dialog to configure the state of the token. 
     */
    async doit() {

        const status = this.status;

        await new CancellableDialog(this.actor)
            .withTitle("Etat de " + this.actor.name)
            .withTemplate("systems/neph5e/templates/dialog/combat/etat.hbs")
            .withData(this.status.getData())
            .withCallback(async function(data) {

                await status.effects.set(Game.effects.immobilise, $('#immobilise').is(":checked"));
                await status.effects.set(Game.effects.projete, $('#projete').is(":checked"));
                await status.effects.set(Game.effects.desoriente, $('#desoriente').is(":checked"));

        }).render();

   }

}