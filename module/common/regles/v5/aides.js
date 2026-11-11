import { Constants } from "../../constants.js";
import { IncarnationsV5 } from "../../../../feature/incarnation/regles/v5/incarnations.js";
import { Version } from "../../version.js";

/**
 * Les aides Handlebars des règles v5 : sciences, focus, sapience, laboratoire, combat. Le jeu v5 les
 * enregistre pour ses gabarits (aides, voir Regles) ; getSapiences ne sert qu'au code.
 */
export class AidesV5 {

    /**
     * @param science The key of the science.
     * @returns l'en-tête propre à la science dans la fiche, null si elle n'en a pas.
     */
    static scienceHeader(science) {
        const path = `systems/neph5e/feature/${science}/regles/v5/actor/header.hbs`;
        return Handlebars.partials[path] != null ? path : null;
    }

    /**
     * @param {*} ps The number of sapience points.
     * @returns the reached level.  
     */
    static getLevel(ps) {
        let degre = 0;
        let cost = 0;
        while (cost <= ps) {
            degre = degre + 1;
            cost = AidesV5.getSapiences(degre);
        }
        return degre - 1;
    }

    /**
     * Gets the total sapience point to reach the specified level.
     * @param degre The level to reach.
     * @returns the number of sapience points.
     */
    static getSapiences(degre) {
        const costs = [0, 1, 3, 6, 10, 15, 25, 40, 60, 90, 140];
        return degre < 0 ? null : degre < 11 ? costs[degre] : 140 + (degre-10) * 100;
    }

    /**
     * Gets the number points of sapience to spend to reach a skill level to one degre.
     * @param {Integer} degre The actual level which must be in [0.. +[.
     * @returns the number of points of sapience to reach the next level.
     */
    static getNextCost(degre) {
        const costs = [0, 1, 2, 3, 4, 5, 10, 15, 20, 30, 100];
        return costs[degre+1];
    }

    /**
     * @param type The type of weapon.
     * @returns true if the weapon is used for cac.
     */
    static isContact(type) {
        return type === Constants.NATURELLE || type === Constants.MELEE;
    }
   

    /**
     * @param item An embedded item.
     * @returns its degre, summed over the incarnations which count — or the one it carries
     *          itself, for an actor without incarnations.
     */
    static degreIncarne(item) {
        const incarnations = new IncarnationsV5(item?.parent);
        return incarnations.porte ? incarnations.degre(item.sid) : Version.data(item).degre;
    }

    /**
     * @param actor   The actor object.
     * @param science The key of the science.
     * @returns the science .
     */
    static science(actor, science) {
        return actor.regles.science(science);
    }

    /**
     * @param actor   The actor object.
     * @param science The key of the savoir.
     * @returns the savoir .
     */
    static savoir(actor, savoir) {
        return actor.regles.savoir(savoir);
    }

    /**
     * @param actor   The actor object.
     * @param science The type 'sort', 'formule' etc...
     * @param all     True, all cercles are returned.
     * @returns the information datas about the specified cercles.
     */
    static cercles(actor, science, all = false) {
        const options = {
            all: all
        }
        return actor.regles.cercles(science, options);
    }

    /**
     * @param actor   The actor object.
     * @param science The name of the science.
     * @returns the owned focus of the actor. 
     */
    static focus(actor, science) {
        return actor.regles.focus(science);
    }

    /**
     * @param actor   The actor object.
     * @param science The name of the science.
     * @returns the number of focus owned by the actor.
     */
    static numberOfFocus(actor, science) {
        return actor.regles.numberOfFocus(science);
    }

    /**
     * @returns all sciences names.
     */
    static sciences() {
        return [
            'basseMagie',
            'hauteMagie',
            'grandSecret',
            'comprendre',
            'controler',
            'creer',
            'daath',
            'detruire',
            'transformer',
            'malkut',
            'yesod',
            'hod',
            'netzach',
            'tiphereth',
            'geburah',
            'chesed',
            'binah',
            'chokmah',
            'kether',
            'oeuvreAuNoir',
            'oeuvreAuBlanc',
            'oeuvreAuRouge',
            'fossoyeur',
            'embaumeur',
            'imputrescible',
            'charmeur',
            'dresseur',
            'demiurge',
            'architecte',
            'guide',
            'mage',
            'ouvrier',
            'roi',
            'sage',
            "universelle"
        ];
    }

    /**
     * @param actor The actor which uses the laboratory.
     * @returns the owner actor of the laboratory.
     */
    static laboratoryOwner(actor) {
        const sid = actor.regles.alchimie.courant;
        return sid == null ? actor : game.actors.find(i => i.sid === sid);
    }

    /**
     * @param actor  The actor which uses the laboratory.
     * @param element The element for which to retrieve to max MP.
     * @returns the maximum number of materiae primae only based on the construct.
     */
    static getMaxBaseMP(actor, element) {
        return actor.regles.getMaxBaseMP(element);
    }

    /**
     * @param actor  The actor which uses the laboratory.
     * @param element The element for which to retrieve the max MP.
     * @returns the maximum number of materiae primae.
     */
    static getMaxFinalMP(actor, element) {
        return actor.regles.getMaxBaseMP(element) + actor.regles.alchimie.primae[element].max;
    }

    /**
     * @param degre The degre.
     * @returns the bonus.
     */
    static fraterniteBonus(degre) {
        if (degre < 1) {
            return 0;
        }
        if ([1,2,3].includes(degre)) {
            return 1;
        }
        if ([4,5,6].includes(degre)) {
            return 2;
        }
        if ([7,8,9].includes(degre)) {
            return 3;
        }
        return 4;
    }

}

/**
 * Les aides enregistrées, par nom de gabarit.
 */
export const AIDES_V5 = {
    scienceHeader: AidesV5.scienceHeader,
    getLevel: AidesV5.getLevel,
    getNextCost: AidesV5.getNextCost,
    isContact: AidesV5.isContact,
    degreIncarne: AidesV5.degreIncarne,
    science: AidesV5.science,
    savoir: AidesV5.savoir,
    cercles: AidesV5.cercles,
    focus: AidesV5.focus,
    numberOfFocus: AidesV5.numberOfFocus,
    sciences: AidesV5.sciences,
    laboratoryOwner: AidesV5.laboratoryOwner,
    getMaxBaseMP: AidesV5.getMaxBaseMP,
    getMaxFinalMP: AidesV5.getMaxFinalMP,
    fraterniteBonus: AidesV5.fraterniteBonus
};
