import { AbstractRoll } from "../../feature/core/abstractRoll.js";
import { AbstractRollBuilder } from "../../feature/core/abstractRollBuilder.js";
import { Constants } from "../common/constants.js";
import { Distance } from "../../feature/combat/core/distance.js";
import { Melee } from "../../feature/combat/core/melee.js";
import { Naturelle } from "../../feature/combat/core/naturelle.js";
import { Recharger } from "../../feature/combat/manoeuver/recharger.js";
import { Viser } from "../../feature/combat/manoeuver/viser.js";
import { Wrestle } from "../../feature/combat/core/wrestle.js";

export class BaseSheet extends ActorSheet {

    /**
     * @constructor
     * @param  {...any} args
     */
    constructor(...args) {
        super(...args);
        this.options.submitOnClose = true;
        this.editable = game.user.isGM || this.actor.owner === true;
    }

    /**
     * @override
     */
    activateListeners(html) {
        super.activateListeners(html);
        html.find('div[data-tab="combat"]').on("drop", this._onDrop.bind(this));
        html.find('div[data-tab="combat"] .edit-arme').click(this._onEditEmbeddedItem.bind(this));
        html.find('div[data-tab="combat"] .edit-armure').click(this._onEditEmbeddedItem.bind(this));
        html.find('div[data-tab="combat"] .item-delete').click(this._onDeleteEmbeddedItem.bind(this));
        html.find('div[data-tab="combat"] .attack').click(this._onAttack.bind(this));
        html.find('div[data-tab="combat"] .wrestle').click(this._onWrestle.bind(this));
        html.find('div[data-tab="combat"] #viser').click(this._onViser.bind(this));
        html.find('div[data-tab="combat"] #recharger').click(this._onRecharger.bind(this));
        html.find('div[data-tab="combat"] .item-use').click(this._onUseItem.bind(this));
        html.find('div[data-tab="combat"] .item-parade').click(this._onParadeItem.bind(this));
        html.find('div[data-tab="combat"] #desoriente').click(this._onEffect.bind(this, 'stun'));
        html.find('div[data-tab="combat"] #immobilise').click(this._onEffect.bind(this, 'restrain'));
        html.find('div[data-tab="combat"] #projete').click(this._onEffect.bind(this, 'prone'));

        html.find('div[data-tab="combat"] .macro').each((i, li) => {
            li.setAttribute("draggable", true);
            li.addEventListener("dragstart", event => this.addMacroData(event), false);
        });

    }

    addMacroData(event) {
        this._onDragStart(event);
        let macro = {
            process: "macro",
            type: event.currentTarget.attributes["data-type"].value,
            id: event.currentTarget.attributes["data-id"].value,
            sid: event.currentTarget.attributes["data-sid"].value
        };
        event.dataTransfer.setData('text/plain', JSON.stringify(macro));
    }

    /**
     * @returns true if a token of the character is in combat, false otherwise.
     */
    _inCombat() {
        return game.combat !== null && this?.token?.combatant !== undefined && this?.token?.combatant !== null;
    }

    /**
     * Attack with a melee or a ranged weapon.
     * @param event The click event.
     */
    async _onAttack(event) {

        const li = $(event.currentTarget).parents(".item");
        const id = li.data("item-id");
        const weapon = this.actor.items.get(id);

        if (weapon.attackCanBePerformed === false) {
            return;
        }

        switch (weapon.system.type) {
            case Constants.NATURELLE:
                await new Naturelle(this.actor, weapon).initialize();
                break;
            case Constants.MELEE:
                await new Melee(this.actor, weapon).initialize();
                break;
            case Constants.FEU:
            case Constants.TRAIT:
                await new Distance(this.actor, weapon).initialize();
                break;
        }

    }

    /**
     * Attack with a wrestle manoeuver.
     * @param event The click event.
     */
    async _onWrestle(event) {
        if (this.actor.lutteCanBePerformed) {
            await new Wrestle(this.actor).initialize();
        }
    }

