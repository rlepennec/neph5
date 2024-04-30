import { ActiveEffects } from "../core/effects.js";
import { Constants } from "../../module/common/constants.js";
import { Liberer } from "../combat/manoeuver/liberer.js";

export class Health {

    /**
     * Constructor.
     * @param actor The actor to manage.
     */
    constructor(actor) {
        this.actor = actor;
    }

    static async onSocketMessage(socketMessage) {
        if (game.user.isGM !== true) return;
        switch (socketMessage.msg) {
          case Constants.MSG_APPLY_DAMAGES_ON:
            await Health.applyDamagesOn(
                socketMessage.data.token,
                socketMessage.data.impact,
                socketMessage.data.physical,
                socketMessage.data.weapon,
                socketMessage.data.manoeuver,
                socketMessage.data.winner,
                socketMessage.data.attack,
                socketMessage.data.critical );
            break;
        case Constants.MSG_APPLY_EFFECTS_ON:
            await Health.applyEffectsOn(
                socketMessage.data.token,
                socketMessage.data.attacker,
                socketMessage.data.winner,
                socketMessage.data.manoeuver );
            break;
        }
    }

    /**
     * @param token     The identifier of the token of the actor on which to apply damages.
     * @param impact    The impact of the attack.
     * @param magical   True if physical damages must be to apply.
     * @param weapon    The weapon used to attack.
     * @param manoeuver The manoeuver absorption.
     * @param winner    The action winner
     * @param attack    The attack manoeuver
     * @param critical  True if attack twices the damages.
     */
    static async applyDamagesOn(token, impact, physical, weapon, manoeuver, winner, attack, critical) {
        if (game.user.isGM === true) {
            const t = canvas.tokens?.objects?.children.find(t => t.id === token);
            if (t != null) {
                await new Health(t.actor).applyDamages(impact, physical, weapon, manoeuver, winner, attack, critical);
            }
        } else {
            game.socket.emit(Constants.SYSTEM_SOCKET_ID, {
                msg: Constants.MSG_APPLY_DAMAGES_ON,
                data: {
                    token: token,
                    impact: impact,
                    physical: physical,
                    weapon: weapon,
                    manoeuver: manoeuver,
                    winner: winner,
                    attack: attack,
                    critical: critical
                }
            });
        }
    }

    /**
     * @param impact    The impact of the attack.
     * @param magical   True if physical damages must be to apply.
     * @param weapon    The weapon used to attack.
     * @param manoeuver The manoeuver absorption.
     * @param winner    The action winner
     * @param attack    The attack manoeuver
     * @param critical  True if attack twices the damages.
     */
    async applyDamages(impact, physical, weapon, manoeuver, winner, attack, critical) {

        // Because dodge all damages
        if (manoeuver != null && manoeuver.hasOwnProperty('fix')) {
            return;
        }

        const absorption = manoeuver == null ? 0 : manoeuver.modifier;
        const minDamages = weapon == null ? 0 : weapon.system.damages > 1 ? 1 : 0;

        if (physical === true) {
            const armor = this.actor.protection("physique");
            const encaisse = Math.max(minDamages, impact - armor);
            const damages = (winner === Constants.ACTION && attack.impact.fix != null ? attack.impact.fix : Math.max(0, encaisse - absorption)) * (critical === true ? 2 : 1);
            await new Damages(this.actor, 'physique').apply(damages);
        }

        if (weapon?.system?.magique === true) {
            const armor = this.actor.protection("magique");
            const encaisse = Math.max(minDamages, impact - armor);
            const damages = Math.max(0, encaisse - absorption) * (critical === true ? 2 : 1);
            await new Damages(this.actor, 'magique').apply(damages);
        }

    }

    /**
     * @param damages The number of damages points.
     */
    async applyPhysicalDamages(damages) {
        await new Damages(this.actor, 'physique').apply(damages);
    }

    /**
     * @param damages The number of damages points.
     */
    async applyMagicalDamages(damages) {
        await new Damages(this.actor, 'magique').apply(damages);
    }

    /**
     * 
     * @param token     The token id of the defender.
     * @param attacker  The actor id of the attacker.
     * @param winner    The action winner
     * @param manoeuver Tha action manoeuver
     */
    static async applyEffectsOn(token, attacker, winner, manoeuver) {

        if (game.user.isGM === true) {
            if (winner === Constants.ACTION) {
                if (manoeuver.effect != null) {
                    const actor = canvas.tokens?.objects?.children.find(t => t.id === token)?.actor;
                    if (actor != null) {
                        await actor.activateEffect(manoeuver.effect.id);
                    }
                } else if (manoeuver.id === Liberer.ID) {
                    const actor = canvas.tokens?.objects?.children.find(t => t.actor.id === attacker)?.actor;
                    if (actor != null) {
                        await actor.deactivateEffect(ActiveEffects.IMMOBILISE.id);
                    }
                }
            }

        } else {
            game.socket.emit(Constants.SYSTEM_SOCKET_ID, {
                msg: Constants.MSG_APPLY_EFFECTS_ON,
                data: {
                    token: token,
                    attacker: attacker,
                    winner: winner,
                    manoeuver: manoeuver
                }
            });
        }
    }

}

