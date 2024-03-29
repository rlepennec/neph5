import { AbstractFeature } from "../../core/abstractFeature.js";
import { ActionDataBuilder } from "../../core/actionDataBuilder.js";
import { ActiveEffects } from "../../core/effects.js";
import { Combat } from "./combat.js";
import { CombatDialog } from "./combatDialog.js";
import { Constants } from "../../../module/common/constants.js";
import { Immobiliser } from "../manoeuver/immobiliser.js";
import { Liberer } from "../manoeuver/liberer.js";
import { ManoeuverBuilder } from "../manoeuver/manoeuverBuilder.js";
import { ManoeuverPool } from "../manoeuver/manoeuverPool.js";
import { Projeter } from "../manoeuver/projeter.js";

export class Wrestle extends AbstractFeature {

    /**
     * Constructor.
     * @param actor The actor object which performs the attack.
     */
    constructor(actor) {
        super(actor);
        this.item = actor.type === 'figure' ? game.items.find(i => i.sid === actor.system?.manoeuvres.lutte) : null;
        this.target = actor.target;
        this.effects = ActiveEffects.effectsOf(this.actor, this.target?.actor);
        this.manoeuver = new Immobiliser();
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
        return this.manoeuver == null ? 'NEPH5E.tente.self.competence' : game.i18n.localize('NEPH5E.tente.self.lutte');
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
            .withBase(this.baseName, this.degre)
            .withBlessures(Constants.PHYSICAL)
            .withManoeuvers(Wrestle.manoeuvers())
            .withApproches(this.approches(Immobiliser.ID))
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
                return game.i18n.localize('NEPH5E.menace');
        }
    }

    /**
     * @Override
     */
    difficulty(parameters) {
        const data = this.data;
        return AbstractFeature.toInt(data?.base?.difficulty)
             + AbstractFeature.toInt(parameters?.modifier)
             + AbstractFeature.toInt(parameters?.approche)
             + AbstractFeature.toInt(parameters?.blessures, data.blessures)
             + AbstractFeature.toInt(data?.foeOnGround?.modifier)
             + AbstractFeature.toInt(data?.onGround?.modifier)
             + AbstractFeature.toInt(data?.stunned?.modifier) +
             this.manoeuverModifier(parameters);
    }

    /**
     * @Override
     */
    manoeuverModifier(parameters) {
        return AbstractFeature.toInt(ManoeuverBuilder.create(parameters?.manoeuver)?.attack?.modifier);
    }

    /**
     * @Override
     */
    async initializeRoll() {
        if (this.actor.isLutteAvailable) {

            // Use actor
            if (this.actor.tokenOf == null) {
                await new Combat(this.actor).simpleAttack(this.weapon);

            // Use token
            } else {
                new CombatDialog(this.actor, this)
                    .withTitle(this.title)
                    .withTemplate("systems/neph5e/feature/combat/core/contact.hbs")
                    .withHeight(465)
                    .withData(this.data)
                    .render(true);
            }

        }
    }

    /**
     * @returns the wrestle manoeuvers.
     */
    static manoeuvers() {
        return new ManoeuverPool()
            .withManoeuver(new Immobiliser())
            .withManoeuver(new Liberer())
            .withManoeuver(new Projeter());
    }

}