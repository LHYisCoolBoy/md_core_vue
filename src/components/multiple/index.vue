<template>
  <div class="upload-file">
  <!-- on-preview 点击文件列表中已上传的文件时的钩子 -->
  <!-- http-request 覆盖默认的上传行为，可以自定义上传的实现 -->
  <!-- limit  最大允许上传个数 -->
  <!-- before-upload  上传文件之前的钩子，参数为上传的文件，若返回 false 或者返回 Promise 且被 reject，则停止上传。 -->
  <!-- accept 接受上传的文件类型（thumbnail-mode 模式下此参数无效） -->
  <!-- multiple 是否支持多选文件 -->
  <!-- on-change  文件状态改变时的钩子，添加文件、上传成功和上传失败时都会被调用 -->
  <!-- on-remove  文件列表移除文件时的钩子 -->
  <!-- file-list  上传的文件列表, 例如: [{name: 'food.jpg', url: 'https://xxx.cdn.com/xxx.jpg'}] -->
  <!-- on-exceed  文件超出个数限制时的钩子 -->
  <!-- auto-upload  是否在选取文件后立即进行上传 -->
  <!-- action 必选参数，上传的地址  例如  action="https://jsonplaceholder.typicode.com/posts/"-->
  <el-upload
    drag
    multiple
    :auto-upload="true"
    :http-request="checkedFile"
    :before-remove="removeFile"
    :on-exceed="handleExceed"
    action=""
    :show-file-list="false"
    class="upload-file-uploader"
    ref="elUpload"
  >
    <i class="el-icon-upload"></i>
    <div class="el-upload__text">
      将文件拖到此处，或
      <em>点击上传</em>
    </div>
  </el-upload>
  <el-progress type="circle" :percentage="progress" class="progress" v-if="showProgress"></el-progress>
  <!-- 文件列表 -->
    <transition-group class="upload-file-list el-upload-list el-upload-list--text" name="el-fade-in-linear" tag="ul">
      <li :key="file.uid" class="el-upload-list__item ele-upload-list__item-content" v-for="(file, index) in list">
        <el-link :href="file.url" :underline="false" target="_blank">
          <span class="el-icon-document"> {{ getFileName(file.name) }} </span>
        </el-link>
        <div class="ele-upload-list__item-content-action">
          <el-link :underline="false" @click="handleDelete(index,file)" type="danger">删除</el-link>
        </div>
      </li>
    </transition-group>
</div>
</template>
  <script>
