import { AbstractFocus } from "../core/abstractFocus.js";
import { ActionDataBuilder } from "../core/actionDataBuilder.js";
import { Constants } from "../../module/common/constants.js";
import { EmbeddedItem } from "../../module/common/embeddedItem.js";
import { Game } from "../../module/common/game.js";
import { Science } from "../science/science.js";

export class Sort extends AbstractFocus {

    /**
     * @Override
     */
    async initializeRoll() {

        if (this.embedded.system.focus !== true && this.embedded.system.status === 'dechiffre') {
            ui.notifications.warn("Vous ne possédez pas le focus de ce sort");
            return;
        }

        return await super.initializeRoll();

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
            .withMetamorphe(this.actor.metamorphe.visibles)
            .export();
    }

    /**
     * @Override
     */
    get degre() {

        // Retrieve the degre of the cercle used to cast the focus
        const science = Science.scienceOf(this.actor, this.item.system.cercle).degre;

        // Retrieve the degre of the focus to cast
        const focus = this.item.system.degre;

        // The sort needs the actor to follow a voie
        if (this.item.system?.voies.length > 0 &&
            this.item.system.voies.includes(this.actor.voieMagique?.sid) === false) {
            if ( Math.ceil(focus/2) >= Math.ceil(science/2) ) {
                return 0;
            }
        }

        // Retrieve the degre of the ka used to cast the focus
        const ka = this.actor.getKa(this.item.system.element === "luneNoire" ? "noyau" : this.item.system.element);

        // Final result
        return science + ka - focus;

    }

    /**
     * @Override
     */
    async _createEmbeddedItem(previous) {

        await new EmbeddedItem(this.actor, this.sid)
            .withContext("Drop of a sort")
            .withDeleteExisting()
            .withData("focus", (previous == null ? false : previous.system.focus))
            .withData("status", (previous == null ? Constants.DECHIFFRE : previous.system.status))
            .withData("periode", this.periode)
            .withoutData('description', 'cercle', 'element', 'voies', 'degre', 'portee', 'duree')
            .create();
    }

    /**
     * @Override
     */
    async edit() {
        await super.edit(
            "systems/neph5e/feature/magie/item/sort.html",
            {
                item: this.item,
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