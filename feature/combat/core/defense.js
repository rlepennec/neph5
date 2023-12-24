import { AbstractFeature } from "../../core/abstractFeature.js";
import { ActionDataBuilder } from "../../core/actionDataBuilder.js";
import { ActiveEffects } from "../../core/effects.js";
import { Constants } from "../../../module/common/constants.js";
import { Bloquer } from "../manoeuver/bloquer.js";
import { Combat } from "./combat.js";
import { Contrer } from "../manoeuver/contrer.js";
import { DefenseDialog } from "./defenseDialog.js";
import { Desarmer } from "../manoeuver/desarmer.js";
import { Elaboree } from "../manoeuver/elaboree.js";
import { Esquiver } from "../manoeuver/esquiver.js";
import { EsquiverLance } from "../manoeuver/esquiverLance.js";
import { Eviter } from "../manoeuver/eviter.js";
import { Fuir } from "../manoeuver/fuir.js";
import { Health } from "../../core/health.js";
import { ManoeuverBuilder } from "../manoeuver/manoeuverBuilder.js";
import { ManoeuverPool } from "../manoeuver/manoeuverPool.js";
import { NephilimChat } from "../../../module/common/chat.js";
import { Parer } from "../manoeuver/parer.js";
import { ParerLance } from "../manoeuver/parerLance.js";
import { ParerProjectile } from "../manoeuver/parerProjectile.js";


export class Defense extends AbstractFeature {

    /**
     * Constructor.
     * @param actor   The actor object which performs the defense action.
     * @param attack  The initial attack, purpose of the action.             
     * @param result  The result of the initial action, defined by:
     *  success   : A boolean
     *  critical  : A boolean
     *  fumble    : A boolean
     *  margin    : An integer
     */
    constructor(actor, attack, result) {
        super(actor);
        this.result = result;
        this.attack = attack;
        this.weapon = this.weapon();
        this.effects = ActiveEffects.effectsOf(actor, attack.attacker);
        this.manoeuver = new Eviter();
    }

    /**
     * @Override
     */
    get title() {
        return 'Jet de défense';
    }

    /**
     * @Override
     */
    get sentence() {
        return 'NEPH5E.tente.self.defense';
    }

    /**
     * @Override
     */
    get data() {
        return new ActionDataBuilder(this)
            .withItem(this.attack)
            .withType(Constants.REACTION)
            .withImage("systems/neph5e/assets/icons/defense.webp")
            .withBase(this.baseName, this.degre)
            .withBlessures(Constants.PHYSICAL)
            .withManoeuvers(Defense.manoeuvers().against(this.attack))
            .withApproches(this.approches(this.defaultApproche))
            .withWeapon(this.weapon)
            .withAttack(this.attack.defenseModifier())
            .export();
    }

    /**
     * @Override
     */
    get defaultApproche() {
        switch (game.settings.get('neph5e', 'useCombatSystem')) {
          case 'normal':
            return Eviter.ID;
          case 'low':
            return Esquiver.ID;
          default:
            return null;
        }
    }

    /**
     * @returns the name of the base.
     */
    get baseName() {
        switch (this.actor.type) {
            case 'figure':
                switch (this.manoeuver.family) {
                    case Constants.DODGE:
                        return this.actor.isEsquiveAvailable ? 
                               this.manoeuver.competenceUsed(this.actor, this.weapon).name :
                               game.i18n.localize("NEPH5E.nonDefini");
                    case Constants.PARADE:
                        const used = this.manoeuver.competenceUsed(this.actor, this.weapon)?.name;
                        return used != null ? used : game.i18n.localize("NEPH5E.nonDefini");
                }
            case 'figurant':
                return game.i18n.localize('NEPH5E.menace');
        }
    }

    /**
     * @Override
     */
    get degre() {
        const item = this.manoeuver?.competenceUsed(this.actor, this.weapon);
        return new Combat(this.actor).degreOf(item);
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
             + AbstractFeature.toInt(data?.attack?.modifier)
             + this.weaponModifier(data?.weapon)
             + this.manoeuverModifier(parameters);
    }

    /**
     * @Override
     */
    manoeuverModifier(parameters) {
        const manoeuver = ManoeuverBuilder.create(parameters?.manoeuver);
        const shot = parameters?.shot == null ? null : parameters.shot - 1;
        return AbstractFeature.toInt(manoeuver?.update(this)?.defense?.modifier) +
               AbstractFeature.toInt(shot == null || manoeuver?.shots == null ? null : manoeuver.shots[shot]);
    }

    /**
     * @param weapon The weapon object used for the defense.
     * @returns the attack modififer.
     */
    weaponModifier(weapon) {
        return weapon == null ? 0 : AbstractFeature.toInt(weapon.system.defense * 10);
    }

