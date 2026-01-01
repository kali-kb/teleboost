<script setup lang="ts">
import { ref, computed } from 'vue';
import AuthModal from '../components/AuthModal.vue';

const budget = ref(5000);
const cpm = ref(2.5);
const currentRole = ref<'advertisers' | 'channel-owners'>('advertisers');
const showAuthModal = ref(false);

const handleCTA = () => {
  if (currentRole.value === 'advertisers') {
    showAuthModal.value = true;
  } else {
    window.open(content.value.ctaLink, '_blank', 'noopener,noreferrer');
  }
};

const estimatedViews = computed(() => {
  return ((budget.value / cpm.value) * 1000).toLocaleString();
});

const content = computed(() => {
  if (currentRole.value === 'advertisers') {
    return {
      hero: "Expand your reach through telegram channels located in ethiopia",
      subheading: "Ethiopians first telegram based ad platform that makes it convenient and easy to publish ads on local channels",
      cta: "Start Advertising",
      ctaLink: "#", // Placeholder for advertiser flow
      image: "/images/hero_mockup.png",
      featuresTitle: "Why Advertise with teleboost?",
      // ... (rest of features)
      features: [
        { title: 'Target Ethiopian Channels', desc: 'Reach local audiences precisely where they hang out most - in their favorite Telegram groups and channels.', icon: 'location_on' },
        { title: 'Deep Targeting Options', desc: 'Go beyond basic metrics with deeper targeting including city-based, language, and interests.', icon: 'target' },
        { title: 'Pay with ETB', desc: 'No more hassle with Crypto or USD requirements. Pay directly in ETB through local payment methods.', icon: 'payments' },
        { title: 'Multi-Channel Campaigns', desc: 'Manage hundreds of placements from a single dashboard with automated monitoring.', icon: 'layers' }
      ],
      goalTitle: "Our Strategic Goal",
      goalDesc: "Our goal is to bridge the payment gap while also providing better options than what is currently found in the market for your business to create effective campaigns on 15M+ potential ethiopian audience currently on telegram."
    };
  } else {
    return {
      hero: "Earn more money publishing ads for local businesses on your channel",
      subheading: "Publish ads on your channel with zero manual hassle. All processes are automatic, ensuring you earn local currency fast.",
      cta: "Register Channel",
      ctaLink: "https://t.me/teleboost_ad_bot",
      image: "/images/guy-using-phone.png",
      featuresTitle: "Why Join as a Publisher?",
      features: [
        { title: 'Access Local Ads', desc: 'Get direct access to a growing list of Ethiopian-based businesses looking to promote their products.', icon: 'campaign' },
        { title: 'Automatic Publishing', desc: 'No more manual forwarding or scheduling. Our system handles the ad delivery automatically.', icon: 'bolt' },
        { title: 'Local Currency Payouts', desc: 'Get paid in your preferred payment method easily: CBE and Telebirr with instant settlements.', icon: 'account_balance_wallet' },
        { title: 'Constant Ad Flow', desc: 'We onboard more local businesses daily so your channel stays active with fresh ad tasks.', icon: 'auto_graph' }
      ],
      goalTitle: "Supporting Creators",
      goalDesc: "Our goal is to bridge the payment gap and provide channel owners with additional income from ad request of local businesses. We also aim to have ad tasks keep flowing to your channel so your channel doesn't have to go through days or even weeks without ads as we onboard more and more local businesses that find our platform easy and effective to advertise with."
    };
  }
});
</script>

