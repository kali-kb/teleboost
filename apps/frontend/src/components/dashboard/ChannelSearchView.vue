<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useCampaignCartStore } from '../../stores/campaignCart';

const cartStore = useCampaignCartStore();
const channels = ref<any[]>([]);

const isLoading = ref(true);
const searchQuery = ref('');
const selectedCategory = ref('All');
const showAdvancedFilters = ref(false);
const selectedChannel = ref<any | null>(null);

// Advanced Filter States
const minSubs = ref<number | null>(null);
const maxSubs = ref<number | null>(null);
const minViews = ref<number | null>(null);
const maxViews = ref<number | null>(null);
const minPrice = ref<number | null>(null);
const maxPrice = ref<number | null>(null);
const audienceLanguage = ref('All');
const audienceCountry = ref('All');

const categories = ['All', 'News', 'Tech', 'Finance', 'Entertainment', 'Education', 'Lifestyle'];
const languages = ['All', 'Amharic', 'English', 'Oromiffa', 'Tigrinya', 'Arabic'];
const countries = ['All', 'Ethiopia', 'Kenya', 'USA', 'UAE', 'Global'];

onMounted(async () => {
  try {
    const response = await fetch("http://localhost:3001/api/telegram-channels");
    const data = await response.json();
    channels.value = data;
  } catch (err) {
    console.error("Failed to fetch channels:", err);
  } finally {
    isLoading.value = false;
  }
});

const filteredChannels = computed(() => {
  return channels.value.filter(channel => {
    const title = channel.title || '';
    const username = channel.username || '';
    
    // Text search
    const matchesSearch = title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                         username.toLowerCase().includes(searchQuery.value.toLowerCase());
    
    // Category match
    const matchesCategory = selectedCategory.value === 'All' || channel.category === selectedCategory.value;
    
    // Numeric filters
    const subs = channel.subscribers || 0;
    const views = channel.avg_views || 0;
    const price = parseFloat(channel.price_per_post) || 0;
    
    const matchesSubs = (!minSubs.value || subs >= minSubs.value) && (!maxSubs.value || subs <= maxSubs.value);
    const matchesViews = (!minViews.value || views >= minViews.value) && (!maxViews.value || views <= maxViews.value);
    const matchesPrice = (!minPrice.value || price >= minPrice.value) && (!maxPrice.value || price <= maxPrice.value);
    
    // Audience filters
    const audience = channel.audience && channel.audience.length > 0 ? channel.audience[0] : null;
    const matchesLanguage = audienceLanguage.value === 'All' || (audience && audience.language === audienceLanguage.value);
    const matchesCountry = audienceCountry.value === 'All' || (audience && audience.primary_country === audienceCountry.value);
    
    return matchesSearch && matchesCategory && matchesSubs && matchesViews && matchesPrice && matchesLanguage && matchesCountry;
  });
});

const resetFilters = () => {
  searchQuery.value = '';
  selectedCategory.value = 'All';
  minSubs.value = null;
  maxSubs.value = null;
  minViews.value = null;
  maxViews.value = null;
  minPrice.value = null;
  maxPrice.value = null;
  audienceLanguage.value = 'All';
  audienceCountry.value = 'All';
};

const formatNumber = (num: number) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
};

const openChannelDetails = (channel: any) => {
  selectedChannel.value = channel;
};

const closeDetails = () => {
    selectedChannel.value = null;
};
</script>

