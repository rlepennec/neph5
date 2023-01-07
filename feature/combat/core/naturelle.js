import { AbstractRoll } from "../../core/abstractRoll.js";
import { ActionDataBuilder } from "../../core/actionDataBuilder.js";
import { ActiveEffects } from "../../core/effects.js";
import { Combat } from "./combat.js";
import { CombatDialog } from "./combatDialog.js";
import { Constants } from "../../../module/common/constants.js";
import { Etrange } from "../manoeuver/etrange.js";
import { Force } from "../manoeuver/force.js";
import { Frapper } from "../manoeuver/frapper.js";
import { ManoeuverBuilder } from "../manoeuver/manoeuverBuilder.js";
import { ManoeuverPool } from "../manoeuver/manoeuverPool.js";
import { Puissante } from "../manoeuver/puissante.js";
import { Rapide } from "../manoeuver/rapide.js";
import { Standard } from "../manoeuver/standard.js";
import { Subtile } from "../manoeuver/subtile.js";

export class Naturelle extends AbstractRoll {

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
        this.manoeuver = new Frapper();
    }

    /**
     * @Override
     */
    get title() {
        return "Jet de bagarre";
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
            .withBase(this.item?.name ?? "Non défini", this.degre)
            .withBlessures(Constants.PHYSICAL)
            .withManoeuvers(Naturelle.manoeuvers())
            .withApproches(this.approches(Frapper.ID))
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
        return AbstractRoll.toInt(data?.base?.difficulty)
             + AbstractRoll.toInt(parameters?.modifier)
             + AbstractRoll.toInt(parameters?.approche)
             + AbstractRoll.toInt(parameters?.blessures, data.blessures)
             + AbstractRoll.toInt(data?.foeOnGround?.modifier)
             + AbstractRoll.toInt(data?.onGround?.modifier)
             + AbstractRoll.toInt(data?.stunned?.modifier)
             + this.weaponModifier(data.weapon)
             + this.manoeuverModifier(parameters);
    }

    /**
     * @Override
     */
    manoeuverModifier(parameters) {
        return AbstractRoll.toInt(ManoeuverBuilder.create(parameters?.manoeuver)?.attack?.modifier);
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
        if (this.effects.restrained === false) {

            // Use actor
            if (this.actor.tokenOf == null) {
                await new Combat(this.actor).simpleAttack(this.weapon);

            // Use token
            } else {
                new CombatDialog(this.actor, this)
                    .withTitle(this.title)
                    .withTemplate("systems/neph5e/feature/combat/core/contact.hbs")
                    .withHeight(450)
                    .withData(this.data)
                    .render(true);
            }

        }
    }

    /**
     * @returns the brawl manoeuvers.
     */
    static manoeuvers() {
        return new ManoeuverPool()
            .withManoeuver(new Etrange())
            .withManoeuver(new Force())
            .withManoeuver(new Frapper())
            .withManoeuver(new Puissante())
            .withManoeuver(new Rapide())
            .withManoeuver(new Standard())
            .withManoeuver(new Subtile());
    }

}