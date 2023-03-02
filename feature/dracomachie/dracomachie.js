import { AbstractFocus } from "../core/AbstractFocus.js";
import { ActionDataBuilder } from "../core/actionDataBuilder.js";
import { Constants } from "../../module/common/constants.js";
import { EmbeddedItem } from "../../module/common/embeddedItem.js";
import { Science } from "../science/science.js";

export class Dracomachie extends AbstractFocus {

    /**
     * @Override
     */
    get title() {
        return "Jet de dracomachie";
    }

    /**
     * @Override
     */
    get sentence() {
        return 'NEPH5E.tente.self.dracomachie';
    }

    /**
     * @Override
     */
    get data() {
        return new ActionDataBuilder(this)
            .withType(Constants.SIMPLE)
            .withItem(this.item)
            .withBase('Passe', this.degre)
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
        const ka = this.actor.ka;

        // Final result
        return science + ka - focus;

    }

    /**
     * @Override
     */
    async _drop(item, previous) {
        
        // Create a new focus or move the focus to the new periode.
        await new EmbeddedItem(this.actor, item.sid)
            .withContext("Drop of a passe")
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
            "systems/neph5e/feature/dracomachie/item/dracomachie.html",
            {
                item: this.original,
                system: this.original.system,
                debug: game.settings.get('neph5e', 'debug'),
                cercles: Science.cerclesOf('dracomachie'),
                difficulty: this.degre
            },
            'ITEM.TypeDracomachie',
            560,
            500
        )
    }

}