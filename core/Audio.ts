/** 
 * Audio Class. Uses Web Audio API.
*/

export let audioContext;
export let currentAudio;
export let gainNode;
export let source;

export class Audio {
    
    constructor(){
        AudioContext = window.AudioContext //|| window.webkitAudioContext;
        audioContext = new AudioContext();
        gainNode = audioContext.createGain();
    }
    
}

/**
 * Sets the new selected audio
 * @param audioSource The new audio to be played
 */
export async function setAudio(audioSource) {
    if (!audioContext) {
      audioContext = new AudioContext();
      gainNode = audioContext.createGain();
    }
  
    const mediaElement = document.createElement('audio');
    mediaElement.src = audioSource;
  
    // Optionally set other attributes (autoplay, controls, etc.)
    // ...
  
    mediaElement.addEventListener('error', (error) => {
      console.error('Error creating audio element:', error);
      // Optionally provide user feedback or fallback behavior
    });
  
    try {
      currentAudio = await audioContext.audioWorklet.addModule('audio-processor.js'); // Optional worklet for processing
      currentAudio = currentAudio ? await currentAudio.createProcessor('audioProcessor') : audioContext.createMediaElementSource(mediaElement);
    } catch (error) {
      console.error('Error loading audio:', error);
      // Optionally provide user feedback or fallback behavior
    }
  
    if (currentAudio) {
      currentAudio.connect(gainNode).connect(audioContext.destination);
      await mediaElement.play(); // Play the audio
    }
  }

/**
 * Starts playing the selected audio or resumes it. 
 */
export function Play(){
    if (audioContext.state === "suspended") {
        audioContext.resume();
    } else {
        audioContext.play();
    }
}

/**
 * Pauses the currently playing audio
 */
export function Pause() {
    audioContext.pause();
}

/**
 * Restarts the currently selected audio
 */
export function Reset() {
    this.currentAudio.currentTime = 0; 
    this.Play();
}

/**
 * Modifies the volume of the audio playing
 * @param currentVolume The volume user aims for
 */
export function ModifyVolume(currentVolume) {
    this.gainNode.gain.value = currentVolume;
}