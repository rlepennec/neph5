import { DocumentReference } from "../document/documentReference.js"

export class NephilimItem extends Item {

    /**
     * Default artwork configuration for each Document type and sub-type.
     */
    static defaultArtwork = {
        Item: {
            cercle: "systems/neph5e/assets/icons/voie.webp",
            competence: "systems/neph5e/assets/icons/competence.webp",
            periode: "systems/neph5e/assets/icons/periode.webp",
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

    /**
     * @override
     */
    _onDelete(options, userId) {
        game.items.entries().every(async ([key, item]) => {
            await DocumentReference.createFromItem(this).deleteFrom(item);
        })
        super._onDelete(options, userId);
    }

    /**
     * @override
     */
    _onUpdate(changed, options, userId) {
        console.log("_onUpdate");

        game.items.forEach(item => {
            if (item.sheet.rendered) {
                if (DocumentReference.createFromItem(this).isReferencedBy(item)) {
                    item.sheet.render(false);
                    console.log(item);
                }
            } 
        })

        super._onUpdate(changed, options, userId);
    }

}