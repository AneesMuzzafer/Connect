const connection = new signalR.HubConnectionBuilder()
    .withUrl("/Signal/Connect")
    .build();

let roomId = document.getElementById("meetingId").value;


joinButton.addEventListener("click", () => {
    connection.send("onEnterRoom", roomId);
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

connection.on("onClientLeftInRoom", (clientId) => {
    console.log(`client left - ${clientId}`);
});

connection.start().then(() => {
    connection.send("onEnterWaitingRoom", roomId);
    console.log("Signal Connection made with server.");
}, () => {
    console.log("Signal Connection with server could not be made. Something went wrong!");
})