<template>
  <div class="space-y-6 animate-in fade-in duration-500">
    <!-- Detail Modal -->
    <Teleport to="body">
      <div v-if="selectedChannel" class="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[9999] flex items-center justify-center p-4 sm:p-6" @click="closeDetails">
        <div class="bg-white w-full max-w-2xl rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in duration-300 max-h-[90vh] flex flex-col" @click.stop>
            <!-- Hero / Banner Area -->
            <div class="h-32 sm:h-40 bg-slate-900 relative shrink-0">
                <button @click="closeDetails" class="absolute top-4 right-4 size-10 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all z-10">
                    <span class="material-symbols-outlined">close</span>
                </button>
                <div class="absolute -bottom-10 left-6 sm:left-8 p-1 bg-white rounded-3xl shadow-xl">
                    <div class="size-20 sm:size-24 rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center">
                        <img v-if="selectedChannel.avatar_url" :src="selectedChannel.avatar_url" class="size-full object-cover" />
                        <span v-else class="material-symbols-outlined text-4xl text-slate-300">campaign</span>
                    </div>
                </div>
            </div>

            <!-- Scrollable Content -->
            <div class="p-6 sm:p-8 pt-12 sm:pt-14 overflow-y-auto">
                <!-- Main Header -->
                <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
                    <div>
                        <div class="flex items-center gap-2 mb-1">
                            <h2 class="text-xl sm:text-2xl font-black text-slate-900">{{ selectedChannel.title }}</h2>
                            <span v-if="selectedChannel.verified" class="material-symbols-outlined text-emerald-500 text-[20px]">verified</span>
                        </div>
                        <p class="text-slate-500 font-medium text-sm sm:text-base">@{{ selectedChannel.username }}</p>
                    </div>
                    <div class="flex flex-wrap gap-2">
                        <span class="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest ring-1 ring-emerald-100">
                          {{ selectedChannel.category || 'General' }}
                        </span>
                        <span class="px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest ring-1 ring-primary/20">
                          {{ selectedChannel.price_per_post }} ETB / Post
                        </span>
                    </div>
                </div>

                <!-- Stats Grid -->
                <div class="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-8">
                    <div class="bg-slate-50 p-3 sm:p-4 rounded-2xl border border-slate-100 text-center sm:text-left">
                        <p class="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Subscribers</p>
                        <p class="text-lg sm:text-xl font-black text-slate-900">{{ formatNumber(selectedChannel.subscribers || 0) }}</p>
                    </div>
                    <div class="bg-slate-50 p-3 sm:p-4 rounded-2xl border border-slate-100 text-center sm:text-left">
                        <p class="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Avg. Views</p>
                        <p class="text-lg sm:text-xl font-black text-slate-900">{{ formatNumber(selectedChannel.avg_views || 0) }}</p>
                    </div>
                    <div class="bg-slate-50 p-3 sm:p-4 rounded-2xl border border-slate-100 text-center sm:text-left">
                        <p class="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Engagement</p>
                        <p class="text-lg sm:text-xl font-black text-slate-900">
                            {{ (((selectedChannel.avg_views || 0) / (selectedChannel.subscribers || 1)) * 100).toFixed(1) }}%
                        </p>
                    </div>
                    <div class="bg-slate-50 p-3 sm:p-4 rounded-2xl border border-slate-100 text-center sm:text-left">
                        <p class="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Trust Score</p>
                        <div class="flex items-center justify-center sm:justify-start gap-1">
                            <span class="text-lg sm:text-xl font-black text-slate-900">{{ selectedChannel.trust_score || 0 }}</span>
                            <span class="text-[10px] font-bold text-slate-400">/100</span>
                        </div>
                    </div>
                </div>

                <!-- Audience Breakdown -->
                <div class="space-y-4 mb-8 text-center sm:text-left">
                    <h3 class="font-black text-slate-900 uppercase tracking-widest text-[10px] sm:text-xs">Audience Demographics</h3>
                    <div v-if="selectedChannel.audience && selectedChannel.audience.length > 0" class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div class="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                            <div class="size-10 bg-slate-50 rounded-xl flex items-center justify-center text-primary shrink-0">
                                <span class="material-symbols-outlined">language</span>
                            </div>
                            <div class="min-w-0">
                                <p class="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">Primary Language</p>
                                <p class="font-bold text-slate-900 text-sm sm:text-base truncate">{{ selectedChannel.audience[0].language || 'Not Specified' }}</p>
                            </div>
                        </div>
                        <div class="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                            <div class="size-10 bg-slate-50 rounded-xl flex items-center justify-center text-primary shrink-0">
                                <span class="material-symbols-outlined">public</span>
                            </div>
                            <div class="min-w-0">
                                <p class="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">Primary Location</p>
                                <p class="font-bold text-slate-900 text-sm sm:text-base truncate">{{ selectedChannel.audience[0].primary_country || 'Global' }}{{ selectedChannel.audience[0].primary_city ? ', ' + selectedChannel.audience[0].primary_city : '' }}</p>
                            </div>
                        </div>
                    </div>
                    <div v-else class="p-6 sm:p-8 bg-slate-50 rounded-3xl border border-dashed border-slate-200 text-center">
                        <p class="text-xs sm:text-sm font-bold text-slate-400">Detailed audience data not yet verified for this channel.</p>
                    </div>
                </div>

                <!-- Footer Actions -->
                <div class="flex flex-col sm:flex-row items-center gap-3 pt-6 border-t border-slate-100">
                    <button 
                        @click="cartStore.toggleChannel(selectedChannel); closeDetails()"
                        class="w-full sm:flex-1 py-3 sm:py-4 rounded-2xl font-black transition-all shadow-lg flex items-center justify-center gap-2"
                        :class="cartStore.isSelected(selectedChannel.id) 
                            ? 'bg-rose-50 text-rose-500 hover:bg-rose-100 shadow-rose-100' 
                            : 'bg-primary hover:bg-primary-hover text-white shadow-primary/25'"
                    >
                        <span class="material-symbols-outlined">{{ cartStore.isSelected(selectedChannel.id) ? 'remove_circle' : 'add_circle' }}</span>
                        {{ cartStore.isSelected(selectedChannel.id) ? 'Remove from Plan' : 'Add to Plan' }}
                    </button>
                    <button class="w-full sm:w-auto px-6 py-3 sm:py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-black transition-all">
                        View Profile
                    </button>
                </div>

            </div>
        </div>
      </div>
    </Teleport>

    <!-- Search & Main Filters -->
    <div class="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm space-y-4">
      <div class="flex flex-col lg:flex-row lg:items-center gap-4">
        <div class="relative flex-1">
          <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
          <input 
            v-model="searchQuery"
            type="text" 
            placeholder="Search channels..."
            class="w-full bg-slate-50 border-none rounded-2xl py-3 pl-12 pr-4 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 transition-all font-medium"
          />
        </div>
        
        <div class="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 scrollbar-hide">
          <button 
            v-for="cat in categories" 
            :key="cat"
            @click="selectedCategory = cat"
            :class="[
              'px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap',
              selectedCategory === cat 
                ? 'bg-primary text-white shadow-md shadow-primary/20' 
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            ]"
          >
            {{ cat }}
          </button>
        </div>

        <button 
          @click="showAdvancedFilters = !showAdvancedFilters"
          class="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all"
        >
          <span class="material-symbols-outlined text-[18px]">tune</span>
          {{ showAdvancedFilters ? 'Hide Filters' : 'More Filters' }}
        </button>
      </div>

      <!-- Advanced Filters Section -->
      <div v-if="showAdvancedFilters" class="pt-4 border-t border-slate-50 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in slide-in-top">
        <!-- Subscriber Range -->
        <div class="space-y-2">
          <label class="text-[11px] font-black text-slate-400 uppercase tracking-widest">Subscribers</label>
          <div class="flex items-center gap-2">
            <input v-model.number="minSubs" type="number" placeholder="Min" class="w-full bg-slate-50 border-none rounded-xl py-2 px-3 text-sm focus:ring-1 focus:ring-primary/20" />
            <span class="text-slate-300">-</span>
            <input v-model.number="maxSubs" type="number" placeholder="Max" class="w-full bg-slate-50 border-none rounded-xl py-2 px-3 text-sm focus:ring-1 focus:ring-primary/20" />
          </div>
        </div>

        <!-- Views Range -->
        <div class="space-y-2">
          <label class="text-[11px] font-black text-slate-400 uppercase tracking-widest">Avg. Views</label>
          <div class="flex items-center gap-2">
            <input v-model.number="minViews" type="number" placeholder="Min" class="w-full bg-slate-50 border-none rounded-xl py-2 px-3 text-sm focus:ring-1 focus:ring-primary/20" />
            <span class="text-slate-300">-</span>
            <input v-model.number="maxViews" type="number" placeholder="Max" class="w-full bg-slate-50 border-none rounded-xl py-2 px-3 text-sm focus:ring-1 focus:ring-primary/20" />
          </div>
        </div>

        <!-- Price Range -->
        <div class="space-y-2">
          <label class="text-[11px] font-black text-slate-400 uppercase tracking-widest">Price (ETB)</label>
          <div class="flex items-center gap-2">
            <input v-model.number="minPrice" type="number" placeholder="Min" class="w-full bg-slate-50 border-none rounded-xl py-2 px-3 text-sm focus:ring-1 focus:ring-primary/20" />
            <span class="text-slate-300">-</span>
            <input v-model.number="maxPrice" type="number" placeholder="Max" class="w-full bg-slate-50 border-none rounded-xl py-2 px-3 text-sm focus:ring-1 focus:ring-primary/20" />
          </div>
        </div>

        <!-- Audience Filters -->
        <div class="space-y-2">
          <label class="text-[11px] font-black text-slate-400 uppercase tracking-widest">Audience</label>
          <div class="flex items-center gap-2">
            <select v-model="audienceLanguage" class="flex-1 bg-slate-50 border-none rounded-xl py-2 px-3 text-sm focus:ring-1 focus:ring-primary/20">
              <option v-for="lang in languages" :key="lang" :value="lang">Lang: {{ lang }}</option>
            </select>
            <select v-model="audienceCountry" class="flex-1 bg-slate-50 border-none rounded-xl py-2 px-3 text-sm focus:ring-1 focus:ring-primary/20">
              <option v-for="country in countries" :key="country" :value="country">{{ country }}</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Results Header -->
    <div class="flex items-center justify-between px-2">
      <div class="flex items-center gap-3">
        <h2 class="text-lg font-black text-slate-900">Available Channels</h2>
        <span v-if="filteredChannels.length < channels.length" @click="resetFilters" class="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold cursor-pointer hover:bg-slate-200 transition-colors uppercase tracking-widest">Clear Filters</span>
      </div>
      <p class="text-sm font-bold text-slate-500">{{ filteredChannels.length }} results found</p>
    </div>

    <!-- Results List (Rows) -->
    <div class="space-y-3">
      <!-- Loading State -->
      <div v-if="isLoading" class="space-y-3">
        <div v-for="i in 5" :key="i" class="bg-white p-4 rounded-2xl border border-slate-100 animate-pulse flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="size-12 bg-slate-100 rounded-xl"></div>
            <div class="space-y-2">
              <div class="h-4 bg-slate-100 rounded w-32"></div>
              <div class="h-3 bg-slate-50 rounded w-24"></div>
            </div>
          </div>
          <div class="hidden md:flex items-center gap-12">
            <div class="h-4 bg-slate-50 rounded w-16"></div>
            <div class="h-4 bg-slate-50 rounded w-16"></div>
            <div class="h-4 bg-slate-50 rounded w-16"></div>
          </div>
          <div class="h-10 bg-slate-100 rounded-xl w-24"></div>
        </div>
      </div>

      <!-- Channels List -->
      <div v-else-if="filteredChannels.length > 0" class="space-y-3">
        <!-- List Header (Desktop Only) -->
        <div class="hidden md:flex items-center px-6 py-2 text-[11px] font-black text-slate-400 uppercase tracking-widest">
          <div class="flex-1">Channel</div>
          <div class="w-32 text-center">Category</div>
          <div class="w-32 text-center">Subscribers</div>
          <div class="w-32 text-center">Avg. Views</div>
          <div class="w-32 text-center">Price / Post</div>
          <div class="w-32"></div>
        </div>

        <div 
          v-for="channel in filteredChannels" 
          :key="channel.id"
          class="group bg-white p-4 rounded-2xl border border-slate-100 hover:border-primary/40 hover:shadow-lg hover:shadow-slate-200/50 transition-all flex flex-col md:flex-row md:items-center gap-4 cursor-pointer"
          @click="openChannelDetails(channel)"
        >
          <!-- Channel Identity -->
          <div class="flex-1 flex items-center gap-4">
            <div class="size-12 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center shrink-0">
              <img v-if="channel.avatar_url" :src="channel.avatar_url" class="size-full object-cover" />
              <span v-else class="material-symbols-outlined text-slate-300">campaign</span>
            </div>
            <div class="min-w-0">
              <div class="flex items-center gap-2">
                <span class="font-bold text-slate-900 truncate">{{ channel.title }}</span>
                <span v-if="channel.verified" class="material-symbols-outlined text-[16px] text-emerald-500">verified</span>
              </div>
              <div class="flex items-center gap-2">
                <p class="text-xs text-slate-500 truncate">@{{ channel.username }}</p>
                <div v-if="channel.audience && channel.audience.length > 0" class="flex items-center gap-1 text-[10px] bg-slate-50 text-slate-400 px-1.5 rounded uppercase font-bold">
                  {{ channel.audience[0].language }} • {{ channel.audience[0].primary_country }}
                </div>
              </div>
            </div>
          </div>

          <!-- Mobile Only Stats -->
          <div class="grid grid-cols-2 gap-2 md:hidden">
             <div class="bg-slate-50 p-2 rounded-lg flex justify-between items-center">
               <span class="text-[10px] text-slate-400 font-black uppercase">Subs</span>
               <span class="text-xs font-bold">{{ formatNumber(channel.subscribers || 0) }}</span>
             </div>
             <div class="bg-slate-50 p-2 rounded-lg flex justify-between items-center">
               <span class="text-[10px] text-slate-400 font-black uppercase">Views</span>
               <span class="text-xs font-bold">{{ formatNumber(channel.avg_views || 0) }}</span>
             </div>
          </div>

          <!-- Desktop Columns -->
          <div class="hidden md:flex items-center text-sm font-bold text-slate-600">
            <div class="w-32 text-center">
              <span class="px-2 py-1 bg-slate-50 rounded-lg text-xs">{{ channel.category || 'N/A' }}</span>
            </div>
            <div class="w-32 text-center text-slate-900">{{ formatNumber(channel.subscribers || 0) }}</div>
            <div class="w-32 text-center text-slate-900">{{ formatNumber(channel.avg_views || 0) }}</div>
            <div class="w-32 text-center text-primary font-black">{{ channel.price_per_post }} ETB</div>
          </div>

          <!-- Action Button -->
          <div class="w-full md:w-32 flex justify-end" @click.stop>
            <button 
                @click="cartStore.toggleChannel(channel)"
                class="w-full md:w-auto px-6 py-2.5 text-sm font-bold rounded-xl transition-all shadow-md"
                :class="cartStore.isSelected(channel.id) 
                    ? 'bg-rose-50 text-rose-600 hover:bg-rose-100 shadow-rose-100' 
                    : 'bg-slate-900 hover:bg-primary text-white shadow-slate-900/10'"
            >
              {{ cartStore.isSelected(channel.id) ? 'Remove' : 'Select' }}
            </button>
          </div>

        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
        <div class="size-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
          <span class="material-symbols-outlined text-4xl text-slate-300">search_off</span>
        </div>
        <h3 class="text-xl font-bold text-slate-900 mb-2">No channels found</h3>
        <p class="text-slate-500 max-w-sm text-center">Try adjusting your filters or search terms.</p>
        <button @click="resetFilters" class="mt-8 text-primary font-bold hover:underline">Clear all filters</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

@keyframes fade-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slide-in-top {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes zoom-in {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

.animate-in {
  animation: fade-in 0.5s ease-out forwards;
}

.slide-in-top {
  animation: slide-in-top 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.zoom-in {
    animation: zoom-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}
</style>
