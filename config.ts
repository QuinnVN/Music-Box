import { Colors } from "discord.js";

export default {
    pallete: {
        default: Colors.White,
        success: Colors.Green,
        fail: Colors.Red,
        warn: Colors.Yellow,
    },

    lavalinkNodes: [
        {
            identifier: "Default",
            host: "45.126.127.170",
            port: 443,
            password: "bot",
            secure: false,
            version: "v4",
            useVersionPath: true,
        },
    ],

    spotify: {
        clientID: "fc71055b089745069cfa8154bbe7669c",
    },
};
