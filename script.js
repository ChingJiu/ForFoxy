/* ============= Firebase Setup ============= */
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT.firebaseio.com",
  projectId: "YOUR_PROJECT",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "xxxx",
  appId: "xxxx"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

/* JSON storage location */
const ornamentsRef = db.ref("ornaments_shared");

/* ============= Drag & Drop ============= */

const treeContainer = document.getElementById("tree-container");

document.querySelectorAll(".ornament").forEach(o => {
  o.addEventListener("dragstart", e => {
    e.dataTransfer.setData("type", e.target.dataset.type);
  });
});

treeContainer.addEventListener("dragover", e => e.preventDefault());

treeContainer.addEventListener("drop", e => {
  e.preventDefault();

  const type = e.dataTransfer.getData("type");
  const x = e.offsetX;
  const y = e.offsetY;

  const id = "ornament_" + Date.now();

  const ornamentData = { id, type, x, y };

  ornamentsRef.child(id).set(ornamentData);
});

/* ============= Render ornaments ============= */

function renderOrnament({ id, type, x, y }) {
  const img = document.createElement("img");
  img.src = `ornaments/${type === 'star' ? 'star.png' :
                         type === 'red' ? 'bauble-red.png' :
                         type === 'blue' ? 'bauble-blue.png' :
                         type === 'candy' ? 'candy.png' :
                                            'bell.png'}`;

  img.classList.add("placed");
  img.style.left = x + "px";
  img.style.top = y + "px";
  img.id = id;

  treeContainer.appendChild(img);
}

/* Update for all users in real time */
ornamentsRef.on("child_added", snapshot => {
  renderOrnament(snapshot.val());
});
