import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export interface TelegramChannel {
    id: string;
    title: string;
    username: string;
    avatar_url?: string;
    subscribers: number;
    avg_views: number;
    price_per_post: string;
    category: string;
    verified: boolean;
}

export const useCampaignCartStore = defineStore('campaignCart', () => {
    const selectedChannels = ref<TelegramChannel[]>([]);

    const totalChannels = computed(() => selectedChannels.value.length);

    const totalPrice = computed(() => {
        return selectedChannels.value.reduce((total, channel) => {
            return total + (parseFloat(channel.price_per_post) || 0);
        }, 0);
    });

    const totalReach = computed(() => {
        return selectedChannels.value.reduce((total, channel) => {
            return total + (channel.subscribers || 0);
        }, 0);
    });

    const estimatedImpressions = computed(() => {
        return selectedChannels.value.reduce((total, channel) => {
            return total + (channel.avg_views || 0);
        }, 0);
    });

    function toggleChannel(channel: TelegramChannel) {
        const index = selectedChannels.value.findIndex(c => c.id === channel.id);
        if (index > -1) {
            selectedChannels.value.splice(index, 1);
        } else {
            selectedChannels.value.push(channel);
        }
    }

    function removeChannel(channelId: string) {
        selectedChannels.value = selectedChannels.value.filter(c => c.id !== channelId);
    }

    function isSelected(channelId: string) {
        return selectedChannels.value.some(c => c.id === channelId);
    }

    function clearCart() {
        selectedChannels.value = [];
    }

    return {
        selectedChannels,
        totalChannels,
        totalPrice,
        totalReach,
        estimatedImpressions,
        toggleChannel,
        removeChannel,
        isSelected,
        clearCart
    };
});
