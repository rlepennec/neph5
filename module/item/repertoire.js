import { Version } from "../common/version.js";

/**
 * Ce que le répertoire des items et les compendiums d'items partagent : ils n'affichent et ne
 * proposent à la création que les types compatibles avec la version de règles du monde (voir
 * Version.compatible). Rien n'est supprimé : changer de version fait réapparaître les autres.
 */
export class Repertoire {

    /**
     * Les types proposés à la création, null pour laisser Foundry les proposer tous. Réglé
     * dans le hook d'initialisation (neph5e.js).
     */
    static TYPES = null;

    /**
     * @param noeud Un nœud de l'arbre d'un répertoire (dossiers et entrées, voir
     *              DirectoryCollectionMixin) : documents du monde, ou entrées d'index d'un
     *              compendium, qui portent aussi leur type.
     * @param strict Le filtre du monde (voir Version.visible), lu une fois pour tout l'arbre.
     * @returns une copie du nœud sans les entrées masquées (types incompatibles, et objets non
     *          activés si le réglage le demande) ; null pour un dossier que ce filtre a vidé (un
     *          dossier déjà vide reste, pour qu'on puisse y déposer).
     */
    static filtrer(noeud, strict = Version.filtreStrict) {
        const children = noeud.children.map(c => Repertoire.filtrer(c, strict)).filter(c => c != null);
        const entries = noeud.entries.filter(e => Version.visible(e, strict));
        const vide = children.length === 0 && entries.length === 0;
        const avait = noeud.children.length > 0 || noeud.entries.length > 0;
        if (!noeud.root && vide && avait) return null;
        return { ...noeud, children, entries };
    }

    /**
     * Ouvre la boîte de création, restreinte aux types proposés et compatibles.
     * @param app    The directory or compendium application.
     * @param event  The triggering click event.
     * @param target The action target element.
     */
    static creer(app, event, target) {
        event.stopPropagation();
        const { folderId } = target.closest(".directory-item")?.dataset ?? {};

        // La position est celle que pose Foundry lui-même : la boîte s'ouvre contre la barre
        // latérale, à la hauteur du bouton cliqué.
        const types = (Repertoire.TYPES ?? Object.keys(CONFIG.Item.dataModels)).filter(t => Version.compatible(t));
        const options = {
            position: { width: 320, left: window.innerWidth - 630, top: target.offsetTop },
            types: types
        };

        // Créer depuis un compendium ouvert écrit dans ce compendium, pas dans le monde.
        const operation = {};
        if (app.collection instanceof foundry.documents.collections.CompendiumCollection) {
            operation.pack = app.collection.collection;
        }

        return app.documentClass.createDialog({ folder: folderId ?? null }, operation, options);
    }

    /**
     * Réaffiche le répertoire des items et les compendiums d'items ouverts : leur contenu suit
     * la version de règles du monde.
     */
    static rafraichir() {
        ui.items?.render();
        // Les fiches d'acteur aussi : les compétences actives en dépendent (voir Groupe)
        for (const app of foundry.applications.instances.values()) {
            if (app.rendered && app.document instanceof foundry.documents.Actor) app.render();
        }
        for (const pack of game.packs ?? []) {
            if (pack.documentName !== 'Item') continue;
            for (const app of pack.apps) if (app.rendered) app.render();
        }
    }

}
