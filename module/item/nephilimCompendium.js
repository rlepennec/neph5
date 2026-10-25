import { Repertoire } from "./repertoire.js";

/**
 * La fenêtre d'un compendium d'items : comme le répertoire des items, elle n'affiche et ne
 * propose à la création que les types compatibles avec la version de règles du monde (voir
 * Repertoire). Posée sur les compendiums d'items dans le hook setup (neph5e.js).
 */
export class NephilimCompendium extends foundry.applications.sidebar.apps.Compendium {

    /**
     * @override
     */
    async _prepareDirectoryContext(context, options) {
        await super._prepareDirectoryContext(context, options);
        context.tree = Repertoire.filtrer(context.tree);
    }

    /**
     * @override
     */
    _onCreateEntry(event, target) {
        return Repertoire.creer(this, event, target);
    }

}
