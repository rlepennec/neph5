import { Fraternite } from "./fraternite.js";
import { HistoricalSheet } from "../../module/actor/historical.js";

export class FraterniteSheet extends HistoricalSheet {
    
    static DEFAULT_OPTIONS = {
        position: {
            width: 1000,
            height: 800
        },
        // Actions propres à la fraternité. Les actions de périodes
        // (activatePeriode, editPeriode, deletePeriode, deleteEmbedded...) sont
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