import { CustomHandlebarsHelpers } from "../common/handlebars.js";
import { MigrationTools } from "./migration.js";

/**
 * Migration 1.0.6 — deux corrections indépendantes.
 *
 * 1. LE THÈME LUNE NOIRE
 *
 * Le thème d'un acteur était la seule valeur du système écrite en kebab-case :
 * Constants.THEMES portait 'lune-noire' là où le reste du code — Ka, chute,
 * option d'acteur, élément d'un sort — écrit 'luneNoire'. Le décalage se voyait
 * ailleurs : une fiche de sort de Lune Noire posait la classe skin-luneNoire,
 * qui ne correspondait à aucune règle CSS, et perdait la teinte de son Ka.
 *
 * Le vocabulaire est désormais unique. Cette migration convertit les acteurs
 * dont le thème valait encore 'lune-noire' ; sans elle, ils retomberaient
 * silencieusement sur l'apparence par défaut.
 *
 * Le thème est une préférence d'affichage : aucune donnée de jeu n'est en jeu.
 *
 * 2. L'UNICITÉ DES IDENTIFIANTS MÉTIER
 *
 * system.id est distinct de l'_id de Foundry : c'est par lui que les documents
 * se retrouvent, dans une soixantaine d'endroits du code, tous de la forme
 * game.items.find(i => i.sid === sid). Deux documents du monde qui le partagent
 * rendent ces recherches ambiguës, sans la moindre erreur affichée.
 *
 * Jusqu'ici, la régénération de l'identifiant d'un doublon reposait, pour les
 * acteurs, sur la reconnaissance du suffixe " (Copy)" du nom. Dans un monde où
 * le module de traduction française du cœur de Foundry est installé, le suffixe
 * est « (Copie) » : le test ne matchait jamais et CHAQUE duplication a produit
 * une collision. Ces mondes existent ; la nouvelle règle de _preCreate les
 * empêche de s'aggraver mais ne répare pas l'existant.
 *
 * Pourquoi la réparation est sûre : l'ambiguïté est déjà tranchée en pratique,
 * puisque find() renvoie toujours le PREMIER document de la collection. Laisser
 * l'identifiant à celui-là et régénérer les suivants ne peut donc casser aucun
 * lien qui fonctionne aujourd'hui — cela ne fait que figer la résolution déjà
 * effective, et supprimer l'ambiguïté pour de bon.
 *
 * Les identifiants ABSENTS sont comblés au passage. Ce n'est pas cosmétique :
 * cinq endroits font game.actors.find(a => a.sid === actor.system.simulacre),
 * et simulacre est déclaré nullable avec null pour valeur initiale. Un acteur
 * dont le system.id vaut exactement null serait donc renvoyé comme simulacre de
 * toute figure qui n'en a pas.
 *
 * Les items EMBARQUÉS ne sont jamais touchés : ils partagent délibérément
 * l'identifiant de leur source, c'est ce qui fait le lien avec l'item du monde.
 * Ceux dont la source a disparu sont seulement signalés — on ne peut pas
 * deviner à quel item les rattacher.
 */
export class _1_0_6 {

    static ANCIEN = 'lune-noire';
    static NOUVEAU = 'luneNoire';

    static async migrate(target) {

        const msg = "Updating to " + target;

        // Les identifiants d'abord : c'est de l'intégrité de données, et le
        // reste de la migration s'appuie sur des recherches par sid.
        const acteurs = await _1_0_6.migrate_identifiants(game.actors, msg + " (identifiants acteurs)");
        const items = await _1_0_6.migrate_identifiants(game.items, msg + " (identifiants items)");
        const orphelins = _1_0_6.orphelins();

        const size = game.actors.size;
        let migrated = 0;
        let convertis = 0;

        for (const actor of game.actors) {
            if (await _1_0_6.migrate_theme(actor)) convertis++;
            MigrationTools.progress(msg, ++migrated, size);
        }

        // Le réglage retiré : après les données, avant l'écriture de version.
        const reglageRetire = await _1_0_6.supprimer_reglage('neph5e.useCombatSystem');

        game.settings.set("neph5e", "worldTemplateVersion", target);

        const rapport = [];
        if (convertis > 0) rapport.push(convertis + " thème(s) Lune Noire converti(s)");
        const regeneres = acteurs.regeneres + items.regeneres;
        const combles = acteurs.combles + items.combles;
        if (regeneres > 0) rapport.push(regeneres + " identifiant(s) en double régénéré(s)");
        if (combles > 0) rapport.push(combles + " identifiant(s) manquant(s) comblé(s)");
        if (reglageRetire) rapport.push("réglage useCombatSystem supprimé");

        ui.notifications.info("Update to " + target + " done"
            + (rapport.length > 0 ? " (" + rapport.join(", ") + ")" : ""));

        // Les orphelins demandent une décision humaine : on ne fait que les
        // porter à la connaissance du MJ, dans la console et par un
        // avertissement, sans rien modifier.
        if (orphelins.length > 0) {
            console.warn("Nephilim | " + orphelins.length
                + " item(s) embarqué(s) dont l'item du monde d'origine n'existe plus :");
            orphelins.forEach(o => console.warn("Nephilim |   - " + o));
            ui.notifications.warn(orphelins.length
                + " item(s) embarqué(s) sans source dans le monde — détail dans la console (F12).");
        }
    }

