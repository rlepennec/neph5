import { AbstractRoll } from "../core/abstractRoll.js";
import { ActionDataBuilder } from "../core/actionDataBuilder.js";
import { EmbeddedItem } from "../../module/common/embeddedItem.js";
import { Constants } from "../../module/common/constants.js";
import { Game } from "../../module/common/game.js";

export class Vecu extends AbstractRoll {

    /**
     * Constructor.
     * @param actor   The actor object which performs the action.
     * @param item    The embedded item object, purpose of the action.
     * @param scope   Indicates if scope is 'actor' or 'simulacre'.
     */
    constructor(actor, item, scope) {
        super(actor);
        this.item = item;
        this.scope = scope;
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
        return "Jet de Vécu";
    }

    /**
     * @Override
     */
    get sentence() {
        switch (this.actor.type) {
            case 'figure':
                switch (this.scope) {
                    case 'actor':
                        return 'NEPH5E.tente.self.vecu-de';
                    case 'simulacre':
                        return 'NEPH5E.tente.simulacre.vecu-de';
                    default:
                        throw new Error("Vecu.sentence scope " + this.scope + " not implemented");
                }
            case 'figurant':
                return 'NEPH5E.tente.self.vecu-de';
            default:
                throw new Error("Vecu.sentence actor type " + this.actor.type + " not implemented");
        }
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
        return this.item.system.degre;
    }

    /**
     * @Override
     */
    async drop() {

        // Process the drop on the incarnation
        if (this.periode != null &&
            this.actor.items.find(i => i.sid === this.sid && i.system.periode === this.periode) == null) {
            await new EmbeddedItem(this.actor, this.sid)
                .withContext("Drop of a vecu on periode " + this.periode)
                .withData("degre", 0)
                .withData("mnemos", [])
                .withData("periode", this.periode)
                .withData("element", this.item.system.element)
                .withoutData('description')
                .withoutAlreadyEmbeddedError()
                .create();
        }

        // Process the drop on the manoeuver definition
        if (this.manoeuver != null) {
            if (this.actor.items.find(i => i.sid === this.sid)) {
                await this.actor.update({ ['system.manoeuvres.' + this.manoeuver]: this.sid });
            } else {
                ui.notifications.warn(game.i18n.localize('NEPH5E.vecuNonDefini').replaceAll("${item}", this.name));
            }
            
        }

    }

    /**
     * @Override
     */
    async edit() {
        await super.edit(
            "systems/neph5e/feature/periode/item/vecu.html",
            {
                system: this.item.system,
                elements: Game.pentacle.elements,
                item: AbstractRoll.original(this.sid)
            },
            'ITEM.TypeVecu',
            560,
            500
        )
    }

    /**
     * Get the vecus according to the specified character and the active periodes.
     * @param actor The actor object.
     * @param scope Indicates if scope is 'actor' or 'simulacre'.
     * @returns the vecus to display in the character sheet.
     */
    static getAll(actor, scope) {
        const vecus = [];
        const a = AbstractRoll.actor(actor,scope);
        if (a != null) {
            for (let v of a.items.filter(v => v.type === 'vecu' && (scope === 'simulacre' || AbstractRoll.isActive(actor, v)))) {
                const original = AbstractRoll.original(v.sid);
                if (original != null) {
                    const feature = new Vecu(actor, v, scope);
                    vecus.push({
                        name: original.name,
                        id: v.id,
                        sid: feature.sid,
                        degre: feature.degre
                    });
                }
            }
        }
        return vecus;
    }

}