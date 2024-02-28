import { Grid } from "./Grid.js";
import { StaticObject } from "./StaticObject.js";

var interval = 1 / 60;
var clock = new THREE.Clock();
var delta = 0;
var camera, scene, renderer, controls, currentlyHovering, spotLight, hemiLight;
var raycaster,
  mouse = { x: 0, y: 0 };
window.perspectiveCamera = true;
window.tile_object_type = "Straight";
window.alreadyLoadedTextures = {};
window.keyboard = new THREEx.KeyboardState();
window.alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
window.appMode = 0;
window.devModeRT = false;

function start() {
  basicStartSetup();
  addLights();
  let desk = new StaticObject(scene, "Desk");
  desk.position.set(4.5, -2.5, 3);
  controls.target = desk.position.clone();
  new StaticObject(scene, "Penholder", {
    materials: true,
    loader: "fbx",
  }).position.set(-2, -1, 0);
  window.grid = new Grid(10, 7, scene);
}

function update() {
  requestAnimationFrame(update);
  delta += clock.getDelta();

  if (delta > interval) {
    callCurrentlyHovered();
    scene.traverse((child) => {
      if (typeof child.update === "function") child.update(delta);
    });
    controls.update();
    renderer.render(scene, camera);
    delta = delta % interval;
  }
}

function addLights() {
  scene.add(new THREE.AmbientLight(0xffffff, 0.2));
  hemiLight = new THREE.HemisphereLight(0xfff8f2, 0x080820, 0.8);
  hemiLight.position.setY(9);
  hemiLight.position.setX(6);
  scene.add(hemiLight);
  //scene.add(new THREE.HemisphereLightHelper(hemiLight));

  spotLight = new THREE.PointLight(0xfff8f2, 0.8);
  spotLight.castShadow = true;
  spotLight.shadow.bias = -0.0001;
  spotLight.shadow.mapSize.width = 4096 * 1;
  spotLight.shadow.mapSize.height = 4096 * 1;
  spotLight.position.setY(9);
  spotLight.position.setX(6);
  scene.add(spotLight);
}

if (THREE.WEBGL.isWebGLAvailable()) {
  start();
  update();
} else {
  const warning = THREE.WEBGL.getWebGLErrorMessage();
  document.getElementById("canvas1").appendChild(warning);
}

function basicStartSetup() {
  rendererSetup();
  domElementsSetup();
  sceneSetup();
  cameraSetup(window.perspectiveCamera);

  raycaster = new THREE.Raycaster();
}

function sceneSetup() {
  scene = new THREE.Scene();
  scene.background = new THREE.TextureLoader().load("./texture/space.jpg");
  window.scene = scene;
}

function cameraSetup(usePerspective = true, useOldProps = false) {
  let oldProps = {};
  let w = window.innerWidth;
  let h = window.innerHeight;
  let viewSize = h;
  let aspectRatio = w / h;
  if (useOldProps) {
    oldProps = {
      position: camera.position,
      target: controls.target,
    };
  }
  if (usePerspective) {
    let camPerspSettings = {
      fov: 80,
      aspectRatio: aspectRatio,
      near: 0.1,
      far: 1000,
    };

    camera = new THREE.PerspectiveCamera(
      camPerspSettings.fov,
      camPerspSettings.aspectRatio,
      camPerspSettings.near,
      camPerspSettings.far
    );
  } else {
    let camOrthoSettings = {
      viewSize: viewSize,
      aspectRatio: aspectRatio,
      left: (-aspectRatio * viewSize) / 150,
      right: (aspectRatio * viewSize) / 150,
      top: viewSize / 150,
      bottom: -viewSize / 150,
      near: -100,
      far: 100,
    };

    camera = new THREE.OrthographicCamera(
      camOrthoSettings.left,
      camOrthoSettings.right,
      camOrthoSettings.top,
      camOrthoSettings.bottom,
      camOrthoSettings.near,
      camOrthoSettings.far
    );
  }

  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.update();
  if (useOldProps) {
    camera.position.set(...oldProps.position.clone().toArray());
    controls.target = oldProps.target.clone();
  } else camera.position.set(4.5, 5, 5);
}

