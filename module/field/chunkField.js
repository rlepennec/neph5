/**
 * Un groupe de champs qui porte une portée.
 *
 * C'est un SchemaField ordinaire, à ceci près qu'il sait à quoi il appartient : le chunk
 * `versions` regroupe les versions des règles, et chaque version — `v1`, `v5` — regroupe
 * les champs qui n'existent que sous ces règles-là. La portée permet de parcourir un schéma
 * en distinguant ces groupes du reste, sans se fier aux noms des champs.
 *
 * [V14] Cette classe vient de la branche task/reboot.
 */
export class ChunkField extends foundry.data.fields.SchemaField {

    /**
     * @override
     */
    static get _defaults() {
        return Object.assign(
            super._defaults,
            {
                collection: 'Item',
                scope: 'base'
            }
        );
    }

}
