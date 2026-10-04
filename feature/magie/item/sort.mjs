import { ChunkField } from "../../../module/field/chunkField.js";
import { VersionMigration } from "../../../module/migration/versionMigration.js";
import { Constants } from "../../../module/common/constants.js";
import { UUIDField } from "../../../module/field/UUIDField.js";

export class SortDataModel extends foundry.abstract.TypeDataModel {

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
                    initial: "systems/neph5e/assets/vk/items/sort.webp"
                }
            ),
            versions: new ChunkField
            (
                {
                    v1: new ChunkField({}, { scope: 'v1' }),
                    v5: new ChunkField
                    (
                        {
                            cercle: new foundry.data.fields.StringField
                            (
                                {
                                    required: false
                                }
                            ),
                            element: new foundry.data.fields.StringField
                            (
                                {
                                    initial: 'air',
                                    choices: Constants.ELEMENTS_MAGIE
                                }
                            ),
                            degre: new foundry.data.fields.NumberField
                            (
                                {
                                    required: false
                                }
                            ),
                            portee: new foundry.data.fields.StringField
                            (
                                {
                                    required: false
                                }
                            ),
                            duree: new foundry.data.fields.StringField
                            (
                                {
                                    required: false
                                }
                            ),
                            voies: new foundry.data.fields.ArrayField
                            (
                                new foundry.data.fields.StringField(),
                                {
                                    required: false
                                }
                            ),
                            incantation: new foundry.data.fields.StringField
                            (
                                {
                                    required: false
                                }
                            ),
                            syntaxe: new foundry.data.fields.StringField
                            (
                                {
                                    required: false
                                }
                            ),
                            description: new foundry.data.fields.StringField
                            (
                                {
                                    required: false
                                }
                            ),
                            focus: new foundry.data.fields.BooleanField
                            (
                                {
                                    required: false
                                }
                            ),
                            status: new foundry.data.fields.StringField
                            (
                                {
                                    required: false
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
     * VersionMigration, avec les migrations.
     * @param source The raw source data, as stored.
     * @returns the migrated source data.
     */
    static migrateData(source) {
        return VersionMigration.apply('sort', source);
    }

}