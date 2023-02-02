import { Constants } from "./constants.js";

export class CustomHandlebarsHelpers {

    /**
     * @param value The value to check.
     * @returns true if the specified value is null or undefined.
     */
    static isNull(value) {
        return value == null;
    }

    /**
     * @param value The value to check.
     * @returns true if the specified value is null or undefined.
     */
    static nonNull(value) {
        return value != null;
    }

    /**
     * @param str The textual expression to check. 
     * @returns true if the specified string is null or empty.
     */
    static isEmptyString(str) {
        return str == null || str.trim() === '';
    }

    /**
     * @param collection The collection to watch.
     * @returns true if the collection is empty.
     */
    static isEmptyCollection(collection) {
        if (collection == null) {
            return true;
        }
        if (Array.isArray(collection) === true) {
            return collection.length === 0;
        } else {
            return Object.keys(collection).length === 0;
        }
    }

    /**
     * Gets the specified item.
     * @param sid The system id of the item to get.
     * @returns the item or undefined if not found.
     */
    static getItem(uuid) {
        return game.items.find(i => i.sid === uuid);
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
            cost = CustomHandlebarsHelpers.getSapiences(degre);
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
     * @param the value to log.
     */
    static log(value) {
        console.log(value);
    }

    /**
     * Loop each times.
     * @param from  The intitial index.
     * @param to    The final index.
     * @param incr  The step between indexes.
     * @param block The block to add.
     */
    static loop(from, to, incr, block) {
        var accum = '';
        for (var i = from; i < to; i += incr)
            accum += block.fn(i);
        return accum;
    }

    /**
     * @param html The texutual content to display.
     * @returns The html content to display.
     */
    static html(html) {
        return new Handlebars.SafeString(html);
    }

    /**
     * @param content The intial content.
     * @param owner   The document owner.
     * @returns the enriched HTML content with links and secret contents.
     */
    static enrichHTML(content, owner) {
        return TextEditor.enrichHTML(content, {secrets: owner, async: false});
    }
    
    /**
     * @param words The words to concat. 
     * @returns the concated words.
     */
    static concat(...words) {
        words.pop();
        return words.join('');
    }

    /**
     * @param terms The terms to add.
     * @returns the sum of the terms.
     */
    static sum(...terms) {
        terms.pop();
        return terms.reduce((a, b) => parseInt(a) + parseInt(b), 0)
    }

    /**
     * @param collection The collection to watch.
     * @param item       The item to check.
     * @returns true if the colllection includes the specified item.
     */
    static includes(collection, item) {
        return collection.includes(item);
    }

    /**
     * @param actor    The actor object.
     * @param sciences The name of the sciences.
     * @returns true if at least a science must be displayed.
     */
    static displaySciences(actor, ...sciences) {
        return actor.displaySciences(sciences);
    }

    /**
     * @param actor   The actor object.
     * @param science The name of the science.
     * @returns true if science must be displayed.
     */
    static displayScience(actor, science) {
        return actor.displayScience(science);
    }

    /**
     * @param actor   The actor object.
     * @param science The key of the science.
     * @returns the level of the science.
     */
    static science(actor, science) {
        return actor.science(science);
    }

    /**
     * @param actor   The actor object.
     * @param science The name of the science.
     * @param all     True if all cercles with base, false without base.
     * @returns true if at least a cercles of the science must be displayed.
     */
    static displaySciencesOf(actor, science, all) {
        const keys = Object.keys(CustomHandlebarsHelpers.cerclesOf(science, all))
        return actor.displaySciences(keys);
    }

    /**
     * @param science The name of the science for which to retrieve the cercle.
     * @param all     True if all cercles with base, false without base.
     * @returns the cercles of the science based on the 
     */
    static cerclesOf(science, all) {
        const base = {};
        switch (science) {
            case 'analogie':
                if (all === true) {
                    base.comprendre = "NEPH5E.comprendre";
                    base.controler = "NEPH5E.controler";
                    base.creer = "NEPH5E.creer";
                    base.detruire = "NEPH5E.detruire";
                    base.transformer = "NEPH5E.transformer";
                }
                for (let i of game.items.filter(i => i.type === 'science')) {
                    if (i.system.key.substring(0, 9) === "analogie@") {
                        base[i.system.key] = i.name;
                    }
                }
        }
        return base;
    }

    /**
     * @param actor   The actor object.
     * @param science The name of the science.
     * @returns the owned focus of the actor. 
     */
    static focus(actor, science) {
        return actor.focus(science);
    }

    /**
     * @param actor   The actor object.
     * @param science The name of the science.
     * @returns the number of focus owned by the actor.
     */
    static numberOfFocus(actor, science) {
        return actor.numberOfFocus(science);
    }

    /**
     * @param fraternite The fraternite actor object.
     * @param actor      The actor identifier.
     * @param periode    The periode system identifier.
     * @returns true if new member for the periode (in), false is out
     */
    static isNewMember(fraternite, actor, periode) {
        return fraternite.isNewMember(actor, periode);
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
            'sage'
        ];
    }

    /**
     * @param actor The actor which uses the laboratory.
     * @returns the owner actor of the laboratory.
     */
    static laboratoryOwner(actor) {
        const sid = actor.system.alchimie.courant;
        return sid == null ? actor : game.actors.find(i => i.sid === sid);
    }

    /**
     * @param actor     The actor which uses the laboratory.
     * @param construct The name of the construct.
     * @returns the construct parameters, null if the owner.
     */
    static constructOf(actor, construct) {
        const sid = actor.system.alchimie.courant;
        if (sid == null) {
            return null;
        }
        const owner = game.actors.find(i => i.sid === sid);
        return owner == null ? null : owner.system.alchimie.constructs[construct];
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

    /**
     * Defines a fast UUID generator compliant with RFC4122 version 4.
     */
    static UUID() {
        let lut = [];
        for (let i = 0; i < 256; i++) {
            lut[i] = (i < 16 ? '0' : '') + (i).toString(16);
        }
        let d0 = Math.random() * 0xffffffff | 0;
        let d1 = Math.random() * 0xffffffff | 0;
        let d2 = Math.random() * 0xffffffff | 0;
        let d3 = Math.random() * 0xffffffff | 0;
        let result =
            lut[d0 & 0xff] + lut[d0 >> 8 & 0xff] + lut[d0 >> 16 & 0xff] + lut[d0 >> 24 & 0xff] + '-' +
            lut[d1 & 0xff] + lut[d1 >> 8 & 0xff] + lut[d1 >> 16 & 0xff] + lut[d1 >> 24 & 0xff] + '-' +
            lut[d2 & 0xff] + lut[d2 >> 8 & 0xff] + lut[d2 >> 16 & 0xff] + lut[d2 >> 24 & 0xff] + '-' +
            lut[d3 & 0xff] + lut[d3 >> 8 & 0xff] + lut[d3 >> 16 & 0xff] + lut[d3 >> 24 & 0xff];
        return result;
    }

}