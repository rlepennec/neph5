import { AbstractRoll } from "../core/abstractRoll.js";
import { EmbeddedItem } from "../../module/common/embeddedItem.js";

export class Periode extends AbstractRoll {

    /**
     * Constructor.
     * @param actor The actor which performs the action.
     * @param item  The embedded item object, purpose of the action. 
     */
    constructor(actor, item) {
        super(actor);
        this.item = item;
        this.event = null;
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
            const first = this.actor.items.find(i => i.type === 'periode' && i.system.previous === null);
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

        // The moved item
        const moved = this.actor.items.find(i => i.type === 'periode' && i.sid === this.sid);

        // The old next periode of the moved periode
        const next = this.actor.items.find(i => i.type === 'periode' && i.system.previous === this.sid);

        // The periode wich have his new previous periode equal to the moved periode
        const previous = this.actor.items.find(i => i.type === 'periode' && i.system.previous === parentId);

        // A move is done
        if (moved.system.previous !== parentId && moved.sid !== parentId) {
            await Periode.setPrevious(next, moved.system.previous);
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
        await item?.update({ ['system.previous']: previous });
    }

    /**
     * @Override
     */
    async delete() {

        // Update the next previous periode
        const next = this.actor.items.find(i => i.type === 'periode' && i.system.previous === this.sid);
        if (next != null) {
            const system = duplicate(next.system);
            system.previous = AbstractRoll.embedded(this.actor, this.sid).system.previous;
            await next.update({ ['system']: system });
        }

        // Delete the periode and the linked items
        await this.actor.deleteEmbeddedDocuments('Item', this.actor.items.filter(i => i.system?.periode === this.sid).map(i => i.id));
        await this.actor.deleteEmbeddedDocuments('Item', [AbstractRoll.embedded(this.actor, this.sid).id]);

        return this;
    }

    /**
     * Set the specified periode to be active or not.
     * @returns the instance.
     */
    async toggleActive() {
        const embedded = AbstractRoll.embedded(this.actor, this.sid);
        await embedded.update({ ['system.actif']: !embedded.system.actif });
        return this;
    }

    /**
     * @returns true if the periode is active according to his activation and the current one.
     */
    actif() {
        return Periode.getSorted(this.actor, true, true, this.actor.system.periode).find(i => i.sid === this.sid) != null;
    }

    /**
     * @param actor  The actor object.
     * @param chrono True for chronologic order, false for antichronologic, null for display order.
     * @param actif  True if only active periode, false for only passive, null for all.
     * @param last   The identifier of the last periode included, null if no limit.
     * @returns an sorted array of periodes items objects.
     */
    static getSorted(actor, chrono, actif, last) {

        // Retrieve if the display order must be inverted
        const inverse = ((chrono === true && actor.system.options.chronologieDescendante === false)
                      || (chrono === false && actor.system.options.chronologieDescendante === true));

        // Retrieve periodes in display order
        let periodes = [];
        let previous = null;
        let found = false;

        while (true) {

            // Retrieve the next periode
            const p = actor.items.find(i => i.type === 'periode' && i.system.previous === previous);

            // Stop if the last periode
            if (p == null) {
                break;
            }

            // Check if the last periode
            if (last != null && found === false && last === p.sid) {
                found = true;
            }

            // Skip the first periodes to the last if inverse order
            if (inverse === true && found === false) {
                previous = p.sid;
                continue;
            }

            // Add periode if required
            if (actif == null || last === p.sid || p.system.actif === actif) {
                periodes.push(p);
            }

            // Skip the last periodes if the last and normal order
            if (inverse === false && found === true && last === p.sid) {
                break;
            }

            previous = p.sid;
        }

        // Sort the periodes according to the order 
        if (inverse === true) {
            periodes = periodes.reverse();
        }

        return periodes;

    }

    /**
     * @param actor The actor object.
     * @returns the periodes and each linked items to display in the character sheet.
     */
    static getAll(actor) {

        // Sort periodes to display
        const periodes = Periode.getSorted(actor, null, null);

        // Process periodes to display.
        const all = [];
        for (let p of periodes) {

            const periode = AbstractRoll.original(p.sid);
            if (periode == null) {
                continue;
            }

            // Create all linked items
            const items = [];
            for (let type of ['vecu','savoir','quete','arcane','chute','science', 'passe']) {
                for (let i of actor.items.filter(i => i.system?.periode === p.sid && i.type === type)) {
                    const original = AbstractRoll.original(i.sid);
                    if (original != null) {
                        items.push({
                            name: original.name,
                            type: original.type,
                            id: i.id,
                            wid: original.id,
                            sid: i.sid,
                            degre: i.system.degre
                        });
                    }
                }
            }
            for (let type of ['sort','invocation','formule','rite','ordonnance','appel']) {
                for (let i of actor.items.filter(i => i.system?.periode === p.sid && i.type === type)) {
                    const original = AbstractRoll.original(i.sid);
                    if (original != null) {
                        items.push({
                            name: original.name,
                            type: original.type,
                            id: i.id,
                            wid: original.id,
                            sid: i.sid
                        });
                    }
                }
            }

            // Push the new periode
            all.push({
                original: {
                    name: periode.name,
                    id: periode.id,
                    sid: periode.sid,
                    contexte: periode.system.contexte,
                },
                embedded: {
                    id: p.id,
                    actif: p.system.actif,
                    items: items
                }
            });

        }

        return all;

    }

}