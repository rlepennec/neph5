import { AbstractFeature } from "../core/abstractFeature.js";
import { ActionDialog } from "./actionDialog.js";
import { Constants } from "../../module/common/constants.js";
import { NephilimChat } from "../../module/common/chat.js";

export class ReactionRoll extends AbstractFeature {

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
            }
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