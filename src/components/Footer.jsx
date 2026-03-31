export default function Footer() {
  const currentDate = new Date();
const currentYear = currentDate.getFullYear();

  return (
    <footer className="mt-auto px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 dark:text-gray-400 gap-2 sm:gap-0 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm transition-colors">
      <div className="w-full sm:w-1/3 flex justify-center sm:justify-start order-2 sm:order-1">
        v1.0.0
      </div>
      <div className="w-full sm:w-1/3 text-center order-1 sm:order-2">
        &copy; {currentYear} AbbasStock. All rights reserved.
      </div>
      <div className="w-full sm:w-1/3 flex justify-center  sm:justify-end order-3">
      <p className="text-[14px]">  Made with 🥴  and 🚬
        by Samman & Hussain</p>
      
      </div>
    </footer>
  );
}