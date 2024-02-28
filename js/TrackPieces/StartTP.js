import { Car } from "../Car.js";
import { RaceRoute } from "../RaceRoute.js";
import { TrackPiece } from "../TrackPiece.js";

export class StartTP extends TrackPiece {
  /**
   * @param {object} parent where to attach created object
   * @param {THREE.Vector3} [startPos] where to position object after spawn
   */
  constructor(parent, startPos) {
    let geometry = new THREE.BoxGeometry(1, 0.03, 1);
    let material = new THREE.MeshStandardMaterial({ color: 0x273832 });
    super(geometry, material, parent, startPos);
    this.name = "Start track piece";
    this.loadModel("models/TrackPieces/Start/Start.glb");
    this.loadTextures({
      startFrom: "texture/TrackPieces/Start/",
      autoNames: true,
    });
    this.rotateY(THREE.MathUtils.degToRad(180));
    this.onCreate();
  }

  onCreate() {
    let offset = 0.13;
    this.offset = { left: offset, right: -offset };
    this.routePoints = this.routePointsSetting(window.devModeRT);
    this.leftCar = null;
    this.rightCar = null;
    this.timer = 0;
    this.connections = this.findConnected();
    this.routes = {
      left: new RaceRoute(this, "left"),
      right: new RaceRoute(this, "right"),
    };
    this.notCalculated = true;
  }

  routePointsSetting(renderPoints) {
    let leftPoints = [
      [this.offset.left, 0, -0.49],
      [this.offset.left, 0, 0],
      [this.offset.left, 0, 0.5],
    ];
    let rightPoints = [
      [this.offset.right, 0, -0.49],
      [this.offset.right, 0, 0],
      [this.offset.right, 0, 0.5],
    ];
    return {
      left: this.displayHelperPoints(this, leftPoints, renderPoints, 0xff0000),
      right: this.displayHelperPoints(this, rightPoints, renderPoints),
    };
  }

  onMouseClick(type = null) {
    let objectType = type || window.tile_object_type;
    if (objectType == "Car") this.addCar();
    else {
      if (!keyboard.pressed("R")) {
        this.leftCar?.onMouseClick?.();
        this.rightCar?.onMouseClick?.();
      }
      super.onMouseClick();
    }
  }

  addCar() {
    if (!this.leftCar) {
      this.leftCar = new Car(
        this.routes.left,
        this,
        new THREE.Vector3(this.offset.left, 0, -0.49)
      );
    } else if (!this.rightCar) {
      this.rightCar = new Car(
        this.routes.right,
        this,
        new THREE.Vector3(this.offset.right, 0, -0.49)
      );
    }
  }

  update(delta) {
    if (window.appMode && this.notCalculated) {
      this.calculateRoute();
      this.notCalculated = false;
    } else if (!window.appMode) {
      this.notCalculated = true;
    }
  }

  calculateRoute() {
    this.updateConnections();
    this.updateRoutes();
  }

  removeCar(car) {
    if (car.assignedRoute == this.routes.left) this.leftCar = null;
    else this.rightCar = null;
    this.remove(car);
  }
}
