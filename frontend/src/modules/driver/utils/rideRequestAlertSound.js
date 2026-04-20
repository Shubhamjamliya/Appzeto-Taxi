import rideRequestAlertUrl from '../../../assets/sounds/ride-request-alert.mp3';

let alertAudio;
let isUnlocked = false;

const getAlertAudio = () => {
    if (!alertAudio) {
        alertAudio = new Audio(rideRequestAlertUrl);
        alertAudio.loop = true;
        alertAudio.preload = 'auto';
        alertAudio.volume = 0.85;
    }

    return alertAudio;
};

export const unlockRideRequestAlertSound = () => {
    if (isUnlocked) return;

    const audio = getAlertAudio();
    const previousVolume = audio.volume;
    audio.volume = 0;

    audio.play()
        .then(() => {
            audio.pause();
            audio.currentTime = 0;
            audio.volume = previousVolume;
            isUnlocked = true;
        })
        .catch(() => {
            audio.volume = previousVolume;
        });
};

export const playRideRequestAlertSound = () => {
    const audio = getAlertAudio();
    audio.currentTime = 0;
    audio.play().catch(() => {});
};

export const stopRideRequestAlertSound = () => {
    if (!alertAudio) return;

    alertAudio.pause();
    alertAudio.currentTime = 0;
};
