import { ActionDataBuilder } from "../core/actionDataBuilder.js";
import { FeatureBuilder } from "../core/featureBuilder.js";
import { HistoricalFeature } from "../core/historicalFeature.js";
import { Periode } from "../periode/periode.js";

export class Science extends HistoricalFeature {

    /**
     * Constructor.
     * @param actor The actor which performs the action.
     */
    constructor(actor) {
        super(actor);
    }

    /**
     * @Override
     */
    withItem(item) {
        super.withItem(item);
        return this;
    }

    /**
     * The system identifier of the periode to registrer.
     * @returns the instance.
     */
    withPeriode(periode) {
        this.periode = periode;
        return this;
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
            case 'daath':
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
                    if (name?.substring(0,7) === 'denier@') {
                        return {
                            type: 'pratique',
                            property: 'cercle'
                        }
                    }

                    // Technique templiere
                    if (name?.substring(0,6) === 'baton@') {
                        return {
                            type: 'technique',
                            property: 'cercle'
                        }
                    }

                    // Tekhne rosicrucienne
                    if (name?.substring(0,6) === 'coupe@') {
                        return {
                            type: 'tekhne',
                            property: 'cercle'
                        }
                    }

                    // Rituel myste
                    if (name?.substring(0,5) === 'epee@') {
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

        // Intialization
        let items = [];

        // Retrieve the cercle item
        const cercle = Science.getCercle(science);

        // Retrieve 
        const sids = actor.items.filter(i => i.type === cercle?.type && new Periode(actor, actor.items.find(j => j.sid === i.system.periode)).actif()).map(i => i.sid);

        for (let item of game.items.filter(i => i.system[cercle?.property] === science && sids.includes(i.sid))) {

            const feature = new FeatureBuilder(actor).withPeriode(actor.system.periode).withOriginalItem(item.sid).create();
            const embedded = feature.embedded;
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
     * @param actor  The actor object.
     * @param cercle  The name of the cercle.
     * @returns the science.
     */
    static scienceOf(actor, cercle) {
        const item = game.items.find(i => i.type === 'science' && i.system.key === cercle);
        return item == null ? null : new Science(actor).withItem(item);
    }

    /**
     * @param actor   The actor object.
     * @param science The name of the science for which to get the cercles.
     * @param options The option parameters:
     *   - all: if true, all cercles are returned.
     * @returns the data information about the specified cercles.
     */
    static cercles(actor, science, options) {
        const cercles = Science.cerclesOf(science);
        return {
            header: Science._getHeader(science),
            cercles: Science._getCercles(actor, cercles, options)
        }
    }

    /**
     * @param actor   The actor object.
     * @param cercles The keys of the cercles to get.
     * @param options The option parameters:
     *   - all: if true, all cercles are returned.
     * @returns the data information about the specified cercles.
     */
    static _getCercles(actor, cercles, options) {
        const data = [];
        for (let cercle of cercles) {

            // Skip Daath if not activated for the character
            if (cercle === 'daath' && actor.system.options.daath !== true) {
                continue;
            }

            const item = game.items.find(i => i.type === 'science' && i.system.key === cercle);
            if (item != null) {
                const feature = new Science(actor).withItem(item);
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
                } else if (options.all === true) {
                    data.push({
                        name: item.name,
                        cercle: cercle,
                        sid: item.sid,
                        id: item.id
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
                return ['elements', 'quantite', 'transporte', 'possede', 'status', 'percentage'];
            case 'analogie':
                return ['element', 'possede', 'percentage'];
            case 'atlanteide':
                return ['ka', 'percentage'];
            case 'baton':
                return ['ka', 'percentage'];
            case 'conjuration':
                return ['luneNoire', 'possede', 'status'];
            case 'coupe':
                return ['ka', 'percentage'];
            case 'denier':
                return ['ka', 'percentage'];
            case 'dracomachie':
                return ['ka', 'percentage'];
            case 'epee':
                return ['ka', 'percentage'];
            case 'kabbale':
                return ['element', 'pacte', 'possede', 'status', 'percentage'];
            case 'magie':
                return ['element', 'possede', 'status', 'percentage'];
            case 'necromancie':
                return ['luneNoire', 'possede', 'status'];
            default:
                return [];
        }
    }

    /**
     * @param actor  The actor object for which to retrieve the focus.
     * @param cercle The key of the cercle for which to get the focus.
     * @returns the focus related to the specified cercle of the actor. 
     */
    static _getFocus(actor, science) {

        let items = [];
        const cercle = Science.getCercle(science);
        const sids = actor.items.filter(i => i.type === cercle?.type && new Periode(actor, actor.items.find(j => j.sid === i.system.periode)).actif()).map(i => i.sid);
        
        for (let item of game.items.filter(i => i.system[cercle?.property] === science && sids.includes(i.sid))) {

            //const embedded = actor.items.find(i => i.sid === original.sid);
            const feature = new FeatureBuilder(actor).withPeriode(actor.system.periode).withOriginalItem(item.sid).create();
            const embedded = feature.embedded;
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
     * @param science The name of the science for which to get the cercles.
     * @returns the sorted keys of the cercles.
     */
    static cerclesOf(science) {
        switch (science) {
            case 'alchimie':
                return ['oeuvreAuNoir', 'oeuvreAuBlanc', 'oeuvreAuRouge'];
            case 'conjuration':
                return ['charmeur', 'dresseur', 'demiurge'];
            case 'kabbale':
                return ['malkut', 'yesod', 'hod', 'netzach', 'tiphereth', 'geburah', 'chesed', 'binah', 'chokmah', 'kether', 'daath'];
            case 'magie':
                return ['basseMagie', 'hauteMagie', 'grandSecret'];
            case 'necromancie':
                case 'dracomachie':
            case 'analogie': {
                const addons = game.items.filter(i => i.type === 'science' && i.system.key.startsWith(science + '@'));
                return ['comprendre', 'controler', 'creer', 'detruire', 'transformer'].concat(Array.from(addons, addon => addon.system.key));
            }
            case 'atlanteide':
            case 'baton':
            case 'coupe':
            case 'denier':
            case 'dracomachie':
            case 'epee': {
                const addons = game.items.filter(i => i.type === 'science' && i.system.key.startsWith(science + '@'));
                return Array.from(addons, addon => addon.system.key);
            }
            default:
                return [];
        }
    }

}