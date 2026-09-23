import { AbstractCombatFeature } from "./abstractCombatFeature.js";
import { ActionDataBuilder } from "../../core/actionDataBuilder.js";
import { ActiveEffects } from "../../core/effects.js";
import { Combat } from "./combat.js";
import { CombatDialog } from "./combatDialog.js";
import { Constants } from "../../../module/common/constants.js";
import { Immobiliser } from "../manoeuver/immobiliser.js";
import { Liberer } from "../manoeuver/liberer.js";
import { ManoeuverPool } from "../manoeuver/manoeuverPool.js";
import { Projeter } from "../manoeuver/projeter.js";

export class Wrestle extends AbstractCombatFeature {

    /**
     * Constructor.
     * @param actor The actor object which performs the attack.
     */
    constructor(actor) {
        super(actor);
        this.item = actor.type === 'figure' ? game.items.find(i => i.sid === actor.system?.manoeuvres.lutte) : null;
        this.target = actor.target;
        this.effects = ActiveEffects.effectsOf(this.actor, this.target?.actor);
        this.setManoeuver(Immobiliser.ID);
    }

    /**
     * @Override
     */
    get title() {
        return "Jet de lutte";
    }

    /**
     * @Override
     */
    get sentence() {
        return this.manoeuver == null ? 'NEPHILIM.tenteSelfCompetence' : game.i18n.localize('NEPHILIM.tenteSelfLutte');
    }

    /**
     * @Override
     */
    get purpose() {
        return {
            attacker: this.actor.id,
            manoeuver: this.manoeuver.id,
            target: this.target?.id,
            type: 'combat',
            impact: this.impact(this.manoeuver.id)
        }
    }

    /**
     * @Override
     */
    get degre() {
        const item = this.manoeuver?.competenceUsed(this.actor, this.weapon);
        return new Combat(this.actor).degreOf(item);
    }

    /**
     * @Override
     */
    get data() {
        return new ActionDataBuilder(this)
            .withItem(this.item)
            .withType(Constants.OPPOSED)
            .withBase(this.baseName, this.degre)
            .withBlessures(Constants.PHYSICAL)
            .withManoeuvers(Wrestle.manoeuvers())
            .withApproches(this.approches(this.manoeuver.id))
            .withTarget(this.target)
            .withFoeOnGround(this.effects.foeOnGround)
            .withOnGround(this.effects.onGround)
            .withStunned(this.effects.stunned)
            .export();
    }

    /**
     * @returns the name of the base.
     */
    get baseName() {
        switch (this.actor.type) {
            case 'figure':
                return this.item.name;
            case 'figurant':
                return game.i18n.localize('NEPHILIM.menace');
        }
    }

    /**
     * @Override
     */
    async initializeRoll() {
        if (this.actor.isLutteAvailable) {

            let data = this.data;
            const disponibles = Object.keys(data.manoeuvers);
            if (disponibles.length === 0) {
                ui.notifications.info(`${this.actor.name} a déjà effectué toutes ses actions pour ce round de combat.`);
                return;
            }

            // Immobiliser d'ordinaire, mais elle n'est pas toujours proposée : un combattant
            // pris dans une prise ne peut que s'en libérer. Le dialogue s'ouvre alors sur la
            // seule manœuvre restante, approches et base comprises.
            if (!disponibles.includes(this.manoeuver.id)) {
                this.setManoeuver(disponibles[0]);
                data = this.data;
            }

            // [V14] render() est asynchrone : sans await, initializeRoll() rendait la main
            // avant que la fenetre existe. Le hook d'opposition enchainait alors sur le
            // retrait du drapeau pendant que le rendu courait encore.
            await new CombatDialog(this.actor, this)
                .withTitle(this.title)
                .withTemplate("systems/neph5e/feature/combat/core/contact.hbs")
                .withData(data)
                .render(true);

        }
    }

    /**
     * @returns the wrestle manoeuvers.
     */
    static manoeuvers() {
        return new ManoeuverPool()
            .withManoeuver(Immobiliser.ID)
            .withManoeuver(Liberer.ID)
            .withManoeuver(Projeter.ID);
    }

}