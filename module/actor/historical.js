import { AbstractRollBuilder } from "../../feature/core/AbstractRollBuilder.js";
import { BaseSheet } from "./base.js";
import { NephilimItemSheet } from "../item/base.js";

export class HistoricalSheet extends BaseSheet {

    /**
     * @constructor
     * @param args
     */
    constructor(...args) {
        super(...args);
        this.editedPeriode = null;
        this.elapsedPeriodes = this._elapsedPeriodes();
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


    //////
   
    /**
     * Set the current periode.
     * @param event The click event.
     */
    async _onCurrentPeriode(event) {
        event.preventDefault();
        const sid = $(event.currentTarget).closest('.item').data('sid');
        await this.actor.setCurrentPeriode(sid);
    }

    /**
     * Refresh the periodes details according to the option update.
     * @param event The click event.
     */
    async _onChangePeriodesDisplay(event) {
        event.preventDefault();
        const checked = $(event.currentTarget).closest(".incarnationsOuvertes").is(':checked');
        await this.actor.update({ ['system.options.incarnationsOuvertes']: checked });
        this.elapsedPeriodes = this._elapsedPeriodes();
        await this.render(true);
    }

    /**
     * @return the system identifiers of all periodes if option has been set.
     */
    _elapsedPeriodes() {
        return this.actor.system.options.incarnationsOuvertes === true ? this.actor.items.filter(i => i.type === 'periode').map(i => i.sid) : [];
    }

    /**
     * Set the edition status of the specified periode.
     * Only one periode can be edited at once.
     * @param event The click event.
     */
    async _onEditPeriode(event) {
        event.preventDefault();
        const sid = $(event.currentTarget).closest('.item').data('sid');
        this.editedPeriode = this.editedPeriode === sid ? null : sid;
        await this.render(true);
    }

    /**
     * Set the activated status status of the specified periode.
     * Only GM can activate or deactivate a periode manually.
     * @param event The click event. 
     */
    async _onActivatePeriode(event) {
        event.preventDefault();
        const sid = $(event.currentTarget).closest('.item').data('sid');
        const item = this.actor.items.find(i => i.sid === sid);
        await new AbstractRollBuilder(this.actor).withItem(item).create().toggleActive();
    }

    /**
     * Show or hide the specified periode.
     * @param event The click event.
     */
    async _onDisplayPeriode(event) {
        event.preventDefault();
        const root = $(event.currentTarget).closest('.item');
        const sid = root.data('sid');
        const node = root.find('.periode-body').first();
        if (node.css('display') !== 'none') {
            this.elapsedPeriodes = this.elapsedPeriodes.filter(i => i !== sid);
            node.attr("style", "display: none;");
        } else {
            this.elapsedPeriodes.push(sid);
            node.removeAttr("style");
        }
    }

    /**
     * Set the degre in the embedded item.
     * @param event The click event.
     */
    async _onChangeDegre(event) {
        event.preventDefault();
        const id = $(event.currentTarget).closest(".item").data("id");
        const item = this.actor.items.get(id);
        const value = $(event.currentTarget).closest(".change-degre").val();
        const system = duplicate(item.system);
        const converted = parseInt(value);
        system.degre = isNaN(converted) ? 0 : converted;
        await item.update({ ['system']: system });
    }

}