function rendererSetup() {
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.shadowMap.enabled = true;
  /* //hdr tonemapping
  renderer.toneMapping = THREE.ReinhardToneMapping;
  renderer.toneMappingExposure = 2.3;*/
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function domElementsSetup() {
  window.playersTable = document.body.querySelector("#Players");
  document.body.appendChild(renderer.domElement);
  if (window.devModeRT) {
    let fpsButton = document.body.querySelector("#fpsSwitch");
    fpsButton.addEventListener("click", changeFps, false);
    fpsButton.classList.toggle("hidden");
  }
  // HUD buttons setup
  let startButton = document.body.querySelector("#Start");
  startButton.addEventListener(
    "click",
    () => {
      document.body
        .querySelector(`#${window.tile_object_type}`)
        .classList.toggle("activeButton");
      window.tile_object_type = "Start";
      startButton.classList.toggle("activeButton");
    },
    false
  );
  let straightButton = document.body.querySelector("#Straight");
  straightButton.addEventListener(
    "click",
    () => {
      document.body
        .querySelector(`#${window.tile_object_type}`)
        .classList.toggle("activeButton");
      window.tile_object_type = "Straight";
      straightButton.classList.toggle("activeButton");
    },
    false
  );

  let rightButton = document.body.querySelector("#Right");
  rightButton.addEventListener(
    "click",
    () => {
      document.body
        .querySelector(`#${window.tile_object_type}`)
        .classList.toggle("activeButton");
      window.tile_object_type = "Right";
      rightButton.classList.toggle("activeButton");
    },
    false
  );
  let leftButton = document.body.querySelector("#Left");
  leftButton.addEventListener(
    "click",
    () => {
      document.body
        .querySelector(`#${window.tile_object_type}`)
        .classList.toggle("activeButton");
      window.tile_object_type = "Left";
      leftButton.classList.toggle("activeButton");
    },
    false
  );
  let playButton = document.body.querySelector("#Play");
  playButton.addEventListener(
    "click",
    () => {
      document.body
        .querySelectorAll(".buildModeButtons, .playersTable")
        .forEach((elem) => elem.classList.toggle("hidden"));
      if (playButton.innerHTML == "Stop") {
        playButton.innerHTML = "Play";
        window.appMode = 0;
        document.body.querySelector("#NumberOfLaps").innerHTML = window.laps;
      } else {
        window.laps =
          parseInt(document.body.querySelector("#NumberOfLaps").innerHTML) || 3;
        window.appMode = 1;
        playButton.disabled = true;
        playButton.classList.toggle("playCountdown");
        playButton.innerHTML = "3";
        window.availableTrophies = [
          "10th",
          "9th",
          "8th",
          "7th",
          "6th",
          "5th",
          "4th",
          "3rd",
          "2nd",
          "1st",
        ];
        setTimeout(() => {
          playButton.innerHTML = "2";
          setTimeout(() => {
            playButton.innerHTML = "1";
            setTimeout(() => {
              playButton.classList.toggle("playCountdown");
              playButton.innerHTML = "Stop";
              playButton.disabled = false;
              window.appMode = 2;
            }, 1000);
          }, 1000);
        }, 1000);
      }
      playButton.classList.toggle("stopButtonStyle");
      window.grid.tiles.forEach((row) =>
        row.forEach((tile) => tile.onToggleVisibility())
      );
    },
    false
  );
  let carButton = document.body.querySelector("#Car");
  carButton.addEventListener(
    "click",
    () => {
      document.body
        .querySelector(`#${window.tile_object_type}`)
        .classList.toggle("activeButton");
      window.tile_object_type = "Car";
      carButton.classList.toggle("activeButton");
    },
    false
  );
  let cameraButton = document.body.querySelector("#CamSwitch");
  cameraButton.addEventListener(
    "click",
    () => {
      window.perspectiveCamera = !window.perspectiveCamera;
      cameraSetup(window.perspectiveCamera, true);
    },
    false
  );
  let trashButton = document.body.querySelector("#Trash");
  trashButton.addEventListener(
    "click",
    () => {
      if (window.grid) {
        window.grid.children.forEach((tile) => {
          tile.killChild();
        });
      }
    },
    false
  );
  renderer.domElement.addEventListener("mousemove", onMouseMoveRay, false);
  renderer.domElement.addEventListener("click", onMouseClick, false);
  window.addEventListener(
    "resize",
    () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      cameraSetup(window.perspectiveCamera, true);
    },
    false
  );
}

function onMouseMoveRay(e) {
  if (window.appMode != 0) return;
  //1. sets the mouse position with a coordinate system where the center
  //   of the screen is the origin
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  //2. set the picking ray from the camera position and mouse coordinates
  raycaster.setFromCamera(mouse, camera);
  //3. compute intersections (no 2nd parameter true anymore)
  var intersects = raycaster.intersectObjects(scene.children);
  if (currentlyHovering !== intersects[0]?.object) {
    currentlyHovering?.object?.onMouseExit?.();
    intersects[0]?.object?.onMouseEnter?.();
    currentlyHovering = intersects[0];
  }
}

function callCurrentlyHovered() {
  currentlyHovering?.object?.onMouseHover?.();
}

function onMouseClick(e) {
  if (window.appMode != 0) return;
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  var intersects = raycaster.intersectObjects(scene.children);
  for (let idx = 0; idx < intersects.length; idx++) {
    if (intersects[idx]?.object?.onMouseClick) {
      intersects[idx]?.object?.onMouseClick?.();
      //console.log(intersects[idx]);
      return;
    }
  }
}

function changeFps() {
  if (interval < 1 / 5) interval = 1 / 5;
  else interval = 1 / 240;
}
