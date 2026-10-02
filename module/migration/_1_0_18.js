import { MigrationTools } from "./migration.js";
import { VersionMigration } from "./versionMigration.js";

/**
 * Migration 1.0.18 — les acteurs : figure, figurant, fraternité.
 *
 * CE QUI CHANGE. Les trois types d'acteur rangent tous leurs champs — ka, dommages, bonus,
 * manœuvres, alchimie, akasha, période, effectif, description, options… — dans
 * `system.versions.v5`. Seul l'identifiant reste à la racine.
 *
 * CE QU'ELLE FAIT.
 *
 * 1. Pour les acteurs du monde, rien d'autre que FIXER la nouvelle forme en base : le
 *    déplacement a déjà eu lieu au chargement, dans `VersionMigration.apply` appelée par le
 *    `migrateData` de chaque modèle. Voir _1_0_9 pour le détail de ce partage des rôles.
 *
 * 2. Pour les tokens non liés, DÉPLACER les écarts que porte leur delta. `ActorDelta.system`
 *    est un ObjectField brut : aucun `migrateData` de modèle ne le voit. Foundry le fusionne
 *    sur l'acteur de base, qui a déjà sa forme versionnée, avant de construire l'acteur
 *    synthétique ; la passerelle laisse alors gagner la valeur rangée dans la version — celle
 *    de l'acteur de base. Sans ce déplacement, un figurant blessé reprendrait les dommages,
 *    le ka et les bonus de son modèle.
 */
export class _1_0_18 {

    /**
     * Les types portés par cette migration.
     */
    static TYPES = ['figure', 'figurant', 'fraternite'];

    static async migrate(target) {

        const msg = "Updating to " + target;
        const acteurs = game.actors.filter(a => _1_0_18.TYPES.includes(a.type));
        const scenes = game.scenes.contents;
        const size = acteurs.length + scenes.length;
        let traites = 0;
        let reecrits = 0;
        let deltas = 0;

        for (const actor of acteurs) {
            if (await _1_0_18.fixer(actor)) reecrits++;
            MigrationTools.progress(msg, ++traites, size);
        }

        for (const scene of scenes) {
            for (const token of scene.tokens.filter(t => t.actorLink !== true && t.delta != null)) {
                if (await _1_0_18.deplacer(token)) deltas++;
            }
            MigrationTools.progress(msg, ++traites, size);
        }

        await game.settings.set("neph5e", "worldTemplateVersion", target);

        const details = [];
        if (reecrits > 0) details.push(reecrits + " acteur(s) réécrit(s)");
        if (deltas > 0) details.push(deltas + " token(s) non lié(s) déplacé(s)");
        ui.notifications.info("Update to " + target + " done" + (details.length > 0 ? " (" + details.join(", ") + ")" : ""));
    }

    /**
     * Écrit la forme que le document a déjà en mémoire, celle qu'a produite migrateData.
     * @param actor The actor to rewrite.
     * @returns true si l'acteur a été réécrit.
     */
    static async fixer(actor) {
        const source = actor.system.toObject();
        if (source.versions == null) return false;
        await actor.update({
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
        if (!_1_0_18.TYPES.includes(type)) return false;

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
