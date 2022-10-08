import { AbstractRoll } from "../core/abstractRoll.js";
import { ActionDataBuilder } from "../core/actionDataBuilder.js";
import { Constants } from "../../module/common/constants.js";
import { CustomHandlebarsHelpers } from "../../module/common/handlebars.js";
import { Game } from "../../module/common/game.js";

export class Competence extends AbstractRoll {

    /**
     * Constructor.
     * @param actor The actor object which performs the action.
     * @param item  The embedded item object, purpose of the action. 
     */
    constructor(actor, item) {
        super(actor);
        this.item = item;
    }

    /**
     * The name of the manoeuver to registrer, 'esquive' or 'lutte'.
     * @returns the instance.
     */
    withManoeuver(manoeuver) {
        this.manoeuver = manoeuver;
        return this;
    }

    /**
     * @Override
     */
    get title() {
        return "Jet de Compétence";
    }

    /**
     * @Override
     */
    get sentence() {
        return 'NEPH5E.tente.self.competence';
    }

    /**
     * @Override
     */
    get data() {
        return new ActionDataBuilder(this)
            .withItem(this.item)
            .withBase(this.item.name, this.degre)
            .withBlessures(Constants.PHYSICAL)
            .withApproches(this.approches())
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
        return AbstractRoll.sapiencesToDegre(this.sapiences);
    }

    /**
     * @Override
     */
    get sapiences() {
        let total = 0;
        for (let vecu of this.actor.items.filter(v =>
            v.type === 'vecu' &&
            AbstractRoll.isActive(this.actor, v) &&
            v.system.competences.find(c => c === this.sid) != null)) {
            total = total + CustomHandlebarsHelpers.getSapiences(vecu.system.degre);
        }
        return total;
    }

    /**
     * @returns the vecus which contains the competence.
     */
    get vecus() {
        const vecus = [];
        for (let v of this.actor.items.filter(i => i.type === 'vecu')) {
            if (v.system.competences.find(c => c === this.sid) != null) {
                vecus.push(v);
            }
        }
        return vecus;
    }

    /**
     * @Override
     */
    async edit() {
        await super.edit(
            "systems/neph5e/feature/periode/item/competence.html",
            {
                item: game.items.get(this.item._id),
                system: this.item.system,
                debug: game.settings.get('neph5e', 'debug'),
                periodes: this.detailsFromPeriodes(this.sid),
                degre: this.degre,
                sapience: this.sapiences,
                next: this.next,
                elements: Game.pentacle.elements
            },
            'ITEM.TypeCompetence',
            560,
            500
        )
    }

    /**
     * @Override
     */
    async drop() {

        // Process the drop on the manoeuver definition
        if (this.manoeuver != null) {
            await this.actor.update({ ['system.manoeuvres.' + this.manoeuver]: this.sid });
        }

    }

    /**
     * Gets the competences according to the specified character and the active periodes.
     * @param actor The actor object. 
     * @returns the competences to display in the character sheet.
     */
    static getAll(actor) {
        const competences = [];
        for (let c of Array.from(game.items.values())
            .filter(i => i.type === 'competence')
            .sort((a, b) => (a.name > b.name ? 1 : -1))) {
            const feature = new Competence(actor, c);
            competences.push({
                name: c.name,
                id: c.id,
                sid: feature.sid,
                degre: feature.degre
            });
        }
        return competences;
    }

}