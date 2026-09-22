import { CombatHistory } from "../core/combatHistory.js";
import { ManoeuverBuilder } from "./manoeuverBuilder.js";

export class ManoeuverPool {

    /**
     * Constructor.
     */
    constructor() {
        this.manoeuvers = [];
        this.actor = null;
        this.weapon = null;
        this.attack = null;
        this.unrestricted = false;
    }

    /**
     * Marque ce pool comme libre : ses manœuvres sont proposées sans passer par
     * canBePerformed. Sert aux actions gratuites (ex: la contre-attaque de Contrer), qui
     * échappent aux règles de round puisqu'elles ne consomment pas l'action du combattant.
     * @returns the instance.
     */
    free() {
        this.unrestricted = true;
        return this;
    }

    /**
     * Register the specified manoeuver.
     * Le pool ne retient que des identifiants : il n'est complet — acteur, arme, attaque —
     * qu'après ce premier enregistrement, et les manœuvres naissent liées à un pool complet.
     * @param manoeuver The identifier of the manoeuver to register.
     * @returns the instance.
     */
    withManoeuver(manoeuver) {
        this.manoeuvers.push(manoeuver);
        return this;
    }

    /**
     * Register the specified actor.
     * @param actor The actor object, null if none.
     * @returns the instance.
     */
    by(actor) {
        this.actor = actor;
        return this;
    }

    /**
     * Register the specified current weapon.
     * @param weapon The weapon object, null if none.
     * @param target The optional target identifier.
     * @returns the instance.
     */
    with(weapon, target) {
        this.weapon = weapon;
        this.target = target;
        return this;
    }

    /**
     * @param attack The attack to react against to react.
     * @returns the instance.
     */
    against(attack) {
        this.attack = attack;
        return this;
    }

    /**
     * @returns all registered manoeuvers, according to
     *   - the type of manoeuver
     *   - the current actor.
     *   - the current weapon.
     *   - the attack against with to react.
     */
    get all() {
        const all = {};
        this.manoeuvers.forEach(id => {
            // Le pool est complet à cet instant : les manœuvres naissent donc en connaissant
            // l'acteur, l'arme et l'attaque à laquelle elles répondent.
            const manoeuver = ManoeuverBuilder.create(id, this);
            if (this.unrestricted === true || manoeuver.canBePerformed(this)) {
                all[id] = manoeuver;
            }
        });
        return all;
    }

    /**
     * @returns the maneuvers already played this round by the current actor, empty array if
     *          the actor isn't engaged in a combat.
     */
    get history() {
        return this.actor == null ? [] : CombatHistory.thisRound(this.actor);
    }

    /**
     * @returns all registered manoeuvers ids.
     */
    get ids() {
        return this.manoeuvers;
    }

}