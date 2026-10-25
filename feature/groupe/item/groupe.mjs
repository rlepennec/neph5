import { ChunkField } from "../../../module/field/chunkField.js";
import { UUIDField } from "../../../module/field/UUIDField.js";
import { Version } from "../../../module/common/version.js";

/**
 * Un groupe de compétences (voir Groupe).
 *
 * CE QUI RESTE À LA RACINE : ce qui ne dépend pas des règles. L'identifiant, l'illustration,
 * les versions de règles avec lesquelles le groupe est compatible, et ses compétences (leurs
 * sid), partagées par toutes les versions.
 *
 * CE QUI PASSE EN VERSION : la base du groupe, une caractéristique ou un calcul sur les
 * caractéristiques, propre à chaque version de règles. Elle n'est encore qu'enregistrée. Les
 * chunks v2, v3 et eidolon sont vides : ils rendent le groupe visible dans ces versions (voir
 * Version.compatible).
 */
export class GroupeDataModel extends foundry.abstract.TypeDataModel {

    static defineSchema() {
        return {
            id: new UUIDField(
                {
                    required: true
                }
            ),
            illustration: new foundry.data.fields.FilePathField
            (
                {
                    categories: ["IMAGE"],
                    initial: "systems/neph5e/assets/vk/items/competence.webp"
                }
            ),
            compatibilites: new foundry.data.fields.ArrayField
            (
                new foundry.data.fields.StringField
                (
                    {
                        choices: Version.ALL
                    }
                ),
                {
                    initial: []
                }
            ),
            competences: new foundry.data.fields.ArrayField
            (
                new foundry.data.fields.StringField(),
                {
                    initial: []
                }
            ),
            versions: new ChunkField
            (
                {
                    v2: new ChunkField({}, { scope: 'v2' }),
                    v3: new ChunkField({}, { scope: 'v3' }),
                    v5: new ChunkField
                    (
                        {
                            base: new foundry.data.fields.StringField
                            (
                                {
                                    initial: ""
                                }
                            )
                        },
                        { scope: 'v5' }
                    ),
                    eidolon: new ChunkField({}, { scope: 'eidolon' })
                },
                { scope: 'versions' }
            )
        }
    }

}
