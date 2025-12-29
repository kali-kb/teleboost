<script setup lang="ts">
import { ref, computed } from 'vue';

// Navigation state
const currentPage = ref<'home' | 'campaigns' | 'wallet' | 'settings'>('home');
const isSidebarOpen = ref(true);
const isMobileSidebarOpen = ref(false);

// Mock user data
const user = ref({
  name: 'Abebe Kebede',
  email: 'abebe@company.et',
  company: 'TechStart Ethiopia',
  type: 'ENTERPRISE' as 'INDIVIDUAL' | 'ENTERPRISE',
  avatar: null
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

// Dashboard stats
const dashboardStats = computed(() => ({
  totalCampaigns: campaigns.value.length,
  activeCampaigns: campaigns.value.filter(c => c.status === 'ACTIVE').length,
  totalSpent: campaigns.value.reduce((sum, c) => sum + c.spent, 0),
  totalImpressions: campaigns.value.reduce((sum, c) => sum + c.impressions, 0),
}));

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

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    'ACTIVE': 'bg-emerald-100 text-emerald-700',
    'DRAFT': 'bg-slate-100 text-slate-600',
    'PAUSED': 'bg-amber-100 text-amber-700',
    'COMPLETED': 'bg-blue-100 text-blue-700',
    'CANCELLED': 'bg-rose-100 text-rose-700',
  };
  return colors[status] || 'bg-slate-100 text-slate-600';
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-ET', { minimumFractionDigits: 2 }).format(amount);
};

