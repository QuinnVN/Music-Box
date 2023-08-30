export default function convertTime(duration: number): string {
    let seconds: number | string = Math.floor(duration / 1000) % 60,
        minutes: number | string = Math.floor(duration / (1000 * 60)) % 60,
        hours: number | string = Math.floor(duration / (1000 * 60 * 60)) % 24;

    hours = hours < 10 ? "0" + hours : hours;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;

    if (duration < 3600000) {
        return minutes + ":" + seconds;
    } else {
        return hours + ":" + minutes + ":" + seconds;
    }
}
