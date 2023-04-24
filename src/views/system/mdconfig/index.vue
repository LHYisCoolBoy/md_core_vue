<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="标签" prop="tag">
        <el-select v-model="queryParams.tag" placeholder="请选择标签" clearable size="small">
          <el-option label="请选择字典生成" value=""/>
        </el-select>
      </el-form-item>
      <el-form-item label="封面类型" prop="type">
        <el-select v-model="queryParams.type" placeholder="请选择封面类型" clearable size="small">
          <el-option label="请选择字典生成" value=""/>
        </el-select>
      </el-form-item>
      <el-form-item label="轮播次数" prop="rotationNum">
        <el-select v-model="queryParams.rotationNum" placeholder="请选择轮播次数" clearable size="small">
          <el-option label="请选择字典生成" value=""/>
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
          v-hasPermi="['system:mdconfig:add']"
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
          v-hasPermi="['system:mdconfig:edit']"
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
          v-hasPermi="['system:mdconfig:remove']"
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
          v-hasPermi="['system:mdconfig:export']"
        >导出
        </el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="mdconfigList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center"/>
      <el-table-column label="主键" align="center" prop="id"/>
      <el-table-column label="资讯模块" align="center">
      <template slot-scope="scope">
        <!--1 - banner 图，2 - 专题，3 - 推荐-->
        <span v-if="scope.row.isId == 1">模范光荣榜</span>
        <span v-if="scope.row.isId == 2">青字号风采</span>
        <span v-if="scope.row.isId == 3">青春光明行</span>
        <span v-if="scope.row.isId == 4">央企帮扶</span>
        <span v-if="scope.row.isId == 5">团团矩阵</span>
      </template>
      </el-table-column>
      <el-table-column label="标签" align="center">
        <template slot-scope="scope">
          <!--1 - banner 图，2 - 专题，3 - 推荐-->
          <span v-if="scope.row.tag == 1">banner 图</span>
          <span v-if="scope.row.tag == 2">专题</span>
          <span v-if="scope.row.tag == 3">推荐</span>
        </template>
      </el-table-column>
      <el-table-column label="封面类型" align="center">
        <template slot-scope="scope">
          <span v-if="scope.row.type == 1">图片</span>
          <span v-if="scope.row.type == 2">视频</span>
        </template>
      </el-table-column>
      <!--<el-table-column label="素材预览" align="center" prop="url" /> -->
      <el-table-column label="素材预览" align="center">
        <template slot-scope="scope">
<!--          {{scope.row.type}}-->
          <img :src="scope.row.url" alt="" style="width:100%;height:150px;" v-if="scope.row.type == 1">
          <video-player style="width: 100%;height: 100%;margin:0 auto;"  class="video-player vjs-custom-skin"
                        ref="videoPlayer"
                        :playsinline="true"
                        :options="playerOptions(scope.row)"
                        v-if="scope.row.type == 2"

          >
          </video-player>
        </template>
      </el-table-column>
      <el-table-column label="文章" align="center" prop="essayId">
        <template slot-scope="scope">
          <span v-for="(item,index) in options" :key="index">
            <span v-if="scope.row.essayId == item.id">{{item.name}}</span>
          </span>
<!--          <span v-if="scope.row.type == 1">图片</span>-->
<!--          <span v-if="scope.row.type == 2">视频</span>-->
        </template>
      </el-table-column>
      <el-table-column label="轮播次数" align="center" prop="rotationNum"/>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['system:mdconfig:edit']"
          >修改
          </el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['system:mdconfig:remove']"
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

    <!-- 添加或修改推荐配置对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="资讯分类" prop="tag">
          <el-select v-model="form.isId" placeholder="资讯分类">
            <!--1 - banner 图，2 - 专题，3 - 推荐-->
            <el-option label="模范光荣榜" value="1"/>
            <el-option label="青字号风采" value="2"/>
            <el-option label="青春光明行" value="3"/>
            <el-option label="央企帮扶" value="4"/>
            <el-option label="团团矩阵" value="5"/>
          </el-select>
        </el-form-item>
        <el-form-item label="标签" prop="tag">
          <el-select v-model="form.tag" placeholder="请选择标签">
            <!--1 - banner 图，2 - 专题，3 - 推荐-->
            <el-option label="banner 图" value="1"/>
            <el-option label="专题" value="2"/>
            <el-option label="推荐" value="3"/>
          </el-select>
        </el-form-item>
        <el-form-item label="封面类型" prop="type">
          <el-select v-model="form.type" placeholder="请选择封面类型">
            <el-option
              v-for="item in option"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="素材地址">
          <fileUpload v-model="form.url"/>
        </el-form-item>
        <el-form-item label="文章" prop="essayId">
          <el-select v-model="form.essayId" placeholder="请选择文章">
            <el-option
              v-for="item in options"
              :key="item.id"
              :label="item.name"
              :value=" parseInt(item.id)">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="轮播次数" prop="rotationNum">
          <el-select v-model="form.rotationNum" placeholder="请选择轮播次数">
            <el-option label="1" value="1"/>
            <el-option label="2" value="2"/>
            <el-option label="3" value="3"/>
            <el-option label="4" value="4"/>
            <el-option label="5" value="5"/>
          </el-select>
        </el-form-item>
        <el-form-item label="资讯标题" prop="infoTitle">
          <el-input v-model="form.infoTitle" type="textarea" placeholder="请输入内容"/>
        </el-form-item>
        <el-form-item label="是否启用" prop="isDelete">
          <el-select v-model="form.isDelete" placeholder="请选择是否启用">
            <el-option
              v-for="dict in isDeleteOptions"
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
  </div>
