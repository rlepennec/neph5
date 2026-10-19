import { AbstractFocus } from "../core/abstractFocus.js";
import { Incarnations } from "../../feature/incarnation/incarnations.js";
import { Version } from "../../module/common/version.js";
import { ActionDataBuilder } from "../core/actionDataBuilder.js";
import { Constants } from "../../module/common/constants.js";
import { Science } from "../science/science.js";

export class Formule extends AbstractFocus {

    /**
     * @Override
     */
    get title() {
        return 'Jet de Formule';
    }

    /**
     * @Override
     */
    get sentence() {
        return 'NEPHILIM.tenteSelfFormule';
    }

    /**
     * @Override
     */
    get data() {
        const data = new ActionDataBuilder(this)
            .withType(Constants.SIMPLE)
            .withItem(this.item)
            .withBase('Formule', this.degre)
            .withBlessures('magique')
            .export();
        // Les éléments proposés pour une quintuple : ceux dont l'acteur a assez de materiae.
        data.elementsQuintuple = this.elementsQuintuple();
        return data;
    }

    /**
     * @Override
     */
    async finalize(result) {

        if (Version.data(this.actor).options.gestionLaboratoire !== true) {
            return;
        }

        // If success, produce 1 dose
        if (result.success === true) {
            // La dose va à l'exemplaire de l'incarnation courante, créé au besoin
            const quantite = Version.data(this.embedded).quantite + 1;
            this.embedded = await new Incarnations(this.actor).ecrire(this.embedded, { quantite: quantite });

            // If not critical, spend materiae primae
            if (result.critical === false) {
                for (const [element, cout] of Object.entries(this.coutsEnMateriae())) {
                    const quantite = Math.max(0, this.actor.alchimie.primae[element].quantite - cout);
                    await new Incarnations(this.actor).ecrireAlchimie({ ['primae.' + element + '.quantite']: quantite });
                }
            }

        }

    }

    /**
     * Mémorise l'élément choisi au lancement d'une quintuple : c'est lui qui est consommé
     * (voir coutsEnMateriae).
     * @Override
     */
    async roll(parameters) {
        this.elementQuintuple = parameters?.elt ?? null;
        await super.roll(parameters);
    }

    /**
     * @returns les materiae primae d'un seul élément consommées par une quintuple : 5 par
     *          degré de la formule.
     */
    coutQuintuple() {
        return 5 * Version.data(this.item).degre;
    }

    /**
     * @returns les materiae primae de chaque élément consommées par une quintessence : 1 par
     *          degré de la formule.
     */
    coutQuintessence() {
        return Version.data(this.item).degre;
    }

    /**
     * @returns les éléments dont l'acteur a assez de materiae primae pour une quintuple.
     */
    elementsQuintuple() {
        return Constants.ELEMENTS.filter(e => (this.actor.alchimie.primae[e]?.quantite ?? 0) >= this.coutQuintuple());
    }

    /**
     * @returns l'élément d'une quintuple lancée sans choix : le premier dont l'acteur a assez
     *          de materiae primae, comme la liste du dialogue. Null s'il n'y en a aucun.
     */
    elementQuintupleParDefaut() {
        return this.elementsQuintuple()[0] ?? null;
    }

    /**
     * @returns les materiae primae consommées par une réalisation, par élément :
     *          - un élément simple : le degré de la formule ;
     *          - une quintuple : 5 × degré de l'élément choisi au lancement ;
     *          - une quintessence : degré de chaque élément.
     */
    coutsEnMateriae() {
        const couts = {};
        const ajouter = (element, cout) => couts[element] = (couts[element] ?? 0) + cout;
        for (const element of Version.data(this.item).elements) {
            switch (element) {
                case 'quintuple': {
                    const choisi = this.elementQuintuple ?? this.elementQuintupleParDefaut();
                    if (choisi != null) {
                        ajouter(choisi, this.coutQuintuple());
                    }
                    break;
                }
                case 'quintessence':
                    Constants.ELEMENTS.forEach(e => ajouter(e, this.coutQuintessence()));
                    break;
                default:
                    ajouter(element, Version.data(this.item).degre);
            }
        }
        return couts;
    }

