import { AbstractFeature } from "../core/AbstractFeature.js";
import { ActionDataBuilder } from "../core/actionDataBuilder.js";
import { Constants } from "../../module/common/constants.js";
import { CustomHandlebarsHelpers } from "../../module/common/handlebars.js";
import { EmbeddedItem } from "../../module/common/embeddedItem.js";
import { Game } from "../../module/common/game.js";
import { Science } from "../science/science.js";

export class Habitus extends AbstractFeature {

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
            ui.notifications.warn("Vous ne possédez pas cet habitus");
            return;
        }

        return await super.initializeRoll();

    }

    /**
     * @Override
     */
    get title() {
        return "Jet d'Habitus";
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
            .withBase('Habitus', this.degre)
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
        const item = game.items.find(i => i.system.key === this.item.system.domaine);
        const science = new Science(this.actor, item).degre;
        const sort = this.item.system.degre;
        const ka = this.actor.getKa(this.item.system.element === "luneNoire" ? "noyau" : this.item.system.element);
        return science + ka - sort + 1;
    }

    /**
     * @Override
     */
    async drop() {
        if (this.periode != null && this.actor.items.find(i => i.sid === this.sid && i.system.periode === this.periode) == null) {

            await new EmbeddedItem(this.actor, this.sid)
                .withContext("Drop of an habitus")
                .withDeleteExisting()
                .withData("periode", this.periode)
                .withoutData('description', 'cercle', 'element', 'voies', 'degre', 'incantation', 'portee', 'duree')
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
            "systems/neph5e/feature/analogie/item/habitus.html",
            {
                item: game.items.get(this.item._id),
                system: this.item.system,
                debug: game.settings.get('neph5e', 'debug'),
                elements: Game.elements,
                domaines: CustomHandlebarsHelpers.cerclesOf('analogie', true),
                difficulty: this.degre
            },
            'ITEM.TypeHabitus',
            560,
            500
        )
    }

}