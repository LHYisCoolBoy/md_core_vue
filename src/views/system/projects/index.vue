<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="85px">
      <!-- <el-form-item label="项目负责人" prop="userId">
        <el-select v-model="queryParams.userId" placeholder="请选择项目负责人" clearable size="small">
          <el-option
            v-for="(user,index) in uniqueProjectsByUserList"
            :key="index"
            :label="user.nickName"
            :value="user.userId"
          />
        </el-select>
      </el-form-item> -->
      <el-form-item label="项目负责人部门" prop="deptId" label-width="115px">
        <el-select v-model="queryParams.deptId" placeholder="请选择项目负责人部门" clearable size="small">
          <el-option
            v-for="(dept,index) in uniqueProjectsByDeptList"
            :key="index"
            :label="dept.deptName"
            :value="dept.deptId"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="项目名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入项目名称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="是否已支付" prop="isPayment" label-width="85px">
        <el-select v-model="queryParams.isPayment" placeholder="请选择是否已支付" clearable size="small">
          <el-option
            v-for="dict in isPaymentOptions"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="是否已完成" prop="isComplete">
          <el-select v-model="queryParams.isComplete" placeholder="请选择是否已完成">
            <el-option
              v-for="dict in isCompleteOptions"
              :key="dict.dictValue"
              :label="dict.dictLabel"
              :value="parseInt(dict.dictValue)"
            ></el-option>
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
          v-hasPermi="['system:projects:add']"
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
          v-hasPermi="['system:projects:edit']"
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
          v-hasPermi="['system:projects:remove']"
        >删除
        </el-button>
      </el-col>
      <!-- <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['system:projects:export']"
        >导出
        </el-button>
      </el-col> -->


      <el-col :span="1.5" v-if="num">
        <el-button
          v-if="isAdmin"
          type="danger"
          size="mini"
          @click="handleShowMessage"
        >消息
          <span> ({{ this.num }}) </span>
        </el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="projectsList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center"/>
      <el-table-column label="项目名称" align="center" prop="name">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            @click="handleSelectByProjectId(scope.row)"
            v-hasPermi="['system:projects:edit']"
          >{{ scope.row.name }}
          </el-button>
        </template>
      </el-table-column>
      <!-- <el-table-column label="主键" align="center" prop="id"/> -->
      <el-table-column label="项目负责人" align="center" prop="nickName"/>
      <el-table-column label="归属部门" align="center" prop="deptName"/>
      <!-- <el-table-column label="协同人" align="center" prop="collaboratorName"/>
      <el-table-column label="协同人部门" align="center" prop="collaboratorDeptName"/> -->
      <el-table-column label="紧急程度" align="center" prop="urgency" :formatter="urgencyFormat"/>
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
        <template slot-scope="scope" v-if="scope.row.endTime && scope.row.startTime">
          {{ getDiffDay(scope.row.endTime, scope.row.startTime) }}
        </template>
      </el-table-column>
      <el-table-column label="费用金额" align="center" prop="expenseAmount"/>
      <el-table-column label="是否已支付" align="center" prop="isPayment" :formatter="isPaymentFormat"/>
      <el-table-column label="完成状态" align="center" prop="isComplete" :formatter="isCompleteFormat"/>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['system:projects:edit']"
          >修改
          </el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['system:projects:remove']"
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

    <!-- 添加或修改项目对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="800px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="150px">
        <el-form-item label="负责人部门" prop="deptId">
          <el-select v-model="form.deptId" placeholder="请选择部门" @change="updateUserId">
            <el-option
              v-for="(dept,index) in uniqueProjectsByDeptList"
              :key="index"
              :label="dept.deptName"
              :value="dept.deptId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="项目负责人" prop="userId">
          <el-select v-model="form.userId" placeholder="请选择项目负责人">
            <el-option
              v-for="(user,index) in uniqueByUserList"
              :key="index"
              :label="user.nickName"
              :value="user.userId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="项目名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入项目名称"/>
        </el-form-item>

        <el-form-item label="参与人部门" prop="collaboratorDeptId">
          <el-select v-model="form.collaboratorDeptId" placeholder="请选择参与人部门" multiple @change="updateCollaboratorId">
            <el-option
              v-for="(dept,index) in uniqueProjectsByDeptList"
              :key="index"
              :label="dept.deptName"
              :value="dept.deptId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="参与人" prop="collaboratorId">
          <el-select v-model="form.collaboratorId"
                     placeholder="请选择协参与人">
            <el-option
              v-for="(user,index) in uniqueByCollaboratorList"
              :key="index"
              :label="user.collaboratorName"
              :value="user.collaboratorId"
            />
          </el-select>
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
        <el-form-item label="紧急程度" prop="urgency">
          <el-select v-model="form.urgency" placeholder="请选择紧急程度">
            <el-option
              v-for="dict in urgencyOptions"
              :key="dict.dictValue"
              :label="dict.dictLabel"
              :value="dict.dictValue"
            ></el-option>
          </el-select>
        </el-form-item>
        <!-- <el-form-item label="项目描述" prop="description">
          <el-input v-model="form.description" type="textarea" placeholder="请输入对于项目整体描述"/>
        </el-form-item> -->
        <el-form-item label="项目难点预测" prop="difficultyForecast">
          <el-input v-model="form.difficultyForecast" type="textarea" placeholder="请输入项目预估空难点"/>
        </el-form-item>
        <el-form-item label="总经理协调推进问题" prop="managerCooperationRequired">
          <el-input v-model="form.managerCooperationRequired" type="textarea"
                    placeholder="请输入需要总经理协调推进问题"/>
        </el-form-item>
        <el-form-item label="项目开始时间" prop="startTime">
          <el-date-picker clearable size="small"
                          v-model="form.startTime"
                          type="date"
                          value-format="yyyy-MM-dd HH:mm:ss"
                          placeholder="选择项目开始时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="项目结束时间" prop="endTime">
          <el-date-picker clearable size="small"
                          v-model="form.endTime"
                          type="date"
                          value-format="yyyy-MM-dd HH:mm:ss"
                          placeholder="选择项目结束时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="费用出处" prop="expenseSource">
          <el-input v-model="form.expenseSource" placeholder="请输入费用出处"/>
        </el-form-item>
        <el-form-item label="费用金额" prop="expenseAmount">
          <el-input v-model="form.expenseAmount" placeholder="请输入费用金额"/>
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
        <el-form-item label="是否已支付">
          <el-radio-group v-model="form.isPayment">
            <el-radio
              v-for="dict in isPaymentOptions"
              :key="dict.dictValue"
              :label="parseInt(dict.dictValue)"
            >{{ dict.dictLabel }}
            </el-radio>
          </el-radio-group>
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
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <el-dialog :title="title01" :visible.sync="open01" width="800px" append-to-body>
      <el-form disabled ref="form" :model="form" :rules="rules" label-width="150px">
        <el-form-item label="项目负责人" prop="nickName">
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
        <el-form-item label="是否已支付" prop="isPayment">
          <el-radio v-if="form.isPayment === 0">
            未支付
          </el-radio>
          <el-radio v-if="form.isPayment === 1">
            已支付
          </el-radio>
        </el-form-item>

        <el-form-item label="图片" prop="imgUrl">
          <OaFileUpload :show-button="false" v-model="form.imgUrl"/>
        </el-form-item>
        <el-form-item label="视频" prop="videoUrl">
          <OaFileUpload :show-button="false" v-model="form.videoUrl"/>
        </el-form-item>
        <el-form-item label="文件" prop="fileUrl">
          <OaFileUpload :show-button="false" v-model="form.fileUrl"/>
        </el-form-item>
      </el-form>
    </el-dialog>

    <el-dialog :visible.sync="open02" width="1000px" append-to-body>
      <el-table :data="messageProjectsList">
        <el-table-column label="项目名称" align="center" prop="name">
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="text"
              @click="handleSelectByProjectId(scope.row)"
              v-hasPermi="['system:projects:edit']"
            >{{ scope.row.name }}
            </el-button>
          </template>
        </el-table-column>
        <el-table-column label="参与人" align="center" prop="collaboratorName"/>
        <el-table-column label="参与人部门" align="center" prop="collaboratorDeptName" width="180"/>
        <el-table-column label="紧急程度" align="center" prop="urgency" :formatter="urgencyFormat"/>
        <!-- <el-table-column label="项目描述" align="center" prop="description"/> -->
        <el-table-column label="项目开始时间" align="center" prop="startTime" width="150">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.startTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="项目结束时间" align="center" prop="endTime" width="150">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.endTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="项目周期 (天)" align="center" width="180">
        <template slot-scope="scope" v-if="scope.row.endTime && scope.row.startTime">
            {{ getDiffDay(scope.row.endTime, scope.row.startTime) }}
          </template>
        </el-table-column>
        <!-- <el-table-column label="费用出处" align="center" prop="expenseSource" width="300"/> -->
        <el-table-column label="费用金额" align="center" prop="expenseAmount"/>
        <el-table-column label="是否已支付" align="center" prop="isPayment" :formatter="isPaymentFormat" width="100"/>
        <el-table-column label="完成状态" align="center" prop="isComplete" :formatter="isCompleteFormat"/>
      </el-table>
    </el-dialog>
  </div>
