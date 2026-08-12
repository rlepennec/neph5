import { NephilimActorSheet } from "./nephilimActorSheet.js";
import { FeatureBuilder } from "../../feature/core/featureBuilder.js";
import { NephilimItemSheet } from "../item/nephilimItemSheet.js";

export class HistoricalSheet extends NephilimActorSheet {

    static DEFAULT_OPTIONS = {
        actions: {
            displayPeriode: HistoricalSheet._onDisplayPeriode,
            currentPeriode: HistoricalSheet._onCurrentPeriode,
            deletePeriode: HistoricalSheet._onDeletePeriode,
            activatePeriode: HistoricalSheet._onActivatePeriode,
            deleteEmbedded: HistoricalSheet._onDeleteEmbedded,
            openItem: HistoricalSheet._onOpenItem
        },
        dropHandlers: {
            periode: HistoricalSheet._onDropPeriode,
            ...Object.fromEntries(
                ['vecu', 'savoir', 'quete', 'arcane', 'chute', 'science', 'passe', 'capacite',
                'sort', 'invocation', 'formule', 'rite', 'ordonnance', 'appel', 'habitus',
                'pratique', 'rituel', 'technique', 'tekhne', 'atlanteide', 'dracomachie', 'divination']
                    .map(t => [t, HistoricalSheet._onDropFeature])
            )
        }
    }

    /**
     * @constructor
     * @param args
     */
    constructor(...args) {
        super(...args);
        this.elapsedPeriodes = this._elapsedPeriodes();
    }

    /**
     * La période en édition est la période courante de l'acteur, dès lors que la fiche
     * est déverrouillée. Il n'y a plus de sélection manuelle : déverrouiller la fiche
     * met la période courante en édition, et les items déposés lui sont rattachés.
     * @returns {string|null} le sid de la période éditée, null si la fiche est verrouillée.
     */
    get editedPeriode() {
        return this.locked ? null : this.document.system.periode;
    }

    /**
     * @override
     */
    async _prepareContext(options) {
        const context = await super._prepareContext(options);
        context.actor = this.document;            // incarnations.hbs lit "actor.*"
        context.editedPeriode = this.editedPeriode;
        context.elapsedPeriodes = this.elapsedPeriodes;
        return context;
    }

    /**
     * @param event The drop event.
     * @returns the dropped object. 
     */
    async droppedObject(event) {
        event.preventDefault();
        let object = await NephilimItemSheet.droppedItem(event);
        if (object != null) {
            return {'type': 'item', 'object': object};
        }
        object = await NephilimActorSheet.droppedActor(event);
        if (object != null) {
            return {'type': 'actor', 'object': object};
        }
        return null;
    }

    static async _onDropFeature(event, document) {
        await new FeatureBuilder(this.document)
            .withOriginalItem(document.sid)
            .withEvent(event)
            .withPeriode(this.editedPeriode)
            .create()
            .drop();
        await this.render(true);
    }

    /**
     * Edit the specified feature.
     * @param feature The purpose of the edition.
     * @param event   The click event.
     * @returns the instance.
     */
    async _onEditFeature(feature, event) {
        event.preventDefault();
        await this.createFeature(".edit-" + feature, event).edit();
        return this;
    }
   
    /**
     * Set the current periode.
     * @param event The click event.
     */
    static async _onCurrentPeriode(event, target) {
        const sid = target.closest('.item').dataset.sid;
        await this.document.setCurrentPeriode(sid);
        await this.render(true);
    }

    /**
     * @return the system identifiers of all periodes if option has been set.
     */
    _elapsedPeriodes() {
        return this.document.system.options.incarnationsOuvertes === true ? this.document.items.filter(i => i.type === 'periode').map(i => i.sid) : [];
    }

    static async _onDeleteEmbedded(event, target) {
        const id = target.closest('.item').dataset.id;
        const item = this.document.items.get(id);
        await this.document.deleteEmbeddedItem(item);
    }

    /**
     * Delete the specified periode.
     * @param event The click event.
     */
    static async _onDeletePeriode(event, target) {

        // Retrieve the data
        const sid = target.closest('.item').dataset.sid;
        const original = game.items.find(i => i.sid === sid);

        // Update the periode edition options
        this.editedPeriode = this.editedPeriode === sid ? null : this.editedPeriode;
        this.elapsedPeriodes = this.elapsedPeriodes.filter(i => i !== sid);

        // Used to remove vecus & combat options
        await this.document.deletePeriode(original.sid);
    }

    /**
     * Set the activated status status of the specified periode.
     * Only GM can activate or deactivate a periode manually.
     * @param event The click event. 
     */
    static async _onActivatePeriode(event, target) {
        const sid = target.closest('.item').dataset.sid;
        await new FeatureBuilder(this.document).withOriginalItem(sid).create().toggleActive();
        await this.render(true);
    }

    /**
     * Show or hide the specified periode.
     * @param event The click event.
     */
    static async _onDisplayPeriode(event, target) {
        const sid = target.closest('.item').dataset.sid;
        if (this.elapsedPeriodes.includes(sid)) {
            this.elapsedPeriodes = this.elapsedPeriodes.filter(i => i !== sid);
        } else {
            this.elapsedPeriodes.push(sid);
        }
        await this.render(true);
    }

    static async _onDropPeriode(event, document) {
        await new FeatureBuilder(this.document)
            .withOriginalItem(document.sid)
            .withEvent(event)
            .create()
            .drop();
        await this.render(true);
    }

    /**
     * Set the degre in the embedded item.
     * @param event The click event.
     */
    async _onChangeDegre(event) {
        const el = event.currentTarget;
        const id = el.closest('.item').dataset.id;
        const item = this.document.items.get(id);
        const converted = parseInt(el.value);
        const system = foundry.utils.duplicate(item.system);
        system.degre = isNaN(converted) ? 0 : converted;
        await item.update({ system });
    }

    /**
     * [Partagé figure/fraternité] Résout la feature à partir de l'élément .item ciblé.
     */
    _featureFromTarget(target) {
        const node = target.closest('.item');
        const id = node.dataset.id;
        const sid = node.dataset.sid;
        const scope = node.dataset.scope ?? "actor";
        return new FeatureBuilder(this.document)
            .withScope(scope)
            .withEmbeddedItem(id)
            .withOriginalItem(sid)
            .create();
    }

    /** Ouvre la fiche de l'item (vécu, savoir, quête, compétence...). */
    static async _onOpenItem(event, target) {
        const feature = this._featureFromTarget(target);
        await feature.editEmbeddedItem();
    }

    /** @override */
    async _onRender(context, options) {
        await super._onRender(context, options);
        for (const el of this.element.querySelectorAll('.set')) {
            el.addEventListener('change', this._onChangeDegre.bind(this));
        }
    }

}