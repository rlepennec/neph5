import { AbstractFeature } from "../../core/abstractFeature.js";
import { ActionDataBuilder } from "../../core/actionDataBuilder.js";
import { ActiveEffects } from "../../core/effects.js";
import { Combat } from "./combat.js";
import { CombatDialog } from "./combatDialog.js";
import { Constants } from "../../../module/common/constants.js";
import { Etrange } from "../manoeuver/etrange.js";
import { Force } from "../manoeuver/force.js";
import { Lancer } from "../manoeuver/lancer.js";
import { ManoeuverBuilder } from "../manoeuver/manoeuverBuilder.js";
import { ManoeuverPool } from "../manoeuver/manoeuverPool.js";
import { Puissante } from "../manoeuver/puissante.js";
import { Rapide } from "../manoeuver/rapide.js";
import { Standard } from "../manoeuver/standard.js";
import { Subtile } from "../manoeuver/subtile.js";

export class Melee extends AbstractFeature {

    /**
     * Constructor.
     * @param actor  The actor object which performs the attack.
     * @param weapon The weapon item object.
     */
    constructor(actor, weapon) {
        super(actor);
        this.item = ActionDataBuilder.competenceOf(actor, weapon);
        this.weapon = weapon;
        this.target = actor.target;
        this.effects = ActiveEffects.effectsOf(actor, this.target?.actor);
        this.manoeuver = new Standard();
    }

    /**
     * @Override
     */
    get title() {
        return "Jet de Mêlée";
    }

    /**
     * @Override
     */
    get sentence() {
        return game.i18n.localize('NEPH5E.tente.self.attaque').replaceAll("${arme}", this.weapon.name);
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
            weapon: this.weapon.id,
            impact: this.impact(this.manoeuver.id)
        }
    }

    /**
     * @Override
     */
    get degre() {
        return new Combat(this.actor).degreOf(this.item);
    }

    /**
     * @Override
     */
    get data() {
        return new ActionDataBuilder(this)
            .withItem(this.item)
            .withBase(this.item.name, this.degre)
            .withBlessures(Constants.PHYSICAL)
            .withManoeuvers(Melee.manoeuvers())
            .withApproches(this.approches(Standard.ID))
            .withWeapon(this.weapon)
            .withTarget(this.target)
            .withFoeOnGround(this.effects.foeOnGround)
            .withOnGround(this.effects.onGround)
            .withStunned(this.effects.stunned)
            .export();
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
             + AbstractFeature.toInt(data?.stunned?.modifier)
             + this.weaponModifier(data.weapon)
             + this.manoeuverModifier(parameters);
    }

    /**
     * @Override
     */
    manoeuverModifier(parameters) {
        return AbstractFeature.toInt(ManoeuverBuilder.create(parameters?.manoeuver)?.attack?.modifier);
    }

    /**
     * @param weapon The weapon object used for the attack.
     * @returns the attack modififer.
     */
    weaponModifier(weapon) {
        return AbstractFeature.toInt(weapon?.system.attack * 10);
    }

    /**
     * @Override
     */
    async initializeRoll() {
        if (this.weapon.system.used === true && this.effects.restrained === false) {

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
     * @returns the melee manoeuvers.
     */
    static manoeuvers() {
        return new ManoeuverPool()
            .withManoeuver(new Etrange())
            .withManoeuver(new Force())
            .withManoeuver(new Puissante())
            .withManoeuver(new Rapide())
            .withManoeuver(new Standard())
            .withManoeuver(new Subtile())
            .withManoeuver(new Lancer());
    }

}