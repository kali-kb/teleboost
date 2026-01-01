<script setup lang="ts">
import { formatCurrency, formatNumber, getStatusColor } from '../../utils/formatters';

defineProps<{
  campaigns: any[];
}>();
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
  </div>
</template>
