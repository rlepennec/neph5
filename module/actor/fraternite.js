import { FeatureBuilder } from "../../feature/core/featureBuilder.js";
import { Fraternite } from "../../feature/fraternite/fraternite.js";
import { HistoricalSheet } from "./historical.js";

export class FraterniteSheet extends HistoricalSheet {

    /**
     * @constructor
     * @param args
     */
    constructor(...args) {
        super(...args);
    }

    /**
     * @return the path of the specified actor sheet.
     */
    get template() {
        return 'systems/neph5e/templates/actor/fraternite.html';
    }

    /**
     * @override
     */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            width: 1000,
            height: 800,
            classes: ["nephilim", "sheet", "actor"],
            resizable: true,
            scrollY: [
                ".tab.general",
                ".tab.effectif",
                ".tab.vecus",
                ".tab.connaissances",
                ".tab.incarnations",
                ".tab.options"],
            tabs: [
                {
                    navSelector: ".sheet-navigation",
                    contentSelector: ".article-body",
                    initial: "general"
                }]
        });
    }

    /**
     * @override
     */
    activateListeners(html) {

        super.activateListeners(html);

        super.activateOptionListeners(html);

        // Effectif
        html.find('div[data-tab="effectif"] .open').click(this._onEditActor.bind(this));

        // Connaissances
        html.find('div[data-tab="vecus"] .vecu .open').click(this._onEditOriginalItem.bind(this));

        // Ressources
        html.find('div[data-tab="ressources"] .open').click(this._onEditOriginalItem.bind(this));

        // Historique
        html.find('div[data-tab="incarnations"]').on("drop", this._onDrop.bind(this));
        html.find('div[data-tab="incarnations"] .activate').click(this._onActivatePeriode.bind(this));
        html.find('div[data-tab="incarnations"] .set').change(this._onChangeDegre.bind(this));
        html.find('div[data-tab="incarnations"] .display').click(this._onDisplayPeriode.bind(this));
        html.find('div[data-tab="incarnations"] .edit').click(this._onEditPeriode.bind(this));
        html.find('div[data-tab="incarnations"] .define').click(this._onCurrentPeriode.bind(this));
        html.find('div[data-tab="incarnations"] .open').click(this._onOpenItem.bind(this));
        html.find('div[data-tab="incarnations"] .periode-header .delete').click(this._onDeletePeriode.bind(this));
        html.find('div[data-tab="incarnations"] .vecu .delete').click(this._onDeleteEmbeddedItem.bind(this));
        html.find('div[data-tab="incarnations"] .focus .delete').click(this._onDeleteEmbeddedItem.bind(this));
        html.find('div[data-tab="incarnations"] .member .delete').click(this._onDeleteActor.bind(this));

        // Options
        html.find('div[data-tab="options"] .incarnationsOuvertes').change(this._onChangePeriodesDisplay.bind(this));

    }

    /**
     * Edit the specified original item from embedded item.
     * @param event The click event.
     */
    async _onEditOriginalItem(event) {
        event.preventDefault();
        const sid = $(event.currentTarget).closest(".item").data("sid");
        const item = game.items.find(i => i.sid === sid);
        item?.sheet.render(true);
    }

    /**
     * Edit the actor.
     * @param event The click event.
     */
    async _onEditActor(event) {
        event.preventDefault();
        const id = $(event.currentTarget).closest(".item").data("id");
        const actor = game.actors.get(id);
        await actor.sheet.render(true);
    }

    /**
     * Delete the actor.
     * @param event The click event.
     */
    async _onDeleteActor(event) {
        event.preventDefault();
        const id = $(event.currentTarget).closest(".actor").data("id");
        const actor = game.actors.get(id);
        const periode = $(event.currentTarget).closest(".periode").data("sid");
        await new Fraternite(this.actor).deleteMember(actor, periode);
    }

    /**
     * Drop the specified object.
     * @param event The drop event.
     */
    async _onDrop(event) {

        // Catch and retrieve the dropped item
        event.preventDefault();
        const dropped = await super.droppedObject(event);
        switch (dropped?.type) {
            case 'item':
                const item = dropped.object;
                if (item.hasOwnProperty('system')) {

                    // Check if the tab is compliant with the item to drop
                    const currentTab = $(event.currentTarget).find("div.tab.active").data("tab");
                    const tabs = this._droppableTabs(item.type);
                    if (tabs.includes(currentTab) !== true) {
                        return false;
                    }

                    // Drop the new resource
                    switch(item.type) {
                        case 'periode':
                            await new FeatureBuilder(this.actor)
                                .withOriginalItem(item.sid)
                                .withEvent(event)
                                .withPeriode(this.editedPeriode)
                                .create()
                                .drop();
                            break;
                        case 'chute':
                        case 'passe':
                        case 'quete':
                        case 'savoir':
                        case 'science': {
                            const periode = this.editedPeriode;
                            if (periode != null) {
                                await new FeatureBuilder(this.actor)
                                    .withOriginalItem(item.sid)
                                    .withEvent(event)
                                    .withPeriode(periode)
                                    .create()
                                    .drop();
                            }
                            break;
                        }
                        case 'sort':
                        case 'invocation':
                        case 'formule':
                        case 'habitus':
                        case 'rite':
                        case 'appel': {
                            if (this.editedPeriode != null) {
                                await new FeatureBuilder(this.actor)
                                    .withOriginalItem(item.sid)
                                    .withPeriode(this.editedPeriode)
                                    .create()
                                    .drop();
                            }
                            break;
                        }
                    }
                }
                break;

            case 'actor':
                const actor = dropped.object;
                switch (actor?.type) {

                    // Drop the new member
                    case 'figurant':
                    case 'figure':
                        const periode = this.editedPeriode;
                        if (periode != null) {
                            await new Fraternite(this.actor).addMember(event, actor, periode, Fraternite.DEFAULT_STATUS);
                        }
                        break;

                }
                break;
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
            case 'competence':
                return ['combat'];
            case 'alchimie':
                return ['alchimie'];
            case 'aspect':
                return ['selenim'];
            case 'magie':
                return ['magie'];
            case 'catalyseur':
            case 'materiae':
                return ['laboratoire'];
            case 'metamorphe':
                return ['nephilim'];
            case 'vecu':
                return ['combat','incarnations'];
            case 'periode':
            case 'appel':
            case 'arcane':
            case 'chute':
            case 'formule':
            case 'invocation':
            case 'ordonnance':
            case 'passe':
            case 'pratique':
            case 'quete':
            case 'rite':
            case 'savoir':
            case 'science':
            case 'sort':
            case 'habitus':
                return ['incarnations'];
            default:
                return [];
        }
    }

}