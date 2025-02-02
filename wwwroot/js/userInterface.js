﻿const joinButton = document.getElementById("join");
const disconnectButton = document.getElementById("disconnect");
const localVideoElement = document.getElementById("localVideo");
const localVideoElementLobby = document.getElementById("localVideoLobby");

let isMuted = false;
let isVideoOff = false;
let isSharingScreen = false;

let localStream;
let screenStream;

let hasJoined = false;
let numOfConnections = 1;

function setHasJoined(flag) {
    hasJoined = flag;
    if (flag) {
        document.getElementById("panel-join").style.display = "none";
        document.getElementById("panel-in-meet").style.display = "flex";
    } else {
        document.getElementById("panel-join").style.display = "flex";
        document.getElementById("panel-in-meet").style.display = "none";
    }
    document.querySelectorAll("#video-off").forEach(el => updateVideoButton(el));
    document.querySelectorAll("#mute").forEach(el => updateAudioButton(el));
}

document.querySelectorAll("#video-off").forEach(el => el.addEventListener("click", function () {
    localStream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
    });

    isVideoOff = !isVideoOff;
    updateVideoButton(el);
}));

document.querySelectorAll("#mute").forEach(el => el.addEventListener("click", function () {
    localStream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
    });

    isMuted = !isMuted;
    updateAudioButton(el);
}));

function updateVideoButton(el) {
    if (isVideoOff) {
        el.firstElementChild.classList.replace("bi-camera-video-fill", "bi-camera-video-off-fill");
    } else {
        el.firstElementChild.classList.replace("bi-camera-video-off-fill", "bi-camera-video-fill");
    }
}

function updateAudioButton(el) {
    if (isMuted) {
        el.firstElementChild.classList.replace("bi-mic-fill", "bi-mic-mute-fill");
    } else {
        el.firstElementChild.classList.replace("bi-mic-mute-fill", "bi-mic-fill");
    }
}

$("#share").click(async function () {
    if (!isSharingScreen) {
        try {
            const constraints = { 'video': true };
            screenStream = await navigator.mediaDevices.getDisplayMedia(constraints);
            addVideoStream(screenStream, "Screen share");

            screenStream.getVideoTracks().forEach(t => t.onended = function () {
                removeVideoStream([screenStream.id]);
                informOthersOfStoppedShare(screenStream.id);
                isSharingScreen = false;
                document.getElementById("share").style.outlineStyle = "none";
            });
            addScreenStreamToPeerConnections(screenStream);

            isSharingScreen = true;
            this.style.outlineStyle = "solid";

        } catch (error) {
            connection.send("error", error);
            console.error('Error opening video camera.', error);
        }
    } else {
        let tracks = screenStream.getTracks();
        tracks.forEach(track => track.stop());
        removeVideoStream([screenStream.id]);
        informOthersOfStoppedShare(screenStream.id);

        isSharingScreen = false;
        this.style.outlineStyle = "none";
    }
});

async function playVideoFromCamera() {
    try {
        const constraints = { 'video': true, 'audio': true };
        localStream = await navigator.mediaDevices.getUserMedia(constraints);
        localVideoElement.srcObject = localStream;
        localVideoElementLobby.srcObject = localStream;
    } catch (error) {
        console.error('Error opening video camera.', error);
    }
}

playVideoFromCamera();

function addVideoStream(stream, text) {

    let videoId = "video-" + stream.id;

    if (document.getElementById(videoId)) return;

    const videoWrapper = document.createElement("div");
    videoWrapper.id = videoId;
    videoWrapper.classList.add("videoTile");
    videoWrapper.classList.add("p-2");
    videoWrapper.style.position = "relative";

    const overlayTextElement = document.createElement("div");
    overlayTextElement.classList.add("overlay-text");
    overlayTextElement.innerText = text;

    const videoElement = document.createElement("video");
    videoElement.autoplay = "true";
    videoElement.playsinline = "true";
    videoElement.removeAttribute("controls");
    videoElement.style.width = "100%";
    videoElement.style.height = "100%";
    videoElement.style.objectFit = "cover";
    videoElement.classList.add("rounded-2xl");
    videoElement.classList.add("bg-gray-700");
    videoElement.srcObject = stream;

    videoWrapper.insertAdjacentElement("afterbegin", videoElement);
    videoWrapper.insertAdjacentElement("beforeend", overlayTextElement);

    document.getElementById("playerWrapper").insertAdjacentElement("beforeend", videoWrapper);
    numOfConnections += 1;
    updateVideoTiles(numOfConnections);
}

