import { ActionDialog } from "./actionDialog.js";
import { Constants } from "../../module/common/constants.js";
import { CustomHandlebarsHelpers } from "../../module/common/handlebars.js";
import { Liberer } from "../combat/manoeuver/liberer.js";
import { ManoeuverBuilder } from "../combat/manoeuver/manoeuverBuilder.js";
import { NephilimChat } from "../../module/common/chat.js";

export class AbstractFeature {

    /**
     * Constructor.
     * @param actor The actor which performs the action.
     */
    constructor(actor) {
        this.actor = actor;
    }

    /**
     * @returns the title of the action displayed in the action dialog.
     */
    get title() {
        throw new Error("AbstractFeature.title not implemented");
    }

    /**
     * @returns the sentence displayed in the action dialog or in the chat. The sentence will be localized by the action builder.
     */
    get sentence() {
        throw new Error("AbstractFeature.sentence not implemented");
    }

    /**
     * @returns the data of the action displayed in the action dialog. 
     */
    get data() {
        throw new Error("AbstractFeature.data not implemented");
    }

    /**
     * @returns the purpose of the action.
     */
    get purpose() {
        throw new Error("AbstractFeature.purpose not implemented");
    }

    /**
     * @returns the degre of the action.
     */
    get degre() {
        throw new Error("AbstractFeature.degre not implemented");
    }

    /**
     * Create an embedded item.
     */
    async drop() {
        throw new Error("AbstractFeature.drop not implemented");
    }

    /**
     * Delete the embedded item.
     */
    async delete() {
        throw new Error("AbstractFeature.delete not implemented");
    }

    /**
     * Edit the embedded item.
     */
    async edit() {
        throw new Error("AbstractFeature.edit not implemented");
    }

    /**
     * Finalize the roll which can be overrided.
     * @param result The roll result.
     */
    async finalize(result) {
    }

    /**
     * @returns the fraternite degre.
     */
    get fraternite() {
        let degre = 0;
        if (this.actor.system?.options?.fraternites === true) {
            for (let f of this.actor.fraternites.filter(a => a.system.options.active === true)) {
                const d = this.clone(f, this.item).degre;
                if (d != null && d > degre) {
                    degre = d;
                }
            }
        }
        return degre;
    }

    /**
     * @returns the total number of sapiences used to develop the capacity.
     */
    get sapiences() {
        return CustomHandlebarsHelpers.getSapiences(this.degre);
    }

    /**
     * @returns the number of sapiences points necessary to reach the next degre of the capacity.
     */
    get next() {
        const sapiences = CustomHandlebarsHelpers.getSapiences(this.degre + 1);
        return sapiences == null ? null : sapiences - this.sapiences;
    }

    /**
     * @returns the name of the original purpose item data.
     */
    get name() {
        return this?.item?.name;
    }

    /**
     * @returns the system identifier of the original purpose item data.
     */
    get sid() {
        return this?.item?.system?.id;
    }

    /**
     * @returns the image displayed in the action panel and the chat.
     */
    get img() {
        return this.data?.img;
    }

    /**
     * @param manoeuver The identifier of the manoeuver to set.
     * @returns the instance.
     */
    setManoeuver(manoeuver) {
        this.manoeuver = ManoeuverBuilder.create(manoeuver);
        return this;
    }

    /**
     * @param parameters All the action parameters.  
     * @returns the action difficulty.
     */
    difficulty(parameters) {

        const b = AbstractFeature.toInt(this.data?.base?.difficulty);
        const f = AbstractFeature.toInt(parameters?.fraternite);

        let base = null;
        switch (game.settings.get('neph5e', 'fraternitePolicy')) {
            case 'bonus':
                const ps = CustomHandlebarsHelpers.getSapiences(b / 10) + CustomHandlebarsHelpers.getSapiences(f / 10);
                base = CustomHandlebarsHelpers.getLevel(ps) * 10;
                break;
            case 'standard':
                base = Math.max(b, f);
                break;
        }

        return base
            + AbstractFeature.toInt(parameters?.modifier)
            + AbstractFeature.toInt(parameters?.approche)
            + AbstractFeature.toInt(parameters?.blessures, this.data.blessures)
            + this.modifier(parameters);

    }

    /**
     * @param parameters All the action parameters.
     * @returns the action modifier.
     */
    modifier(parameters) {
        return 0;
    }

