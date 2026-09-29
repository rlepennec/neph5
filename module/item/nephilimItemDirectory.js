/**
 * Le répertoire des items de la barre latérale.
 *
 * POURQUOI. Foundry propose à la création tous les types déclarés par le manifeste — ils
 * sont trente-deux ici, et beaucoup ne s'ajoutent jamais à la main : un métamorphe, une
 * ordonnance ou une matière première arrivent par le compendium ou par un glisser-déposer.
 * Cette surcharge permet de restreindre la boîte de création sans toucher au manifeste :
 * les types déclarés restent ceux que le monde peut contenir, seule la liste proposée
 * change.
 *
 * COMMENT S'EN SERVIR. TYPES vaut null tant que personne ne l'a réglé, et la boîte se
 * comporte alors exactement comme celle de Foundry — c'est l'état actuel, la surcharge ne
 * change rien tant qu'on ne lui donne pas de liste. Lui affecter un tableau de types, dans
 * le hook d'initialisation, suffit à la restreindre :
 *
 *     NephilimItemDirectory.TYPES = ['competence', 'periode', 'vecu'];
 *
 * [V14] Cette classe vient de la branche task/reboot, où la liste était figée dans le code.
 * Elle est ici paramétrable pour que le choix des types reste au même endroit que leur
 * déclaration, dans neph5e.js.
 */
export class NephilimItemDirectory extends foundry.applications.sidebar.tabs.ItemDirectory {

    /**
     * Les types proposés à la création, null pour laisser Foundry les proposer tous.
     */
    static TYPES = null;

    /**
     * @override
     */
    _onCreateEntry(event, target) {

        // Sans liste, le comportement d'origine : inutile de redire ce que Foundry fait.
        if (NephilimItemDirectory.TYPES == null) {
            return super._onCreateEntry(event, target);
        }

        event.stopPropagation();
        const { folderId } = target.closest(".directory-item")?.dataset ?? {};

        // La position est celle que pose Foundry lui-même : la boîte s'ouvre contre la barre
        // latérale, à la hauteur du bouton cliqué.
        const options = {
            position: { width: 320, left: window.innerWidth - 630, top: target.offsetTop },
            types: NephilimItemDirectory.TYPES
        };

        // Créer depuis un compendium ouvert écrit dans ce compendium, pas dans le monde.
        const operation = {};
        if (this.collection instanceof foundry.documents.collections.CompendiumCollection) {
            operation.pack = this.collection.collection;
        }

        return this.documentClass.createDialog({ folder: folderId ?? null }, operation, options);
    }

}
