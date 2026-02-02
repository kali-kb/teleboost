<script setup lang="ts">
import { ref } from 'vue';
import { useCampaignCartStore } from '../../stores/campaignCart';
import CampaignLaunchModal from './CampaignLaunchModal.vue';

const cartStore = useCampaignCartStore();
const isOpen = ref(false);
const isLaunchModalOpen = ref(false);

const openLaunchModal = () => {
    isLaunchModalOpen.value = true;
    isOpen.value = false;
};

const formatNumber = (num: number) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
};
</script>

<template>
  <div class="fixed bottom-8 right-8 z-[50]">
    <!-- Cart Trigger Button -->
    <button 
      @click="isOpen = !isOpen"
      class="group relative bg-slate-900 hover:bg-primary text-white p-4 rounded-2xl shadow-2xl transition-all duration-300 flex items-center gap-3"
      :class="{ 'scale-0': isOpen }"
    >
      <div class="relative">
        <span class="material-symbols-outlined text-[28px]">shopping_basket</span>
        <span 
          v-if="cartStore.totalChannels > 0"
          class="absolute -top-2 -right-2 size-6 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center ring-4 ring-white shadow-lg animate-bounce"
        >
          {{ cartStore.totalChannels }}
        </span>
      </div>
      <div v-if="cartStore.totalChannels > 0" class="text-left pr-2">
        <p class="text-[10px] uppercase font-black tracking-widest opacity-60 leading-none mb-1">Total Budget</p>
        <p class="font-black text-sm">{{ cartStore.totalPrice.toLocaleString() }} ETB</p>
      </div>
    </button>

    <!-- Interactive Plan Drawer -->
    <Teleport to="body">
      <div v-if="isOpen" class="fixed inset-0 z-[99999] overflow-hidden pointer-events-none">
        <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm pointer-events-auto" @click="isOpen = false"></div>
        
        <div 
          class="absolute right-0 top-0 h-full w-full max-w-md bg-slate-50 shadow-2xl pointer-events-auto flex flex-col animate-in slide-in-from-right duration-500"
        >
          <!-- Header -->
          <div class="bg-white p-6 border-b border-slate-100 shrink-0">
            <div class="flex items-center justify-between mb-2">
              <h2 class="text-xl font-black text-slate-900 flex items-center gap-2">
                <span class="material-symbols-outlined text-primary">auto_awesome_motion</span>
                Campaign Plan
              </h2>
              <button @click="isOpen = false" class="size-8 rounded-full flex items-center justify-center hover:bg-slate-50 transition-colors">
                <span class="material-symbols-outlined text-slate-400">close</span>
              </button>
            </div>
            <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">Selected Channels: {{ cartStore.totalChannels }}</p>
          </div>

          <!-- Summary Stats -->
          <div class="p-4 grid grid-cols-2 gap-3 shrink-0">
            <div class="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">Total Reach</p>
                <p class="text-lg font-black text-slate-900">{{ formatNumber(cartStore.totalReach) }}</p>
            </div>
            <div class="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">Est. Imps</p>
                <p class="text-lg font-black text-slate-900">{{ formatNumber(cartStore.estimatedImpressions) }}</p>
            </div>
          </div>

          <!-- Channel List -->
          <div class="flex-1 overflow-y-auto px-4 pb-4 space-y-3">
            <div v-for="channel in cartStore.selectedChannels" :key="channel.id" 
              class="group bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 hover:border-rose-200 transition-all"
            >
              <div class="size-10 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center shrink-0">
                <img v-if="channel.avatar_url" :src="channel.avatar_url" class="size-full object-cover" />
                <span v-else class="material-symbols-outlined text-slate-300">campaign</span>
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-bold text-slate-900 text-sm truncate">{{ channel.title }}</p>
                <p class="text-xs text-primary font-black">{{ channel.price_per_post }} ETB</p>
              </div>
              <button 
                @click="cartStore.removeChannel(channel.id)"
                class="size-8 bg-rose-50 text-rose-500 rounded-lg opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center hover:bg-rose-500 hover:text-white"
              >
                <span class="material-symbols-outlined text-[20px]">delete</span>
              </button>
            </div>

            <!-- Empty State -->
            <div v-if="cartStore.totalChannels === 0" class="h-64 flex flex-col items-center justify-center space-y-4 opacity-40">
                <span class="material-symbols-outlined text-6xl">list_alt</span>
                <p class="font-bold text-slate-500">Your plan is empty</p>
            </div>
          </div>

          <!-- Footer -->
          <div class="bg-white p-6 border-t border-slate-200 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)] shrink-0 space-y-4">
            <div class="flex items-center justify-between">
                <p class="text-sm font-bold text-slate-500 uppercase tracking-widest">Total Budget</p>
                <p class="text-2xl font-black text-primary">{{ cartStore.totalPrice.toLocaleString() }} <span class="text-xs text-slate-400">ETB</span></p>
            </div>
            
            <button 
                @click="openLaunchModal"
                :disabled="cartStore.totalChannels === 0"
                class="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-20 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-black transition-all shadow-xl shadow-slate-900/10 flex items-center justify-center gap-2"
            >
                Launch Multi-Channel Campaign
                <span class="material-symbols-outlined text-[18px]">rocket_launch</span>
            </button>
            <button 
                @click="cartStore.clearCart"
                class="w-full text-slate-400 hover:text-rose-500 text-xs font-bold uppercase tracking-widest transition-colors py-2"
            >
                Clear Plan
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <CampaignLaunchModal v-model="isLaunchModalOpen" />
  </div>
</template>

<style scoped>
@keyframes slide-in-right {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}

.slide-in-from-right {
  animation: slide-in-right 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
</style>
