import { MigrationTools } from "./migration.js";
import { VersionMigration } from "./versionMigration.js";

/**
 * Migration 1.0.9 — les versions de règles.
 *
 * CE QUI CHANGE. Chaque item et chaque acteur rangeait ses champs de règles à la racine de
 * `system` ; ils appartiennent désormais à la version des règles qui les décrit, soit
 * `system.versions.v5`. Ne restent à la racine que l'identifiant — et l'illustration pour
 * les items — qui ne dépendent pas de l'édition. Les champs déplacés, type par type, sont
 * ceux de la table `VersionMigration.CHAMPS` : c'est elle qui dit ce que cette migration
 * parcourt.
 *
 * CE QUE CETTE MIGRATION FAIT, ET SURTOUT CE QU'ELLE NE FAIT PAS.
 *
 * 1. Pour les items et les acteurs, elle ne déplace rien : le déplacement est déjà fait, à
 *    chaque chargement, par le `migrateData` de chaque modèle, qui délègue à
 *    `VersionMigration.apply`. Il le fallait, car un champ retiré du schéma est élagué au
 *    chargement du document, si bien qu'un script tournant au démarrage ne trouverait plus
 *    rien à lire. `migrateData` est le seul crochet appelé avant cet élagage.
 *
 *    Il reste donc à FIXER la nouvelle forme en base : tant qu'aucune écriture n'a lieu,
 *    l'enregistrement stocké garde l'ancienne, et la passerelle refait le travail à chaque
 *    ouverture du monde. Cette migration force donc une écriture par document. Le
 *    remplacement forcé est nécessaire : une mise à jour ordinaire aux mêmes valeurs produit
 *    un diff vide, et Foundry n'écrit alors rien.
 *
 * 2. Pour les tokens non liés, elle DÉPLACE les écarts que porte leur delta.
 *    `ActorDelta.system` est un ObjectField brut : aucun `migrateData` de modèle ne le voit.
 *    Foundry le fusionne sur l'acteur de base, qui a déjà sa forme versionnée, avant de
 *    construire l'acteur synthétique ; la passerelle laisse alors gagner la valeur rangée
 *    dans la version — celle de l'acteur de base. Sans ce déplacement, un figurant blessé
 *    reprendrait les dommages, le ka et les bonus de son modèle.
 *
 * CE QU'ELLE PARCOURT. Les items du monde, les acteurs du monde et leurs items embarqués,
 * les tokens non liés de chaque scène. Pas les compendiums : ils sont livrés avec le système
 * et seraient réécrits à la prochaine mise à jour — un document importé ensuite arrivera
 * sous l'ancienne forme, et la passerelle le rattrapera. Pas non plus les items propres au
 * delta d'un token non lié : la passerelle les rattrape en mémoire, et les écrire ferait
 * de chaque item de la base une surcharge du delta.
 *
 * Une seule barre de progression couvre l'ensemble : une étape par item du monde, par
 * acteur (lui et ses items embarqués), par scène.
 */
export class _1_0_9 {

    static async migrate(target) {

        const msg = "Updating to " + target;
        const portes = (document) => VersionMigration.CHAMPS[document.type] != null;

        const items = game.items.filter(portes);
        const acteurs = game.actors.contents;
        const scenes = game.scenes.contents;
        const size = items.length + acteurs.length + scenes.length;
        let etape = 0;
        let documents = 0;
        let deltas = 0;

        MigrationTools.progress(msg, etape, size);

        for (const item of items) {
            if (await _1_0_9.fixer(item)) documents++;
            MigrationTools.progress(msg, ++etape, size);
        }

        for (const actor of acteurs) {
            if (portes(actor) && await _1_0_9.fixer(actor)) documents++;
            for (const item of actor.items.filter(portes)) {
                if (await _1_0_9.fixer(item)) documents++;
            }
            MigrationTools.progress(msg, ++etape, size);
        }

        for (const scene of scenes) {
            for (const token of scene.tokens.filter(t => t.actorLink !== true && t.delta != null)) {
                if (await _1_0_9.deplacer(token)) deltas++;
            }
            MigrationTools.progress(msg, ++etape, size);
        }

        await game.settings.set("neph5e", "worldTemplateVersion", target);

        const details = [];
        if (documents > 0) details.push(documents + " document(s) réécrit(s)");
        if (deltas > 0) details.push(deltas + " token(s) non lié(s) déplacé(s)");
        ui.notifications.info("Update to " + target + " done" + (details.length > 0 ? " (" + details.join(", ") + ")" : ""));
    }

    /**
     * Écrit la forme que le document a déjà en mémoire, celle qu'a produite migrateData.
     * @param document The item or actor to rewrite.
     * @returns true si le document a été réécrit.
     */
    static async fixer(document) {
        const source = document.system.toObject();
        if (source.versions == null) return false;
        await document.update({
            ['system']: new foundry.data.operators.ForcedReplacement(source)
        });
        return true;
    }

    /**
     * Range dans la version les écarts qu'un token non lié porte encore à plat.
     * @param token The token document whose delta to move.
     * @returns true si le delta a été réécrit.
     */
    static async deplacer(token) {
        const type = token.actor?.type ?? game.actors.get(token.actorId)?.type;
        if (VersionMigration.CHAMPS[type] == null) return false;

        const brut = token.delta._source?.system;
        if (brut == null || Object.keys(brut).length === 0) return false;

        const deplace = VersionMigration.apply(type, foundry.utils.deepClone(brut));
        if (foundry.utils.objectsEqual(deplace, brut)) return false;

        await token.delta.update({
            ['system']: new foundry.data.operators.ForcedReplacement(deplace)
        });
        return true;
    }

}