    // USED IN NEW VERSION
    async _onUseItem(event) {
        const li = $(event.currentTarget).parents(".item");
        const id = li.data("item-id");
        const item = this.actor.items.get(id);
        await this.actor.useItem(item);
    }

    async _onParadeItem(event) {
        const li = $(event.currentTarget).parents(".item");
        const id = li.data("item-id");
        const item = this.actor.items.get(id);
        await this.actor.toggleDefenseWeapon(item);
    }

    /**
     * @param event The event to handle.
     */
    async _onViser(event) {
        event.preventDefault();
        const li = $(event.currentTarget).parents(".item");
        const id = li.data("item-id");
        const weapon = this.actor.items.get(id);
        const action = new Distance(this.actor, weapon);
        await new Viser().apply(action);
    }

    /**
     * @param event The event to handle.
     */
    async _onRecharger(event) {
        event.preventDefault();
        const li = $(event.currentTarget).parents(".item");
        const id = li.data("item-id");
        const weapon = this.actor.items.get(id);
        const action = new Distance(this.actor, weapon);
        await new Recharger().apply(action);
    }

    async _onEffect(id, event) {
        this.actor.updateEffect(id);
    }

    /**
     * Delete the specified embedded item.
     * @param event The click event.
     */
    async _onDeleteEmbeddedItem(event) {
        event.preventDefault();
        const li = $(event.currentTarget).parents(".item");
        await this.actor.deleteEmbeddedDocuments('Item', [li.data("item-id")]);
    }

    /**
     * Edit the specified embedded item. Used by vecu, arme and armure.
     * @param event The click event.
     */
    async _onEditEmbeddedItem(event) {
        event.preventDefault();
        const li = $(event.currentTarget).parents(".item");
        const id = li.data("item-id");
        const scope = li.data("scope");
        const actor = scope === 'simulacre' ? AbstractRoll.simulacre(this.actor) : this.actor;
        const item = actor.getEmbeddedDocument('Item', id);
        item.sheet.render(true);
    }

    /**
     * Srop the specified weapon to the actor.
     * @param event  The drop event. 
     * @param weapon The weapon item object.
     */
    async _onDropWeapon(event, weapon) {
        if (weapon.system.competence == null) {
            ui.notifications.warn("Le vécu ou la compétence permettant d'utiliser cette arme n'est pas défini.");
        } else {
            await super._onDrop(event);
        }
    }

    /**
     * Create the specified feature.
     * @param purpose The purpose 
     *   - arcane
     *   - chute
     *   - competence
     *   - ka 
     *      * element [air, eau, feu, lune, terre, soleil, ka]
     *   - noyau
     *   - passe
     *   - pavane
     *   - quete
     *   - savoir
     *   - science
     *   - vecu
     * @param event The click event.
     * @returns the instance.
     */
    createFeature(purpose, event) {
        switch (purpose) {
            case '.roll-ka': {
                const element = $(event.currentTarget).closest(purpose).data("element");
                const scope = $(event.currentTarget).closest(purpose).data("scope"); 
                return new AbstractRollBuilder(this.actor).withKa(element).withScope(scope).create();
            }
            case '.roll-science': {
                const key = $(event.currentTarget).closest(".roll-science").data("item"); 
                const item = game.items.find(i => i.type === 'science' && i?.system?.key === key);
                const builder = new AbstractRollBuilder(this.actor).withItem(item);
                return builder.create();
            }
            case '.roll-noyau': {
                const builder = new AbstractRollBuilder(this.actor).withNoyau();
                return builder.create();
            }
            case '.roll-pavane': {
                const builder = new AbstractRollBuilder(this.actor).withPavane();
                return builder.create();
            }
            default: {
                const id = $(event.currentTarget).closest(purpose).data("id");
                const scope = $(event.currentTarget).closest(purpose).data("scope");
                const item = scope == null ? game.items.get(id) : AbstractRoll.actor(this.actor,scope).items.get(id);
                const builder = new AbstractRollBuilder(this.actor).withItem(item);
                if (scope != null) {
                    builder.withScope(scope);
                }
                return builder.create();
            }
        }
    }

}