import { Constants } from "../../../module/common/constants.js";
import { Version } from "../../../module/common/version.js";
import { Health } from "../../core/health.js";
import { NephilimChat } from "../../../module/common/chat.js";

/**
 * Riposte en attente après une défense Contrer réussie.
 *
 * La contre-attaque ne s'ouvre pas d'elle-même : le défenseur est prévenu (notification et
 * message de chat) qu'il peut contre-attaquer, puis il clique sur une de ses armes
 * naturelles ou de mêlée en main (voir armes). Tant que la riposte est en attente, une
 * attaque de mêlée ou naturelle EST la contre-attaque (voir intercepter, appelé par Melee
 * et Naturelle). Elle se joue hors de son tour, sans cible à sélectionner.
 *
 * Les dommages de l'attaque initiale restent suspendus jusqu'à la conclusion :
 *  - contre-attaque réussie : le défenseur ne subit rien ;
 *  - contre-attaque ratée, ou abandonnée (riposte encore en attente au changement de
 *    round, voir RoundUpdate) : il les subit, majorés de 2.
 *
 * La riposte est un drapeau du défenseur, qui garde tout ce qu'il faut pour appliquer ces
 * dommages plus tard, depuis n'importe quel client.
 */
export class Riposte {

    static FLAG = 'riposte';

    /** Même majoration qu'un Contrer raté : Health.applyDamages ajoute 2 aux dommages. */
    static MAJORATION = { modifier: -2 };

    /**
     * @param actor L'acteur à examiner.
     * @returns la riposte en attente de l'acteur, null s'il n'en a pas.
     */
    static of(actor) {
        return actor?.getFlag?.('neph5e', Riposte.FLAG) ?? null;
    }

    /**
     * @param actor L'acteur qui contre-attaque.
     * @returns les armes qui permettent de riposter : ses armes naturelles, toujours
     *          disponibles (elles n'ont pas d'état « en main »), et ses armes de mêlée en main.
     */
    static armes(actor) {
        return actor.items.filter(i => i.type === 'arme' &&
            (Version.data(i).type === Constants.NATURELLE ||
            (Version.data(i).type === Constants.MELEE && Version.data(i).used === true)));
    }

    /**
     * Met la riposte en attente après une défense Contrer réussie, et prévient le défenseur.
     * @param defense L'action de défense réussie.
     */
    static async ouvrir(defense) {
        const weapon = defense.attack.weapon;
        const combat = game.combat;
        await defense.actor.setFlag('neph5e', Riposte.FLAG, {
            token: defense.actor.tokenOf?.id ?? null,
            attaquant: defense.attack.actor.tokenOf?.id ?? null,
            attaquantActeur: defense.attack.actor.id,
            impact: defense.impactFinal(),
            arme: weapon == null ? null : {
                system: {
                    damages: Version.data(weapon).damages ?? 0,
                    magique: Version.data(weapon).magique === true
                }
            },
            attaqueImpact: defense.attack.manoeuver?.impact ?? {},
            winner: defense.winner,
            critique: defense.result?.critical === true,
            combat: combat?.id ?? null,
            round: combat?.round ?? null
        });
        const sentence = defense.actor.name + " peut contre-attaquer " + defense.attack.actor.name + " avec une de ses armes";
        ui.notifications.info(sentence + " : cliquer sur l'attaque d'une arme naturelle ou d'une arme de mêlée en main.");
        await new NephilimChat(defense.actor)
            .withTemplate("systems/neph5e/feature/core/chat.hbs")
            .withData({
                actor: defense.actor,
                richSentence: sentence,
                img: defense.attack.actor.img
            })
            .create();
    }

    /**
     * Début d'une attaque de mêlée ou naturelle : s'il y a une riposte en attente, c'est la
     * contre-attaque qui s'ouvre, avec l'arme choisie. Une riposte d'un autre round (le
     * changement de round n'a pas pu la conclure) est d'abord conclue comme abandonnée.
     * @param actor  L'acteur qui attaque.
     * @param weapon L'arme avec laquelle il attaque.
     * @returns true si la contre-attaque a pris la place de l'attaque.
     */
    static async intercepter(actor, weapon) {
        const riposte = Riposte.of(actor);
        if (riposte == null) {
            return false;
        }
        const combat = game.combat;
        if (riposte.combat !== (combat?.id ?? null) || riposte.round !== (combat?.round ?? null)) {
            await Riposte.conclure(actor, false);
            return false;
        }
        // Import dynamique : ContreAttaque hérite de Melee, qui appelle ce module.
        const { ContreAttaque } = await import("./contreAttaque.js");
        await new ContreAttaque(actor, weapon, riposte).initializeRoll();
        return true;
    }

    /**
     * Conclut la riposte : la retire, puis applique au défenseur ses dommages suspendus.
     * @param actor   Le défenseur.
     * @param success True si la contre-attaque a réussi.
     */
    static async conclure(actor, success) {
        const riposte = Riposte.of(actor);
        if (riposte == null) {
            return;
        }
        await actor.unsetFlag('neph5e', Riposte.FLAG);
        if (success === true) {
            return;
        }
        await Health.applyDamagesOn(
            riposte.token ?? actor.tokenOf?.id,
            riposte.impact,
            true,
            riposte.arme,
            Riposte.MAJORATION,
            riposte.winner,
            { impact: riposte.attaqueImpact ?? {} },
            riposte.critique,
            riposte.attaquantActeur);
    }

}
