import { ChunkField } from "../../module/field/chunkField.js";
import { VersionMigration } from "../../module/migration/versionMigration.js";
import { UUIDField } from "../../module/field/UUIDField.js";

export class FigureDataModel extends foundry.abstract.TypeDataModel {

    static defineSchema() {
        return {
            id: new UUIDField(
                {
                    required: true
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
                                    initial: ""
                                }
                            ),
                            // Ancien lien vers le simulacre, avant qu'il soit porté par l'incarnation courante
                            // (Incarnations.simulacre) : gardé pour que 1.0.10 le lise, puis vidé. À retirer
                            // avec les passerelles de migration.
                            simulacre: new foundry.data.fields.StringField(
                                {
                                    nullable: true,
                                    initial: null
                                }
                            ),
                            periode: new foundry.data.fields.StringField(
                                {
                                    nullable: true,
                                    initial: null
                                }
                            ),
                            // La sapience, la sapience dépensée et les points d'incarnation ne sont plus portés
                            // par la figure mais par chaque incarnation (voir Incarnations.compteurs) : la
                            // migration 1.0.10 les y recopie depuis le relevé.
                            // Les Ka ne sont plus portés par la figure mais par chaque incarnation (voir
                            // Incarnations.kas) : la migration 1.0.10 les y recopie depuis le relevé.
                            manoeuvres: new foundry.data.fields.SchemaField
                            (
                                {
                                    esquive: new foundry.data.fields.StringField(
                                    {
                                            required: false,
                                            nullable: true,
                                            initial: null
                                        }
                                    ),
                                    lutte: new foundry.data.fields.StringField(
                                        {
                                            required: false,
                                            nullable: true,
                                            initial: null
                                        }
                                    )
                                }
                            ),
                            // La stase n'est plus portée par la figure mais par chaque incarnation (voir
                            // Incarnations.stase) : la migration 1.0.10 l'y recopie depuis le relevé.
                            // Le laboratoire n'est plus porté par la figure mais par chaque incarnation (voir
                            // Incarnations.alchimie) : la migration 1.0.10 l'y recopie depuis le relevé.
                            // Les voyages akashiques ne sont plus portés par la figure mais par chaque
                            // incarnation (voir Incarnations.akasha) : la migration 1.0.10 les y recopie.
                            // Les blessures ne sont plus portées par la figure mais par chaque incarnation
                            // (voir Incarnations.blessures) : la migration 1.0.10 n'en reprend aucune.
                            // Les bonus ne sont plus portés par la figure mais par chaque incarnation (voir
                            // Incarnations.bonus) : la migration 1.0.10 les y recopie depuis le relevé.
                            options: new foundry.data.fields.SchemaField
                            (
                                {
                                    "alchimie": new foundry.data.fields.BooleanField(
                                        {
                                            initial: false
                                        }
                                    ),
                                    "anamorphose": new foundry.data.fields.BooleanField(
                                        {
                                            initial: false
                                        }
                                    ),
                                    "conjuration": new foundry.data.fields.BooleanField(
                                        {
                                            initial: false
                                        }
                                    ),
                                    "description": new foundry.data.fields.BooleanField(
                                        {
                                            initial: true
                                        }
                                    ),
                                    "simulacre": new foundry.data.fields.BooleanField(
                                        {
                                            initial: true
                                        }
                                    ),
                                    "fraternites": new foundry.data.fields.BooleanField(
                                        {
                                            initial: false
                                        }
                                    ),
                                    "incarnations": new foundry.data.fields.BooleanField(
                                        {
                                            initial: true
                                        }
                                    ),
                                    "combat": new foundry.data.fields.BooleanField(
                                        {
                                            initial: true
                                        }
                                    ),
                                    "kabbale": new foundry.data.fields.BooleanField(
                                        {
                                            initial: false
                                        }
                                    ),
                                    "magie": new foundry.data.fields.BooleanField(
                                        {
                                            initial: false
                                        }
                                    ),
                                    "analogie": new foundry.data.fields.BooleanField(
                                        {
                                            initial: false
                                        }
                                    ),
                                    "atlanteide": new foundry.data.fields.BooleanField(
                                        {
                                            initial: false
                                        }
                                    ),
                                    "dracomachie": new foundry.data.fields.BooleanField(
                                        {
                                            initial: false
                                        }
                                    ),
                                    "necromancie": new foundry.data.fields.BooleanField(
                                        {
                                            initial: false
                                        }
                                    ),
                                    "soleil": new foundry.data.fields.BooleanField(
                                        {
                                            initial: false
                                        }
                                    ),
                                    "bohemien": new foundry.data.fields.BooleanField(
                                        {
                                            initial: false
                                        }
                                    ),
                                    "nephilim": new foundry.data.fields.BooleanField(
                                        {
                                            initial: true
                                        }
                                    ),
                                    "vecus": new foundry.data.fields.BooleanField(
                                        {
                                            initial: true
                                        }
                                    ),
                                    "capacites": new foundry.data.fields.BooleanField(
                                        {
                                            initial: false
                                        }
                                    ),
                                    "selenim": new foundry.data.fields.BooleanField(
                                        {
                                            initial: false
                                        }
                                    ),
                                    "akasha": new foundry.data.fields.BooleanField(
                                        {
                                            initial: false
                                        }
                                    ),
                                    "boussole": new foundry.data.fields.BooleanField(
                                        {
                                            initial: false
                                        }
                                    ),
                                    "compas": new foundry.data.fields.BooleanField(
                                        {
                                            initial: false
                                        }
                                    ),
                                    "baton": new foundry.data.fields.BooleanField(
                                        {
                                            initial: false
                                        }
                                    ),
                                    "coupe": new foundry.data.fields.BooleanField(
                                        {
                                            initial: false
                                        }
                                    ),
                                    "denier": new foundry.data.fields.BooleanField(
                                        {
                                            initial: false
                                        }
                                    ),
                                    "degatAutomatique": new foundry.data.fields.BooleanField(
                                        {
                                            initial: true
                                        }
                                    ),
                                    "epee": new foundry.data.fields.BooleanField(
                                        {
                                            initial: false
                                        }
                                    ),
                                    "chronologieDescendante": new foundry.data.fields.BooleanField(
                                        {
                                            initial: false
                                        }
                                    ),
                                    "degreGauche": new foundry.data.fields.BooleanField(
                                        {
                                            initial: false
                                        }
                                    ),
                                    "incarnationsOuvertes": new foundry.data.fields.BooleanField(
                                        {
                                            initial: false
                                        }
                                    ),
                                    "gestionLaboratoire": new foundry.data.fields.BooleanField(
                                        {
                                            initial: false
                                        }
                                    ),
                                    "daath": new foundry.data.fields.BooleanField(
                                        {
                                            initial: false
                                        }
                                    ),
                                    "theme": new foundry.data.fields.StringField(
                                        {
                                            initial: "soleil"
                                        }
                                    ),
                                    "luneNoire": new foundry.data.fields.BooleanField(
                                        {
                                            initial: false
                                        }
                                    ),
                                    "defenseMJ": new foundry.data.fields.BooleanField(
                                        {
                                            initial: false
                                        }
                                    )
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
        return VersionMigration.apply('figure', source);
    }

}
