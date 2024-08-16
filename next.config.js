/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: "https://digital-assets.up.railway.app",
      },
    ],
  },
};

module.exports = nextConfig;

// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   images: {
//     remotePatterns: [
//       {
//         hostname: "localhost",
//         pathname: "**",
//         port: "3000",
//         protocol: "http",
//       },
//     ],
//   },
// };

// module.exports = nextConfig;