    /**
     * Initialize the action. An action dialog is displayed, allowing the user to
     * customize the action roll by adding modifier for example.
     */
    async initializeRoll() {
        new ActionDialog(this.actor, this)
            .withTitle(this.title)
            .withData(this.data)
            .render(true);
    }

    /**
     * @param result The result to apply.
     */
    async apply(result) {
        if (this.manoeuver != null) {
            if (this.manoeuver.clearViser === true) {
                for (let w of this.actor.items.filter(i => i.type === 'arme' && (i.system.type === Constants.FEU || i.system.type === Constants.TRAIT))) {
                    await w.update({ ['system.cible']: null });
                    await w.update({ ['system.visee']: 0 });
                }
            }
            await this.manoeuver.apply(this);
        }
        const data = this.data;
        if (this.manoeuver != null) {
            data.sentence = game.i18n.localize("NEPH5E.manoeuvres." + this.manoeuver.id + ".sentence").replaceAll("${arme}", this?.weapon?.name);
        }
        if (this.manoeuver?.id === Liberer.ID) {
            data.sentence = "tente de" + data.sentence;
        }
        await new NephilimChat(this.actor)
            .withTemplate("systems/neph5e/feature/core/actionChat.hbs")
            .withData({
                actor: this.actor,
                sentence: data.sentence,
                richSentence: data.richSentence,
                img: data.img,
                difficulty: result.difficulty,
                total: result.roll._total,
                result: result.sentence,
                impact: this.impact()
            })
            .withRoll(result.roll)
            .withFlags(result.opposed ? {
                neph5e: {
                    opposed: {
                        actor: this.actor.id,
                        purpose: this.purpose,
                        result: result
                    }
                }
            } : {})
            .create();
        await this.finalize(result);
    }

    /**
     * Roll the action with the custom parameters.
     * @param parameters All the action parameters.  
     */
    async roll(parameters) {
        this.manoeuver = ManoeuverBuilder.create(parameters.manoeuver);
        const roll = await new Roll("1d100").roll({async: true});
        const result = this.resultOf(parameters, roll);
        await this.apply(result);
    }

    /**
     * Compare the dice roll with the specified difficulty.
     * @param parameters The roll parameters.
     * @param roll       The dice roll.
     * @return the result.
     */
    resultOf(parameters, roll) {
        const difficulty = this.difficulty(parameters);
        const fail = roll._total === 100 || (roll._total > difficulty && roll._total !== 1);
        const fumble = AbstractFeature.isDouble(roll._total) && fail;
        const critical = AbstractFeature.isDouble(roll._total) && !fail;
        const margin = fail ? 0 : Math.floor(roll._total / 10) + (difficulty > 100 ? Math.floor((difficulty - 100) / 10) : 0);
        let sentence = "";
        if (fumble) {
            sentence = "échoue de façon désastreuse";
        } else if (fail) {
                sentence = "échoue";
        } else {
            sentence = "réussit";
            if (critical) {
                sentence = sentence + " de façon spectaculaire";
            }
            if (margin !== 0) {
                sentence = sentence + " avec une marge de " + margin;
            }
        }
        return {
            difficulty: difficulty,
            roll: roll,
            opposed: parameters.opposed,
            success: !fail,
            fumble: fumble,
            critical: critical,
            margin: margin,
            sentence: sentence
        }
    }

    /**
     * @param manoeuver The optional identifier of the manoeuver to process.
     * @returns the allowed approches according to the actor and the manoeuver.
     */
    approches(manoeuver) {
        return manoeuver == null ? this.actor.approches() : ManoeuverBuilder.create(manoeuver).approchesOf(this.actor);
    }

    /**
     * @param manoeuver The identifier of the manoeuver, by default the registered one.
     * @returns the impact according to the weapon, the manoeuver and the actor.
     */
    impact(manoeuver) {
        if (manoeuver != null) {
            return ManoeuverBuilder.create(manoeuver).impactOf(this.actor, this.weapon);
        }
        if (this.manoeuver != null) {
            return ManoeuverBuilder.create(this.manoeuver.id).impactOf(this.actor, this.weapon);
        }
    }

    /**
     * @param manoeuver The identifier of the manoeuver, by default the registered one.
     * @returns the absorption according to the manoeuver and the actor.
     */
    absorption(manoeuver) {
        if (manoeuver != null) {
            return ManoeuverBuilder.create(manoeuver).absorptionOf();
        }
        if (this.manoeuver != null) {
            return ManoeuverBuilder.create(this.manoeuver.id).absorptionOf();
        }
    }

