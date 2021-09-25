import { Action } from "./action.js";
import { Status } from "../data/status.js";

import { Rafale } from "./ranged/rafale.js";
import { Salve } from "./ranged/salve.js";
import { Tirer } from "./ranged/tirer.js";

import { Cacher } from "./maneuver/cacher.js";
import { Couvert } from "./maneuver/couvert.js";
import { Liberer } from "./maneuver/liberer.js";
import { Recharger } from "./maneuver/recharger.js";
import { Relever } from "./maneuver/relever.js";
import { Viser } from "./maneuver/viser.js";

import { Etrange } from "./melee/etrange.js";
import { Force } from "./melee/force.js";
import { Puissante } from "./melee/puissante.js";
import { Rapide } from "./melee/rapide.js";
import { Standard } from "./melee/standard.js";
import { Subtile } from "./melee/subtile.js";
import { Desarmement } from "./melee/desarmement.js";

import { Frappe } from "./unarmed/frappe.js";
import { Immobiliser } from "./unarmed/immobiliser.js";
import { Projeter } from "./unarmed/projeter.js";

import { Bloquer } from "./defense/bloquer.js";
import { Contrer } from "./defense/contrer.js";
import { Desarmer } from "./defense/desarmer.js";
import { Eviter } from "./defense/eviter.js";
import { Esquiver } from "./defense/esquiver.js";
import { Parer } from "./defense/parer.js";

export class Actions {

    /**
     * Constructor.
     * @param template The template used to display the allowed actions.
     * @param token    The token for which performs the action.
     * @param template The template used to display the allowed actions.
     * @param title    The title of the panel used to display the allowed actions.
     * @param active   Indicates if the current turn is needed to perform the actions. 
     */
    constructor(actor, token, template, title, active) {
        this.actor = actor;
        this.token = token;
        this.template = template;
        this.title = title;
        this.status = new Status(token.combatant);
        this.active = active;
    }

    /**
     * @returns the data used to create the allowed action list.
     */
    data() {
        throw new Error("Abstract method 'data' must be implemeted");
    }

    /**
     * The process to perform if no data available.
     */
    async noData() {
        ui.notifications.warn("Aucune action possible !");
    }

    /**
     * Performs the macro.
     */
    async doit() {

        // Refreshes the token data according to the current turn and the current round
        await this.status.refresh();

        // Checks combat
        if (game.combat === null) {
            ui.notifications.warn("Aucun combat !");
            return;
        }

        // Checks the current turn if necessary
        if (this.active) {
            const current = game.combat.current.tokenId;
            if (current != this.token.id) {
              ui.notifications.warn("Ce n'est pas votre tour !");
              return;
            }
        }

        // Fetches renderer data
        const data = this.data();
        if (data.actions.length === 0) {
            await this.noData();
            return;
        }

        // Lock the action panel
        this.actor.unlock();

        // Display the dialog used to choose the action
        const content = await renderTemplate(this.template, data);
        let dialog = new Dialog({
            title: this.title,
            content: content,
            buttons: {
                roll: {
                    icon: '<i class="fas fa-check"></i>',
                    label: game.i18n.localize("Exécuter"),
                    callback: async (content) => {
  
                        // Gets and update the choosen action
                        const choice = $('input[name=action]:checked').val();
                        const action = data.actions.find(a => a.id === choice);
                        const modifier = parseInt(Math.floor(parseInt(content.find("#modifier")[0].value)/10));
                        action.modifier = (isNaN(modifier) ? 0 : modifier);
                        if (action.difficulty != undefined) {
                            action.difficulty = Math.max(0, action.difficulty + action.modifier);
                        }

                        // Performs the choosen action
                        await this.status.history.push(action);
                        switch (action.id) {
                            case Couvert.id:
                                return await new Couvert(this.actor, this.token).doit(action);
                            case Cacher.id:
                                return await new Cacher(this.actor, this.token).doit(action);
                            case Viser.id:
                                return await new Viser(this.actor, this.token).doit(action);
                            case Recharger.id:
                                return await new Recharger(this.actor, this.token).doit(action);
                            case Tirer.id:
                                return await new Tirer(this.actor, this.token).doit(action);
                            case Salve.id:
                                return await new Salve(this.actor, this.token).doit(action);
                            case Rafale.id:
                                return await new Rafale(this.actor, this.token).doit(action);
                            case Standard.id:
                                return await new Standard(this.actor, this.token).doit(action);
                            case Etrange.id:
                                return await new Etrange(this.actor, this.token).doit(action);
                            case Force.id:
                                return await new Force(this.actor, this.token).doit(action);
                            case Puissante.id:
                                return await new Puissante(this.actor, this.token).doit(action);
                            case Rapide.id:
                                return await new Rapide(this.actor, this.token).doit(action);
                            case Subtile.id:
                                return await new Subtile(this.actor, this.token).doit(action);
                            case Desarmement.id:
                                return await new Desarmement(this.actor, this.token, this.attack).doit(action);
                            case Frappe.id:
                                return await new Frappe(this.actor, this.token).doit(action);
                            case Immobiliser.id:
                                return await new Immobiliser(this.actor, this.token).doit(action);
                            case Liberer.id:
                                return await new Liberer(this.actor, this.token).doit(action);
                            case Projeter.id:
                                return await new Projeter(this.actor, this.token).doit(action);
                            case Relever.id:
                                return await new Relever(this.actor, this.token).doit(action);
                            case Eviter.id:
                                return await new Eviter(this.actor, this.token, this.attack).doit(action);
                            case Esquiver.id:
                                return await new Esquiver(this.actor, this.token, this.attack).doit(action);
                            case Parer.id:
                                return await new Parer(this.actor, this.token, this.attack).doit(action);
                            case Bloquer.id:
                                return await new Bloquer(this.actor, this.token, this.attack).doit(action);
                            case Contrer.id:
                                return await new Contrer(this.actor, this.token, this.attack).doit(action);
                            case Desarmer.id:
                                return await new Desarmer(this.actor, this.token, this.attack).doit(action);
                        }

                    },
                },
                cancel: {
                    icon: '<i class="fas fa-times"></i>',
                    label: game.i18n.localize("Abandonner"),
                    callback: () => {},
                },
            },
            default: "roll",
            close: () => {
                this.actor.unlock();
            },
        });
        dialog.render(true);

    }

    /**
     * Gets the counter for each type of action.
     * @param actions The array of actions to watch.
     * @returns all the counters.
     */
    counters(actions) {
        let counters = {};
        for (let type of Object.keys(Action.Types)) {
            counters[type] = 0;
        }
        for (let action of actions) {
            const type = action.type;
            counters[type] = counters[type] + 1;
        }
        return counters;
    }

    /**
     * @returns the combatant token.
     */
    getToken(combatant) {
        return game.canvas.tokens.get(combatant.data.tokenId);
    }

}