import { AbstractFeature } from "../core/abstractFeature.js";
import { Incarnations } from "../../feature/incarnation/incarnations.js";
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
            
            // Insert the new periode at the top of the incarnations list
            await new Incarnations(this.actor).ajouter(this.sid);

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
        await new Incarnations(this.actor).deplacer(this.sid, parentId);
        return this;
    }

    /**
     * @Override
     */
    async delete() {

        // Remove the periode, everything attached to it, and mend the chain
        await new Incarnations(this.actor).retirer(this.item.sid);

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
        await new Incarnations(this.actor).basculer(this.sid);
        return this;
    }

    /**
     * @returns true if the periode is active according to his activation and the current one.
     */
    actif() {
        return new Incarnations(this.actor).estActive(this.sid);
    }

}