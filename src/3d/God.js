import * as THREE from 'three';
import { MTLLoader, OBJLoader } from 'three-obj-mtl-loader';
import controls from 'three-orbit-controls'
const OrbitControls = controls(THREE)

export default class God {
    constructor(canvas) {
        this.canvas = canvas;
        let boundingClientRect = this.canvas.getBoundingClientRect();
        this.width = boundingClientRect.width;
        this.height = boundingClientRect.height;
        this.ctx = canvas.getContext('webgl');
        this.renderer = this.initRender();
        this.scene = this.initScene();
        // this.camera = this.initOrthographicCamera();
        this.ambientLight = this.initAmbientLight();
        // this.spotLight = this.initSpotLight([0, 0, 5]);
        // this.DirectionalLight = this.initDirectionalLight([1, 0, 2]);
    }

    initRender() {
        // alpha - canvas是否包含alpha (透明度)。默认为 false
        // antialias - 是否执行抗锯齿。默认为false.
        // precision - highp高精度贴图.
        let renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: false,
            precision: 'highp',
            context: this.ctx,
            canvas: this.canvas
        });

        renderer.setSize(this.width, this.height);

        // 设置颜色及其透明度
        renderer.setClearColor(new THREE.Color(0xffffff));

        renderer.setClearAlpha(1);

        // 开启阴影
        // renderer.shadowMap.enabled = true;

        renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        // 设置设备像素比。通常用于避免HiDPI设备上绘图模糊
        renderer.setPixelRatio(this.canvas.devicePixelRatio);

        // document.body.appendChild(renderer.domElement);

        return renderer;
    }

    initScene() {
        return new THREE.Scene();
    }

    initOrthographicCamera() {
        let width = this.width;
        let height = this.height;

        let camera = new THREE.OrthographicCamera(width / -2, width / 2, height / 2, height / -2, 0.1, 1000);

        camera.position.set(0, 0, 5);

        camera.lookAt(new THREE.Vector3(0, 0, 0));

        return camera;
    }

    initPerspectiveCamera() {
        let aspect = this.width / this.height;

        let camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 100);

        camera.position.set(0, 0, 5);

        camera.lookAt(new THREE.Vector3(0, 0, 0));

        return camera;
    }

    initAmbientLight() {
        // 自然光
        let ambientLight = new THREE.AmbientLight(0xffffff, 2);

        this.scene.add(ambientLight);

        return ambientLight;
    }

    initSpotLight([x, y, z]) {
        // 聚光灯光源
        let spotLight = new THREE.SpotLight(0xffffff, 5, 10);

        spotLight.position.set(x, y, z);

        // 告诉光需要开启阴影投射
        spotLight.castShadow = true;

        // pointLight.shadow.radius = 1;

        spotLight.shadow.mapSize.height = 2048;
        spotLight.shadow.mapSize.width = 2048;

        this.scene.add(spotLight);

        return spotLight;
    }

    initDirectionalLight([x, y, z]) {
        // 灯光源
        let DirectionalLight = new THREE.DirectionalLight(0xffffff, 5, 10);

        DirectionalLight.position.set(x, y, z);

        // 告诉光需要开启阴影投射
        DirectionalLight.castShadow = true;

        // pointLight.shadow.radius = 1;

        DirectionalLight.shadow.mapSize.height = 2048;
        DirectionalLight.shadow.mapSize.width = 2048;

        this.scene.add(DirectionalLight);

        return DirectionalLight;
    }

// 用户交互插件 鼠标左键按住旋转，右键按住平移，滚轮缩放
    initControls() {
        let controls = new OrbitControls(this.camera, this.renderer.domElement);

        // 使动画循环使用时阻尼或自转 意思是否有惯性

        controls.enableDamping = true;

        // 动态阻尼系数 就是鼠标拖拽旋转灵敏度

        // controls.dampingFactor = 0.25;

        // 是否可以缩放

        controls.enableZoom = true;

        // 是否自动旋转

        controls.autoRotate = false;

        // 设置相机距离原点的最近距离

        controls.minDistance = 2;

        // 设置相机距离原点的最远距离

        controls.maxDistance = 10;

        // 是否开启右键拖拽

        controls.enablePan = true;

        // 如果使用animate方法时，将此函数删除

        // controls.addEventListener( 'change', render );

        return controls;
    }

    remove(obj) {
        this.scene.remove(obj)
    }

    loadModel({ obj, mtl, jpg, path }, onProgress) {
        let mtlLoader = new MTLLoader();

        mtlLoader.setCrossOrigin(true);
        mtlLoader.setPath(path);

        return new Promise((resolve, reject) => {
            mtlLoader.load(mtl, (material) => {
                material.preload();

                let objLoader = new OBJLoader();

                // 设置当前加载的纹理
                objLoader.setMaterials(material);

                objLoader.setPath(path);

                objLoader.load(obj,
                    (model) => {
                        // 设置贴图
                        model.traverse((child) => {
                            if (child instanceof THREE.Mesh) {
                                // 开启阴影
                                // child.castShadow = true;
                                // child.receiveShadow = true;

                                // 计算模型box尺寸
                                // child.geometry.computeBoundingBox();
                                // let box = child.geometry.boundingBox;
                                // let maxX = Math.abs(box.max.x);
                                // let minX = Math.abs(box.min.x);
                                // let maxY = Math.abs(box.max.y);
                                // let minY = Math.abs(box.min.y);

                                // if (minX > maxX) {
                                //     // 模型y轴反转
                                //     model.rotation.y = Math.PI;
                                // }

                                // 几何体的哪一面应用这个材质，默认为THREE.FrontSide(正面)，
                                // 还有THREE.BackSide(反面)
                                // 和THREE.DoubleSide(两面)
                                // child.material.side = THREE.DoubleSide;
                                // child.material.side = THREE.BackSide;
                                // child.material.side = THREE.FrontSide;

                                // 深度测试,默认为true,如果设置为false,在场景中远处的对象不被近处的对象遮挡
                                // child.material.depthTest = false;

                                // 设置透明度
                                child.material.transparent = true;
                                child.material.opacity = 1;

                                // 渲染模式（false平滑渲染）
                                child.material.flatShading = false;

                                // 材质反射光的颜色
                                // child.material.emissive.r=0.4;
                                // child.material.emissive.g=0.4;
                                // child.material.emissive.b=0.4;

                                // 修改材质颜色
                                child.material.color = new THREE.Color(0.5, 0.5, 0.5);
                                // child.material.shininess = 1;
                                // child.material.specular = new THREE.Color(0.45, 0.45, 0.45);
                                // child.material.emissive = new THREE.Color(0.45, 0.45, 0.45);
                                // child.material.ambient= new THREE.Color(0.45, 0.45, 0.45);

                                // 渲染成线框
                                // child.material.wireframe = true;

                                // 材质高精度 highp mediump lowp
                                child.material.precision = 'highp';

                                // let aspect = (maxX + minX) / (maxY + minY);
                                // let modalY = Math.max(maxY, minY);
                                // let modalX = Math.max(maxX, minX)
                            }
                        });
                        resolve(model);
                    },
                    (xhr) => {
                        try {
                            onProgress(xhr);
                        } catch (e) {
                            console.log(e)
                        }
                    });
            });
        });
    }
}