    /**
     * Delete the specified embedded item if exists.
     * @param sid The system identifier of the item to delete.
     * @returns the instance.
     */
    async deleteEmbeddedItem(sid) {
        const item = this.actor.items.find(i => i.sid === sid);
        if (item != null) {
            await this.actor.deleteEmbeddedDocuments('Item', item.id);
        }
        return this;
    }

    /**
     * Delete all specified embedded items.
     * @param sid The system identifier of the items to delete.
     * @returns the instance.
     */
    async deleteEmbeddedItems(sid) {
        for (let item of this.actor.items.filter(i => i.sid === sid)) {
            await this.actor.deleteEmbeddedDocuments('Item', item.id);
        }
        return this;
    }

    /**
     * @param sid The system identifier of the item for which to return the degre.
     * @returns the degre from the periodes.
     */
    degreFromPeriodes(sid) {
        let sum = 0;
        for (let item of this.actor.items.filter(i => i.sid === sid)) {
            const periode = this.actor.items.find(i => i.sid === item.system.periode);
            if (periode.actif === true) {
                sum = sum + item.system.degre;
            }
        }
        return sum;
    }
    
    /**
     * @param sid The system identifier of the item for which to return the details.
     * @returns the details by periode of the specified item.
     */
    detailsFromPeriodes(sid) {
        const details = [];
        const original = AbstractFeature.original(sid);
        if (original.type === 'competence') {
            for (let v of this.actor.items.filter(i => i.type === 'vecu' && AbstractFeature.isActive(this.actor, i))) {
                const item = game.items.find(i => i.sid === v.sid);
                if (v.system.competences.find(c => c === sid) != null) {
                    const degre = v.system.degre;
                    const sapiences = AbstractFeature.degreToSapiences(degre);
                    details.push({
                        name: item.name,
                        degre: degre,
                        sapiences: sapiences});
                }
            }
        } else {
            for (let item of this.actor.items.filter(i => i.sid === sid)) {
                const periode = AbstractFeature.embedded(this.actor, item.system.periode);
                details.push({
                    name: periode?.name,
                    degre: item.system.degre,
                    sapiences: "-"});
            }
        }
        return details;
    }

    /**
     * Edit the focus.
     * @param template The path of the template file.
     * @param data     The data used to build the html content.
     * @param title    The title of the panel to localize.
     * @param width    The width of the panel.
     * @param height   The height of the panel.
     */
    async edit(template, data, title, width, height) {

        // Create the dialog panel to display.
        const html = await renderTemplate(template, data);

        // Display the action panel
        await new Dialog({
            title: game.i18n.localize(title),
            content: html,
            buttons: {},
            default: null,
            close: () => {}
        }, {
            width: width,
            height: height,
            resizable: true
        }).render(true);

    }

    /**
     * @param degre The degre value, at least 0.
     * @returns the textual description of the degre.
     */
    static nameOfDegre(degre) {
        switch (degre) {
            case 0:
                return 'Profane';
            case 1:
                return 'Néophyte';
            case 2:
                return 'Apprenti';
            case 3:
                return 'Acolyte';
            case 4:
                return 'Compagnon';
            case 5:
                return 'Initié';
            case 6:
                return 'Maître';
            case 7:
                return 'Sage';
            case 8:
                return 'Vénérable';
            case 9:
                return 'Figure';
            case 10:
                return 'Agarthien';
            default:
                return 'Agarthien';
        }
    }

    /**
     * @param n The number to evaluate.
     * @returns true if a double has been rolled.
     */
    static isDouble(n) {
        return n === 11 || n === 22 || n === 33 || n === 44 || n === 55 || n === 66 || n === 77 || n === 88 || n === 99 || n === 100;
    }

    /**
     * @param value        The value to evaluate.
     * @param defaultValue The optional default value.
     * @returns the integer value or the default value or 0 if an error occurs.
     */
    static toInt(value, defaultValue) {
        return value == null ? (defaultValue == null ? 0 : defaultValue) : parseInt(value);
    }

    /**
     * @param sapiences The number of point of sapience.
     * @returns the degre which can be reached if the sapience points are spent.
     */
    static sapiencesToDegre(sapiences) {
        let degre = 0;
        let cost = 0;
        while (cost <= sapiences) {
            degre = degre + 1;
            cost = AbstractFeature.degreToSapiences(degre);
        }
        return degre - 1;
    }

