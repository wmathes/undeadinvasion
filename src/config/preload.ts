/**
 * MP3 and OGG-Vorbis are the most heavily supported
 * audio formats for modern browsers
 *
 * OGG-Vorbis is optionally set as the fallback audio
 */
export class AudioFile {
    constructor(
        public key: string,
        public mp3: string,
        public ogg?: string
    ) {

    }
}

const assetDir = "./assets"; // relative to build dir
export const config = {
    // spritesheets
    ssPath: `${assetDir}/spritesheets/`,
    sheets: [
        "sheet1"
    ],

    // audio
    audioPath: `${assetDir}/audio/`,
    audioFiles: [
        new AudioFile('DOG', 'DOG.mp3', 'DOG.ogg')
    ]
}
