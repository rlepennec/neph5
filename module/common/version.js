/**
 * Les versions des règles.
 *
 * LE PRINCIPE. Un document porte les données de toutes les versions à la fois, rangées
 * dans le chunk `versions` de son schéma : `system.versions.v5.degre` est le degré selon
 * les règles de la cinquième édition. Ce qui ne dépend pas des règles — l'identifiant,
 * l'illustration — reste à la racine.
 *
 * QUI CHOISIT. La version affichée est un état de la FICHE, pas du document : deux fenêtres
 * ouvertes sur le même item peuvent montrer deux éditions. Hors d'une fiche — un message de
 * chat, une liste sur la feuille d'acteur — il n'y a personne pour choisir : on prend alors
 * celle du monde, réglable par le MJ.
 *
 * LA TOLÉRANCE, ET POURQUOI ELLE EXISTE. Tant que les 35 modèles n'ont pas tous été portés,
 * la plupart n'ont pas de chunk `versions` : leurs champs sont encore à la racine. `of()`
 * rend donc `system` lui-même pour ces documents-là, ce qui laisse `of(doc).description`
 * juste dans les deux formes. C'est ce repli qui autorise une migration type par type plutôt
 * qu'un basculement en bloc — et c'est lui qu'il faudra retirer quand le dernier type sera
 * passé.
 */
import { Regles } from "../regles/regles.js";

export class Version {

    /**
     * Les versions connues, dans l'ordre où on les propose.
     */
    // v2, v3, Eidolon et Litorien ne sont pas encore implémentées : leurs jeux ne fournissent
    // aucune fiche, aucun type ne leur est donc compatible.
    static ALL = ['v2', 'v3', 'v5', 'eidolon', 'litorien'];

    /**
     * La compatibilité d'un type avec une version de règles est fixée dans le code, par le jeu de
     * cette version (voir Regles) : il fournit une fiche pour ce type (`fiches`), ou le déclare
     * compatible en gardant sa fiche commune (`types`, le groupe de compétences en v5). Un type
     * dont le modèle ne porte pas de versions est commun à toutes (la période), comme ceux de
     * COMMUNS (l'incarnation). Les objets internes propres à des règles (Ka, Akasha, laboratoire)
     * sont déclarés par leur jeu.
     *
     * Seuls les documents de types compatibles avec la version du monde sont affichés :
     * répertoire des items, compendiums, création (voir Repertoire) ; les cases de version d'un
     * document ne proposent que les versions compatibles avec son type.
     * @param type         Le type du document.
     * @param version      La version de règles, celle du monde par défaut.
     * @param documentName 'Item' (par défaut) ou 'Actor'.
     * @returns true if compatible.
     */
    static compatible(type, version = Version.world, documentName = 'Item') {
        if (Version.COMMUNS[documentName]?.includes(type)) return true;
        if (globalThis.CONFIG?.[documentName]?.dataModels?.[type]?.schema?.fields?.versions == null) return true;
        const jeu = Regles.get(version);
        return jeu.fiches?.[documentName]?.[type] != null || jeu.types?.[documentName]?.includes(type) === true;
    }

    /**
     * Les types communs à toutes les versions bien que leur modèle porte des versions :
     * l'incarnation (ses champs de règles sont rangés par version, voir Incarnations).
     */
    static COMMUNS = { Item: ['incarnation'], Actor: [] };

    /**
     * @param type         Le type du document.
     * @param documentName 'Item' (par défaut) ou 'Actor'.
     * @returns {string[]} les versions de règles compatibles avec ce type, dans l'ordre de ALL.
     */
    static compatibles(type, documentName = 'Item') {
        return Version.ALL.filter(version => Version.compatible(type, version, documentName));
    }

    /**
     * Un document appartient à une version de règles si son type y est compatible (fixé dans le
     * code, voir compatible) et s'il y est coché (`enabled`, vrai par défaut, voir VersionField).
     * Pour un objet embarqué, c'est la case de l'objet du monde dont il est la copie qui fait foi :
     * celle de la copie ne se règle pas (voir ItemOptionsSelector).
     * @param document Un document du monde, embarqué, ou une entrée d'index de compendium.
     * @param version  La version de règles, celle du monde par défaut.
     * @returns true si le document appartient à cette version.
     */
    static appartient(document, version = Version.world) {
        if (document == null) return false;
        if (!Version.compatible(document.type, version, document.documentName)) return false;
        const source = document.isEmbedded === true ? (Version.objetDuMonde(document.sid) ?? document) : document;
        return source.system?.versions?.[version]?.enabled !== false;
    }

    /**
     * Les objets du monde par identifiant métier, construit à la demande et oublié dès qu'un
     * objet du monde est créé, modifié ou supprimé (voir oublierObjets, neph5e.js).
     */
    static #objets = null;

