import { ChunkField } from "../../../module/field/chunkField.js";
import { VersionMigration } from "../../../module/migration/versionMigration.js";
import { Constants } from "../../../module/common/constants.js";
import { UUIDField } from "../../../module/field/UUIDField.js";
import { IncarnationField } from "../../../module/field/incarnationField.js";

export class AppelDataModel extends foundry.abstract.TypeDataModel {

    static defineSchema() {
        return {
            id: new UUIDField(
                {
                    required: true
                }
            ),
            // La clé de l'incarnation de cet exemplaire lié, commune à toutes les versions.
            incarnation: new IncarnationField(),
            illustration: new foundry.data.fields.FilePathField
            (
                {
                    categories: ["IMAGE"],
                    initial: "systems/neph5e/assets/vk/items/appel.webp"
                }
            ),
            versions: new ChunkField
            (
                {
                    v5: new ChunkField
                    (
                        {
                            description: new foundry.data.fields.StringField(
                                {
                                    required: false
                                }
                            ),
                            degre: new foundry.data.fields.NumberField(
                                {
                                    intial: 1,
                                    required: false
                                }
                            ),
                            appel: new foundry.data.fields.StringField(
                                {
                                    initial: 'pacifiste',
                                    choices: Constants.APPELS
                                }
                            ),
                            controle: new foundry.data.fields.BooleanField(
                                {
                                    required: false
                                }
                            ),
                            visibilite: new foundry.data.fields.StringField(
                                {
                                    required: false
                                }
                            ),
                            entropie: new foundry.data.fields.StringField(
                                {
                                    required: false
                                }
                            ),
                            dommages: new foundry.data.fields.StringField(
                                {
                                    required: false
                                }
                            ),
                            protection: new foundry.data.fields.StringField(
                                {
                                    required: false
                                }
                            ),
                            cercle: new foundry.data.fields.StringField(
                                {
                                    required: false
                                }
                            ),
                            status: new foundry.data.fields.StringField(
                                {
                                    required: false
                                }
                            ),
                            focus: new foundry.data.fields.BooleanField(
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
        return VersionMigration.apply('appel', source);
    }

}
