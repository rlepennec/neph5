import { AbstractFocus } from "../core/AbstractFocus.js";
import { ActionDataBuilder } from "../core/actionDataBuilder.js";
import { Constants } from "../../module/common/constants.js";
import { EmbeddedItem } from "../../module/common/embeddedItem.js";
import { Game } from "../../module/common/game.js";
import { Science } from "../science/science.js";

export class Habitus extends AbstractFocus {

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
    get degre() {

        // Retrieve the degre of the cercle used to cast the focus
        const science = Science.scienceOf(this.actor, this.original.system.domaine).degre;

        // Retrieve the degre of the focus to cast
        const focus = this.original.system.degre;

        // Retrieve the degre of the ka used to cast the focus
        const ka = this.actor.getKa(this.original.system.element === "luneNoire" ? "noyau" : this.original.system.element);

        // Final result
        return science + ka - focus + 1;

    }

    /**
     * @Override
     */
    async _drop(item, previous) {
        
        // Create a new focus or move the focus to the new periode.
        await new EmbeddedItem(this.actor, item.sid)
            .withContext("Drop of an habitus")
            .withDeleteExisting()
            .withData("periode", this.periode)
            .withoutData('description', 'cercle', 'element', 'voies', 'degre', 'incantation', 'portee', 'duree')
            .create();

    }

    /**
     * @Override
     */
    async edit() {
        await super.edit(
            "systems/neph5e/feature/analogie/item/habitus.html",
            {
                item: this.original,
                system: this.original.system,
                debug: game.settings.get('neph5e', 'debug'),
                elements: Game.elements,
                cercles: Science.cerclesOf('analogie'),
                difficulty: this.degre
            },
            'ITEM.TypeHabitus',
            560,
            500
        )
    }

}