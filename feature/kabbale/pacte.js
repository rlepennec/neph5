import { AbstractRoll } from "../core/abstractRoll.js";
import { ActionDialog } from "../core/actionDialog.js";
import { Constants } from "../../module/common/constants.js";
import { NephilimChat } from "../../module/common/chat.js";

export class Pacte extends AbstractRoll {

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
            }
        }
    }

    /**
     * @Override
     */
    difficulty(parameters) {
        return AbstractRoll.toInt(this.base * 10)
             + AbstractRoll.toInt(parameters?.modifier);
    }

    /**
     * @Override
     */
    async initialize() {
        new ActionDialog(this.actor, this)
            .withTitle(this.title)
            .withTemplate("systems/neph5e/feature/core/reaction.hbs")
            .withData(this.data)
            .render(true);
    }

    /**
     * @Overrides
     */
    async apply(result) {
        await new NephilimChat(this.actor)
            .withTemplate("systems/neph5e/feature/core/opposition.hbs")
            .withData({
                actor: this.actor,
                sentence: this.sentenceOf(result),
                img: this.item.img,
                total: result.roll._total,
            })
            .withRoll(result.roll)
            .create();
    }

    /**
     * @Override
     */
    sentenceOf(result) {
        switch (AbstractRoll.winner(this.result, result)) {
            case Constants.ACTION:
                return " parvient à établir un pacte avec la créature";
            case Constants.REACTION:
            case Constants.TIE:
                return " ne parvient pas à établir un pacte avec la créature";
        }
    }

}