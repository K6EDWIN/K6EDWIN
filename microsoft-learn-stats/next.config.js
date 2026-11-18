/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  outputFileTracingIncludes: {
    '/api/learn': ['./node_modules/puppeteer/**'],
  },
}
export default nextConfig
