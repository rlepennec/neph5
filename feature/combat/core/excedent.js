import { AbstractFeature } from "../../core/abstractFeature.js";
import { ExcedentDialog } from "./excedentDialog.js";

/**
 * Marge de réussite supérieure à 10 en combat.
 *
 * Pour chaque degré de marge au-delà de 10 :
 *  - l'attaquant augmente les dommages d'un degré, ou inflige un malus de 1 (-10 %) au
 *    test de Défense de l'adversaire ;
 *  - le défenseur diminue les dommages d'un degré, ou inflige un malus de 1 (-10 %) au
 *    test d'Attaque de l'adversaire.
 *
 * Le joueur répartit ses degrés entre les deux choix dans une fenêtre (ExcedentDialog). L'attaquant choisit
 * avant que sa défense ne soit proposée à l'adversaire : son malus porte sur le jet de
 * défense à venir. Le défenseur choisit après les deux jets : son malus fait recalculer
 * le résultat de l'attaque avec le même dé, avant que le vainqueur ne soit désigné. Un
 * degré de dommages modifie l'impact, donc avant l'armure et le doublement d'un critique.
 */
export class Excedent {

    static SEUIL = 10;

    static ATTAQUE = {
        dommages: "Augmenter les dommages d'un degré",
        malus: "Malus de 1 (-10 %) au test de Défense de l'adversaire"
    };

    static DEFENSE = {
        dommages: "Diminuer les dommages d'un degré",
        malus: "Malus de 1 (-10 %) au test d'Attaque de l'adversaire"
    };

    /**
     * @param result Le résultat d'un jet.
     * @returns le nombre de degrés de marge au-delà de 10, 0 si le jet a échoué.
     */
    static points(result) {
        return result?.success === true ? Math.max(0, (result.margin ?? 0) - Excedent.SEUIL) : 0;
    }

    /**
     * Ouvre la fenêtre de répartition (voir ExcedentDialog). Par défaut, tous les degrés
     * vont aux dommages ; la fenêtre rend la répartition affichée à sa fermeture.
     * @param actor  L'acteur qui répartit sa marge.
     * @param points Le nombre de degrés à répartir.
     * @param role   Excedent.ATTAQUE ou Excedent.DEFENSE.
     * @returns { dommages, malus } dont la somme vaut points.
     */
    static async repartir(actor, points, role) {
        return await ExcedentDialog.repartir(actor, points, role);
    }

    /**
     * Recalcule le résultat d'un jet déjà lancé avec un malus sur sa difficulté.
     * @param result Le résultat initial, avec sa difficulté et son dé.
     * @param malus  Le malus, en degrés (-10 % chacun).
     * @returns le nouveau résultat, ou le résultat initial si le dé est introuvable.
     */
    static penaliser(result, malus) {
        const total = result?.roll?._total ?? result?.roll?.total;
        if (total == null || !(malus > 0)) {
            return result;
        }
        const difficulty = result.difficulty - malus * 10;
        return {
            ...result,
            difficulty: difficulty,
            ...AbstractFeature.evaluate(total, difficulty)
        };
    }

}
