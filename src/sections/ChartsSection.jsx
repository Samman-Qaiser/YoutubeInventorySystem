import { motion } from "framer-motion";
import ReactApexChart from "react-apexcharts";
import { useMonthlyProfitLoss } from "../hooks/useChannels";

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function ChartSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
      </div>
      <div className="h-[230px] bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
      <div className="mt-3 flex gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        ))}
      </div>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyChart({ title }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col items-center justify-center h-[340px]">
      <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">{title}</p>
      <p className="text-xs text-gray-400 dark:text-gray-500">No data available yet</p>
    </div>
  );
}

export default function ChartsSection({ darkMode }) {
  const { data: monthlyData = [], isLoading } = useMonthlyProfitLoss();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
    );
  }

  if (!monthlyData.length) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EmptyChart title="Monthly Sales vs Purchases" />
        <EmptyChart title="Monthly Profit" />
      </div>
    );
  }

  // ── Data — reverse so oldest → newest (left to right on chart) ─────────────
  const sorted       = [...monthlyData].reverse()
  const months       = sorted.map((d) => d.month)
  const salesData    = sorted.map((d) => d.sales)
  const purchasesData= sorted.map((d) => d.purchases)
  const profitData   = sorted.map((d) => d.profit)

  // ── Summary stats ──────────────────────────────────────────────────────────
  const maxSale     = Math.max(...salesData, 0)
  const minSale     = Math.min(...salesData.filter(v => v > 0), 0)
  const avgSale     = salesData.length
    ? Math.round(salesData.reduce((a, b) => a + b, 0) / salesData.length)
    : 0
  const bestProfit  = Math.max(...profitData, 0)
  const worstProfit = Math.min(...profitData, 0)
  const totalProfit = profitData.reduce((a, b) => a + b, 0)
  const bestMonth   = months[profitData.indexOf(bestProfit)]  ?? '-'
  const worstMonth  = months[profitData.indexOf(worstProfit)] ?? '-'

  // ── Chart theme ────────────────────────────────────────────────────────────
  const textColor  = darkMode ? "#9ca3af" : "#6b7280"
  const gridColor  = darkMode ? "#1f2937" : "#f3f4f6"
  const tooltipBg  = darkMode ? "#111827" : "#ffffff"
  const borderClr  = darkMode ? "#374151" : "#e5e7eb"
  const titleClr   = darkMode ? "#f9fafb" : "#111827"

  // ── Area chart options ────────────────────────────────────────────────────
  const areaOptions = {
    chart: {
      type: "area",
      toolbar: { show: false },
      zoom: { enabled: false },
      animations: { enabled: true, easing: "easeinout", speed: 900 },
      background: "transparent",
    },
    colors: ["#10b981", "#3b82f6"],
    fill: {
      type: "gradient",
      gradient: { shadeIntensity: 1, opacityFrom: 0.35, opacityTo: 0.02, stops: [0, 100] },
    },
    stroke: { curve: "smooth", width: 2.5 },
    markers: { size: 4, strokeWidth: 0, hover: { size: 7 } },
    xaxis: {
      categories: months,
      labels: { style: { colors: textColor, fontSize: "12px" } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: { colors: textColor, fontSize: "11px" },
        formatter: (val) =>
          val >= 1000000 ? `${(val / 1000000).toFixed(1)}M`
          : val >= 1000  ? `${(val / 1000).toFixed(0)}K`
          : String(Math.round(val)),
      },
    },
    grid: { borderColor: gridColor, strokeDashArray: 4, xaxis: { lines: { show: false } } },
    tooltip: {
      theme: darkMode ? "dark" : "light",
      style: { fontSize: "12px" },
      custom: ({ series, dataPointIndex }) => {
        const sale     = series[0][dataPointIndex]
        const purchase = series[1][dataPointIndex]
        const profit   = sale - purchase
        const month    = months[dataPointIndex]
        return `
          <div style="background:${tooltipBg};padding:12px 16px;border-radius:12px;border:1px solid ${borderClr};font-size:12px;min-width:160px">
            <div style="font-weight:700;margin-bottom:8px;color:${titleClr}">${month}</div>
            <div style="color:#10b981;margin-bottom:4px">● Sales: Rs ${sale.toLocaleString()}</div>
            <div style="color:#3b82f6;margin-bottom:4px">● Purchases: Rs ${purchase.toLocaleString()}</div>
         
          </div>`
      },
    },
    legend: { labels: { colors: textColor }, markers: { radius: 6 } },
    dataLabels: { enabled: false },
  }

  // ── Bar chart options ─────────────────────────────────────────────────────
  const barOptions = {
    chart: {
      type: "bar",
      toolbar: { show: false },
      animations: {
        enabled: true, easing: "easeinout", speed: 900,
        animateGradually: { enabled: true, delay: 100 },
      },
      background: "transparent",
    },
    colors: profitData.map((v) => (v >= 0 ? "#8b5cf6" : "#ef4444")),
    fill: {
      type: "gradient",
      gradient: {
        shade: "dark", type: "vertical", shadeIntensity: 0.3,
        opacityFrom: 1, opacityTo: 0.75, stops: [0, 100],
      },
    },
    plotOptions: {
      bar: {
        borderRadius: 8, columnWidth: "52%", distributed: true,
        dataLabels: { position: "top" },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val) =>
        val >= 1000000 ? `${(val / 1000000).toFixed(1)}M`
        : val >= 1000  ? `${(val / 1000).toFixed(0)}K`
        : String(Math.round(val)),
      offsetY: -22,
      style: { fontSize: "11px", fontWeight: 600, colors: [textColor] },
    },
    xaxis: {
      categories: months,
      labels: { style: { colors: textColor, fontSize: "12px" } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: { colors: textColor, fontSize: "11px" },
        formatter: (val) =>
          val >= 1000000 ? `${(val / 1000000).toFixed(1)}M`
          : val >= 1000  ? `${(val / 1000).toFixed(0)}K`
          : String(Math.round(val)),
      },
    },
    grid: { borderColor: gridColor, strokeDashArray: 4, xaxis: { lines: { show: false } } },
    tooltip: {
      theme: darkMode ? "dark" : "light",
      custom: ({ dataPointIndex }) => {
        const month    = months[dataPointIndex]
        const sale     = salesData[dataPointIndex]
        const purchase = purchasesData[dataPointIndex]
        const profit   = profitData[dataPointIndex]
        return `
          <div style="background:${tooltipBg};padding:12px 16px;border-radius:12px;border:1px solid ${borderClr};font-size:12px;min-width:160px">
            <div style="font-weight:700;margin-bottom:8px;color:${titleClr}">${month}</div>
            <div style="color:#10b981;margin-bottom:4px">● Sales: Rs ${sale.toLocaleString()}</div>
            <div style="color:#3b82f6;margin-bottom:4px">● Purchases: Rs ${purchase.toLocaleString()}</div>
            <div style="border-top:1px solid ${borderClr};padding-top:6px;margin-top:4px;color:${profit >= 0 ? "#8b5cf6" : "#ef4444"};font-weight:600">
              ● Profit: Rs ${profit.toLocaleString()}
            </div>
          </div>`
      },
    },
    legend: { show: false },
    annotations: {
      yaxis: [{
        y: 0,
        borderColor: "#9ca3af",
        strokeDashArray: 4,
        label: {
          text: "Break Even",
          style: { color: textColor, fontSize: "10px", background: "transparent" },
        },
      }],
    },
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

      {/* ── Sales vs Purchases ─────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.005, y: -2 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm transition-all"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
            Monthly Sales vs Purchases
          </h3>
          <span className="text-xs text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded-lg">
            {months.length} Month{months.length !== 1 ? "s" : ""}
          </span>
        </div>

        <ReactApexChart
          options={areaOptions}
          series={[
            { name: "Sales",     data: salesData     },
            { name: "Purchases", data: purchasesData },
          ]}
          type="area"
          height={230}
        />

        <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-400 dark:text-gray-500 border-t border-gray-100 dark:border-gray-800 pt-3">
          <span>📈 Highest: <span className="text-emerald-500 font-medium">Rs {maxSale.toLocaleString()}</span></span>
          <span>📉 Lowest: <span className="text-red-400 font-medium">Rs {minSale.toLocaleString()}</span></span>
          <span>➗ Avg: <span className="text-blue-400 font-medium">Rs {avgSale.toLocaleString()}</span></span>
        </div>
      </motion.div>

      {/* ── Monthly Profit ─────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.005, y: -2 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm transition-all"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
            Monthly Profit
          </h3>
          <span className="text-xs text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded-lg">
            {months.length} Month{months.length !== 1 ? "s" : ""}
          </span>
        </div>

        <ReactApexChart
          options={barOptions}
          series={[{ name: "Profit", data: profitData }]}
          type="bar"
          height={230}
        />

        <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-400 dark:text-gray-500 border-t border-gray-100 dark:border-gray-800 pt-3">
          <span>🏆 Best: <span className="text-emerald-500 font-medium">{bestMonth} (Rs {bestProfit.toLocaleString()})</span></span>
          <span>⚠️ Worst: <span className="text-red-400 font-medium">{worstMonth} (Rs {worstProfit.toLocaleString()})</span></span>
          <span>💰 Total: <span className="text-violet-500 font-medium">Rs {totalProfit.toLocaleString()}</span></span>
        </div>
      </motion.div>

    </div>
  );
}