    /**
     * @param actor L'acteur à traiter.
     * @returns true si son thème a été converti.
     */
    static async migrate_theme(actor) {
        if (actor.system?.options?.theme !== _1_0_6.ANCIEN) return false;
        await actor.update({ ['system.options.theme']: _1_0_6.NOUVEAU });
        return true;
    }

    /**
     * Rend unique le system.id de chaque document d'une collection du monde.
     *
     * L'ordre d'itération est celui de la collection, donc celui que find()
     * emprunte : le premier porteur d'un identifiant le conserve, les suivants
     * en reçoivent un neuf. Aucun lien qui résolvait vers le premier n'est donc
     * affecté.
     *
     * @param collection game.actors ou game.items.
     * @param label      Le libellé de la barre de progression.
     * @returns { combles, regeneres }
     */
    static async migrate_identifiants(collection, label) {

        const vus = new Set();
        let combles = 0;
        let regeneres = 0;
        let traites = 0;
        const size = collection.size;

        for (const document of collection) {

            const sid = document.system?.id;
            const absent = sid == null || sid === "";
            const pris = !absent && vus.has(sid);

            if (absent || pris) {
                const neuf = _1_0_6.identifiantLibre(vus);
                await document.update({ ['system.id']: neuf });
                vus.add(neuf);
                if (absent) combles++; else regeneres++;
            } else {
                vus.add(sid);
            }

            MigrationTools.progress(label, ++traites, size);
        }

        return { combles: combles, regeneres: regeneres };
    }

    /**
     * @param vus Les identifiants déjà attribués dans cette collection.
     * @returns un identifiant qu'aucun document déjà traité ne porte.
     */
    static identifiantLibre(vus) {
        let sid;
        do {
            sid = CustomHandlebarsHelpers.UUID();
        } while (vus.has(sid));
        return sid;
    }

    /**
     * @returns la liste des items embarqués dont le system.id ne correspond à
     *          aucun item du monde, sous forme « acteur / item [type] ».
     */
    static orphelins() {
        const sids = new Set();
        for (const item of game.items) {
            const sid = item.system?.id;
            if (sid != null && sid !== "") sids.add(sid);
        }
        const liste = [];
        for (const actor of game.actors) {
            for (const item of actor.items) {
                const sid = item.system?.id;
                if (sid != null && sid !== "" && !sids.has(sid)) {
                    liste.push(actor.name + " / " + item.name + " [" + item.type + "]");
                }
            }
        }
        return liste;
    }

    /**
     * Efface le document Setting d'un réglage retiré du système.
     *
     * On le retrouve par son champ `key` dans la collection 'world' plutôt que
     * par une méthode d'accès dédiée : le nom de cette méthode a changé
     * plusieurs fois entre les versions de Foundry, alors que la collection et
     * le champ `key` sont stables. Une clef est de la forme 'neph5e.<réglage>'.
     *
     * Ne lève jamais : un réglage déjà absent est le cas normal, et l'échec de
     * ce nettoyage ne doit pas interrompre la migration des données.
     *
     * @param clef La clef complète du réglage, par exemple 'neph5e.useCombatSystem'.
     * @returns true si un document a été supprimé.
     */
    static async supprimer_reglage(clef) {
        try {
            const monde = game.settings.storage.get('world');
            const document = monde?.contents?.find(s => s.key === clef);
            if (document == null) return false;
            await document.delete();
            return true;
        } catch (e) {
            console.warn("Nephilim | suppression du réglage " + clef + " impossible : " + e.message);
            return false;
        }
    }

}