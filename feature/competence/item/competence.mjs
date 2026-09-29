import { ChunkField } from "../../../module/field/chunkField.js";
import { Constants } from "../../../module/common/constants.js";
import { UUIDField } from "../../../module/field/UUIDField.js";
import { VersionMigration } from "../../../module/migration/versionMigration.js";

/**
 * [V14] Premier modèle porté aux versions de règles.
 *
 * CE QUI RESTE À LA RACINE : ce qui ne dépend pas des règles. L'identifiant, parce qu'il
 * désigne l'objet et non ce qu'il vaut — toute la machinerie des références passe par lui,
 * via l'accesseur `sid`. L'illustration, parce qu'une compétence garde son image d'une
 * édition à l'autre, et que le système la pose lui-même à la création comme à la
 * duplication.
 *
 * CE QUI PASSE EN VERSION : la description, qui peut être réécrite d'une édition à l'autre,
 * et l'élément, qui est une notion de règles.
 *
 * LE CHUNK v1 EST VIDE, volontairement : la première édition sera décrite plus tard. Une
 * fiche ouverte dessus n'affichera donc rien d'autre que son en-tête et son image.
 */
export class CompetenceDataModel extends foundry.abstract.TypeDataModel {

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
            versions: new ChunkField
            (
                {
                    v1: new ChunkField({}, { scope: 'v1' }),
                    v5: new ChunkField
                    (
                        {
                            description: new foundry.data.fields.StringField
                            (
                                {
                                    required: false
                                }
                            ),
                            element: new foundry.data.fields.StringField
                            (
                                {
                                    initial: 'air',
                                    choices: Constants.ELEMENTS
                                }
                            )
                        },
                        { scope: 'v5' }
                    )
                },
                { scope: 'versions' }
            )
        }
    }

    /**
     * Le crochet que Foundry appelle avant d'élaguer les champs hors schéma — le seul
     * endroit d'où l'ancienne forme est encore lisible. Ce qu'il déplace est décrit dans
     * VersionMigration, avec les migrations : le modèle décrit une forme, il n'a pas à
     * raconter d'où elle vient.
     * @param source The raw source data, as stored.
     * @returns the migrated source data.
     */
    static migrateData(source) {
        return VersionMigration.apply('competence', source);
    }

}
