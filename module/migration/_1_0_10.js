import { MigrationTools } from "./migration.js";
import { VersionMigration } from "./versionMigration.js";
import { _1_0_9 } from "./_1_0_9.js";
import { Incarnations } from "../../feature/incarnation/incarnations.js";
import { Version } from "../common/version.js";

/**
 * Migration 1.0.10 — les incarnations deviennent des items.
 *
 * AVANT. Une incarnation était une période embarquée : chaînée aux autres par `previous`
 * (la tête de chaîne, `previous === null`, étant la plus ancienne), activée ou non par
 * `actif`. Tout item acquis pendant une incarnation était une copie embarquée portant le sid
 * de sa période dans `periode`, et souvent son degré dans `degre` : un item qui avait
 * progressé sur plusieurs incarnations existait en plusieurs exemplaires. Une période pouvait
 * porter plusieurs vécus.
 *
 * APRÈS. Une incarnation est un item `incarnation` embarqué, avec sa propre clé. Il porte sa
 * `periode`, ses `vecus` — aucun, un ou plusieurs —, `actif`,
 * sa place dans la chronologie (`predecesseur`, `successeur` : une liste doublement chaînée,
 * de la plus ancienne à la plus récente) et ses `apports` :
 * `{ sid, degre }` pour chaque autre item acquis pendant l'incarnation. Chaque vécu garde sa
 * période et son degré. Un item embarqué n'existe plus qu'en un exemplaire. Voir la façade
 * `Incarnations`.
 *
 * CE QU'ELLE FAIT, acteur par acteur (figures et fraternités) :
 *   1. lit la chaîne des périodes embarquées, de la plus ancienne à la plus récente ; une
 *      période hors chaîne (chaîne cassée) est rangée en queue, avec les plus récentes ;
 *   2. pour chaque période, crée UNE incarnation, de même clé que la période : la période
 *      courante de l'acteur et l'effectif d'une fraternité, qui la désignent ainsi, restent
 *      justes sans être réécrits. Elle reçoit tous les vécus de l'époque — éventuellement
 *      aucun —, et tous les apports de la période ;
 *   3. verse chaque copie rattachée dans les apports — le degré pour les types qui en
 *      acquièrent un (savoir, quête, arcane, chute, science, passe), null pour les autres ;
 *   4. supprime les périodes embarquées et les copies en double, en gardant un exemplaire par
 *      item — de préférence un exemplaire rattaché. Un vécu présent sur plusieurs périodes
 *      reste à la première rencontrée dans la chaîne.
 *   5. fixe en base la forme nouvelle des items restants, que 1.0.9 a laissés à cette
 *      conversion (voir _1_0_9.aConvertir) : ils ne sont réécrits sans leurs anciens champs
 *      qu'une fois ces champs versés dans les incarnations.
 *
 * Une copie dont la période n'est pas embarquée ne comptait pas : elle ne verse rien. Elle
 * reste sur l'acteur si c'est le seul exemplaire de son item.
 *
 * CE QU'ELLE RETIRE. Les champs `periode` et `degre` des items (sauf le vécu, qui garde les
 * deux, et la passe d'armes et les focus, qui gardent leur degré), et `actif` / `previous`
 * des périodes, quittent les schémas avec elle. Foundry les élaguerait au chargement, avant
 * que la migration puisse les lire : ils sont donc relevés à ce moment-là, sur les données
 * brutes, par NephilimActor.migrateData (VersionMigration.releveIncarnations). Les acteurs synthétiques des tokens non liés ne sont pas traités : seuls les
 * figurants le sont d'ordinaire, et ils n'ont pas d'incarnations.
 *
 * Un acteur qui porte déjà des incarnations n'est pas retouché : la migration peut être
 * relancée sans danger.
 */
export class _1_0_10 {

    static async migrate(target) {

        const msg = "Updating to " + target;
        const acteurs = game.actors.filter(a => Incarnations.ACTEURS.includes(a.type));
        const size = acteurs.length;
        let etape = 0;
        let convertis = 0;

        MigrationTools.progress(msg, etape, size);

        for (const actor of acteurs) {
            if (await _1_0_10.convertir(actor)) {
                convertis++;
            }
            MigrationTools.progress(msg, ++etape, size);
        }

        await game.settings.set("neph5e", "worldTemplateVersion", target);

        ui.notifications.info("Update to " + target + " done"
            + (convertis > 0 ? " (" + convertis + " acteur(s) converti(s))" : ""));
    }

