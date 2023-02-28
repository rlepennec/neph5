import { AbstractFeature } from "../core/AbstractFeature.js";
import { ActionDataBuilder } from "../core/actionDataBuilder.js";
import { EmbeddedItem } from "../../module/common/embeddedItem.js";
import { FeatureBuilder } from "../core/featureBuilder.js";
import { Periode } from "../periode/periode.js";

export class Science extends AbstractFeature {

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
        return new Science(actor, item, periode);
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
                    .withContext("Drop of a science on periode " + this.periode)
                    .withData("degre", 0)
                    .withData("periode", this.periode)
                    .withoutData('description')
                    .withoutAlreadyEmbeddedError()
                    .create();
            }
        } else {
            await new EmbeddedItem(this.actor, this.sid)
                .withContext("Drop of a science")
                .withData("degre", 0)
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

            // Custom
            default:

                if (typeof name === 'string') {

                    // Atlanteide
                    if (name?.substring(0,11) === 'atlanteide@') {
                        return {
                            type: 'atlanteide',
                            property: 'cercle'
                        }
                    }

                    // Dracomachie
                    if (name?.substring(0,12) === 'dracomachie@') {
                        return {
                            type: 'dracomachie',
                            property: 'cercle'
                        }
                    }

                    // Magie analogique
                    if (name?.substring(0,9) === 'analogie@') {
                        return {
                            type: 'habitus',
                            property: 'domaine'
                        }
                    }

                    // Pratique synarche
                    if (name?.substring(0,9) === 'pratique@') {
                        return {
                            type: 'pratique',
                            property: 'cercle'
                        }
                    }

                    // Technique templiere
                    if (name?.substring(0,10) === 'technique@') {
                        return {
                            type: 'technique',
                            property: 'cercle'
                        }
                    }

                    // Tekhne rosicrucienne
                    if (name?.substring(0,7) === 'tekhne@') {
                        return {
                            type: 'tekhne',
                            property: 'cercle'
                        }
                    }

                    // Rituel myste
                    if (name?.substring(0,7) === 'rituel@') {
                        return {
                            type: 'rituel',
                            property: 'cercle'
                        }
                    }

                }

        }

    }

    /**
     * @param actor   The actor object for which to retrieve the focus.
     * @param science The name of the science.
     * @returns the owned focus of the actor. 
     */
    static getFocus(actor, science) {

        let items = [];
        const cercle = Science.getCercle(science);
        const sids = actor.items.filter(i => i.type === cercle?.type && new Periode(actor, actor.items.find(j => j.sid === i.system.periode)).actif()).map(i => i.sid);
        
        for (let item of game.items.filter(i => i.system[cercle?.property] === science && sids.includes(i.sid))) {

            const embedded = actor.items.find(i => i.sid === item.sid);
            const feature = new FeatureBuilder(actor).withPeriode(actor.system.periode).createFromEmbedded(embedded);
            const degre = feature.degre;

            if (degre != null) {
                embedded.degre = degre * 10;
            } else if (item.type === 'formule') {
                embedded.degre = null;
            }

            items.push({
                original: item,
                embedded: embedded
            });

        }
        return items;

    }

    /**
     * Get the sciences occultes according to the specified character and the active periodes.
     * @param actor The actor object.
     * @returns the sciences occultes to display in the character sheet.
     */
    static getAll(actor) {
        const all = [];
        for (let s of game.items.filter(i => i.type === 'science')) {
            const feature = new Science(actor, s);
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
     * @param actor  The actor object.
     * @param cercle  The name of the cercle.
     * @returns the science.
     */
    static scienceOf(actor, cercle) {
        const item = game.items.find(i => i.type === 'science' && i.system.key === cercle);
        return item == null ? null : new Science(actor, item);
    }

    /**
     * @param actor   The actor object.
     * @param science The name of the science for which to get the cercles.
     * @returns the data information about the specified cercles.
     */
    static cercles(actor, science) {
        const cercles = Science._cerclesOf(science);
        return {
            header: Science._getHeader(science),
            cercles: Science._getCercles(actor, cercles)
        }
    }

    /**
     * @param actor   The actor object.
     * @param cercles The keys of the cercles to get.
     * @returns the data information about the specified cercles.
     */
    static _getCercles(actor, cercles) {
        const data = [];
        for (let cercle of cercles) {
            const item = game.items.find(i => i.type === 'science' && i.system.key === cercle);
            if (item != null) {
                const feature = new Science(actor, item);
                const degre = feature.degre;
                const focus = Science._getFocus(actor, cercle);
                if (degre > 0 || focus.length > 0) {
                    data.push({
                        name: item.name,
                        cercle: cercle,
                        sid: item.sid,
                        id: item.id,
                        degre: degre,
                        focus: focus,
                        voie: Science._getVoie(actor, cercle)
                    });
                }
            }
        }
        return data;
    }

    /**
     * @param actor  The actor object.
     * @param cercle The key of the cercle for which to get the voie.
     * @returns the voie related to the specified cercle.
     */
    static _getVoie(actor, cercle) {
        switch (cercle) {
            case 'hauteMagie':
                return actor.voieMagique;
            case 'oeuvreAuNoir':
                return actor.voieAlchimique;
            default:
                return null;
        }
    }

    /**
     * @param science The name of the science.
     * @returns the header data.
     */
    static _getHeader(science) {
        switch (science) {
            case 'alchimie':
                return ['elements', 'quantite', 'transporte', 'focus', 'status', 'percentage'];
            case 'analogie':
                return ['element', 'focus', 'percentage'];
            case 'atlanteide':
                return ['percentage'];
            case 'baton':
                return ['percentage'];
            case 'conjuration':
                return ['luneNoire', 'focus', 'status', 'percentage'];
            case 'coupe':
                return ['percentage'];
            case 'denier':
                return ['percentage'];
            case 'dracomachie':
                return ['percentage'];
            case 'epee':
                return ['percentage'];
            case 'kabbale':
                return ['element', 'pacte', 'focus', 'status', 'percentage'];
            case 'magie':
                return ['element', 'focus', 'status', 'percentage'];
            case 'necromancie':
                return ['luneNoire', 'focus', 'status', 'percentage'];
            default:
                return [];
        }
    }

    /**
     * @param actor   The actor object for which to retrieve the focus.
     *  @param cercle The key of the cercle for which to get the focus.
     * @returns the focus related to the specified cercle of the actor. 
     */
    static _getFocus(actor, science) {

        let items = [];
        const cercle = Science.getCercle(science);
        const sids = actor.items.filter(i => i.type === cercle?.type && new Periode(actor, actor.items.find(j => j.sid === i.system.periode)).actif()).map(i => i.sid);
        
        for (let original of game.items.filter(i => i.system[cercle?.property] === science && sids.includes(i.sid))) {

            const embedded = actor.items.find(i => i.sid === original.sid);
            const feature = new FeatureBuilder(actor).withPeriode(actor.system.periode).createFromEmbedded(embedded);
            const degre = feature.degre;

            if (degre != null) {
                embedded.degre = degre * 10;
            } else if (original.type === 'formule') {
                embedded.degre = null;
            }

            items.push({
                original: original,
                embedded: embedded
            });

        }
        return items;

    }

    /**
     * @param science The name of the science for which to get the cercles.
     * @returns the sorted keys of the cercles.
     */
    static _cerclesOf(science) {
        switch (science) {
            case 'alchimie':
                return ['oeuvreAuNoir', 'oeuvreAuBlanc', 'oeuvreAuRouge'];
            case 'analogie':
                return ['comprendre', 'controler', 'creer', 'detruire', 'transformer'];
            case 'atlanteide':
                return [];
            case 'baton':
                return [];
            case 'conjuration':
                return ['charmeur', 'dresseur', 'demiurge'];
            case 'coupe':
                return [];
            case 'denier':
                return [];
            case 'dracomachie':
                return [];
            case 'epee':
                return [];
            case 'kabbale':
                return ['malkut', 'yesod', 'hod', 'netzach', 'tiphereth', 'geburah', 'chesed', 'binah', 'chokmah', 'kether'];
            case 'magie':
                return ['basseMagie', 'hauteMagie', 'grandSecret'];
            case 'necromancie':
                return ['fossoyeur', 'embaumeur', 'imputrescible'];
            default:
                return [];
        }
    }

}