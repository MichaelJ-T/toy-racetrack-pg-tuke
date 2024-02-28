export class BaseObject extends THREE.Mesh {
  /**
   * @param {object} geometry  what to geometry to use
   * @param {object} material  what to material to use
   * @param {object} parent where to attach created object
   * @param {THREE.Vector3} [startPos] where to position object after spawn
   * @param {THREE.Vector3} [startScale] how to scale object after spawn
   */
  constructor(
    geometry,
    material,
    parent,
    startPos = new THREE.Vector3(0, 0, 0),
    startScale = new THREE.Vector3(1, 1, 1)
  ) {
    super(geometry, material);
    this.reposition(startPos);
    //this.renderOrder = 1;
    this.rescale(startScale);
    this.deg2rad = Math.PI / 180; // This property is located on every object #wastedMemory
    parent.add(this);
  }

  update(deltaTime) {}

  /**
   * @param {THREE.Vector3} point object will be repositioned to new point
   */
  reposition(point) {
    this.position.copy(point);
  }
  /**
   * @param {THREE.Vector3} dimensions object will be rescaled to new dimensions
   */
  rescale(dimensions) {
    this.scale.copy(dimensions);
  }
  /**
   * @param {string} path — path to a GLTF model.
   * @param {function} onSuccess - replaces a default handler {contains Object}
   * @param {function} duringLoad - replaces default handler
   * @param {function} onError - replaces default handler
   */
  loadModel(path, onSuccess, duringLoad, onError) {
    const loader = new THREE.GLTFLoader();
    loader.load(
      path,
      (object) => {
        if (onSuccess) onSuccess(object);
        else {
          this.geometry.dispose();
          this.geometry = object.scene.children[0].geometry;
          this.geometry.computeTangents();
        }
      },
      (xhr) => {
        if (duringLoad) duringLoad(xhr);
        //else console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
      },
      (error) => {
        if (onError) onError(error);
        console.log(error);
      }
    );
  }

  /**
   * @param {Object} obj - An object.
   * @param {string} [obj.startFrom=""]  - where to start searching for textures.
   * @param {string} [obj.texture] - name or path to the texture [based on startFrom + texturePath].
   * @param {string} [obj.normal] - name or path to the normal map [based on startFrom + normalPath, default is tangient].
   * @param {string} [obj.rough] - name or path to the roughness map [based on startFrom + roughnessPath].
   * @param {string} [obj.ao] - name or path to the ambient occlusion map [based on startFrom + ambientOcclusion].
   * @param {string} [obj.gloss] - name or path to the metalness map [based on startFrom + metalnessMap].
   * @param {boolean} [obj.autoNames=false] - names for all maps will be set automatically based on parameters names + .png.
   * @param {boolean} [obj.useCached=true] - uses cached maps saved in memory instead of loading based on startFrom.
   */
  loadTextures({
    autoNames = false,
    startFrom = "",
    texture = autoNames ? "texture.png" : null,
    normal = autoNames ? "normal.png" : null,
    rough = autoNames ? "rough.png" : null,
    ao = autoNames ? "ao.png" : null,
    gloss = autoNames ? "gloss.png" : null,
    useCached = true,
  }) {
    let loader = new THREE.TextureLoader();
    let settings = {};
    if (useCached && window.alreadyLoadedTextures?.[startFrom]) {
      settings = window.alreadyLoadedTextures?.[startFrom];
      console.log("using Cached");
    } else {
      if (texture) {
        settings.map = loader.load(startFrom + texture);
        settings.map.flipY = false;
      }
      if (normal) {
        settings.normalMapType = THREE.TangentSpaceNormalMap;
        settings.normalMap = loader.load(startFrom + normal);
        settings.normalScale = new THREE.Vector2(1, 1);
        settings.normalMap.flipY = false;
      }
      if (rough) {
        settings.roughnessMap = loader.load(startFrom + rough);
        settings.roughness = 0.85;
        settings.roughnessMap.flipY = false;
      }
      if (ao) {
        settings.aoMap = loader.load(startFrom + ao);
        settings.aoMapIntensity = 0.7;
        settings.aoMap.flipY = false;
      }
      if (gloss) {
        settings.metalnessMap = loader.load(startFrom + gloss);
        settings.metalnessMap.flipY = false;
        settings.metalness = 0.5;
      }
      window.alreadyLoadedTextures[startFrom] = settings;
    }
    let texturedMaterial = new THREE.MeshStandardMaterial(settings);
    this.material = texturedMaterial;
  }

  /**
   * Display route points and any other type of helper points located in scene
   *
   * @param {object} parent where to attach created object
   * @param {Array} pointsArray with [x,y,z] of points
   * @param {Boolean} display if point should be displayed or invisible
   * @param {Number} color what color to use, default: 0xffffff
   * @param {Number} size how big should displayed point be
   * @returns {Array} of THREEjs points
   */
  displayHelperPoints(
    parent,
    pointsArray,
    display = false,
    color = 0xffffff,
    size = 0.04
  ) {
    let materialSp, geometrySp, point;
    if (display) {
      materialSp = new THREE.MeshBasicMaterial({ color: color });
      geometrySp = new THREE.SphereGeometry(size, 5, 5);
    }
    let points = [];
    for (let index = 0; index < pointsArray.length; index++) {
      const element = pointsArray[index];
      if (display) point = new THREE.Mesh(geometrySp, materialSp);
      else point = new THREE.Group();
      point.position.copy(new THREE.Vector3(...element));
      parent.add(point);
      points.push(point);
    }
    return points;
  }

  /**
   * Checks if all array elements are equal
   * @param {array} a
   * @param {array} b
   * @returns {boolean}
   */
  arraysEqual(a, b) {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length !== b.length) return false;

    for (var i = 0; i < a.length; ++i) {
      if (Math.abs(a[i] - b[i]) >= 0.1) return false;
    }
    return true;
  }
}
