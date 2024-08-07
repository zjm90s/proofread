<template>
    <el-dialog v-model="$globalState.settingVisible" title="设置" width="500">
        <el-form :model="form">
            <el-form-item label="秘钥" :label-width="formLabelWidth">
                <el-input v-model="form.secretKey"/>
            </el-form-item>
        </el-form>
        <template #footer>
            <div class="dialog-footer">
                <el-button @click="$globalState.settingVisible = false">取消</el-button>
                <el-button type="primary" @click="onSubmit">保存</el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script lang="ts" setup>
import { reactive, inject } from 'vue'
import Cookies from 'js-cookie'

const $globalState = inject('$globalState')

const formLabelWidth = '50'

const form = reactive({
    secretKey: ''
})

const onSubmit = () => {
    $globalState.settingVisible = false
    Cookies.set('ai_secret_key', form.secretKey, { expires: 7 })
}
</script>
