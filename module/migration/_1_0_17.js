import { MigrationTools } from "./migration.js";

/**
 * Migration 1.0.17 — le métamorphe.
 *
 * CE QUI CHANGE. Le métamorphe range ses champs — élément, description, noms des
 * métamorphoses, états formé et visible, humeur, portrait — dans `system.versions.v5`.
 * L'identifiant et l'illustration restent à la racine.
 *
 * CE QU'ELLE FAIT. Rien d'autre que FIXER la nouvelle forme en base : le déplacement a déjà
 * eu lieu au chargement, dans `VersionMigration.apply` appelée par le `migrateData` de
 * chaque modèle. Voir _1_0_9 pour le détail de ce partage des rôles.
 */
export class _1_0_17 {

    /**
     * Les types portés par cette migration.
     */
    static TYPES = ['metamorphe'];

    static async migrate(target) {

        const msg = "Updating to " + target;
        const items = game.items.filter(i => _1_0_17.TYPES.includes(i.type));
        const acteurs = game.actors.contents;
        const size = items.length + acteurs.length;
        let traites = 0;
        let reecrits = 0;

        for (const item of items) {
            if (await _1_0_17.fixer(item)) reecrits++;
            MigrationTools.progress(msg, ++traites, size);
        }

        for (const actor of acteurs) {
            for (const item of actor.items.filter(i => _1_0_17.TYPES.includes(i.type))) {
                if (await _1_0_17.fixer(item)) reecrits++;
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
