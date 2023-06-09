<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="项目名称" prop="name">
        <el-input
          v-model="queryParams.name"
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
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="completedList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center"/>
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
      <!-- <el-table-column label="主键" align="center" prop="id"/> -->
      <el-table-column label="项目负责人" align="center" prop="nickName"/>
      <el-table-column label="归属部门" align="center" prop="deptName"/>
      <!-- <el-table-column label="协同人" align="center" prop="collaboratorName"/>
      <el-table-column label="协同人部门" align="center" prop="collaboratorDeptName"/> -->
      <el-table-column label="紧急程度" align="center" prop="urgency"/>
      <!-- <el-table-column label="项目描述" align="center" prop="description"/> -->
      <el-table-column label="项目开始时间" align="center" prop="startTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.startTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="项目结束时间" align="center" prop="endTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.endTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="项目周期 (天)" align="center" width="180">
        <template slot-scope="scope">
          {{ getDiffDay(scope.row.endTime, scope.row.startTime) }}
        </template>
      </el-table-column>
      <!-- <el-table-column label="费用出处" align="center" prop="expenseSource"/> -->
      <el-table-column label="费用金额" align="center" prop="expenseAmount"/>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改已办对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="800px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="150px">
        <el-form-item label="负责人名称" prop="nickName">
          <el-input v-model="form.nickName" disabled/>
        </el-form-item>
        <el-form-item label="负责人部门名称" prop="deptName">
          <el-input v-model="form.deptName" disabled/>
        </el-form-item>
        <el-form-item label="项目名称" prop="name">
          <el-input v-model="form.name" disabled/>
        </el-form-item>
        <el-form-item label="参与人" prop="collaboratorName">
          <el-input v-model="form.collaboratorName" disabled/>
        </el-form-item>
        <el-form-item label="参与人部门" prop="collaboratorName">
          <el-input v-model="form.collaboratorDeptName" disabled/>
        </el-form-item>
        <el-form-item label="项目分类" prop="projectCategory">
          <el-select disabled v-model="form.projectCategory" placeholder="请选择项目分类">
            <el-option
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              :value="parseInt(item.value)">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="客户部门" prop="customerDepartmentName">
          <el-input v-model="form.customerDepartmentName" placeholder="请输入客户部门名称" disabled/>
        </el-form-item>
        <el-form-item label="客户姓名" prop="customerContactPerson">
          <el-input v-model="form.customerContactPerson" placeholder="客户姓名" disabled/>
        </el-form-item>
        <el-form-item label="客户手机号" prop="customerContactPhone">
          <el-input v-model="form.customerContactPhone" placeholder="客户手机号" disabled/>
        </el-form-item>
        <el-form-item label="供应商公司名称" prop="supplierName">
          <el-input v-model="form.supplierName" placeholder="供应商公司名称" disabled/>
        </el-form-item>
        <el-form-item label="供应商联系人" prop="supplierContactPerson">
          <el-input v-model="form.supplierContactPerson" placeholder="供应商联系人" disabled/>
        </el-form-item>
        <el-form-item label="联系人手机号" prop="supplierContactPhone">
          <el-input v-model="form.supplierContactPhone" placeholder="联系人手机号" disabled/>
        </el-form-item>
        <el-form-item label="供应物资名称" prop="materialName">
          <el-input v-model="form.materialName" placeholder="供应物资名称" disabled/>
        </el-form-item>
        <el-form-item label="供应物资数量" prop="materialQuantity">
          <el-input v-model="form.materialQuantity" placeholder="供应物资数量" disabled/>
        </el-form-item>
        <el-form-item label="供应物资价格" prop="materialPrice">
          <el-input v-model="form.materialPrice" placeholder="供应物资价格" disabled/>
        </el-form-item>
        <!-- <el-form-item label="项目描述" prop="description">
          <el-input v-model="form.description" type="textarea"/>
        </el-form-item> -->
        <el-form-item label="项目开始时间" prop="startTime">
          <el-date-picker clearable size="small"
                          v-model="form.startTime"
                          type="date"
                          disabled
                          value-format="yyyy-MM-dd">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="项目结束时间" prop="endTime">
          <el-date-picker clearable size="small"
                          v-model="form.endTime"
                          type="date"
                          disabled
                          value-format="yyyy-MM-dd">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="费用出处" prop="expenseSource">
          <el-input v-model="form.expenseSource" type="textarea" disabled/>
        </el-form-item>
        <el-form-item label="费用金额" prop="expenseAmount">
          <el-input v-model="form.expenseAmount" disabled/>
        </el-form-item>
        <el-form-item label="是否第一次接触">
          <el-radio-group v-model="form.firstContact" disabled>
            <el-radio :label="0">
              是
            </el-radio>
            <el-radio :label="1">
              否
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="是否已支付" prop="isPayment">
          <el-radio v-if="form.isPayment === 0">
            未支付
          </el-radio>
          <el-radio v-if="form.isPayment === 1">
            已支付
          </el-radio>
        </el-form-item>
        <el-form-item label="是否已完成" prop="isComplete">
          <el-select v-model="form.isComplete" placeholder="请选择是否已完成" disabled>
            <el-option
              v-for="dict in isCompleteOptions"
              :key="dict.dictValue"
              :label="dict.dictLabel"
              :value="parseInt(dict.dictValue)"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="项目图片" prop="imgUrl">
          <OaFileUpload :show-button="true" v-model="form.imgUrl" @delete="handleDeleteImg"
                        @input="handleUploadSuccessImg"/>
        </el-form-item>
        <el-form-item label="项目视频" prop="videoUrl">
          <OaFileUpload :show-button="true" v-model="form.videoUrl" @delete="handleDeleteVideo"
                        @input="handleUploadSuccessVideo"/>
        </el-form-item>
        <el-form-item label="项目文件" prop="fileUrl">
          <OaFileUpload :show-button="true" v-model="form.fileUrl" @delete="handleDeleteFile"
                        @input="handleUploadSuccessFile"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="cancel">关 闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {updateCompleted} from "@/api/system/completed";
