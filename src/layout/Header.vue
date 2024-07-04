<template>
    <el-menu router :default-active="$route.path" class="header-menu" mode="horizontal">
<!--        <el-menu-item>-->
<!--            <img style="width: 100px" src="../assets/element-logo.svg" alt="Logo"/>-->
<!--        </el-menu-item>-->
        <el-menu-item>
            <span class="text-log">
                <el-icon :size="55"><Management/></el-icon>
                <span>校 ~ 对</span>
            </span>
        </el-menu-item>
        <el-menu-item index="/textDiff">文本比对</el-menu-item>
        <el-menu-item index="/pdfDiff">PDF比对</el-menu-item>
        <el-menu-item index="/refDupCheck">参考文献去重</el-menu-item>
    </el-menu>
</template>

<script setup>
import { Management } from '@element-plus/icons-vue'
</script>

<style>
.text-log {
    width: 100px;
    font-size: 16px;
    font-weight: bold;
    color: #589ef8;
}
</style>