const joinButton = document.getElementById("join");

const localVideoElement = document.getElementById("localVideo");

let localStream;
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

function addVideoStream(stream, clientId, source) {
    console.log("AddVideoGettingCalled: ", source);
    const videoElement = document.createElement("video");
    videoElement.id = "video-" + clientId;
    videoElement.autoplay = "true";
    videoElement.muted = "true";
    videoElement.playsinline = "true";
    videoElement.controls = "false"
    videoElement.style = "width: 180px; height: 180px; border: solid 2px gray;"
    videoElement.srcObject = stream;

    document.getElementById("playerWrapper").insertAdjacentElement("beforeend", videoElement);
}