<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { authClient } from '../../lib/auth-client';
import DashboardOverview from '../components/dashboard/DashboardOverview.vue';
import CampaignsView from '../components/dashboard/CampaignsView.vue';
import WalletView from '../components/dashboard/WalletView.vue';
import SettingsView from '../components/dashboard/SettingsView.vue';
import ChannelSearchView from '../components/dashboard/ChannelSearchView.vue';
import CampaignCart from '../components/dashboard/CampaignCart.vue';



// Navigation state
const currentPage = ref<'home' | 'campaigns' | 'wallet' | 'settings' | 'search_channels'>('home');

const isSidebarOpen = ref(true);
const isMobileSidebarOpen = ref(false);
const isLoadingUser = ref(true);

// Mock user data (In production, this would come from a store like Pinia)
const user = ref({
  name: '',
  email: '',
  company: '',
  type: 'INDIVIDUAL' as 'INDIVIDUAL' | 'ENTERPRISE',
  avatar: null as string | null
});

onMounted(async () => {
  try {
    const { data: sessionData } = await authClient.getSession();
    if (sessionData?.user) {
      user.value.name = sessionData.user.name;
      user.value.email = sessionData.user.email;
      user.value.avatar = sessionData.user.image || null;

      // also fetch advertiser details
      const response = await fetch("http://localhost:3001/api/advertiser/profile", {
        credentials: 'include'
      });
      const profile = await response.json();
      if (profile && !profile.error && profile.exists !== false) {
        user.value.type = profile.type;
        user.value.company = profile.company_name || '';
      }
    }
  } catch (err) {
    console.error("Failed to load user data:", err);
  } finally {
    isLoadingUser.value = false;
  }
});

// Mock wallet data
const wallet = ref({
  balance: 15420.50,
  locked: 3500.00,
  currency: 'ETB',
  recentTransactions: [
    { id: '1', type: 'deposit', amount: 5000, date: '2024-12-28', status: 'completed' },
    { id: '2', type: 'campaign', amount: -1200, date: '2024-12-27', status: 'completed', campaign: 'Winter Sale' },
    { id: '3', type: 'campaign', amount: -800, date: '2024-12-25', status: 'completed', campaign: 'New Year Promo' },
  ]
});

// Mock campaigns data
const campaigns = ref([
  { id: '1', name: 'Winter Sale Campaign', status: 'ACTIVE', budget: 5000, spent: 2340, impressions: 45200, placements: 12, created: '2024-12-20' },
  { id: '2', name: 'New Year Promo', status: 'DRAFT', budget: 3000, spent: 0, impressions: 0, placements: 0, created: '2024-12-28' },
  { id: '3', name: 'Brand Awareness Q4', status: 'COMPLETED', budget: 8000, spent: 7850, impressions: 156000, placements: 25, created: '2024-11-15' },
  { id: '4', name: 'Product Launch', status: 'PAUSED', budget: 4500, spent: 1200, impressions: 23000, placements: 8, created: '2024-12-10' },
]);

const navItems = [
  { id: 'home', label: 'Dashboard', icon: 'dashboard' },
  { id: 'campaigns', label: 'Campaigns', icon: 'campaign' },
  { id: 'wallet', label: 'Wallet', icon: 'account_balance_wallet' },
  { id: 'settings', label: 'Settings', icon: 'settings' },
];

const setPage = (page: typeof currentPage.value) => {
  currentPage.value = page;
  isMobileSidebarOpen.value = false;
};
</script>