    /**
     * @param actor The figure or fraternite to convert.
     * @returns true if the actor has been converted.
     */
    static async convertir(actor) {

        const periodes = actor.items.filter(i => i.type === 'periode');
        if (periodes.length === 0 || actor.items.some(i => i.type === 'incarnation')) {
            return false;
        }

        // Les champs lus ici ont quitté les schémas avec cette migration : ils sont relevés au
        // chargement, avant élagage (VersionMigration.releveIncarnations). Sans relevé — un
        // acteur créé en cours de partie —, ils sont lus sur les items.
        const releve = actor.flags?.neph5e?.releveIncarnations ?? {};
        const lire = (item, champ) => (releve[item.id] != null && champ in releve[item.id])
            ? releve[item.id][champ]
            : Version.data(item)[champ];

        // 1. La chaîne, de la plus ancienne à la plus récente
        const chaine = [];
        const vus = new Set();
        let previous = null;
        while (true) {
            const p = periodes.find(i => lire(i, 'previous') === previous && !vus.has(i.sid));
            if (p == null) break;
            chaine.push(p);
            vus.add(p.sid);
            previous = p.sid;
        }
        for (const p of periodes.filter(i => !vus.has(i.sid))) {
            chaine.push(p);
        }
        const embarquees = new Set(chaine.map(p => p.sid));

        // L'exemplaire gardé pour chaque item : de préférence un exemplaire rattaché
        const copies = new Map();
        for (const item of actor.items.filter(i => i.type !== 'periode' && lire(i, 'periode') != null)) {
            const liste = copies.get(item.sid) ?? [];
            liste.push(item);
            copies.set(item.sid, liste);
        }
        const doublons = [];
        for (const liste of copies.values()) {
            const garde = liste.find(i => embarquees.has(lire(i, 'periode'))) ?? liste[0];
            doublons.push(...liste.filter(i => i !== garde).map(i => i.id));
        }

        // 2. et 3. Les incarnations, période par période
        const incarnations = [];
        const vecusPris = new Set();
        for (const p of chaine) {

            // Toutes les copies versent leur apport, doublons compris : ce sont eux qui portent
            // ce que l'item doit aux autres périodes. Seul l'exemplaire gardé reste ensuite.
            const rattaches = actor.items.filter(i => i.type !== 'periode' && lire(i, 'periode') === p.sid);
            const vecus = rattaches.filter(i => i.type === 'vecu' && !vecusPris.has(i.sid));
            vecus.forEach(v => vecusPris.add(v.sid));

            const apports = [];
            for (const item of rattaches.filter(i => i.type !== 'vecu')) {
                if (apports.some(a => a.sid === item.sid)) continue;
                const degre = Incarnations.VECUS.includes(item.type) ? (lire(item, 'degre') ?? 0) : null;
                apports.push({ sid: item.sid, degre: degre });
            }

            // Une incarnation par période, de même clé que la période : elle reçoit tous les
            // vécus de l'époque, et tous ses apports.
            incarnations.push({
                name: p.name,
                type: 'incarnation',
                img: p.img,
                system: {
                    id: p.sid,
                    versions: {
                        v5: {
                            periode: p.sid,
                            vecus: [...new Set(vecus.map(v => v.sid))],
                            actif: lire(p, 'actif') === true,
                            apports: apports
                        }
                    }
                }
            });
        }

        // Le chaînage suit la chronologie : la tête, la plus ancienne, n'a pas de prédécesseur.
        // Chaque incarnation garde la clé de sa période : les liens se posent dès la création.
        incarnations.forEach((data, i) => {
            data.system.versions.v5.predecesseur = incarnations[i - 1]?.system.id ?? null;
            data.system.versions.v5.successeur = incarnations[i + 1]?.system.id ?? null;
        });

        // 4. Les incarnations, puis le ménage
        await actor.createEmbeddedDocuments('Item', incarnations);
        await actor.deleteEmbeddedDocuments('Item', [...periodes.map(p => p.id), ...doublons], { incarnations: false });

        // 5. Les items restants, que 1.0.9 a laissés pour cette conversion : leur forme nouvelle
        //    est fixée en base, maintenant que ce qu'ils portaient est versé dans les incarnations.
        for (const item of actor.items.filter(i => i.type !== 'incarnation' && VersionMigration.CHAMPS[i.type] != null)) {
            await _1_0_9.fixer(item);
        }

        return true;
    }

}
