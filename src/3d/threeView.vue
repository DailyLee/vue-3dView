/**
*  @Description:封装three.js；展示obj模型的组件
*  @author  daili
*  @date  2019-06-20
*/
<template>
    <div class="warp" id="webGlWarp">
        <canvas id="webGl"></canvas>
        <img src="https://du.hupucdn.com/news_byte1787byte_44e19711b38a1dc8d2fae1ba9bdf214e_w32h32.gif"
             v-show="isLoading">
    </div>
</template>
<script>
    import God from './God'
    import * as THREE from 'three'

    let god = null
    let myModel = null
    export default {
        name: 'threeView',
        data() {
            return {
                ratio: 1,
                isLoading: true,
            }
        },
        props: {
            model: {
                type: Object,
                default() {
                    return { mtl: '', model: '', jpg: [], mtlName: '', jpgName: '' }
                },
            },
            padding: {
                type: Object,
                default() {
                    return { top: 40, left: 80 }
                },
            },
            config: {
                type: Object,
                default() { return { useControl: true, orthographicCamera: true, PerspectiveCamera: false, usePadding: false } },
            }
        },

        watch: {
            config: function(value) {
                if (value.useControl) god.controls = god.initControls()
                if (value.PerspectiveCamera) god.camera = god.initPerspectiveCamera()
            },
            model: function(value) {
                god.remove(myModel)
                myModel = null
                this.loadModel(value)
            }
        },
        mounted() {
            const canvas = document.querySelector('#webGl')
            god = new God(canvas)

            if (this.config.perspectiveCamera) {
                god.camera = god.initPerspectiveCamera()
            } else {
                god.camera = god.initOrthographicCamera()
            }

            if (this.config.useControl) god.controls = god.initControls()

            this.loop()

            this.loadModel(this.model)
        },
        methods: {
            shot() {
                let image = new Image()
                image.crossOrigin = ''
                god.renderer.render(god.scene, god.camera)

                // toImage
                image.src = god.canvas.toDataURL('image/png')

                return image
            },
            loadModel(value) {
                if (value.obj && value.mtl) {
                    this.isLoading = true

                    // 加载file
                    if (value.jpg) {
                        window.URL = window.URL || window.webkitURL

                        let reader = new FileReader()
                        reader.readAsText(value.mtl)
                        reader.onload = () => {
                            // 替换mtl文件里面贴图文件的url为jpg文件地址url
                            let text = reader.result
                            for (let key of Object.keys(value.jpg)) {
                                let jpgUrl = window.URL.createObjectURL(value.jpg[key])
                                let regExp = new RegExp(key, 'g');
                                text = text.replace(regExp, jpgUrl)
                            }

                            value.mtl = new File([new Blob([text])], value.mtlName)

                            let urls = {
                                model: window.URL.createObjectURL(value.obj),
                                mtl: window.URL.createObjectURL(value.mtl),
                                jpg: value.jpg,
                            }

                            god.loadModel({
                                obj: `${urls.model}`,
                                mtl: `${urls.mtl}`,
                                jpg: `${urls.jpg}`,
                                path: ''
                            }).then(this.onModelLoad)
                        }
                    } else {
                        // 加载url
                        god.loadModel({
                            obj: `${value.obj}`,
                            mtl: `${value.mtl}`,
                            path: `${value.path}`
                        }).then(this.onModelLoad)
                    }
                }
            },
            onModelLoad(model) {
                // let boxHelper = new THREE.BoxHelper(model, 0xff0000);
                // let axesHelper = new THREE.AxesHelper(5);
                // let cameraHelper = new THREE.CameraHelper(god.camera);
                //
                //  god.scene.add(cameraHelper)
                // god.scene.add(boxHelper)
                // god.scene.add(axesHelper)
                myModel = model

                if (model) {
                    this.ratio = (
                        god.width - 2 * this.padding.left) / god.width;

                    model.position.copy(new THREE.Vector3(0, 0, 0))

                    // 缩放模型到合适的尺寸
                    this.scaleModel(model, god.camera, this.ratio)

                    // 移动模型到对应位置
                    if (this.config.usePadding) {
                        this.adjustModelPosition(model)
                    }
                }

                // 将模型添加到场景当中
                god.scene.add(model)

                this.$emit('onLoad', model)

                this.isLoading = false
            },
            adjustModelPosition(model) {
                let bBox = new THREE.Box3().setFromObject(model);

                let height = bBox.getSize(new THREE.Vector3()).y;
                let width = bBox.getSize(new THREE.Vector3()).x;

                let fullHeight = (god.height / god.width) * (width / this.ratio)

                let paddingTop = (this.padding.top / god.height) * fullHeight

                let distance = ((fullHeight - height) / 2 - paddingTop)
                model.translateOnAxis(new THREE.Vector3(0, 1, 0), distance)
            },
            scaleModel(model, camera, ratio) {
                if (!model) return
                if (camera instanceof THREE.OrthographicCamera) {
                    return this.scaleModelOrthographicCamera(model, camera, ratio)
                } else if (camera instanceof THREE.PerspectiveCamera) {
                    return this.scaleModelPerspectiveCamera(model, camera, ratio)
                }
            },
            scaleModelOrthographicCamera(model, camera, ratio) {
                let bBox = new THREE.Box3().setFromObject(model);

                let width = bBox.getSize(new THREE.Vector3()).x;

                let scale = (god.width * ratio) / width;

                camera.zoom = scale

                camera.updateProjectionMatrix()

                return scale;
            },
            scaleModelPerspectiveCamera(model, camera, ratio) {
                let aspect = god.width / god.height

                let bBox = new THREE.Box3().setFromObject(model);

                let height = bBox.getSize(new THREE.Vector3()).y;

                let modelAspect = bBox.getSize(new THREE.Vector3()).x / height;

                let distance = height / 2 / Math.tan(camera.fov * Math.PI / 360);
                let scale = (
                    camera.position.z / distance);
                if (aspect < modelAspect) {
                    scale = scale * (
                        aspect / modelAspect);
                }
                // 占据屏幕比例
                scale *= ratio;
                model.scale.set(scale, scale, scale);

                return scale;
            },
            loop() {
                this.render()
                this.update()

                window.requestAnimationFrame(
                    this.loop,
                    this.canvas
                )
            },
            render() {
                god.renderer.render(god.scene, god.camera)
            },
            update() {
                god.controls && god.controls.update()
            }
        }
    }
</script>

<style lang='scss' scoped>
    .warp {
        position: relative;
    }

    canvas {
        width: 100%;
        height: 100%;
    }

    img {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translateY(-50%) translateX(-50%);
    }
</style>