    /**
     * @param sid The system identifier.
     * @returns the world item, null if none.
     */
    static objetDuMonde(sid) {
        if (sid == null) return null;
        if (Version.#objets == null) {
            Version.#objets = new Map();
            for (const item of game.items ?? []) {
                if (item.sid != null && !Version.#objets.has(item.sid)) Version.#objets.set(item.sid, item);
            }
        }
        return Version.#objets.get(sid) ?? null;
    }

    /**
     * Oublie l'index des objets du monde : la prochaine lecture le reconstruira.
     */
    static oublierObjets() {
        Version.#objets = null;
    }

    /**
     * @returns true si le réglage du monde, le mode du MJ, est sur jeu (`filtreObjets` vaut
     *          'objets') ; false en création ('types').
     */
    static get filtreStrict() {
        try {
            return game.settings.get('neph5e', 'filtreObjets') === 'objets';
        } catch {
            return false;
        }
    }

    /**
     * @returns true si l'utilisateur ne voit que les documents appartenant à la version du
     *          monde : un joueur toujours, le MJ en mode jeu ; false pour le MJ en mode création,
     *          qui voit tous ceux des types compatibles.
     */
    static get vueStricte() {
        return game.user?.isGM !== true || Version.filtreStrict;
    }

    /**
     * @param document Un document du monde, ou une entrée d'index de compendium.
     * @param strict   La vue de l'utilisateur, lue une fois par l'appelant qui en traite plusieurs.
     * @returns true si le document s'affiche dans les répertoires et les compendiums : son type est
     *          compatible avec la version du monde et, en vue stricte, il y appartient.
     */
    static visible(document, strict = Version.vueStricte) {
        return strict
            ? Version.appartient(document)
            : Version.compatible(document?.type, Version.world, document?.documentName);
    }

    /**
     * @param document The document.
     * @param version  The version, the world one by default.
     * @returns true si le document décrit cette version : il y porte autre chose que
     *          `enabled`. Sinon, sa fiche affiche « version vide ».
     */
    static decrite(document, version = null) {
        return Object.keys(Version.data(document, version) ?? {}).some(k => k !== 'enabled');
    }

    /**
     * La version du monde, lue une fois puis gardée : voir world.
     */
    static #monde = null;

    /**
     * La version retenue quand personne n'en a choisi : celle du monde.
     *
     * Elle est lue à chaque lecture d'un champ de règles (Version.data, Version.path) : des
     * milliers de fois par rendu de fiche. Or game.settings.get parcourt tous les réglages du
     * monde et, tant que le réglage garde sa valeur par défaut, construit à chaque appel un
     * document Setting — une trentaine de microsecondes l'appel. La valeur est donc gardée,
     * et oubliée quand le réglage change (onChange, dans settings.js).
     * @returns {string} l'identifiant de la version.
     */
    static get world() {
        if (Version.#monde != null) {
            return Version.#monde;
        }
        // Le réglage n'existe pas encore pendant l'initialisation, et game.settings.get
        // lève plutôt que de rendre undefined : on retombe alors sur l'édition courante,
        // sans la garder.
        try {
            Version.#monde = game.settings.get('neph5e', 'version') ?? 'v5';
            return Version.#monde;
        } catch {
            return 'v5';
        }
    }

    /**
     * Oublie la version du monde gardée : la prochaine lecture relira le réglage.
     */
    static oublierMonde() {
        Version.#monde = null;
    }

    /**
     * @param document The document to read.
     * @returns {string[]} les versions que ce document porte réellement, vide s'il n'a pas
     *          encore été porté.
     */
    static of(document) {
        const chunk = document?.system?.schema?.fields?.versions;
        return chunk == null ? [] : Object.keys(chunk.fields);
    }

    /**
     * @param document The document to read.
     * @param version  The version to read, the world one if omitted.
     * @returns les données du document pour cette version, ou `system` lui-même tant que le
     *          document n'a pas de chunk `versions`.
     */
    static data(document, version = null) {
        const versions = document?.system?.versions;
        if (versions == null) {
            return document?.system ?? {};
        }
        return versions[version ?? Version.world] ?? {};
    }

    /**
     * @param document The document to write to.
     * @param version  The version to write to, the world one if omitted.
     * @returns {string} le préfixe des chemins d'écriture de cette version — `system` tant
     *          que le document n'est pas porté, `system.versions.v5` ensuite. Les gabarits
     *          l'utilisent tel quel : name="{{versionPath}}.element".
     */
    static prefix(document, version = null) {
        return document?.system?.versions == null
            ? 'system'
            : 'system.versions.' + (version ?? Version.world);
    }

    /**
     * @param document The document to write to.
     * @param field    The name of the field, without prefix.
     * @param version  The version to write to, the world one if omitted.
     * @returns {string} le chemin de mise à jour du champ, à donner à l'attribut name d'un
     *          formulaire ou à document.update().
     */
    static path(document, field, version = null) {
        return Version.prefix(document, version) + '.' + field;
    }

}
