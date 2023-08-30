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
            host: "hatkidll.gremagol.xyz",
            port: 2334,
            password: "easypass",
            secure: false,
            // version: "v4" as const,
            // useVersionPath: true,
        },
    ],

    dataDirectory: "./Data",

    spotify: {
        clientID: "", //"fc71055b089745069cfa8154bbe7669c",
    },
};
