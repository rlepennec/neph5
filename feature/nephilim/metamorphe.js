
import { AbstractFeature } from "../core/abstractFeature.js";
import { Version } from "../../module/common/version.js";
import { EmbeddedItem } from "../../module/common/embeddedItem.js";
import { SimpleFeature } from "../core/simpleFeature.js";

export class Metamorphe extends SimpleFeature {

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
     * @returns the data used to display the actor item.
     */
    static getAll(actor) {

        // Initialization
        let id = null;
        let sid = null;
        let name = game.i18n.localize('NEPHILIM.metamorphe');
        let size = 0;
        let visibles = 0;
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
                sid = original.sid;
                name = original.name;
                const etat = Version.data(embedded);
                size = etat.formed.filter(v => v === true).length;
                for (let i=0; i<10; i++) {
                    metamorphoses[i] = {
                        name: Version.data(original).metamorphoses[i]?.name,
                        formed: etat.formed[i],
                        visible: etat.visible[i]
                    };
                    if (etat.formed[i] === true && etat.visible[i] == true) {
                        visibles = visibles + 1;
                    }
                }
            }
        }

        // Build product
        return {
            id: id,
            sid: sid,
            name: name,
            size: size,
            visibles: visibles,
            metamorphoses: metamorphoses
        }

    }

    /**
     * @Override
     */
    getEmbeddedData() {
        return Metamorphe.getAll(this.actor);
    }

    /**
     * Set the specified metamorphose to be formed or not.
     * @param index The index of the metamorphose.
     * @returns the instance.
     */
    async toggleFormed(index) {
        const embedded = AbstractFeature.embedded(this.actor, this.sid);
        const formed = foundry.utils.duplicate(Version.data(embedded).formed);
        formed[index] = !formed[index];
        await embedded.update({ [Version.path(embedded, 'formed')]: formed });
        return this;
    }

    /**
     * Set the specified metamorphose to be visible or not.
     * @param index The index of the metamorphose.
     * @returns the instance.
     */
    async toggleVisible(index) {
        const embedded = AbstractFeature.embedded(this.actor, this.sid);
        const visible = foundry.utils.duplicate(Version.data(embedded).visible);
        visible[index] = !visible[index];
        await embedded.update({ [Version.path(embedded, 'visible')]: visible });
        return this;
    }

}