import { MigrationTools } from "./migration.js";

/**
 * Migration 1.0.10 — six types passent aux versions de règles.
 *
 * CE QUI CHANGE. L'arcane, la capacité, le passé, la quête et le savoir rangeaient leur
 * description, leur degré et leur période à la racine de `system` ; le vécu y ajoutait son
 * élément, ses compétences et ses mnémos. Tout cela décrit ce que vaut l'objet sous une
 * édition donnée et vit désormais dans `system.versions.v5`. L'identifiant et l'illustration
 * restent à la racine : ils ne dépendent pas des règles.
 *
 * CE QU'ELLE FAIT. Rien d'autre que FIXER la nouvelle forme en base. Le déplacement, lui,
 * a déjà eu lieu au chargement, dans `VersionMigration.apply` appelée par le `migrateData`
 * de chaque modèle — le seul crochet qui voie la donnée avant que les champs hors schéma
 * ne soient élagués. Tant qu'aucune écriture n'a lieu, l'enregistrement stocké garde
 * l'ancienne forme et la passerelle refait le travail à chaque ouverture du monde.
 *
 * Le remplacement forcé est nécessaire : une mise à jour ordinaire aux mêmes valeurs
 * produit un diff vide, et Foundry n'écrit alors rien.
 *
 * CE QU'ELLE PARCOURT. Les items du monde et les copies embarquées sur les acteurs. Pas les
 * compendiums : livrés avec le système, ils seraient réécrits à la prochaine mise à jour.
 * Un item importé depuis un compendium arrivera donc sous l'ancienne forme, et la
 * passerelle le rattrapera — c'est pourquoi celle-ci ne pourra disparaître qu'une fois le
 * compendium transformé hors ligne.
 */
export class _1_0_10 {

    /**
     * Les types portés par cette migration.
     */
    static TYPES = ['arcane', 'capacite', 'passe', 'quete', 'savoir', 'vecu'];

    static async migrate(target) {

        const msg = "Updating to " + target;
        const items = game.items.filter(i => _1_0_10.TYPES.includes(i.type));
        const acteurs = game.actors.contents;
        const size = items.length + acteurs.length;
        let traites = 0;
        let reecrits = 0;

        for (const item of items) {
            if (await _1_0_10.fixer(item)) reecrits++;
            MigrationTools.progress(msg, ++traites, size);
        }

        for (const actor of acteurs) {
            for (const item of actor.items.filter(i => _1_0_10.TYPES.includes(i.type))) {
                if (await _1_0_10.fixer(item)) reecrits++;
            }
            MigrationTools.progress(msg, ++traites, size);
        }

        await game.settings.set("neph5e", "worldTemplateVersion", target);

        ui.notifications.info("Update to " + target + " done"
            + (reecrits > 0 ? " (" + reecrits + " item(s) réécrit(s))" : ""));
    }

    /**
     * Écrit la forme que le document a déjà en mémoire, celle qu'a produite migrateData.
     * @param item The item to rewrite.
     * @returns true si l'item a été réécrit.
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
