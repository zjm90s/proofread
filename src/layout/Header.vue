<template>
    <el-menu router :default-active="$route.path" class="header-menu" mode="horizontal">
<!--        <el-menu-item>-->
<!--            <img style="width: 100px" src="../assets/element-logo.svg" alt="Logo"/>-->
<!--        </el-menu-item>-->
        <el-menu-item>
            <span class="text-log">
                <el-icon :size="25"><Management/></el-icon>
                <span>校 ~ 对</span>
            </span>
        </el-menu-item>
        <el-menu-item index="/textDiff">文本比对</el-menu-item>
        <el-menu-item index="/pdfDiff">PDF比对</el-menu-item>
        <el-menu-item index="/refDupCheck">参考文献去重</el-menu-item>
        <el-menu-item index="/pdfCheck" v-if="$globalState.vip">PDF校对</el-menu-item>
    </el-menu>

    <div class="setting" v-if="$globalState.vip" @click="openSetting">
        <el-icon><Setting/></el-icon>
    </div>

    <SettingView></SettingView>
</template>

<script setup>
import { inject } from 'vue'
import { Management, Setting } from '@element-plus/icons-vue'
import SettingView from "@/layout/SettingView.vue"

const $globalState = inject('$globalState')

const openSetting = () => {
    $globalState.settingVisible = true
}
</script>

<style>
.setting {
    position: absolute;
    top: 22px;
    right: 22px;
    cursor: pointer;
}
.text-log {
    width: 100px;
    font-size: 16px;
    font-weight: bold;
    color: #589ef8;
}
</style>