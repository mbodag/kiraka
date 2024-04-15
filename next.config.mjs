// /** @type {import('next').NextConfig} */
// const nextConfig = {};

// export default nextConfig;




/** @type {import('next').NextConfig} */
const nextConfig = {
    rewrites: async () => {
        return [
            {
                source: '/api/:path*',
                destination:
                    process.env.NODE_ENV === 'development'
                        ? 'http://127.0.0.1:8000/api/:path*'
                        : 'http://127.0.0.1:8000/api/:path*',
            },
        ]
    },
}

export default nextConfig;


// module.exports = () => {
//     const rewrites = () => {
//       return [
//         {
//           source: "/hello/:path*",
//           destination: "http://localhost:5000/hello/:path*",
//         },
//       ];
//     };
//     return {
//       rewrites,
//     };
//   };
