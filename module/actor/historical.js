import { AbstractRollBuilder } from "../../feature/core/abstractRollBuilder.js";
import { BaseSheet } from "./base.js";
import { NephilimItemSheet } from "../item/base.js";
import { Periode } from "../../feature/periode/periode.js";

export class HistoricalSheet extends BaseSheet {

    /**
     * @constructor
     * @param args
     */
    constructor(...args) {
        super(...args);
        this.editedPeriode = null;
        this.elapsedPeriodes = this._initialElapsedPeriodes();
    }

    /**
     * @override
     */
    getData() {
        return mergeObject(super.getData(), {
            editedPeriode: this.editedPeriode,
            elapsedPeriodes: this.elapsedPeriodes,
        });
    }

    /**
     * @return the elapsed periodes according to the user option and the history.
     */
    _initialElapsedPeriodes() {
        if (this.actor.system.options.incarnationsOuvertes == true) {
            return Periode.getOriginals(this.actor)
        } else {
            return [];
        }
    }

    /**
     * Set the degre in the linked item.
     * @param event The click event.
     */
    async _onChangeDegre(event) {
        event.preventDefault();
        const id = $(event.currentTarget).closest(".change-degre").data("id");
        const item = this.actor.items.get(id);
        const value = $(event.currentTarget).closest(".change-degre").val();
        const system = duplicate(item.system);
        const converted = parseInt(value);
        system.degre = isNaN(converted) ? 0 : converted;
        await item.update({ ['system']: system });
    }

    /**
     * Edit or unedit the specified periode.
     * @param event The click event.
     */
    async _onEditPeriode(event) {
        event.preventDefault();
        const feature = this.createFeature(".item", event);
        this.editedPeriode = this.editedPeriode === feature.sid ? null : feature.sid;
        await this.render(true);
    }

    /**
     * Delete the specified periode.
     * @param event The click event.
     */
    async _onDeletePeriode(event) {

        event.preventDefault();

        // Retrieve the data
        const feature = this.createFeature(".item", event);
        const periode = this.actor.items.find(i => i.sid === feature.item.sid);

        // Update the periode edition options
        this.editedPeriode = this.editedPeriode === feature.sid ? null : this.editedPeriode;
        this.elapsedPeriodes = this.elapsedPeriodes.filter(i => i !== feature.item.id);

        // Used to remove vecus & combat options
        await this.actor.deletePeriode(periode);

    }

    /**
     * Set the specified current periode.
     * @param event The click event.
     */
    async _onCurrentPeriode(event) {
        event.preventDefault();
        const feature = this.createFeature(".item", event);
        await this.actor.setCurrentPeriode(feature.sid);
    }

    /**
     * Show or hide the specified feature.
     * @param event The click event.
     */
    async _onDisplayPeriode(event) {
        event.preventDefault();
        const node = $(event.currentTarget).parent().next();
        const id = node.data('id');
        await this._updateDisplayPeriode(node, id);
    }

    /**
     * Active or deactive the specified periode.
     * @param event The click event. 
     */
    async _onToggleActivePeriode(event) {
        event.preventDefault();
        const id = $(event.currentTarget).closest(".active-periode").data("id");
        const item = game.items.get(id);
        await new AbstractRollBuilder(this.actor).withItem(item).create().toggleActive();
    }

    /**
     * Used to elapse or colapse all periodes in incarnations.
     * @param event The click event.
     */
    async _onChangePeriodesDisplay(event) {
        event.preventDefault();
        const checked = $(event.currentTarget).closest(".incarnationsOuvertes").is(':checked');
        await this.actor.update({ ['system.options.incarnationsOuvertes']: checked });
        this.elapsedPeriodes = this._initialElapsedPeriodes();
        await this.render(true);
    }

    /**
     * @param id   The identifier of the periode to display or to show.
     * @param node The node on which to update the periode.
     */
    async _updateDisplayPeriode(node, id) {
        if (node.css('display') !== 'none') {
            this.elapsedPeriodes = this.elapsedPeriodes.filter(i => i !== id);
            node.attr("style", "display: none;");
        } else {
            this.elapsedPeriodes.push(id);
            node.removeAttr("style");
        }
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
        object = await BaseSheet.droppedActor(event);
        if (object != null) {
            return {'type': 'actor', 'object': object};
        }
        return null;
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

}