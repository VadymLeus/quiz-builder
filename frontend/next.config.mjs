/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [{ source: '/', destination: '/quizzes', permanent: false }];
  },
};

export default nextConfig;