    /**
     * @Override
     */
    modifier(parameters) {
        if (Version.data(this.item).elements[0] === 'quintuple') {
            const substance = Version.data(this.item).substance;
            const construct = this.actor.getConstruct(substance);
            if (parameters == null || parameters.elt == null) {
                const element = this.elementQuintupleParDefaut();
                return element == null ? 0 : construct[element] * 10;
            } else {
                return construct[parameters.elt] * 10;
            }
        } else {
            return 0;
        }
    }

    /**
     * @Override
     */
    get valeursInitiales() {
        return { focus: false, status: Constants.CONNU, quantite: 0, transporte: 0 };
    }

    /**
     * @Override
     */
    get champsDuMonde() {
        return ['description', 'degre', 'cercle', 'enonce', 'substance', 'aire', 'duree'];
    }

    /**
     * @Override
     */
    getEmbeddedData() {
        return {
            difficulty: this.degre
        }
    }

    /**
     * @returns the owner actor of the used laboratory.
     */
    getOwner() {
        if (this.actor.type === 'figure') {
            const sid = this.actor.alchimie.courant;
            return sid == null ? this.actor : game.actors.find(i => i.sid === sid);
        } else {
            return null;
        }
    }

    /**
     * @return -100 if uncastable, the value otherwise
     */
    get rawDegre() {

        if (this.embedded == null) {
            return -100;
        }

        if (Version.data(this.embedded).status === 'connu') {
            return -101;
        }

        if (Version.data(this.embedded).focus !== true && Version.data(this.embedded).status === 'dechiffre') {
            return -102;
        }

        // Retrieve the degre of the cercle used to cast the focus
        const science = Science.scienceOf(this.actor, Version.data(this.item).cercle).degre;
        if (science === 0) {
            return -107;
        }

        const owner = this.getOwner();
        const construct = owner == null ? null : owner.getConstruct(Version.data(this.item).substance);

        // Construct inactif
        if (construct?.active !== true) {
            return -108;
        }

        // Construct pas au niveau requis
        if (construct.degre === "oeuvreAuNoir" && (Version.data(this.item).cercle === "oeuvreAuBlanc" || Version.data(this.item).cercle === "oeuvreAuRouge")) {
            return -109;
        }

        // Construct pas au niveau requis
        if (construct.degre === "oeuvreAuBlanc" && Version.data(this.item).cercle === "oeuvreAuRouge") {
            return -109;
        }

        // Vous ne possédez pas les materiae primae necessaires
        for (let element of Version.data(this.item).elements) {

            switch (element) {
                case 'air':
                case 'eau':
                case 'feu':
                case 'lune':
                case 'terre':
                    if (this.actor.alchimie.primae[element].quantite < Version.data(this.item).degre) {
                        return -110;
                    }
                    break;

                // Au moins un élément pourvu de 5 × degré materiae primae.
                case 'quintuple':
                    if (this.elementsQuintuple().length === 0) {
                        return -110;
                    }
                    break;

                // Degré materiae primae de chaque élément.
                case 'quintessence':
                    if (Constants.ELEMENTS.some(e => this.actor.alchimie.primae[e].quantite < this.coutQuintessence())) {
                        return -110;
                    }
                    break;

            }

        }

        // Retrieve all elements used to cast the focus
        // All elements must be owned by the construct
        let ka = 0;
        switch (Version.data(this.item).cercle) {
            case 'oeuvreAuNoir':
                ka = construct[Version.data(this.item).elements[0]] ?? 0
                if (ka < 1) {
                    return -111;
                }
                break;
            case 'oeuvreAuBlanc':
                ka = Math.min(construct[Version.data(this.item).elements[0]] ?? 0, construct[Version.data(this.item).elements[1]] ?? 0);
                if (ka < 1) {
                    return -111;
                }
                break;
            case 'oeuvreAuRouge':
                switch (Version.data(this.item).elements[0]) {
                    case 'quintessence':
                        ka = Math.min(construct['air'], construct['eau'], construct['feu'], construct['lune'], construct['terre']);
                        if (ka < 1) {
                            return -111;
                        }
                        break;
                    case 'quintuple':
                        ka = 0;
                        break;
                }
                break;
        }

        // Retrieve the degre of the focus to cast
        const focus = Version.data(this.item).degre;

        // Final result
        return science + ka - focus;




    }

}