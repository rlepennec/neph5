import { Constants } from "./module/constants.js";
import { DocumentIdentifier } from "./module/documentIdentifier.js";

export class CustomHandlebarsHelpers {

    static register() {

        Handlebars.registerHelper({

            getIdentifier: CustomHandlebarsHelpers.getIdentifier,
            getItem: CustomHandlebarsHelpers.getItem,
            translate: CustomHandlebarsHelpers.translate,

            
            concat: CustomHandlebarsHelpers.concat,
            isNull: CustomHandlebarsHelpers.isNull,
            nonNull: CustomHandlebarsHelpers.nonNull,
            select: CustomHandlebarsHelpers.select,
            loop: CustomHandlebarsHelpers.loop,
            log: CustomHandlebarsHelpers.log,
            html: CustomHandlebarsHelpers.html,
            includes: CustomHandlebarsHelpers.includes,
            sum: CustomHandlebarsHelpers.sum,
            getSapiences: CustomHandlebarsHelpers.getSapiences,
            getLevel: CustomHandlebarsHelpers.getLevel,
            getSapiences: CustomHandlebarsHelpers.getSapiences,
            getNextCost: CustomHandlebarsHelpers.getNextCost,
            isEmptyCollection: CustomHandlebarsHelpers.isEmptyCollection,
            isEmptyString: CustomHandlebarsHelpers.isEmptyString,
            isContact: CustomHandlebarsHelpers.isContact,
            cercles: CustomHandlebarsHelpers.cercles,
            focus: CustomHandlebarsHelpers.focus,
            numberOfFocus: CustomHandlebarsHelpers.numberOfFocus,
            sciences: CustomHandlebarsHelpers.sciences,
            savoir: CustomHandlebarsHelpers.savoir,
            laboratoryOwner: CustomHandlebarsHelpers.laboratoryOwner,
            constructOf: CustomHandlebarsHelpers.constructOf,
            getMaxBaseMP: CustomHandlebarsHelpers.getMaxBaseMP,
            getMaxFinalMP: CustomHandlebarsHelpers.getMaxFinalMP,
            science: CustomHandlebarsHelpers.science,
            fraterniteBonus: CustomHandlebarsHelpers.fraterniteBonus,
            getSystemOption: CustomHandlebarsHelpers.getSystemOption,
            minus: (v1, v2) => v1 - v2,
        });

    }

    /**
     * @param sid The system id of the item to get.
     * @returns the identifier of the specified document.
     */
    static getIdentifier(sid) {
        const item = game.items.find(i => i.system.sid === sid);
        return item == null ? "null" : new DocumentIdentifier(item);
    }

    /**
     * @param sid The system id of the item to get.
     * @returns the specified item or undefined if not found.
     */
    static getItem(sid) {
        return game.items.find(i => i.system.sid === sid);
    }

    /**
     * @param words The words to translate. 
     * @returns the concated words.
     */
    static translate(word) {
        return game.i18n.localize(`NEPHILIM.${word}`);
    }


/*
game.settings.set("nephilim", "mySetting", "new value");
*/















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
        } else if (collection instanceof Set) {
            return collection.size === 0;
        } else {
            return Object.keys(collection).length === 0;
        }
    }

    /**
     * A helper to assign an `<option>` within a `<select>` block as selected based on its value
     * Escape the string as handlebars would, then escape any regexp characters in it
     * @param {string} value    The value of the option
     * @returns {Handlebars.SafeString}
     *
     * @example
     * ```hbs
     * <select>
     * {{#select selected}}
     *   <option value="a">Choice A</option>
     *   <option value="b">Choice B</option>
     * {{/select}}
     * </select>
     */
    static select(selected, options) {
        const escapedValue = RegExp.escape(Handlebars.escapeExpression(selected));
        const rgx = new RegExp(' value=[\"\']' + escapedValue + '[\"\']');
        const html = options.fn(this);
        return html.replace(rgx, "$& selected");
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
        return collection?.includes(item);
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
     * @param option The identifier of the option to retrieve.
     * @returns the option value.
     */
    static getSystemOption(option) {
        return game.settings.get('neph5e', option);
    }





}