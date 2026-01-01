<script setup lang="ts">
defineProps<{
  user: any;
}>();
</script>

<template>
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
