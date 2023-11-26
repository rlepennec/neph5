import { ActionDataBuilder } from "../../core/actionDataBuilder.js";
import { Constants } from "../../../module/common/constants.js";

export class AbstractManoeuver {

    /**
     * Constructor.
     * @param id     The identifier of the manoeuver.
     * @param family The famliy of the manoeuver.
     * @param name   The name of the manoeuver to display as choice.
     */
    constructor(id, family) {
        this.id = id;
        this.advanced = false;
        this.family = family;
        this.name = game.i18n.localize("NEPH5E.manoeuvres." + id + ".name");;
        this.description = "";
        this.times = 1;
        this.noAttack = false;
        this.noDefense = false;
        this.withNoOther = false;
        this.approches = [];
        this.attack = null;
        this.defense = null;
        this.impact = null;
        this.absorption = null;
        this.effect = null;
        this.target = true;
        this.immobilized = false;
        this.shots = null;
        this.clearViser = true;
    }

    /**
     * @param advanced True if this manoeuver needs to be activated by an option.
     * @returns the instance.
     */
    withAdvanced(advanced) {
        this.advanced = advanced;
        return this;
    }

    /**
     * @param approches The approche to set.
     * @returns the instance.
     */
    withApproches(approches) {
        this.approches = approches;
        return this;
    }

    /**
     * @param attack The attack modifier to set.
     * @returns the instance.
     */
    withAttack(attack) {
        this.attack = attack;
        return this;
    }

    /**
     * Specify the action can be done while being immobilized 
     * @returns the instance.
     */
    whithImmobilized() {
        this.immobilized = true;
        return this;
    }

    /**
     * @param defense The defense modifier to set.
     * @returns the instance.
     */
    withDefense(defense) {
        this.defense = defense;
        return this;
    }

    /**
     * @param description The description to set.
     * @returns the instance.
     */
    withDescription(description) {
        this.description = description;
        return this;
    }

    /**
     * @param effect The effect to set.
     * @returns the instance.
     */
    withEffect(effect) {
        this.effect = effect;
        return this;
    }

    /**
     * @param impact The impact bonus to set.
     * @returns the instance.
     */
    withImpact(impact) {
        this.impact = impact;
        return this;
    }

    /**
     * @param absorption The absorption bonus to set.
     * @returns the instance.
     */
    withAbsorption(absorption) {
        this.absorption = absorption;
        return this;
    }

    /**
     * Specify the action doesn't need any target.
     * @returns the instance.
     */
    withNoTarget() {
        this.target = false;
        return this;
    }

    /**
     * @param times The number of times to set.
     * @returns the instance.
     */
    withTimes(times) {
        this.times = times;
        return this;
    }

    /**
     * @param shots The number of shots to set.
     * @returns the instance.
     */
    withShots(...shots) {
        this.shots = shots;
        return this;
    }

    /**
     * Specify no attack possible.
     * @returns the instance.
     */
    withNoAttack() {
        this.noAttack = true;
        return this;
    }

    /**
     * Specify no defense possible.
     * @returns the instance.
     */
    withNoDefense() {
        this.noDefense = true;
        return this;
    }

    /**
     * Specify the manoeuver is exclusive.
     * @returns the instance.
     */
    withNoOther() {
        this.withNoOther;
        return this;
    }

    /**
     * Specify the manoeuver skill to set.
     * @param skill The identifier of the skill used by the action:
     *  - brawl
     *  - dodge
     *  - fire
     *  - parade
     *  - strike
     *  - tactic
     *  - throw
     * @returns the instance.
     */
    withFamilly(skill) {
        this.skill = skill;
        return this;
    }

    /**
     * Without clear viser.
     * @returns the instance.
     */
    withoutClearViser() {
        this.clearViser = false;
    }

    /**
     * @param action The action which perform the manoeuver to test.
     * @returns true if the action can perform the manoeuver. 
     */
    canBePerformed(action) {
        return true;
    }

    /**
     * Update the manoeuver according to ther specified action.
     * @param action The action for which to update the manoeuver.
     * @returns the instance
     */
    update(action) {
        return this;
    }

    /**
     * Applies the effect of the manoeuver.
     * @param action The action which launch the manoeuver.
     */
    async apply(action) {
    }

    /**
     * @param actor  The actor object which execute the manoeuver.
     * @param target The actor object which is the target of the manoeuver.
     * @returns true if the action is allowed.
     */
    isAllowed(actor, target) {
        throw new Error("AbstractManoeuver.isAllowed not implemented");
    }

    /**
     * @returns the identifier used to store the skill of the manoeuver in the actor data model.
     */
    actorDataPath() {
        switch (this.family) {
            case Constants.BRAWL:
                return 'data.manoeuvres.lutte';
            case Constants.DODGE:
                return 'data.manoeuvres.esquive';
            default:
                return null;
        }
    }

    /**
     * @param actor  The actor object which execute the action.
     * @param weapon The optional weapon item object.
     * @returns the impact.
     */
    impactOf(actor, weapon) {
        if (this.impact != null) {
            if (this.impact.hasOwnProperty('modifier')) {
                return this.impact.modifier
                    + (weapon?.system.damages ?? 0)
                    + actor.dommage
                    + actor.system.bonus.dommage;
            }
            if (this.impact.hasOwnProperty('fix')) {
                return this.impact.fix;
            }
        }
        return 0;
    }

    /**
     * @returns the absorption.
     */
    absorptionOf() {
        return this.absorption != null ? this.absorption : 0;
    }

    /**
     * @param actor The actor object which execute the action.
     * @returns the allowed approches only according to the actor and the action.
     */
    approchesOf(actor) {
        const available = actor.approches();
        const approches = {
            none: available.none
        }
        for (let a of this.approches.filter(i => available.hasOwnProperty(i))) {
            approches[a] = available[a];
        }
        return approches;
    }

    /**
     * @param actor  The actor object which perform the manoeuver.
     * @param weapon The weapon object used to perform the manoeuver.
     * @returns the item object used to store the skill of the manoeuver.
     * If the actor is a figurant, returns the menace instead.
     */
    competenceUsed(actor, weapon) {

        const none = {
            name: game.i18n.localize("NEPH5E.nonDefini"),
            degre: 0
        }

        switch (actor.type) {
            case 'figure':
                switch (this.family) {
                    case Constants.BRAWL: {
                        const sid = actor.system.manoeuvres.lutte;
                        const item = game.items.find(i => i.sid === sid);
                        return item == null ? none : item.type === 'competence' ? item : actor.items.find(i => i.sid === sid);
                    }
                    case Constants.DODGE: {
                        const sid = actor.system.manoeuvres.esquive;
                        const item = game.items.find(i => i.sid === sid);
                        return item == null ? none : item.type === 'competence' ? item : actor.items.find(i => i.sid === sid);
                    }
                    case Constants.PARADE:
                    case Constants.WEAPON: {
                        return ActionDataBuilder.competenceOf(actor, weapon);
                    }
                    default:
                        return null;
                }
            case 'figurant':
                return {
                    name: game.i18n.localize('NEPH5E.menace')
                }
        }

    }

}