export class NephilimItem extends Item {

    /**
     * Default artwork configuration for each Document type and sub-type.
     */
    static defaultArtwork = {
        Item: {
            cercle: "systems/neph5e/assets/icons/voie.webp",
            competence: "systems/neph5e/assets/icons/competence.webp",
            vecu: "systems/neph5e/assets/icons/vecu.webp",
        }
    }

    /** 
     * @override
     */
    static getDefaultArtwork(itemData={}) {
        const { type } = itemData;
        const { img } = super.getDefaultArtwork(itemData);
        return { img: NephilimItem.defaultArtwork.Item[type] ?? img };
    }

    // items: new EmbeddedCollectionField(BaseItem)

}