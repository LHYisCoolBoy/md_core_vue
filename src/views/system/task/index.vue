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
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-success"
            @click="handlePayment(scope.row)"
            v-if="scope.row.userId === userInfo.userId || userInfo.userId === 1"
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
      <el-form ref="form" disabled :model="form" :rules="rules" label-width="150px">
        <el-form-item label="负责人名称" prop="nickName">
          <el-input v-model="form.nickName"/>
        </el-form-item>
        <el-form-item label="负责人部门名称" prop="deptName">
          <el-input v-model="form.deptName"/>
        </el-form-item>
        <el-form-item label="项目名称" prop="name">
          <el-input v-model="form.name"/>
        </el-form-item>
        <el-form-item label="参与人" prop="collaboratorName">
          <el-input v-model="form.collaboratorName"/>
        </el-form-item>
        <el-form-item label="参与人部门" prop="collaboratorName">
          <el-input v-model="form.collaboratorDeptName"/>
        </el-form-item>
        <el-form-item label="项目分类" prop="projectCategory">
          <el-select v-model="form.projectCategory" placeholder="请选择项目分类">
            <el-option
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              :value="parseInt(item.value)">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="客户部门" prop="customerDepartmentName">
          <el-input v-model="form.customerDepartmentName" placeholder="请输入客户部门名称"/>
        </el-form-item>
        <el-form-item label="客户姓名" prop="customerContactPerson">
          <el-input v-model="form.customerContactPerson" placeholder="客户姓名"/>
        </el-form-item>
        <el-form-item label="客户手机号" prop="customerContactPhone">
          <el-input v-model="form.customerContactPhone" placeholder="客户手机号"/>
        </el-form-item>
        <el-form-item label="供应商公司名称" prop="supplierName">
          <el-input v-model="form.supplierName" placeholder="供应商公司名称"/>
        </el-form-item>
        <el-form-item label="供应商联系人" prop="supplierContactPerson">
          <el-input v-model="form.supplierContactPerson" placeholder="供应商联系人"/>
        </el-form-item>
        <el-form-item label="联系人手机号" prop="supplierContactPhone">
          <el-input v-model="form.supplierContactPhone" placeholder="联系人手机号"/>
        </el-form-item>
        <el-form-item label="供应物资名称" prop="materialName">
          <el-input v-model="form.materialName" placeholder="供应物资名称"/>
        </el-form-item>
        <el-form-item label="供应物资数量" prop="materialQuantity">
          <el-input v-model="form.materialQuantity" placeholder="供应物资数量"/>
        </el-form-item>
        <el-form-item label="供应物资价格" prop="materialPrice">
          <el-input v-model="form.materialPrice" placeholder="供应物资价格"/>
        </el-form-item>
        <!-- <el-form-item label="项目描述" prop="description">
          <el-input v-model="form.description" type="textarea"/>
        </el-form-item> -->
        <el-form-item label="项目开始时间" prop="startTime">
          <el-date-picker clearable size="small"
                          v-model="form.startTime"
                          type="date"
                          value-format="yyyy-MM-dd">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="项目结束时间" prop="endTime">
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
        <el-form-item label="是否第一次接触">
          <el-radio-group v-model="form.firstContact">
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
          <el-select v-model="form.isComplete" placeholder="请选择是否已完成">
            <el-option
              v-for="dict in isCompleteOptions"
              :key="dict.dictValue"
              :label="dict.dictLabel"
              :value="parseInt(dict.dictValue)"
            ></el-option>
          </el-select>
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
      taskList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      isPaymentOptions: [],
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
        isComplete: 0,
        isComplete01: 1,
      },
      paymentParams: {
        id: null,
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
    /** 查询待办列表 */
    getList() {
      this.loading = true;
      this.queryParams.userId = this.userInfo.userId;
      if (this.userInfo.admin) {
        this.queryParams.userId = null;
      }
      listTask(this.queryParams).then(response => {
        this.taskList = response.rows;
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
      this.projectInfo.id = id;
      listTask(this.projectInfo).then(response => {
        this.form = response.rows[0];
        this.open = true;
        this.title = "项目信息";
      });
    },
    /** 完成按钮操作 */
    handlePayment(row) {
      const id = row.id || this.ids
      this.paymentParams.id = id;
      this.$confirm('是否确认完成待办编号为"' + id + '"的数据项?', "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        return paymentProject(this.paymentParams);
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
