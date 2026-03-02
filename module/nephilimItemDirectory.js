export class NephilimItemDirectory extends foundry.applications.sidebar.tabs.ItemDirectory {

    /** 
     * @override
     */
    _onCreateEntry(event, target) {
        event.stopPropagation();
        const { folderId } = target.closest(".directory-item")?.dataset ?? {};
        const options = {
            position: { width: 320, left: window.innerWidth - 630, top: target.offsetTop },
            types: ["cercle", "competence", "metamorphe", "periode", "vecu"]
        };
        const operation = {};
        if ( this.collection instanceof foundry.documents.collections.CompendiumCollection ) operation.pack = this.collection.collection;
        return this.documentClass.createDialog({ folder: folderId ?? null }, operation, options);
    }

}