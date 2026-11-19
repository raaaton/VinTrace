import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        // Prevent the optimizer from caching access-controlled showroom media.
        localPatterns: [{ pathname: "/images/**", search: "" }],
        remotePatterns: [
            {
                protocol: "https",
                hostname: "twehizpuhmnhkfmdkqmr.supabase.co",
                port: "",
                pathname: "/storage/v1/object/sign/**",
            },
        ],
    },

    async rewrites() {
        return [
            {
                source: "/login",
                destination: "/auth/login",
            },
            {
                source: "/register",
                destination: "/auth/sign-up",
            },
        ];
    },
};

export default nextConfig;
