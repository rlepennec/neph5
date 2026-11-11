import { Version } from "../common/version.js";

/**
 * Le registre des jeux de règles.
 *
 * Le code commun ne connaît aucune notion de règles : ni jet, ni compétence, ni Ka, ni combat.
 * Une version peut n'avoir ni jets de compétence, ni quêtes, ni combat. Le commun demande donc au
 * jeu de règles de la version courante ce qu'il fournit, et la réponse peut être « rien » : tout
 * y est facultatif, et le commun ne le consulte que par « si la version le fournit » :
 *
 *     Regles.courantes.incarnationCreee?.(actor, cle);
 *
 * LE CONTRAT. Un jeu de règles est un objet qui porte `version`, et s'il y a lieu :
 *   - `fiches` : les fiches, par type de document ;
 *   - `acteur(actor)` : l'objet des règles de cet acteur, exposé par `actor.regles`. L'acteur commun
 *     le consulte, s'il les fournit, pour `basculerEtat(statusId, options, parDefaut)` (le HUD et
 *     le suivi de combat), `apresModification(changed)`, `supprimerObjet(item)` (un objet
 *     supprimé de la fiche, hors incarnation), `acteursSupprimes(sids)` (des acteurs supprimés du
 *     monde) et `processMacro` (les macros de la barre) ;
 *   - `incarnationCreee(actor, cle, anterieure)` : ce qui se passe à la création d'une incarnation
 *     (`anterieure` : l'incarnation active la plus proche, null si aucune) ;
 *   - `supprimerLies(actor, items)` : supprime ce qui était lié à une incarnation retirée ; sans
 *     lui, le commun supprime simplement les objets ;
 *   - `incarnationRetiree(actor, cle)` : ce qui se passe ensuite, hors des objets de l'acteur ;
 *   - `evenements` : les réactions aux événements de Foundry, chacune facultative :
 *     `combattantCree(combatant)` (false l'annule), `nouveauRound(combat)`,
 *     `messageAffiche(message, html)` (chat), `macroDeposee(bar, data, slot)` (synchrone, true
 *     si le dépôt est pris), `messageRecu(socketMessage)` (messages entre clients) ;
 *   - `outils` : les outils du MJ, ajoutés au groupe de contrôles Nephilim (`order` les place) ;
 *   - `gabarits` : les gabarits à pré-charger.
 *
 * LA BASCULE À CHAUD. `Regles.courantes` suit la version du monde à chaque lecture : rien n'est à
 * garder d'une lecture à l'autre, et changer de version ne demande pas de recharger le monde.
 */
export class Regles {

    /**
     * Le jeu d'une version qui n'en a pas : il ne fournit rien.
     */
    static VIDE = Object.freeze({ version: null });

    /**
     * Ce que `actor.regles` rend quand la version ne fournit rien pour les acteurs.
     */
    static ACTEUR_VIDE = Object.freeze({});

    /**
     * Les jeux de règles enregistrés, par version.
     */
    static #jeux = new Map();

    /**
     * @param jeu Le jeu de règles à enregistrer, pour sa version.
     */
    static enregistrer(jeu) {
        if (!Version.ALL.includes(jeu?.version)) {
            throw new Error("Regles.enregistrer : version inconnue " + jeu?.version);
        }
        Regles.#jeux.set(jeu.version, jeu);
    }

    /**
     * @param version La version de règles.
     * @returns son jeu de règles ; le jeu vide si elle n'en a pas.
     */
    static get(version) {
        return Regles.#jeux.get(version) ?? Regles.VIDE;
    }

    /**
     * @returns le jeu de règles de la version du monde.
     */
    static get courantes() {
        return Regles.get(Version.world);
    }

    /**
     * @param actor L'acteur.
     * @returns l'objet des règles de cet acteur pour la version du monde ; un objet vide si elle
     *          ne fournit rien pour les acteurs.
     */
    static acteur(actor) {
        return Regles.courantes.acteur?.(actor) ?? Regles.ACTEUR_VIDE;
    }

}
