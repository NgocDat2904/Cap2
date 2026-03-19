/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      // 1. Định nghĩa chuyển động (Keyframes)
      keyframes: {
        fadeSlideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" }, // Bắt đầu: Mờ tịt và tụt xuống 20px
          "100%": { opacity: "1", transform: "translateY(0)" }, // Kết thúc: Rõ nét và nằm đúng vị trí
        },
      },
      // 2. Đặt tên cho Animation để gọi trong class
      animation: {
        "fade-slide-up": "fadeSlideUp 0.6s ease-out forwards",
      },
    },
  },
  plugins: [],
};