class Damages {

    constructor(actor, type) {
        this.actor = actor;
        this.type = type;
        this.damages = [];
        if (actor.system.dommage[type]['_1'] === false) {
            this.damages.push(new Damage()
                .withSize(1)
                .withBox('_1'));
        }
        if (type === 'physique' && actor.system.ka.terre > 4 && actor.system.dommage[type]['_4'] === false) {
            this.damages.push(new Damage()
                .withSize(1)
                .withBox('_4'));
        }
        if (type === 'physique' && actor.system.ka.terre > 9 && actor.system.dommage[type]['_5'] === false) {
            this.damages.push(new Damage()
                .withSize(1)
                .withBox('_5'));
        }
        if (actor.system.dommage[type]['_2'] === false) {
            this.damages.push(new Damage()
                .withSize(2)
                .withBox('_2'));
        }
        if (actor.system.dommage[type]['_3'] === false) {
            this.damages.push(new Damage()
                .withSize(3)
                .withBox('_3'));
        }
        if (actor.system.dommage[type]['mineure'] === false) {
            this.damages.push(new Damage()
                .withSize(2)
                .withBox('mineure'));
        }
        if (actor.system.dommage[type]['serieuse'] === false) {
            this.damages.push(new Damage()
                .withSize(4)
                .withBox('serieuse'));
        }
        if (actor.system.dommage[type]['mineure'] === false &&
            actor.system.dommage[type]['serieuse'] === false) {
            this.damages.push(new Damage()
                .withSize(6)
                .withBox('mineure')
                .withBox('serieuse'));
        }
        if (actor.system.dommage[type]['grave'] === false) {
            this.damages.push(new Damage()
                .withSize(6)
                .withBox('grave'));
        }
        if (actor.system.dommage[type]['mineure'] === false &&
            actor.system.dommage[type]['grave'] === false) {
            this.damages.push(new Damage()
                .withSize(8)
                .withBox('mineure')
                .withBox('grave'));
        }
        if (actor.system.dommage[type]['serieuse'] === false &&
            actor.system.dommage[type]['grave'] === false) {
            this.damages.push(new Damage()
                .withSize(10)
                .withBox('serieuse')
                .withBox('grave'));
        }
        if (actor.system.dommage[type]['mineure'] === false &&
            actor.system.dommage[type]['serieuse'] === false &&
            actor.system.dommage[type]['grave'] === false) {
            this.damages.push(new Damage()
                .withSize(12)
                .withBox('mineure')
                .withBox('serieuse')
                .withBox('grave'));
        }
    }

    /**
     * @param amount The amount of damages to apply.
     */
    async apply(amount) {

        // Exit if manual dammages
        if (this.actor.system.options.degatAutomatique !== true) {
            return;
        }

        // Exit if no damages or if the actor is already out
        if (amount <= 0 || this.actor.system.dommage[this.type]['mortelle'] === true) {
            return;
        } 

        // Compute the damages to apply
        let damageToApply = null;
        for (const damage of this.damages) {
            if (amount <= damage.size) {
                damageToApply = damage;
                break;
            }
        }

        // Damage can be managed
        if (damageToApply !== null) {
            await damageToApply.apply(this.actor, this.type);

        // To much damage
        } else {
            await this.actor.update({ ["system.dommage." + this.type + ".mortelle"]: true });
        }

    }

    /**
     * @param amount The amount of damages.
     * @returns the mininum damages, null if too much.
     */
    dommages(amount) {
        for (const c of this.damages) {
            if (amount <= c.size) {
                return c;
            }
        }
        return null;
    }

    /**
     * @param amount The amount of damages.
     * @returns the mininum consequences, null if too much.
     */
    consequences(amount) {
        for (const c of this.consequences) {
            if (amount <= c.size) {
                return c;
            }
        }
        return null;
    }

}

class Damage {

    constructor() {
        this.size = null;
        this.boxes = new Set();
        this.sentence = null;
    }

    /**
     * @param value The size to set.
     * @returns the instance.
     */
    withSize(value) {
        this.size = value;
        return this;
    }

    /**
     * @param value The box to add.
     * @returns the instance.
     */
    withBox(value) {
        this.boxes.add(value);
        return this;
    }

    /**
     * @param value The sentence to set.
     * @returns the instance.
     */
    withSentence(value) {
        this.sentence = value;
        return this;
    }

    /**
     * Apply the boxes.
     * @param actor The actor on which to apply the damages.
     * @param type  The type of damage to apply.
     */
    async apply(actor, type) {
        const data = foundry.utils.duplicate(actor.system.dommage[type]);
        this.boxes.forEach(box => data[box] = true);
        await actor.update({ ["system.dommage." + type]: data });
    }

}