/**
 * La clé de l'incarnation (l'époque) à laquelle appartient un exemplaire lié : vécu, savoir,
 * quête, arcane, chute, science, ressource, focus, capacité.
 *
 * Un même item peut être lié à plusieurs époques, un exemplaire embarqué par époque, chacun
 * avec ses propres valeurs (degré acquis pendant l'époque, statut, focus, pacte...) : il est
 * désigné par la paire (clé de l'incarnation, sid). Le champ est à la racine du schéma, comme
 * `id`, car il est commun à toutes les versions de règles. Il est vide pour l'item du monde.
 *
 * Voir la façade Incarnations, seule à le lire et à l'écrire.
 */
export class IncarnationField extends foundry.data.fields.StringField {

    /**
     * @override
     */
    constructor(options = {}, context = {}) {
        super({ required: false, nullable: true, initial: null, ...options }, context);
    }

}
