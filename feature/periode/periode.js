import { AbstractFeature } from "../core/abstractFeature.js";
import { Incarnations } from "../../feature/incarnation/incarnations.js";
import { Version } from "../../module/common/version.js";
import { EmbeddedItem } from "../../module/common/embeddedItem.js";
import { Fraternite } from "../fraternite/fraternite.js";

export class Periode extends AbstractFeature {

    /**
     * Constructor.
     * @param actor The actor which performs the action.
     * @param item  The original item object. 
     */
    constructor(actor, item) {
        super(actor);
        this.item = item;
        this.embedded = actor.items.find(i => i.sid === item.sid);
    }

    /**
     * @param event The drop event used to move the periode.
     * @returns the instance.
     */
    withEvent(event) {
        this.event = event;
        return this;
    }

    /**
     * @Override
     */
    async drop() {

        // Add a new periode
        if (this.actor.items.find(i => i.sid === this.sid) == null) {
            
            // Insert the first periode or the new periode at the top of the incarnations list if necessary
            const first = new Incarnations(this.actor).premiere();
            if (first != null) {
                await Periode.setPrevious(first, this.sid);
            } else {
                await this.actor.setCurrentPeriode(this.sid) ;
            }

            // Create the new embedded item
            await new EmbeddedItem(this.actor, this.sid)
                .withContext("Drop of a periode")
                .withData("actif", true)
                .withData("previous", null)
                .withoutData('description', 'aube', 'contexte')
                .create();

            // Si déposée sur une période existante, l'insérer à cet endroit
            if (this.event != null) {
                const parentId = this.getParentPeriode(this.event.target);
                if (parentId != null) {
                    await this.moveTo(parentId);
                }
            }

        // Move the current periode below the event described by the event
        } else if (this.event != null) {

            // Retrieve the parent periode in which to drop the periode
            const parentId = this.getParentPeriode(this.event.target);
            if (parentId != null) {
                await this.moveTo(parentId);
            }

        }
    
    }

    /**
     * @param target The event part which describes the html target.
     * @returns the identifier of the embedded periode.
     */
    getParentPeriode(target) {
        if (target == null) return null;
        if (target.getAttribute?.("draggable") === "true") {
            return target.dataset.sid;
        } else {
            return this.getParentPeriode(target.parentElement);
        }
    }

    /**
     * Switch the periode order.
     * @returns the instance.
     */
    async moveTo(parentId) {

        // The target is not a periode
        if (this.actor.items.find(i => i.type === 'periode' && i.sid === parentId) == null) {
            return;
        };

        // The moved item
        const moved = this.actor.items.find(i => i.type === 'periode' && i.sid === this.sid);

        // The old next periode of the moved periode
        const next = new Incarnations(this.actor).suivante(this.sid);

        // The periode which have his new previous periode equal to the moved periode
        const previous = new Incarnations(this.actor).suivante(parentId);

        // A move is done
        if (Version.data(moved).previous !== parentId && moved.sid !== parentId && moved.sid !== previous?.sid) {
            await Periode.setPrevious(next, Version.data(moved).previous);
            await Periode.setPrevious(moved, parentId);
            await Periode.setPrevious(previous, this.sid);
        }
        
        return this;
    }

    /**
     * @param item     The item object to update.
     * @param previous The system identifier of the previous periode.
     */
    static async setPrevious(item, previous) {
        await item?.update({ [Version.path(item, 'previous')]: previous });
    }

    /**
     * @Override
     */
    async delete() {

        // Update actor data, figure or fraternite use chronogical data
        if (this.actor.type === 'figure' || this.actor.type === 'fraternite') {

            // Update the next previous periode
            const next = new Incarnations(this.actor).suivante(this.item.sid);
            if (next != null) {
                await next.update({ [Version.path(next, 'previous')]: Version.data(this.embedded).previous });
            }

            // Remove the current actor periode if necessary
            if (new Incarnations(this.actor).courante === this.item.sid) {
                await this.actor.setCurrentPeriode(null);
            }

        }

        // Delete all related vecus items
        for (let embedded of new Incarnations(this.actor).rattaches(this.item.sid, ['vecu'])) {
            await this.actor.deleteVecu(embedded);
        }

        // Delete other embedded items which are related to the periode
        await this.actor.deleteEmbeddedDocuments('Item', new Incarnations(this.actor).rattaches(this.item.sid).map(i => i.id));

        // Delete the embedded periode item
        await this.actor.deleteEmbeddedDocuments('Item', [AbstractFeature.embedded(this.actor, this.item.sid).id]);

        // Update the members of the fraternite if necessary
        if (this.actor.type === 'fraternite') {
            await new Fraternite(this.actor).onDeletePeriode(this.item);
        }

        // Render the sheet if opened.
        await this.actor.render();

        return this;
    }

    /**
     * Set the specified periode to be active or not.
     * @returns the instance.
     */
    async toggleActive() {
        const actif = Version.data(this.embedded).actif;
        await this.embedded.update({ [Version.path(this.embedded, 'actif')]: !actif });
        return this;
    }

    /**
     * @returns true if the periode is active according to his activation and the current one.
     */
    actif() {
        return new Incarnations(this.actor).estActive(this.sid);
    }

}