const formatNumber = (num: number) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
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
          <div class="size-10 bg-primary rounded-xl flex items-center justify-center">
            <span class="material-symbols-outlined text-white text-xl">ads_click</span>
          </div>
          <span v-if="isSidebarOpen" class="font-black text-xl text-slate-900 tracking-tight">TeleAds</span>
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
        <div class="flex items-center gap-3 px-2">
          <div class="size-10 bg-slate-200 rounded-full flex items-center justify-center text-slate-600 font-bold">
            {{ user.name.charAt(0) }}
          </div>
          <div v-if="isSidebarOpen" class="flex-1 min-w-0">
            <p class="text-sm font-bold text-slate-900 truncate">{{ user.name }}</p>
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
          <h1 class="text-lg font-bold text-slate-900 capitalize">{{ currentPage === 'home' ? 'Dashboard' : currentPage }}</h1>
        </div>
        <div class="flex items-center gap-3">
          <button class="p-2 hover:bg-slate-100 rounded-lg text-slate-600 relative">
            <span class="material-symbols-outlined">notifications</span>
            <span class="absolute top-1 right-1 size-2 bg-rose-500 rounded-full"></span>
          </button>
          <button class="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg font-bold text-sm transition-colors">
            <span class="material-symbols-outlined text-[18px]">add</span>
            New Campaign
          </button>
        </div>
      </header>

      <!-- Page Content -->
      <div class="p-6">
        <!-- ========== HOME / DASHBOARD ========== -->
        <template v-if="currentPage === 'home'">
          <!-- Stats Cards -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div class="bg-white rounded-2xl border border-slate-200 p-6">
              <div class="flex items-center justify-between mb-4">
                <div class="size-12 bg-emerald-50 rounded-xl flex items-center justify-center">
                  <span class="material-symbols-outlined text-primary text-2xl">account_balance_wallet</span>
                </div>
                <span class="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">ETB</span>
              </div>
              <p class="text-2xl font-black text-slate-900">{{ formatCurrency(wallet.balance) }}</p>
              <p class="text-sm text-slate-500 mt-1">Available Balance</p>
            </div>

            <div class="bg-white rounded-2xl border border-slate-200 p-6">
              <div class="flex items-center justify-between mb-4">
                <div class="size-12 bg-blue-50 rounded-xl flex items-center justify-center">
                  <span class="material-symbols-outlined text-blue-600 text-2xl">campaign</span>
                </div>
                <span class="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">{{ dashboardStats.activeCampaigns }} Active</span>
              </div>
              <p class="text-2xl font-black text-slate-900">{{ dashboardStats.totalCampaigns }}</p>
              <p class="text-sm text-slate-500 mt-1">Total Campaigns</p>
            </div>

            <div class="bg-white rounded-2xl border border-slate-200 p-6">
              <div class="flex items-center justify-between mb-4">
                <div class="size-12 bg-purple-50 rounded-xl flex items-center justify-center">
                  <span class="material-symbols-outlined text-purple-600 text-2xl">payments</span>
                </div>
              </div>
              <p class="text-2xl font-black text-slate-900">{{ formatCurrency(dashboardStats.totalSpent) }}</p>
              <p class="text-sm text-slate-500 mt-1">Total Spent</p>
            </div>

            <div class="bg-white rounded-2xl border border-slate-200 p-6">
              <div class="flex items-center justify-between mb-4">
                <div class="size-12 bg-amber-50 rounded-xl flex items-center justify-center">
                  <span class="material-symbols-outlined text-amber-600 text-2xl">visibility</span>
                </div>
              </div>
              <p class="text-2xl font-black text-slate-900">{{ formatNumber(dashboardStats.totalImpressions) }}</p>
              <p class="text-sm text-slate-500 mt-1">Total Impressions</p>
            </div>
          </div>

          <!-- Recent Campaigns & Transactions -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Recent Campaigns -->
            <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 class="font-bold text-slate-900">Recent Campaigns</h3>
                <button @click="setPage('campaigns')" class="text-sm text-primary font-medium hover:underline">View All</button>
              </div>
              <div class="divide-y divide-slate-100">
                <div v-for="campaign in campaigns.slice(0, 4)" :key="campaign.id" class="px-6 py-4 hover:bg-slate-50 transition-colors">
                  <div class="flex items-center justify-between mb-2">
                    <h4 class="font-medium text-slate-900">{{ campaign.name }}</h4>
                    <span :class="getStatusColor(campaign.status)" class="text-xs font-bold px-2 py-1 rounded-full">{{ campaign.status }}</span>
                  </div>
                  <div class="flex items-center gap-4 text-xs text-slate-500">
                    <span class="flex items-center gap-1">
                      <span class="material-symbols-outlined text-[14px]">payments</span>
                      {{ formatCurrency(campaign.spent) }} / {{ formatCurrency(campaign.budget) }}
                    </span>
                    <span class="flex items-center gap-1">
                      <span class="material-symbols-outlined text-[14px]">visibility</span>
                      {{ formatNumber(campaign.impressions) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Recent Transactions -->
            <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 class="font-bold text-slate-900">Recent Transactions</h3>
                <button @click="setPage('wallet')" class="text-sm text-primary font-medium hover:underline">View All</button>
              </div>
              <div class="divide-y divide-slate-100">
                <div v-for="tx in wallet.recentTransactions" :key="tx.id" class="px-6 py-4 hover:bg-slate-50 transition-colors">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                      <div class="size-10 rounded-full flex items-center justify-center"
                        :class="tx.amount > 0 ? 'bg-emerald-100' : 'bg-slate-100'">
                        <span class="material-symbols-outlined text-lg" :class="tx.amount > 0 ? 'text-emerald-600' : 'text-slate-600'">
                          {{ tx.amount > 0 ? 'arrow_downward' : 'arrow_upward' }}
                        </span>
                      </div>
                      <div>
                        <p class="font-medium text-slate-900 capitalize">{{ tx.type }}</p>
                        <p class="text-xs text-slate-500">{{ tx.date }}</p>
                      </div>
                    </div>
                    <p class="font-bold" :class="tx.amount > 0 ? 'text-emerald-600' : 'text-slate-900'">
                      {{ tx.amount > 0 ? '+' : '' }}{{ formatCurrency(tx.amount) }} ETB
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- ========== CAMPAIGNS ========== -->
        <template v-else-if="currentPage === 'campaigns'">
          <!-- Campaign Actions -->
          <div class="flex flex-col sm:flex-row gap-4 mb-6">
            <div class="flex-1 relative">
              <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
              <input type="text" placeholder="Search campaigns..." 
                class="w-full h-11 pl-12 pr-4 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-emerald-50 outline-none transition-all bg-white" />
            </div>
            <div class="flex gap-2">
              <select class="h-11 px-4 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700">
                <option>All Status</option>
                <option>Active</option>
                <option>Draft</option>
                <option>Paused</option>
                <option>Completed</option>
              </select>
              <button class="h-11 px-6 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold text-sm transition-colors flex items-center gap-2">
                <span class="material-symbols-outlined text-[18px]">add</span>
                Create Campaign
              </button>
            </div>
          </div>

          <!-- Campaigns Table -->
          <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead class="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th class="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-4">Campaign</th>
                    <th class="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-4">Status</th>
                    <th class="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-4">Budget</th>
                    <th class="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-4">Spent</th>
                    <th class="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-4">Impressions</th>
                    <th class="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-4">Placements</th>
                    <th class="text-right text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  <tr v-for="campaign in campaigns" :key="campaign.id" class="hover:bg-slate-50 transition-colors">
                    <td class="px-6 py-4">
                      <p class="font-medium text-slate-900">{{ campaign.name }}</p>
                      <p class="text-xs text-slate-500">Created {{ campaign.created }}</p>
                    </td>
                    <td class="px-6 py-4">
                      <span :class="getStatusColor(campaign.status)" class="text-xs font-bold px-3 py-1 rounded-full">{{ campaign.status }}</span>
                    </td>
                    <td class="px-6 py-4 font-medium text-slate-900">{{ formatCurrency(campaign.budget) }} ETB</td>
                    <td class="px-6 py-4 text-slate-600">{{ formatCurrency(campaign.spent) }} ETB</td>
                    <td class="px-6 py-4 text-slate-600">{{ formatNumber(campaign.impressions) }}</td>
                    <td class="px-6 py-4 text-slate-600">{{ campaign.placements }}</td>
                    <td class="px-6 py-4 text-right">
                      <button class="p-2 hover:bg-slate-100 rounded-lg text-slate-600">
                        <span class="material-symbols-outlined text-[20px]">more_vert</span>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </template>

        <!-- ========== WALLET ========== -->
        <template v-else-if="currentPage === 'wallet'">
          <!-- Wallet Overview -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div class="lg:col-span-2 bg-gradient-to-br from-primary to-teal-500 rounded-2xl p-8 text-white">
              <p class="text-white/80 text-sm font-medium mb-2">Available Balance</p>
              <p class="text-4xl font-black mb-6">{{ formatCurrency(wallet.balance) }} <span class="text-xl font-bold text-white/80">ETB</span></p>
              <div class="flex gap-3">
                <button class="px-6 py-3 bg-white text-primary rounded-xl font-bold text-sm hover:bg-white/90 transition-colors flex items-center gap-2">
                  <span class="material-symbols-outlined text-[18px]">add</span>
                  Add Funds
                </button>
                <button class="px-6 py-3 bg-white/20 text-white rounded-xl font-bold text-sm hover:bg-white/30 transition-colors flex items-center gap-2">
                  <span class="material-symbols-outlined text-[18px]">history</span>
                  History
                </button>
              </div>
            </div>
            <div class="bg-white rounded-2xl border border-slate-200 p-6">
              <div class="mb-4">
                <p class="text-sm text-slate-500 mb-1">Locked Balance</p>
                <p class="text-2xl font-black text-slate-900">{{ formatCurrency(wallet.locked) }} ETB</p>
              </div>
              <div class="pt-4 border-t border-slate-100">
                <p class="text-sm text-slate-500 mb-1">Currency</p>
                <p class="text-lg font-bold text-slate-900">Ethiopian Birr (ETB)</p>
              </div>
            </div>
          </div>

          <!-- Transaction History -->
          <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div class="px-6 py-4 border-b border-slate-100">
              <h3 class="font-bold text-slate-900">Transaction History</h3>
            </div>
            <div class="divide-y divide-slate-100">
              <div v-for="tx in wallet.recentTransactions" :key="tx.id" class="px-6 py-4 hover:bg-slate-50 transition-colors flex items-center justify-between">
                <div class="flex items-center gap-4">
                  <div class="size-12 rounded-xl flex items-center justify-center"
                    :class="tx.amount > 0 ? 'bg-emerald-100' : 'bg-slate-100'">
                    <span class="material-symbols-outlined text-xl" :class="tx.amount > 0 ? 'text-emerald-600' : 'text-slate-600'">
                      {{ tx.amount > 0 ? 'arrow_downward' : 'arrow_upward' }}
                    </span>
                  </div>
                  <div>
                    <p class="font-medium text-slate-900 capitalize">{{ tx.type }}</p>
                    <p class="text-sm text-slate-500">{{ tx.date }}</p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="font-bold text-lg" :class="tx.amount > 0 ? 'text-emerald-600' : 'text-slate-900'">
                    {{ tx.amount > 0 ? '+' : '' }}{{ formatCurrency(tx.amount) }} ETB
                  </p>
                  <p class="text-xs text-slate-500 capitalize">{{ tx.status }}</p>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- ========== SETTINGS ========== -->
        <template v-else-if="currentPage === 'settings'">
          <div class="max-w-3xl">
            <!-- Profile Section -->
            <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden mb-6">
              <div class="px-6 py-4 border-b border-slate-100">
                <h3 class="font-bold text-slate-900">Profile Information</h3>
              </div>
              <div class="p-6">
                <div class="flex items-center gap-6 mb-8">
                  <div class="size-20 bg-slate-200 rounded-2xl flex items-center justify-center text-slate-600 text-2xl font-bold">
                    {{ user.name.charAt(0) }}
                  </div>
                  <div>
                    <p class="font-bold text-lg text-slate-900">{{ user.name }}</p>
                    <p class="text-slate-500">{{ user.email }}</p>
                    <span class="inline-block mt-2 text-xs font-bold px-3 py-1 rounded-full"
                      :class="user.type === 'ENTERPRISE' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'">
                      {{ user.type }}
                    </span>
                  </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Full Name</label>
                    <input type="text" :value="user.name"
                      class="w-full h-11 px-4 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-emerald-50 outline-none transition-all bg-slate-50/30" />
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Email</label>
                    <input type="email" :value="user.email"
                      class="w-full h-11 px-4 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-emerald-50 outline-none transition-all bg-slate-50/30" />
                  </div>
                  <div v-if="user.type === 'ENTERPRISE'" class="sm:col-span-2">
                    <label class="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Company Name</label>
                    <input type="text" :value="user.company"
                      class="w-full h-11 px-4 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-emerald-50 outline-none transition-all bg-slate-50/30" />
                  </div>
                </div>

                <button class="mt-6 px-6 py-3 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold text-sm transition-colors">
                  Save Changes
                </button>
              </div>
            </div>

            <!-- Security Section -->
            <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden mb-6">
              <div class="px-6 py-4 border-b border-slate-100">
                <h3 class="font-bold text-slate-900">Security</h3>
              </div>
              <div class="p-6">
                <div class="flex items-center justify-between py-4 border-b border-slate-100">
                  <div>
                    <p class="font-medium text-slate-900">Password</p>
                    <p class="text-sm text-slate-500">Last changed 30 days ago</p>
                  </div>
                  <button class="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
                    Change Password
                  </button>
                </div>
                <div class="flex items-center justify-between py-4">
                  <div>
                    <p class="font-medium text-slate-900">Two-Factor Authentication</p>
                    <p class="text-sm text-slate-500">Add an extra layer of security</p>
                  </div>
                  <button class="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors">
                    Enable
                  </button>
                </div>
              </div>
            </div>

            <!-- Notifications Section -->
            <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div class="px-6 py-4 border-b border-slate-100">
                <h3 class="font-bold text-slate-900">Notifications</h3>
              </div>
              <div class="p-6 space-y-4">
                <label class="flex items-center justify-between cursor-pointer">
                  <div>
                    <p class="font-medium text-slate-900">Campaign Updates</p>
                    <p class="text-sm text-slate-500">Get notified when campaigns are approved or complete</p>
                  </div>
                  <input type="checkbox" checked class="w-5 h-5 rounded text-primary focus:ring-primary" />
                </label>
                <label class="flex items-center justify-between cursor-pointer">
                  <div>
                    <p class="font-medium text-slate-900">Payment Alerts</p>
                    <p class="text-sm text-slate-500">Receive notifications for deposits and transactions</p>
                  </div>
                  <input type="checkbox" checked class="w-5 h-5 rounded text-primary focus:ring-primary" />
                </label>
                <label class="flex items-center justify-between cursor-pointer">
                  <div>
                    <p class="font-medium text-slate-900">Weekly Reports</p>
                    <p class="text-sm text-slate-500">Get a summary of your campaign performance</p>
                  </div>
                  <input type="checkbox" class="w-5 h-5 rounded text-primary focus:ring-primary" />
                </label>
              </div>
            </div>
          </div>
        </template>
      </div>
    </main>
  </div>
</template>

<style scoped>
/* Custom checkbox styling */
input[type="checkbox"] {
  appearance: none;
  -webkit-appearance: none;
  background-color: #f1f5f9;
  border: 2px solid #e2e8f0;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

input[type="checkbox"]:checked {
  background-color: #10b981;
  border-color: #10b981;
  background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3e%3c/svg%3e");
}
</style>
