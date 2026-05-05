import { CombatantMixinSheet } from "../../module/common/combatantSheetMixin.js";
import { DocumentIdentifier } from "../../module/common/documentIdentifier.js";
import { FeatureBuilder } from "../core/featureBuilder.js";
import { Ka } from "../nephilim/ka.js";
import { Menace } from "../combat/core/menace.js";
import { NephilimActorSheet } from "../../module/actor/nephilimActorSheet.js";
import { NephilimItemSheet } from "../../module/item/nephilimItemSheet.js";
import { OptionsSelector } from "./optionsSelector.js";

export class FigurantSheet extends CombatantMixinSheet(NephilimActorSheet) {

    static DEFAULT_OPTIONS = {
        position: {
            width: 1000,
            height: 800
        },
        dropHandlers: {
            "arme": FigurantSheet._onDropWeapon
        }
    }

    static PARTS = {
        main: {
            template: `systems/neph5e/feature/figurant/figurant.html`,
        }
    }

    static TABS = {
        primary: {
            tabs: [
                {
                    id: "general",
                    template: `systems/neph5e/feature/figurant/combat.hbs`
                },
                { 
                    id: "description",
                    template: `systems/neph5e/feature/figurant/description.hbs`
                }
            ],
            initial: "general"
        },
    }

    async setOptions(theme, degats) {
        await this.document.update({ ['system.options.degatAutomatique']: (degats === "true") });
        if (this.document.system.options.theme !== theme) {
            await this.document.update({ ['system.options.theme']: theme });
            this.render(true);
        }
    }

    /**
     * @override
     */
    async _onDelete(event, target) {
        const identifier = new DocumentIdentifier(target);
        const document = identifier.toDocument();
        console.log("delete " + document.type);
        /*
        switch (document.type) {
            case 'competence':
                await this.document.deleteReference(identifier.fsid, this.document.system.competences, "system.competences");
                break;
        }
                */
    }

    static async _onDropWeapon(event, document) {
        event.preventDefault();
        console.log("DROP weapon");
        console.log(this);
    }


    /**
     * This function catches the drop on a periode. The dropped item can be
     *   - a periode
     *   - a competence
     * @param event    The drop event.
     * @param document The document identifier which has been dropped.
     */
    async _onDrop2(event, document) {
        event.preventDefault();
        console.log(document.type);
        /*
        switch (document.type) {
            
            case "competence":
                await this.document.updateItemRefs(document.system, this.document.system.competences, "system.competences");
                break;
            case "periode":
                await this.document.updateItemRef('periode', document.sid);
                break;
        }
                */
    }

    /**
     * @override
     */
    activateListeners(html) {

        super.activateListeners(html);

        super.activateCombatListeners(html);

        html.find('div[data-tab="combat"] .ka .roll').click(this._onRollKa.bind(this));
        html.find('div[data-tab="combat"] .menace .roll').click(this._onRollMenace.bind(this));
        html.find('div[data-tab="combat"] .vecu .roll').click(this._onRollVecu.bind(this));
        html.find('div[data-tab="combat"] .vecu .open').click(this._onEditVecu.bind(this));
        html.find('div[data-tab="combat"] .vecu .delete').click(this._onDeleteVecu.bind(this));
        html.find('div[data-tab="combat"] .vecu input').change(this._onDegreVecu.bind(this));
        html.find('div[data-tab="combat"] .ressource .roll').click(this._onRollRessource.bind(this));
        html.find('div[data-tab="combat"] .ressource .open').click(this._onEditRessource.bind(this));
        html.find('div[data-tab="combat"] .ressource input').change(this._onDegreRessource.bind(this));
        html.find('div[data-tab="combat"] .ressource .delete').click(this._onDeleteRessource.bind(this));
    }

    /**
     * @override
     */
    get setupable() {
        return true;
    }

    /**
     * @override
     */
    async _onSetup(event, target) {
        await new OptionsSelector()
            .withSheet(this)
            .render(true);
    }

