import { AbstractFocus } from "../core/AbstractFocus.js";
import { ActionDataBuilder } from "../core/actionDataBuilder.js";
import { Constants } from "../../module/common/constants.js";
import { EmbeddedItem } from "../../module/common/embeddedItem.js";
import { Game } from "../../module/common/game.js";
import { Science } from "../science/science.js";

export class Formule extends AbstractFocus {

    /**
     * @Override
     */
    get title() {
        return 'Jet de Formule';
    }

    /**
     * @Override
     */
    get sentence() {
        return 'NEPH5E.tente.self.formule';
    }

    /**
     * @Override
     */
    get data() {
        return new ActionDataBuilder(this)
            .withType(Constants.SIMPLE)
            .withItem(this.item)
            .withBase('Formule', this.degre)
            .withBlessures('magique')
            .export();
    }

    /**
     * @Override
     */
    async initializeRoll() {

        if (this.item.system.focus !== true && this.item.system.status === 'dechiffre') {
            ui.notifications.warn("Vous ne possédez pas le focus de cette formule");
            return;
        }

        return await super.initializeRoll();

    }

    /**
     * @Override
     */
    async finalize(result) {

        if (this.actor.system.options.gestionLaboratoire != true) {
            return;
        }

        // Retrieve the embedded focus
        const embedded = this.actor.items.find(i => i.sid === this.sid);

        // If success, produce 1 dose
        if (result.success === true) {
            const quantite = embedded.system.quantite + 1;
            await embedded.update({ ['system.quantite']: quantite });

            // If not critical, spend materiae primae
            if (result.critical === false) {
                for (let element of this.item.system.elements) {
                    const current = this.actor.system.alchimie.primae[element].quantite - 1;
                    const quantite = current < 0 ? 0 : current;
                    await this.actor.update({ ['system.alchimie.primae.' + element + ".quantite"]: quantite });
                }
            }

        }

    }

    /**
     * @Override
     */
    get degre() {

        // Retrieve the construct used to cast focus according to the current laboratory
        // The construct must be active
        const owner = this.getOwner();
        const construct = owner == null ? null : owner.getConstruct(this.original.system.substance);
        if (construct?.active !== true) {
            return null;
        }

        // Retrieve all elements used to cast the focus
        // All elements must be owned by the construct
        const ka = this.original.system.elements.length === 1 ? construct[this.original.system.elements[0]] ?? 0 : Math.min(construct[this.original.system.elements[0]] ?? 0, construct[this.original.system.elements[1]] ?? 0);
        if (ka < 1) {
            return null;
        }

        // The cercle of the formule must be supported by the construct
        switch (this.original.system.cercle) {
            case 'oeuvreAuNoir':
                break;
            case 'oeuvreAuBlanc':
                if (construct.degre === 'oeuvreAuNoir') {
                    return null;
                }
                break;
            case 'oeuvreAuRouge':
                if (construct.degre === 'oeuvreAuNoir' || construct.degre === 'oeuvreAuBlanc') {
                    return null;
                }
                break;
        }

        // Retrieve the degre of the cercle used to cast the focus
        const science = Science.scienceOf(this.actor, this.original.system.cercle).degre;

        // Retrieve the degre of the focus to cast
        const focus = this.original.system.degre;

        // Final result
        return science + ka - focus;

    }

    /**
     * @Override
     */
    async _drop(item, previous) {

        // Create a new focus or move the focus to the new periode.
        await new EmbeddedItem(this.actor, item.sid)
            .withContext("Drop of a sort")
            .withDeleteExisting()
            .withData("focus", (previous == null ? false : previous.system.focus))
            .withData("status", (previous == null ? Constants.DECHIFFRE : previous.system.status))
            .withData("quantite", 0)
            .withData("transporte", 0)
            .withData("periode", this.periode)
            .withoutData('description', 'degre', 'cercle', 'enonce', 'substance', 'elements', 'aire', 'duree', 'catalyseurs', 'variantes')
            .create();

    }

    /**
     * @Override
     */
    async edit() {
        await super.edit(
            "systems/neph5e/feature/alchimie/item/formule.html",
            {
                item: this.original,
                system: this.original.system,
                debug: game.settings.get('neph5e', 'debug'),
                elements: Game.pentacle.elements,
                cercles: Game.alchimie.cercles,
                substances: Game.alchimie.substances,
                difficulty: this.degre
            },
            'ITEM.TypeFormule',
            560,
            500
        )
    }

    /**
     * @returns the owner actor of the used laboratory.
     */
    getOwner() {
        if (this.actor.type === 'figure') {
            const sid = this.actor.system.alchimie.courant;
            return sid == null ? this.actor : game.actors.find(i => i.sid === sid);
        } else {
            return null;
        }
    }

}