</template>

<script>
import { listMdconfig, getMdconfig, delMdconfig, addMdconfig, updateMdconfig, optonlist } from '@/api/system/mdconfig'
import FileUpload from '@/components/FileUpload'

export default {
  name: 'Mdconfig',
  components: {
    FileUpload
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
      // 推荐配置表格数据
      mdconfigList: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 是否启用字典
      isDeleteOptions: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        tag: null,
        type: null,
        rotationNum: null
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        createTime: [
          { required: true, message: '创建时间不能为空', trigger: 'blur' }
        ],
        updateTime: [
          { required: true, message: '更新时间不能为空', trigger: 'blur' }
        ],
        isDelete: [
          { required: true, message: '是否启用不能为空', trigger: 'change' }
        ]
      },
      options: [],
      option: [{
        value: 1,
        label: '图片'
      }, {
        value: 2,
        label: '视频'
      }],
      playerOptions :	{
        playbackRates: [0.5, 1.0, 1.5, 2.0], //播放速度
        autoplay: false, //如果true,浏览器准备好时开始回放。
        muted: false, // 默认情况下将会消除任何音频。
        loop: false, // 导致视频一结束就重新开始。
        radio: '2',
        preload: 'auto', // 建议浏览器在<video>加载元素后是否应该开始下载视频数据。auto浏览器选择最佳行为,立即开始加载视频（如果浏览器支持）
        language: 'zh-CN',
        aspectRatio: '16:9', // 将播放器置于流畅模式，并在计算播放器的动态大小时使用该值。值应该代表一个比例 - 用冒号分隔的两个数字（例如"16:9"或"4:3"）
        fluid: true, // 当true时，Video.js player将拥有流体大小。换句话说，它将按比例缩放以适应其容器。
        sources: [{
          type: "video/mp4",
          src: "http://clips.vorwaerts-gmbh.de/big_buck_bunny.mp4" //url地址
        }],
        poster: "", //你的封面地址
        // width: document.documentElement.clientWidth,
        notSupportedMessage: '此视频暂无法播放，请稍后再试', //允许覆盖Video.js无法播放媒体源时显示的默认信息。
        controlBar: {
          timeDivider: true,
          durationDisplay: true,
          remainingTimeDisplay: false,
          fullscreenToggle: true  //全屏按钮
        }
      },
    }
  },
  created() {
    this.getList()
    this.getDicts('sys_status').then(response => {
      this.isDeleteOptions = response.data
    })
    optonlist().then(res=>{
      this.options=res.data
    })
  },
  methods: {
    videoUrl(url){
      console.log(url,"irwqeqwyeuyqe")
    },
    /** 查询推荐配置列表 */
    getList() {
      this.loading = true
      listMdconfig(this.queryParams).then(response => {
        this.mdconfigList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    // 是否启用字典翻译
    isDeleteFormat(row, column) {
      return this.selectDictLabel(this.isDeleteOptions, row.isDelete)
    },
    // 取消按钮
    cancel() {
      this.open = false
      this.reset()
    },
    // 表单重置
    reset() {
      this.form = {
        id: null,
        tag: null,
        type: null,
        url: null,
        essayId: null,
        rotationNum: null,
        infoTitle: null,
        createTime: null,
        updateTime: null,
        isDelete: null
      }
      this.resetForm('form')
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm('queryForm')
      this.handleQuery()
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset()
      this.open = true
      this.title = '添加推荐配置'
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      const id = row.id || this.ids
      getMdconfig(id).then(response => {
        this.form = response.data
        this.open = true
        this.title = '修改推荐配置'
      })
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateMdconfig(this.form).then(response => {
              this.msgSuccess('修改成功')
              this.open = false
              this.getList()
            })
          } else {
            addMdconfig(this.form).then(response => {
              this.msgSuccess('新增成功')
              this.open = false
              this.getList()
            })
          }
        }
      })
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids
      this.$confirm('是否确认删除推荐配置编号为"' + ids + '"的数据项?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(function() {
        return delMdconfig(ids)
      }).then(() => {
        this.getList()
        this.msgSuccess('删除成功')
      })
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('system/mdconfig/export', {
        ...this.queryParams
      }, `system_mdconfig.xlsx`)
    }
  }
}
</script>
