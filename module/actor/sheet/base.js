import { Game } from "../../common/game.js";

export class BaseSheet extends ActorSheet {

    /**
     * @constructor
     * @param  {...any} args
     */
    constructor(...args) {
        super(...args);
        this.options.submitOnClose = true;
    }

    /**
     * Gets the token id of the specified actor on the current canvas.
     * @param {*} actor 
     * @returns 
     */
    async getToken(actor) {
        if (!actor) return null;
        const selected = game.canvas.tokens.controlled;
        if (selected.length > 1 || selected.length == 0) {
            return null;
        }
        if (selected[0].actor.data._id !== actor.data._id) {
            return null;
        }
        return(selected[0])
    }

    async _onAttack(event) {
        const li = $(event.currentTarget).parents(".item");
        const id = li.data("item-id");
        const arme = this.actor.items.get(id);
        const token = await this.getToken(this.actor);
        if (token !== null && token !== undefined) {
            switch (arme.data.data.skill) {
            case 'melee':
                await token.actor.frapper(token, arme);
                break;
            case 'trait':
            case 'feu':
            case 'lourde':
                await token.actor.tirer(token, arme);
                break;
            }
        } else {
            ui.notifications.warn("Veuillez selectionner un token");
        }
    }

    async _onWrestle(event) {
        const token = await this.getToken(this.actor);
        if (token !== null && token !== undefined) {
            await token.actor.wrestle(token);
        } else {
            ui.notifications.warn("Veuillez selectionner un token");
        }
    }

    async _onMove(event) {
        const token = await this.getToken(this.actor);
        if (token !== null && token !== undefined) {
            await token.actor.move(token);
        } else {
            ui.notifications.warn("Veuillez selectionner un token");
        }
    }

    async _onUseItem(event) {
        const li = $(event.currentTarget).parents(".item");
        const id = li.data("item-id");
        const item = this.actor.items.get(id);
        const token = await this.getToken(this.actor);
        if (token !== null && token !== undefined) {
            await token.actor.useItem(item);
        } else {
            ui.notifications.warn("Veuillez selectionner un token");
        }
    }

    async _onState(event, effect) {
        if (this?.token?.combatant !== undefined && this?.token?.combatant !== null) {
            const active = $(event.currentTarget).is(":checked");
            await this.token.combatant.setEffect(effect, active);
        } else {
            ui.notifications.warn("Veuillez selectionner un token en combat");
        }
    }

    async _onDesoriente(event) {
        return await this._onState(event, Game.effects.desoriente);
    }

    async _onImmobilise(event) {
        return await this._onState(event, Game.effects.immobilise);
    }

    async _onProjete(event) {
        return await this._onState(event, Game.effects.projete);
    }

}