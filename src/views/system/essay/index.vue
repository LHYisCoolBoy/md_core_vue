<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="资讯分类" prop="informationClassify">
        <el-select v-model="queryParams.informationClassify" placeholder="请选择资讯分类" clearable size="small">
          <el-option label="模范光荣榜" value="1"/>
          <el-option label="青字号风采" value="2"/>
          <el-option label="青春光明行" value="3"/>
          <el-option label="央企帮扶" value="4"/>
          <el-option label="团团矩阵" value="5"/>
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable size="small">
          <el-option
            v-for="dict in statusOptions"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['system:essay:add']"
        >新增
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['system:essay:edit']"
        >修改
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['system:essay:remove']"
        >删除
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['system:essay:export']"
        >导出
        </el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="essayList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center"/>
      <el-table-column label="主键" align="center" prop="id"/>
      <el-table-column label="标题" align="center" prop="essayTitle"/>
      <el-table-column label="资讯分类" align="center">
        <template slot-scope="scope">
          <span v-if="scope.row.informationClassify == 1">模范光荣榜</span>
          <span v-if="scope.row.informationClassify == 2">青字号风采</span>
          <span v-if="scope.row.informationClassify == 3">青春光明行</span>
          <span v-if="scope.row.informationClassify == 4">央企帮扶</span>
          <span v-if="scope.row.informationClassify == 5">团团矩阵</span>
        </template>
      </el-table-column>
      <!--      <el-table-column label="封面图片" align="center" prop="coverImage" />-->
      <el-table-column label="封面图片" align="center">
        <template slot-scope="scope">
          <img :src="scope.row.coverImage" alt="" style="width:100%;height:150px;">
        </template>
      </el-table-column>
      <el-table-column label="排序" align="center" prop="sort"/>
      <el-table-column label="状态" align="center" prop="status" :formatter="statusFormat"/>
      <el-table-column label="浏览量" align="center" prop="clickNum"/>
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['system:essay:edit']"
          >修改
          </el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['system:essay:remove']"
          >删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改文章对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="标题" prop="essayTitle">
          <el-input v-model="form.essayTitle" type="textarea" placeholder="请输入内容"/>
        </el-form-item>
        <el-form-item label="副标题" prop="essaySubtitle">
          <el-input v-model="form.essaySubtitle" type="textarea" placeholder="请输入内容"/>
        </el-form-item>
        <el-form-item label="资讯简介" prop="essayText">
          <el-input v-model="form.essayText" type="textarea" placeholder="请输入内容"/>
        </el-form-item>
        <el-form-item label="资讯分类" prop="informationClassify">
          <el-select v-model="form.informationClassify" placeholder="请选择资讯分类">
            <el-option label="模范光荣榜" value="1"/>
            <el-option label="青字号风采" value="2"/>
            <el-option label="青春光明行" value="3"/>
            <el-option label="央企帮扶" value="4"/>
            <el-option label="团团矩阵" value="5"/>
          </el-select>
        </el-form-item>
        <el-form-item label="封面图片">
          <imageUpload v-model="form.coverImage"/>
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input v-model="form.sort" placeholder="请输入排序"/>
        </el-form-item>
        <el-form-item label="上传视频">
          <el-upload
            class="avatar-uploader el-upload--text"
            :action="uploadFileUrl"
            :headers="headers"
            :on-success="handleUploadSuccess"
            style="border: 1px solid #DCDFE6;border-radius: 4px;padding: 10px;"
          >
            <video v-if="videoSrc !=='' && progressFlag === false" :src="videoSrc" class="avatar" controls="controls">
              您的浏览器不支持视频播放
            </video>
            <i v-else-if="videoSrc ==='' && progressFlag === false" class="el-icon-plus avatar-uploader-icon"/>
            <el-progress v-if="progressFlag === true" type="circle" :percentage="loadProgress"
                         style="margin-top:30px;"/>
            <!-- <div slot="tip" class="el-upload__tip" style="color: #E6A23C;"> 请保证视频格式正确，且不超过10M。</div> -->
          </el-upload>
          <span v-if="videoAddress">{{ videoAddress }}</span>
        </el-form-item>
        <el-form-item label="正文">
          <editor v-model="form.text" :min-height="192"/>
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio
              v-for="dict in statusOptions"
              :key="dict.dictValue"
              :label="parseInt(dict.dictValue)"
            >{{ dict.dictLabel }}
            </el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {listEssay, getEssay, delEssay, addEssay, updateEssay} from "@/api/system/essay";
import ImageUpload from '@/components/ImageUpload';
import Editor from '@/components/Editor';
import {getToken} from "@/utils/auth";

export default {
  name: "Essay",
  components: {
    ImageUpload,
    Editor,
  },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 文章表格数据
      essayList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 状态字典
      statusOptions: [],
      // 逻辑删除字典
      isDeleteOptions: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        essayTitle: null,
        essaySubtitle: null,
        informationClassify: null,
        status: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        status: [
          {required: true, message: "状态不能为空", trigger: "blur"}
        ],
        createTime: [
          {required: true, message: "创建时间不能为空", trigger: "blur"}
        ],
        updateTime: [
          {required: true, message: "更新时间不能为空", trigger: "blur"}
        ],
        isDelete: [
          {required: true, message: "逻辑删除不能为空", trigger: "change"}
        ]
      },
      //上传视频文件
      progressFlag: false, // 关闭进度条
      loadProgress: 0, // 进度条初始值
      videoSrc: '',
      uploadFileUrl: 'http://core.mdgp.cn/api/mdcms-file/upload', // 上传的图片服务器地址
      headers: {
        Authorization: "Bearer " + getToken(),
      },
      videoAddress: '',
    };
  },
  created() {
    this.getList();
    this.getDicts("md_sys_essay").then(response => {
      this.statusOptions = response.data;
    });
    this.getDicts("sys_status").then(response => {
      this.isDeleteOptions = response.data;
    });
  },
  methods: {
    // 进度条
    uploadVideoProcess(event, file, fileList) {
      this.loadProgress = Math.floor(event.percent)
      if (this.loadProgress >= 100) {
        this.loadProgress = 100
        // setTimeout(() => { this.progressFlag = false }, 1000) // 一秒后关闭进度条
      }
    },
    // 上传成功回调
    handleUploadSuccess(res, file) {
      this.$message.success("上传成功");
      this.$emit("input", res.data.url);
      this.videoAddress = res.data.url
    },
    /** 查询文章列表 */
    getList() {
      this.loading = true;
      listEssay(this.queryParams).then(response => {
        this.essayList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    // 状态字典翻译
    statusFormat(row, column) {
      return this.selectDictLabel(this.statusOptions, row.status);
    },
    // 逻辑删除字典翻译
    isDeleteFormat(row, column) {
      return this.selectDictLabel(this.isDeleteOptions, row.isDelete);
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        id: null,
        essayTitle: null,
        essaySubtitle: null,
        essayText: null,
        informationClassify: null,
        coverImage: null,
        sort: null,
        text: null,
        status: 0,
        clickNum: null,
        createTime: null,
        updateTime: null,
        isDelete: null
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加文章";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      console.log(row,"row")
      this.reset();
      const id = row.id || this.ids
      getEssay(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改文章";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateEssay(this.form).then(response => {
              this.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addEssay(this.form).then(response => {
              this.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids;
      this.$confirm('是否确认删除文章编号为"' + ids + '"的数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(function () {
        return delEssay(ids);
      }).then(() => {
        this.getList();
        this.msgSuccess("删除成功");
      })
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('system/essay/export', {
        ...this.queryParams
      }, `system_essay.xlsx`)
    }
  }
};
</script>
