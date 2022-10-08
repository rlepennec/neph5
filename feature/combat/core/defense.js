import { AbstractManoeuver } from "../manoeuver/abstractManoeuver.js";
import { AbstractRoll } from "../../core/abstractRoll.js";
import { ActionDataBuilder } from "../../core/actionDataBuilder.js";
import { ActiveEffects } from "../../core/effects.js";
import { Constants } from "../../../module/common/constants.js";
import { Bloquer } from "../manoeuver/bloquer.js";
import { Competence } from "../../periode/competence.js";
import { Contrer } from "../manoeuver/contrer.js";
import { DefenseDialog } from "./defenseDialog.js";
import { Desarmer } from "../manoeuver/desarmer.js";
import { Elaboree } from "../manoeuver/elaboree.js";
import { Esquiver } from "../manoeuver/esquiver.js";
import { EsquiverLance } from "../manoeuver/esquiverLance.js";
import { Eviter } from "../manoeuver/eviter.js";
import { Fuir } from "../manoeuver/fuir.js";
import { ManoeuverBuilder } from "../manoeuver/manoeuverBuilder.js";
import { ManoeuverPool } from "../manoeuver/manoeuverPool.js";
import { NephilimChat } from "../../../module/common/chat.js";
import { Parer } from "../manoeuver/parer.js";
import { ParerLance } from "../manoeuver/parerLance.js";
import { ParerProjectile } from "../manoeuver/parerProjectile.js";
import { Vecu } from "../../periode/vecu.js";

export class Defense extends AbstractRoll {

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
            .withApproches(this.approches(Eviter.ID))
            .withWeapon(this.weapon)
            .withAttack(this.attack.defenseModifier())
            .export();
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
        switch (this.actor.type) {
            case 'figure':
                const item = this.manoeuver?.competenceUsed(this.actor, this.weapon);
                switch (item?.type) {
                    case 'competence':
                        return new Competence(this.actor, item).degre;
                    case 'vecu':
                        return new Vecu(this.actor, item, 'actor').degre;
                    default:
                        return 0;
                }
            case 'figurant':
                return this.actor.system.menace;
        }
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
             + AbstractRoll.toInt(data?.attack?.modifier)
             + this.manoeuverModifier(parameters);
    }

    /**
     * @Override
     */
    manoeuverModifier(parameters) {
        const manoeuver = ManoeuverBuilder.create(parameters?.manoeuver);
        const shot = parameters?.shot == null ? null : parameters.shot - 1;
        return AbstractRoll.toInt(manoeuver?.update(this)?.defense?.modifier) + AbstractRoll.toInt(shot == null || manoeuver?.shots == null ? null : manoeuver.shots[shot]);
    }

    /**
     * @Override
     */
    async initialize() {
        new DefenseDialog(this.actor, this)
            .withTitle(this.title)
            .withTemplate("systems/neph5e/feature/combat/core/defense.hbs")
            .withData(this.data)
            .render(true);
    }

    /**
     * @Overrides
     */
    async apply(result) { 
        const winner = AbstractRoll.winner(this.result, result);
        await new NephilimChat(this.actor)
            .withTemplate("systems/neph5e/feature/core/opposition.hbs")
            .withData({
                actor: this.actor,
                sentence: this.sentenceOf(winner),
                img: this.attack.actor.img,
                total: result.roll._total,
                effects : this.effectsOf(winner),
                absorption: winner !== Constants.ACTION ? this.manoeuver.absorption : null
            })
            .withRoll(result.roll)
            .create();
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

}