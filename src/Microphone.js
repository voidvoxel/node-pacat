const { exec } = require('child_process');
const stream = require('stream');


/**
 * A device used to receive audio input from the user.
 */
class Microphone {
    /**
     * Create a readable stream of microphone input.
     * @returns {stream.Readable}
     * A readable stream of microphone input.
     */
    createReadStream () {
        const subprocess = exec(
            'pacat -r'
        );

        const stream = subprocess.stdout;

        stream.on(
            'close',
            () => subprocess.kill('SIGTERM')
        );

        return stream;
    }
}


module.exports = Microphone;
