import { AbstractFeature } from "../core/AbstractFeature.js";
import { ActionDataBuilder } from "../core/actionDataBuilder.js";
import { Constants } from "../../module/common/constants.js";
import { EmbeddedItem } from "../../module/common/embeddedItem.js";
import { Game } from "../../module/common/game.js";
import { Science } from "../science/science.js";

export class Appel extends AbstractFeature {

    /**
     * Constructor.
     * @param actor The actor which performs the action.
     * @param item  The embedded object item, purpose of the action. 
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
            ui.notifications.warn("Vous ne possédez pas cet appel");
            return;
        }

        return await super.initialize();

    }

    /**
     * @Override
     */
    get title() {
        return 'Jet de Conjuration';
    }

    /**
     * @Override
     */
    get sentence() {
        return 'NEPH5E.tente.self.appel';
    }

    /**
     * @Override
     */
    get data() {
        return new ActionDataBuilder(this)
            .withType(Constants.SIMPLE)
            .withItem(this.item)
            .withBase('Appel', this.degre)
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
        const item = game.items.find(i => i.system.key === this.item.system.cercle);
        const science = new Science(this.actor, item).degre;
        return science;
    }

    /**
     * @Override
     */
    async drop() {

        // Create and embed the new appel
        if (this.periode != null && this.actor.items.find(i => i.sid === this.sid && i.system.periode === this.periode) == null) {

            // Previous is used if the focus is moved inside incarnations panel
            const previous = this.actor.items.find(i => i.sid === this.sid);

            await new EmbeddedItem(this.actor, this.sid)
                .withContext("Drop of a appel")
                .withDeleteExisting()
                .withData("status", (previous == null ? Constants.DECHIFFRE : previous.system.status))
                .withData("periode", this.periode)
                .withoutData('description', 'degre', 'appel', 'controle', 'visibilite', 'entropie', 'dommages', 'protection')
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
            "systems/neph5e/feature/conjuration/item/appel.html",
            {
                item: game.items.get(this.item._id),
                system: this.item.system,
                debug: game.settings.get('neph5e', 'debug'),
                cercles: Game.conjuration.cercles,
                appels: Game.conjuration.appels,
                difficulty: this.degre
            },
            'ITEM.TypeAppel',
            600,
            500
        )
    }

}