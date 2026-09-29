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
export class Version {

    /**
     * Les versions connues, dans l'ordre où on les propose.
     */
    static ALL = ['v1', 'v5'];

    /**
     * La version retenue quand personne n'en a choisi : celle du monde.
     * @returns {string} l'identifiant de la version.
     */
    static get world() {
        // Le réglage n'existe pas encore pendant l'initialisation, et game.settings.get
        // lève plutôt que de rendre undefined : on retombe alors sur l'édition courante.
        try {
            return game.settings.get('neph5e', 'version') ?? 'v5';
        } catch {
            return 'v5';
        }
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
