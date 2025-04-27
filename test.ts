import { blue, bold, green, red, yellow } from "jsr:@std/fmt/colors";

const diffStats = {
    filesChanged: 4,
    insertions: 426,
    deletions: 328,
};

const statsContent = [
    // `${blue(`Files changed: ${diffStats.filesChanged}`)}`,
    // `${green(`Insertions: ${diffStats.insertions}`)}`,
    // `${red(`Deletions: ${diffStats.deletions}`)}`,
    `${blue(bold("Files changed"))}: ${diffStats.filesChanged}`,
    `${green(bold("Insertions"))}: ${diffStats.insertions}`,
    `${red(bold("Deletions"))}: ${diffStats.deletions}`,
].join("\n");

console.log(statsContent);
