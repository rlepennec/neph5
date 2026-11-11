import { DocumentIdentifier } from "./documentIdentifier.js";
import { Version } from "./version.js";

export class CustomHandlebarsHelpers {

    /**
     * @param sid The system id of the item to get.
     * @returns the identifier of the specified document.
     */
    static getIdentifier(sid) {
        const item = game.items.find(i => i.system.id === sid);
        return item == null ? "null" : new DocumentIdentifier(item);
    }

    /**
     * @param sid The system id of the item to get.
     * @returns the full system identifier of the specified document.
     */
    static fsid(source) {
        if (source instanceof String || typeof source === "string") {
            const item = game.items.find(i => i.system.id === source);
            return item == null ? "null" : new DocumentIdentifier(item).fsid;
        }
        if (source instanceof Item) {
            return new DocumentIdentifier(source).fsid;
        }
        return "null";
    }

    /**
     * @param words The words to translate. 
     * @returns the concated words.
     */
    static translate(word) {
        return game.i18n.localize(`NEPHILIM.${word}`);
    }

    static range(from, to, block) {
        let out = "";
        for (let i = from; i <= to; i++) {
            out += block.fn(i);
        }
        return out;
    }

    /**
     * Normalise des options en map { valeurStockée : libelléAffiché }.
     * - array (elements, mondes, appels…) : la valeur EST la clé i18n → traduite.
     * - map en dur (clé sans '@', valeur = clé i18n, ex. basseMagie) → traduite.
     * - map addon (clé avec '@', valeur = nom de l'item, ex. denier@architecte) → nom brut.
     */
    static selectChoices(choices) {
        const out = {};
        if (Array.isArray(choices)) {
            for (const c of choices) {
                out[c] = game.i18n.localize('NEPHILIM.' + c);
            }
        } else if (choices != null) {
            for (const key of Object.keys(choices)) {
                out[key] = String(key).includes('@')
                    ? choices[key]
                    : game.i18n.localize('NEPHILIM.' + choices[key]);
            }
        }
        return out;
    }

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
     * @param html The HTML content to check.
     * @returns true if the content is null or visually empty (only empty tags, whitespace or &nbsp;).
     */
    static isEmptyHtml(html) {
        if (html == null) {
            return true;
        }
        const text = String(html)
            .replace(/<[^>]*>/g, '')
            .replace(/&nbsp;/gi, ' ')
            .replace(/&#160;/g, ' ')
            .trim();
        return text === '';
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
     * Gets the specified item.
     * @param sid The system id of the item to get.
     * @returns the item or undefined if not found.
     */
    static getItem(uuid) {
        return game.items.find(i => i.sid === uuid);
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
        return new Handlebars.SafeString(html ?? "");
    }
    
    /**
     * @param words The words to concat. 
     * @returns the concated words.
     */
    /**
     * Lit un champ versionné d'un document qui n'est pas celui de la fiche — un item
     * d'une liste sur la feuille d'acteur, typiquement. Le gabarit ne peut pas savoir si
     * le document est porté aux versions : le helper le résout, avec le même repli que
     * Version.data.
     * @param document The document to read.
     * @param field    The field name.
     * @param version  The version, the world one if omitted.
     * @returns the value.
     */
    static versionValue(document, field, version) {
        return Version.data(document, typeof version === "string" ? version : null)?.[field];
    }

    /**
     * Le préfixe d'écriture d'un document listé — 'system' ou 'system.versions.v5' —
     * pour composer l'attribut name d'un champ de saisie.
     * @param document The document to write to.
     * @param version  The version, the world one if omitted.
     * @returns the prefix.
     */
    static versionPrefix(document, version) {
        return Version.prefix(document, typeof version === "string" ? version : null);
    }

    static concat(...words) {
        words.pop();
        return words.join('');
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
     * @param option The identifier of the option to retrieve.
     * @returns the option value.
     */
    static getSystemOption(option) {
        return game.settings.get('neph5e', option);
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