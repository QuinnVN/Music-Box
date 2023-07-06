import { UserError } from "./base.js";

export class NotInVoice extends UserError {
    constructor() {
        super("You must be in a voice channel to use this command");
    }
}

export class TrackNotFound extends UserError {
    constructor() {
        super("Cannot find the song that you requested");
    }
}

export class NotInCurrentVoice extends UserError {
    constructor() {
        super("You must be in the same voice channel as me");
    }
}

export class PlayerNotFound extends UserError {
    constructor() {
        super("No music is currently playing in this server")
    }
}