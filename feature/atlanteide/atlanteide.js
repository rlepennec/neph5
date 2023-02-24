import { AbstractFeature } from "../core/AbstractFeature.js";
import { ActionDataBuilder } from "../core/actionDataBuilder.js";
import { Constants } from "../../module/common/constants.js";
import { CustomHandlebarsHelpers } from "../../module/common/handlebars.js";
import { EmbeddedItem } from "../../module/common/embeddedItem.js";
import { Science } from "../science/science.js";

export class Atlanteide extends AbstractFeature {

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
    async initializeRoll() {

        const embedded = this.actor.items.find(i => i.sid === this.sid);

        if (embedded == null) {
            ui.notifications.warn("Vous ne possédez pas ce rituel atlantéide");
            return;
        }

        return await super.initializeRoll();

    }

    /**
     * @Override
     */
    get title() {
        return "Jet de Rituel Altlantéide";
    }

    /**
     * @Override
     */
    get sentence() {
        return 'NEPH5E.tente.self.atlanteide';
    }

    /**
     * @Override
     */
    get data() {
        return new ActionDataBuilder(this)
            .withType(Constants.SIMPLE)
            .withItem(this.item)
            .withBase('Rituel', this.degre)
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
        const degre = this.item.system.degre;
        const ka = this.actor.ka;
        return science + ka - degre;
    }

    /**
     * @Override
     */
    async drop() {
        if (this.periode != null && this.actor.items.find(i => i.sid === this.sid && i.system.periode === this.periode) == null) {

            // Previous is used if the focus is moved inside incarnations panel
            const previous = this.actor.items.find(i => i.sid === this.sid);

            await new EmbeddedItem(this.actor, this.sid)
                .withContext("Drop of a rituel altantéide")
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
            "systems/neph5e/feature/atlanteide/item/atlanteide.html",
            {
                item: game.items.get(this.item._id),
                system: this.item.system,
                debug: game.settings.get('neph5e', 'debug'),
                cercles: CustomHandlebarsHelpers.cerclesOf('atlanteide', true),
                difficulty: this.degre
            },
            'ITEM.TypeAtlanteide',
            560,
            500
        )
    }

}