#!/usr/bin/env node

const program = require("commander");
const { exec } = require("child_process");
var pjson = require("./package.json");

program
  .version(pjson.version)
  .option("-d, --dir", "set directory to check repos in")
  .parse(process.argv);

// check users global version
const checkVersion = () => {
  // only check major and minor versioning
  exec("npm show check-unpushed-commits version", function(
    err,
    stdout,
    stderr
  ) {
    if (
      pjson.version.trim().slice(0, -1) !=
      stdout
        .trim()
        .toString("utf8")
        .slice(0, -1)
    )
      console.log(
        `\x1b[32m`, // green
        `😎  Update available: ${stdout}`,
        "\x1b[37m", // white
        `run $ npm update i -g check-unpushed-commits`
      );
  });
};

// check wip/ directory
// each directory check for commits to push

const checkForDirectory = dir => {
  return new Promise((resolve, reject) => {
    const command = `if test -d ${dir}; then echo "exist"; fi`;
    exec(command, function(err, stdout, stderr) {
      const output = stdout.toString("utf8");
      const found = output.includes("exist");
      resolve(found);
    });
  });
};

const main = async () => {
  console.log(`Okay, let's check "${program.args}"`);
  const isDirectoryFound = await checkForDirectory(program.args);

  if (!isDirectoryFound) {
    console.log(`😩  Directory was not found.\n\n`);
    return;
  }

  // TODO: get sub directories
  // TODO: check each repo for up pushed commits
  // TODO: list each directory and show pass/fail if "Your branch is ahead"
};
if (!program.dir) console.log(`You must add a directory to check`);
else main();
