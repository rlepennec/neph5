import { AbstractRoll } from "../core/abstractRoll.js";
import { ActionDataBuilder } from "../core/actionDataBuilder.js";
import { Constants } from "../../module/common/constants.js";
import { CustomHandlebarsHelpers } from "../../module/common/handlebars.js";
import { EmbeddedItem } from "../../module/common/embeddedItem.js";
import { Science } from "../science/science.js";

export class Pratique extends AbstractRoll {

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
            ui.notifications.warn("Vous ne possédez pas cette pratique");
            return;
        }

        return await super.initialize();

    }

    /**
     * @Override
     */
    get title() {
        return "Jet de Pratique Synarque";
    }

    /**
     * @Override
     */
    get sentence() {
        return 'NEPH5E.tente.self.pratique';
    }

    /**
     * @Override
     */
    get data() {
        return new ActionDataBuilder(this)
            .withType(Constants.SIMPLE)
            .withItem(this.item)
            .withBase('Pratique', this.degre)
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
        const pratique = this.item.system.degre;
        const ka = this.actor.getKa("soleil");
        return science + ka - pratique;
    }

    /**
     * @Override
     */
    async drop() {
        if (this.periode != null && this.actor.items.find(i => i.sid === this.sid && i.system.periode === this.periode) == null) {

            // Previous is used if the focus is moved inside incarnations panel
            const previous = this.actor.items.find(i => i.sid === this.sid);

            await new EmbeddedItem(this.actor, this.sid)
                .withContext("Drop of a pratique")
                .withDeleteExisting()
                .withData("periode", this.periode)
                .withoutData('description', 'cercle', 'degre')
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
            "systems/neph5e/feature/denier/item/pratique.html",
            {
                item: game.items.get(this.item._id),
                system: this.item.system,
                debug: game.settings.get('neph5e', 'debug'),
                cercles: CustomHandlebarsHelpers.cerclesOf('pratique', true),
                difficulty: this.degre
            },
            'ITEM.TypePratique',
            560,
            500
        )
    }

}