import axios from "axios";
import SparkMD5 from "spark-md5";
export default {
  props:{
      // 值
      value: [String, Object, Array],
  },
  computed:{
      list() {
        let temp = 1;
        if (this.value) {
          // 首先将值转为数组
          const list = Array.isArray(this.value) ? this.value : [this.value];
          // 然后将数组转为对象数组
          return list.map((item) => {
            if (typeof item === "string") {
              item = { name: item, url: item };
            }
            item.uid = item.uid || new Date().getTime() + temp++;
            return item;
          });
        }else{
          if(this.valueCopy.length){
            const list = Array.isArray(this.valueCopy) ? this.valueCopy : [this.valueCopy];
            // 然后将数组转为对象数组
            return list.map((item) => {
              if (typeof item === "string") {

                item = { name: item, url: item };
              }
              item.uid = item.uid || new Date().getTime() + temp++;
              return item;
            });
          }
        }
    },
  },
  data() {
    return {
      maxSize: 20 * 1024 * 1024 * 1024, // 上传最大文件限制  最小单位是b
      multiUploadSize: 20 * 1024 * 1024, // 大于这个大小的文件使用分块上传(后端可以支持断点续传)  100mb
      eachSize: 20 * 1024 * 1024, // 每块文件大小   100mb
      requestCancelQueue: [], // 请求方法队列（调用取消上传
      url: "/tools/upload_test/",
       //上传进度
      progress: 0,
      showProgress: false,
      // 每上传一块的进度
      eachProgress: 0,
      // 总共有多少块。断点续传使用
      chunksKeep:0,
      // 切割后的文件数组
      fileChunksKeep:[],
      // 这个文件，断点续传
      fileKeep:null,
      valueCopy:[],
    };
  },
  mounted() {
    console.log(this.fileChunksKeep,"fileChunksKeep")
  },
  methods: {
    //保存文件相关处理
    saveFile(){
      let urlList = ''
      if(this.value){
        const list = Array.isArray(this.value) ? this.value : [this.value];
        list.map((item,index) => {
          if (typeof item === "string") {
            item = { name: item, url: item };
          }
          if((list.length - 1) == index){
            urlList += item.url
          }else{
            urlList += item.url + ','
          }
        });
      }else if(this.valueCopy.length>0){
        this.valueCopy.forEach((item,index)=>{
          if((this.valueCopy.length - 1) == index){
            urlList += item.url
          }else{
            urlList += item.url + ','
          }
        })
      }
      console.log(urlList,"urlList")
      this.$emit("input", urlList)
    },
    // 获取文件名称
    getFileName(name) {
      if (name.lastIndexOf("/") > -1) {
        return name.slice(name.lastIndexOf("/") + 1).toLowerCase();
      } else {
        return "";
      }
    },
    // 删除文件
    handleDelete(index,file) {
      console.log(index,file,"weqeqeqeqwe")
      if(index != 0 && !index){
        return
      }
      if(this.valueCopy.length){
        this.valueCopy.splice(index,1)
      }else if(Array.isArray(this.value)){
        this.value.splice(index,1)
      }
      console.log(file,"file")
      this.saveFile()
      this.$refs.elUpload.clearFiles()
    },
    // 文件个数超出
    handleExceed() {
      this.$message.warning(`只允许上传单个文件`);
    },
    async checkedFile(options) {
      console.log(options);
      const {
        maxSize,
        multiUploadSize,
        getSize,
        splitUpload,
        singleUpload
      } = this; // 解构赋值
      const { file, onProgress, onSuccess, onError } = options; // 解构赋值
      if (file.size > maxSize) {
        return this.$message({
          message: `您选择的文件大于${getSize(maxSize)}`,
          type: "error"
        });
      }
      this.fileKeep = file
      const uploadFunc =
        file.size > multiUploadSize ? splitUpload : singleUpload; // 选择上传方式
      try {
        await uploadFunc(file, onProgress);
        this.$message({
          message: "上传成功",
          type: "success"
        });
        this.showProgress = false;
        this.progress = 0;
        onSuccess();
      } catch (e) {
        console.error(e);
        this.$message({
          message: e.message,
          type: "error"
        });
        this.showProgress = false;
        this.progress = 0;
        onError();
      }
      const prom = new Promise((resolve, reject) => {}); // 上传后返回一个promise
      prom.abort = () => {};
      return prom;
    },
    // 格式化文件大小显示文字
    getSize(size) {
      return size > 1024
        ? size / 1024 > 1024
          ? size / (1024 * 1024) > 1024
            ? (size / (1024 * 1024 * 1024)).toFixed(2) + "GB"
            : (size / (1024 * 1024)).toFixed(2) + "MB"
          : (size / 1024).toFixed(2) + "KB"
        : size.toFixed(2) + "B";
    },
    // 单文件直接上传
   async singleUpload(file, onProgress) {
      await this.postFile(
        { file, uid: file.uid, fileName: file.fileName ,chunk:0},
        onProgress
      );
      var spark = new SparkMD5.ArrayBuffer();
      spark.append(file);
      var md5 = spark.end();
      console.log(md5);
      const formData = new FormData();
      formData.append('deptId', this.$store.getters.userInfo.deptId)
      formData.append('guid',file.uid)
      formData.append('fileName',file.name)
      axios.post('http://core.mdgp.cn/ydisk/merge', formData).then(res=>{
              let some = this.valueCopy.some(item=>{
                console.log(file,"fileChunks[array[i]]fileChunks[array[i]]")
                return item.url == res.data.data
              })
              if(!some || this.valueCopy.length == 0){
                this.valueCopy.push({name:res.data.data,url:res.data.data,uid:file.uid})
              }
              this.saveFile()
      })
    },
    // 大文件分块上传
    splitUpload(file, onProgress) {
      console.log('file11')
      console.log(file)
      return new Promise(async (resolve, reject) => {
        try {
          const { eachSize } = this;
          const chunks = Math.ceil(file.size / eachSize);
          this.chunksKeep = chunks
          const fileChunks = await this.splitFile(file, eachSize, chunks);
          this.fileChunksKeep = fileChunks
          console.log('fileChunks,文件数组切割后')
          console.log(fileChunks)
          //判断每上传一个文件，进度条涨多少,保留两位小数

          this.eachProgress = parseInt(Math.floor(100 / chunks * 100) / 100);

          this.showProgress = true;
          let currentChunk = 0;
          for (let i = 0; i < fileChunks.length; i++) {
            // 服务端检测已经上传到第currentChunk块了，那就直接跳到第currentChunk块，实现断点续传
            console.log(currentChunk, i);
            // 此时需要判断进度条

            if (Number(currentChunk) === i) {
              // 每块上传完后则返回需要提交的下一块的index
               await this.postFile(
                {
                  chunked: true,
                  chunk: i,
                  chunks,
                  eachSize,
                  fileName: file.name,
                  fullSize: file.size,
                  uid: file.uid,
                  file: fileChunks[i]
                },
                onProgress
              );
              currentChunk++

              // 上传完一块后，进度条增加
              this.progress += this.eachProgress;
              // 不能超过100
              this.progress = this.progress > 100 ? 100 : this.progress;
            }
          }
          var spark = new SparkMD5.ArrayBuffer();
          spark.append(file);
          var md5 = spark.end();
          console.log(md5);
          const formData = new FormData();
          formData.append('deptId', this.$store.getters.userInfo.deptId)
          formData.append('guid',file.uid)
          formData.append('fileName',file.name)
          axios.post('http://core.mdgp.cn/ydisk/merge', formData).then(res=>{
            console.log(res.data.data,"res.data.datares.data.datares.data.data")
            this.$emit("input", res.data.data)
              let some = this.valueCopy.some(item=>{
                console.log(file,"fileChunks[array[i]]fileChunks[array[i]]")
                return item.url == res.data.data
              })
              if(!some || this.valueCopy.length == 0){
                this.valueCopy.push({name:res.data.data,url:res.data.data,uid:file.uid})
              }
              this.saveFile()
          })
          resolve();
        } catch (e) {
          reject(e);
        }
      });
    },
    // againSplitUpload(file, array) {
    //   console.log('file,array')
    //   console.log(file)
    //   console.log(array)
    //   return new Promise(async (resolve, reject) => {
    //     try {
    //       const { eachSize , fileKeep } = this;
    //       const chunks = this.chunksKeep
    //       const fileChunks = this.fileChunksKeep
    //       this.showProgress = true;
    //       // let currentChunk = 0;
    //       for (let i = 0; i < array.length; i++) {
    //         // 服务端检测已经上传到第currentChunk块了，那就直接跳到第currentChunk块，实现断点续传
    //         // console.log(currentChunk, i);
    //         // 此时需要判断进度条
    //           // 每块上传完后则返回需要提交的下一块的index
    //            await this.postFile(
    //             {
    //               chunked: true,
    //               chunk: array[i],
    //               chunks,
    //               fileName: file.fileName,
    //               fullSize: fileKeep.size,
    //               uid: file.uid,
    //               file: fileChunks[array[i]]
    //             },
    //           );
    //           // currentChunk++
    //           // 上传完一块后，进度条增加
    //           this.progress += this.eachProgress;
    //           // 不能超过100
    //           this.progress = this.progress > 100 ? 100 : this.progress;
    //       }
    //       var spark = new SparkMD5.ArrayBuffer();
    //       spark.append(fileKeep);
    //       var md5 = spark.end();
    //       resolve();
    //     } catch (e) {
    //       reject(e);
    //     }
    //   });
    // },
    // 文件分块,利用Array.prototype.slice方法
    splitFile(file, eachSize, chunks) {
      return new Promise((resolve, reject) => {
        try {
          setTimeout(() => {
            const fileChunk = [];
            for (let chunk = 0; chunks > 0; chunks--) {
              fileChunk.push(file.slice(chunk, chunk + eachSize));
              chunk += eachSize;
            }
            resolve(fileChunk);
          }, 0);
        } catch (e) {
          console.error(e);
          reject(new Error("文件切块发生错误"));
        }
      });
    },
    removeFile(file) {
      this.requestCancelQueue[file.uid]();
      delete this.requestCancelQueue[file.uid];
      return true;
    },
    // 提交文件方法,将参数转换为FormData, 然后通过axios发起请求
    postFile(param, onProgress) {
      const formData = new FormData();
      // for (let p in param) {
        // formData.append(p, param[p]);
      // }
      formData.append('file', param.file)  //  改了
      formData.append('guid',param.uid)
      formData.append('chunk',param.chunk)
      formData.append('deptId',this.$store.getters.userInfo.deptId)
      if(param.chunk == 0){
          formData.append('chunks',1)
      }else{
          formData.append('chunks',param.chunks)
      }
      const { requestCancelQueue } = this;
      const config = {
        cancelToken: new axios.CancelToken(function executor(cancel) {
          if (requestCancelQueue[param.uid]) {
            requestCancelQueue[param.uid]();
            delete requestCancelQueue[param.uid];
          }
          requestCancelQueue[param.uid] = cancel;
        }),
        onUploadProgress: e => {
          if (param.chunked) {
            e.percent = Number(
              (
                ((param.chunk * (param.eachSize - 1) + e.loaded) /
                  param.fullSize) *
                100
              ).toFixed(2)
            );
          } else {
            e.percent = Number(((e.loaded / e.total) * 100).toFixed(2));
          }
          onProgress(e);
        }
      };
       return axios.post('http://core.mdgp.cn/ydisk/upload', formData)
    },
  }
};
</script>
<style scoped lang="scss">
.progress{
  /* 在当前页面居中 */
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  /* 宽度 */
}
.upload-file-uploader {
  margin-bottom: 5px;
}
.upload-file-list .el-upload-list__item {
  border: 1px solid #e4e7ed;
  line-height: 2;
  margin-bottom: 10px;
  position: relative;
}
.upload-file-list .ele-upload-list__item-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: inherit;
}
.ele-upload-list__item-content-action .el-link {
  margin-right: 10px;
}

</style>
