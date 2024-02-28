import { BaseObject } from "./BaseObject.js";

export class Car extends BaseObject {
  /**
   * @param {number} assignedRoute what lane
   * @param {object} parent where to attach created object
   * @param {THREE.Vector3} startPos where to reposition object
   * @returns {Object}
   */
  constructor(assignedRoute, parent, startPos) {
    let geometry = new THREE.BoxGeometry(0.1, 0.1, 0.2);
    let material = new THREE.MeshStandardMaterial({
      transparent: true,
      opacity: 0,
      color: 0xffccee,
    });
    super(geometry, material, parent, startPos);

    //Car Settings
    this.powerButton = this.generateRandomLetter();
    this.velocity = 0;
    this.maxVelocity = Math.random() * 100 + 550;
    this.laps = 0;
    this.color = {
      hue: Math.floor(Math.random() * 360),
      sat: Math.floor(Math.random() * 80 + 20),
      light: Math.floor(Math.random() * 60 + 20),
    };
    this.assignedRoute = assignedRoute;
    this.distanceOnTrack = 0;

    //Shadows
    this.castShadow = true;
    this.receiveShadow = true;
    if (this.material.map) this.material.map.anisotropy = 8;
    this.distanceOnTrack = 0;
    this.loadModel("models/Car.glb");
    //this.rotateY(THREE.MathUtils.degToRad(180));
    /*this.material.color.setStyle(
      `hsl(${this.color.hue}, ${this.color.sat}%, ${this.color.light}%)`
    );*/
    this.htmlSetup();
    this.updateHtml(this.powerButton, this.velocity, this.laps, this.color);
  }

  onMouseClick() {
    window.playersTable.removeChild(this.playerCard);
    window.alphabet += this.powerButton;
    this.parent.removeCar(this);
  }

  update(delta) {
    if (window.appMode == 2) this.movement(delta);
    else {
      if (this.assignedRoute.points) {
        this.distanceOnTrack = 0;
        this.velocity = 0;
        this.laps = 0;
        this.place = "";
        this.exploringWilderness = false;
        this.#rotateToNextPointOnTrack(this.assignedRoute.points.length, delta);
        this.#moveToNextPointOnTrack(this.assignedRoute.points.length, delta);
      }
    }
    this.updateHtml(
      this.powerButton,
      this.velocity / 1000,
      this.laps,
      this.color
    );
  }

  movement(delta) {
    let chanceToFly = Math.abs(THREE.MathUtils.radToDeg(this.rotation.y));
    if (chanceToFly > 20 && chanceToFly < 70 && this.velocity > 500) {
      let chance = Math.random() * 100;
      let penaltyForSpeeding =
        Math.random() * 5 * ((this.velocity - 500) / (this.maxVelocity - 500));
      if (chance < Math.random() * 5 + penaltyForSpeeding) {
        this.exploringWilderness = true;
        setTimeout(() => {
          this.exploringWilderness = false;
          this.velocity = 0;
        }, 1000);
      }
    }

    if (!this.exploringWilderness) {
      //acceleration and friction is in cm/s
      let acceleration =
        this.velocity < this.maxVelocity ? Math.random() * 50 + 100 : 0;
      let friction = (Math.random() * 100 + 450) * delta;

      let length = this.assignedRoute.points.length;
      if (keyboard.pressed(this.powerButton)) {
        this.velocity += acceleration * delta;
      } else {
        this.velocity = this.velocity < 0.05 ? 0 : this.velocity - friction;
      }
      this.distanceOnTrack += this.velocity * delta;

      if (this.distanceOnTrack / (length - 1) >= 1) {
        this.distanceOnTrack -= Math.floor(this.distanceOnTrack);
        this.laps++;
        if (window.laps === this.laps) {
          this.place = window.availableTrophies.pop() || "";
        }
      }
      this.#rotateToNextPointOnTrack(length, delta);
      this.#moveToNextPointOnTrack(length, delta);
    } else {
      this.translateZ((this.velocity / 100) * delta);
    }
  }

