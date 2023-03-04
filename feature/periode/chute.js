import { AbstractFeature } from "../core/AbstractFeature.js";
import { ActionDataBuilder } from "../core/actionDataBuilder.js";
import { EmbeddedItem } from "../../module/common/embeddedItem.js";
import { Periode } from "./periode.js";

export class Chute extends AbstractFeature {

    /**
     * Constructor.
     * @param actor   The actor which performs the action.
     * @param item    The original item object, purpose of the action.
     * @param periode The optional system identifier of the periode.
     */
    constructor(actor, item, periode) {
        super(actor);
        this.item = item;
        this.periode = periode;
    }

    /**
     * @Override
     */
    get title() {
        return "Jet de Chute";
    }

    /**
     * @Override
     */
    get sentence() {
        return 'NEPH5E.tente.self.chute';
    }

    /**
     * @Override
     */
    get data() {
        return new ActionDataBuilder(this)
            .withItem(this.item)
            .withBase(this.item.name, this.degre)
            .withFraternite(this.fraternite)
            .withBlessures('magique')
            .export();
    }

    /**
     * @Override
     */
    get purpose() {
        return this.item;
    }

    /**
     * @Override
     */
    get degre() {
        return this.degreFromPeriodes(this.sid);
    }

    /**
     * @param actor   The actor which performs the action.
     * @param item    The embedded item object, purpose of the action.
     * @param periode The optional system identifier of the periode.
     * @returns a new instance.
     */
    clone(actor, item, periode) {
        return new Chute(actor, item, periode);
    }

    /**
     * @Override
     */
    async drop() {
        if (this.periode != null &&
            this.actor.items.find(i => i.sid === this.sid && i.system.periode === this.periode) == null) {
            await new EmbeddedItem(this.actor, this.sid)
                .withContext("Drop of a chute on periode " + this.periode)
                .withData("degre", 0)
                .withData("periode", this.periode)
                .withoutData('description')
                .withoutAlreadyEmbeddedError()
                .create();
        }
    }

    /**
     * @Override
     */
    async edit() {
        await super.edit(
            "systems/neph5e/feature/periode/item/chute.html",
            {
                system: this.item.system,
                item: AbstractFeature.original(this.sid),
                periodes: this.detailsFromPeriodes(this.sid),
                degre: this.degre,
                next: this.next,
                readOnly: this.degre === null
            },
            'ITEM.TypeChute',
            560,
            500
        )
    }

    /**
     * Get the chutes according to the specified character and the active periodes.
     * @param actor The actor object.
     * @returns the arcanes to display in the character sheet.
     */
    static getAll(actor) {
        const all = [];
        for (let s of game.items.filter(i => i.type === 'chute')) {
            const feature = new Chute(actor, s);
            if (feature.degre !== 0) {
                all.push({
                    name: feature.name,
                    sid: feature.sid,
                    id: s.id,
                    degre: feature.degre
                });
            }
        }
        return all;
    }

    /**
     * @param actor The actor object.
     * @returns the degre and the name of chute according to the specified actor, actives periodes and current one.
     */
    static getKhaiba(actor) {
        return Chute._getChute(actor, 'khaiba');
    }

    /**
     * @param actor The actor object.
     * @returns the degre and the name of chute according to the specified actor, actives periodes and current one.
     */
    static getNarcose(actor) {
        return Chute._getChute(actor, 'narcose');
    }

    /**
     * @param actor The actor object.
     * @returns the degre and the name of chute according to the specified actor, actives periodes and current one.
     */
    static getOmbre(actor) {
        return Chute._getChute(actor, 'ombre');
    }

    /**
     * @param actor The actor object.
     * @returns the degre and the name of chute according to the specified actor, actives periodes and current one.
     */
    static getLuneNoire(actor) {
        return Chute._getChute(actor, 'luneNoire');
    }

    /**
     * @param actor The actor object.
     * @param key   The key of the chute to retrieve.
     * @returns the degre and the name of chute according to the specified actor, actives periodes and current one.
     */
    static _getChute(actor, key) {
        let degre = 0;
        let name = null;
        for (let periode of Periode.getSorted(actor, true, true, actor.system.periode)) {
            const chute = actor.items.find(i => i.type === 'chute' && i.system.key === key && i.system.periode === periode.sid);
            if (chute != null) {
                if (name == null) {
                    name = chute.name;
                }
                degre = degre + chute.system.degre;
            }
        }
        return {
            'degre': degre,
            'name': name
        };
    }

}