let isAlreadyCalling = false;
let getCalled = false;
const existingCalls = [];
const { RTCPeerConnection, RTCSessionDescription } = window;
const peerConnection = new RTCPeerConnection();
//https://tsh.io/blog/how-to-write-video-chat-app-using-webrtc-and-nodejs/

function unselectUsersFromList() {
  const alreadySelectedUser = document.querySelectorAll(
    ".active-user.active-user--selected"
  );

  alreadySelectedUser.forEach((el) => {
    el.setAttribute("class", "active-user");
  });
}

function updateUserList(socketIds) {
  const activeUserContainer = document.getElementById("active-user-container");

  socketIds.forEach((socketId) => {
    const alreadyExistingUser = document.getElementById(socketId);
    if (!alreadyExistingUser) {
      const userContainerEl = createUserItemContainer(socketId);
      activeUserContainer.appendChild(userContainerEl);
    }
  });
}

function createUserItemContainer(socketId) {
  const userContainerEl = document.createElement("div");

  const usernameEl = document.createElement("a");

  userContainerEl.setAttribute("class", "active-user");
  userContainerEl.setAttribute("id", socketId);
  usernameEl.setAttribute("class", "username");
  usernameEl.innerHTML = `Socket: ${socketId}`;

  userContainerEl.appendChild(usernameEl);
  userContainerEl.addEventListener("click", () => {
    unselectUsersFromList();
    userContainerEl.setAttribute("class", "active-user active-user--selected");
    const talkingWithInfo = document.getElementById("talking-with-info");
    talkingWithInfo.innerHTML = `Talking with: "Socket: ${socketId}"`;
    callUser(socketId);
  });
  let hrTagElement = document.createElement("hr");
  userContainerEl.appendChild(hrTagElement);
  return userContainerEl;
}

async function callUser(socketId) {
  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(new RTCSessionDescription(offer));

  socket.emit("call-user", {
    offer,
    to: socketId,
  });
}

// importScripts
const socket = io.connect("https://videoconfy.herokuapp.com");
//Add new user on Client
socket.on("update-user-list", ({ users }) => {
  updateUserList(users);
});

//Remove user on client
socket.on("remove-user", ({ socketId }) => {
  const elToRemove = document.getElementById(socketId);

  if (elToRemove) {
    elToRemove.remove();
  }
});

socket.on("call-made", async (data) => {
  if (getCalled) {
    const confirmed = confirm(
      `User "Socket: ${data.socket}" wants to call you. Do accept this call?`
    );

    if (!confirmed) {
      socket.emit("reject-call", {
        from: data.socket,
      });

      return;
    }
  }

  await peerConnection.setRemoteDescription(
    new RTCSessionDescription(data.offer)
  );
  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(new RTCSessionDescription(answer));

  socket.emit("make-answer", {
    answer,
    to: data.socket,
  });
  getCalled = true;
});

socket.on("answer-made", async (data) => {
  await peerConnection.setRemoteDescription(
    new RTCSessionDescription(data.answer)
  );

  if (!isAlreadyCalling) {
    callUser(data.socket);
    isAlreadyCalling = true;
  }
});

socket.on("call-rejected", (data) => {
  alert(`User: "Socket: ${data.socket}" rejected your call.`);
  unselectUsersFromList();
});

peerConnection.ontrack = function ({ streams: [stream] }) {
  const remoteVideo = document.getElementById("remote-video");
  if (remoteVideo) {
    remoteVideo.srcObject = stream;
  }
};

var isChrome = !!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime);

console.log(isChrome);

//New version supported in MOzilla and IOS
navigator.mediaDevices.getUserMedia({ video: true, audio: true })
.then(function(stream) {
  /* use the stream */
  const localVideo = document.getElementById("local-video");
    if (localVideo) {
      localVideo.srcObject = stream;
    }
  stream
      .getTracks()
      .forEach((track) => peerConnection.addTrack(track, stream));
})
.catch(function(err) {
  /* handle the error */
});

//Deprecated Version
//navigator.getUserMedia(
//  { video: true, audio: true },
//  (stream) => {
//    const localVideo = document.getElementById("local-video");
 //   if (localVideo) {
 //     localVideo.srcObject = stream;
 //   }
 //   stream
   //   .getTracks()
     // .forEach((track) => peerConnection.addTrack(track, stream));
  //},
  //(error) => {
    //console.log(error);
  //}
//);

// this.io.connection("connection", (socket) => {
//   const existingSocket = this.activeSockets.find(
//     (existingSocket) => existingSocket === socket.id
//   );

//   if (!existingSocket) {
//     this.activeSockets.push(socket.id);

//     socket.emit("update-user-list", {
//       users: this.activeSockets.filter(
//         (existingSocket) => existingSocket !== socket.id
//       ),
//     });
//   }
//   socket.broadcast.emit("update-user-list", {
//     users: [socket.id],
//   });

//   socket.on("update-user-list", ({ users }) => {
//     updateUserList(users);
//   });

//   socket.on("remove-user", ({ socketId }) => {
//     const elToRemove = document.getElementById(socketId);

//     if (elToRemove) {
//       elToRemove.remove();
//     }
//   });

//   socket.on("disconnect", () => {
//     this.activeSockets = this.activeSockets.filter(
//       (existingSocket) => existingSocket !== socket.id
//     );
//     socket.broadcast.emit("remove-user", {
//       socketId: socket.id,
//     });
//   });
// });

$("#menu-toggle").click(function (e) {
  e.preventDefault();
  $("#wrapper").toggleClass("toggled");
});