    /**
     * Update the specified vecu.
     * @param event The click event.
     */
    async _onDegreVecu(event) {
        const id = $(event.currentTarget).closest(".vecu").data("id");
        const degre = parseInt(event.currentTarget.value);
        const item = this.actor.items.get(id);
        await item.update({"system.degre": degre});
    }

    /**
     * Roll the specified vecu.
     * @param event The click event.
     */
    async _onRollVecu(event) {
        event.preventDefault();
        const id = $(event.currentTarget).closest(".vecu").data("id");
        const item = this.actor.items.get(id);
        await new FeatureBuilder(this.actor).withScope('actor').withEmbeddedItem(item.id).create().initializeRoll();
    }

    /**
     * Edit the specified item.
     * @param event The click event.
     */
    async _onEditVecu(event) {
        event.preventDefault();
        const id = $(event.currentTarget).closest(".vecu").data("id");
        const item = this.actor.getEmbeddedDocument('Item', id);
        await item.sheet.render(true);
    }

    /**
     * Delete the specified item.
     * @param event The click event.
     */
    async _onDeleteVecu(event) {
        event.preventDefault();
        const id = $(event.currentTarget).closest(".vecu").data("id");
        await this.actor.deleteEmbeddedDocuments('Item', [id]);
    }

    /**
     * Roll the specified ressource.
     * @param event The click event.
     */
    async _onRollRessource(event) {
        event.preventDefault();
        const id = $(event.currentTarget).closest(".ressource").data("id");
        const item = this.actor.items.get(id);
        await new FeatureBuilder(this.actor).withScope('actor').withEmbeddedItem(item.id).create().initializeRoll();
    }

    /**
     * Update the specified ressource.
     * @param event The click event.
     */
    async _onDegreRessource(event) {
        const id = $(event.currentTarget).closest(".ressource").data("id");
        const degre = parseInt(event.currentTarget.value);
        const item = this.actor.items.get(id);
        await item.update({"system.degre": degre});
    }

    /**
     * Edit the specified item.
     * @param event The click event.
     */
    async _onEditRessource(event) {
        event.preventDefault();
        const id = $(event.currentTarget).closest(".ressource").data("id");
        const item = this.actor.getEmbeddedDocument('Item', id);
        await item.sheet.render(true);
    }

    /**
     * Delete the specified item.
     * @param event The click event.
     */
    async _onDeleteRessource(event) {
        event.preventDefault();
        const id = $(event.currentTarget).closest(".ressource").data("id");
        await this.actor.deleteEmbeddedDocuments('Item', [id]);
    }

    /**
     * Drop the specified object.
     * @param event The drop event.
     */
    async _onDrop2(event) {
        event.preventDefault();
        const item = await NephilimItemSheet.droppedItem(event);
        if (item != null && item.hasOwnProperty('system')) {

            // Check if the tab is compliant with the item to drop
            const currentTab = $(event.currentTarget).find("div.tab.active").data("tab");
            const tabs = this._droppableTabs(item.type);
            if (tabs.includes(currentTab) !== true) {
                return false;
            }

            // Process the drop
            switch(item.type) {
                case 'arme':
                    await super._onDropWeapon(event, item);
                    break;
                case 'armure':
                    await super._onDrop(event);
                    break;
                case 'vecu':
                    await new FeatureBuilder(this.actor)
                        .withOriginalItem(item.sid)
                        .withEvent(event)
                        .withPeriode(item.system.periode)
                        .create()
                        .drop();
                case 'passe':
                    await new FeatureBuilder(this.actor)
                        .withOriginalItem(item.sid)
                        .withEvent(event)
                        .create()
                        .drop();
                    break;
            }
        }

    }

    /**
     * @param type The type of item to drop.
     * @returns the tabs on which the item can be dropped.
     */
    _droppableTabs(type) {
        switch (type) {
            case 'arme':
            case 'armure':
            case 'vecu':
            case 'passe':
                return ['combat'];
            default:
                return [];
        }
    }

    // ---------------------------------------- Roll handlers ----------------------------------------

    async _onRollKa(event) {
        return await new Ka(this.actor, null, null).initializeRoll();
    }

    async _onRollMenace(event) {
        return await new Menace(this.actor).initializeRoll();
    }

}