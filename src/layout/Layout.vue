<template>
    <Header/>
    <div class="am-container">
<!--        <Sider/>-->
        <div class="main-container">
            <router-view></router-view>
        </div>
    </div>
</template>

<script setup>
import Header from '@/layout/Header.vue'
import Sider from "@/layout/Sider.vue";
</script>

<style>
.am-container {
    display: flex;
    height: calc(100vh - var(--el-menu-item-height) - 4px);
}
.main-container {
    margin-left: auto;
    margin-right: auto;
    padding: 30px;
    width: 100%;
}
</style>
