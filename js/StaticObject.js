import { BaseObject } from "./BaseObject.js";

export class StaticObject extends BaseObject {
  /**
   *
   * @param {object} parent
   * @param {string} name
   * @param {object} [options]
   * @param {object} [options.startPos]
   * @param {object} [options.startRot]
   * @param {object} [options.pathToModel]
   * @param {object} [options.pathToTextures]
   * @param {object} [options.materials]
   * @param {object} [options.loader] options ["fbx", obj, "" = gltf] only if materials is true
   */
  constructor(
    parent,
    name,
    options = {
      startPos: undefined,
      startRot: undefined,
      pathToTextures: "",
      pathToModel: "",
      materials: false,
      loader: "",
    }
  ) {
    let geometry = new THREE.BoxGeometry(1, 1, 1);
    let material = new THREE.MeshStandardMaterial({
      transparent: true,
      opacity: 0,
      color: 0x273832,
    });
    super(geometry, material, parent, options.startPos, options.startRot);
    this.name = name;
    if (!options.materials) {
      this.loadModel(
        options.pathToModel
          ? options.pathToModel
          : `models/${name}.${options.loader ? options.loader : "glb"}`
      );
      this.loadTextures({
        startFrom: options.pathToTextures
          ? options.pathToTextures
          : `texture/${name}/`,
        autoNames: true,
      });
    } else {
      this.loadModelWithMaterials(
        options.loader,
        options.pathToModel
          ? options.pathToModel
          : `models/${name}.${options.loader ? options.loader : "glb"}`
      );
    }
  }

  loadModel(path, onSuccess, duringLoad, onError) {
    super.loadModel(path, onSuccess, duringLoad, onError);
    this.castShadow = true;
    this.receiveShadow = true;
    if (this.material.map) this.material.map.anisotropy = 16;
  }

  loadModelWithMaterials(loaderName, path, onSuccess, duringLoad, onError) {
    const loader =
      loaderName == "" || loaderName == "gltf"
        ? new THREE.GLTFLoader()
        : loaderName == "fbx"
        ? new THREE.FBXLoader()
        : loaderName == "obj"
        ? new THREE.OBJLoader()
        : new THREE.GLTFLoader();
    loader.load(
      path,
      (object) => {
        onSuccess?.(object);
        let objectToAdd = object;
        try {
          objectToAdd = object.scene.children[0];
        } catch {
          console.log("Adding entire object");
          object.traverse((child) => {
            child.castShadow = true;
            child.receiveShadow = true;
            if (this.material.map) this.material.map.anisotropy = 4;
          });
        }
        this.add(objectToAdd);

        objectToAdd.castShadow = true;
        objectToAdd.receiveShadow = true;
        if (this.material.map) this.material.map.anisotropy = 4;
      },
      (xhr) => {
        duringLoad?.(xhr);
        console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
      },
      (error) => {
        onError?.(error);
        console.log(error);
      }
    );
  }
}
