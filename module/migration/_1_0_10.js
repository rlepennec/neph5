import { MigrationTools } from "./migration.js";
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
 * `periode`, son `vecu` — un et un seul pour une figure, aucun pour une fraternité —, `actif`,
 * son `rang` dans la chronologie (le plus grand est le plus récent) et ses `apports` :
 * `{ sid, degre }` pour chaque autre item acquis pendant l'incarnation. Le vécu garde sa
 * période et son degré. Un item embarqué n'existe plus qu'en un exemplaire. Voir la façade
 * `Incarnations`.
 *
 * CE QU'ELLE FAIT, acteur par acteur (figures et fraternités) :
 *   1. lit la chaîne des périodes embarquées, de la plus ancienne à la plus récente ; une
 *      période hors chaîne (chaîne cassée) est rangée en queue, avec les plus récentes ;
 *   2. pour chaque période, crée une incarnation par vécu rattaché. La première garde comme
 *      clé le sid de la période : la période courante de l'acteur et l'effectif d'une
 *      fraternité, qui la désignent ainsi, restent justes sans être réécrits. Elle se range la
 *      plus récente de sa période : courante, elle compte avec les autres. Elle reçoit les
 *      autres apports de la période ; les suivantes, leur seul vécu. Une période sans vécu
 *      donne une incarnation sans vécu — normal pour une fraternité, une anomalie à corriger
 *      pour une figure, que la migration compte et signale ;
 *   3. verse chaque copie rattachée dans les apports — le degré pour les types qui en
 *      acquièrent un (savoir, quête, arcane, chute, science, passe), null pour les autres ;
 *   4. supprime les périodes embarquées et les copies en double, en gardant un exemplaire par
 *      item — de préférence un exemplaire rattaché. Un vécu présent sur plusieurs périodes
 *      reste à la première rencontrée dans la chaîne.
 *
 * Une copie dont la période n'est pas embarquée ne comptait pas : elle ne verse rien. Elle
 * reste sur l'acteur si c'est le seul exemplaire de son item.
 *
 * CE QU'ELLE LAISSE. Les champs `periode` et `degre` des items, et `actif` / `previous` des
 * périodes, restent dans les schémas : plus personne ne les lit, hors la période et le degré
 * du vécu, mais les retirer maintenant les ferait élaguer avant que cette migration puisse
 * les lire. Les acteurs synthétiques des tokens non liés ne sont pas traités : seuls les
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
        let sansVecu = 0;

        MigrationTools.progress(msg, etape, size);

        for (const actor of acteurs) {
            const bilan = await _1_0_10.convertir(actor);
            if (bilan != null) {
                convertis++;
                sansVecu += bilan.sansVecu;
            }
            MigrationTools.progress(msg, ++etape, size);
        }

        await game.settings.set("neph5e", "worldTemplateVersion", target);

        const details = [];
        if (convertis > 0) details.push(convertis + " acteur(s) converti(s)");
        if (sansVecu > 0) details.push(sansVecu + " incarnation(s) de figure sans vécu, à compléter");
        ui.notifications.info("Update to " + target + " done" + (details.length > 0 ? " (" + details.join(", ") + ")" : ""));
    }

    /**
     * @param actor The figure or fraternite to convert.
     * @returns the result, { sansVecu }, null if the actor has nothing to convert.
     */
    static async convertir(actor) {

        const periodes = actor.items.filter(i => i.type === 'periode');
        if (periodes.length === 0 || actor.items.some(i => i.type === 'incarnation')) {
            return null;
        }

        // 1. La chaîne, de la plus ancienne à la plus récente
        const chaine = [];
        const vus = new Set();
        let previous = null;
        while (true) {
            const p = periodes.find(i => Version.data(i).previous === previous && !vus.has(i.sid));
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
        for (const item of actor.items.filter(i => i.type !== 'periode' && Version.data(i).periode != null)) {
            const liste = copies.get(item.sid) ?? [];
            liste.push(item);
            copies.set(item.sid, liste);
        }
        const doublons = [];
        for (const liste of copies.values()) {
            const garde = liste.find(i => embarquees.has(Version.data(i).periode)) ?? liste[0];
            doublons.push(...liste.filter(i => i !== garde).map(i => i.id));
        }

        // 2. et 3. Les incarnations, période par période
        const incarnations = [];
        const vecusPris = new Set();
        let sansVecu = 0;
        for (const p of chaine) {

            // Toutes les copies versent leur apport, doublons compris : ce sont eux qui portent
            // ce que l'item doit aux autres périodes. Seul l'exemplaire gardé reste ensuite.
            const rattaches = actor.items.filter(i => i.type !== 'periode' && Version.data(i).periode === p.sid);
            const vecus = rattaches.filter(i => i.type === 'vecu' && !vecusPris.has(i.sid));
            vecus.forEach(v => vecusPris.add(v.sid));

            const apports = [];
            for (const item of rattaches.filter(i => i.type !== 'vecu')) {
                if (apports.some(a => a.sid === item.sid)) continue;
                const degre = Incarnations.VECUS.includes(item.type) ? (Version.data(item).degre ?? 0) : null;
                apports.push({ sid: item.sid, degre: degre });
            }

            if (vecus.length === 0 && Incarnations.AVEC_VECU.includes(actor.type)) {
                sansVecu++;
            }

            // La première garde la clé de la période ; les suivantes reçoivent une clé neuve. Elle
            // est rangée la DERNIÈRE de sa période, la plus récente : quand elle est la courante,
            // les autres incarnations de la même période lui sont antérieures et comptent avec elle.
            const parVecu = vecus.length === 0 ? [null] : vecus.map(v => v.sid);
            const dePeriode = [];
            parVecu.forEach((vecu, n) => {
                dePeriode.push({
                    name: p.name,
                    type: 'incarnation',
                    img: p.img,
                    system: {
                        ...(n === 0 ? { id: p.sid } : {}),
                        versions: {
                            v5: {
                                periode: p.sid,
                                vecu: vecu,
                                actif: Version.data(p).actif === true,
                                apports: n === 0 ? apports : []
                            }
                        }
                    }
                });
            });
            incarnations.push(...dePeriode.slice(1), dePeriode[0]);
        }

        // Les rangs suivent la chronologie : la tête de chaîne, la plus ancienne, a le plus petit
        incarnations.forEach((data, i) => data.system.versions.v5.rang = i);

        // 4. Les incarnations, puis le ménage
        await actor.createEmbeddedDocuments('Item', incarnations);
        await actor.deleteEmbeddedDocuments('Item', [...periodes.map(p => p.id), ...doublons], { incarnations: false });

        return { sansVecu: sansVecu };
    }

}
