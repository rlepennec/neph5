import { Constants } from "../../module/common/constants.js";

export class ActionDataBuilder {

    static get ADVERSAIRE_AU_SOL() {
        return {
            label: 'NEPH5E.adversaireAuSol',
            modifier: +20
        }
    }

    static get AU_SOL() {
        return {
            label: 'NEPH5E.auSol',
            modifier: -20
        }
    }

    static get DESORIENTE() {
        return {
            label: 'NEPH5E.desoriente',
            modifier: -20
        }
    }

    /**
     * Constructor.
     * @param action The action to perform.
     */
    constructor(action) {
        this.actor = action.actor;
        this.sentence = action.sentence;
        this.type = Constants.NONE;
        this.item = null;
        this.ka = null;
        this.img = null;
        this.base = null;
        this.blessures = null;
        this.manoeuvers = null;
        this.approches = null;
        this.weapon = null;
        this.target = null;
        this.foeOnGround = null;
        this.visee = null;
        this.viser = null;
        this.recharger = null;
        this.attack = null;
        this.fraternite = 0;
    }

    /**
     * @param type The action type to register, simple, opposed or none.
     * @returns the instance.
     */
    withType(type) {
        this.type = type;
        return this;
    }

    /**
     * @param manoeuvers The manoeuvers to register. 
     * @returns the instance.
     */
    withManoeuvers(manoeuvers) {
        this.manoeuvers = manoeuvers;
        return this;
    }

    /**
     * @param approches The approches to register. 
     * @returns the instance.
     */
    withApproches(approches) {
        this.approches = approches;
        return this;
    }

    /**
     * @param fraternite The fraternite bonus to register.
     * @returns the instance.
     */
    withFraternite(fraternite) {
        this.fraternite = fraternite;
        return this;
    }

    /**
     * @param item The image to register. 
     * @returns the instance.
     */
    withImage(img) {
        this.img = img;
        return this;
    }

    /**
     * @param name  The name of the action base roll to register.
     * @param degre The degre of the action base roll to register.
     * @returns the instance.
     */
    withBase(name, degre) {
        this.base = { name, degre };
        return this;
    }

    /**
     * @param blessures The type of blessures to register. 
     * @returns the instance.
     */
    withBlessures(blessures) {
        this.blessures = blessures;
        return this;
    }

    /**
     * @param ka The ka to register. 
     * @returns the instance.
     */
    withKa(ka) {
        this.ka = ka;
        return this;
    }

    /**
     * @param item The item object to register. 
     * @returns the instance.
     */
    withItem(item) {
        this.item = item;
        return this;
    }

    /**
     * @param weapon The current weapon used to perform the action.
     * @returns the instance.
     */
    withWeapon(weapon) {
        this.weapon = weapon;
        return this;
    }

    /**
     * @param target The targeted token object.
     * @returns the instance.
     */
    withTarget(target) {
        this.target = target;
        return this;
    }

    /**
     * @param on True if the target is on the ground.
     * @returns the instance.
     */
    withFoeOnGround(on) {
        if (on === true) {
            this.foeOnGround = ActionDataBuilder.ADVERSAIRE_AU_SOL;
        }
        return this;
    }

    /**
     * @param on True if the actor is on the ground.
     * @returns the instance.
     */
    withOnGround(on) {
        if (on === true) {
            this.onGround = ActionDataBuilder.AU_SOL;
        }
        return this;
    }

    /**
     * @param on True if the actor is stunned.
     * @returns the instance.
     */
    withStunned(on) {
        if (on === true) {
            this.stunned = ActionDataBuilder.DESORIENTE;
        }
        return this;
    }

    /**
     * @param visee The modifier to set.
     * @returns the instance.
     */
    withVisee(visee) {
        this.visee = visee;
        return this;
    }

    /**
     * @param on True if the actor perform the manoeuver.
     * @returns the instance.
     */
    withViser(on) {
        this.viser = on;
        return this;
    }

    /**
     * @param on True if the actor perform the manoeuver.
     * @returns the instance.
     */
    withRecharger(on) {
        this.recharger = on;
        return this;
    }

    /**
     * @param attack The attack object.
     * @returns the instance. 
     */
    withAttack(attack) {
        this.attack = attack;
        return this;
    }

    /**
     * @returns the data.
     */
    export() {

        let data = {
            actor: this.actor,
            sentence: this.actor.name + " " + game.i18n.localize(this.sentence),
            richSentence: game.i18n.localize(this.sentence),
            type: this.type,
        };

        if (this.item?.name != null) {
            data.sentence = data.sentence.replaceAll("${item}", this.item.name);
        } else if (this.ka != null) {
            data.sentence = data.sentence.replaceAll("${ka}", this.ka);
        } else if (this.sentence != null) {
            data.sentence = this.actor.name + " " + game.i18n.localize(this.sentence);
        } else {
            data.sentence = this.actor.name + " " + game.i18n.localize('NEPH5E.utiliseNonDefini');
        }

        if (this.item?.name != null) {
            data.richSentence = data.richSentence.replaceAll("${item}", this.item.link);
        } else if (this.ka != null) {
            data.richSentence = data.richSentence.replaceAll("${ka}", this.ka);
        } else if (this.sentence != null) {
            data.richSentence = this.actor.name + " " + game.i18n.localize(this.sentence);
        } else {
            data.richSentence = this.actor.name + " " + game.i18n.localize('NEPH5E.utiliseNonDefini');
        }

        if (this.img != null) {
            data.img = this.img;
        } else if (this.target != null) {
            data.img = this.target.actor.img;
        } else if (this.item?.img != null) {
            data.img = this.item.img;
        }

        if (this.base != null) {
            data.base = {
                name: this.base.name,
                difficulty: this.base.degre * 10
            }
        }

        data.fraternite = this.fraternite * 10;

        if (this.blessures != null) {
            data.blessures = this.actor.getWoundsModifier(this.blessures);
        }

        if (this.manoeuvers != null) {
            if (this.weapon != null) {
                this.manoeuvers.with(this.weapon, this.target);
            }
            this.manoeuvers.by(this.actor);
            data.manoeuvers = this.manoeuvers.all;
        }

        if (this.approches != null) {
            data.approches = this.approches;
        }

        if (this.weapon != null) {
            data.weapon = this.weapon;
        }

        if (this.target != null) {
            data.target = this.target.id;
        }

        if (this.foeOnGround != null) {
            data.foeOnGround = this.foeOnGround;
        }

        if (this.onGround != null) {
            data.onGround = this.onGround;
        }

        if (this.stunned != null) {
            data.stunned = this.stunned;
        }

        if (this.visee != null) {
            data.visee = this.visee;
        }

        if (this.viser != null) {
            data.viser = this.viser;
        }

        if (this.recharger != null) {
            data.recharger = this.recharger;
        }

        if (this.attack != null) {
            data.attack = this.attack;
        }

        return data;
    }

    /**
     * @param id The identifier of the token object.
     * @returns the token object.
     */
    static token(id) {
        return canvas.tokens?.objects?.children.find(t => t.id === id);
    }

    /**
     * @param weapon The weapon item.
     * @param actor  The actor object which uses the weapon.
     * @returns the competence used by the weapon.
     */
    static competenceOf(actor, weapon) {
        switch (actor.type) {
            case 'figure':
                return game.items.find(i => i.sid === weapon?.system?.competence);
            case 'figurant':
                return {
                    name: game.i18n.localize('NEPH5E.menace')
                }
        }
    }

}