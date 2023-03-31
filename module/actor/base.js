import { AbstractFeature } from "../../feature/core/abstractFeature.js";
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
     * Activate listeners about the combat panel used by figure and figurant actors.
     * @param html The html content to listen
     */
    activateCombatListeners(html) {

        html.find('div[data-tab="combat"] .armes .open').click(this._onEditEmbeddedEquipment.bind(this));
        html.find('div[data-tab="combat"] .armes .delete.fa-trash').click(this._onDeleteEmbeddedEquipment.bind(this));
        html.find('div[data-tab="combat"] .armes .roll').click(this._onAttack.bind(this));
        html.find('div[data-tab="combat"] .armes .usage').click(this._onUsage.bind(this));
        html.find('div[data-tab="combat"] .armes .aim').click(this._onAim.bind(this));
        html.find('div[data-tab="combat"] .armes .reload').click(this._onReload.bind(this));

        html.find('div[data-tab="combat"] .armures .open').click(this._onEditEmbeddedEquipment.bind(this));
        html.find('div[data-tab="combat"] .armures .delete.fa-trash').click(this._onDeleteEmbeddedEquipment.bind(this));
        html.find('div[data-tab="combat"] .armures .usage').click(this._onUsage.bind(this));

        html.find('div[data-tab="combat"] .etat input').click(this._onEffect.bind(this));

        html.find('div[data-tab="combat"] .macro').each((i, li) => {
            li.setAttribute("draggable", true);
            li.addEventListener("dragstart", event => this.onAddMacro(event), false);
        });

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
    // --------------------------------------------------

    /**
     * Add the specified macro. It can be used to:
     *   - wrestle
     *   - attack with a weapon
     * @param event 
     */
    onAddMacro(event) {

        // Retrieve basic data
        this._onDragStart(event);
        const node = $(event.currentTarget);

        let data = {
            process: "macro",
            type: node.data("macro")
        };

        switch (data.type) {

            // A macro which used an original item
            case 'item':
                data.sid = node.data("sid");
                break;

            // A macro about vecu item
            case 'vecu':
                data.sid = node.data("sid");
                data.id = node.data("id");
                break;

            // A combat macro used to wrestle
            case 'wrestle':
                break;

            case 'weapon':
                data.actor = node.data("actor");
                data.id = node.data("id");
                break;

            // A ka macro
            case 'ka':
                data.id = node.data("id");
                break;

            default:
                return;

        }

        // Add the macro
        event.dataTransfer.setData('text/plain', JSON.stringify(data));

    }

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

    /**
     * Attack with a melee or a ranged weapon.
     * @param event The click event.
     */
    async _onAttack(event) {

        event.preventDefault();
        const li = $(event.currentTarget).parents("li");
        const id = li.data("id");

        // Wrestle roll attack
        if (id === 'wrestle') {
            if (this.actor.lutteCanBePerformed) {
                await new Wrestle(this.actor).initializeRoll();
            }

        // Weapon roll attack
        } else {
            const item = this.actor.getEmbeddedDocument('Item', id);
            if (item?.attackAvailable === true) {
                switch (item.system.type) {
                    case Constants.NATURELLE:
                        await new Naturelle(this.actor, item).initializeRoll();
                        break;
                    case Constants.MELEE:
                        await new Melee(this.actor, item).initializeRoll();
                        break;
                    case Constants.FEU:
                    case Constants.TRAIT:
                        await new Distance(this.actor, item).initializeRoll();
                        break;
                }
            }
        }

    }

    /**
     * Set the usage of the melee or the ranged weapon.
     * @param event The click event.
     */
    async _onUsage(event) {
        event.preventDefault();
        const li = $(event.currentTarget).parents("li");
        const id = li.data("id");
        const item = this.actor.getEmbeddedDocument('Item', id);
        await this.actor.toggleEquipmentUsage(item);
    }

    /**
     * Aim at the specified target.
     * @param event The event to handle.
     */
    async _onAim(event) {
        event.preventDefault();
        const li = $(event.currentTarget).parents("li");
        const id = li.data("id");
        const item = this.actor.getEmbeddedDocument('Item', id);
        const action = new Distance(this.actor, item);
        await new Viser().apply(action);
    }

    /**
     * Reload the specified fire weapon.
     * @param event The event to handle.
     */
    async _onReload(event) {
        event.preventDefault();
        const li = $(event.currentTarget).parents("li");
        const id = li.data("id");
        const item = this.actor.getEmbeddedDocument('Item', id);
        const action = new Distance(this.actor, item);
        await new Recharger().apply(action);
    }

    /**
     * Toggle the specified effect which can be restrain, prone and stun.
     * @param event The event to handle.
     */
    async _onEffect(event) {
        event.preventDefault();
        const etat = $(event.currentTarget).parents(".etat");
        const id = etat.data("id");
        await this.actor.updateEffect(id);
    }

    /**
     * Create the specified feature item.
     * @param event The click event.
     * @returns the new feature.
     */
    _createFeature(event) {
        event.preventDefault();
        const node = $(event.currentTarget).closest('.item');
        const id = node.data('id');
        const sid = node.data('sid');
        let scope = node.data("scope");
        scope = scope == null ? "actor" : scope;
        return new FeatureBuilder(this.actor).withScope(scope).withEmbeddedItem(id).withOriginalItem(sid).create();
    }

    /**
     * Open the specified actor, simulacre or the fraternite.
     * @param event The click event.
     * @returns the instance.
     */
    async _onOpenActor(event) {
        event.preventDefault();
        const id = $(event.currentTarget).closest('.sheet-navigation-tab[data-tab="actor"]').data('id');
        const actor = game.actors.get(id);
        if (actor != null) {
            actor.sheet.render(true);
        }
        return this;
    }

    /**
     * Open the specified embedded item.
     * @param event The click event.
     * @returns the instance.
     */
    async _onOpenItem(event) {
        const feature = this._createFeature(event);
        await feature.edit();
        return this;
    }

}