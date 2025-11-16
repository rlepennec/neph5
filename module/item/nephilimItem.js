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
            await DocumentReference.of(this).deleteFrom(item);
        })
        super._onDelete(options, userId);
    }

    /**
     * @override
     */
    _onUpdate(changed, options, userId) {
        const reference = DocumentReference.of(this);
        game.items
            .filter(i => i.sheet.rendered && reference.isReferencedBy(i))
            .forEach(i => i.sheet.render(false));
        super._onUpdate(changed, options, userId);
    }

}