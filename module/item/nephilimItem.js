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
            await new DocumentReference(this).removeFrom(item);
        })
        super._onDelete(options, userId);
    }

    /**
     * @override
     */
    _onUpdate(changed, options, userId) {
        const reference = new DocumentReference(this);
        game.items
            .filter(i => i.sheet.rendered && reference.isReferencedBy(i))
            .forEach(i => i.sheet.render(false));
        super._onUpdate(changed, options, userId);
    }

    /**
     * @override
     */
    async _preCreate(data, options, user) {
        const source = data?._stats?.duplicateSource;
        if (source != null) {
            console.log("duplicate");
        }
        return super._preCreate(data, options, user);
    }

}