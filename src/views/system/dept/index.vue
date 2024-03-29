<template>
  <el-card class="card-sys" :class="pageParams.full ? 'fullScreen' : ''">
    <div slot="header" class="clearfix">
      <div class="header-name">{{ pageParams.headerTitle }}</div>
      <div class="header-action">
        <el-button
          plain
          icon="el-icon-refresh"
          size="mini"
          @click="refreshTable"
        >
          刷新表格
        </el-button>
        <el-button
          size="mini"
          @click="changeFull"
          :plain="!pageParams.full"
          :icon="
            pageParams.full ? 'el-icon-switch-button' : 'el-icon-full-screen'
          "
          :type="pageParams.full ? 'primary' : ''"
        >
          {{ pageParams.full ? '退出全屏' : '表格全屏' }}
        </el-button>
      </div>
    </div>
    <el-row :gutter="0" style="margin-bottom:10px">
      <el-form
        ref="queryForm"
        :model="queryForm"
        :rules="queryFormRules"
        size="small"
        label-position="right"
        class="queryForm"
        label-width="80px"
        style="display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    align-content: center;
    justify-content: space-between;
    align-items: center;"
      >
        <!-- 部门名称 -->
        <div style="display:flex">
          <el-form-item label="部门名称:" prop="industryTitle">
            <el-input
              v-model="queryForm.industryTitle"
              placeholder="请输入部门名称"
              clearable
              :style="{ width: '100%' }"
            >
            </el-input>
          </el-form-item>

          <!-- 状态 -->

          <el-form-item label="状态:" prop="state">
            <el-select
              v-model="queryForm.state"
              placeholder="请选择状态"
              clearable
              :style="{ width: '100%' }"
            >
              <el-option
                v-for="(item, index) in stateOptions"
                :key="index"
                :label="item.label"
                :value="item.value"
                :disabled="item.disabled"
              ></el-option>
            </el-select>
          </el-form-item>

          <el-form-item label-width="20px">
            <div :style="{ width: '100%' }">
              <el-button
                type="primary"
                icon="el-icon-search"
                size="small"
                @click="submitQueryForm"
              >
                查 询
              </el-button>
              <el-button
                type="warning"
                icon="el-icon-refresh-right"
                size="small"
                @click="resetQueryForm('queryForm')"
              >
                重 置
              </el-button>
            </div>
          </el-form-item>
        </div>

        <div style="display:flex">
          <el-form-item label-width="10px"
            ><el-button
              type="primary"
              icon="el-icon-circle-plus"
              size="small"
              @click="editDialog('add')"
            >
              新建部门
            </el-button></el-form-item
          >
        </div>
      </el-form>
    </el-row>
    <el-table
      :indent="20"
      :data="treeTableData"
      size="small"
      :border="false"
      :stripe="true"
      highlight-current-row
      :header-cell-style="{
        background: pageParams.full ? '#e7eaff' : '',
        color: '#909399'
      }"
      v-loading="tableLoading"
      row-key="id"
      class="table-shadow"
      default-expand-all
      :tree-props="{ children: 'children' }"
      :height="!pageParams.full ? pageParams.normalFull : pageParams.fullFull"
      ><el-table-column type="index" label="No." width="60"> </el-table-column>
      <el-table-column prop="name" label="组织机构层级"> </el-table-column>
      <el-table-column label="操作" align="center" width="300">
        <template slot-scope="scope">
          <el-button
            type="text"
            size="small"
            icon="el-icon-edit"
            @click="editDialog('edit', scope.row)"
            >编辑</el-button
          >
          <el-divider direction="vertical"></el-divider>
          <el-popconfirm
            confirm-button-text="是的"
            cancel-button-text="取消"
            icon="el-icon-info"
            icon-color="red"
            title="确定删除整个部门？"
            @confirm="removeAndDel('del', scope.row)"
          >
            <el-button
              slot="reference"
              type="text"
              size="small"
              icon="el-icon-delete-solid"
              >删除</el-button
            >
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
    <app-footer class="footer" v-if="!pageParams.full"></app-footer>

    <Dialog ref="deptdialog" @fetch="fetch" :dialogParams="dialogParams">
    </Dialog>
  </el-card>
