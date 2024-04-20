const fs = require('fs');
const {
    existsSync,
    mkdirSync
} = require('fs');

const pacat = require("../src")('float32le');


if (process.argv.length < 3) {
    process.exit(1);
}


const TMP_DIR = 'samples/out';

const FILE_PATH = TMP_DIR + '/0.float32le.audio';


function feedback () {
    const session = pacat.createFeedbackSession();

    console.log("Starting feedback loop...");
}


function record () {
    pacat.recordFile(FILE_PATH);

    console.log("Recording...");
}


function playback () {
    pacat.playFile(FILE_PATH);

    console.log("Playing...");
}


function logUsage () {
    console.log(`usage:\tnode debug/test-tool.js <play|record|feedback>`);
}


function createTmpDir () {
    if (!existsSync(TMP_DIR)) {
        mkdirSync(
            TMP_DIR,
            {
                recursive: true
            }
        );
    }
}


createTmpDir();


/* Record */


const mode = process.argv[process.argv.length - 1];

if (mode === 'f' || mode === 'feedback') feedback();
else if (mode === 'p' || mode === 'play') playback();
else if (mode === 'r' || mode === 'record') record();
else {
    logUsage();

    process.exit(1);
}

/* Playback */
