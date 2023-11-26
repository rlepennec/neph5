export class ManoeuverPool {

    /**
     * Constructor.
     */
    constructor() {
        this.manoeuvers = {};
        this.actor = null;
        this.weapon = null;
        this.attack = null;
    }

    /**
     * Register the specified manoeuver if allowed.
     * @param manoeuver The manoeuver to register.
     * @returns the instance.
     */
    withManoeuver(manoeuver) {
        if (manoeuver.advanced === false || game.settings.get('neph5e', 'useCombatManoeuver') === true) {
            this.manoeuvers[manoeuver.id] = manoeuver;
        }
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
        Object.entries(this.manoeuvers).forEach(([id, manoeuver]) => {
            if (manoeuver.canBePerformed(this)) {
                all[id] = manoeuver;
            }
        });
        return all;
    }

    /**
     * @returns all registered manoeuvers ids.
     */
    get ids() {
        return Object.keys(this.manoeuvers);
    }

}