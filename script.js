<script type="module">
  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-analytics.js";
  
  const firebaseConfig = {
    apiKey: "AIzaSyCb9k3GJPoykO1QQiiteSKdRFYFwYqCRkU",
    authDomain: "christmas-tree-67873.firebaseapp.com",
    databaseURL: "https://christmas-tree-67873-default-rtdb.firebaseio.com",
    projectId: "christmas-tree-67873",
    storageBucket: "christmas-tree-67873.firebasestorage.app",
    messagingSenderId: "1030522218712",
    appId: "1:1030522218712:web:6b01f57afd9a1b8eff8fad",
    measurementId: "G-GF6YYKBJBQ"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
</script>

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