import {listTask} from "@/api/system/task";
import {parseTime} from "../../../utils/jeethink";
import ImageUpload from "@/components/ImageUpload/index.vue";
import OaFileUpload from "@/components/OaFileUpload/index.vue";

export default {
  name: "Completed",
  components: {OaFileUpload, ImageUpload},
  data() {
    return {
      options: [{
        value: '0',
        label: '技术开发'
      }, {
        value: '1',
        label: '技术维护'
      }, {
        value: '2',
        label: '物资采买'
      }, {
        value: '3',
        label: '平面设计'
      }, {
        value: '4',
        label: '展陈设计'
      }, {
        value: '5',
        label: '施工'
      }, {
        value: '6',
        label: '文案策划'
      }, {
        value: '7',
        label: '咨询策划'
      }, {
        value: '8',
        label: '视频制作'
      }],
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
      //完成状态字典
      isCompleteOptions: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        id: null,
        name: null,
        userId: null, // 获取当前登录的用户 ID
        isComplete: 2,
      },
      projectInfo: {
        id: null,
        pageNum: 1,
        pageSize: 10,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {},
      userInfo: this.$store.getters.userInfo,
    };
  },
  created() {
    this.getList();
    this.getDicts("sys_status").then(response => {
      this.isDeleteOptions = response.data;
    });
    this.getDicts("sys_oa_complete").then(response => {
      this.isCompleteOptions = response.data;
    });
  },
  methods: {
    //计算日期间隔天数
    getDiffDay(date_1, date_2) {
      // 计算两个日期之间的差值
      let totalDays, diffDate
      let myDate_1 = Date.parse(date_1)
      let myDate_2 = Date.parse(date_2)
      // 将两个日期都转换为毫秒格式，然后做差
      diffDate = Math.abs(myDate_1 - myDate_2) // 取相差毫秒数的绝对值
      totalDays = Math.floor(diffDate / (1000 * 3600 * 24)) // 向下取整
      // console.log(totalDays)
      return totalDays // 相差的天数
    },
    parseTime,
    // 删除成功回调
    handleDeleteImg() {
      this.$message.success("删除成功");
      this.form.imgUrl = "";
      updateCompleted(this.form);
    },
    handleDeleteVideo() {
      this.$message.success("删除成功");
      this.form.videoUrl = "";
      updateCompleted(this.form);
    },
    handleDeleteFile() {
      this.$message.success("删除成功");
      this.form.fileUrl = "";
      updateCompleted(this.form);
    },
    // 上传成功回调
    handleUploadSuccessVideo(res, file) {
      this.$message.success("上传成功");
      this.$emit("input", res);
      if (res !== null) {
        this.form.videoUrl = res
        updateCompleted(this.form);
      }
    },
    handleUploadSuccessFile(res, file) {
      this.$message.success("上传成功");
      this.$emit("input", res);
      if (res !== null) {
        this.form.fileUrl = res
        updateCompleted(this.form);
      }
    },
    handleUploadSuccessImg(res, file) {
      this.$message.success("上传成功");
      this.$emit("input", res);
      console.log(res, "res")
      if (res !== null) {
        this.form.imgUrl = res
        updateCompleted(this.form);
      }
    },
    /** 查询已办列表 */
    getList() {
      this.loading = true;
      this.queryParams.userId = this.userInfo.userId;
      if (this.userInfo.admin) {
        this.queryParams.userId = null;
      }
      listTask(this.queryParams).then(response => {
        this.completedList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    // 逻辑删除字典翻译
    isDeleteFormat(row, column) {
      return this.selectDictLabel(this.isDeleteOptions, row.isDelete);
    },
    // 完成状态字典翻译
    isCompleteFormat(row, column) {
      return this.selectDictLabel(this.isCompleteOptions, row.isComplete);
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
      this.projectInfo.id = id;
      listTask(this.projectInfo).then(response => {
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
