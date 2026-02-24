import { Constants } from "../../../module/common/constants.js";
import { NephilimDataModel } from "../../../module/nephilimDataModel.js"
import { TextField } from "../../../module/common/textField.js"
import { Version1 } from "./version1/version.mjs"
import { Version5 } from "./version5/version.mjs"

export class MetamorpheData extends NephilimDataModel {

    static defineBase() {
        return {
            element: new foundry.data.fields.StringField
            (
                {
                    required: true,
                    initial: 'air',
                    choices: Constants.ELEMENTS
                }
            ),
            humeur: new foundry.data.fields.StringField
            (
                {
                    required: true,
                    initial: 'chaud',
                    choices: Constants.HUMEURS
                }
            ),
            portrait: new foundry.data.fields.SchemaField
            (
                {
                    activite: new TextField(),
                    animal: new TextField(),
                    arme : new TextField(),
                    couleur: new TextField(),
                    etre: new TextField(),
                    humain: new TextField(),
                    metal: new TextField(),
                    objet: new TextField(),
                    oeuvre: new TextField(),
                    phenomene: new TextField()
                }
            ),
            description: new TextField()
        }
    }

    static defineVersions() {
        return {
            v1: Version1.defineVersion(),
            v5: Version5.defineVersion()
        }
    }
    
}
