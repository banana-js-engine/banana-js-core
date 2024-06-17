/** 
 * Audio Class. Uses Web Audio API.
*/


export class AudioManager {
    
    static #audioContext: AudioContext = new AudioContext();
    static #sources: Audio[] = [];

    static async loadAudio(src: string): Promise<AudioBuffer> {
        return fetch(src) 
            .then(response => response.arrayBuffer())
            .then(arrayBuffer => this.#audioContext.decodeAudioData(arrayBuffer));
    }

    static createSource(buffer: AudioBuffer) {
        const audioSource = new Audio(this.#audioContext, buffer);
        this.#sources.push(audioSource);
        return audioSource;
    }
        
}
        
export class Audio {

    #audioContext: AudioContext;
    #buffer: AudioBuffer;
    #source: AudioBufferSourceNode;
    #gainNode: GainNode;

    constructor(audioContext: AudioContext, audioBuffer: AudioBuffer) {
        this.#audioContext = audioContext;
        this.#buffer = audioBuffer;
        this.#source = null;
        this.#gainNode = this.#audioContext.createGain();
        this.#gainNode.connect(this.#audioContext.destination);
    }

    /**
     * Starts playing the selected audio or resumes it. 
     */
    play(loop: boolean) {
        this.#source = this.#audioContext.createBufferSource();
        this.#source.buffer = this.#buffer;
        this.#source.loop = loop;
        this.#source.connect(this.#gainNode);
        this.#source.start(0);
    }

    /**
     * Stops the audio
     */
    stop() {
        if (this.#source) {
            this.#source.stop(0);
            this.#source = null;
        }
    }

    /**
     * Modifies the volume of the audio playing
     * @param currentVolume The volume user aims for
     */
    modifyVolume(currentVolume: number) {
        this.#gainNode.gain.value = currentVolume;
    }
}