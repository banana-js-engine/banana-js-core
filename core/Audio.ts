/** 
 * Audio Class. Uses Web Audio API.
*/

export let audioContext;
export let currentAudio;
export let gainNode;


export class Audio {
    
    constructor(){
        AudioContext = window.AudioContext //|| window.webkitAudioContext;
        audioContext = new AudioContext();
        gainNode = audioContext.createGain();
    }
    
}

export function setAudio(audio : HTMLMediaElement) {
    this.currentAudio = audioContext.createMediaElementSource(audio);
    this.currentAudio.connect(gainNode).connect(audioContext.destination);
}

export function Play(){
    if (audioContext.state === "suspended") {
        audioContext.resume();
    } else {
        this.currentAudio.play();
    }
}

export function Pause() {
    this.currentAudio.pause();
}

export function Reset() {

}

export function ModifyVolume(currentVolume) {
    this.gainNode.gain.value = currentVolume;
}