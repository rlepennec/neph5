import { UUIDReferenceField } from "../common/UUIDReferenceField.js"

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

  /**
   * @override
   */
  _onDelete(options, userId) {
    game.items.entries().every(([key, item]) => {
        console.log("onDelete");
        console.log(item);

        /*
        Object.entries(item.schema.fields).every(([fieldName, field]) => {
            if (field instanceof foundry.data.fields.SetField) {
                if (field.element instanceof UUIDReferenceField) {
                    if (field.element.collection === this.documentName && field.element.type === this.type) {
                        updates["system." + fieldName] = new Set(this.document.system[fieldName]).filter(v => v != this.document.system.id);
                        return false;
                    }
                }
            }
            return true;
        })
            */


        super._onDelete(options, userId);

    })




  }



}