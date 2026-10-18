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
 * `periode`, `actif` et sa place dans la chronologie (`predecesseur`, `successeur` : une liste
 * doublement chaînée, de la plus ancienne à la plus récente). Ce qui lui est lié — vécus,
 * savoirs, quêtes, arcanes, chutes, sciences, ressources, focus, capacités — garde UN
 * EXEMPLAIRE PAR ÉPOQUE, comme avant : chaque exemplaire porte la clé de son incarnation
 * (`system.incarnation`, commune à toutes les versions) et le degré acquis pendant elle. Voir
 * la façade `Incarnations`.
 *
 * CE QU'ELLE FAIT, acteur par acteur (figures et fraternités) :
 *   1. lit la chaîne des périodes embarquées, de la plus ancienne à la plus récente ; une
 *      période hors chaîne (chaîne cassée) est rangée en queue, avec les plus récentes ;
 *   2. pour chaque période, crée UNE incarnation, de même clé que la période : la période
 *      courante de l'acteur, l'effectif d'une fraternité, et les copies qui portaient la
 *      période, qui la désignent ainsi, restent justes ;
 *   3. fait de chaque copie rattachée à une période embarquée l'exemplaire de son incarnation :
 *      la clé est celle de sa période, le degré celui qu'elle portait ; un vécu lié perd la
 *      période qu'il recopiait, qui se lit désormais sur son incarnation ;
 *      une voie (magique, alchimique), qui n'avait pas de période, devient celle de la plus
 *      ancienne incarnation active, et fait foi pour toutes les suivantes ;
 *      les armes et les armures, qui n'en avaient pas non plus, deviennent celles de
 *      l'incarnation courante (elles ne se transmettent pas d'une incarnation à l'autre) ;
 *   4. supprime les périodes embarquées et les copies de trop : une seconde copie du même item
 *      dans la même période ; un vécu présent sur plusieurs périodes, qui reste à la première
 *      rencontrée dans la chaîne (un vécu ne se vit qu'une fois) ; une copie sans période
 *      embarquée quand l'item a un exemplaire ailleurs ;
 *   5. fixe en base la forme nouvelle des items restants, que 1.0.9 a laissés à cette
 *      conversion (voir _1_0_9.aConvertir) : ils ne sont réécrits sans leurs anciens champs
 *      qu'une fois ces champs lus.
 *
 * Une copie dont la période n'est pas embarquée ne comptait pas : elle reste sur l'acteur, sans
 * incarnation, si c'est le seul exemplaire de son item.
 *
 * CE QU'ELLE RETIRE. Le champ `periode` des items (sauf le vécu, qui le garde), et `actif` /
 * `previous` des périodes, quittent les schémas avec elle ; le degré des savoirs, quêtes,
 * arcanes, chutes et sciences n'était plus dans leur version. Foundry élaguerait ces champs au
 * chargement, avant que la migration puisse les lire : ils sont donc relevés à ce moment-là,
 * sur les données brutes, par NephilimActor.migrateData (VersionMigration.releveIncarnations).
 * Les acteurs synthétiques des tokens non liés ne sont pas traités : seuls les figurants le
 * sont d'ordinaire, et ils n'ont pas d'incarnations.
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

        // 3. et 4. Les exemplaires gardés, période par période dans l'ordre de la chaîne, et les
        //    copies de trop
        const lies = actor.items.filter(i => Incarnations.LIES.includes(i.type));
        const exemplaires = new Map();      // id de l'item gardé -> clé de son incarnation
        const doublons = [];
        const vecusPris = new Set();
        for (const p of chaine) {
            const prises = new Set();
            for (const item of lies.filter(i => lire(i, 'periode') === p.sid)) {
                const deja = prises.has(item.sid) || (item.type === 'vecu' && vecusPris.has(item.sid));
                if (deja) {
                    doublons.push(item.id);
                    continue;
                }
                prises.add(item.sid);
                if (item.type === 'vecu') vecusPris.add(item.sid);
                exemplaires.set(item.id, p.sid);
            }
        }
        // Les voies (magique, alchimique) n'avaient pas de période : elles valaient pour toute la
        // vie de la figure. Chacune devient celle de la plus ancienne incarnation active (sinon
        // de la plus ancienne), et fait ainsi foi pour toutes les suivantes. Une seule par type.
        // Les armes et les armures n'avaient pas de période non plus ; elles ne se transmettent
        // pas d'une incarnation à l'autre : toutes deviennent celles de l'incarnation courante
        // (sinon de la plus récente). Plusieurs exemplaires d'une même arme restent possibles.
        const periodeCourante = Version.data(actor).periode;
        const courante = embarquees.has(periodeCourante) ? periodeCourante : chaine.at(-1)?.sid;
        for (const item of lies.filter(i => Incarnations.EQUIPEMENTS.includes(i.type) && !exemplaires.has(i.id))) {
            if (courante != null) exemplaires.set(item.id, courante);
        }

        const premiere = chaine.find(p => lire(p, 'actif') === true) ?? chaine[0];
        for (const type of Incarnations.VOIES) {
            const [voie, ...autres] = lies.filter(i => i.type === type && !exemplaires.has(i.id) && !doublons.includes(i.id));
            if (voie != null && premiere != null) exemplaires.set(voie.id, premiere.sid);
            doublons.push(...autres.map(i => i.id));
        }
        const gardes = new Set(lies.filter(i => exemplaires.has(i.id)).map(i => i.sid));
        for (const item of lies.filter(i => !exemplaires.has(i.id) && !doublons.includes(i.id))) {
            if (gardes.has(item.sid)) {
                doublons.push(item.id);
            } else {
                gardes.add(item.sid);
            }
        }

        // 2. Une incarnation par période, de même clé que la période
        const incarnations = chaine.map(p => ({
            name: p.name,
            type: 'incarnation',
            img: p.img,
            system: {
                id: p.sid,
                versions: {
                    v5: {
                        periode: p.sid,
                        actif: lire(p, 'actif') === true
                    }
                }
            }
        }));

        // Le chaînage suit la chronologie : la tête, la plus ancienne, n'a pas de prédécesseur.
        // Chaque incarnation garde la clé de sa période : les liens se posent dès la création.
        incarnations.forEach((data, i) => {
            data.system.versions.v5.predecesseur = incarnations[i - 1]?.system.id ?? null;
            data.system.versions.v5.successeur = incarnations[i + 1]?.system.id ?? null;
        });

        // Les incarnations, puis le ménage
        await actor.createEmbeddedDocuments('Item', incarnations);
        await actor.deleteEmbeddedDocuments('Item', [...periodes.map(p => p.id), ...doublons], { incarnations: false });

        // 3. et 5. Chaque exemplaire reçoit la clé de son incarnation (à la racine, commune à
        //    toutes les versions) et le degré acquis pendant elle ; puis la forme nouvelle des
        //    items restants est fixée en base.
        for (const item of actor.items.filter(i => i.type !== 'incarnation' && VersionMigration.CHAMPS[i.type] != null)) {
            const cle = exemplaires.get(item.id);
            if (cle != null) {
                const update = { 'system.incarnation': cle };
                if (Incarnations.VECUS.includes(item.type)) {
                    update[Version.path(item, 'degre')] = lire(item, 'degre') ?? 0;
                }
                // Un vécu lié ne recopie plus sa période : c'est celle de son incarnation
                if (item.type === 'vecu') {
                    update[Version.path(item, 'periode')] = null;
                }
                await item.update(update);
            }
            await _1_0_9.fixer(item);
        }

        return true;
    }

}
