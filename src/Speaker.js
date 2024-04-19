const { exec } = require('child_process');
const stream = require('stream');


/**
 * A device used to play audio output to the user.
 */
class Speaker {
    /**
     * Create a readable stream of microphone input.
     * @returns {stream.Readable}
     * A writable stream of microphone input.
     */
    createWriteStream () {
        const subprocess = exec(
            'pacat -p'
        );

        const stream = subprocess.stdin;

        stream.on(
            'close',
            () => subprocess.kill('SIGTERM')
        );

        return stream;
    }
}


module.exports = Speaker;
