import chalk from "chalk";
import dayjs from "dayjs";

export default class Logger {
    static log(...content: unknown[]) {
        const date = dayjs().format("hh:mm:ss DD/MM/YYYY");

        console.log(`[${chalk.gray(date)}] ${chalk.blueBright("[LOG]")} ${content.toString()}`);
    }

    static info(...content: unknown[]) {
        const date = dayjs().format("hh:mm:ss DD/MM/YYYY");

        console.log(
            `[${chalk.gray(date)}] ${chalk.greenBright("[INFO]")} ${chalk.green(
                content.toString()
            )}`
        );
    }

    static warn(...content: unknown[]) {
        const date = dayjs().format("hh:mm:ss DD/MM/YYYY");

        console.log(
            `[${chalk.gray(date)}] ${chalk.yellowBright("[WARN]")} ${chalk.yellow(
                content.toString()
            )}`
        );
    }

    static error(...content: unknown[]) {
        const date = dayjs().format("hh:mm:ss DD/MM/YYYY");

        console.log(
            `[${chalk.gray(date)}] ${chalk.redBright("[ERROR]")} ${chalk.red(content.toString())}`
        );
    }
}
