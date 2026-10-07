import { AbstractCombatFeature } from "./abstractCombatFeature.js";
import { Version } from "../../../module/common/version.js";
import { ActionDataBuilder } from "../../core/actionDataBuilder.js";
import { ActiveEffects } from "../../core/effects.js";
import { Combat } from "./combat.js";
import { CombatDialog } from "./combatDialog.js";
import { Constants } from "../../../module/common/constants.js";
import { Etrange } from "../manoeuver/etrange.js";
import { Force } from "../manoeuver/force.js";
import { Frapper } from "../manoeuver/frapper.js";
import { ManoeuverPool } from "../manoeuver/manoeuverPool.js";
import { Puissante } from "../manoeuver/puissante.js";
import { Rapide } from "../manoeuver/rapide.js";
import { Standard } from "../manoeuver/standard.js";
import { Subtile } from "../manoeuver/subtile.js";

export class Naturelle extends AbstractCombatFeature {

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
        this.setManoeuver(Frapper.ID);
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
        return game.i18n.localize('NEPHILIM.tenteSelfAttaque').replaceAll("${arme}", this.weapon.name);
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
            .withType(Constants.OPPOSED)
            .withBase(this.item?.name ?? "Non défini", this.degre)
            .withBlessures(Constants.PHYSICAL)
            .withManoeuvers(Naturelle.manoeuvers())
            .withApproches(this.approches(this.manoeuver.id))
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
    weaponModifier(weapon) {
        return AbstractCombatFeature.toInt(Version.data(weapon).attack * 10);
    }

    /**
     * @Override
     */
    async initializeRoll() {

        let data = this.data;
        const disponibles = Object.keys(data.manoeuvers);
        if (disponibles.length === 0) {
            ui.notifications.info(`${this.actor.name} a déjà effectué toutes ses actions pour ce round de combat.`);
            return;
        }

        // Après la première attaque d'une manœuvre jouable plusieurs fois (Rapide), la
        // manœuvre par défaut n'est plus proposée : le dialogue s'ouvre alors sur la
        // première disponible, approches, description et impact compris.
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

    /**
     * @returns the brawl manoeuvers.
     */
    static manoeuvers() {
        return new ManoeuverPool()
            .withManoeuver(Etrange.ID)
            .withManoeuver(Force.ID)
            .withManoeuver(Frapper.ID)
            .withManoeuver(Puissante.ID)
            .withManoeuver(Rapide.ID)
            .withManoeuver(Standard.ID)
            .withManoeuver(Subtile.ID);
    }

}