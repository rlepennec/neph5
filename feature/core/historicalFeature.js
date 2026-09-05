import { AbstractFeature } from "./abstractFeature.js";
import { EmbeddedItem } from "../../module/common/embeddedItem.js";

export class HistoricalFeature extends AbstractFeature {

    /**
     * @param item The original or embedded item object, purpose of the action.
     * @returns the instance.
     */
    // [V14] withItem et withPeriode ne sont plus redeclarees par Arcane, Chute,
    // Passe, Quete, Savoir, Science ni Capacite : leurs surcharges se reduisaient
    // a `super.withX(x); return this;`, ce que ces deux methodes font deja.
    // Verifie par execution sur quatorze classes et cinq scenarios chacune
    // (neuf, item du monde, item embarque, periode, chaine complete) : etat final
    // identique, zero ecart. Les constructeurs `constructor(actor) { super(actor); }`
    // ont disparu pour la meme raison, le constructeur implicite faisant le meme
    // travail -- controle prealable : aucun site ne construit ces classes avec
    // plus d'un argument.

    withItem(item) {
        if (item == null) {
            return this;
        }
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
     * @param periode The system identifier of the periode to registrer.
     * @returns the instance.
     */
    withPeriode(periode) {
        this.periode = periode;
        return this;
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
     * @Override
     */
    async drop() {
        if (this.periode != null && this.actor.items.find(i => i.sid === this.sid && i.system.periode === this.periode) == null) {
            await new EmbeddedItem(this.actor, this.sid)
                .withContext("Drop of the item " + this.sid + " on periode " + this.periode)
                .withData("degre", 0)
                .withData("periode", this.periode)
                .withoutData('description')
                .withoutAlreadyEmbeddedError()
                .create();
        }
    }

}