import fs from "fs/promises";
import path from "path";
import inliner from "web-resource-inliner";

const __dirname = new URL(".", import.meta.url).pathname;
const Paths = {
    src: {
        landing: path.join(__dirname, "src", "landing", "index.html"),
        split: path.join(__dirname, "src", "split", "split.html"),
        combine: path.join(__dirname, "src", "combine", "combine.html"),
        combinePart: path.join(__dirname, "src", "part", "part.html"),
    },
    build: {
        landing: path.join(__dirname, "public", "index.html"),
        split: path.join(__dirname, "public", "split.html"),
        combine: path.join(__dirname, "public", "combine.html"),
    },
};

async function inline(inputPath: string): Promise<string> {
    const fileContent = await fs.readFile(inputPath, "utf-8");

    return new Promise((resolve, reject) => {
        inliner.html(
            {
                fileContent,
                scripts: true,
                relativeTo: path.dirname(inputPath),
            },
            (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            }
        );
    });
}

async function build() {
    const combine = await inline(Paths.src.combine);
    await fs.writeFile(Paths.build.combine, combine, "utf-8");

    const landing = await inline(Paths.src.landing);
    await fs.writeFile(Paths.build.landing, landing, "utf-8");

    const template = await inline(Paths.src.combinePart);

    let split = await inline(Paths.src.split);

    split = split.replace(
        "__TEMPLATE__BASE64__",
        Buffer.from(template).toString("base64")
    );

    await fs.writeFile(Paths.build.split, split, "utf-8");
}

build().catch(console.error);
