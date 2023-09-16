import chalk from "chalk";
import MusicBoxClient from "../MusicBox.js";
import Logger from "./Logger.js";
export default class ExceptionHandler {
    static init(client: MusicBoxClient) {
        process.on("uncaughtException", (err) => {
            Logger.error(chalk.red("[UncaughtException] ") + err.stack ? err.stack : err);
        });

        process.on("unhandledRejection", (err) => {
            Logger.error(chalk.red("[UnhandledRejection] ") + err);
        });
    }
}
