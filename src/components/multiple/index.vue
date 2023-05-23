<template>
  <div>
    <el-upload 
        class="upload-demo"
        ref="upload"
        accept=".txt, .txts, .pdf, .docx , .jpg, .png"
        :multiple="true"
        :action="uploadFileUrl"
        :headers="headers"
        :on-change="handleFileChange"
        :on-remove="onRemove"
        :before-remove="beforeRemove"
        :on-exceed="fileExceed"
        :auto-upload="false"
        :file-list="fileList"
        >
        <el-button slot="trigger" size="small" type="primary">选取附件</el-button>
        <el-button style="margin-left: 10px;" v-if="fileList.length>0" size="small" type="success" @click="submitFileForm">上传附件</el-button>
    </el-upload>
  </div>
</template>

<script>
import { getToken } from "@/utils/auth";
export default {
  data() {
    return {
       //回显附件列表
      fileList: [],
      //上传附件列表
      files:[],
      uploadFileUrl: process.env.VUE_APP_BASE_API + "/file/upload",
      headers: {
        Authorization: "Bearer " + getToken(),
      },
    };
  },
  computed: {
    // 是否显示提示
    showTip() {
      return this.isShowTip && (this.fileType || this.fileSize);
    },
    // 列表
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
      } else {
        this.fileList = [];
        return [];
      }
    },
  },
  mounted(){
     this.getFiles()
  },
  methods: {
   //by文章id获取附件列表
    getFiles(){
      console.log('回显')
    },
    //上传文件之前
    beforeUpload(file){
    },
     // 上传发生变化钩子
    handleFileChange(file, fileList){
      this.files = fileList;
      this.fileList = fileList
      // if(fileList.findIndex(f=>f.name===file.name)!=fileList.findLastIndex(f=>f.name===file.name))
      // {
      //   ElMessage.info(file.name +" 文件已存在")
      //   fileList.pop()
      // }
    },
    //文件个数超过最大限制时
    fileExceed(file, fileList){
      if(this.fileList.length>10){
         this.$message.warning("附件个数不能超过10个")
      }
    },
    //删除前的钩子
     beforeRemove(file, fileList) {
        return this.$confirm(`确定移除 ${ file.name }？`);
      },
      //删除的钩子
    onRemove(file,fileList){
      this.fileList = fileList
    },
    // 提交上传文件
    submitFileForm(file,fileList){
      console.log(this.fileList,"this.fileListthis.fileList")
       if(this.fileList.length === 0 ) {
            this.$message.warning('未选择文件!')
        }else{
            this.$refs.upload.submit()
        }
    }
  }
};
</script>

<style scoped lang="scss">
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