function updateLobbyRoomUI(clients) {
    if (clients.length > 0) {
        let el = document.getElementById("peopleInRoom");

        switch (clients.length) {
            case 1:
                el.innerText = `${clients[0].Name} is in the room`
                break;
            case 2:
                el.innerText = `${clients[0].Name} & ${clients[1].Name} are in the room`
                break;
            default:
                let inRoom = clients.length - 2;
                let inRoomText = inRoom <= 1 ? " is" : "s are";
                el.innerText = `${clients[0].Name}, ${clients[1].Name} & ${inRoom} other${inRoomText} in the room`
        }
    }
}

function removeVideoStream(streamIds) {
    streamIds.forEach(id => {
        let videoId = "video-" + id;
        let streamToBeRemoved = document.getElementById(videoId)
        if (streamToBeRemoved) {
            streamToBeRemoved.remove();
            numOfConnections -= 1;
            updateVideoTiles(numOfConnections);
        }
    });
}

function updateVideoTiles(num) {
    let videoTiles = document.querySelectorAll(".videoTile");
    videoTiles.forEach(tile => {
        tile.style.width = getTileWidth(num);
        tile.style.height = getTileHeight(num);

        if (num > 1) {
            tile.classList.replace("p-10", "p-2");
        } else {
            tile.classList.replace("p-2", "p-10");
        }
    });
}

document.getElementById('copyButton').addEventListener('click', function () {
    navigator.clipboard.writeText(roomId).then(() => {
        const clipboardIcon = document.getElementById('clipboard-icon');
        clipboardIcon.classList.replace('bi-clipboard', 'bi-clipboard-check');

        setTimeout(() => {
            clipboardIcon.classList.replace('bi-clipboard-check', 'bi-clipboard');
        }, 2000);

    }).catch(err => {
        console.error('Failed to copy text: ', err);
    });
});

function getTileWidth(num) {

    if (window.innerWidth > 768) {
        switch (num) {
            case 1:
                return "100vw";
            case 2:
                return "50vw";
            case 3:
                return "50vw";
            case 4:
                return "50vw";
            case 5:
                return "33.3vw";
            case 6:
                return "33.3vw";
            case 7:
                return "33.3vw";
            case 8:
                return "33.3vw";
            case 9:
                return "33.3vw";
            default:
                return "25vw";
        }
    } else {
        switch (num) {
            case 1:
                return "100vw";
            case 2:
                return "100vw";
            case 3:
                return "100vw";
            case 4:
                return "50vw";
            case 5:
                return "50vw";
            case 6:
                return "50vw";
            case 7:
                return "50vw";
            case 8:
                return "50vw";
            case 9:
                return "33.3vw";
            default:
                return "33.3vw";
        }
    }
}

function getTileHeight(num) {

    if (window.innerWidth > 768) {
        switch (num) {
            case 1:
                return "calc((100vh - 120px) / 1)";
            case 2:
                return "calc((100vh - 120px) / 1)";
            case 3:
                return "calc((100vh - 120px) / 2)";
            case 4:
                return "calc((100vh - 120px) / 2)";
            case 5:
                return "calc((100vh - 120px) / 2)";
            case 6:
                return "calc((100vh - 120px) / 2)";
            case 7:
                return "calc((100vh - 120px) / 3)";
            case 8:
                return "calc((100vh - 120px) / 3)";
            case 9:
                return "calc((100vh - 120px) / 3)";
            default:
                return "calc((100vh - 120px) / 4)";
        }
    } else {
        switch (num) {
            case 1:
                return "calc((100vh - 120px) / 1)";
            case 2:
                return "calc((100vh - 120px) / 2)";
            case 3:
                return "calc((100vh - 120px) / 3)";
            case 4:
                return "calc((100vh - 120px) / 2)";
            case 5:
                return "calc((100vh - 120px) / 3)";
            case 6:
                return "calc((100vh - 120px) / 3)";
            case 7:
                return "calc((100vh - 120px) / 4)";
            case 8:
                return "calc((100vh - 120px) / 4)";
            case 9:
                return "calc((100vh - 120px) / 4)";
            default:
                return "calc((100vh - 120px) / 4)";
        }
    }
}
