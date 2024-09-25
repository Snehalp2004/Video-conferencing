// WebRTC variables
let localStream;
let remoteStream;
let pc;
const configuration = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
    ],
};

// HTML elements
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
const startCallButton = document.getElementById('start-call');
const endCallButton = document.getElementById('end-call');
const chatInput = document.getElementById('chat-input');
const chatMessages = document.getElementById('chat-messages');
const sendButton = document.getElementById('send-button');

// Set up local video stream
navigator.mediaDevices
    .getUserMedia({ video: true, audio: true })
    .then((stream) => {
        localVideo.srcObject = stream;
        localStream = stream;
    })
    .catch((error) => {
        console.error('Error accessing the camera and microphone:', error);
    });

// Start a call
startCallButton.addEventListener('click', () => {
    pc = new RTCPeerConnection(configuration);

    // Add the local stream to the peer connection
    localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));

    // Handle incoming data channel for chat
    pc.ondatachannel = (event) => {
        const dataChannel = event.channel;
        dataChannel.onmessage = (event) => {
            const message = event.data;
            appendMessage('Remote: ' + message);
        };
    };

    // Set up the remote video stream
    pc.ontrack = (event) => {
        remoteVideo.srcObject = event.streams[0];
        remoteStream = event.streams[0];
    };
});

// End the call
endCallButton.addEventListener('click', () => {
    if (pc) {
        pc.close();
        remoteVideo.srcObject = null;
        pc = null;
    }
});

// Send a chat message
sendButton.addEventListener('click', () => {
    const message = chatInput.value;
    appendMessage('You: ' + message);

    if (pc && pc.signalingState === 'stable') {
        // Create and send a data channel message
        const dataChannel = pc.createDataChannel('chat');
        dataChannel.onopen = () => {
            dataChannel.send(message);
        };
    }

    chatInput.value = '';
});

// Helper function to append chat messages
function appendMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.textContent = message;
    chatMessages.appendChild(messageElement);
}


// Event listener for ending the call
endCallButton.addEventListener('click', () => {
    if (pc) {
        pc.close();
        remoteVideo.srcObject = null;
        pc = null;
    }

    // Close the browser window or tab
    window.close();
});


// Function to start audio-only call
function startAudioCall() {
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then((stream) => {
            localStream = stream;
            localVideo.srcObject = stream;

            pc = new RTCPeerConnection(configuration);

            localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));

            pc.ondatachannel = (event) => {
                const dataChannel = event.channel;
                dataChannel.onmessage = (event) => {
                    const message = event.data;
                    appendMessage('Remote: ' + message);
                };
            };

            pc.ontrack = (event) => {
                remoteVideo.srcObject = event.streams[0];
                remoteStream = event.streams[0];
            };
        })
        .catch((error) => {
            console.error('Error accessing audio:', error);
        });
}

// Event listener for starting a call
startCallButton.addEventListener('click', () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then((stream) => {
                localStream = stream;
                localVideo.srcObject = stream;

                pc = new RTCPeerConnection(configuration);

                localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));

                pc.ondatachannel = (event) => {
                    const dataChannel = event.channel;
                    dataChannel.onmessage = (event) => {
                        const message = event.data;
                        appendMessage('Remote: ' + message);
                    };
                };

                pc.ontrack = (event) => {
                    remoteVideo.srcObject = event.streams[0];
                    remoteStream = event.streams[0];
                };
            })
            .catch((error) => {
                console.error('Error accessing camera and microphone:', error);
                // If video access is denied, start an audio-only call
                startAudioCall();
            });
    }
});

// ... Rest of the code remains the same