<template>
  <div class="min-h-screen bg-slate-50 flex">
    <!-- Mobile Sidebar Overlay -->
    <div v-if="isMobileSidebarOpen" class="fixed inset-0 bg-slate-900/50 z-40 lg:hidden" @click="isMobileSidebarOpen = false"></div>

    <!-- Sidebar -->
    <aside 
      class="fixed lg:sticky top-0 left-0 z-50 h-screen bg-white border-r border-slate-200 transition-all duration-300 flex flex-col"
      :class="[
        isSidebarOpen ? 'w-64' : 'w-20',
        isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      ]">
      <!-- Logo -->
      <div class="h-16 flex items-center px-6 border-b border-slate-100">
        <div class="flex items-center gap-3">
          <img src="/images/teleboost.png" alt="teleboost logo" class="size-8 object-contain" />
          <span v-if="isSidebarOpen" class="font-black text-xl text-slate-900 tracking-tight">teleboost</span>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 p-4 space-y-1">
        <button v-for="item in navItems" :key="item.id"
          @click="setPage(item.id as typeof currentPage)"
          class="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left"
          :class="currentPage === item.id 
            ? 'bg-emerald-50 text-primary font-bold' 
            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'">
          <span class="material-symbols-outlined text-[22px]">{{ item.icon }}</span>
          <span v-if="isSidebarOpen" class="text-sm">{{ item.label }}</span>
        </button>
      </nav>

      <!-- User Profile -->
      <div class="p-4 border-t border-slate-100">
        <div v-if="isLoadingUser" class="flex items-center gap-3 px-2 animate-pulse">
           <div class="size-10 bg-slate-200 rounded-full"></div>
           <div v-if="isSidebarOpen" class="flex-1 space-y-2">
             <div class="h-3 bg-slate-200 rounded w-24"></div>
             <div class="h-2 bg-slate-100 rounded w-32"></div>
           </div>
        </div>
        <div v-else class="flex items-center gap-3 px-2">
          <div v-if="user.avatar" class="size-10 rounded-full overflow-hidden border border-slate-100">
            <img :src="user.avatar" class="size-full object-cover" @error="user.avatar = null" />
          </div>
          <div v-else class="size-10 bg-slate-200 rounded-full flex items-center justify-center text-slate-600 font-bold">
            {{ user.name ? user.name.charAt(0) : '?' }}
          </div>
          <div v-if="isSidebarOpen" class="flex-1 min-w-0">
            <p class="text-sm font-bold text-slate-900 truncate">{{ user.name || 'User' }}</p>
            <p class="text-xs text-slate-500 truncate">{{ user.email }}</p>
          </div>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 min-w-0">
      <!-- Top Header -->
      <header class="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-30">
        <div class="flex items-center gap-4">
          <button @click="isMobileSidebarOpen = true" class="lg:hidden p-2 hover:bg-slate-100 rounded-lg text-slate-600">
            <span class="material-symbols-outlined">menu</span>
          </button>
          <button @click="isSidebarOpen = !isSidebarOpen" class="hidden lg:flex p-2 hover:bg-slate-100 rounded-lg text-slate-600">
            <span class="material-symbols-outlined">{{ isSidebarOpen ? 'menu_open' : 'menu' }}</span>
          </button>
          <h1 class="text-lg font-bold text-slate-900 capitalize">
            {{ currentPage === 'home' ? 'Dashboard' : currentPage.replace('_', ' ') }}
          </h1>
        </div>
        <div class="flex items-center gap-3">
          <button class="p-2 hover:bg-slate-100 rounded-lg text-slate-600 relative">
            <span class="material-symbols-outlined">notifications</span>
            <span class="absolute top-1 right-1 size-2 bg-rose-500 rounded-full"></span>
          </button>
          <button 
            @click="setPage('search_channels')"
            class="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg font-bold text-sm transition-colors"
          >
            <span class="material-symbols-outlined text-[18px]">add</span>
            New Campaign
          </button>

        </div>
      </header>

      <!-- Page Content -->
      <div class="p-6">
        <component 
          :is="currentPage === 'home' ? DashboardOverview : 
               currentPage === 'campaigns' ? CampaignsView : 
               currentPage === 'wallet' ? WalletView : 
               currentPage === 'search_channels' ? ChannelSearchView :
               SettingsView"

          :user="user"
          :wallet="wallet"
          :campaigns="campaigns"
          @setPage="setPage"
        />
      </div>
    </main>

    <!-- Campaign Plan / Cart -->
    <CampaignCart />
  </div>
</template>


<style scoped>
</style>
