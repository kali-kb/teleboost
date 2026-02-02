<script setup lang="ts">
import { formatCurrency } from '../../utils/formatters';

defineProps<{
  wallet: any;
}>();
</script>

<template>
  <div>
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
        <div v-if="wallet.recentTransactions.length === 0" class="px-6 py-12 text-center text-slate-400">
          <div class="flex flex-col items-center gap-3">
            <span class="material-symbols-outlined text-4xl">history</span>
            <p class="font-bold text-sm">No transactions yet</p>
          </div>
        </div>
        <div v-else v-for="tx in wallet.recentTransactions" :key="tx.id" class="px-6 py-4 hover:bg-slate-50 transition-colors flex items-center justify-between">
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
  </div>
</template>
