import { ItemReferenceDataField } from "../../../module/common/itemReferenceDataField.js"

export class CercleData extends foundry.abstract.TypeDataModel {

    static defineSchema() {
        return {
            id: new foundry.data.fields.StringField(
                {
                    required: true,
                    initial: crypto.randomUUID()
                }
            ),
            description: new ItemReferenceDataField(
                {
                    required: true,
                    initial: null,
                    collection: 'items',
                    type: 'cercle'
                }
            ),
        }
    }

    /** 
     * @override
     */
    /*
    async _preCreate(data, options, user) {
        await super._preCreate(data, context, user);
        if (data.img === undefined) {
            this.updateSource(
                { 
                    //img: 'systems/neph5e/assets/icons/voie.webp'
                    img : 'icons/svg/acid.svg'
                }
            )
        }
    }
        */



}
