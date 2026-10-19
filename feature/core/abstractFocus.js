import { AbstractFeature } from "../core/abstractFeature.js";
import { EmbeddedItem } from "../../module/common/embeddedItem.js";
import { Incarnations } from "../../feature/incarnation/incarnations.js";
import { Version } from "../../module/common/version.js";

export class AbstractFocus extends AbstractFeature {

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
        // Un exemplaire par incarnation : fait foi celui de l'incarnation courante, sinon de
        // l'antérieure la plus proche (null si l'acteur ne le connaît que plus tard).
        this.embedded = new Incarnations(this.actor).exemplaireEffectif(item.sid);
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
    get uncastable() {
        return this.rawDegre < -99;
    }

    /**
     * @Override
     */
    get limitation() {
        const raw = this.rawDegre;
        if (raw < -99) {
            const error = -raw;
            return "NEPHILIM.erreur" + error;
        }
    }

    /**
     * @Override
     */
    get degre() {
        const degre = this.rawDegre;
        return degre < -99 ? 0 : degre;
    }

    /**
     * @return the degre, < 99 if uncastable.
     */
    get rawDegre() {
        return 0;
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
    async drop() {

        // Un exemplaire par incarnation : déjà lié à celle-ci, rien ; connu d'une autre, une
        // copie après confirmation (voir deposerParEpoque) ; sinon un nouveau.
        if (await this.deposerParEpoque()) {
            await this._createEmbeddedItem();
        }

    }

    /**
     * Les valeurs initiales propres à l'acteur d'un nouvel exemplaire (statut, focus...).
     * @returns les valeurs, par champ.
     */
    get valeursInitiales() {
        return {};
    }

    /**
     * Les champs du focus du monde que l'exemplaire ne recopie pas : ils sont lus sur lui.
     * @returns les noms des champs.
     */
    get champsDuMonde() {
        return ['description', 'cercle', 'degre'];
    }

    /**
     * Crée l'exemplaire de l'incarnation this.periode d'un focus que l'acteur ne connaît encore
     * dans aucune autre, avec ses valeurs initiales (voir valeursInitiales, champsDuMonde). Un
     * focus déjà connu est copié par deposerParEpoque.
     */
    async _createEmbeddedItem() {
        const embedded = new EmbeddedItem(this.actor, this.sid)
            .withContext("Drop of a " + (this.item?.type ?? "focus"));
        for (const [champ, valeur] of Object.entries(this.valeursInitiales)) {
            embedded.withData(champ, valeur);
        }
        await embedded
            .withIncarnation(this.periode)
            .withoutData(...this.champsDuMonde)
            .create();
    }

}