import { Repertoire } from "./repertoire.js";

/**
 * Le répertoire des items de la barre latérale.
 *
 * Il n'affiche que les items de types compatibles avec la version de règles du monde, et ne
 * propose à la création que ces types-là, parmi ceux de Repertoire.TYPES (voir Repertoire,
 * partagé avec les compendiums d'items). Une création se restreint sans toucher au manifeste :
 * les types déclarés restent ceux que le monde peut contenir, seule la liste proposée change.
 *
 * [V14] Cette classe vient de la branche task/reboot, où la liste était figée dans le code.
 */
export class NephilimItemDirectory extends foundry.applications.sidebar.tabs.ItemDirectory {

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
