import { ChunkField } from "../../../module/field/chunkField.js";
import { VersionMigration } from "../../../module/migration/versionMigration.js";
import { UUIDField } from "../../../module/field/UUIDField.js";

export class PeriodeDataModel extends foundry.abstract.TypeDataModel {

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
                    initial: "systems/neph5e/assets/vk/items/periode.webp"
                }
            ),
            versions: new ChunkField
            (
                {
                    v5: new ChunkField
                    (
                        {
                            description: new foundry.data.fields.StringField
                            (
                                {
                                    required: false
                                }
                            ),
                            aube: new foundry.data.fields.StringField
                            (
                                {
                                    required: false
                                }
                            ),
                            contexte: new foundry.data.fields.StringField
                            (
                                {
                                    required: false
                                }
                            ),
                            // La kabbale et l'alchimie sont-elles possibles à cette période ? Sinon, les
                            // onglets correspondants des figures qui l'incarnent sont masqués (voir
                            // FigureSheet). Possibles par défaut, et donc pour les périodes existantes.
                            kabbaleAutorisee: new foundry.data.fields.BooleanField
                            (
                                {
                                    initial: true
                                }
                            ),
                            alchimieAutorisee: new foundry.data.fields.BooleanField
                            (
                                {
                                    initial: true
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
        return VersionMigration.apply('periode', source);
    }

}