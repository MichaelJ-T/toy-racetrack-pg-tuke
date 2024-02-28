import { BaseObject } from "./BaseObject.js";

export class TrackPiece extends BaseObject {
  /**
   * @param {object} geometry  what to geometry to use
   * @param {object} material  what to material to use
   * @param {object} parent where to attach created object
   * @param {THREE.Vector3} startPos where to position object after spawn
   * @param {THREE.Vector3} startScale how to scale object after spawn
   */
  constructor(geometry, material, parent, startPos, startScale) {
    super(geometry, material, parent, startPos, startScale);
    this.castShadow = true;
    this.receiveShadow = true;
    if (this.material.map) this.material.map.anisotropy = 8;
  }

  onMouseClick() {
    if (keyboard.pressed("R")) {
      this.rotate();
      this.updateConnections(this.connections);
      this.updateRoutes();
    } else {
      this.parent.killChild(() => {
        this.connections.start?.updateConnections();
        this.connections.end?.updateConnections();
      });
    }
  }

  onMouseHover() {}

  rotate() {
    this.rotateOnWorldAxis(
      new THREE.Vector3(0, 1, 0),
      THREE.MathUtils.degToRad(-90)
    );
  }

  updateConnections(connections) {
    if (connections) {
      this.connections.start?.updateConnections();
      this.connections.end?.updateConnections();
    }
    this.connections = this.findConnected(false);
  }

  /**
   * Returns {start: x, end: y} x,y are track piece directly connected with left track
   * @param {boolean} [tryFlip=true] if method should try to rotate (90deg) track piece
   * @param {number} [numberOfRotations] keeps number of rotations that already happened,
   * when tryFlip is enabled
   * @returns Object
   */
  findConnected(tryFlip = true, numberOfRotations = 0) {
    let connections = { start: null, end: null };
    let tiles = Object.values(this.parent.adjacentTiles);

    let thisEnter = this.routePoints.left[0];
    thisEnter = thisEnter.getWorldPosition(new THREE.Vector3());
    thisEnter = thisEnter.toArray();
    let thisExit = this.routePoints.left.at(-1);
    thisExit = thisExit.getWorldPosition(new THREE.Vector3());
    thisExit = thisExit.toArray();

    tiles = tiles.filter((elem) => elem?.children[0]);
    tiles.forEach((element) => {
      let otherPoints = element.children[0].routePoints;

      let otherEnter = otherPoints.left[0];
      otherEnter = otherEnter.getWorldPosition(new THREE.Vector3());
      otherEnter = otherEnter.toArray();

      if (this.arraysEqual(thisExit, otherEnter)) {
        connections.end = element.children[0];
        element.children[0].connections.start = this;
      } else {
        let otherExit = otherPoints.left.at(-1);
        otherExit = otherExit.getWorldPosition(new THREE.Vector3());
        otherExit = otherExit.toArray();
        if (this.arraysEqual(thisEnter, otherExit)) {
          connections.start = element.children[0];
          element.children[0].connections.end = this;
        }
      }
    });

    if (tryFlip && tiles && !(connections.start || connections.end)) {
      let tryFlipAgain = numberOfRotations < 3 ? true : false;
      this.rotateY(THREE.MathUtils.degToRad(90));
      return this.findConnected(tryFlipAgain, numberOfRotations + 1);
    }
    return connections;
  }

  updateRoutes() {
    if (!this.routes) return;
    Object.values(this.routes).forEach((route) => {
      route.generateRoute();
      if (window.devModeRT) route.renderCurve();
    });
  }
}
