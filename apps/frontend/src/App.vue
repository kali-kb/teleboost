<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import LandingPage from './pages/LandingPage.vue';
import AdvertiserDashboard from './pages/AdvertiserDashboard.vue';

// Simple hash-based routing
const currentRoute = ref<'landing' | 'dashboard'>('landing');

const updateRoute = () => {
  const hash = window.location.hash;
  if (hash === '#/dashboard') {
    currentRoute.value = 'dashboard';
  } else {
    currentRoute.value = 'landing';
  }
};

onMounted(() => {
  updateRoute();
  window.addEventListener('hashchange', updateRoute);
});

onUnmounted(() => {
  window.removeEventListener('hashchange', updateRoute);
});
</script>

<template>
  <LandingPage v-if="currentRoute === 'landing'" />
  <AdvertiserDashboard v-else-if="currentRoute === 'dashboard'" />
</template>

<style>
/* Global styles are in style.css */
</style>
