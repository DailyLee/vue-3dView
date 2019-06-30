/**
*  @Description:3dview 展示页面
*  @author  daili
*  @date  2019-04-04
*/
<template>
  <section>
    <three-view class="three" :padding="padding" :config="config" :model="model"
                @onLoad="onLoad"></three-view>
    <a ref="download" class="download" @click="shot">点击下载图片</a>
    <input type="file" multiple id="fileElem" style="display:none" @change="handleFiles">
    <a href="#" class="download" @click="selectFile">选择模型文件</a>
    <span>*注意：一次选择mtl，obj，和jpg文件</span>
    <div class="frame"></div>
  </section>
</template>

<script>
    import threeView from './3d/threeView'
    import * as THREE from 'three'

    export default {
        name: 'index',
        components: { threeView },
        data() {
            return {
                padding: { top: 40, left: 80 },
                model: { obj: '', mtl: '', jpg: '', jpgName: '' },
                config: { useControl: true, perspectiveCamera: false, usePadding: true },
                fileElem: null,
                mtlName: ''
            }
        },
        created() {
            // 去掉php层的滚动条
            if (window.frameElement) {
                const body = window.top.document.querySelector('body');
                if (body) body.style.overflowY = 'hidden';
            }
        },
        mounted() {
            this.fileElem = document.querySelector('#fileElem')

            // init your models
            this.model = {
                obj: 'modelZ.obj',
                mtl: 'modelZ.mtl',
                path: 'http://localhost:8088/assets/models/'
            }
        },
        methods: {
            selectFile() {
                this.fileElem.click();
            },
            handleFiles() {
                let urls = { obj: '', mtl: '', jpg: { } }

                for (let file of this.fileElem.files) {
                    if (file.name.includes('jpg') || file.name.includes('png')) {
                        urls.jpg[file.name] = file
                    }
                    if (file.name.includes('obj') || file.name.includes('OBJ')) {
                        urls.obj = file
                    }
                    if (file.name.includes('mtl')) {
                        urls.mtl = file
                        this.mtlName = file.name
                    }
                }
                this.model = {
                    obj: urls.obj,
                    mtl: urls.mtl,
                    jpg: urls.jpg,
                    mtlName: this.mtlName
                }
            },
            shot() {
                let image = this.$children[0].shot()
                let a = this.$refs.download
                a.href = image.src
                a.download = 'shot'
            },
            onLoad(model) {
                if (model.children.length === 1) {
                    // 如果只有一个子模型 居中显示
                    model.children[0].geometry.center()
                }

                // model.traverse((child) => {
                //     if (child instanceof THREE.Mesh) {
                //         child.material.side = THREE.DoubleSide
                //     }
                // })
            }
        }
    }
</script>

<style lang="scss" scoped>
  @mixin center {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  section {
    position: relative;
    .three {
      width: 900px;
      height: 564px;
    }
    .download {
      margin: 10px;
      padding: 10px;
      display: inline-block;
      line-height: 20px;
      background: #0a8ddf;
      color: #fff;
    }
    .frame {
      pointer-events: none;
      box-sizing: border-box;
      position: absolute;
      top: 40px;
      left: 80px;
      width: 740px;
      height: 524px;
      border: #0a8ddf solid 1px;
    }
  }
</style>
