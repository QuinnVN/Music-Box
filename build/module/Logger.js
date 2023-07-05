import chalk from "chalk";
import dayjs from "dayjs";
export default class Logger {
    static log(...content) {
        const date = dayjs().format("DD:MM:YYYY hh/mm/ss");
        console.log(`[${chalk.gray(date)}] ${chalk.blueBright("[LOG]")} ${content.toString()}`);
    }
    static info(...content) {
        const date = dayjs().format("DD:MM:YYYY hh/mm/ss");
        console.log(`[${chalk.gray(date)}] ${chalk.greenBright("[INFO]")} ${chalk.green(content.toString())}`);
    }
    static warn(...content) {
        const date = dayjs().format("DD:MM:YYYY hh/mm/ss");
        console.log(`[${chalk.gray(date)}] ${chalk.yellowBright("[WARN]")} ${chalk.yellow(content.toString())}`);
    }
    static error(...content) {
        const date = dayjs().format("DD:MM:YYYY hh/mm/ss");
        console.log(`[${chalk.gray(date)}] ${chalk.redBright("[ERROR]")} ${chalk.red(content.toString())}`);
    }
}
