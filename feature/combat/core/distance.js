import { AbstractRoll } from "../../core/abstractRoll.js";
import { ActionDataBuilder } from "../../core/actionDataBuilder.js";
import { ActiveEffects } from "../../core/effects.js";
import { Combat } from "./combat.js";
import { Competence } from "../../periode/competence.js";
import { Constants } from "../../../module/common/constants.js";
import { DistanceDialog } from "./distanceDialog.js";
import { Instinctif } from "../manoeuver/instinctif.js";
import { ManoeuverBuilder } from "../manoeuver/manoeuverBuilder.js";
import { ManoeuverPool } from "../manoeuver/manoeuverPool.js";
import { Multiple } from "../manoeuver/multiple.js";
import { Rafale } from "../manoeuver/rafale.js";
import { Recharger } from "../manoeuver/recharger.js";
import { Salve } from "../manoeuver/salve.js";
import { Tirer } from "../manoeuver/tirer.js";
import { Viser } from "../manoeuver/viser.js";

export class Distance extends AbstractRoll {

    /**
     * Constructor.
     * @param actor  The actor object which performs the attack.
     * @param weapon The weapon item.
     */
    constructor(actor, weapon) {
        super(actor);
        this.item = ActionDataBuilder.competenceOf(actor, weapon);
        this.weapon = weapon;
        this.target = actor.target;
        this.effects = ActiveEffects.effectsOf(actor, this.target?.actor);
        this.manoeuver = new Tirer();
    }

    /**
     * @Override
     */
    get title() {
        return "Jet de Tir";
    }

    /**
     * @Override
     */
    get sentence() {
        return game.i18n.localize('NEPH5E.utiliseSon').replaceAll("${item}", this.weapon.name);
    }

    /**
     * @Override
     */
    get purpose() {
        return {
            attacker: this.actor.uuid,
            manoeuver: this.manoeuver.id,
            target: this.target?.actor.uuid,
            type: 'combat',
            weapon: this.weapon.id,
            impact: this.impact(this.manoeuver.id)
        }
    }

    /**
     * @Override
     */
    get degre() {
        switch (this.actor.type) {
            case 'figure':
                return new Competence(this.actor, this.item).degre;
            case 'figurant':
                return this.actor.system.menace;
        }
    }

    /**
     * @Override
     */
    get data() {
        return new ActionDataBuilder(this)
            .withItem(this.item)
            .withType(this.weapon.system.type === 'trait' ? Constants.NONE : Constants.SIMPLE)
            .withBase(this.item.name, this.degre)
            .withBlessures(Constants.PHYSICAL)
            .withManoeuvers(Distance.manoeuvers())
            .withApproches(this.approches(Tirer.ID))
            .withWeapon(this.weapon)
            .withTarget(this.target)
            .withFoeOnGround(this.effects.foeOnGround)
            .withOnGround(this.effects.onGround)
            .withStunned(this.effects.stunned)
            .withViser(new Viser().canBePerformed(this))
            .withVisee(new Viser().modifier(this))
            .withRecharger(new Recharger().canBePerformed(this))
            .export();
    }

    /**
     * @Override
     */
    difficulty(parameters) {
        const data = this.data;
        return AbstractRoll.toInt(data?.base?.difficulty)
             + AbstractRoll.toInt(parameters?.modifier)
             + AbstractRoll.toInt(parameters?.approche)
             + AbstractRoll.toInt(parameters?.blessures, data.blessures)
             + AbstractRoll.toInt(this.data.visee)
             + this.weaponModifier(data.weapon)
             + this.manoeuverModifier(parameters);
    }

    /**
     * @Override
     */
    manoeuverModifier(parameters) {
        const manoeuver = ManoeuverBuilder.create(parameters?.manoeuver);
        const shot = parameters?.shot == null ? null : parameters.shot - 1;
        return AbstractRoll.toInt(manoeuver?.attack?.modifier) + AbstractRoll.toInt(shot == null || manoeuver?.shots == null ? null : manoeuver.shots[shot]);
    }

    /**
     * @param weapon The weapon object used for the attack.
     * @returns the attack modififer.
     */
    weaponModifier(weapon) {
        return AbstractRoll.toInt(weapon?.system.attack * 10);
    }

    /**
     * @Override
     */
    async initialize() {
        if (this.weapon.system.used === true && this.effects.restrained === false) {

            // Use actor
            if (this.actor.token == null) {
                await new Combat(this.actor).simpleAttack(this.weapon);

            // Use token
            } else {
                new DistanceDialog(this.actor, this)
                    .withTitle(this.title)
                    .withTemplate("systems/neph5e/feature/combat/core/distance.hbs")
                    .withHeight(450)
                    .withData(this.data)
                    .render(true);
            }

        }
    }

    /**
     * @param weapon The weapon object used to fire.
     * @returns the fire manoeuvers.
     */
    static manoeuvers() {
        return new ManoeuverPool()
            .withManoeuver(new Tirer())
            .withManoeuver(new Multiple())
            .withManoeuver(new Salve())
            .withManoeuver(new Rafale())
            .withManoeuver(new Instinctif());
    }

}