import { Regles } from "../regles/regles.js";

/**
 * Le choix de la fiche d'un document : celle du jeu de règles de la version du monde, sinon la
 * fiche commune du type (une période, un groupe), sinon la fiche vide, qui garde l'image et le nom
 * et annonce qu'il n'y a rien à montrer. Seuls les types déclarés ici sont concernés ; les autres
 * (incarnation, Ka...) n'ont pas de fiche.
 *
 * La version du monde peut changer à chaud : les fiches déjà créées sont alors remplacées
 * (rafraichir).
 */
export class Fiches {

    /**
     * Par type de document, la fiche commune de chaque type géré.
     */
    static #communes = { Actor: {}, Item: {} };

    /**
     * Déclare un type géré et sa fiche commune.
     * @param documentName 'Actor' or 'Item'.
     * @param type         The document type.
     * @param fiche        La fiche quand les règles n'en fournissent pas.
     */
    static declarer(documentName, type, fiche) {
        Fiches.#communes[documentName][type] = fiche;
    }

    /**
     * @param document The actor or item.
     * @returns la classe de sa fiche ; null pour un type non géré (Foundry choisit alors).
     */
    static classe(document) {
        const communes = Fiches.#communes[document?.documentName];
        if (communes == null || !(document.type in communes)) return null;
        return Regles.courantes.fiches?.[document.documentName]?.[document.type] ?? communes[document.type];
    }

    /**
     * Remplace les fiches déjà créées, ouvertes ou non, après un changement de version : une
     * fiche ouverte se ferme et se rouvre avec sa nouvelle classe (Foundry, _onSheetChange).
     */
    static async rafraichir() {
        const documents = new Set();
        const ajouter = actor => {
            documents.add(actor);
            for (const item of actor.items) documents.add(item);
        };
        for (const actor of game.actors) ajouter(actor);
        for (const item of game.items) documents.add(item);
        for (const scene of game.scenes) {
            for (const token of scene.tokens) {
                if (token.actor != null && !token.actorLink) ajouter(token.actor);
            }
        }
        // Les documents de compendium dont la fiche est ouverte
        for (const app of foundry.applications.instances.values()) {
            if (app.document != null) documents.add(app.document);
        }
        for (const document of documents) {
            if (document._sheet != null && Fiches.classe(document) != null) {
                await document._onSheetChange();
            }
        }
    }

}
