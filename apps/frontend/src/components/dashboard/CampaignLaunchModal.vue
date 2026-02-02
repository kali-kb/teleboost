<script setup lang="ts">
import { ref, computed } from 'vue';
import { useCampaignCartStore } from '../../stores/campaignCart';

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits(['update:modelValue', 'success']);

const cartStore = useCampaignCartStore();
const marketingCopy = ref('');
const imageUrl = ref('');
const isSubmitting = ref(false);
const error = ref('');

const close = () => {
  emit('update:modelValue', false);
};

const handleLaunch = async () => {
  if (!marketingCopy.value) {
    error.value = 'Please provide marketing copy';
    return;
  }

  isSubmitting.value = true;
  error.value = '';

  try {
    const payload = {
      marketing_copy: marketingCopy.value,
      metadata: {
        image_url: imageUrl.value || 'https://placehold.co/600x400?text=Campaign+Image'
      },
      placements: cartStore.selectedChannels.map(channel => ({
        channel_id: channel.id,
        price: channel.price_per_post
      }))
    };

    const response = await fetch("http://localhost:3001/api/campaigns", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error('Failed to launch campaign');
    }

    cartStore.clearCart();
    emit('success');
    close();
  } catch (err: any) {
    error.value = err.message || 'Something went wrong';
  } finally {
    isSubmitting.value = false;
  }
};

const formatNumber = (num: number) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
};
</script>

<template>
  <Teleport to="body">
    <div v-if="modelValue" class="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-xl animate-in fade-in duration-300" @click="close"></div>
      
      <!-- Modal Content -->
      <div class="relative w-full max-w-4xl bg-white/90 backdrop-blur-2xl rounded-[40px] shadow-[0_32px_128px_-16px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col md:flex-row max-h-[90vh] animate-in zoom-in duration-500 border border-white/20">
        
        <!-- Left Side: Form -->
        <div class="flex-1 p-8 sm:p-12 overflow-y-auto">
          <div class="mb-10">
            <h2 class="text-3xl font-black text-slate-900 mb-2">Launch Campaign</h2>
            <p class="text-slate-500 font-medium">Create your multi-channel advertising campaign</p>
          </div>

          <div class="space-y-8">
            <!-- Marketing Copy -->
            <div class="space-y-3">
              <label class="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Marketing Copy</label>
              <textarea 
                v-model="marketingCopy"
                placeholder="Write your ad copy here..."
                class="w-full h-40 bg-slate-50 border-2 border-slate-100 rounded-3xl p-6 text-slate-900 placeholder:text-slate-300 focus:border-primary/30 focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all outline-none font-medium resize-none"
              ></textarea>
            </div>

            <!-- Image Upload Placeholder -->
            <div class="space-y-3">
              <label class="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Campaign Creative</label>
              <div class="relative group">
                <input 
                  v-model="imageUrl"
                  type="text" 
                  placeholder="Paste image URL here..."
                  class="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-slate-900 placeholder:text-slate-300 focus:border-primary/30 focus:bg-white transition-all outline-none font-medium"
                />
                <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors">image</span>
              </div>
              <p class="text-[10px] text-slate-400 font-bold uppercase tracking-wider ml-1">Paste a URL for your campaign image</p>
            </div>

            <div v-if="error" class="p-4 bg-rose-50 text-rose-500 rounded-2xl text-sm font-bold flex items-center gap-3 border border-rose-100 animate-in shake">
              <span class="material-symbols-outlined">error</span>
              {{ error }}
            </div>
            
            <div class="pt-4">
              <button 
                @click="handleLaunch"
                :disabled="isSubmitting"
                class="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white py-5 rounded-3xl font-black text-lg transition-all shadow-2xl shadow-slate-900/20 flex items-center justify-center gap-3 group"
              >
                <span v-if="!isSubmitting">Launch Multi-Channel Campaign</span>
                <span v-else class="animate-spin material-symbols-outlined">progress_activity</span>
                <span v-if="!isSubmitting" class="material-symbols-outlined group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform">rocket_launch</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Right Side: Summary (Glassmorphism Sidebar) -->
        <div class="w-full md:w-[360px] bg-slate-900/5 border-l border-slate-100 p-8 sm:p-10 flex flex-col shrink-0">
          <h3 class="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Campaign Summary</h3>
          
          <div class="space-y-6 flex-1">
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1">
                 <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Selected</p>
                 <p class="text-xl font-black text-slate-900">{{ cartStore.totalChannels }} Channels</p>
              </div>
              <div class="space-y-1">
                 <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reach</p>
                 <p class="text-xl font-black text-slate-900">{{ formatNumber(cartStore.totalReach) }}</p>
              </div>
            </div>

            <div class="pt-6 border-t border-slate-100">
               <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Channel List</p>
               <div class="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  <div v-for="channel in cartStore.selectedChannels" :key="channel.id" class="flex items-center gap-3 p-2 rounded-xl hover:bg-white transition-colors">
                     <div class="size-8 rounded-lg bg-white border border-slate-100 overflow-hidden shrink-0 flex items-center justify-center">
                        <img v-if="channel.avatar_url" :src="channel.avatar_url" class="size-full object-cover" />
                        <span v-else class="material-symbols-outlined text-sm text-slate-300">campaign</span>
                     </div>
                     <div class="min-w-0 flex-1">
                        <p class="text-xs font-bold text-slate-900 truncate">{{ channel.title }}</p>
                        <p class="text-[10px] text-primary font-black">{{ channel.price_per_post }} ETB</p>
                     </div>
                  </div>
               </div>
            </div>
          </div>

          <div class="pt-8 border-t border-slate-100 mt-auto">
            <div class="flex items-center justify-between">
              <p class="text-xs font-black text-slate-400 uppercase tracking-widest">Total Budget</p>
              <div class="text-right">
                <p class="text-3xl font-black text-primary">{{ cartStore.totalPrice.toLocaleString() }}</p>
                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">ETB Total</p>
              </div>
            </div>
          </div>
        </div>

        <button @click="close" class="absolute top-6 right-6 size-12 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center text-slate-400 transition-all">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #cbd5e1;
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes zoom-in {
  from { opacity: 0; transform: scale(0.9) translateY(20px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

.animate-in {
  animation-fill-mode: forwards;
}

.fade-in {
  animation: fade-in 0.3s ease-out;
}

.zoom-in {
  animation: zoom-in 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

.shake {
  animation: shake 0.2s ease-in-out 0s 2;
}
</style>
