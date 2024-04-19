const {
    exec,
    spawn
} = require('child_process');

const { createReadStream, createWriteStream } = require('fs');

const stream = require('stream');


const DEFAULT_FORMAT = 'float32le';


/**
 * An audio playback session.
 * Use this to stream raw audio data to the speakers.
 */
class AudioPlaybackSession {
    constructor (
        pacat,
        readableStream
    ) {
        const writableStream = pacat.createWriteStream();

        this._inputStream = readableStream;

        readableStream.pipe(
            writableStream
        );

        process.on(
            'exit',
            () => this.close()
        );
    }


    /**
     * Close the session.
     */
    close () {
        this._inputStream?.close();
    }
}


/**
 * An audio recording session.
 * Use this to stream raw audio data from a microphone.
 */
class AudioRecordingSession {
    constructor (
        pacat,
        writableStream
    ) {
        pacat.listen(
            writableStream,
            null,
            () => this.close()
        );

        process.on(
            'exit',
            () => this.close()
        );
    }


    /**
     * Close the session.
     */
    close () {
        this._inputStream?.close();
    }
}


/**
 * An audio feedback session.
 * Use this to stream raw audio data from a microphone into the speakers.
 *
 * WARNING: This is strictly a debugging tool.
 */
class AudioFeedbackSession {
    constructor (pacat) {
        this._session = pacat.createRecordingSession(
            pacat.createWriteStream()
        );

        process.on(
            'exit',
            () => this.close()
        );
    }


    /**
     * Close the session.
     */
    close () {
        this._session.close();
    }
}


/**
 * A device used to receive audio input from the user.
 */
class PACat {
    constructor (format = DEFAULT_FORMAT) {
        this.setFormat(format);
    }


    /**
     * Create a readable stream of microphone input.
     * @returns {stream.Readable}
     * A readable stream of microphone input.
     */
    createReadStream () {
        const format = this.getFormat();

        const subprocess = exec(
            `pacat -r --format=${format}`
        );

        const stream = subprocess.stdout;

        stream.on(
            'close',
            () => subprocess.kill('SIGTERM')
        );

        return stream;
    }


    /**
     * Create a new `AudioFeedbackSession`.
     * @returns {AudioFeedbackSession} The session.
     */
    createFeedbackSession () {
        return new AudioFeedbackSession(this);
    }


    /**
     * Create a new `AudioPlaybackSession`.
     * @returns {AudioPlaybackSession} The session.
     */
    createPlaypackSession (readableStream) {
        return new AudioPlaybackSession(
            this,
            readableStream
        );
    }


    /**
     * Create a new `AudioRecordingSession`.
     * @returns {AudioRecordingSession} The session.
     */
    createRecordingSession (writableStream) {
        return new AudioRecordingSession(
            this,
            writableStream
        );
    }


    /**
     * Create a readable stream of microphone input.
     * @returns {stream.Readable}
     * A writable stream of microphone input.
     */
    createWriteStream () {
        const format = this.getFormat();

        const subprocess = exec(
            `pacat -p --format=${format}`
        );

        const stream = subprocess.stdin;

        stream.on(
            'close',
            () => subprocess.kill('SIGTERM')
        );

        return stream;
    }


    /**
     * Get the audio format used when encoding and decoding audio streams.
     * @returns {string}
     * The format to use when encoding and decoding audio streams.
     */
    getFormat () {
        return this._format;
    }


    /**
     * Set the audio format used when encoding and decoding audio streams.
     * @param {string} format
     * The format to use when encoding and decoding audio streams.
     */
    setFormat (format = DEFAULT_FORMAT) {
        format
            = typeof format === 'string'
            ? format
            : DEFAULT_FORMAT;

        this._format = format;
    }


    /**
     * Begin reading data from the microphone.
     * @returns {void}
     */
    listen (
        stdout = null,
        stderr = null,
        onExit = null
    ) {
        const format = this.getFormat();

        const command = 'pacat';
        const args = [
            '-r',
            `--format=${format}`
        ];

        const subprocess = spawn(
            command,
            args
        );

        subprocess.stdout.pipe(stdout);

        stdout.on(
            'close',
            () => subprocess.kill('SIGTERM')
        );

        subprocess.on(
            'exit',
            () => {
                if (typeof onExit === 'function') {
                    onExit();
                }
            }
        )
    }


    /**
     * Play a raw audio file (synchronously).
     * @param {fs.PathLike} filePath
     */
    playFile (filePath) {
        const readableStream = createReadStream(filePath);

        return this.createPlaypackSession(readableStream);
    }


    /**
     * Record a raw audio file (synchronously).
     * @param {fs.PathLike} filePath
     */
    recordFile (filePath) {
        const writableStream = createWriteStream(filePath);

        return this.createRecordingSession(
            writableStream
        );
    }
}


module.exports = PACat;
