import { AbstractFeature } from "../../feature/core/AbstractFeature.js";
import { FeatureBuilder } from "../../feature/core/featureBuilder.js";
import { CustomHandlebarsHelpers } from "../common/handlebars.js";
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
    getData() {
        const base = super.getData();
        return {
            owner: this.actor.isOwner,
            editable: this.isEditable,
            isGM: game.user.isGM,
            actor: base.actor,
            system: base.actor.system,
        }
    }

    /**
     * @override
     */
    _updateObject(event, formData) {

        // The system uuid
        if (formData['system.id'] == null || formData['system.id'] === "") {
            formData['system.id'] = CustomHandlebarsHelpers.UUID();
        }

        // Update the actor
        super._updateObject(event, formData);

    }

    /**
     * @override
     */
    activateListeners(html) {
        super.activateListeners(html);
        html.find('div[data-tab="combat"] .equipement .open').click(this._onEditEmbeddedEquipment.bind(this));
        html.find('div[data-tab="combat"] .equipement .delete').click(this._onDeleteEmbeddedEquipment.bind(this));


        
        html.find('div[data-tab="combat"]').on("drop", this._onDrop.bind(this));
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
     * Attack with a melee or a ranged weapon.
     * @param event The click event.
     */
    async _onAttack(event) {

        event.preventDefault();
        const li = $(event.currentTarget).parents(".item");
        const id = li.data("item-id");
        const weapon = this.actor.items.get(id);

        if (weapon?.attackCanBePerformed === true) {
            switch (weapon.system.type) {
                case Constants.NATURELLE:
                    await new Naturelle(this.actor, weapon).initializeRoll();
                    break;
                case Constants.MELEE:
                    await new Melee(this.actor, weapon).initializeRoll();
                    break;
                case Constants.FEU:
                case Constants.TRAIT:
                    await new Distance(this.actor, weapon).initializeRoll();
                    break;
            }
        }

    }

    /**
     * Attack with a wrestle manoeuver.
     * @param event The click event.
     */
    async _onWrestle(event) {
        event.preventDefault();
        if (this.actor.lutteCanBePerformed) {
            await new Wrestle(this.actor).initializeRoll();
        }
    }

    /**
     * @param event The event to handle.
     */
    async _onUseItem(event) {
        event.preventDefault();
        const li = $(event.currentTarget).parents(".item");
        const id = li.data("item-id");
        const item = this.actor.items.get(id);
        await this.actor.useItem(item);
    }

    /**
     * @param event The event to handle.
     */
    async _onParadeItem(event) {
        event.preventDefault();
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
    async _onEffect(id, event) {
        this.actor.updateEffect(id);
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

    /**
     * Delete the specified embedded item.
     * @param event The click event.
     */
    async _onDeleteEmbeddedItem(event) {
        event.preventDefault();
        const id = $(event.currentTarget).closest(".item").data("id");
        const item = this.actor.items.get(id);
        await this.actor.deleteEmbeddedItem(item);
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
        const actor = scope === 'simulacre' ? AbstractFeature.simulacre(this.actor) : this.actor;
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
                return new FeatureBuilder(this.actor).withKa(element).withScope(scope).create();
            }
            case '.roll-science': {
                const key = $(event.currentTarget).closest(".roll").data("item"); 
                const item = game.items.find(i => i.type === 'science' && i?.system?.key === key);
                const builder = new FeatureBuilder(this.actor).withOriginalItem(item.sid);
                return builder.create();
            }
            case '.roll-noyau': {
                const builder = new FeatureBuilder(this.actor).withNoyau();
                return builder.create();
            }
            case '.roll-pavane': {
                const builder = new FeatureBuilder(this.actor).withPavane();
                return builder.create();
            }
            default: {
                const id = $(event.currentTarget).closest(purpose).data("id");
                const scope = $(event.currentTarget).closest(purpose).data("scope");

                if (scope == null) {
                    const item = game.items.get(id);
                    const builder = new FeatureBuilder(this.actor).withOriginalItem(item.sid);
                    return builder.create();
                } else {
                    const item = AbstractFeature.actor(this.actor,scope).items.get(id);
                    const builder = new FeatureBuilder(this.actor).withEmbeddedItem(item.id);
                    builder.withScope(scope);
                    return builder.create();
                }
            }
        }
    }

    /**
     * @param event 
     * @returns the dropped actor.
     */
    static async droppedActor(event) {

        // Retrieve the dropped data id and type from the event
        let data = null;
        if (event.dataTransfer !== undefined) {
            try {
                data = JSON.parse(event.dataTransfer.getData('text/plain'));
            } catch (err) {
                return null;
            }
        }
        if (data === null || data.type !== "Actor") {
            return null;
        };
    
        let dataType = "";
        if (data.type === "Actor") {
            let actorData = {};
            // Case 1 - Import from a Compendium pack
            if (data.pack) {
                dataType = "compendium";
                const pack = game.packs.find(p => p.collection === data.pack);
                const packActor = await pack.getEntity(data.id);
                if (packActor != null) actorData = packActor.data;
            }
    
            // Case 3 - Import from World entity
            else {
                return await fromUuid(data.uuid);
            }
    
            return { from: dataType, data: actorData };
    
        } else {
    
            return null;
        }
    
    }

    // Used by refactoring

    /**
     * Edit the specified embedded equipment item.
     * @param event The click event.
     */
    async _onEditEmbeddedEquipment(event) {
        event.preventDefault();
        const li = $(event.currentTarget).parents("li");
        const id = li.data("id");
        const item = this.actor.getEmbeddedDocument('Item', id);
        item.sheet.render(true);
    }

    /**
     * Delete the specified embedded equipment item.
     * @param event The click event.
     */
    async _onDeleteEmbeddedEquipment(event) {
        event.preventDefault();
        const li = $(event.currentTarget).parents("li");
        const id = li.data("id");
        const item = this.actor.getEmbeddedDocument('Item', id);
        await this.actor.deleteEmbeddedItem(item);
    }

}