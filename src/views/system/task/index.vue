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
      <!--      <el-col :span="1.5">
              <el-button
                type="primary"
                plain
                icon="el-icon-plus"
                size="mini"
                @click="handleAdd"
                disabled="disabled"
                v-hasPermi="['system:task:add']"
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
                v-hasPermi="['system:task:edit']"
              >修改
              </el-button>
            </el-col>-->
      <!--      <el-col :span="1.5">
              <el-button
                type="danger"
                plain
                icon="el-icon-delete"
                size="mini"
                disabled="disabled"
                @click="handleDelete"
                v-hasPermi="['system:task:remove']"
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
                v-hasPermi="['system:task:export']"
              >导出
              </el-button>
            </el-col>-->
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="taskList" @selection-change="handleSelectionChange">
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
            v-hasPermi="['system:task:edit']"
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
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-success"
            @click="handlePayment(scope.row)"
            v-if="scope.row.userId == userInfo.userId || userInfo.userId == 1"
          >完成
          </el-button>
          <!--            v-hasPermi="['system:task:success']"-->
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
    <el-dialog :title="title" :visible.sync="open" width="800px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="150px">
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
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="cancel">关 闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {listTask, paymentProject} from "@/api/system/task";
import {parseTime} from "../../../utils/jeethink";

export default {
  name: "Task",
  components: {},
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
      taskList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      isPaymentOptions: [],
      // 逻辑删除字典
      isDeleteOptions: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        id: null,
        name: null,
        isPayment: 0,
        userId: null, // 获取当前登录的用户 ID
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {},
      playerOptions: {},
      userInfo: this.$store.getters.userInfo,
      taskPaymentShow: Boolean,
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
    /** 查询待办列表 */
    getList() {
      this.loading = true;
      this.queryParams.userId = this.userInfo.userId;
      if (this.userInfo.admin) {
        this.queryParams.userId = null;
      }
      listTask(this.queryParams).then(response => {
        console.log(this.userInfo,"user")
        this.taskList = response.rows;
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
        updateTime: null
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
    /** 完成按钮操作 */
    handlePayment(row) {
      const id = row.id || this.ids
      this.$confirm('是否确认完成待办编号为"' + id + '"的数据项?', "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(function () {
        return paymentProject(id);
      }).then(() => {
        this.getList();
        this.msgSuccess("操作成功");
      })
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('system/task/export', {
        ...this.queryParams
      }, `system_task.xlsx`)
    }
  },
};
</script>
