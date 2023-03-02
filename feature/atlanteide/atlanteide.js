import { AbstractFocus } from "../core/AbstractFocus.js";
import { ActionDataBuilder } from "../core/actionDataBuilder.js";
import { Constants } from "../../module/common/constants.js";
import { EmbeddedItem } from "../../module/common/embeddedItem.js";
import { Science } from "../science/science.js";

export class Atlanteide extends AbstractFocus {

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
            .withContext("Drop of a rituel altantéide")
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
            "systems/neph5e/feature/atlanteide/item/atlanteide.html",
            {
                item: this.original,
                system: this.original.system,
                debug: game.settings.get('neph5e', 'debug'),
                cercles: Science.cerclesOf('atlanteide'),
                difficulty: this.degre
            },
            'ITEM.TypeAtlanteide',
            560,
            500
        )
    }

}