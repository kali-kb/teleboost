<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { formatCurrency, formatNumber, getStatusColor } from '../../utils/formatters';

const campaigns = ref<any[]>([]);
const isLoading = ref(true);
const error = ref('');

onMounted(async () => {
  try {
    const response = await fetch("http://localhost:3001/api/campaigns", {
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Failed to fetch campaigns');
    campaigns.value = await response.json();
  } catch (err: any) {
    error.value = err.message;
  } finally {
    isLoading.value = false;
  }
});

const calculateTotalBudget = (placements: any[]) => {
  return placements.reduce((sum, p) => sum + parseFloat(p.price), 0);
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};
</script>

<template>
  <div>
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
          <option>ACTIVE</option>
          <option>DRAFT</option>
          <option>PAUSED</option>
          <option>COMPLETED</option>
        </select>
        <button 
          @click="$emit('setPage', 'search_channels')"
          class="h-11 px-6 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold text-sm transition-colors flex items-center gap-2"
        >
          <span class="material-symbols-outlined text-[18px]">add</span>
          Create Campaign
        </button>
      </div>
    </div>

    <!-- Error State -->
    <div v-if="error" class="p-4 bg-rose-50 text-rose-500 rounded-2xl mb-6 text-sm font-bold flex items-center gap-3">
      <span class="material-symbols-outlined">error</span>
      {{ error }}
    </div>

    <!-- Campaigns Table -->
    <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-slate-50 border-b border-slate-200">
            <tr>
              <th class="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-4">Campaign</th>
              <th class="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-4">Status</th>
              <th class="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-4">Budget</th>
              <th class="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-4">Placements</th>
              <th class="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-4">Created At</th>
              <th class="text-right text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-if="isLoading">
               <td colspan="6" class="px-6 py-12 text-center text-slate-400">
                  <div class="flex flex-col items-center gap-3">
                    <span class="material-symbols-outlined animate-spin text-3xl">progress_activity</span>
                    <p class="font-bold text-sm">Loading campaigns...</p>
                  </div>
               </td>
            </tr>
            <tr v-else-if="campaigns.length === 0">
               <td colspan="6" class="px-6 py-12 text-center text-slate-400">
                  <div class="flex flex-col items-center gap-3">
                    <span class="material-symbols-outlined text-4xl">campaign</span>
                    <p class="font-bold text-sm">No campaigns found</p>
                  </div>
               </td>
            </tr>
            <tr v-for="campaign in campaigns" :key="campaign.id" class="hover:bg-slate-50/50 transition-colors group">
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="size-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:text-primary transition-colors border border-transparent group-hover:border-slate-100">
                    <span class="material-symbols-outlined">description</span>
                  </div>
                  <div class="min-w-0">
                    <p class="font-bold text-slate-900 truncate max-w-[240px]">{{ campaign.marketing_copy }}</p>
                    <p class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">ID: {{ campaign.id.split('-')[0] }}</p>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <span :class="getStatusColor(campaign.status)" class="text-[10px] font-black px-2.5 py-1 rounded-lg tracking-widest">{{ campaign.status }}</span>
              </td>
              <td class="px-6 py-4">
                <p class="font-black text-slate-900">{{ formatCurrency(calculateTotalBudget(campaign.placements || [])) }}</p>
                <p class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">ETB TOTAL</p>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-1.5">
                  <span class="font-black text-slate-700">{{ campaign.placements?.length || 0 }}</span>
                  <span class="material-symbols-outlined text-[16px] text-slate-300">layers</span>
                </div>
              </td>
              <td class="px-6 py-4">
                <p class="text-sm font-medium text-slate-600">{{ formatDate(campaign.created_at) }}</p>
              </td>
              <td class="px-6 py-4 text-right">
                <button class="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors">
                  <span class="material-symbols-outlined text-[20px]">more_vert</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
