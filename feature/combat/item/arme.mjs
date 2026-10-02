import { ChunkField } from "../../../module/field/chunkField.js";
import { VersionMigration } from "../../../module/migration/versionMigration.js";
import { Constants } from "../../../module/common/constants.js";
import { UUIDField } from "../../../module/field/UUIDField.js";

export class ArmeDataModel extends foundry.abstract.TypeDataModel {

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
                    initial: "systems/neph5e/assets/vk/items/arme.webp"
                }
            ),
            versions: new ChunkField
            (
                {
                    v1: new ChunkField({}, { scope: 'v1' }),
                    v5: new ChunkField
                    (
                        {
                            description: new foundry.data.fields.StringField(
                                {
                                    required: false
                                }
                            ),
                            used: new foundry.data.fields.BooleanField(
                                {
                                    required: false,
                                    initial: true
                                }
                            ),
                            parade: new foundry.data.fields.BooleanField(
                                {
                                    required: false
                                }
                            ),
                            type: new foundry.data.fields.StringField(
                                {
                                    initial: 'melee',
                                    choices: Constants.ARMES
                                }
                            ),
                            competence: new foundry.data.fields.StringField(
                                {
                                    required: false,
                                    nullable: true,
                                    initial: null
                                }
                            ),
                            attack: new foundry.data.fields.NumberField(
                                {
                                    initial: 0,
                                    required: false
                                }
                            ),
                            defense: new foundry.data.fields.NumberField(
                                {
                                    initial: 0,
                                    required: false
                                }
                            ),
                            damages: new foundry.data.fields.NumberField(
                                {
                                    initial: 0,
                                    required: false
                                }
                            ),
                            blocage: new foundry.data.fields.BooleanField(
                                {
                                    required: false
                                }
                            ),
                            physique: new foundry.data.fields.BooleanField(
                                {
                                    required: false,
                                    initial: true
                                }
                            ),
                            magique: new foundry.data.fields.BooleanField(
                                {
                                    required: false
                                }
                            ),
                            ammunition: new foundry.data.fields.StringField(
                                {
                                    required: false
                                }
                            ),
                            munitions: new foundry.data.fields.NumberField(
                                {
                                    required: false,
                                    initial: 1
                                }
                            ),
                            tire: new foundry.data.fields.NumberField(
                                {
                                    required: false
                                }
                            ),
                            cible: new foundry.data.fields.StringField(
                                {
                                    required: false,
                                    nullable: true,
                                    initial: null
                                }
                            ),
                            visee: new foundry.data.fields.NumberField(
                                {
                                    required: false
                                }
                            ),
                            lance: new foundry.data.fields.BooleanField(
                                {
                                    required: false
                                }
                            ),
                            salve: new foundry.data.fields.BooleanField(
                                {
                                    required: false
                                }
                            ),
                            rafale: new foundry.data.fields.BooleanField(
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
        return VersionMigration.apply('arme', source);
    }

}
