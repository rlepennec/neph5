export class NephilimChat {

    /**
     * Consstructor.
     * @param actor The emiter of the chat message.
     */
    constructor(actor) {
        this.actor = actor;
        this.chat = null;
        this.content = null;
        this.template = null;
        this.data = null;
        this.flags = null;
        this.roll = null;
        this.whisper = null;
        this.blind = null;
    }

    /**
     * @returns the whisper attribute of the last created message or null if it doesn't exist.
     */
    getWhisper() {
        return this.chat?.data?.whisper ?? null;
    }

    /**
     * @returns the blind attribute of the last created message or null if it doesn't exist.
     */
    getBlind() {
        return this.chat?.data?.blind ?? null;
    }

    /**
     * Sets the specified message content.
     * @param content The content to set.
     * @returns the instance.
     */
    withContent(content) {
        this.content = content;
        return this;
    }

    /**
     * Sets the specified template used to create the message content.
     * @param template The path of the file template to set.
     * @returns the instance.
     */
    withTemplate(template) {
        this.template = template;
        return this;
    }

    /**
     * Sets the specified data used to create the message content.
     * @param data The data of the file template to set.
     * @returns the instance.
     */
    withData(data) {
        this.data = data;
        return this;
    }

    /**
     * Sets the flags parameter.
     * @param flags The flags parameter to set.
     * @returns the instance.
     */
    withFlags(flags) {
        this.flags = flags;
        return this;
    }

    /**
     * Indicates if the chat is a roll.
     * @param roll True if the chat is a roll.
     * @returns the instance.
     */
    withRoll(roll) {
        this.roll = roll;
        return this;
    }

    /**
     * Sets the whisper parameter.
     * @param whisper The whisper parameter to set.
     * @returns the instance.
     */
    withWhisper(whisper) {
        this.whisper = whisper;
        return this;
    }

    /**
     * Sets the blind parameter.
     * @param blind The blind parameter to set.
     * @returns the instance.
     */
    withBlind(blind) {
        this.blind = blind;
        return this;
    }

    /**
     * Creates the chat message.
     * @return this instance.
     */
    async create() {

        // Retrieve the message content
        if (!this.content && this.template && this.data) {
            this.content = await this._createContent();
        }

        // Exit if message content can't be created
        if (!this.content) {
            return null;
        }

        // Create the chat data
        const d = {
            user: game.user.id,
            speaker: ChatMessage.getSpeaker(),
            content: this.content
        }

        // Set the roll parameter if necessary
        if (this.roll) {
            d.roll = this.roll;
        }

        // Set the whisper parameter if necessary
        if (this.whisper) {
            d.whisper = this.whisper;
        }

        // Set the blind parameter if necessary
        if (this.blind) {
            d.blind = this.blind;
        }

        // Set the flags parameter if necessary
        if (this.flags) {
            d.flags = this.flags;
        }

        // Create the chat
        this.chat = await ChatMessage.create(d);
        return this;

    }

    /**
     * Creates the message content from the registered template.
     * @returns the message content or null i an error occurs.
     */
    async _createContent() {

        // Update the data to provide to the template
        const d = duplicate(this.data);
        d.actor = this.actor;
        d.owner = this.actor.id;

        // Call the template renderer.
        return await renderTemplate(this.template, d);

    }

}