</template>

<script>
import {
  addProjects,
  delProjects,
  getMessageByUserIdCount,
  listProjectsByDeptId,
  updateProjects
} from "@/api/system/projects";
import {listByCollaboratorId, listTask} from "@/api/system/task";
import dict from "../dict/index.vue";
import {parseTime} from "../../../utils/jeethink";
import OaFileUpload from "@/components/OaFileUpload/index.vue";

export default {
  name: "Projects",
  computed: {
    dict() {
      return dict
    },
    // 部门信息去重
    uniqueProjectsByDeptList() {
      const set = new Set();
      return this.listProjectsByDeptId.filter(list => {
        if (list.deptId !== null) {
          if (set.has(list.deptId)) {
            return false;
          } else {
            set.add(list.deptId);
            return true;
          }
        }
      });
    },
    // 用户信息去重
    uniqueProjectsByUserList() {
      const set = new Set();
      return this.projectsList.filter(dict => {
        if (set.has(dict.userId)) {
          return false;
        } else {
          set.add(dict.userId);
          return true;
        }
      });
    },
    // 新增按钮的用户下拉框去重
    uniqueByUserList() {
      const set = new Set();
      return this.userList.filter(user => {
        if (set.has(user.userId)) {
          return false;
        } else {
          set.add(user.userId);
          return true;
        }
      });
    },
    // 新增按钮协同人下拉框去重
    uniqueByCollaboratorList() {
      const set = new Set();
      return this.collaboratorList.filter(collaborator => {
        if (set.has(collaborator.collaboratorId)) {
          return false;
        } else {
          set.add(collaborator.collaboratorId);
          return true;
        }
      });
    },
  },
  components: {OaFileUpload},
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
      // 项目表格数据
      projectsList: [],
      messageProjectsList: [],
      // 弹出层标题
      title: "",
      title01: "",
      // 是否显示弹出层
      open: false,
      open01: false,
      open02: false,
      // 紧急程度字典
      urgencyOptions: [],
      // 是否已支付字典
      isPaymentOptions: [],
      // 逻辑删除字典
      isDeleteOptions: [],
      //完成状态字典
      isCompleteOptions: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        nickName: null,
        deptName: null,
        name: null,
        deptId: null,
        isPayment: null,
        collaboratorId: null,
        userId: null,
        id: null,
        queryParams: null,
      },
      editParams: {
        pageNum: 1,
        pageSize: 10,
        id: null
      },
      editDeptId: {
        deptId: null
      },
      // 消息按钮参数
      messageParams: {
        userId: null,
        pageNum: 1,
        pageSize: 10,
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
      // 根据部门 ID 筛选出的用户列表
      userList: [],
      collaboratorList: [],
      listProjectsByDeptId: [],
      num: null,
      isAdmin: true,
      // 管理员白名单，可以在工作台查看全部项目信息
      whiteList: [1, 102, 103, 106],
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
    };
  },
  created() {
    this.getList();
    this.getMessageByUserIdCountNum();
    this.getListProjectsByDeptId();
    this.getDicts("sys_oa_urgency").then(response => {
      this.urgencyOptions = response.data;
    });
    this.getDicts("sys_oa_projects").then(response => {
      this.isPaymentOptions = response.data;
    });
    this.getDicts("sys_status").then(response => {
      this.isDeleteOptions = response.data;
    });
    this.getDicts("sys_oa_complete").then(response => {
      this.isCompleteOptions = response.data;
    });
    this.queryParams.userId = ''
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
    // 更新 UserId 数据
    updateUserId(val) {
      // 给用户列表设置为空
      this.userList = [];
      // 获取当前部门下的用户列表
      this.editDeptId.deptId = val;
      listProjectsByDeptId(this.editDeptId).then(res => {
        this.userList = res.data;
        console.log(res, 'res')
      });
    },
    // 更新 updateCollaboratorId 数据
    updateCollaboratorId(val) {
      // 给协同人列表设置为空
      this.collaboratorList = [];
      // 获取当前部门下的协同人列表
      this.editDeptId.deptId .push(val) ;
      listProjectsByDeptId(this.editDeptId).then(res => {
        this.collaboratorList = res.data;
      });
    },
    /** 查询项目列表 */
    getList() {
      this.loading = true;
      this.queryParams.userId = this.userInfo.userId;
      console.log(this.userInfo.userId,"this.userInfo.userId")
      if (this.whiteList.includes(this.userInfo.userId)) {
        this.queryParams.userId = null;
      }
      console.log(this.queryParams.userId, "this.queryParams.userId")
      listTask(this.queryParams).then(response => {
        this.projectsList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    // 获取部门信息
    getListProjectsByDeptId() {
      listProjectsByDeptId().then(response => {
        this.listProjectsByDeptId = response.data;
      });
    },
    // 获取工作台消息的数量
    getMessageByUserIdCountNum() {
      if (this.userInfo.admin) {
        this.isAdmin = false;
      }
      getMessageByUserIdCount(this.userInfo.userId).then(res => {
        this.num = res.data;
      })
    },
    // 紧急程度字典翻译
    urgencyFormat(row, column) {
      return this.selectDictLabel(this.urgencyOptions, row.urgency);
    },
    // 是否已支付字典翻译
    isPaymentFormat(row, column) {
      return this.selectDictLabel(this.isPaymentOptions, row.isPayment);
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
        collaboratorDeptId: null,
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
        this.open01 = true;
        this.title01 = "项目信息";
      });
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      // 点击新增按钮后，给用户和协同人列表设置为空
      this.userList = [];
      this.collaboratorList = [];
      this.open = true;
      this.title = "添加项目";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      console.log(id, 'id')
      if (Array.isArray(id)) {
        this.editParams.id = id[0];
      } else {
        this.editParams.id = id;
      }
      listTask(this.editParams).then(res => {
        this.form = res.rows[0];
        this.open = true;
        this.title = "修改项目";
        // 查到信息后，调用更新用户信息和协同人信息的方法，传入用户的部门 ID 和协同人的部门 ID。
        this.updateUserId(this.form.deptId);
        this.updateCollaboratorId(this.form.collaboratorDeptId);
      })
    },
    /** 消息按钮 */
    handleShowMessage() {
      console.log("消息按钮")
      this.messageParams.userId = this.userInfo.userId;
      console.log(this.messageParams, "this.messageParams");
      listByCollaboratorId(this.messageParams).then(res => {
        console.log(res, "res");
        this.messageProjectsList = res.rows;
        this.open02 = true;
      })
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            console.log(this.form, "提交 this.form")
            updateProjects(this.form).then(response => {
              this.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addProjects(this.form).then(response => {
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
      this.$confirm('是否确认删除项目编号为"' + ids + '"的数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(function () {
        return delProjects(ids);
      }).then(() => {
        this.getList();
        this.msgSuccess("删除成功");
      })
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('system/projects/export', {
        ...this.queryParams
      }, `system_projects.xlsx`)
    }
  },
}
</script>
