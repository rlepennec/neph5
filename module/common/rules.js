export class Rules {

    /**
     * ********** The sapience managment ********** 
     */

    /**
     * Gets the number points of sapience to spend to reach a skill level from 0 to the specified degre.
     * @param {Integer} degre The level to reach which must be in [0.. +[.
     * @returns the number of points of sapience.
     */
    static getCostTo(degre) {
        const costs = [0, 1, 3, 6, 10, 15, 25, 40, 60, 90];
        return degre < 10 ? costs[degre] : 90 + degre * 100;
    }

    /**
     * Gets the number points of sapience to spend to reach a skill level to one degre.
     * @param {Integer} degre The level to reach which must be in [0.. +[.
     * @returns the number of points of sapience.
     */
    static getNextCost(degre) {
        const costs = [0, 1, 2, 3, 4, 5, 10, 15, 20, 30, 100];
        return costs[degre];
    }

    /**
     * Converts the specified number points of sapience to skill level.
     * @param {Integer} sapience The number points of sapience to convert.
     * @returns the degre of the skill level.
     */
    static toDegre(sapience) {
        let degre = 0;
        let cost = 0;
        while (cost <= sapience) {
            degre = degre + 1;
            cost = Rules.getCostTo(degre);
        }
        return degre - 1;
    }

    /**
     * ********** The roll managment ********** 
     */

    static getSentence(quality, self) {
        switch (quality) {
            case 'agile':
                return self ? " fait appel à son agilité" : "fait appel à l'agilité de son simulacre";
            case 'endurant':
                return self ? " fait appel à son endurance" : "fait appel à l'endurance de son simulacre";
            case 'fort':
                return self ? " fait appel à sa force" : "fait appel à la force de son simulacre";
            case 'intelligent':
                return self ? "fait appel à son intelligence" : "fait appel à l'intelligence de son simulacre";
            case 'seduisant':
                return self ? "fait appel à son charisme" : "fait appel au charisme de son simulacre";
            case 'soleil':
                return self ? "fait appel à sa volonté" : "fait appel à la volonté de son simulacre";
            case 'savant':
                return self ? "fait appel à son savoir" : "fait appel au savoir de son simulacre";
            case 'sociable':
                return self ? "fait appel à ses relations" : "fait appel à aux relations de son simulacre";
            case 'fortune':
                return self ? "fait appel à sa fortune" : "utilise la fortune de son simulacre";
            case 'vecu':
                return self ? "utilise son vécu" : "utilise le vécu de son simulacre";
            case 'menace':
                return "fait appel à ses compétences martiales";
            case 'ka':
                return "fait appel à son ka";
        }
    }


    /**
     * Interprets the specified roll for the specified difficulty.
     * @returns the interpretation of the roll.
     */
    static resultOf(roll, difficulty) {

        // 1 is always a success
        if (roll.result === 1) {
            return {
                success: true,
                critical: false,
                margin: 0
            }

            // 100 is always a fail
        } else if (roll.result === 100) {
            return {
                success: false,
                critical: difficulty === 0,
                margin: 0
            }

            // Success if the roll is lesser than the difficulty
        } else {
            return {
                success: roll.result <= (difficulty * 10),
                critical: roll.double,
                margin: roll.dizaine + Math.max(difficulty - 10, 0)
            }

        }

    }

    /**
     * Rolls a d100.
     * @param content The content of the message to display.
     * @return an object with the roll result and if it's double.
     */
    static async roll(content) {
        const roll = new Roll("1d100", {});
        await roll.roll({async:false}).toMessage({
            speaker: ChatMessage.getSpeaker(),
            content: content
        }, { async: true });
        await new Promise(r => setTimeout(r, 2000));
        const v = parseInt(roll.result, 10);
        return {
            result: v,
            double: Rules.isDouble(v),
            dizaine: Math.floor(v / 10)
        }
    }

    /**
     * Indicates if the specified roll indicates a critical success.
     * @param roll The roll to process.
     * @return true if the roll is a double.
     */
    static isDouble(v) {
        return v === 11 || v === 22 || v === 33 || v === 44 || v === 55 || v === 66 || v === 77 || v === 88 || v === 99;
    }

}


