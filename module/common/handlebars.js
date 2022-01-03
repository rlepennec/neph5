import { NephilimActor } from "../actor/entity.js";

export class CustomHandlebarsHelpers {

    /**
     * Gets the specified actor.
     * @param uuid The uuid of the actor to get.
     * @returns the actor or undefined if not found.
     */
    static getActor(uuid) {
        return game.actors.find(a => a.data.data.id === uuid);
    }

    /**
     * Gets the specified item.
     * @param uuid The uuid of the item to get.
     * @returns the item or undefined if not found.
     */
    static getItem(uuid) {
        return game.items.find(i => i.data.data.id === uuid);
    }

    /**
     * Gets the specified items.
     * @param type The type of the items to get.
     * @returns the array of matching items.
     */
    static getItems(type) {
        return Array.from(game.items.values()).filter(i => i.data.type === type);
    }

    /**
     * Gets the number of elements in the specified array.
     * @param array The array to watch.
     * @returns the number of elements.
     */
    static getCount(array) {
        return array.length;
    }

    /**
     * Gets the level of the specified science for the specified character.
     * @param actor   The uuid of the character.
     * @param science The name of the science.
     * @returns the level of the science.
     */
    static getScience(actor, science) {
        return CustomHandlebarsHelpers.getActor(actor).getScience(science);
    }

    static getLevel(ps) {
        let degre = 0;
        let cost = 0;
        while (cost <= ps) {
            degre = degre + 1;
            cost = NephilimActor.getCostTo(degre);
        }
        return degre - 1;
    }

    /**
     * Gets the vecus according to the specified character and the active periodes.
     * @param actor The uuid of the actor for which to create the vecus. 
     * @returns the vecus to display in the character sheet.
     */
    static getVecus(actor) {
        const vecus = [];
        for (let p of CustomHandlebarsHelpers.getActor(actor).data.data.periodes) {
            if (p.active === true) {
                for (let v of p.vecus) {
                    const periode = CustomHandlebarsHelpers.getItem(p.refid);
                    const vecu = CustomHandlebarsHelpers.getItem(v.refid);
                    vecus.push({
                        refid: v.refid,
                        name: vecu.data.name,
                        degre: v.degre,
                        contexte: periode.data.data.contexte
                    });
                }
            }
        }
        return vecus;
    }

    /**
     * Gets the competences according to the specified character and the active periodes.
     * @param actor The uuid of the actor for which to create the competences. 
     * @returns the competences to display in the character sheet.
     */
    static getCompetences(actor) {
        const competences = [];
        const a = CustomHandlebarsHelpers.getActor(actor);
        for (let c of CustomHandlebarsHelpers.getItems('competence')) {
            competences.push({
                refid: c.data.data.id,
                name: c.data.name,
                degre: a.getCompetence(c),
                sum: a.getCompetenceSum(c),
                next: NephilimActor.getCostTo(a.getCompetence(c) + 1)
            });
        }
        return competences;
    }

    /**
     * Gets the items according to the specified character and the active periodes.
     * @param actor The uuid of the actor for which to create the competences.
     * @param items The items to get. Allowed items are:
     *   quetes,
     *   savoirs,
     *   arcanes,
     *   chutes,
     *   passes
     * @returns the competences to display in the character sheet.
     */
    static getLevels(actor, items) {
        return CustomHandlebarsHelpers.getActor(actor).getLevelsFrom(items);
    }

    static isMelee(skill) {
        return skill === 'martial' || skill === 'melee';
    }

    /**
     * Gets the score of the specified actor.
     * @param actor The uuid of the actor for which to create the score.
     * @returns the score.
     */
    static getScore(actor) {
        return 0;
    }

    /**
     * @return true if the current user can edit items.
     */
    static canEditItem(options) {
        if (game.user.isGM) {
            return options.fn(this);
        } else {
            return options.inverse(this);
        }
    }

    /**
     * Logs the specified value.
     * @param the value to log.
     */
    static log(value) {
        console.log(value);
    }

    /**
     * Loop each times.
     * @param {*} from  The intitial index.
     * @param {*} to    The final index.
     * @param {*} incr  The step between indexes.
     * @param {*} block The block to add.
     */
    static loop(from, to, incr, block) {
        var accum = '';
        for (var i = from; i < to; i += incr)
            accum += block.fn(i);
        return accum;
    }

    /**
     * Interprets the specified string as HTML content.
     * @param {} html 
     * @returns 
     */
    static html(html) {
        return new Handlebars.SafeString(html);
    }

}