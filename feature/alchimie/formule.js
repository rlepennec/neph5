import { AbstractRoll } from "../core/abstractRoll.js";
import { ActionDataBuilder } from "../core/actionDataBuilder.js";
import { Constants } from "../../module/common/constants.js";
import { EmbeddedItem } from "../../module/common/embeddedItem.js";
import { Game } from "../../module/common/game.js";
import { Science } from "../science/science.js";

export class Formule extends AbstractRoll {

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
    async initialize() {

        const embedded = this.actor.items.find(i => i.sid === this.sid);

        if (embedded == null) {
            ui.notifications.warn("Vous ne possédez pas cette formule");
            return;
        }

        if (embedded.system.focus !== true && embedded.system.status === 'dechiffre') {
            ui.notifications.warn("Vous ne possédez pas le focus de cette formule");
            return;
        }

        return await super.initialize();

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
    get purpose() {
        return this.item;
    }

    /**
     * @Override
     */
    get degre() {
        const item = game.items.find(i => i.system.key === this.item.system.cercle);
        const science = new Science(this.actor, item).degre;
        const construct = this.getKaOfConstruct();
        const formule = this.item.system.degre;
        return science + construct - formule;
    }

    /**
     * @Override
     */
    async drop() {
        if (this.periode != null && this.actor.items.find(i => i.sid === this.sid && i.system.periode === this.periode) == null) {

            // Previous is used if the focus is moved inside incarnations panel
            const previous = this.actor.items.find(i => i.sid === this.sid);

            await new EmbeddedItem(this.actor, this.sid)
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
            "systems/neph5e/feature/alchimie/item/formule.html",
            {
                item: game.items.get(this.item._id),
                system: this.item.system,
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
     * Gets the level og the specified ka for the specified construct.
     * @returns the level of the specified ka.
     */
    getKaOfConstruct() {
        const substance = this.item.system.substance;
        const elements = this.item.system.elements;
        const construct = this.actor.getConstruct(substance);
        return elements.length === 1 ? construct[elements[0]] ?? 0 : Math.min(construct[elements[0]] ?? 0, construct[elements[1]] ?? 0);
    }

}