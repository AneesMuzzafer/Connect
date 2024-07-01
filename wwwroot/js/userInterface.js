const joinButton = document.getElementById("join");
const disconnectButton = document.getElementById("disconnect");
const localVideoElement = document.getElementById("localVideo");

let isMuted = false;
let isVideoOff = false;

let localStream;
let screenStream;

$("#video-off").click(function () {
    isVideoOff = !isVideoOff;
    localStream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled; 
    });
});

$("#mute").click(function () {
    isMuted = !isMuted;

    localStream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
    });
});

$("#share").click(async function () {
    try {
        const constraints = { 'video': true };
        screenStream = await navigator.mediaDevices.getDisplayMedia(constraints);
        addVideoStream(screenStream, "-myVideo")
        addScreenStreamToPeerConnections(screenStream);
    } catch (error) {
        connection.send("error", error);
        console.error('Error opening video camera.', error);
    }
});

$("#stopshare").click(function () {
    let tracks = screenStream.getTracks();
    tracks.forEach(track => track.stop());
    removeVideoStream([screenStream.id]);
    informOthersOfStoppedShare(screenStream.id);
});


async function playVideoFromCamera() {
    try {
        const constraints = { 'video': true, 'audio': true };
        localStream = await navigator.mediaDevices.getUserMedia(constraints);
        localVideoElement.srcObject = localStream;
    } catch (error) {
        console.error('Error opening video camera.', error);
    }
}

playVideoFromCamera();

function addVideoStream(stream) {

    let videoId = "video-" + stream.id;

    if (document.getElementById(videoId)) return;

    const videoWrapper = document.createElement("div");
    videoWrapper.style = "flex: 1;";
    videoWrapper.id = videoId

    const videoElement = document.createElement("video");
    videoElement.autoplay = "true";
    videoElement.playsinline = "true";
    videoElement.removeAttribute("controls");
    videoElement.style = "width: 100%; height: 100%; border: solid 2px gray;"
    videoElement.srcObject = stream;

    videoWrapper.insertAdjacentElement("afterbegin", videoElement);

    document.getElementById("playerWrapper").insertAdjacentElement("beforeend", videoWrapper);
}

function removeVideoStream(streamIds) {

    streamIds.forEach(id => {
        let videoId = "video-" + id;
        document.getElementById(videoId)?.remove();
    });
}