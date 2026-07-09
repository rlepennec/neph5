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
        actions: {
            rollKa: FigurantSheet._onRollKa,
            rollMenace: FigurantSheet._onRollMenace,
            rollVecu: FigurantSheet._onRollVecu
        },
        deleteHandlers: {
            "passe": NephilimActorSheet._onDeleteItem,
            "vecu": NephilimActorSheet._onDeleteItem
        },
        dropHandlers: {
            "passe": NephilimActorSheet._onDropItem,
            "vecu": NephilimActorSheet._onDropItem
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

    async setOptions(options) {
        await this.document.update({
            'system.options.theme': options.theme,
            'system.options.degatAutomatique': options.degatAutomatique
        });
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

    static async _onRollKa(event, target) {
        return await new Ka(this.document, null, null).initializeRoll();
    }

    static async _onRollMenace(event, target) {
        return await new Menace(this.document).initializeRoll();
    }

    static async _onRollVecu(event, target) {
        event.preventDefault();
        const document = new DocumentIdentifier(target).toDocument();
        await new FeatureBuilder(this.document)
            .withScope('actor')
            .withEmbeddedItem(document.id)
            .create()
            .initializeRoll();
    }

}