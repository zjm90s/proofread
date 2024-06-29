<template>
    <el-menu
            default-active="2"
            class="sider-menu"
            :collapse="isCollapse"
            @open="handleOpen"
            @close="handleClose"
    >
        <el-sub-menu index="1">
            <template #title>
                <el-icon><location /></el-icon>
                <span>Navigator One</span>
            </template>
            <el-menu-item-group>
                <template #title><span>Group One</span></template>
                <el-menu-item index="1-1">item one</el-menu-item>
                <el-menu-item index="1-2">item two</el-menu-item>
            </el-menu-item-group>
            <el-menu-item-group title="Group Two">
                <el-menu-item index="1-3">item three</el-menu-item>
            </el-menu-item-group>
            <el-sub-menu index="1-4">
                <template #title><span>item four</span></template>
                <el-menu-item index="1-4-1">item one</el-menu-item>
            </el-sub-menu>
        </el-sub-menu>
        <el-menu-item index="2">
            <el-icon><icon-menu /></el-icon>
            <template #title>Navigator Two</template>
        </el-menu-item>
        <el-menu-item index="3" disabled>
            <el-icon><document /></el-icon>
            <template #title>Navigator Three</template>
        </el-menu-item>
        <el-menu-item index="4">
            <el-icon><setting /></el-icon>
            <template #title>Navigator Four</template>
        </el-menu-item>

        <div class="sider-collapse" @click="() => (isCollapse = !isCollapse)">
            <el-icon>
                <Fold v-if="!isCollapse"/>
                <Expand v-else/>
            </el-icon>
        </div>
    </el-menu>
</template>

<script setup>
import { ref } from 'vue'
import {
    Document,
    Menu as IconMenu,
    Location,
    Setting,
    Expand,
    Fold
} from '@element-plus/icons-vue'

const isCollapse = ref(false)
const handleOpen = (key, keyPath) => {
    console.log(key, keyPath)
}
const handleClose = (key, keyPath) => {
    console.log(key, keyPath)
}
</script>

<style>
.sider-collapse {
    position: absolute;
    bottom: 0;
    border-top: 1px solid var(--el-menu-border-color);
    width: 100%;
    cursor: pointer;
}
.sider-collapse > .el-icon {
    margin: 15px 23px;
}
</style>
