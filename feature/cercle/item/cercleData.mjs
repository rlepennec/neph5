import { UUIDField } from "../../../module/common/UUIDField.js"

export class CercleData extends foundry.abstract.TypeDataModel {

    static defineSchema() {
        return {
            id: new UUIDField(
                {
                    required: true,
                }
            ),
            description: new foundry.data.fields.StringField(
                {
                    required: true,
                    initial: ''
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
