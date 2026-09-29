import { MigrationTools } from "./migration.js";

/**
 * Migration 1.0.9 — les compétences passent aux versions de règles.
 *
 * CE QUI CHANGE. Une compétence rangeait sa description et son élément à la racine de
 * `system` ; ils appartiennent désormais à la version des règles qui les décrit, soit
 * `system.versions.v5`. L'identifiant et l'illustration restent à la racine : ils ne
 * dépendent pas de l'édition.
 *
 * CE QUE CETTE MIGRATION FAIT, ET SURTOUT CE QU'ELLE NE FAIT PAS. Elle ne déplace rien :
 * le déplacement est déjà fait, à chaque chargement, par `CompetenceDataModel.migrateData`.
 * Il le fallait, car un champ retiré du schéma est élagué au chargement du document, si
 * bien qu'un script tournant au démarrage ne trouverait plus rien à lire. `migrateData` est
 * le seul crochet appelé avant cet élagage.
 *
 * Il reste donc à FIXER la nouvelle forme en base : tant qu'aucune écriture n'a lieu,
 * l'enregistrement stocké garde l'ancienne, et la passerelle refait le travail à chaque
 * ouverture du monde. Cette migration force donc une écriture par compétence. Le
 * remplacement forcé est nécessaire : une mise à jour ordinaire aux mêmes valeurs produit
 * un diff vide, et Foundry n'écrit alors rien.
 *
 * CE QU'ELLE PARCOURT. Les compétences du monde, et les copies embarquées sur les acteurs,
 * qui portent les mêmes champs. Pas les compendiums : ils sont livrés avec le système et
 * seraient réécrits à la prochaine mise à jour — un item importé ensuite arrivera sous
 * l'ancienne forme, et la passerelle le rattrapera.
 */
export class _1_0_9 {

    static async migrate(target) {

        const msg = "Updating to " + target;
        const competences = game.items.filter(i => i.type === 'competence');
        const acteurs = game.actors.contents;
        const size = competences.length + acteurs.length;
        let traites = 0;
        let reecrites = 0;

        for (const item of competences) {
            if (await _1_0_9.fixer(item)) reecrites++;
            MigrationTools.progress(msg, ++traites, size);
        }

        for (const actor of acteurs) {
            for (const item of actor.items.filter(i => i.type === 'competence')) {
                if (await _1_0_9.fixer(item)) reecrites++;
            }
            MigrationTools.progress(msg, ++traites, size);
        }

        await game.settings.set("neph5e", "worldTemplateVersion", target);

        ui.notifications.info("Update to " + target + " done"
            + (reecrites > 0 ? " (" + reecrites + " compétence(s) réécrite(s))" : ""));
    }

    /**
     * Écrit la forme que le document a déjà en mémoire, celle qu'a produite migrateData.
     * @param item The competence to rewrite.
     * @returns true si la compétence a été réécrite.
     */
    static async fixer(item) {
        const source = item.system.toObject();
        if (source.versions == null) return false;
        await item.update({
            ['system']: new foundry.data.operators.ForcedReplacement(source)
        });
        return true;
    }

}
