const { resolve } = require("path");
const { promisify } = require("util");
const {
  createWriteStream,
  promises: { readdir, readFile }
} = require("fs");
const exec = promisify(require("child_process").exec);

const EXAMPLES_PATH = "../../esm-samples";

const buildInfo = {
  // "jsapi-angular-cli": {
  //   buildDirectory: "dist",
  //   bundleDirectory: "./",
  //   title: "Angular",
  //   package: "@angular/core"
  // },
  "jsapi-create-react-app": {
    buildDirectory: "build",
    bundleDirectory: "static/js",
    title: "CRA",
    package: "react-scripts"
  },
  "jsapi-vue-cli": {
    buildDirectory: "dist",
    bundleDirectory: "js",
    title: "Vue",
    package: "vue"
  },
  // "rollup": {
  //   buildDirectory: "public",
  //   bundleDirectory: "./",
  //   title: "Rollup",
  //   package: "rollup",
  //   devDep: true
  // },
  "webpack": {
    buildDirectory: "dist",
    bundleDirectory: "./",
    title: "Webpack",
    package: "webpack",
    devDep: true
  }
};

const getDirectories = async (directoriesPath) =>
  (await readdir(resolve(__dirname, directoriesPath), { withFileTypes: true }))
    .filter((dirent) => dirent.isDirectory() && dirent.name.charAt(0) !== ".")
    .map((dirent) => dirent.name);

(async () => {
  try {
    const exampleDirs = await getDirectories(EXAMPLES_PATH);

    const jsapiVersion = JSON.parse(
      await readFile(resolve(__dirname, EXAMPLES_PATH, exampleDirs[0], "package.json"), "utf8")
    ).dependencies["@arcgis/core"].replace(/\^|\~/, "");

    console.log(`current version: ${jsapiVersion}`);
    const outputPath = resolve(__dirname, "../build-sizes", `${jsapiVersion}.csv`);
    const stream = createWriteStream(outputPath);
    stream.write("Sample,Main bundle size,On-disk size\n");

    for (example of exampleDirs) {
      const buildDir = buildInfo[example]?.buildDirectory;
      const bundleDir = buildInfo[example]?.bundleDirectory;
      const exampleTitle = buildInfo[example]?.title;
      const examplePackage = buildInfo[example]?.package;
      const isPackageDevDep = buildInfo[example]?.devDep;

      const examplePackageFile = JSON.parse(
        await readFile(resolve(__dirname, EXAMPLES_PATH, example, "package.json"), "utf8")
      );

      const packageVersion = isPackageDevDep
        ? examplePackageFile.devDependencies[examplePackage]
        : examplePackageFile.dependencies[examplePackage];

      if (!!buildDir) {
        const examplePath = resolve(__dirname, EXAMPLES_PATH, example);
        const buildPath = resolve(examplePath, buildDir);

        console.log(`${example}: installing deps`);
        await exec(`npm i --prefix ${examplePath}`);

        console.log(`${example}: building`);
        await exec(`npm run build --prefix ${examplePath}`);

        console.log(`${example}: calculating size`);
        const buildSize = (await exec(`du -sh ${buildPath} | cut -f1`)).stdout.trim();
        const fileCount = (await exec(`find ${buildPath} -type f | wc -l`)).stdout.trim();
        const mainBundleSize = Number(
          (
            await exec(`du -a --exclude="*.map" ${resolve(buildPath, bundleDir)}/ | sort -n -r | sed -n 2p | cut -f1`)
          ).stdout.trim() / 1000 // convert kb to mb
        )
          .toFixed(1)
          .toString()
          .concat("M");

        stream.write(
          `${exampleTitle} ${packageVersion.replace(/\^|\~/, "")},${mainBundleSize},${buildSize} (${fileCount} files)\n`
        );
      }
    }
  } catch (err) {
    console.error(err);
  }
})();
