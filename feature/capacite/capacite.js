import { EmbeddedItem } from "../../module/common/embeddedItem.js";
import { Incarnations } from "../../feature/incarnation/incarnations.js";
import { Version } from "../../module/common/version.js";
import { HistoricalFeature } from "../core/historicalFeature.js";

export class Capacite extends HistoricalFeature {

    /**
     * @param item The original or embedded item object, purpose of the action.
     * @returns the instance.
     */
    withItem(item) {
        if (item.actor == null) {
            return this.withOriginalItem(item);
        } else {
            return this.withEmbeddedItem(item);
        }
    }

    /**
     * @param item The original item object, purpose of the action.
     * @returns the instance.
     */
    withOriginalItem(item) {
        this.item = item;
        this.embedded = this.actor.items.find(i => i.sid === item.sid);
        return this;
    }

    /**
     * @param item The embedded item object, purpose of the action.
     * @returns the instance.
     */
    withEmbeddedItem(item) {
        this.embedded = item;
        this.item = game.items.find(i => i.sid === item.sid);
        return this;
    }
    
    /**
     * @Override
     */
    getEmbeddedData() {
        return {
            readOnly: true
        }
    }

    /**
     * @Override
     */
    async drop() {

        if (this.actor.type !== "figure") {
            return;
        }

        // Un exemplaire par incarnation, comme les focus (voir deposerParEpoque)
        if (!(await this.deposerParEpoque())) {
            return;
        }

        await new EmbeddedItem(this.actor, this.sid)
            .withContext("Drop of a capacite")
            .withIncarnation(this.periode)
            .withoutData('description')
            .create();

    }

    /**
     * Get the capacites according to the specified character and the active periodes.
     * @param actor The actor object.
     * @returns the capacites to display in the character sheet.
     */
    static getAll(actor) {

        // Une capacité par sid : l'exemplaire qui fait foi (incarnation courante, sinon
        // antérieure la plus proche) ; celles connues seulement plus tard n'apparaissent pas.
        const incarnations = new Incarnations(actor);
        const sids = [...new Set(actor.items.filter(i => i.type === 'capacite').map(i => i.sid))];
        const array = sids
            .map(sid => incarnations.exemplaireEffectif(sid))
            .filter(i => i != null)
            .map(i => new Capacite(actor).withItem(i))
            .map(f => ({
                name: f.name,
                sid: f.sid,
                description: Version.data(f.item).description,
                folder: f.item.folder.name }));

        const sorted = Object.groupBy(array, ({ folder }) => folder);

        const all = [];
        for (let folder in sorted) {
            all.push({
                folder: folder,
                capacites: sorted[folder]
            })
        }

        return all;

    }

}