const peerConnections = [];

const configuration = { 'iceServers': [{ 'urls': 'stun:stun.l.google.com:19302' }] };

function setupConnectionsOnSelfEntry(clients) {
    clients.forEach(async (client) => {

        const peerConnection = new RTCPeerConnection(configuration);

        const peer = {
            clientId: client,
            peerConnectionInstance: peerConnection,
            streamIds: []
        };

        peerConnections.push(peer);

        localStream.getTracks().forEach(track => {
            peerConnection.addTrack(track, localStream);
        });

        peerConnection.addEventListener('track', async (event) => {

            const [remoteStream] = event.streams;
            peer.streamIds.push(remoteStream.id);
            addVideoStream(remoteStream, client);
        });

        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        connection.send("offer", { offer: offer }, client);

        peerConnection.addEventListener('icecandidate', event => {
            if (event.candidate) {
                connection.send('newIceCandidate', { iceCandidate: event.candidate }, client);
            }
        });

        peerConnection.addEventListener('connectionstatechange', event => {
            if (peerConnection.connectionState === 'connected') {
                // Peers connected!
                console.log("Peers connected");
            }
        });

    });
};

connection.on("message", async (message, senderId) => {
    let peerInstance = peerConnections.find(p => p.clientId == senderId).peerConnectionInstance;

    if (message.offer) {
        let offer = message.offer;

        peerInstance.setRemoteDescription(new RTCSessionDescription(offer));

        const answer = await peerInstance.createAnswer();
        await peerInstance.setLocalDescription(answer);

        connection.send("answer", { answer: answer }, senderId);

    } else if (message.answer) {
        const remoteDesc = new RTCSessionDescription(message.answer);
        await peerInstance.setRemoteDescription(remoteDesc);

    } else if (message.iceCandidate) {

        try {
            await peerInstance.addIceCandidate(message.iceCandidate);
        } catch (e) {
            console.error('Error adding received ice candidate', e);
        }
    }
});

function setupConnectionOnOthersEntry(newClientId) {
    const peerConnection = new RTCPeerConnection(configuration);

    const peer = {
        clientId: newClientId,
        peerConnectionInstance: peerConnection,
        streamIds: []
    };

    peerConnections.push(peer);

    localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream);
    });

    peerConnection.addEventListener('track', async (event) => {
        const [remoteStream] = event.streams;
        peer.streamIds.push(remoteStream.id);
        addVideoStream(remoteStream, newClientId);
    });

    peerConnection.addEventListener('icecandidate', event => {
        if (event.candidate) {
            connection.send('newIceCandidate', { iceCandidate: event.candidate }, newClientId);
        }
    });

    peerConnection.addEventListener('connectionstatechange', event => {
        if (peerConnection.connectionState === 'connected') {
            // Peers connected!
            console.log("Peers conngkyjected");
        }
    });
};

function addScreenStreamToPeerConnections(screenStream) {
    peerConnections.forEach((peer) => {
        let peerInstance = peer.peerConnectionInstance;

        screenStream.getTracks().forEach(track => {
            peerInstance.addTrack(track, screenStream);
        });

        peerInstance.addEventListener("negotiationneeded", async () => {
            const offer = await peerInstance.createOffer();
            await peerInstance.setLocalDescription(offer);
            connection.send("offer", { offer: offer }, peer.clientId);
        });

    });
}

function disposePeer(clientId) {
    let peer = peerConnections.find(p => p.clientId == clientId);
    peer.peerConnectionInstance.close();
    removeVideoStream(peer.streamIds);
}
