#!/usr/bin/env node
const { resolve } = require("path");
const {
  promises: { readdir, stat },
} = require("fs");

/**
 * Returns all files in a directory (recursively)
 * @param {string} buildPath - path to the build directory
 * @returns {Promise<{path: string, name: string}>} file path and name
 */
const getFiles = async (buildPath = "./") => {
  const entries = await readdir(buildPath, { withFileTypes: true });
  const files = entries
    .filter((file) => !file.isDirectory())
    .map((file) => ({ ...file, path: resolve(buildPath, file.name) }));
  const directories = entries.filter((folder) => folder.isDirectory());

  for (const directory of directories) {
    const subdirectoryFiles = await getFiles(
      resolve(buildPath, directory.name)
    );
    files.push(...subdirectoryFiles);
  }
  return files;
};

/**
 * Emphasizes a message in the console
 * @param {string} message - text to log
 */
const logHeader = (message) => {
  const line = "-".repeat(message.length + 8);
  console.log(`${line}\n|-> ${message} <-|\n${line}`);
};

/**
 * Takes an object containing build information and returns an object containing build sizes.
 * The build sizes are logged when the script is ran via CLI.
 * @param {{samplePath: string, buildPath: string}}
 * - samplePath - relative path to the sample's root directory ("$PWD" default)
 * - buildPath - relative path from samplePath to the build directory
 * @returns {Promise<{ mainBundleSize: string, buildSize:string , buildFileCount: string}>}
 * - mainBundleSize - size in megabytes of the largest JavaScript bundle file
 * - buildSize - size in megabytes of all files in the build directory
 * - buildFileCount - count of all files in the build directory
 */
const calculateBuildSize = async ({ samplePath, buildPath }) => {
  const sample = !!samplePath
    ? resolve(__dirname, samplePath)
    : process.env.PWD;
  const build = resolve(sample, buildPath);

  const buildFiles = await getFiles(build);

  const mainBundleSize = (
    Math.max(
      ...(await Promise.all(
        buildFiles
          .filter((file) => /.js$/.test(file.name))
          .map(async (file) => (await stat(file.path)).size)
      ))
    ) / 1e6 // convert bytes to megabytes
  ).toFixed(2);

  const buildSize = (
    (
      await Promise.all(
        buildFiles.map(async (file) => (await stat(file.path)).size)
      )
    ).reduce((count, fileSize) => count + fileSize, 0) / 1e6
  ).toFixed(2);

  const buildFileCount = buildFiles.length + 1;

  return { mainBundleSize, buildSize, buildFileCount };
};

if (require.main === module) {
  (async () => {
    try {
      const [buildPath, samplePath] = process.argv.splice(2);

      const { mainBundleSize, buildSize, buildFileCount } =
        await calculateBuildSize({
          buildPath,
          samplePath,
        });

      const headerText = "App Build Metrics";
      logHeader(headerText);
      console.log(
        `Main bundle size: ${mainBundleSize} MB\nOn-disk size: ${buildSize} MB\nOn-disk files: ${buildFileCount}`
      );
      console.log("-".repeat(headerText.length + 8));
    } catch (err) {
      console.error(err);
      process.exitCode = 1;
    }
  })();
}

module.exports.calculateBuildSize = calculateBuildSize;
module.exports.logHeader = logHeader;
