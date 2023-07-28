<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="项目名" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入项目名"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="上传时间
" prop="time">
        <el-date-picker clearable size="small"
          v-model="queryParams.time"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="选择上传时间
">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="部门" prop="deptId">
        <el-input
          v-model="queryParams.deptId"
          placeholder="请输入部门id"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="用户" prop="userId">
        <el-input
          v-model="queryParams.userId"
          placeholder="请输入用户"
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
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['system:ydisk:add']"
        >上传新文件</el-button>
      </el-col>
      <!--<el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['system:ydisk:edit']"
        >修改</el-button>
      </el-col> -->
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['system:ydisk:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['system:ydisk:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="ydiskList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="主键" align="center" prop="id" />
      <el-table-column label="项目名" align="center" prop="name" />
      <el-table-column label="文件数量" align="center" prop="urlNo" />
      <el-table-column label="上传时间
" align="center" prop="time" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.time, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="部门" align="center" prop="deptId" />
      <el-table-column label="用户" align="center" prop="userId" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-download"
            style="margin-right:10px"
            @click="down(scope.row)"
          >下载</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-s-promotion"
            style="margin-right:10px"
            @click="share(scope.row)"
          >分享</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['system:ydisk:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['system:ydisk:remove']"
          >删除</el-button>
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

    <!-- 添加或修改捷电网盘对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="项目名" prop="name">
          <el-input v-model="form.name" placeholder="请输入项目名" />
        </el-form-item>
        <el-form-item label="文件地址">
          <fileUpload v-model="form.url" ref="fileUpload"/>
        </el-form-item>
        <el-form-item label="上传时间
" prop="time">
          <el-date-picker clearable size="small"
            v-model="form.time"
            type="date"
            value-format="yyyy-MM-dd"
            placeholder="选择上传时间
">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="部门" prop="deptId" v-if="title != '上传新文件'">
          <el-input v-model="form.deptId" placeholder="请输入部门id" disabled />
        </el-form-item>
        <el-form-item label="用户" prop="userId" v-if="title != '上传新文件'">
          <el-input v-model="form.userId" placeholder="请输入用户id" disabled />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
    <!-- 下载弹框 -->
    <el-dialog title="文件下载" :visible.sync="open3" width="500px" append-to-body>
      <transition-group class="upload-file-list el-upload-list el-upload-list--text" name="el-fade-in-linear" tag="ul">
      <li class="el-upload-list__item ele-upload-list__item-content" v-for="(item, index) in copyDown" :key="index">
        <el-link :href="item.toString()" :underline="false" target="_blank">
          <span class="el-icon-document" v-html="getFileName(item.toString())"> </span>
        </el-link>
      </li>
    </transition-group>
    </el-dialog>
    <!-- 分享弹框 -->
    <el-dialog title="文件分享链接" :visible.sync="open4" width="600px" append-to-body>
      <transition-group class="upload-file-list el-upload-list el-upload-list--text" name="el-fade-in-linear" tag="ul">
      <li v-for="(item, index) in copyDown" :key="index">
          <span>{{item}}</span>
      </li>
    </transition-group>
    </el-dialog>
  </div>
</template>

<script>
import { listYdisk, getYdisk, delYdisk, addYdisk, updateYdisk } from "@/api/system/ydisk";
import FileUpload from '@/components/multiple';

export default {
  name: "Ydisk",
  components: {
    FileUpload,
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
      // 捷电网盘表格数据
      ydiskList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      //下载弹出层
      open3: false,
      //分享弹出层
      open4: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        name: null,
        time: null,
        deptId: null,
        userId: null
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
      },
      //当前下载文件数据
      copyDown:[],
    };
  },
  created() {
    this.getList();
  },
  methods: {
    //分享弹框
    share(urls){
      this.copyDown = urls.url.split(',')
      this.open4 = true
    },
    //下载文件
    down(urls){
      this.copyDown = urls.url.split(',')
      this.open3 = true
    },
    // 获取文件名称
    getFileName(name) {
      if (name.lastIndexOf("/") > -1) {
        return name.slice(name.lastIndexOf("/") + 1).toLowerCase();
      } else {
        return "";
      }
    },
    /** 查询捷电网盘列表 */
    getList() {
      this.loading = true;
      listYdisk(this.queryParams).then(response => {
        this.ydiskList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.$refs.fileUpload.handleDelete()
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        id: null,
        name: null,
        time: null,
        deptId: null,
        userId: null
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
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "上传新文件";
      this.form.url = ''
      this.$nextTick(res=>{
        this.$refs.fileUpload.valueCopy = []
      })
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getYdisk(id).then(response => {
        this.form = response.data;
        this.form.url = this.form.url.split(',')
        this.open = true;
        this.title = "资源详情";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateYdisk(this.form).then(response => {
              this.msgSuccess("修改成功");
              this.$refs.fileUpload.handleDelete()
              this.open = false;
              this.getList();
            });
          } else {
            addYdisk(this.form).then(response => {
              this.msgSuccess("上传成功");
              this.$refs.fileUpload.handleDelete()
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
      this.$confirm('是否确认删除编号为"' + ids + '"的数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return delYdisk(ids);
        }).then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        })
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('system/ydisk/export', {
        ...this.queryParams
      }, `system_ydisk.xlsx`)
    }
  }
};
</script>

<style lang="scss" scoped>
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