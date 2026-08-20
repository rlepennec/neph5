import { Constants } from "../../../module/common/constants.js";
import { InvocationDataModel } from "./invocation.mjs";
import { NephilimItemSheet } from "../../../module/item/nephilimItemSheet.js";

export class InvocationSheet extends NephilimItemSheet {

    static DEFAULT_OPTIONS = {
        position: {
            width: 1120,
            height: 700
        }
    }

    static PARTS = {
        main: {
            template: `systems/neph5e/feature/kabbale/item/invocation.html`,
        }
    }

    /**
     * @override
     */
    async _onRender(context, options) {
        await super._onRender(context, options);
        this.element.classList.remove(...Constants.ELEMENTS.map(e => `skin-${e}`));
        const element = this.document.system.element;
        if (element) this.element.classList.add(`skin-${element}`);
    }

    /**
     * Realigns an illustration left behind by its sephirah before the context is
     * built, so that the sheet displays the right one from its first paint.
     *
     * render: false is essential — the update happens during a render, and
     * letting it queue another one would loop. It is harmless here: the context
     * is built after this call and therefore reads the corrected value.
     */
    async alignIllustration() {

        const document = this.document;

        // Nothing to write on a locked compendium or without update permission:
        // a player simply consulting the sheet must not trigger a failed update.
        if (document.pack != null && game.packs.get(document.pack)?.locked === true) {
            return;
        }
        if (document.canUserModify(game.user, 'update') === false) {
            return;
        }

        const illustration = InvocationDataModel.outdatedIllustration(
            document.system.sephirah,
            document.system.illustration);

        if (illustration == null) {
            return;
        }

        await document.update({ 'system.illustration': illustration }, { render: false });

    }

    /**
     * @override
     */
    async _prepareContext(options) {
        await this.alignIllustration();
        return {
            ...await super._prepareContext(options),
            context: {
                elements: InvocationDataModel.defineSchema().element.choices,
                cercles: super.cerclesOf('kabbale'),
                mondes: InvocationDataModel.defineSchema().monde.choices,
                sephiroth: InvocationDataModel.defineSchema().sephirah.choices
            }
        }
    }

}