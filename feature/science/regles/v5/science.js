import { ActionDataBuilder } from "../../../core/actionDataBuilder.js";
import { Incarnations } from "../../../incarnation/incarnations.js";
import { Version } from "../../../../module/common/version.js";
import { FeatureBuilder } from "../../../core/featureBuilder.js";
import { HistoricalFeature } from "../../../core/historicalFeature.js";
import { Savoir } from "../../../savoir/regles/v5/savoir.js";

export class Science extends HistoricalFeature {

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
        return 'NEPHILIM.tenteSelfScience';
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
        return game.items.find(i => Version.data(i).key === key);
    }

    /**
     * Le type des focus de chaque cercle des sciences du livre de base.
     */
    static #TYPES = new Map([
        // Magie
        ...['basseMagie', 'hauteMagie', 'grandSecret'].map(c => [c, 'sort']),
        // Magie analogique
        ...['comprendre', 'controler', 'creer', 'detruire', 'transformer'].map(c => [c, 'habitus']),
        // Kabbale
        ...['malkut', 'yesod', 'hod', 'netzach', 'tiphereth', 'geburah', 'chesed', 'binah', 'chokmah',
            'kether', 'daath'].map(c => [c, 'invocation']),
        // Alchimie
        ...['oeuvreAuNoir', 'oeuvreAuBlanc', 'oeuvreAuRouge'].map(c => [c, 'formule']),
        // Necromancie
        ...['fossoyeur', 'embaumeur', 'imputrescible'].map(c => [c, 'rite']),
        // Conjuration
        ...['charmeur', 'dresseur', 'demiurge'].map(c => [c, 'appel'])
    ]);

    /**
     * Le type des focus des cercles propres à une campagne, par préfixe de leur clé.
     */
    static #PREFIXES = [
        ['atlanteide@', 'atlanteide'],
        ['dracomachie@', 'dracomachie'],
        ['analogie@', 'habitus'],
        ['bohemien@', 'divination'],
        ['denier@', 'pratique'],
        ['baton@', 'technique'],
        ['coupe@', 'tekhne'],
        ['epee@', 'rituel']
    ];

    /**
     * @param type Un type de focus.
     * @returns la propriété par laquelle un focus de ce type désigne son cercle : le domaine
     *          d'un habitus, la sephirah d'une invocation, le cercle des autres.
     */
    static proprieteCercle(type) {
        switch (type) {
            case 'habitus':
                return 'domaine';
            case 'invocation':
                return 'sephirah';
            default:
                return 'cercle';
        }
    }

    /**
     * @param name The name of the cercle.
     * @returns { type, property } : le type de ses focus et la propriété par laquelle ils le
     *          désignent ; undefined pour un cercle inconnu.
     */
    static getCercle(name) {
        let type = Science.#TYPES.get(name);
        if (type == null && typeof name === 'string') {
            type = Science.#PREFIXES.find(([prefixe]) => name.startsWith(prefixe))?.[1];
        }
        return type == null ? undefined : { type: type, property: Science.proprieteCercle(type) };
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
        const incarnations = new Incarnations(actor);
        const sids = actor.items.filter(i => i.type === cercle?.type && incarnations.estActif(i)).map(i => i.sid);

        for (let item of game.items.filter(i => Version.data(i)[cercle?.property] === science && sids.includes(i.sid))) {

            const feature = new FeatureBuilder(actor).withPeriode(incarnations.courante).withOriginalItem(item.sid).create();
            const embedded = feature.embedded;
            const degre = feature.degre;
            const uncastable = feature.uncastable;
            const limitation = feature.limitation;

            if (degre != null) {
                embedded.degre = degre * 10;
            } else if (item.type === 'formule') {
                embedded.degre = null;
            }

            items.push({
                original: item,
                embedded: embedded,
                // La quantité peut appartenir à une version : on la résout ici, car le
                // gabarit est générique et ne sait pas de quel type est l'item listé.
                quantite: Version.data(embedded).quantite,
                transporte: Version.data(embedded).transporte,
                element: Version.data(item).element,
                elements: Version.data(item).elements,
                cercle: Version.data(item).cercle,
                focus: Version.data(embedded).focus,
                pacte: Version.data(embedded).pacte,
                uncastable: uncastable,
                limitation: limitation
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
        const item = game.items.find(i => i.type === 'science' && Version.data(i).key === cercle);
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

        let item = null;
        switch (science) {
            case "denier": {
                item = game.items.find(i => i.sid === "2e59bafc-c15ad33f-ecf2b0b5-552ae23e");
                break;
            }
            case "coupe": {
                item = game.items.find(i => i.sid === "1ca3f53b-b487e304-2260922e-b9d29476");
                break;
            }
            case "epee": {
                item = game.items.find(i => i.sid === "6d3727df-99a5a34a-cd599572-c9d755dd");
                break;
            }
            case "baton": {
                item = game.items.find(i => i.sid === "83a3e42e-5af77cbd-df0f4d7c-38dd775d");
                break;
            }
            case "bohemien": {
                item = game.items.find(i => i.sid === "0168fa19-a6141d9e-65eaa5b4-d6e9dcb1");
                break;
            }
        }

        return {
            header: Science._getHeader(science),
            cercles: Science._getCercles(actor, cercles, options),
            savoir: item == null ? null : new Savoir(actor).withItem(item)
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
            if (cercle === 'daath' && Version.data(actor).options.daath !== true) {
                continue;
            }

            const item = game.items.find(i => i.type === 'science' && Version.data(i).key === cercle);
            if (item != null) {
                const feature = new Science(actor).withItem(item);
                const degre = feature.degre;
                const focus = Science.getFocus(actor, cercle);
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
                return ['element', 'percentage'];
            case 'bohemien':
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
                return ['fossoyeur', 'embaumeur', 'imputrescible'];
            case 'analogie': {
                const addons = game.items.filter(i => i.type === 'science' && Version.data(i).key?.startsWith(science + '@'));
                return ['comprendre', 'controler', 'creer', 'detruire', 'transformer'].concat(Array.from(addons, addon => Version.data(addon).key));
            }
            case 'atlanteide':
            case 'baton':
            case 'coupe':
            case 'denier':
            case 'bohemien':
            case 'dracomachie':
            case 'epee': {
                const addons = game.items.filter(i => i.type === 'science' && Version.data(i).key?.startsWith(science + '@'));
                return Array.from(addons, addon => Version.data(addon).key);
            }
            default:
                return [];
        }
    }

}