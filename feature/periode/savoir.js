import { AbstractFeature } from "../core/AbstractFeature.js";
import { ActionDataBuilder } from "../core/actionDataBuilder.js";
import { EmbeddedItem } from "../../module/common/embeddedItem.js";
import { Game } from "../../module/common/game.js";

export class Savoir extends AbstractFeature {

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
        this.attachPeriode = true;
    }

    /**
     * @Override
     */
    get title() {
        return "Jet de Savoir ésotérique";
    }

    /**
     * @Override
     */
    get sentence() {
        return 'NEPH5E.tente.self.savoir';
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
        return new Savoir(actor, item, periode);
    }

    /**
     * Set no periode is attached to the savoir.
     * @returns the instance.
     */
    withoutPeriode() {
        this.attachPeriode = false;
        return this;
    }

    /**
     * @Override
     */
    async drop() {
        if (this.attachPeriode === true) {
            if (this.periode != null &&
                this.actor.items.find(i => i.sid === this.sid && i.system.periode === this.periode) == null) {
                await new EmbeddedItem(this.actor, this.sid)
                    .withContext("Drop of a savoir on periode " + this.periode)
                    .withData("degre", 0)
                    .withData("periode", this.periode)
                    .withoutData('description')
                    .withoutAlreadyEmbeddedError()
                    .create();
            }
        } else {
            if (this.actor.items.find(i => i.sid === this.sid) == null) {
                await new EmbeddedItem(this.actor, this.sid)
                    .withContext("Drop of a savoir")
                    .withData("degre", 0)
                    .withoutData('description')
                    .withoutAlreadyEmbeddedError()
                    .create();
            }
        }
    }

    /**
     * @Override
     */
    async edit() {
        await super.edit(
            "systems/neph5e/feature/periode/item/savoir.html",
            {
                system: this.item.system,
                elements: Game.pentacle.elements,
                item: AbstractFeature.original(this.sid),
                periodes: this.detailsFromPeriodes(this.sid),
                degre: this.degre,
                next: this.next,
                readOnly: this.degre === null
            },
            'ITEM.TypeSavoir',
            560,
            500
        )
    }

    /**
     * Get the savoirs according to the specified character and the active periodes.
     * @param actor The actor object.
     * @returns the savoirs to display in the character sheet.
     */
    static getAll(actor) {
        const all = [];
        for (let s of game.items.filter(i => i.type === 'savoir')) {
            const feature = new Savoir(actor, s);
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

}