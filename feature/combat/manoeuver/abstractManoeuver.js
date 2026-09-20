import { ActionDataBuilder } from "../../core/actionDataBuilder.js";
import { CombatHistory } from "../core/combatHistory.js";
import { Constants } from "../../../module/common/constants.js";

export class AbstractManoeuver {

    /**
     * Construit la clef de traduction d'une manoeuvre.
     * Les libellés vivaient sous NEPH5E.manoeuvres.<id>.<champ> ; ils sont
     * désormais plats sous NEPHILIM, en camelCase : manoeuvre<Id><Champ>.
     * Cette méthode est l'unique endroit qui connaît la convention.
     * @param id    L'identifiant de la manoeuvre.
     * @param champ 'Name', 'Sentence' ou 'Description'.
     * @returns la clef complète.
     */
    static clef(id, champ) {
        return `NEPHILIM.manoeuvre${id.charAt(0).toUpperCase()}${id.slice(1)}${champ}`;
    }

    /**
     * Constructor.
     * @param id     The identifier of the manoeuver.
     * @param family The famliy of the manoeuver.
     * @param name   The name of the manoeuver to display as choice.
     */
    constructor(id, family) {
        this.id = id;
        this.family = family;
        this.name = game.i18n.localize(AbstractManoeuver.clef(id, "Name"));
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
        this.nextDefenseModifier = 0;
        this.leaveCombat = false;
        this.strike = false;
        this.automatic = false;
    }

    /**
     * @param actor The actor for which to retrieve the history.
     * @returns the maneuvers already played this round by the actor.
     */
    historyOf(actor) {
        return CombatHistory.thisRound(actor);
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
    withImmobilized() {
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
        // Chaque entrée est un tir du round, avec son propre malus : il y a donc autant de
        // tirs possibles dans le round que d'entrées.
        this.times = shots.length;
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
        this.withNoOther = true;
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
    withFamily(skill) {
        this.skill = skill;
        return this;
    }

    /**
     * Set the modifier to apply to the next defense reaction.
     * Used for defense reaction only.
     * @param modifier The modifier to set.
     * @return this instance.
     */
    withNextDefenseModifier(modifier) {
        this.nextDefenseModifier = modifier;
        return this;
    }

    /**
     * Specify the manoeuver resolves without any roll : elle se joue d'office, son issue ne
     * dépend d'aucun dé (ex: Éviter).
     * @returns the instance.
     */
    withAutomatic() {
        this.automatic = true;
        return this;
    }

    /**
     * Specify the manoeuver is a blow : un coup porté, par opposition à une empoignade, un
     * tir ou une manœuvre tactique. Certaines défenses n'ont de sens que face à un coup.
     * @returns the instance.
     */
    withStrike() {
        this.strike = true;
        return this;
    }

    /**
     * Specify the manoeuver takes its actor out of the fight : réussie, elle retire son
     * combattant du combat en cours (ex: Fuir).
     * @returns the instance.
     */
    withLeaveCombat() {
        this.leaveCombat = true;
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
     * Scellée : porte la règle commune à toutes les manœuvres d'action (attaque/tactique) —
     * une seule manœuvre choisie par round, jouable au plus `this.times` fois. La défense
     * est une réaction, ses manœuvres redéfinissent canBePerformed directement et ne
     * passent donc jamais par cette règle. Les sous-classes d'action ajoutent leurs
     * propres conditions via isAllowed(action), pas en redéfinissant canBePerformed.
     *
     * Les défenses déjà jouées ce round ne comptent PAS pour le verrou "une seule manœuvre
     * par round" : se défendre est une réaction, ça ne doit pas consommer le tour du
     * combattant. Exception : une défense exclusive (noAttack=true, ex: Élaborée) verrouille
     * tout de même le round entier, attaque et tactique comprises.
     * @param action The action which perform the manoeuver to test.
     * @returns true if the action can perform the manoeuver.
     */
    canBePerformed(action) {
        const history = action.history ?? [];
        if (history.some(e => e.noAttack === true)) {
            return false;
        }
        const own = history.filter(e => e.family !== Constants.DODGE && e.family !== Constants.PARADE);
        if (own.some(e => e.manoeuver !== this.id)) {
            return false;
        }
        if (this.played(action) >= this.times) {
            return false;
        }
        return this.isAllowed(action);
    }

    /**
     * @param action The action which perform the manoeuver.
     * @returns le nombre de fois où l'acteur a déjà joué cette manœuvre ce round — c'est
     *          aussi, dans `shots`, l'index du tir en cours (0 pour le premier).
     */
    played(action) {
        return (action.history ?? []).filter(e => e.manoeuver === this.id).length;
    }

    /**
     * @param action The action which perform the manoeuver to test.
     * @returns true by default ; à redéfinir pour les conditions propres à une manœuvre
     *          d'action (arme en main, munitions, cible...), sans se soucier de la règle
     *          de round déjà appliquée par canBePerformed.
     */
    isAllowed(action) {
        return true;
    }

    /**
     * À utiliser dans le canBePerformed propre à une manœuvre de défense normale
     * (noAttack=false) : une défense exclusive (noAttack=true, ex: Élaborée) déjà jouée ce
     * round par l'acteur verrouille tout le reste, cette défense-ci comprise.
     * @param action The action which perform the manoeuver to test.
     * @returns true if an exclusive defense has already been played this round.
     */
    exclusiveDefensePlayed(action) {
        return (action.history ?? []).some(e => e.noAttack === true);
    }

    /**
     * Applique au défenseur les conséquences de son jet de défense. Par défaut, les dégâts
     * de l'attaque initiale sont appliqués aussitôt, amortis par l'absorption de la manœuvre
     * lorsque la défense a réussi.
     *
     * Une manœuvre peut remplacer ce traitement pour enchaîner sur autre chose — ex: Contrer
     * et sa contre-attaque, dont le jet n'aura lieu que plus tard. À elle, dans ce cas,
     * d'appeler defense.applyDamages() au terme de son propre enchaînement.
     *
     * @param defense The defense action.
     * @param winner  The winner of the opposed roll.
     */
    async resolveDefense(defense, winner) {
        await defense.applyDamages(winner !== Constants.ACTION ? this.absorption : null);
    }

    /**
     * Phrase standard d'une manœuvre de défense : le défenseur parvient — ou non — à ce que
     * décrit la manœuvre (sa clef de traduction 'Sentence'). C'est l'issue de la très grande
     * majorité des défenses ; les manœuvres l'appellent depuis leur defenseSentenceOf.
     * @param winner The winner of the opposed roll.
     * @returns la phrase de résultat.
     */
    defenseSentence(winner) {
        const sentence = game.i18n.localize(AbstractManoeuver.clef(this.id, "Sentence"));
        return winner === Constants.ACTION
            ? " ne parvient pas à " + sentence
            : " parvient à " + sentence;
    }

    /**
     * Chaque manœuvre de défense redéfinit cette méthode — même pour reprendre la phrase
     * standard : c'est elle, et non l'action de défense, qui décide de ce qui est annoncé.
     * Une manœuvre dont l'issue ne se résume pas à réussir ou échouer (ex: Éviter, où le coup
     * touche toujours) rédige alors la sienne.
     * @param winner The winner of the opposed roll.
     * @returns la phrase de résultat affichée dans le chat.
     */
    defenseSentenceOf(winner) {
        return this.defenseSentence(winner);
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
            name: game.i18n.localize("NEPHILIM.nonDefini"),
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
                    name: game.i18n.localize('NEPHILIM.menace')
                }
        }

    }

}