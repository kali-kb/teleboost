import { createAuthClient } from "better-auth/vue";

export const authClient = createAuthClient({
    baseURL: "http://localhost:3001/api/auth", // The base URL of your auth server
    
});

export const useAuth = () => {
    const getSession = async () => {
        const data = await authClient.getSession();
        return data.data;
    };

    const signOut = async () => {
        await authClient.signOut();
        window.location.hash = "/";
    };

    return {
        getSession,
        signOut,
        authClient,
    };
};
