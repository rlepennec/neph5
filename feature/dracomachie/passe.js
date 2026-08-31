import { AbstractFeature } from "../core/abstractFeature.js";
import { ActionDialog } from "./actionDialog.js";
import { Constants } from "../../module/common/constants.js";
import { NephilimChat } from "../../module/common/chat.js";

/**
 * [V14] CHANTIER OUVERT — la reaction opposee propre a la dracomachie.
 *
 * ETAT REEL : ce fichier est encore, au corps pres, une copie de
 * feature/core/reactionRoll.js. Seuls le nom de la classe et le chemin de
 * l'import ont ete corriges. Les libelles ci-dessous sont ceux de la reaction
 * GENERIQUE et ne parlent pas encore du dragon.
 *
 * POURQUOI ELLE EXISTE. Dracomachie est le seul focus a poser
 * withOpposition("effetDragon"), sur ses domaines charmes ET passes
 * (dracomachie.js:42 et 62). Quand le jet reussit en opposition,
 * abstractFeature ecrit le drapeau { actor, purpose: item, result } et
 * OpposedRollBuilder aiguille sur purpose.type, c'est-a-dire le TYPE D'ITEM.
 * Pour un item de type dracomachie aucun case n'existe : on tombe dans
 * default, donc sur ReactionRoll, dont la phrase est « parvient a ses fins »
 * et dont la difficulte vaut 0 — base reste a 0, withBase() n'etant appelee
 * par personne. C'est cet ecart que cette classe doit combler.
 *
 * CE QUI RESTE A FAIRE :
 *  1. Brancher le cas dans OpposedRollBuilder.rollOf :
 *         case 'dracomachie': return new Passe(actor, purpose, result);
 *     Sans cela la classe reste inatteignable, quel que soit son contenu.
 *  2. Trancher le perimetre. purpose.type vaut 'dracomachie' pour les charmes
 *     COMME pour les passes ; le case ne les distingue pas. Les separer
 *     demande de lire purpose.system.cercle ('dracomachie@charmes' ou
 *     'dracomachie@passes'). Si les deux partagent la meme opposition, le nom
 *     Passe est trop etroit.
 *  3. Poser la base. Pacte, issu du meme moule, prend
 *     this.base = purpose.system.degre ; Dracomachie.rawDegre lit le meme
 *     champ. Reste a confirmer que c'est bien la difficulte voulue par la regle.
 *  4. Ecrire les libelles : title, sentence et les deux branches de
 *     sentenceOf, qui doivent parler de l'effet du dragon.
 *
 * Tant que le point 1 n'est pas fait, ce fichier n'est importe par personne.
 */

export class Passe extends AbstractFeature {

    /**
     * Constructor.
     * @param actor   The actor which performs the action.
     * @param purpose The purpose of the initial action.
     * @param result  The result of the initial action.
     */
    constructor(actor, purpose, result) {
        super(actor);
        this.result = result;
        this.item = purpose;
        this.base = 0;
    }

    /**
     * @Override
     */
    get title() {
        return "Jet d'Opposition";
    }

    /**
     * @Override
     */
    get sentence() {
        return "La situation n'est pas si simple";
    }

    /**
     * @Override
     */
    get data() {
        return {
            self: this,
            actor: this.actor,
            sentence: this.sentence,
            img: this.img,
            name: "Opposition",
            base: {
                name: 'Opposition',
                difficulty: this.base * 10
            },
            opposed: true
        }
    }

    /**
     * @Override
     */
    get img() {
        return 'systems/neph5e/assets/icons/opposition.webp';
    }

    /**
     * @param base The base value to set. 
     * @returns the instance.
     */
    withBase(base) {
        this.base = base;
        return this;
    }

    /**
     * @Override
     */
    difficulty(parameters) {
        return AbstractFeature.toInt(this.base * 10)
             + AbstractFeature.toInt(parameters?.modifier);
    }

    /**
     * @Override
     */
    async initializeRoll() {
        // [V14] render() est asynchrone : sans await, initializeRoll() rendait la main
        // avant que la fenetre existe. Le hook d'opposition enchainait alors sur le
        // retrait du drapeau pendant que le rendu courait encore.
        await new ActionDialog(this.actor, this)
            .withTitle(this.title)
            .withTemplate("systems/neph5e/feature/core/action.hbs")
            .withData(this.data)
            .render(true);
    }

    /**
     * @Overrides
     */
    async apply(result) {
        await new NephilimChat(this.actor)
            .withTemplate("systems/neph5e/feature/core/chat.hbs")
            .withData({
                actor: this.actor,
                richSentence: this.sentenceOf(result),
                img: this.img,
                total: result.roll._total,
            })
            .withRoll(result.roll)
            .create();
    }

    /**
     * @Overrides
     */
    sentenceOf(result) {
        switch (AbstractFeature.winner(this.result, result)) {
            case Constants.ACTION:
                return " parvient à ses fins";
            case Constants.REACTION:
            case Constants.TIE:
                return " ne parvient pas à ses fins";
        }
    }

}