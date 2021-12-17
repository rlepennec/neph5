import { Game } from "../common/game.js";

export class State {

    /**
     * Constructor.
     * @param template The template used to display the allowed actions.
     * @param token    The token for which performs the action.
     */
    constructor(actor, token) {
        this.actor = actor;
        this.token = token;
    }

    /**
     * Opens the dialog to configure the state of the token. 
     */
    async doit() {

        const data = {
            effects: {
                desoriente: this.token.combatant.effectIsActive(Game.effects.desoriente),
                immobilise: this.token.combatant.effectIsActive(Game.effects.immobilise),
                projete: this.token.combatant.effectIsActive(Game.effects.projete)
            },
            combatant: this.token.combatant
        }

        const content = await renderTemplate("systems/neph5e/templates/dialog/combat/etat.hbs", data);

        await new Dialog({
            title: "Etat de " + this.actor.name,
            content: content,
            buttons: {
                roll: {
                    icon: '<i class="fas fa-check"></i>',
                    label: game.i18n.localize("Modifier"),
                    callback: async (html) => {
                        await this._setEffects($('#immobilise').is(":checked"), $('#projete').is(":checked"), $('#desoriente').is(":checked"));
                    }
                },
                cancel: {
                    icon: '<i class="fas fa-times"></i>',
                    label: game.i18n.localize("Abandonner"),
                    callback: () => { }
                }
            },
            default: "roll",
            close: () => {
                this.actor.unlock()
            }
        }).render(true);

    }

    async _setEffects(immobilise, projete, desoriente) {
        await this.token.combatant.setEffect(Game.effects.immobilise, immobilise);
        await this.token.combatant.setEffect(Game.effects.projete, projete);
        await this.token.combatant.setEffect(Game.effects.desoriente, desoriente);
    }

}