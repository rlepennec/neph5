import { AbstractFocus } from "../core/AbstractFocus.js";
import { ActionDataBuilder } from "../core/actionDataBuilder.js";
import { Constants } from "../../module/common/constants.js";
import { EmbeddedItem } from "../../module/common/embeddedItem.js";
import { Game } from "../../module/common/game.js";
import { Science } from "../science/science.js";

export class Rite extends AbstractFocus {

    /**
     * @Override
     */
    get title() {
        return "Jet de Nécromancie";
    }

    /**
     * @Override
     */
    get sentence() {
        return 'NEPH5E.tente.self.rite';
    }

    /**
     * @Override
     */
    get data() {
        return new ActionDataBuilder(this)
            .withType(Constants.SIMPLE)
            .withItem(this.item)
            .withBase('Rite', this.degre)
            .withBlessures('magique')
            .export();
    }

    /**
     * @Override
     */
    get degre() {

        // Retrieve the degre of the cercle used to cast the focus
        const science = Science.scienceOf(this.actor, this.item.system.cercle).degre;

        // Final result
        return science;

    }

    /**
     * @Override
     */
    async _createEmbeddedItem(previous) {

        // Create a new focus or move the focus to the new periode.
        await new EmbeddedItem(this.actor, this.sid)
            .withContext("Drop of a rite")
            .withDeleteExisting()
            .withData("status", (previous == null ? Constants.DECHIFFRE : previous.system.status))
            .withData("periode", this.periode)
            .withoutData('description', 'cercle', 'desmos')
            .create();

    }

    /**
     * @Override
     */
    async edit() {
        await super.edit(
            "systems/neph5e/feature/necromancie/item/rite.html",
            {
                item: this.item,
                system: this.item.system,
                debug: game.settings.get('neph5e', 'debug'),
                cercles: Game.necromancie.cercles,
                desmos: Game.necromancie.desmos,
                difficulty: this.degre
            },
            'ITEM.TypeRite',
            560,
            500
        )
    }

}