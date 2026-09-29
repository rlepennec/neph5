/**
 * Un champ de texte dont la valeur initiale est la chaîne vide, et non null.
 *
 * POURQUOI. Un StringField non renseigné vaut null, et cette valeur remonte jusqu'aux
 * gabarits, qui doivent alors la tester — c'est tout le rôle des `{{#if (isNull value)}}`
 * de templates/label.hbs. Une chaîne vide se rend d'elle-même sans rien afficher, et les
 * concaténations ne produisent plus de "null" au milieu d'une phrase.
 *
 * [V14] Cette classe vient de la branche task/reboot. Elle n'est encore employée par aucun
 * schéma : y basculer un champ change la donnée au repos et demande donc une migration.
 * Elle est posée ici pour être disponible quand les modèles de données seront repris.
 */
export class TextField extends foundry.data.fields.StringField {

    /**
     * @override
     */
    static get _defaults() {
        return Object.assign(super._defaults, { initial: '' });
    }

}
