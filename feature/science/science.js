import { AbstractRoll } from "../core/abstractRoll.js";
import { ActionDataBuilder } from "../core/actionDataBuilder.js";
import { EmbeddedItem } from "../../module/common/embeddedItem.js";

export class Science extends AbstractRoll {

    /**
     * Constructor.
     * @param actor   The actor which performs the action.
     * @param item    The embedded item object, purpose of the action.
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
        return "Jet de Science Occulte";
    }

    /**
     * @Override
     */
    get sentence() {
        return 'NEPH5E.tente.self.science';
    }

    /**
     * @Override
     */
    get data() {
        return new ActionDataBuilder(this)
            .withItem(this.item)
            .withBase('Science Occulte', this.degre)
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
     * @Override
     */
    async drop() {
        if (this.periode != null &&
            this.actor.items.find(i => i.sid === this.sid && i.system.periode === this.periode) == null) {
            await new EmbeddedItem(this.actor, this.sid)
                .withContext("Drop of a science on periode " + this.periode)
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
    }

    /**
     * @param key The key of the science.
     * @returns the specified world item, null if not found. 
     */
    static getScience(key) {
        return game.items.find(i => i.system?.key === key);
    }

    /**
     * 
     * @param name The name of the cercle.
     */
    static getCercle(name) {

        switch(name) {

            // Magie
            case 'basseMagie':
            case 'hauteMagie':
            case 'grandSecret':
                return {
                    type: 'sort',
                    property: 'cercle'
                }

            // Magie analogique
            case 'comprendre':
            case 'controler':
            case 'creer':
            case 'detruire':
            case 'transformer':
                return {
                    type: 'habitus',
                    property: 'domaine'
                }

            // Kabbale
            case 'malkut':
            case 'yesod':
            case 'hod':
            case 'netzach':
            case 'tiphereth':
            case 'geburah':
            case 'chesed':
            case 'binah':
            case 'chokmah':
            case 'kether':
                return {
                    type: 'invocation',
                    property: 'sephirah'
                }

            // Alchimie
            case 'oeuvreAuNoir':
            case 'oeuvreAuBlanc':
            case 'oeuvreAuRouge':
                return {
                    type: 'formule',
                    property: 'cercle'
                }

            // Necromancie
            case 'fossoyeur':
            case 'embaumeur':
            case 'imputrescible':
                return {
                    type: 'rite',
                    property: 'cercle'
                }

            // Conjuration
            case 'charmeur':
            case 'dresseur':
            case 'demiurge':
                return {
                    type: 'appel',
                    property: 'cercle'
                }

            // Denier
            case 'architecte':
            case 'guide':
            case 'mage':
            case 'ouvrier':
            case 'roi':
            case 'sage':
                return {
                    type: 'pratique',
                    property: 'cercle'
                }

            // Custom
            default:

                // Magie analogique
                if (typeof name === 'string' && name?.substring(0,9) === 'analogie@') {
                    return {
                        type: 'habitus',
                        property: 'domaine'
                    }
                }

        }

    }

}