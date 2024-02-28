import { TrackPiece } from "./TrackPiece.js";

export class RaceRoute {
  constructor(parent, lane) {
    this.quality = 20;
    this.path = new THREE.CurvePath();
    this.parent = parent;
    this.lane = lane;
  }

  /**
   * Returns a vector for a given position on the curve.
   * @param {Float} t A position on the curve. Must be in the range [ 0, length ].
   * @param {Integer} length
   */
  getPoint(t, length) {
    let curveLength = length || this.points.length;
    let startIndex = Math.round(t);
    let remainder = t - startIndex;
    let endIndex = startIndex + 1 < curveLength ? startIndex + 1 : 0;

    let resultPoint = new THREE.Vector3();
    resultPoint.lerpVectors(
      this.points[startIndex],
      this.points[endIndex],
      remainder
    );
    return resultPoint;
  }

  getTangent(t, length, optionalTarget) {
    let startIndex = Math.round(t);
    let endIndex = startIndex + 1 < length ? startIndex + 1 : 0;

    const pt1 = this.getPoint(startIndex);
    const pt2 = this.getPoint(endIndex);
    const tangent = optionalTarget || new THREE.Vector3();
    tangent.copy(pt2).sub(pt1).normalize();
    return tangent;
  }

  /**
   * Generate route from starting point,
   * using constraints points from track TrackPieces
   */
  generateRoute() {
    this.path = new THREE.CurvePath();
    let start = this.parent;
    let nextPiece = start;
    if (!nextPiece) return;
    do {
      let side = this.lane;
      let startPoint = nextPiece.routePoints[side][0].getWorldPosition(
        new THREE.Vector3()
      );
      let controlPoint = nextPiece.routePoints[side][1].getWorldPosition(
        new THREE.Vector3()
      );
      let endingPoint = nextPiece.routePoints[side][2].getWorldPosition(
        new THREE.Vector3()
      );

      this.parent.worldToLocal(startPoint);
      this.parent.worldToLocal(controlPoint);
      this.parent.worldToLocal(endingPoint);
      let pathPiece = new THREE.QuadraticBezierCurve3(
        startPoint,
        controlPoint,
        endingPoint
      );
      this.path.add(pathPiece);
      nextPiece = nextPiece.connections.end;
    } while (nextPiece && nextPiece != start);
    this.points = this.getPointsBasedOnLength();
  }
  /**
   * Returns an array of points representing a sequence of curves.
   * The division parameter defines the number of pieces each curve is divided into.
   * However division can be lower when length isn't 1
   * @param {integer} division number of pieces to divide the curve into. Default is 100.
   */
  getPointsBasedOnLength(division = 100) {
    let points = [];
    this.path.curves.forEach((curve) => {
      points = [
        ...points,
        ...curve.getPoints(Math.round(division * curve.getLength())),
      ];
    });
    window.ROUTEPoints = this.points;
    return points;
  }

  renderCurve() {
    this.removeRenderedCurve();
    let material = new THREE.MeshBasicMaterial({
      color: new THREE.Color("hsl(0, 100%, 50%)"),
    });

    let geometry = new THREE.TubeGeometry(
      this.path,
      20 * this.path.curves.length,
      0.02,
      8,
      false
    );
    this.lineObject = new THREE.Mesh(geometry, material);
    this.lineObject.position.setY(0.01);
    this.parent.add(this.lineObject);
  }
  removeRenderedCurve() {
    if (this.lineObject) this.parent.remove(this.lineObject);
  }
}
