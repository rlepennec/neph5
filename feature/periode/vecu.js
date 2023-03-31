import { AbstractFeature } from "../core/abstractFeature.js";
import { ActionDataBuilder } from "../core/actionDataBuilder.js";
import { EmbeddedItem } from "../../module/common/embeddedItem.js";
import { Constants } from "../../module/common/constants.js";
import { Game } from "../../module/common/game.js";
import { HistoricalFeature } from "../core/historicalFeature.js";
import { Periode } from "./periode.js";

export class Vecu extends HistoricalFeature {

    /**
     * Constructor.
     * @param actor The actor object which performs the action.
     * @param scope Indicates if scope is 'actor' or 'simulacre'.
     */
    constructor(actor, scope) {
        super(actor);
        this.scope = scope;
    }

    /**
     * @Override
     */
    withItem(item) {
        super.withItem(item);
        return this;
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
     * The name of the manoeuver to registrer, 'esquive' or 'lutte'.
     * @returns the instance.
     */
    withManoeuver(manoeuver) {
        this.manoeuver = manoeuver;
        return this;
    }

    /**
     * @param event The drop event.
     * @returns the instance.
     */
    withEvent(event) {
        this.event = event;
        return this;
    }

    /**
     * @Override
     */
    get title() {
        return "Jet de Vécu";
    }

    /**
     * @Override
     */
    get sentence() {
        switch (this.actor.type) {
            case 'figure':
                switch (this.scope) {
                    case 'actor':
                        return 'NEPH5E.tente.self.vecu-de';
                    case 'simulacre':
                        return 'NEPH5E.tente.simulacre.vecu-de';
                    default:
                        throw new Error("Vecu.sentence scope " + this.scope + " not implemented");
                }
            case 'figurant':
                return 'NEPH5E.tente.self.vecu-de';
            default:
                throw new Error("Vecu.sentence actor type " + this.actor.type + " not implemented");
        }
    }

    /**
     * @Override
     */
    get data() {
        return new ActionDataBuilder(this)
            .withItem(this.item)
            .withBase(this.item.name, this.degre)
            .withBlessures(Constants.PHYSICAL)
            .withApproches(this.approches())
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
        return this.embedded.system.degre;
    }

    /**
     * @Override
     */
    async drop() {

        const currentTab = $(this.event.currentTarget).find("div.tab.active").data("tab");

        // Process the drop on the manoeuver definition
        if (currentTab === 'combat') {

            // For figure only, edit combat option
            if (this.manoeuver != null) {
                if (this.actor.items.find(i => i.sid === this.sid)) {
                    await this.actor.update({ ['system.manoeuvres.' + this.manoeuver]: this.sid });
                } else {
                    ui.notifications.warn(game.i18n.localize('NEPH5E.vecuNonDefini').replaceAll("${item}", this.name));
                }
            }
            
            // For figurant only, attach a new vecu if not in combat option edition
            else if (this.actor.type === 'figurant' &&
                this.actor.items.find(i => i.sid === this.sid && i.system.periode === this.periode) == null) {

                await new EmbeddedItem(this.actor, this.sid)
                    .withContext("Drop a vecu")
                    .withData("degre", 0)
                    .withData("mnemos", [])
                    .withData("element", this.item.system.element)
                    .withoutData('description')
                    .withoutAlreadyEmbeddedError()
                    .create();
    
            }

            return;

        }

        // Process the drop on the incarnations for figure
        if (currentTab === 'incarnations') {

            // Drop the vecu with the related periode if none in current edition
            if (this.periode == null) {

                // The vecu must have a periode defined
                if (this.item.system.periode == null) {
                    ui.notifications.warn("Le vécu doit avoir une période pour pouvoir être déposé");
                    return;
                }

                // The vecu must not already exist
                if (this.actor.items.find(i => i.sid === this.sid && i.system.periode === this.periode) != null) {
                    ui.notifications.warn("Le vécu existe déjà");
                    return;
                }

                // Create the related periode if necessary
                if (this.actor.items.find(i => i.sid === this.item.system.periode) == null) {
                    this.periode = game.items.find(i => i.sid === this.item.system.periode);
                    if (this.periode == null) {
                        ui.notifications.error("La période auquelle est rattachée le vécu n'existe pas");
                        return;
                    }
                    await new Periode(this.actor, this.periode).drop();
                }

                // Just keep the sid to create the vecu
                this.periode = this.periode.sid;

            }
            
            // Create the vecu
            if (this.actor.items.find(i => i.sid === this.sid && i.system.periode === this.periode) == null) {

                await new EmbeddedItem(this.actor, this.sid)
                    .withContext("Drop of a vecu on periode " + this.periode)
                    .withData("degre", 0)
                    .withData("mnemos", [])
                    .withData("periode", this.periode)
                    .withData("element", this.item.system.element)
                    .withoutData('description')
                    .withoutAlreadyEmbeddedError()
                    .create();

            }

        }

    }

    /**
     * @Override
     */
    async edit() {
        await super.edit(
            "systems/neph5e/feature/periode/item/vecu.html",
            {
                system: this.item.system,
                elements: Game.pentacle.elements,
                item: this.item
            },
            'ITEM.TypeVecu',
            560,
            500
        )
    }

    /**
     * @Override
     */
    async delete() {

        // Delete the vecu
        await this.actor.deleteEmbeddedDocuments('Item', [this.embedded.id]);

        // Delete embedded weapons which use the vecu
        for (let o of this.actor.items.filter(i => i.type === 'arme' && i.system?.competence === this.embedded.sid)) {
            await this.actor.deleteEmbeddedDocuments('Item', [o.id]);
        }

        // Update actor manoeuvres, lutte and esquive
        if (this.actor.type === 'figure') {
            const manoeuvres = duplicate(this.actor.system.manoeuvres);
            manoeuvres.esquive = manoeuvres.esquive === this.embedded.sid ? null : manoeuvres.esquive;
            manoeuvres.lutte = manoeuvres.lutte === this.embedded.sid ? null : manoeuvres.lutte;
            await this.actor.update({['system.manoeuvres']: manoeuvres});
        }

        // Render the actor sheet if opened
        await this.actor.render();

    }

    /**
     * Get the vecus according to the specified character and the active periodes.
     * @param actor The actor object.
     * @param scope Indicates if scope is 'actor' or 'simulacre'.
     * @returns the vecus to display in the character sheet.
     */
    static getAll(actor, scope) {
        const vecus = [];
        const a = AbstractFeature.actor(actor,scope);
        if (a != null) {
            for (let v of a.items.filter(v => v.type === 'vecu' && (scope === 'simulacre' || AbstractFeature.isActive(actor, v)))) {
                const original = AbstractFeature.original(v.sid);
                if (original != null) {
                    const feature = new Vecu(actor, scope).withItem(v).withPeriode(v.system.periode);
                    vecus.push({
                        name: original.name,
                        id: v.id,
                        sid: feature.sid,
                        degre: feature.degre
                    });
                }
            }
        }
        return vecus;
    }

}