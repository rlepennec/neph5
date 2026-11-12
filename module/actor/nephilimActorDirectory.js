import { Repertoire } from "../item/repertoire.js";

/**
 * Le répertoire des acteurs de la barre latérale : comme celui des items (voir Repertoire), il
 * n'affiche que les acteurs de types compatibles avec la version de travail et, en vue stricte,
 * ceux qui y sont cochés ; il ne propose à la création que les types compatibles.
 */
export class NephilimActorDirectory extends foundry.applications.sidebar.tabs.ActorDirectory {

    /**
     * @override
     */
    async _prepareDirectoryContext(context, options) {
        await super._prepareDirectoryContext(context, options);
        context.tree = Repertoire.filtrer(context.tree, undefined, 'Actor');
    }

    /**
     * @override
     */
    _onCreateEntry(event, target) {
        return Repertoire.creer(this, event, target);
    }

}