<template>
  <div class="bg-white font-display text-text-main overflow-x-hidden antialiased selection:bg-primary-light selection:text-emerald-900">
    <!-- Header -->
    <header class="sticky top-0 z-50 w-full border-b border-border-light bg-white/90 backdrop-blur-md px-4 sm:px-10 py-3">
      <div class="mx-auto flex max-w-7xl items-center justify-between">
        <div class="flex items-center gap-3">
          <img src="/images/teleboost.png" alt="teleboost logo" class="size-8 object-contain" />
          <h2 class="text-text-main text-xl font-bold leading-tight tracking-tight">teleboost</h2>
        </div>
        <div class="hidden lg:flex items-center bg-slate-100 rounded-full p-1 border border-slate-200">
          <button @click="currentRole = 'advertisers'" 
            :class="[currentRole === 'advertisers' ? 'bg-white shadow-xs text-primary' : 'text-slate-500 hover:text-slate-800']"
            class="px-5 py-1.5 rounded-full text-sm font-bold transition-all border border-transparent"
            :style="currentRole === 'advertisers' ? 'border-color: #f1f5f9' : ''">
            Advertisers
          </button>
          <button @click="currentRole = 'channel-owners'"
            :class="[currentRole === 'channel-owners' ? 'bg-white shadow-xs text-primary' : 'text-slate-500 hover:text-slate-800']"
            class="px-5 py-1.5 rounded-full text-sm font-bold transition-all border border-transparent"
            :style="currentRole === 'channel-owners' ? 'border-color: #f1f5f9' : ''">
            Channel Owners
          </button>
        </div>
        <div class="hidden md:flex items-center gap-8">
          <nav class="flex items-center gap-8">
            <a class="text-slate-600 hover:text-primary text-sm font-medium transition-colors" href="#features">Features</a>
            <a class="text-slate-600 hover:text-primary text-sm font-medium transition-colors" href="#stats">Stats</a>
            <a class="text-slate-600 hover:text-primary text-sm font-medium transition-colors" href="#contact">Contact</a>
          </nav>
          <button @click="handleCTA" class="flex min-w-[84px] cursor-pointer items-center justify-center gap-2 rounded-lg h-10 px-5 bg-primary hover:bg-primary-hover text-white text-sm font-bold transition-colors duration-200">
            <svg v-if="currentRole === 'channel-owners'" class="size-4" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 11.944 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
            {{ currentRole === 'advertisers' ? 'Launch Campaign' : 'Join Network' }}
          </button>
        </div>
        <button class="md:hidden text-slate-800">
          <span class="material-symbols-outlined">menu</span>
        </button>
      </div>
    </header>

    <main class="flex min-h-screen flex-col items-center">
      <!-- Hero Section -->
      <section class="size-full px-4 sm:px-10 py-12 md:py-20 lg:py-24 max-w-7xl">
        <div class="flex flex-col gap-12 lg:flex-row lg:items-center">
          <transition name="slide-fade" mode="out-in">
            <div :key="currentRole" class="flex flex-col gap-8 lg:w-2/5 lg:pr-8">
              <div class="flex flex-col gap-5 text-left">
                <div class="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  <span class="material-symbols-outlined text-[16px]">rocket_launch</span>
                  <span>Bridging the Payment Gap in Ethiopia</span>
                </div>
                <h1 class="text-text-main text-4xl sm:text-6xl font-black leading-[1.1] tracking-tight">
                  {{ content.hero }}
                </h1>
                <p class="text-text-muted text-lg font-normal leading-relaxed max-w-lg">
                  {{ content.subheading }}
                </p>
              </div>
              <div class="flex flex-wrap gap-4 mt-2">
                <button @click="handleCTA" class="flex min-w-[140px] cursor-pointer items-center justify-center gap-3 rounded-lg h-12 px-6 bg-primary hover:bg-primary-hover text-white text-base font-bold transition-all hover:-translate-y-0.5">
                  <svg v-if="currentRole === 'channel-owners'" class="size-6" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 11.944 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                  {{ content.cta }}
                </button>
                <button class="flex min-w-[140px] cursor-pointer items-center justify-center rounded-lg h-12 px-6 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-base font-bold transition-all hover:border-slate-300">
                  <span class="flex items-center gap-2">
                    <span class="material-symbols-outlined text-[20px]">play_circle</span>
                    View Demo
                  </span>
                </button>
              </div>
            </div>
          </transition>

          <transition name="slide-fade" mode="out-in">
            <div :key="currentRole" class="lg:w-3/5 w-full mt-8 lg:mt-0 relative group perspective-1000">
              <div class="absolute -inset-4 bg-gradient-to-r from-emerald-200 to-teal-100 rounded-2xl blur-2xl opacity-40 group-hover:opacity-60 transition duration-1000"></div>
              <div class="relative w-full aspect-[4/3] bg-transparent rounded-xl overflow-hidden bg-contain bg-no-repeat bg-center transition-transform duration-500 group-hover:scale-[1.02]" :style='{ backgroundImage: `url("${content.image}")` }'>
              </div>
            </div>
          </transition>
        </div>
      </section>

      <!-- Value Explanation / Features -->
      <section class="w-full px-4 sm:px-10 py-16 max-w-7xl" id="features">
        <transition name="fade" mode="out-in">
          <div :key="currentRole">
            <div class="flex flex-col gap-4 text-center mb-16">
              <h2 class="text-slate-900 text-3xl sm:text-4xl font-bold leading-tight">{{ content.featuresTitle }}</h2>
              <p class="text-slate-500 max-w-2xl mx-auto text-lg">Powerful solutions tailored for the Ethiopian digital market.</p>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div v-for="feature in content.features" :key="feature.title" class="flex flex-col gap-5 rounded-2xl border border-slate-100 bg-white p-8 shadow-soft hover:-translate-y-1 transition-transform duration-300">
                <div class="size-14 rounded-xl bg-emerald-50 flex items-center justify-center text-primary">
                  <span class="material-symbols-outlined text-3xl">{{ feature.icon }}</span>
                </div>
                <div class="flex flex-col gap-2">
                  <h3 class="text-slate-900 text-xl font-bold">{{ feature.title }}</h3>
                  <p class="text-slate-500 text-sm leading-relaxed">{{ feature.desc }}</p>
                </div>
              </div>
            </div>
          </div>
        </transition>
      </section>

      <!-- Main Goal Section -->
      <section class="w-full bg-slate-50 border-y border-slate-200 py-24">
        <transition name="fade" mode="out-in">
          <div :key="currentRole" class="max-w-4xl mx-auto px-4 sm:px-10 text-center">
              <div class="inline-flex items-center gap-2 text-primary font-bold tracking-widest text-xs uppercase mb-4 bg-emerald-50 px-4 py-1.5 rounded-full">
                  <span class="material-symbols-outlined text-[16px]">verified</span>
                  {{ content.goalTitle }}
              </div>
              <h2 class="text-2xl sm:text-4xl font-black text-slate-900 leading-tight mb-8">
                  {{ content.goalDesc }}
              </h2>
              <div class="h-1 w-24 bg-primary mx-auto rounded-full"></div>
          </div>
        </transition>
      </section>

      <!-- Calculator (Only for Advertisers or potentially show for both with different labels) -->
      <section v-if="currentRole === 'advertisers'" class="w-full px-4 sm:px-10 py-24 max-w-7xl">
        <div class="rounded-2xl border border-slate-200 bg-white p-8 md:p-12 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] relative overflow-hidden">
          <div class="absolute top-0 right-0 w-80 h-80 bg-emerald-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-60"></div>
          <div class="absolute bottom-0 left-0 w-64 h-64 bg-teal-50 rounded-full blur-3xl -ml-10 -mb-10 opacity-60"></div>
          <div class="relative z-10 flex flex-col md:flex-row gap-12 items-center">
            <div class="w-full md:w-1/2 flex flex-col gap-8">
              <div>
                <h2 class="text-3xl font-bold text-slate-900">Calculate Your Reach</h2>
                <p class="text-slate-500 mt-2">See how far your budget can take you with teleboost's competitive CPM rates.</p>
              </div>
              <div class="flex flex-col gap-4">
                <div class="flex justify-between text-sm font-bold">
                  <label class="text-slate-700">Monthly Budget (ETB)</label>
                  <span class="text-primary bg-emerald-50 px-2 py-1 rounded">{{ budget.toLocaleString() }} ETB</span>
                </div>
                <input v-model.number="budget" class="w-full accent-primary h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer" max="100000" min="1000" step="500" type="range"/>
              </div>
              <div class="flex flex-col gap-4">
                <div class="flex justify-between text-sm font-bold">
                  <label class="text-slate-700">Target CPM</label>
                  <span class="text-primary bg-emerald-50 px-2 py-1 rounded">{{ cpm.toFixed(2) }} ETB</span>
                </div>
                <input v-model.number="cpm" class="w-full accent-primary h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer" max="20" min="1" step="0.5" type="range"/>
                <p class="text-xs text-slate-400">Average CPM ranges from 2.00 ETB to 15.00 ETB depending on niche.</p>
              </div>
            </div>
            <div class="w-full md:w-1/2">
              <div class="rounded-xl border border-slate-100 bg-slate-50/50 p-8 flex flex-col items-center justify-center text-center h-full min-h-[260px] backdrop-blur-sm">
                <span class="material-symbols-outlined text-primary text-4xl mb-4 bg-white p-3 rounded-full shadow-sm">group</span>
                <p class="text-slate-500 text-sm uppercase tracking-widest font-bold mb-2">Estimated Monthly Views</p>
                <p class="text-5xl sm:text-6xl font-black text-slate-900 tracking-tighter">{{ estimatedViews }}</p>
                <button class="mt-8 text-primary hover:text-primary-hover text-sm font-bold flex items-center gap-1 transition-colors group">
                  Start Campaign <span class="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Stats Section -->
      <section class="w-full border-t border-slate-100 bg-background-alt" id="stats">
        <div class="max-w-7xl mx-auto px-4 sm:px-10 py-12">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div v-for="stat in [
              { label: 'Potential Audience', value: '15M+', growth: 'Ethiopian Native', icon: 'hub' },
              { label: 'Active Channels', value: '5,000+', growth: '+120 this week', icon: 'visibility' },
              { label: 'Payment Payouts', value: 'ETB', growth: 'Local Fast', icon: 'account_balance_wallet' }
            ]" :key="stat.label" class="flex flex-col gap-2 rounded-xl p-6 border border-slate-200 bg-white shadow-xs hover:shadow-md hover:border-emerald-200 transition-all group">
              <div class="flex justify-between items-start">
                <p class="text-slate-500 text-sm font-semibold uppercase tracking-wider">{{ stat.label }}</p>
                <div class="p-2 rounded-lg bg-emerald-50 group-hover:bg-primary group-hover:text-white transition-colors text-emerald-600">
                  <span class="material-symbols-outlined text-xl block">{{ stat.icon }}</span>
                </div>
              </div>
              <p class="text-slate-900 text-4xl font-bold leading-tight mt-2">{{ stat.value }}</p>
              <div class="flex items-center gap-1 mt-1">
                <span class="material-symbols-outlined text-primary text-sm">check_circle</span>
                <p class="text-primary text-sm font-medium">{{ stat.growth }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA Section -->
      <section class="w-full px-4 py-24 text-center bg-white">
        <div class="max-w-4xl mx-auto flex flex-col items-center gap-6">
          <h2 class="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">Ready to join the Ethiopian ad revolution?</h2>
          <p class="text-slate-500 text-xl max-w-xl">Whether you want to grow your business or monetize your channel, teleboost is built for you.</p>
          <div class="flex flex-wrap justify-center gap-4 mt-6">
            <button @click="handleCTA" class="flex min-w-[200px] cursor-pointer items-center justify-center gap-3 rounded-xl h-14 px-8 bg-primary hover:bg-primary-hover text-white text-lg font-bold transition-all hover:-translate-y-1">
              <svg v-if="currentRole === 'channel-owners'" class="size-6" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 11.944 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
              {{ currentRole === 'advertisers' ? 'Start Advertising' : 'Monetize Channel' }}
            </button>
            <button class="flex min-w-[200px] cursor-pointer items-center justify-center rounded-xl h-14 px-8 bg-white border border-slate-200 hover:border-primary text-slate-700 hover:text-primary text-lg font-bold transition-all hover:bg-slate-50">
              Contact Support
            </button>
          </div>
        </div>
      </section>
    </main>

    <!-- Footer -->
    <footer class="w-full border-t border-slate-800 bg-slate-900 py-16 px-4 sm:px-10">
      <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div class="col-span-1 md:col-span-1 flex flex-col gap-6">
          <div class="flex items-center gap-2 text-white">
            <img src="/images/teleboost.png" alt="teleboost logo" class="size-8 object-contain" />
            <h2 class="text-white text-xl font-bold">teleboost</h2>
          </div>
          <p class="text-slate-400 text-sm leading-relaxed">The leading advertising platform for the Telegram ecosystem in Ethiopia. Connecting brands with local communities.</p>
        </div>
        <div v-for="section in [
          { title: 'Market', links: ['Ethiopian Channels', 'Case Studies', 'Pricing'] },
          { title: 'Network', links: ['Join as Publisher', 'Ad Standards', 'Payouts'] },
          { title: 'Company', links: ['About Us', 'Contact Support', 'Privacy Policy'] }
        ]" :key="section.title">
          <h3 class="text-white font-bold mb-6 text-lg">{{ section.title }}</h3>
          <ul class="flex flex-col gap-3 text-sm text-slate-400">
            <li v-for="link in section.links" :key="link">
              <a class="hover:text-primary transition-colors" href="#">{{ link }}</a>
            </li>
          </ul>
        </div>
      </div>
      <div class="max-w-7xl mx-auto mt-16 pt-8 border-t border-slate-800 flex flex-col sm:row justify-between items-center gap-6">
        <p class="text-slate-500 text-sm">© {{ new Date().getFullYear() }} teleboost Ethiopia. Built for the local market.</p>
        <div class="flex gap-6">
          <a class="text-slate-400 hover:text-white transition-colors" href="#">Telegram</a>
          <a class="text-slate-400 hover:text-white transition-colors" href="#">Twitter</a>
        </div>
      </div>
    </footer>
    <AuthModal :is-open="showAuthModal" @close="showAuthModal = false" />
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease-out;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-fade-enter-active {
  transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.7, 0, 0.84, 0);
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