    /**
     * @param degre The level to reach.
     * @returns the the total sapience point to reach the specified level.
     */
    static degreToSapiences(degre) {
        const costs = [0, 1, 3, 6, 10, 15, 25, 40, 60, 90, 140];
        return degre < 11 ? costs[degre] : 140 + (degre-10) * 100;
    }

    /**
     * @param sid The system identifier.
     * @returns the specified world item.
     */
    static original(sid) {
        return game.items.find(i => i.sid === sid);
    }

    /**
     * @param actor The actor object which owns the item.
     * @param sid   The system identifier. 
     * @returns the specified actor item.
     */
    static embedded(actor, sid) {
        return actor.items.find(i => i.sid === sid);
    }

    /**
     * @param actor The actor object which performs the action.
     * @param item  The embedded item object, purpose of the action.
     * @param scope Indicates if scope is 'actor' or 'simulacre'.
     * @return the item of the actor.
     */
    static embeddedOf(actor, item, scope) {
        const a = AbstractFeature.actor(actor,scope);
        const sid = item.system.id;
        return AbstractFeature.embedded(a,sid);
    }

    /**
     * @param actor The actor object which performs the action.
     * @param scope Indicates if scope is 'actor' or 'simulacre'.
     * @returns the targeted actor object according to the scope.
     */
    static actor(actor, scope) {
        switch (actor.type) {
            case 'figure':
                switch (scope) {
                    case 'actor':
                        return actor;
                    case 'simulacre':
                        return AbstractFeature.simulacre(actor);
                }
            case 'figurant':
                switch (scope) {
                    case 'actor':
                        return actor;
                    default:
                        throw new Error("Vecu.actor scope " + scope + " not implemented");
                }
            default:
                throw new Error("Vecu.actor type " + actor.type + " not implemented");
        }
    }

    /**
     * @param uuid The uuid of the actor or the token.
     * @returns the actor, null if an error occurs.
     */
    static async actorFromUuid(uuid, sync) {
        let data = sync ? fromUuidSync(uuid) : await fromUuid(uuid);
        if (data instanceof NephilimActor) {
            return actor;
        }
        if (data instanceof TokenDocument) {
            return data.actor;
        }
        return null;
    }

    /**
     * @param actor The actor object.
     * @returns the optional simulacre actor object.
     */
    static simulacre(actor) {
        return game.actors.find(a => a.sid === actor.system?.simulacre);
    }

    /**
     * @param actor The actor object which owns the items.
     * @param type  The type of items to get.
     * @returns pairs of embedded and world items of the specified type.
     */
    static items(actor, type) {
        const items = [];
        for (let e of actor.items.filter(i => i.type === type)) {
            const o = game.items.find(i => i.sid === e.sid);
            if (o != null) {
                items.push({embedded: e, original: o});
            }
        }
        return items;
    }

    /**
     * 
     * @param actor The actor object which owns the item. 
     * @param item  The embedded item object which is linked to a periode.
     * @return true if the linked periode is active.
     */
    static isActive(actor, item) {
        const periode = actor.items.find(i => i.sid === item.system.periode);
        return periode != null && periode.actif;
    }

    /**
     * @param action   The action roll result. 
     * @param reaction The reaction roll result.
     * @returns best action according to the specified rolls.
     */
    static winner(action, reaction) {
        if (action.critical) {
            if (reaction.critical) {
                if (action.margin > reaction.margin) {
                    return Constants.ACTION;
                } else if (reaction.margin > action.margin) {
                    return Constants.REACTION;
                } else {
                    return Constants.TIE;
                }
            } else {
                return Constants.ACTION;
            }
        } else if (action.fumble) {
            if (reaction.fumble) {
                return Constants.TIE;
            } else {
                return Constants.REACTION;
            }
        } else if (action.success) {
            if (reaction.critical) {
                return Constants.REACTION;
            } else if (reaction.success) {
                if (action.margin > reaction.margin) {
                    return Constants.ACTION;
                } else if (reaction.margin > action.margin) {
                    return Constants.REACTION;
                } else {
                    return Constants.TIE;
                }
            } else {
                return Constants.ACTION;
            }
        } else {
            if (reaction.success) {
                return Constants.REACTION;
            } else if (reaction.fumble) {
                return Constants.ACTION;
            } else {
                return Constants.TIE;
            }
        }
    }

}