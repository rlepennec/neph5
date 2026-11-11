import { CombatantMixinSheet } from "../../../../module/common/regles/v5/combatantSheetMixin.js";
import { DocumentIdentifier } from "../../../../module/common/documentIdentifier.js";
import { FeatureBuilder } from "../../../core/regles/v5/featureBuilder.js";
import { Ka } from "../../../nephilim/regles/v5/pentacle.js";
import { Menace } from "../../../combat/regles/v5/core/menace.js";
import { FicheActeurV5 } from "../../../../module/actor/regles/v5/ficheActeurV5.js";
import { OptionsSelector } from "./optionsSelector.js";

export class FigurantSheet extends CombatantMixinSheet(FicheActeurV5) {

    static DEFAULT_OPTIONS = {
        actions: {
            rollKa: FigurantSheet._onRollKa,
            rollMenace: FigurantSheet._onRollMenace,
            rollVecu: FigurantSheet._onRollVecu
        },
        deleteHandlers: {
            "passe": FicheActeurV5._onDeleteItem,
            "vecu": FicheActeurV5._onDeleteItem
        },
        dropHandlers: {
            "passe": FicheActeurV5._onDropItem,
            "vecu": FicheActeurV5._onDropItem
        }
    }

    static PARTS = {
        main: {
            template: `systems/neph5e/feature/figurant/regles/v5/figurant.html`,
        }
    }

    static TABS = {
        primary: {
            tabs: [
                {
                    id: "general",
                    template: `systems/neph5e/feature/figurant/regles/v5/combat.hbs`
                },
                { 
                    id: "description",
                    template: `systems/neph5e/feature/figurant/regles/v5/description.hbs`
                }
            ],
            initial: "general"
        },
    }

    /**
     * @override
     */
    get optionsSelector() {
        return OptionsSelector;
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