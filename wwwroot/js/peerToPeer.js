const peerConnections = [];

const configuration = { 'iceServers': [{ 'urls': 'stun:stun.l.google.com:19302' }] };


function setupConnectionsOnSelfEntry(clients) {
    console.log("Setting Up on Self Entry for clients", clients);
    clients.forEach(async (client) => {

        const peerConnection = new RTCPeerConnection(configuration);

        peerConnections.push({
            clientId: client,
            peerConnectionInstance: peerConnection
        });

        localStream.getTracks().forEach(track => {
            peerConnection.addTrack(track, localStream);
        });

        peerConnection.addEventListener('track', async (event) => {
            const [remoteStream] = event.streams;
            addVideoStream(remoteStream, client, "self");

            //remoteVideoElement.srcObject = remoteStream;
        });

        connection.on('message', async (message, senderId) => {
            if (message.answer) {
                const remoteDesc = new RTCSessionDescription(message.answer);

                let peerInstance = peerConnections.find(p => p.clientId == senderId).peerConnectionInstance;
                await peerInstance.setRemoteDescription(remoteDesc);
            }
        });

        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        connection.send("offer", { offer: offer }, client);

        peerConnection.addEventListener('icecandidate', event => {
            if (event.candidate) {
                connection.send('newIceCandidate', { iceCandidate: event.candidate }, client);
            }
        });

        connection.on('message', async (message, senderId) => {
            if (message.iceCandidate) {
                try {
                    console.log("Received Remote ice-candidate on sender");

                    let peerInstance = peerConnections.find(p => p.clientId == senderId).peerConnectionInstance;

                    await peerInstance.addIceCandidate(message.iceCandidate);
                } catch (e) {
                    console.error('Error adding received ice candidate', e);
                }
            }
        });

        peerConnection.addEventListener('connectionstatechange', event => {
            if (peerConnection.connectionState === 'connected') {
                // Peers connected!
                console.log("Peers connected");
            }
        });

    })
};

function setupConnectionOnOthersEntry(newClientId) {
    console.log("Setting up on other entry", newClientId);
    const peerConnection = new RTCPeerConnection(configuration);

    peerConnections.push({
        clientId: newClientId,
        peerConnectionInstance: peerConnection
    });

    localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream);
    });

    peerConnection.addEventListener('track', async (event) => {
        console.log("Got remote stream");
        const [remoteStream] = event.streams;

        addVideoStream(remoteStream, newClientId, "other");
        //remoteVideoElement.srcObject = remoteStream;
    });

    connection.on('message', async (message, senderId) => {

        let offer = message.offer;

        if (message.offer) {

            let peerInstance = peerConnections.find(p => p.clientId == senderId).peerConnectionInstance;

            peerInstance.setRemoteDescription(new RTCSessionDescription(offer));

            const answer = await peerInstance.createAnswer();
            await peerInstance.setLocalDescription(answer);

            connection.send("answer", { answer: answer }, senderId);
        }
    });

    peerConnection.addEventListener('icecandidate', event => {
        if (event.candidate) {
            connection.send('newIceCandidate', { iceCandidate: event.candidate }, newClientId);
        }
    });

    connection.on('message', async (message, senderId) => {
        console.log("Received Remote ice-candidate on receiver");

        let peerInstance = peerConnections.find(p => p.clientId == senderId).peerConnectionInstance;

        if (message.iceCandidate) {
            try {
                await peerInstance.addIceCandidate(message.iceCandidate);
            } catch (e) {
                console.error('Error adding received ice candidate', e);
            }
        }
    });

    peerConnection.addEventListener('connectionstatechange', event => {
        if (peerConnection.connectionState === 'connected') {
            // Peers connected!
            console.log("Peers conngkyjected");
        }
    });
};

