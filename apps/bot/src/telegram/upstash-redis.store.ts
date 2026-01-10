import { Redis } from '@upstash/redis';

export class UpstashRedisStore {
    private redis: Redis;

    constructor(url: string, token: string) {
        this.redis = new Redis({
            url: url,
            token: token,
        });
    }

    async get(key: string): Promise<any | undefined> {
        try {
            console.log(`[RedisStore] GET ${key}`);
            const data = await this.redis.get(key);
            console.log(`[RedisStore] GET ${key} data:`, JSON.stringify(data));
            return data || undefined;
        } catch (error) {
            console.error(`[RedisStore] GET error for ${key}:`, error);
            return undefined;
        }
    }

    async set(key: string, value: any): Promise<void> {
        try {
            console.log(`[RedisStore] SET ${key}`);
            await this.redis.set(key, value);
        } catch (error) {
            console.error(`[RedisStore] SET error for ${key}:`, error);
        }
    }

    async delete(key: string): Promise<void> {
        try {
            console.log(`[RedisStore] DELETE ${key}`);
            await this.redis.del(key);
        } catch (error) {
            console.error(`[RedisStore] DELETE error for ${key}:`, error);
        }
    }
}
