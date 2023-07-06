import chalk from "chalk";
import dayjs from "dayjs";

export default class Logger {
    static log(...text: unknown[]) {
        const date = dayjs().format("DD/MM/YYYY hh:mm:ss");

        console.log(`[${chalk.gray(date)}] ${chalk.blueBright("[LOG]")} ${text.toString()}`);
    }

    static info(...text: unknown[]) {
        const date = dayjs().format("DD/MM/YYYY hh:mm:ss");

        console.log(
            `[${chalk.gray(date)}] ${chalk.greenBright("[INFO]")} ${chalk.green(text.toString())}`
        );
    }

    static warn(...text: unknown[]) {
        const date = dayjs().format("DD/MM/YYYY hh:mm:ss");

        console.log(
            `[${chalk.gray(date)}] ${chalk.yellowBright("[WARN]")} ${chalk.yellow(text.toString())}`
        );
    }

    static error(...text: unknown[]) {
        const date = dayjs().format("DD/MM/YYYY hh:mm:ss");

        console.log(
            `[${chalk.gray(date)}] ${chalk.redBright("[ERROR]")} ${chalk.red(text.toString())}`
        );
    }

    static music(...text: unknown[]) {
        const date = dayjs().format("DD/MM/YYYY hh:mm:ss");

        console.log(
            `[${chalk.gray(date)}] ${chalk.magentaBright("[MUSIC]")} ${chalk.magenta(
                text.toString()
            )}`
        );
    }
}
