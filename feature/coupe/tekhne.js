import { AbstractFocus } from "../core/AbstractFocus.js";
import { ActionDataBuilder } from "../core/actionDataBuilder.js";
import { Constants } from "../../module/common/constants.js";
import { CustomHandlebarsHelpers } from "../../module/common/handlebars.js";
import { EmbeddedItem } from "../../module/common/embeddedItem.js";
import { Science } from "../science/science.js";

export class Tekhne extends AbstractFocus {

    /**
     * @Override
     */
    get title() {
        return "Jet de Tekhné Rosicrucienne";
    }

    /**
     * @Override
     */
    get sentence() {
        return 'NEPH5E.tente.self.tekhne';
    }

    /**
     * @Override
     */
    get data() {
        return new ActionDataBuilder(this)
            .withType(Constants.SIMPLE)
            .withItem(this.item)
            .withBase('Tekhné', this.degre)
            .withBlessures('magique')
            .export();
    }

    /**
     * @Override
     */
    get degre() {

        // Retrieve the degre of the cercle used to cast the focus
        const science = Science.scienceOf(this.actor, this.original.system.cercle).degre;

        // Retrieve the degre of the focus to cast
        const focus = this.original.system.degre;

        // Retrieve the degre of the ka used to cast the focus
        const ka = this.actor.getKa('soleil');

        // Final result
        return science + ka - focus;

    }

    /**
     * @Override
     */
    async _drop(previous) {

        // Create a new focus or move the focus to the new periode.
        await new EmbeddedItem(this.actor, this.sid)
            .withContext("Drop of a tekhne")
            .withDeleteExisting()
            .withData("periode", this.periode)
            .withoutData('description', 'cercle', 'degre')
            .create();

    }

    /**
     * @Override
     */
    async edit() {
        await super.edit(
            "systems/neph5e/feature/coupe/item/tekhne.html",
            {
                item: this.original,
                system: this.original.system,
                debug: game.settings.get('neph5e', 'debug'),
                cercles: CustomHandlebarsHelpers.cerclesOf('tekhne', true),
                difficulty: this.degre
            },
            'ITEM.TypeTekhne',
            560,
            500
        )
    }

}