const connection = new signalR.HubConnectionBuilder()
    .withUrl("/Signal/Connect")
    .build();

let roomId = document.getElementById("meetingId").value;

joinButton.addEventListener("click", () => {
    connection.send("onEnterRoom", roomId);
    setHasJoined(true);
});

connection.on("onGetClientsInRoomFromWaitingRoom", (clientListJson) => {
    let clients = JSON.parse(clientListJson);
    console.log("Received client List in room from Waiting Room: ", clients);
});

connection.on("onGetClientsInRoomFromMeetingRoom", (clientListJson) => {
    let clients = JSON.parse(clientListJson);
    setupConnectionsOnSelfEntry(clients);
});

connection.on("onNewClientEnteredInRoom", (newClientId) => {
    setupConnectionOnOthersEntry(newClientId);
});

connection.on("onClientLeftFromRoom", (clientId) => {
    disposePeer(clientId);
});

connection.on("onStopShare", (streamId) => {
    removeVideoStream([streamId]);
});

connection.start().then(() => {
    connection.send("onEnterWaitingRoom", roomId);
    console.log("Signal Connection made with server.");
}, () => {
    console.log("Signal Connection with server could not be made. Something went wrong!");
})

disconnectButton.addEventListener("click", () => {
    connection.send("onLeftRoom", roomId);
    setHasJoined(true);
    window.location.assign("/");
});

function informOthersOfStoppedShare(streamId) {
    connection.send("onStopShare", roomId, streamId);
}
