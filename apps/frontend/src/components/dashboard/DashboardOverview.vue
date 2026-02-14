<script setup lang="ts">
import { computed } from 'vue';
import { formatCurrency, formatNumber, getStatusColor } from '../../utils/formatters';

const props = defineProps<{
  user: any;
  wallet: any;
  campaigns: any[];
  dashboardStats: any;
}>();

const emit = defineEmits(['setPage']);

const stats = computed(() => ({
  totalCampaigns: props.dashboardStats?.total || props.campaigns.length,
  activeCampaigns: props.dashboardStats?.active || props.campaigns.filter(c => c.status === 'ACTIVE').length,
  totalSpent: props.campaigns.reduce((sum, c) => sum + (parseFloat(c.spent) || 0), 0),
  totalImpressions: props.campaigns.reduce((sum, c) => sum + (parseInt(c.impressions) || 0), 0),
}));
</script>

<template>
  <div>
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
          <span class="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">{{ stats.activeCampaigns }} Active</span>
        </div>
        <p class="text-2xl font-black text-slate-900">{{ stats.totalCampaigns }}</p>
        <p class="text-sm text-slate-500 mt-1">Total Campaigns</p>
      </div>

      <div class="bg-white rounded-2xl border border-slate-200 p-6">
        <div class="flex items-center justify-between mb-4">
          <div class="size-12 bg-purple-50 rounded-xl flex items-center justify-center">
            <span class="material-symbols-outlined text-purple-600 text-2xl">payments</span>
          </div>
        </div>
        <p class="text-2xl font-black text-slate-900">{{ formatCurrency(stats.totalSpent) }}</p>
        <p class="text-sm text-slate-500 mt-1">Total Spent</p>
      </div>

      <div class="bg-white rounded-2xl border border-slate-200 p-6">
        <div class="flex items-center justify-between mb-4">
          <div class="size-12 bg-amber-50 rounded-xl flex items-center justify-center">
            <span class="material-symbols-outlined text-amber-600 text-2xl">visibility</span>
          </div>
        </div>
        <p class="text-2xl font-black text-slate-900">{{ formatNumber(stats.totalImpressions) }}</p>
        <p class="text-sm text-slate-500 mt-1">Total Impressions</p>
      </div>
    </div>

    <!-- Recent Campaigns & Transactions -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Recent Campaigns -->
      <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 class="font-bold text-slate-900">Recent Campaigns</h3>
          <button @click="emit('setPage', 'campaigns')" class="text-sm text-primary font-medium hover:underline">View All</button>
        </div>
        <div class="divide-y divide-slate-100">
          <div v-if="campaigns.length === 0" class="px-6 py-8 text-center text-slate-400">
            <p class="text-sm font-medium">No campaigns yet</p>
          </div>
          <div v-else v-for="campaign in campaigns.slice(0, 4)" :key="campaign.id" class="px-6 py-4 hover:bg-slate-50 transition-colors">
            <div class="flex items-center justify-between mb-2">
              <h4 class="font-medium text-slate-900 truncate max-w-[200px]">{{ campaign.marketing_copy }}</h4>
              <span :class="getStatusColor(campaign.status)" class="text-xs font-bold px-2 py-1 rounded-full">{{ campaign.status }}</span>
            </div>
            <div class="flex items-center gap-4 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              <span>ID: {{ campaign.id.split('-')[0] }}</span>
              <span class="flex items-center gap-1">
                <span class="material-symbols-outlined text-[14px]">layers</span>
                {{ campaign.placements?.length || 0 }} Placements
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Transactions -->
      <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 class="font-bold text-slate-900">Recent Transactions</h3>
          <button @click="emit('setPage', 'wallet')" class="text-sm text-primary font-medium hover:underline">View All</button>
        </div>
        <div class="divide-y divide-slate-100">
          <div v-if="wallet.recentTransactions.length === 0" class="px-6 py-8 text-center text-slate-400">
            <p class="text-sm font-medium">No transactions yet</p>
          </div>
          <div v-else v-for="tx in wallet.recentTransactions" :key="tx.id" class="px-6 py-4 hover:bg-slate-50 transition-colors">
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
  </div>
</template>
