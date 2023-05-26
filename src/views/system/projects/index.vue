<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="用户" prop="userId">
        <el-select v-model="queryParams.userId" placeholder="请选择用户" clearable size="small">
          <el-option
            v-for="(user,index) in uniqueProjectsByUserList"
            :key="index"
            :label="user.nickName"
            :value="user.userId"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="部门" prop="deptId">
        <el-select v-model="queryParams.deptId" placeholder="请选择部门" clearable size="small">
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
      <el-col :span="1.5">
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
      <el-table-column label="项目的开始时间" align="center" prop="startTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.startTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="项目预计的结束时间" align="center" prop="endTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.endTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <!-- <el-table-column label="费用出处" align="center" prop="expenseSource"/> -->
      <el-table-column label="费用金额" align="center" prop="expenseAmount"/>
      <el-table-column label="是否已支付" align="center" prop="isPayment" :formatter="isPaymentFormat"/>
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
        <el-form-item label="部门" prop="deptId">
          <el-select v-model="form.deptId" placeholder="请选择部门" @change="updateUserId">
            <el-option
              v-for="(dept,index) in uniqueProjectsByDeptList"
              :key="index"
              :label="dept.deptName"
              :value="dept.deptId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="用户" prop="userId">
          <el-select v-model="form.userId" placeholder="请选择用户">
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

        <el-form-item label="协同人部门" prop="collaboratorDeptId">
          <el-select v-model="form.collaboratorDeptId" placeholder="请选择协同人部门" @change="updateCollaboratorId">
            <el-option
              v-for="(dept,index) in uniqueProjectsByDeptList"
              :key="index"
              :label="dept.deptName"
              :value="dept.deptId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="协同人" prop="collaboratorId">
          <el-select v-model="form.collaboratorId"
                     placeholder="请选择协同人">
            <el-option
              v-for="(user,index) in uniqueByCollaboratorList"
              :key="index"
              :label="user.collaboratorName"
              :value="user.collaboratorId"
            />
          </el-select>
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
        <el-form-item label="项目描述" prop="description">
          <el-input v-model="form.description" type="textarea" placeholder="请输入内容"/>
        </el-form-item>
        <el-form-item label="项目的开始时间" prop="startTime">
          <el-date-picker clearable size="small"
                          v-model="form.startTime"
                          type="date"
                          value-format="yyyy-MM-dd"
                          placeholder="选择项目的开始时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="项目预计的结束时间" prop="endTime">
          <el-date-picker clearable size="small"
                          v-model="form.endTime"
                          type="date"
                          value-format="yyyy-MM-dd"
                          placeholder="选择项目预计的结束时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="费用出处" prop="expenseSource">
          <el-input v-model="form.expenseSource" placeholder="请输入费用出处"/>
        </el-form-item>
        <el-form-item label="费用金额" prop="expenseAmount">
          <el-input v-model="form.expenseAmount" placeholder="请输入费用金额"/>
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
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <el-dialog :title="title01" :visible.sync="open01" width="800px" append-to-body>
      <el-form disabled ref="form" :model="form" :rules="rules" label-width="150px">
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
      <el-table v-loading="loading" :data="messageProjectsList">
        <el-table-column label="主键" align="center" prop="id"/>
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
        <el-table-column label="协同人" align="center" prop="collaboratorName"/>
        <el-table-column label="协同人部门" align="center" prop="collaboratorDeptName"/>
        <el-table-column label="紧急程度" align="center" prop="urgency" :formatter="urgencyFormat"/>
        <el-table-column label="项目描述" align="center" prop="description"/>
        <el-table-column label="项目的开始时间" align="center" prop="startTime" width="180">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.startTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="项目预计的结束时间" align="center" prop="endTime" width="180">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.endTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="费用出处" align="center" prop="expenseSource"/>
        <el-table-column label="费用金额" align="center" prop="expenseAmount"/>
        <el-table-column label="是否已支付" align="center" prop="isPayment" :formatter="isPaymentFormat"/>
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
      },
      editParams: {
        pageNum: 1,
        pageSize: 10,
        id: null
      },
      editDeptId: {
        deptId: null
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
  },
  methods: {
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
      this.editDeptId.deptId = val;
      listProjectsByDeptId(this.editDeptId).then(res => {
        this.collaboratorList = res.data;
      });
    },
    /** 查询项目列表 */
    getList() {
      this.loading = true;
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
      this.queryParams.id = id;
      listTask(this.queryParams).then(response => {
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
      this.loading = true;
      this.queryParams.isPayment = 0;
      this.queryParams.userId = this.userInfo.userId;
      listByCollaboratorId(this.queryParams).then(res => {
        console.log(res, "res");
        this.messageProjectsList = res.rows;
        this.open02 = true;
        this.total = res.total;
        this.loading = false;
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
