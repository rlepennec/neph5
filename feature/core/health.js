import { ActiveEffects } from "../core/effects.js";
import { Constants } from "../../module/common/constants.js";
import { Immobiliser } from "../combat/manoeuver/immobiliser.js";
import { Liberer } from "../combat/manoeuver/liberer.js";
import { NephilimChat } from "../../module/common/chat.js";

export class Health {

    /**
     * Constructor.
     * @param actor The actor to manage.
     */
    constructor(actor) {
        this.actor = actor;
    }

    static async onSocketMessage(socketMessage) {
        // Un message socket est livré à TOUS les clients connectés. La garde
        // « je suis MJ » ne suffit donc pas : avec deux MJ à la table, chacun
        // exécuterait applyDamagesOn et les dommages seraient appliqués deux
        // fois. game.users.activeGM désigne un unique MJ primaire, le même pour
        // tous les clients, ce qui rend le traitement idempotent quel que soit
        // le nombre de récepteurs.
        if (game.user !== game.users.activeGM) return;
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
                socketMessage.data.critical,
                socketMessage.data.attacker );
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
    static async applyDamagesOn(token, impact, physical, weapon, manoeuver, winner, attack, critical, attacker) {
        if (game.user.isGM === true) {
            const t = canvas.tokens?.objects?.children.find(t => t.id === token);
            if (t != null) {
                await new Health(t.actor).applyDamages(impact, physical, weapon, manoeuver, winner, attack, critical, attacker);
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
                    critical: critical,
                    attacker: attacker
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
     * @param attacker  The actor id of the attacker, named in the wound sentence.
     */
    async applyDamages(impact, physical, weapon, manoeuver, winner, attack, critical, attacker) {

        // Une prise s'annonce par son issue, réussie ou non, et non par la blessure : même
        // quand aucun dommage n'est traité (esquive totale, dégâts manuels).
        const prise = attack?.id === Immobiliser.ID;

        // Because dodge all damages
        if (manoeuver != null && manoeuver.hasOwnProperty('fix')) {
            if (prise) {
                await this.announceHold(attacker, winner);
            }
            return;
        }

        // Modificateur de la manœuvre de défense : positif il amortit le coup (Parer, Bloquer,
        // Éviter), négatif il le majore (Contrer, Désarmer ratés). C'est un modificateur de
        // combat : il s'applique avant la protection (voir damagesOf).
        const absorption = manoeuver?.modifier ?? 0;

        // Une arme dont la caractéristique de dommages vaut 2 ou plus inflige toujours au moins
        // 1 dommage physique quand l'armure ramène ses dommages à 0 ou moins. Une arme plus
        // légère peut être arrêtée net. Les dommages magiques n'en bénéficient pas.
        const perforante = weapon != null && weapon.system.damages >= 2;

        // Cases cochées par type de dommages, null si rien n'a été traité
        const resultats = [];

        // Détail du calcul, affiché sous les blessures si le réglage « Combat détaillé » est actif
        const detaille = game.settings.get('neph5e', 'combatDetaille') === true;
        const details = [];

        if (physical === true) {
            const armor = this.actor.protection("physique");
            const fix = winner === Constants.ACTION && attack.impact.fix != null ? attack.impact.fix : null;
            const encaisse = Health.damagesOf(impact, armor, perforante, absorption);
            const damages = (fix ?? encaisse) * (critical === true ? 2 : 1);
            resultats.push(await new Damages(this.actor, 'physique').apply(damages));
            if (detaille) {
                details.push(Health.detailOf("Dommages physiques", impact, absorption, armor, perforante, critical, fix));
            }
        }

        if (weapon?.system?.magique === true) {
            const armor = this.actor.protection("magique");
            const damages = Health.damagesOf(impact, armor, false, absorption) * (critical === true ? 2 : 1);
            resultats.push(await new Damages(this.actor, 'magique').apply(damages));
            if (detaille) {
                details.push(Health.detailOf("Dommages magiques", impact, absorption, armor, false, critical, null));
            }
        }

        if (prise) {
            await this.announceHold(attacker, winner, details);
        } else {
            await this.announceWounds(attacker, resultats, details);
        }

    }

    /**
     * Annonce dans le chat l'issue d'une prise (Immobiliser) : « A parvient à immobiliser B »
     * si l'attaque l'emporte, « A ne parvient pas à immobiliser B » sinon.
     * @param attacker The actor id of the attacker.
     * @param winner   The action winner.
     * @param details  Le détail du calcul des dommages, vide sans « Combat détaillé ».
     */
    async announceHold(attacker, winner, details = []) {
        const sender = Health.senderOf(attacker);
        const sentence = (sender?.name ?? "L'attaquant")
            + (winner === Constants.ACTION ? " parvient à immobiliser " : " ne parvient pas à immobiliser ")
            + this.actor.name;
        await new NephilimChat(sender ?? this.actor)
            .withTemplate("systems/neph5e/feature/core/chat.hbs")
            .withData({
                actor: sender ?? this.actor,
                richSentence: sentence,
                img: this.actor.img,
                details: details
            })
            .create();
    }

    /**
     * @param attacker The actor id of the attacker.
     * @returns l'acteur attaquant, d'un token de la scène ou du monde, null s'il est introuvable.
     */
    static senderOf(attacker) {
        return canvas.tokens?.objects?.children.find(t => t.actor?.id === attacker)?.actor
            ?? game.actors.get(attacker);
    }

    /**
     * Annonce dans le chat le résultat final d'une attaque : la gravité des blessures
     * infligées, sans degré ni chiffre. Rien n'est annoncé si les dommages n'ont pas été
     * traités (dégâts manuels, cible déjà hors de combat).
     * @param attacker  The actor id of the attacker.
     * @param resultats Les cases cochées par type de dommages, null si rien n'a été traité.
     * @param details   Le détail du calcul par type de dommages, vide sans « Combat détaillé ».
     */
    async announceWounds(attacker, resultats, details = []) {
        const traites = resultats.filter(r => r != null);
        if (traites.length === 0) {
            return;
        }
        const gravite = Health.graviteOf(traites.flatMap(r => [...r]));
        const sender = Health.senderOf(attacker);
        let sentence;
        if (sender != null) {
            sentence = gravite == null
                ? sender.name + " touche " + this.actor.name + " sans le blesser"
                : sender.name + " blesse " + this.actor.name + " " + gravite;
        } else {
            sentence = gravite == null
                ? this.actor.name + " n'est pas blessé"
                : this.actor.name + " est blessé " + gravite;
        }
        await new NephilimChat(sender ?? this.actor)
            .withTemplate("systems/neph5e/feature/core/chat.hbs")
            .withData({
                actor: sender ?? this.actor,
                richSentence: sentence,
                img: this.actor.img,
                details: details
            })
            .create();
    }

    /**
     * @param titre      Le type de dommages détaillé.
     * @param impact     L'impact du coup porté.
     * @param absorption Le modificateur de la manœuvre de défense.
     * @param armor      La protection opposée.
     * @param perforante True si le minimum de 1 peut s'appliquer.
     * @param critical   True si l'attaque est un critique.
     * @param fix        Les dommages fixes de la manœuvre d'attaque, null sinon.
     * @returns le détail du calcul de damagesOf, puis du doublement : par exemple
     *          « Dommages physiques : impact 4, défense −2, protection −3 = −1 → minimum 1
     *          → critique ×2 = 2 ».
     */
    static detailOf(titre, impact, absorption, armor, perforante, critical, fix) {
        let texte;
        let valeur;
        if (fix != null) {
            texte = "dommages fixes " + fix;
            valeur = fix;
        } else {
            const signe = v => (v < 0 ? "+" : "−") + Math.abs(v);
            const brut = impact - absorption - armor;
            texte = "impact " + impact;
            if (absorption !== 0) {
                texte += ", défense " + signe(absorption);
            }
            texte += ", protection −" + armor + " = " + String(brut).replace("-", "−");
            valeur = Health.damagesOf(impact, armor, perforante, absorption);
            if (valeur !== brut) {
                texte += valeur > 0 ? " → minimum " + valeur : " → 0";
            }
        }
        if (critical === true) {
            texte += " → critique ×2 = " + (valeur * 2);
        }
        return titre + " : " + texte;
    }

    /**
     * @param cases Les cases cochées, tous types de dommages confondus.
     * @returns la gravité des blessures : « très légèrement » pour de simples dommages,
     *          « légèrement », « sérieusement », « gravement » selon la plus grave blessure,
     *          précédée de « très » s'il y a plusieurs blessures, « mortellement » pour une
     *          blessure mortelle, null si aucune case n'est cochée.
     */
    static graviteOf(cases) {
        if (cases.length === 0) {
            return null;
        }
        if (cases.includes('mortelle')) {
            return "mortellement";
        }
        const blessures = cases.filter(c => c === 'mineure' || c === 'serieuse' || c === 'grave');
        if (blessures.length === 0) {
            return "très légèrement";
        }
        const adverbe = blessures.includes('grave') ? "gravement"
            : blessures.includes('serieuse') ? "sérieusement"
            : "légèrement";
        return blessures.length > 1 ? "très " + adverbe : adverbe;
    }

    /**
     * Dommages reçus = degré de dommages de l'arme +/- modificateurs de combat - degré de
     * protection. L'impact porte déjà les modificateurs de l'attaquant (manœuvre, Ka, bonus,
     * marge) ; le modificateur de la manœuvre de défense s'y ajoute, avant la protection.
     * Une arme perforante (2 degrés ou plus) dont l'armure ramène les dommages à 0 ou moins
     * inflige tout de même 1 degré, à condition que l'armure en soit la cause : une défense
     * qui absorbe déjà tout ne laisse rien passer.
     * Le doublement d'un critique s'applique ensuite, au résultat final (voir applyDamages).
     * @param impact     L'impact du coup porté.
     * @param armor      La protection qui lui est opposée.
     * @param perforante True si l'arme inflige au moins 1 degré malgré l'armure.
     * @param absorption Le modificateur de la manœuvre de défense : positif il amortit,
     *                   négatif il majore.
     * @returns les dommages effectivement reçus, jamais négatifs.
     */
    static damagesOf(impact, armor, perforante, absorption) {
        const avantArmure = impact - absorption;
        const encaisse = avantArmure - armor;
        return Math.max(0, perforante && avantArmure > 0 ? Math.max(1, encaisse) : encaisse);
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
                        await actor.activateEffect(manoeuver.effect.name);
                    }
                } else if (manoeuver.id === Liberer.ID) {
                    const actor = canvas.tokens?.objects?.children.find(t => t.actor.id === attacker)?.actor;
                    if (actor != null) {
                        await actor.deactivateEffect(ActiveEffects.IMMOBILISE.name);
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
     * @returns les cases cochées (Set), vide si aucun dommage, null si rien n'a été traité :
     *          dégâts manuels ou acteur déjà hors de combat.
     */
    async apply(amount) {

        // Exit if manual dammages
        if (this.actor.system.options.degatAutomatique !== true) {
            return null;
        }

        // Exit if the actor is already out
        if (this.actor.system.dommage[this.type]['mortelle'] === true) {
            return null;
        }

        // No damages
        if (amount <= 0) {
            return new Set();
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
            return damageToApply.boxes;

        // To much damage
        } else {
            await this.actor.update({ ["system.dommage." + this.type + ".mortelle"]: true });
            return new Set(['mortelle']);
        }

    }

}

class Damage {

    constructor() {
        this.size = null;
        this.boxes = new Set();
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