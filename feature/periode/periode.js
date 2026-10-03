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

        // Une incarnation de figure se crée en déposant un vécu : elle en prend la période.
        // Une fraternité, qui ne vit pas de vécus, incarne directement la période déposée.
        const incarnations = new Incarnations(this.actor);
        if (Incarnations.AVEC_VECU.includes(this.actor.type)) {
            ui.notifications.warn("Une incarnation se crée en déposant un vécu");
            return;
        }
        const cle = await incarnations.ajouter(this.sid);

        // Si déposée sur une incarnation existante, l'insérer à cet endroit
        if (cle != null && this.event != null) {
            const parent = this.getParentPeriode(this.event.target);
            if (parent != null) {
                await incarnations.deplacer(cle, parent);
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