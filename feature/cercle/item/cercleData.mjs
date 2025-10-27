export class CercleData extends foundry.abstract.TypeDataModel {

    static defineSchema() {
        return {
            id: new foundry.data.fields.StringField(
                {
                    required: true,
                    initial: crypto.randomUUID()
                }
            ),
            /*
            img: new foundry.data.fields.FilePathField(
                {
                    required: false,
                    categories: ["IMAGE"],
                    initial: "systems/neph5e/assets/icons/voie.webp",
                }
            ),*/
            description: new foundry.data.fields.StringField(
                {
                    required: true,
                    initial: null
                }
            )
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
