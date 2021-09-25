import { CancellableDialog } from "../../common/cancellableDialog.js";
import { Status } from "../data/status.js";
import { Game } from "../../common/game.js";

export class Equipment {

    /**
     * Constructor.
     * @param template The template used to display the allowed actions.
     * @param token    The token for which performs the action.
     */
    constructor(actor, token) {
        this.actor = actor;
        this.token = token;
        this.status = new Status(token);
    }

    /**
     * Opens the dialog to configure the equipment of all selected
     * tokens. The default equipment is the one of the token.
     * @param token The token which defines the default equipment. 
     */
    async doit(token) {

        new CancellableDialog(this.actor)
            .withTitle("Equipement de " + this.actor.name)
            .withTemplate("systems/neph5e/templates/dialog/combat/equipement.hbs")
            .withData(this.status.getData())
            .withCallback(async function(data) {

                // Update each token
                for (let t of canvas.tokens.controlled) {
                    const _status = new Status(t.combatant);
                    await _status.protection.set($('input[name=protection]:checked').val());
                    await _status.unarmed.set($('input[name=unarmed]:checked').val());
                    await _status.melee.set($('input[name=melee]:checked').val());
                    await _status.ranged.set($('input[name=ranged]:checked').val());
                    await _status.improvements.set(Game.improvements.initiative, parseInt(data.find("#initiative")[0].value));
                    await _status.improvements.set(Game.improvements.damages, parseInt(data.find("#damages")[0].value));
                    await _status.improvements.set(Game.improvements.choc, parseInt(data.find("#choc")[0].value));
            }

        }).render();

    }

}