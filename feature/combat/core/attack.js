export class Attack {

    /**
     * Constructor.
     *  actor     The attacker actor object.
     *  impact    The final impact of the attack.
     *  manoeuver The identifier of the attack manoeuver.
     *  weapon    The embedded item object used for the attack.         
     */
    constructor(actor, impact, manoeuver, weapon) {
        this.actor = actor;
        this.impact = impact;
        this.manoeuver = manoeuver;
        this.weapon = weapon;
    }

    /**
     * @returns the defense modifier to display in the defense dialog.
     */
    defenseModifier() {
        let attack = null;
        if (this.manoeuver.defense?.modifier != null &&
            this.manoeuver.defense?.modifier !== 0) {
            attack = {
                name: this.manoeuver.name,
                modifier: this.manoeuver.defense.modifier
            }
        }
        return attack;
    }

}