  #rotateToNextPointOnTrack(length) {
    /*let tangent = this.assignedRoute.getTangentAt(
      this.distanceOnTrack / length
    );
    tangent.setY(0);
    if (tangent.x === 0) tangent.setX(0.00000001);
    tangent.normalize();
    let desiredAxis = new THREE.Vector3(0, 0, 1);
    let crossV = new THREE.Vector3();
    crossV.crossVectors(desiredAxis, tangent);
    crossV.normalize();
    let radians = Math.acos(desiredAxis.dot(tangent));
    this.quaternion.setFromAxisAngle(crossV, radians);*/
    let futureDistance = this.distanceOnTrack + 3;
    if (futureDistance / (length - 1) >= 1)
      futureDistance -= Math.floor(futureDistance);

    let lookAtPoint = this.assignedRoute.getPoint(futureDistance, length);
    //lookAtPoint.setY(this.position.y);
    this.parent.localToWorld(lookAtPoint);
    this.lookAt(lookAtPoint);
  }

  #moveToNextPointOnTrack(length) {
    let goTo = this.assignedRoute.getPoint(this.distanceOnTrack, length);
    goTo.setY(0);
    this.position.x = goTo.x; //Math.fround(goTo.x - 0.2);
    this.position.z = goTo.z; //Math.fround(goTo.z);
  }

  generateRandomLetter() {
    let randomIdx = Math.floor(Math.random() * alphabet.length);
    let char = window.alphabet[randomIdx];
    window.alphabet = window.alphabet.replace?.(char, "");
    return char;
  }

  loadModel(path, onSuccess, duringLoad, onError) {
    const loader = new THREE.GLTFLoader();
    //const dracoLoader = new THREE.DRACOLoader();
    //dracoLoader.setDecoderPath("three/examples/js/libs/draco/");
    //loader.setDRACOLoader(dracoLoader);
    loader.load(path, (object) => {
      onSuccess?.(object);
      let objectToAdd = object.scene.children[0];
      objectToAdd.traverse((child) => {
        if (["Body", "Sphere", "Sphere.001"].includes(child.name)) {
          child?.material?.color.setStyle(
            `hsl(${this.color.hue}, ${this.color.sat}%, ${this.color.light}%)`
          );
        }
      });
      this.add(objectToAdd);
      objectToAdd.rotateY(THREE.MathUtils.degToRad(-90));
      objectToAdd.scale.copy(new THREE.Vector3(0.07, 0.07, 0.07));
      objectToAdd.position.copy(new THREE.Vector3(0, 0.12, 0));
      objectToAdd.castShadow = true;
      objectToAdd.receiveShadow = true;
    });
  }

  htmlSetup() {
    this.powerButtonElement = document.createElement("div");
    this.velocityElement = document.createElement("div");
    this.positionElement = document.createElement("div");
    this.lapElement = document.createElement("div");
    this.playerInfo = document.createElement("div");
    this.playerInfo.appendChild(this.powerButtonElement);
    this.playerInfo.appendChild(this.velocityElement);
    this.playerInfo.appendChild(this.positionElement);
    this.playerInfo.appendChild(this.lapElement);
    this.playerInfo.classList.add("playerInfo");
    this.playerColor = document.createElement("div");
    this.playerColor.id = "playerColor";
    this.playerCard = document.createElement("div");
    this.playerCard.classList.add("playerCard");
    this.playerCard.appendChild(this.playerColor);
    this.playerCard.appendChild(this.playerInfo);
    this.playerPlacement = document.createElement("h3");
    this.playerPlacement.classList.toggle("hidden");
    this.playerCard.appendChild(this.playerPlacement);
    window.playersTable.appendChild(this.playerCard);
  }

  updateHtml(button, speed, lap = 0, color = 0) {
    this.playerCard.style.background = `hsl(${color.hue}, 20%, 50%)`;
    this.playerColor.style.background = `hsl(${color.hue}, ${color.sat}%, ${color.light}%)`;
    if (this.place) {
      this.playerPlacement.classList.remove("hidden");
      this.playerInfo.classList.add("hidden");
      this.playerPlacement.innerHTML = this.place;
    } else {
      this.playerPlacement.classList.add("hidden");
      this.playerInfo.classList.remove("hidden");
      this.powerButtonElement.innerText = `🎮 - ${button}`;
      this.velocityElement.innerText = `m/s ${Math.round(speed * 100) / 100}`;
      this.lapElement.innerText = `🏁 - ${lap}`;
    }
  }
}
