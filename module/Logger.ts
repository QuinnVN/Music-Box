import chalk from "chalk";
import dayjs from "dayjs";

export default class Logger {
    static log(content: string) {
        const date = dayjs().format("DD:MM:YYYY hh/mm/ss");

        console.log(`[${chalk.gray(date)}] ${chalk.blueBright("[LOG]")} ${content}`);
    }

    static info(content: string) {
        const date = dayjs().format("DD:MM:YYYY hh/mm/ss");

        console.log(`[${chalk.gray(date)}] ${chalk.greenBright("[INFO]")} ${chalk.green(content)}`);
    }

    static warn(content: string) {
        const date = dayjs().format("DD:MM:YYYY hh/mm/ss");

        console.log(
            `[${chalk.gray(date)}] ${chalk.yellowBright("[WARN]")} ${chalk.yellow(content)}`
        );
    }

    static error(content: string) {
        const date = dayjs().format("DD:MM:YYYY hh/mm/ss");

        console.log(`[${chalk.gray(date)}] ${chalk.redBright("[LOG]")} ${chalk.red(content)}`);
    }
}
