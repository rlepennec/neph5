import { AbstractRoll } from "../core/abstractRoll.js";
import { ActionDataBuilder } from "../core/actionDataBuilder.js";
import { Constants } from "../../module/common/constants.js";
import { EmbeddedItem } from "../../module/common/embeddedItem.js";
import { Game } from "../../module/common/game.js";
import { Science } from "../science/science.js";

export class Sort extends AbstractRoll {

    /**
     * Constructor.
     * @param actor The actor which performs the action.
     * @param item  The embedded item object, purpose of the action. 
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
    async initialize() {

        const embedded = this.actor.items.find(i => i.sid === this.sid);

        if (embedded == null) {
            ui.notifications.warn("Vous ne possédez pas ce sort");
            return;
        }

        if (embedded.system.focus !== true && embedded.system.status === 'dechiffre') {
            ui.notifications.warn("Vous ne possédez pas le focus de ce sort");
            return;
        }

        return await super.initialize();

    }

    /**
     * @Override
     */
    get title() {
        return "Jet de Sort";
    }

    /**
     * @Override
     */
    get sentence() {
        return 'NEPH5E.tente.self.sort';
    }

    /**
     * @Override
     */
    get data() {
        return new ActionDataBuilder(this)
            .withType(Constants.SIMPLE)
            .withItem(this.item)
            .withBase('Sort', this.degre)
            .withBlessures('magique')
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
        if (this.item.system?.voies.length > 0 && this.item.system.voies.includes(this.actor.voieMagique?.sid) === false) {
            return 0;
        }
        const item = game.items.find(i => i.system.key === this.item.system.cercle);
        const science = new Science(this.actor, item).degre;
        const sort = this.item.system.degre;
        const ka = this.actor.getKa(this.item.system.element === "luneNoire" ? "noyau" : this.item.system.element);
        return science + ka - sort;
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
                .withData("periode", this.periode)
                .withoutData('description', 'cercle', 'element', 'voies', 'degre', 'portee', 'duree')
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
            "systems/neph5e/feature/magie/item/sort.html",
            {
                item: game.items.get(this.item._id),
                system: this.item.system,
                debug: game.settings.get('neph5e', 'debug'),
                elements: Game.elements,
                cercles: Game.magie.cercles,
                difficulty: this.degre
            },
            'ITEM.TypeSort',
            560,
            500
        )
    }

}