import { Fraternite } from "./fraternite.js";
import { HistoricalSheet } from "../../module/actor/historical.js";
import { OptionsSelector } from "./optionsSelector.js";

export class FraterniteSheet extends HistoricalSheet {
    
    static DEFAULT_OPTIONS = {
        // Actions propres à la fraternité. Les actions de périodes
        // (activatePeriode, deletePeriode, deleteEmbedded...) sont
        // héritées d'HistoricalSheet, et delete/open/lock/select/setup du mixin.
        actions: {
            editActor: FraterniteSheet._onEditActor,
            deleteActor: FraterniteSheet._onDeleteActor,
            editOriginalItem: FraterniteSheet._onEditOriginalItem
        },
        // Les drops d'items (periode, vécu, savoir, focus...) sont hérités
        // d'HistoricalSheet. Ici, seuls les acteurs membres sont ajoutés.
        dropHandlers: {
            figure: FraterniteSheet._onDropMember,
            figurant: FraterniteSheet._onDropMember
        }
    }

    static PARTS = {
        main: {
            template: `systems/neph5e/feature/fraternite/fraternite.html`,
        }
    }

    static TABS = {
        primary: {
            tabs: [
                { 
                    id: "description",
                    template: `systems/neph5e/feature/fraternite/description.hbs`
                },
                { 
                    id: "effectif",
                    template: `systems/neph5e/feature/fraternite/effectif.hbs`
                },
                { 
                    id: "connaissances",
                    template: `systems/neph5e/feature/fraternite/connaissances.hbs`
                },
                { 
                    id: "ressources",
                    template: `systems/neph5e/feature/fraternite/ressources.hbs`
                },
                { 
                    id: "incarnations",
                    template: `systems/neph5e/feature/fraternite/incarnations.hbs`
                },
            ],
            initial: "general"
        }
    }

    /**
     * @override
     */
    get optionsSelector() {
        return OptionsSelector;
    }

    /**
     * Signale à l'ouverture les membres de l'effectif dont l'acteur est introuvable.
     * La fiche s'ouvre quand même : ces membres ne sont pas affichés.
     * @override
     */
    async _onFirstRender(context, options) {
        await super._onFirstRender(context, options);
        const introuvables = new Fraternite(this.document).membresIntrouvables();
        if (introuvables.length > 0) {
            console.error("Nephilim | Fraternité « " + this.document.name + " » : membre(s) introuvable(s) dans le monde", introuvables);
            ui.notifications.error("La fraternité « " + this.document.name + " » référence " + introuvables.length
                + " membre(s) introuvable(s) dans le monde. Ils ne sont pas affichés. Détail dans la console (F12).");
        }
    }

    /**
     * Edit the specified original item from embedded item.
     * @param event The click event.
     */
    static async _onEditOriginalItem(event, target) {
        const sid = target.closest(".item")?.dataset.sid;
        const item = game.items.find(i => i.sid === sid);
        item?.sheet.render(true);
    }

    /**
     * Edit the actor.
     * @param event The click event.
     */
    static async _onEditActor(event, target) {
        const id = target.closest(".item")?.dataset.id;
        const actor = game.actors.get(id);
        await actor?.sheet.render(true);
    }

    /**
     * Delete the actor.
     * @param event The click event.
     */
    static async _onDeleteActor(event, target) {
        if (this.locked) return;
        const id = target.closest(".actor")?.dataset.id;
        const actor = game.actors.get(id);
        const periode = target.closest(".periode")?.dataset.sid;
        await new Fraternite(this.document).deleteMember(actor, periode);
    }

    /**
     * Ajoute un acteur (figure/figurant) comme membre de la fraternité.
     * Les drops d'items (periode, vécu, savoir, focus...) sont hérités d'HistoricalSheet.
     */
    static async _onDropMember(event, document) {
        const periode = this.editedPeriode;
        if (periode != null) {
            await new Fraternite(this.document).addMember(event, document, periode, Fraternite.DEFAULT_STATUS);
        }
    }

}