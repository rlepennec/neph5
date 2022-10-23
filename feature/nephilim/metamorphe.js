import { AbstractRoll } from "../core/abstractRoll.js";
import { EmbeddedItem } from "../../module/common/embeddedItem.js";
import { Game } from "../../module/common/game.js";

export class Metamorphe extends AbstractRoll {

    /**
     * Constructor.
     * @param actor The actor which performs the action.
     * @param item  The embedded item object, purpose of the action. 
     */
    constructor(actor, item) {
        super(actor);
        this.item = item;
    }

    /**
     * @Override
     */
    async drop() {
        await new EmbeddedItem(this.actor, this.sid)
            .withContext("Drop of a metamorphe")
            .withData("formed", [false, false, false, false, false, false, false, false, false, false])
            .withData("visible", [false, false, false, false, false, false, false, false, false, false])
            .withoutData('description', 'element', 'metamorphoses')
            .withDeleteAfter(this.actor.items.filter(i => i.type === 'metamorphe'))
            .create();
    }

    /**
     * @Override
     */
    async delete() {
        await this.deleteEmbeddedItem(this.sid);
        return this;
    }

    /**
     * @Override
     */
     async edit() {
        await super.edit(
            "systems/neph5e/feature/nephilim/item/metamorphe.html",
            {
                item: game.items.get(this.item._id),
                system: this.item.system,
                elements : Game.pentacle.elements,
                debug: game.settings.get('neph5e', 'debug'),
                readOnly: true
            },
            'ITEM.TypeMetamorphe',
            560,
            650
        )
    }

    /**
     * @returns the data used to display the actor item.
     */
    static getAll(actor) {

        // Initialization
        let id = null;
        let name = game.i18n.localize('NEPH5E.metamorphe');
        let size = 0;
        let  metamorphoses = [];
        for (let i=0; i<10; i++) {
            metamorphoses.push({
                name: null,
                formed: false,
                visible: false
            })
        }

        // Retrieve data
        const embedded = actor.items.find(i => i.type === 'metamorphe');
        if (embedded != null) {
            const original = game.items.find(i => i.sid === embedded.sid);
            if (original != null) {
                id = original.id;
                name = original.name;
                size = embedded?.system.formed.filter(v => v === true).length;
                for (let i=0; i<10; i++) {
                    metamorphoses[i] = {
                        name: original.system.metamorphoses[i].name,
                        formed: embedded.system.formed[i],
                        visible: embedded.system.visible[i]
                    };
                }
            }
        }

        // Build product
        return {
            id: id,
            name: name,
            size: size,
            metamorphoses: metamorphoses
        }

    }

    /**
     * Set the specified metamorphose to be formed or not.
     * @param index The index of the metamorphose.
     * @returns the instance.
     */
    async toggleFormed(index) {
        const embedded = AbstractRoll.embedded(this.actor, this.sid);
        const system = duplicate(embedded.system);
        system.formed[index] = !system.formed[index];
        await embedded.update({ ['system']: system });
        return this;
    }

    /**
     * Set the specified metamorphose to be visible or not.
     * @param index The index of the metamorphose.
     * @returns the instance.
     */
    async toggleVisible(index) {
        const embedded = AbstractRoll.embedded(this.actor, this.sid);
        const system = duplicate(embedded.system);
        system.visible[index] = !system.visible[index];
        await embedded.update({ ['system']: system });
        return this;
    }

}