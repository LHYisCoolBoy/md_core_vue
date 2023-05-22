<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="项目名称" prop="projectId">
        <el-input
          v-model="queryParams.projectId"
          placeholder="请输入项目名称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <!--      <el-col :span="1.5">
              <el-button
                type="primary"
                plain
                icon="el-icon-plus"
                size="mini"
                disabled="disabled"
                @click="handleAdd"
                v-hasPermi="['system:completed:add']"
              >新增
              </el-button>
            </el-col>-->
      <!--      <el-col :span="1.5">
              <el-button
                type="success"
                plain
                icon="el-icon-edit"
                size="mini"
                disabled="disabled"
                @click="handleUpdate"
                v-hasPermi="['system:completed:edit']"
              >修改
              </el-button>
            </el-col>-->
      <!--      <el-col :span="1.5">
              <el-button
                type="danger"
                plain
                icon="el-icon-delete"
                size="mini"
                :disabled="multiple"
                @click="handleDelete"
                v-hasPermi="['system:completed:remove']"
              >删除
              </el-button>
            </el-col>-->
      <!--      <el-col :span="1.5">
              <el-button
                type="warning"
                plain
                icon="el-icon-download"
                size="mini"
                @click="handleExport"
                v-hasPermi="['system:completed:export']"
              >导出
              </el-button>
            </el-col>-->
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="completedList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center"/>
      <el-table-column label="主键" align="center" prop="id"/>
      <el-table-column label="用户昵称" align="center" prop="nickName"/>
      <el-table-column label="部门名称" align="center" prop="deptName"/>
      <el-table-column label="项目名称" align="center" prop="name">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            @click="handleSelectByProjectId(scope.row)"
            v-hasPermi="['system:completed:edit']"
          >{{ scope.row.name }}
          </el-button>
        </template>
      </el-table-column>
      <el-table-column label="协同人名称" align="center" prop="collaboratorName"/>
      <el-table-column label="协同人部门" align="center" prop="collaboratorDeptName"/>
      <el-table-column label="项目描述" align="center" prop="description"/>
      <el-table-column label="项目开始时间" align="center" prop="startTime">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.startTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="项目结束时间" align="center" prop="endTime">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.startTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="费用出处" align="center" prop="expenseSource"/>
      <el-table-column label="费用金额" align="center" prop="expenseAmount"/>
      <!--      <el-table-column label="图片" align="center" prop="imgUrl">
              <template slot-scope="scope">
                <img :src="scope.row.imgUrl" alt="" style="width:100%;height:150px;">
              </template>
            </el-table-column>
            <el-table-column label="视频" align="center" prop="videoUrl">
              <template slot-scope="scope">
                <video-player style="width: 100%;height: 100%;margin:0 auto;" class="video-js vjs-big-play-centered"
                              ref="videoPlayer"
                              :playsinline="true"
                              :options="playerOptions[scope.$index]"
                              v-if="scope.row.videoUrl != null"
                >
                </video-player>
                <div v-if="scope.row.videoUrl == null">
                  无视频
                </div>
              </template>
            </el-table-column>
            <el-table-column label="文件" align="center" prop="fileUrl">
              <a :href="completedList.fileUrl" download>下载该文件</a>
            </el-table-column>-->
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            @click="handleAddFile(scope.row)"
            v-hasPermi="['system:completed:addfile']"
          >上传
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

    <!-- 添加或修改已办对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="用户名称" prop="nickName">
          <el-input v-model="form.nickName"/>
        </el-form-item>
        <el-form-item label="部门名称" prop="deptName">
          <el-input v-model="form.deptName"/>
        </el-form-item>
        <el-form-item label="项目名称" prop="name">
          <el-input v-model="form.name"/>
        </el-form-item>
        <el-form-item label="协同人" prop="collaboratorName">
          <el-input v-model="form.collaboratorName"/>
        </el-form-item>
        <el-form-item label="协同人部门" prop="collaboratorName">
          <el-input v-model="form.collaboratorDeptName"/>
        </el-form-item>
        <el-form-item label="项目描述" prop="description">
          <el-input v-model="form.description" type="textarea"/>
        </el-form-item>
        <el-form-item label="项目的开始时间" prop="startTime">
          <el-date-picker clearable size="small"
                          v-model="form.startTime"
                          type="date"
                          value-format="yyyy-MM-dd">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="项目预计的结束时间" prop="endTime">
          <el-date-picker clearable size="small"
                          v-model="form.endTime"
                          type="date"
                          value-format="yyyy-MM-dd">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="费用出处" prop="expenseSource">
          <el-input v-model="form.expenseSource" type="textarea"/>
        </el-form-item>
        <el-form-item label="费用金额" prop="expenseAmount">
          <el-input v-model="form.expenseAmount"/>
        </el-form-item>
        <el-form-item label="是否已支付" prop="isPayment">
          <el-radio v-if="form.isPayment === 0">
            未支付
          </el-radio>
          <el-radio v-if="form.isPayment === 1">
            已支付
          </el-radio>
        </el-form-item>
        <el-form-item label="图片" prop="imgUrl">
          <imageUpload v-model="form.imgUrl"/>
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
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="cancel">关 闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {listCompleted, getCompleted, delCompleted, addCompleted, updateCompleted} from "@/api/system/completed";
import {listTask} from "@/api/system/task";
import {parseTime} from "../../../utils/jeethink";
import ImageUpload from "@/components/ImageUpload/index.vue";
import {getToken} from "@/utils/auth";

export default {
  name: "Completed",
  components: {ImageUpload},
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
      // 已办表格数据
      completedList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 逻辑删除字典
      isDeleteOptions: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        id: null,
        name: null,
        isPayment: 1,
        userId: null, // 获取当前登录的用户 ID
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {},
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
    this.getDicts("sys_status").then(response => {
      this.isDeleteOptions = response.data;
    });
  },
  methods: {
    parseTime,
    // 上传成功回调
    handleUploadSuccess(res, file) {
      console.log(res, "上传成功回调")
      this.$message.success("上传成功");
      this.$emit("input", res.data.videoUrl);
      this.videoAddress = res.data.videoUrl
    },
    /** 查询已办列表 */
    getList() {
      this.loading = true;
      listCompleted(this.queryParams).then(response => {
        this.completedList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
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
        userId: null,
        nickName: null,
        deptId: null,
        deptName: null,
        name: null,
        collaboratorId: null,
        collaboratorName: null,
        collaboratorDeptName: null,
        urgency: null,
        description: null,
        startTime: null,
        endTime: null,
        expenseSource: null,
        expenseAmount: null,
        isPayment: null,
        createTime: null,
        updateTime: null,
        fileUrl: null,
        imgUrl: null,
        videoUrl: null,
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
    /** 查看项目详细信息按钮操作 */
    handleSelectByProjectId(row) {
      this.reset();
      const id = row.id || this.ids
      this.queryParams.id = id;
      listTask(this.queryParams).then(response => {
        this.form = response.rows[0];
        this.open = true;
        this.title = "项目信息";
      });
    },
    /** 上传按钮操作 */
    handleAddFile(row) {
      this.reset();
      const id = row.id || this.ids
      this.queryParams.id = id;
      listTask(this.queryParams).then(response => {
        this.form = response.rows[0];
        this.open = true;
        this.title = "上传资料";
      });
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('system/completed/export', {
        ...this.queryParams
      }, `system_completed.xlsx`)
    }
  },
};
</script>