    /**
     * @Override
     */
    async initializeRoll() {
        new DefenseDialog(this.actor, this)
            .withTitle(this.title)
            .withTemplate("systems/neph5e/feature/combat/core/defense.hbs")
            .withHeight(465)
            .withData(this.data)
            .render(true);
    }

    /**
     * @Overrides
     */
    async apply(result) { 

        // Process the opposition roll
        const winner = AbstractFeature.winner(this.result, result);

        // Determine manoeuver absorption
        const absorption = winner !== Constants.ACTION ? this.manoeuver.absorption : null;
        
        // Display result in chat
        await new NephilimChat(this.actor)
            .withTemplate("systems/neph5e/feature/core/chat.hbs")
            .withData({
                actor: this.actor,
                richSentence: this.sentenceOf(winner),
                img: this.attack.actor.img,
                total: result.roll._total,
                effects : this.effectsOf(winner),
                absorption: absorption
            })
            .withRoll(result.roll)
            .create();

        // Apply damages automaticaly if necessary
        if (['normal', 'low'].includes(game.settings.get('neph5e', 'useCombatSystem'))) {
            await Health.applyDamagesOn(this.actor.tokenOf?.id, this.attack.impact, true, this.attack.weapon, absorption, winner, this.attack.manoeuver, this.result.critical);
            await Health.applyEffectsOn(this.actor.tokenOf?.id, this.attack.actor.id, winner, this.attack.manoeuver);
        }

    }

    /**
     * @param winner The winner of the opposed action.
     * @returns the result sentence.
     */
    sentenceOf(winner) {
        const sentence = this.manoeuver == null ? "se défendre" : game.i18n.localize("NEPH5E.manoeuvres." + this.manoeuver.id + ".sentence");
        switch (winner) {
            case Constants.ACTION:
                return " ne parvient pas à " + sentence;
            case Constants.TIE:
            case Constants.REACTION:
                return " parvient à " + sentence;
        }
    }

    /**
     * @returns the sentence if a manoeuver effect occurs, null if none.
     */
    effectsOf(winner) {
        if (winner !== Constants.ACTION) {
            return null;
        }
        const manoeuver = ManoeuverBuilder.create(this.attack.manoeuver.id);
        if (manoeuver?.effect == null) {
            return null;
        }
        return game.i18n.localize(manoeuver.effect.sentence).replaceAll("${actor}", this.actor.name);
    }

    /**
     * @returns the weapon used for defense, null if not found.
     */
    weapon() {
        return this.actor.items.find(i => i.type === 'arme' && i.system.used === true && i.system.parade === true);
    }

    /**
     * @return the instance if a defense can be performed, otherswise apply damage and return null.
     */
    async defenseToPerform() {
        // No manoeuver possible, apply dammages automaticaly
        if (Object.keys(this.data.manoeuvers).length === 0) {
            if (['normal', 'low'].includes(game.settings.get('neph5e', 'useCombatSystem')) && this.result.success) {
                await Health.applyDamagesOn(this.actor.tokenOf?.id, this.attack.impact, true, this.attack.weapon, null, Constants.ACTION, this.attack.manoeuver, this.result.critical);
                await Health.applyEffectsOn(this.actor.tokenOf?.id, this.attack.actor.id, Constants.ACTION, this.attack.manoeuver);
            }
            return null;
        } else {
            return this;
        }
    }
    
    /**
     * @param weapon The weapon object which occurs dammages.
     * @param type   The type of dammages, physical or magical.
     * @returns the protection against the specified type of dammage according to
     * the armor if exists and the optional bonus.
     */


    /**
     * @returns the defense manoeuvers.
     */
    static manoeuvers() {
        return new ManoeuverPool()
            .withManoeuver(new Bloquer())
            .withManoeuver(new Contrer())
            .withManoeuver(new Desarmer())
            .withManoeuver(new Elaboree())
            .withManoeuver(new Esquiver())
            .withManoeuver(new Eviter())
            .withManoeuver(new Fuir())
            .withManoeuver(new Parer())
            .withManoeuver(new EsquiverLance())
            .withManoeuver(new ParerLance())
            .withManoeuver(new ParerProjectile());
    }

        /**
     * @returns the defense manoeuvers.
     */
        static manoeuvers() {
            return new ManoeuverPool()
                .withManoeuver(new Bloquer())
                .withManoeuver(new Contrer())
                .withManoeuver(new Desarmer())
                .withManoeuver(new Elaboree())
                .withManoeuver(new Esquiver())
                .withManoeuver(new Eviter())
                .withManoeuver(new Fuir())
                .withManoeuver(new Parer())
                .withManoeuver(new EsquiverLance())
                .withManoeuver(new ParerLance())
                .withManoeuver(new ParerProjectile());
        }

}