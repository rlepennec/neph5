import { MigrationTools } from "./migration.js";

/**
 * Migration 1.0.8 — la clé options.locked, restée en base.
 *
 * CE QU'ELLE VIENT NETTOYER. Les figures et les fraternités déclaraient un booléen
 * `system.options.locked`, destiné à un verrou persistant qui n'a jamais été branché :
 * aucune case ne l'écrivait, et son seul lecteur était un getter sur l'acteur. Le champ a
 * été retiré du modèle de données ; il reste sa valeur, écrite à la création des fiches
 * existantes.
 *
 * CE QUE ÇA CHANGE POUR LE JEU : rien. Une clé absente du schéma est élaguée au chargement
 * du document — `DataModel._initializeSource` nettoie avec `prune: true` — donc elle
 * n'existe déjà plus en mémoire, ni côté client ni côté serveur. Cette migration ne touche
 * que les octets au repos, et l'intérêt est de ne pas laisser dans la base un champ dont
 * plus aucune ligne de code ne parle.
 *
 * POURQUOI UN REMPLACEMENT ET NON UNE SUPPRESSION. Trois écritures ont été essayées sur le
 * modèle de données de Foundry, hors du jeu, en observant le diff que produit updateSource :
 *
 *   - `{'system.options.locked': new ForcedDeletion()}` -> diff VIDE. L'instruction porte
 *     sur une clé qui n'est plus dans le schéma, et le nettoyage des changements élague
 *     précisément ces clés-là (`SchemaField.#cleanKeys`, toujours appelé avec `prune: true`
 *     depuis `_preUpdateSource`). L'ordre de suppression disparaît avant d'être appliqué.
 *   - une mise à jour ordinaire de `system.options` avec les mêmes valeurs -> diff VIDE
 *     aussi, donc aucune écriture : la fusion est récursive et ne retire rien.
 *   - `new ForcedReplacement(options)` sur `system.options` -> diff NON VIDE, par
 *     construction. La clé `options`, elle, est bien dans le schéma : l'instruction passe.
 *
 * C'est donc la troisième qui est retenue. Elle remplace le sous-objet en bloc, sans fusion,
 * par la source déjà élaguée que le document a en mémoire — et comme Foundry sérialise le
 * document entier à chaque écriture, l'enregistrement en base repart propre.
 *
 * POURQUOI ELLE ÉCRIT SANS CONDITION. Puisque la clé est élaguée au chargement, aucun code
 * ne peut savoir si une fiche donnée la portait : il n'y a rien à tester. La migration
 * réécrit donc les options de chaque figure et de chaque fraternité. Le contenu écrit est
 * celui déjà en place, l'opération est idempotente, et une fiche déjà propre ne perd rien.
 *
 * CE QU'ELLE NE TOUCHE PAS.
 *   - Les figurants : leur modèle n'a jamais déclaré ce champ.
 *   - Le compendium du système : il ne contient que des items.
 *   - Les acteurs synthétiques des jetons non liés : leur delta ne peut porter que ce qu'une
 *     écriture y a mis, et rien n'a jamais écrit ce champ.
 */
export class _1_0_8 {

    static async migrate(target) {

        const msg = "Updating to " + target;
        const acteurs = game.actors.filter(a => a.type === 'figure' || a.type === 'fraternite');
        let traites = 0;
        let reecrites = 0;

        for (const actor of acteurs) {
            const options = actor._source.system?.options;
            if (options != null) {
                await actor.update({
                    ['system.options']: new foundry.data.operators.ForcedReplacement(
                        foundry.utils.duplicate(options))
                });
                reecrites++;
            }
            MigrationTools.progress(msg, ++traites, acteurs.length);
        }

        await game.settings.set("neph5e", "worldTemplateVersion", target);

        ui.notifications.info("Update to " + target + " done"
            + (reecrites > 0 ? " (" + reecrites + " fiche(s) réécrite(s))" : ""));
    }

}
