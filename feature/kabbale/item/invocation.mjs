import { Constants } from "../../../module/common/constants.js";
import { Illustration } from "../../../module/common/illustration.js";
import { UUIDField } from "../../../module/field/UUIDField.js";

export class InvocationDataModel extends foundry.abstract.TypeDataModel {

    /**
     * The illustration of an invocation follows its sephirah. The table is
     * explicit rather than derived from the key: three entries of
     * Constants.SEPHIRAH do not match the file name — chokmah is stored as
     * Hokmah, tiphereth as Tipheret — and daath has no illustration of its own.
     */
    static ILLUSTRATION = new Illustration({
        root: "systems/neph5e/assets/vk/kabbale/",
        field: 'sephirah',
        fallback: 'malkut',
        legacy: "systems/neph5e/assets/vk/items/sephirah-defaut.webp",
        files: {
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
        }
    });

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
                    initial: () => InvocationDataModel.ILLUSTRATION.of()
                }
            )
        }
    }

}