#!/usr/bin/env node

const program = require("commander");
const { exec } = require("child_process");
const { lstatSync, readdirSync } = require("fs");
const { join } = require("path");
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

// check directory
const isDirectory = async source => await lstatSync(source).isDirectory();

// each directory check for commits to push
const getDirectories = async source =>
  await readdirSync(source)
    .map(name => join(source, name))
    .filter(isDirectory);

const checkForCommits = dir => {
  new Promise((resolve, reject) => {
    const command = `cd ${dir} && git status`;
    exec(command, function(err, stdout, stderr) {
      const result = stdout.trim().toString("utf8");
      const hasCommitsToPush = result.includes("Your branch is ahead");
      if (hasCommitsToPush) {
        console.log(`Needs push on: ${dir}`);
      } else {
        console.log(`All good: ${dir}`);
      }
      resolve("done");
    });
  });
};

const main = async () => {
  const dir = program.args.toString("utf8");
  console.log(`Okay, let's check "${dir}"`);
  const isDirectoryFound = await isDirectory(dir);

  if (!isDirectoryFound) {
    console.log(`😩  Directory was not found.\n\n`);
    return;
  }

  // get sub directories
  const subDirectories = await getDirectories(dir);

  // TODO: check each repo for up pushed commits
  for (let i = 0; i < subDirectories.length; i++) {
    await checkForCommits(subDirectories[i]);
  }

  // TODO: list each directory and show pass/fail if "Your branch is ahead"
};
if (!program.dir) console.log(`You must add a directory to check`);
else main();
