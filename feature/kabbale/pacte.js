import { AbstractFeature } from "../core/abstractFeature.js";
import { ActionDialog } from "../core/actionDialog.js";
import { Constants } from "../../module/common/constants.js";
import { Health } from "../core/health.js";
import { NephilimChat } from "../../module/common/chat.js";
import { Ordonnance } from "./ordonnance.js";

export class Pacte extends AbstractFeature {

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
        this.base = purpose.system.degre;
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
        return this.item.name + " s'oppose à l'invocateur";
    }

    /**
     * @Override
     */
    get data() {
        return {
            self: this,
            actor: this.actor,
            sentence: this.sentence,
            img: this.item.img,
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
        // Une seule phrase conclut l'invocation : celle du résultat, sous le jet de la créature.
        await new NephilimChat(this.actor)
            .withTemplate("systems/neph5e/feature/core/chat.hbs")
            .withData({
                actor: this.actor,
                richSentence: this.sentence,
                img: this.item.img,
                total: result.roll._total,
                result: this.sentenceOf(result)
            })
            .withRoll(result.roll)
            .create();
        if (AbstractFeature.winner(this.result, result) === Constants.ACTION) {
            await this.etablir();
        } else {
            await Pacte.subir(this.actor, this.item);
        }
    }

    /**
     * Le pacte est établi : l'invocation de l'invocateur le porte désormais, et les invocations
     * suivantes de la créature seront des jets simples (voir Invocation.data). Sauf avec une
     * créature d'un autre monde de kabbale que celui de l'ordonnance : le pacte ne vaut que
     * pour cette invocation.
     */
    async etablir() {
        if (!Ordonnance.pacteDefinitif(this.actor, this.item)) {
            return;
        }
        const sid = this.item?.system?.id;
        const invocation = this.actor.items.find(i => i.type === 'invocation' && i.system.id === sid);
        if (invocation != null && invocation.system.pacte !== true) {
            await invocation.update({ ['system.pacte']: true });
        }
    }

    /**
     * Pacte manqué : l'invocateur subit autant de dommages magiques que le degré de la créature.
     * @param actor L'invocateur.
     * @param item  L'invocation du monde (ou ses données) : la créature.
     */
    static async subir(actor, item) {
        await Health.subir(actor, 'magique', AbstractFeature.toInt(item?.system?.degre));
    }

    /**
     * @param name Le nom de la créature.
     * @returns la conclusion d'un pacte noué.
     */
    static reussite(name) {
        return "réussit à nouer un pacte avec " + name;
    }

    /**
     * @param name Le nom de la créature.
     * @returns la conclusion d'un pacte manqué.
     */
    static echec(name) {
        return "invoque " + name + " mais échoue à nouer un pacte, occasionnant des dommages magiques";
    }

    /**
     * @Override
     */
    sentenceOf(result) {
        return AbstractFeature.winner(this.result, result) === Constants.ACTION
            ? Pacte.reussite(this.item.name)
            : Pacte.echec(this.item.name);
    }

}