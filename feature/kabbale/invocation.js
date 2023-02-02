import { AbstractRoll } from "../core/abstractRoll.js";
import { ActionDataBuilder } from "../core/actionDataBuilder.js";
import { Constants } from "../../module/common/constants.js";
import { EmbeddedItem } from "../../module/common/embeddedItem.js";
import { Game } from "../../module/common/game.js";
import { Science } from "../science/science.js";

export class Invocation extends AbstractRoll {

    /**
     * Constructor.
     * @param actor The actor which performs the action.
     * @param item  The original item object, purpose of the action. 
     */
    constructor(actor, item) {
        super(actor);
        this.item = item;
        this.periode = null;
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
     * @Override
     */
    get title() {
        return this.pacte ? game.i18n.localize('NEPH5E.jetInvocation') : game.i18n.localize('NEPH5E.jetPacte');
    }

    /**
     * @Override
     */
    get sentence() {
        return this.pacte ? 'NEPH5E.tente.self.invocation' : 'NEPH5E.tente.self.pacte';
    }

    /**
     * @Override
     */
    get data() {
        return new ActionDataBuilder(this)
            .withType(this.pacte ? Constants.SIMPLE : Constants.OPPOSED)
            .withItem(this.item)
            .withBase('Invocation', this.degre)
            .withBlessures('magique')
            .export();
    }

    /**
     * @Override
     */
    async initialize() {
        const embedded = this.actor.items.find(i => i.sid === this.sid);
        if (embedded == null) {
            ui.notifications.warn("Vous ne possédez pas cette invocation");
            return;
        }
        if (embedded.system.focus !== true && embedded.system.status === 'dechiffre') {
            ui.notifications.warn("Vous ne possédez pas le focus de cette invocation");
            return;
        }
        return await super.initialize();
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
        const item = game.items.find(i => i.system.key === this.item.system.sephirah);
        const science = new Science(this.actor, item).degre;
        const ka = this.actor.getKa(this.item.system.element);
        return science + ka;
    }

    /**
     * @returns true if a pacte has already be done.
     */
    get pacte() {
        const embedded = this.actor.items.find(i => i.sid === this.sid);
        return embedded == null ? null : embedded.system.pacte;
    }

    /**
     * @Override
     */
    async drop() {
        if (this.periode != null && this.actor.items.find(i => i.sid === this.sid && i.system.periode === this.periode) == null) {

            // Previous is used if the focus is moved inside incarnations panel
            const previous = this.actor.items.find(i => i.sid === this.sid);

            await new EmbeddedItem(this.actor, this.sid)
                .withContext("Drop of a sort")
                .withDeleteExisting()
                .withData("focus", (previous == null ? false : previous.system.focus))
                .withData("status", (previous == null ? Constants.DECHIFFRE : previous.system.status))
                .withData("pacte", (previous == null ? false : previous.system.pacte))
                .withData("periode", this.periode)
                .withoutData('description', 'sephirah', 'monde', 'element', 'degre', 'portee', 'duree', 'visibilite')
                .create();
        }
    }

    /**
     * @Override
     */
    async delete() {
        await this.deleteEmbeddedItem(this.sid);
        return this;
    }

    /**
     * @Override
     */
    async edit() {
        await super.edit(
            "systems/neph5e/feature/kabbale/item/invocation.html",
            {
                item: game.items.get(this.item._id),
                system: this.item.system,
                debug: game.settings.get('neph5e', 'debug'),
                elements: Game.kabbale.elements,
                cercles: Game.kabbale.cercles,
                mondes: Game.kabbale.mondes,
                sephiroth: Game.kabbale.sephiroth,
                difficulty: this.degre
            },
            'ITEM.TypeInvocation',
            560,
            500
        )
    }

}