</template>

<script>
import { getDeptTree, deptDelete } from '@/api/system/dept'
import Dialog from './dialog.vue'
export default {
  components: {
    Dialog
  },
  inject: ['reload'],
  data() {
    return {
      // headerTitle: 'Header'
      dialogParams: {
        headerTitle: '编辑部门'
      },
      // 页面参数
      pageParams: {
        // 表Title
        headerTitle: this.$route.meta.title,
        // 全屏
        full: false,
        // 全屏后的table高度
        fullFull: 'calc(100vh - 150px)',
        // 正常table高度
        normalFull: 'calc(100vh - 251px)'
      },

      // 表格加载
      tableLoading: true,
      // 树treeData
      treeTableData: [],

      // 查询表单
      queryForm: {
        industryTitle: '',
        state: ''
      },
      // 查询表单规则
      queryFormRules: {
        industryTitle: [],
        state: []
      },

      // 状态选项
      stateOptions: []
    }
  },
  created() {
    this.getTree()
  },
  mounted() {},
  completed: {},
  methods: {
    submitForm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          alert('submit!')
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    resetForm(formName) {
      this.$refs[formName].resetFields()
    },
    // 获取树
    async getTree() {
      this.tableLoading = true
      await getDeptTree()
        .then(result => {
          console.log('🚀', result.data)
          const { data, retCode, retMsg } = result.data
          if (retCode === '000000') {
            this.timerLoading = setTimeout(() => {
              this.tableLoading = false
            }, 500)
            // todo: 待优化
            this.treeTableData = data[0].children
          } else {
            this.$message.error(retMsg)
          }
        })
        .catch(() => {
          console.error('getDeptTree')
        })
    },

    // 查询按钮
    submitQueryForm() {
      const submitForm = this.$lodash.cloneDeep(this.queryForm)
      console.log(submitForm)
    },
    // 重置查询条件
    resetQueryForm(formName) {
      this.$refs[formName].resetFields()
    },
    // 全屏
    changeFull() {
      this.pageParams.full = !this.pageParams.full
    },
    // 刷新表格
    refreshTable() {
      // this.changeTableSettings(true, 'normalFullFlag')
      this.reload()
    },
    // 点击确定传来的值
    fetch(formData) {
      // this.$message.success('OK')
      // console.log(formData)
      this.getTree()
    },
    editDialog(name, row) {
      if (name === 'edit') {
        // 编辑部门
        this.dialogParams.headerTitle = '编辑部门 - ' + row.name
        this.$refs.deptdialog.showDialog(name, row)
      } else if (name === 'add') {
        // 新建下级部门
        this.dialogParams.headerTitle = '新建下级部门'
        this.$refs.deptdialog.showDialog(name)
      } else {
        this.$message.error('调用失败...')
      }
    },
    async removeAndDel(name, row) {
      if (name === 'disable') {
        this.$message.success('ID：' + row.id + '； Name：' + name)
      } else if (name === 'disableAll') {
        this.$message.success('ID：' + row.id + '； Name：' + name)
      } else if (name === 'del') {
        await deptDelete(row.id)
          .then(result => {
            console.log('🚀', result.data)
            const { retCode, retMsg } = result.data
            if (retCode !== '000000') {
              this.$message.error(retMsg)
            } else {
              this.getTree()
              this.$message.success('部门：' + row.name + '  删除成功')
            }
          })
          .catch(() => {
            console.log('🛸🛸🛸🛸🛸🛸🛸')
          })
      } else if (name === 'delAll') {
        this.$message.success('ID：' + row.id + '； Name：' + name)
      } else {
        this.$message.error('调用失败...')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.card-sys {
  width: 100%;
  // .clearfix {
  //   display: flex;
  //   height: 50px;
  //   flex-direction: row;
  //   flex-wrap: nowrap;
  //   align-content: center;
  //   justify-content: space-between;
  //   align-items: center;
  //   .header-name {
  //     font-size: 20px;
  //     font-weight: 600;
  //     color: #000;
  //     overflow: hidden;
  //   }
  // }
}
</style>
