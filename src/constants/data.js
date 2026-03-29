export const dummyStats = {
  totalSale: 2450000,
  totalPurchase: 1820000,
  totalProfit: 630000,
  totalChannels: 48,
  soldChannels: 31,
  availableChannels: 12,
  hackedChannels: 5,
};

export const monthlySalesData = [
  { month: "Jan", sales: 320000, purchases: 210000, profit: 110000 },
  { month: "Feb", sales: 280000, purchases: 190000, profit: 90000 },
  { month: "Mar", sales: 450000, purchases: 310000, profit: 140000 },
  { month: "Apr", sales: 390000, purchases: 270000, profit: 120000 },
  { month: "May", sales: 520000, purchases: 380000, profit: 140000 },
  { month: "Jun", sales: 490000, purchases: 460000, profit: 30000 },
];

export const recentChannels = [
  { id: 1, name: "TechVault PK", niche: "Technology", subscribers: "125K", salePrice: 380000, status: "sold" },
  { id: 2, name: "CookingWithNadia", niche: "Food", subscribers: "89K", salePrice: 210000, status: "available" },
  { id: 3, name: "CricketZone", niche: "Sports", subscribers: "340K", salePrice: 750000, status: "available" },
  { id: 4, name: "DailyVlogs786", niche: "Lifestyle", subscribers: "55K", salePrice: 130000, status: "sold" },
  { id: 5, name: "IslamicReminders", niche: "Religion", subscribers: "210K", salePrice: 490000, status: "available" },
];

export const navLinks = [
  { label: "Dashboard", icon: "LayoutDashboard", path: "/" },
  { label: "Channels", icon: "Video", path: "/channels" },
  { label: "Purchases", icon: "ShoppingCart", path: "/purchases" },
  { label: "Sales", icon: "TrendingUp", path: "/sales" },
  { label: "Reports", icon: "BarChart2", path: "/reports" },
  { label: "Hacked", icon: "ShieldAlert", path: "/hacked" },
];