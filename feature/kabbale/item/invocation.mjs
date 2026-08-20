import { Constants } from "../../../module/common/constants.js";
import { UUIDField } from "../../../module/field/UUIDField.js";

export class InvocationDataModel extends foundry.abstract.TypeDataModel {

    /**
     * Root directory of the sephiroth illustrations.
     */
    static ILLUSTRATIONS_ROOT = "systems/neph5e/assets/vk/kabbale/";

    /**
     * One illustration per sephirah. The table is explicit rather than derived
     * from the key because three entries of Constants.SEPHIRAH do not match the
     * file name: chokmah is stored as Hokmah, tiphereth as Tipheret, and daath
     * has no illustration of its own and falls back to the generic one.
     */
    static ILLUSTRATIONS = {
        binah:     "Binah.webp",
        chesed:    "Chesed.webp",
        chokmah:   "Hokmah.webp",
        daath:     "Kabbale-defaut.webp",
        geburah:   "Geburah.webp",
        hod:       "Hod.webp",
        kether:    "Kether.webp",
        malkut:    "Malkut.webp",
        netzach:   "Netzach.webp",
        tiphereth: "Tipheret.webp",
        yesod:     "Yesod.webp"
    };

    /**
     * The sephirah used as long as none has been chosen.
     */
    static DEFAULT_SEPHIRAH = 'malkut';

    /**
     * Illustration used by the previous versions. Still considered automatic so
     * that existing invocations start following their sephirah again.
     */
    static LEGACY_ILLUSTRATION = "systems/neph5e/assets/vk/items/sephirah-defaut.webp";

    /**
     * @param sephirah The system identifier of the sephirah.
     * @returns the path of the illustration of the specified sephirah.
     */
    static illustrationOf(sephirah) {
        const file = InvocationDataModel.ILLUSTRATIONS[sephirah]
                  ?? InvocationDataModel.ILLUSTRATIONS[InvocationDataModel.DEFAULT_SEPHIRAH];
        return InvocationDataModel.ILLUSTRATIONS_ROOT + file;
    }

    /**
     * An illustration stays automatic as long as the user has not picked his own:
     * it is then empty, one of the sephiroth illustrations, or the legacy default.
     * @param illustration The current illustration path.
     * @returns true if the illustration must keep following the sephirah.
     */
    static isAutomaticIllustration(illustration) {
        if (illustration == null || illustration === "") {
            return true;
        }
        if (illustration === InvocationDataModel.LEGACY_ILLUSTRATION) {
            return true;
        }
        return Object.keys(InvocationDataModel.ILLUSTRATIONS)
            .some(s => InvocationDataModel.illustrationOf(s) === illustration);
    }

    /**
     * Detects an illustration left behind by its sephirah: still automatic, but
     * showing another sephirah than the current one. Typically an invocation
     * created before the illustration followed the sephirah, which therefore
     * kept the illustration of the default sephirah. Checked when the sheet is
     * opened, since no update would otherwise realign it.
     * @param sephirah     The current sephirah.
     * @param illustration The current illustration.
     * @returns the illustration to apply, or null if there is nothing to change.
     */
    static outdatedIllustration(sephirah, illustration) {

        // An illustration chosen by the user is left untouched
        if (InvocationDataModel.isAutomaticIllustration(illustration) === false) {
            return null;
        }

        const expected = InvocationDataModel.illustrationOf(sephirah ?? InvocationDataModel.DEFAULT_SEPHIRAH);
        return illustration === expected ? null : expected;

    }

    /**
     * Keeps the illustration aligned with the sephirah, without ever discarding
     * an illustration chosen by the user. Called on create and on update.
     * @param changes The data to be applied, updated in place.
     * @param current The illustration and sephirah before the change.
     * @returns true if the illustration has been changed.
     */
    static alignIllustration(changes, current = {}) {

        // Nothing to do unless the sephirah actually changes
        const sephirah = changes?.system?.sephirah;
        if (sephirah == null || sephirah === current.sephirah) {
            return false;
        }

        // A user defined illustration is never overwritten. The one submitted
        // with the change prevails: it may be the one just picked by the user.
        const illustration = changes?.system?.illustration ?? current.illustration;
        if (InvocationDataModel.isAutomaticIllustration(illustration) === false) {
            return false;
        }

        foundry.utils.setProperty(changes, "system.illustration", InvocationDataModel.illustrationOf(sephirah));
        return true;

    }

    static defineSchema() {
        return {
            id: new UUIDField(
                {
                    required: true
                }
            ),
            description: new foundry.data.fields.StringField(
                {
                    required: false
                }
            ),
            sephirah: new foundry.data.fields.StringField(
                {
                    initial: 'malkut',
                    choices: Constants.SEPHIRAH
                }
            ),
            monde: new foundry.data.fields.StringField(
                {
                    initial: 'aresh',
                    choices: Constants.MONDES
                }
            ),
            element: new foundry.data.fields.StringField(
                {
                    initial: 'air',
                    choices: Constants.ELEMENTS_CHOIX
                }
            ),
            degre: new foundry.data.fields.NumberField(
                {
                    required: false
                }
            ),
            portee: new foundry.data.fields.StringField(
                {
                    required: false
                }
            ),
            duree: new foundry.data.fields.StringField(
                {
                    required: false
                }
            ),
            visibilite: new foundry.data.fields.StringField(
                {
                    required: false
                }
            ),
            focus: new foundry.data.fields.BooleanField(
                {
                    required: false
                }
            ),
            status: new foundry.data.fields.StringField(
                {
                    required: false
                }
            ),
            pacte: new foundry.data.fields.BooleanField(
                {
                    required: false
                }
            ),
            periode: new foundry.data.fields.StringField(
                {
                    required: false
                }
            ),
            illustration: new foundry.data.fields.FilePathField
            (
                {
                    categories: ["IMAGE"],
                    initial: () => InvocationDataModel.illustrationOf(InvocationDataModel.DEFAULT_SEPHIRAH)
                }
            )
        }
    }

}
