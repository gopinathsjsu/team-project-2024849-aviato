// src/pages/Admin/Dashboard.jsx
import { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell
} from "recharts";
import * as htmlToImage from "html-to-image";
import download from "downloadjs";
import { logoutUser } from "@/store/thunks/authThunks";

export default function AdminDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, token } = useSelector((state) => state.auth);

  const [stats, setStats] = useState(null);
  const [topRestaurants, setTopRestaurants] = useState([]);
  const [restaurantNames, setRestaurantNames] = useState({});
  const [pendingRestaurants, setPendingRestaurants] = useState([]);
  const [dateRange, setDateRange] = useState("30");
  const [viewMode, setViewMode] = useState("chart");
  const chartRef = useRef(null);

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange]);

  const fetchDashboardData = async () => {
    try {
      const statsRes = await axios.get("http://localhost:8080/api/admin/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const topRes = await axios.get(
        `http://localhost:8080/api/admin/analytics/top-restaurants?days=${dateRange}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const pendingRes = await axios.get("http://localhost:8080/api/restaurants/pending", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setStats(statsRes.data);
      setTopRestaurants(topRes.data);
      setPendingRestaurants(pendingRes.data);

      const nameMap = {};
      for (const r of topRes.data) {
        const res = await axios.get(
          `http://localhost:8080/api/restaurants/details/${r.restaurantId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        nameMap[r.restaurantId] = res.data.name;
      }
      setRestaurantNames(nameMap);
    } catch (err) {
      console.error("Failed to fetch admin dashboard data:", err);
    }
  };

  const handleApprove = async (id) => {
    try {
      await axios.patch(`http://localhost:8080/api/restaurants/${id}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchDashboardData();
    } catch (err) {
      console.error("Failed to approve restaurant:", err);
    }
  };

  const handleRemove = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/api/admin/remove/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchDashboardData();
    } catch (err) {
      console.error("Failed to remove restaurant:", err);
    }
  };

  const handleDownloadChart = () => {
    if (chartRef.current === null) return;
    htmlToImage.toPng(chartRef.current).then((dataUrl) => {
      download(dataUrl, "top_restaurants_chart.png");
    });
  };

  const handleSignOut = () => {
    dispatch(logoutUser());
    navigate("/login");
  };

  const rankedChartData = topRestaurants.map((r, i) => ({
    name: restaurantNames[r.restaurantId] || `Restaurant ${r.restaurantId}`,
    bookings: r.bookingCount,
    fill: ["#16a34a", "#22c55e", "#84cc16", "#facc15", "#f97316"][i] || "#ddd",
  }));

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Welcome, Admin {user?.name || ""}</h1>
        <div className="flex gap-4">
          <Button
            className="bg-red-600 hover:bg-red-700"
            onClick={() => navigate("/admin/approvals")}
          >
            Remove Restaurants
          </Button>
          <Button
            className="bg-red-600 hover:bg-red-700"
            onClick={handleSignOut}
          >
            Sign Out
          </Button>
        </div>
      </div>

      {stats ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <StatCard title="Total Users" value={stats.totalUsers} />
          <StatCard title="Total Bookings" value={stats.totalBookings} />
          <StatCard title="Restaurants" value={stats.totalRestaurants} />
          <StatCard title="Pending Approvals" value={stats.pendingRestaurants} highlight />
        </div>
      ) : (
        <p className="text-gray-600">Loading stats...</p>
      )}

      <div className="flex justify-end mb-4">
        <select
          className="border rounded p-2"
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
        >
          <option value="7">Last 7 Days</option>
          <option value="30">Last 30 Days</option>
          <option value="90">Last 90 Days</option>
        </select>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Top Restaurants by Bookings</h2>
          <div className="flex gap-3">
            <Button onClick={() => setViewMode(viewMode === "chart" ? "table" : "chart")}>
              Toggle View
            </Button>
            {viewMode === "chart" && (
              <Button onClick={handleDownloadChart}>Download Chart</Button>
            )}
          </div>
        </div>

        {topRestaurants.length > 0 ? (
          viewMode === "chart" ? (
            <div ref={chartRef} className="w-full h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={rankedChartData}
                  margin={{ top: 20, right: 30, left: 100, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={200} />
                  <Tooltip />
                  <Bar dataKey="bookings" isAnimationActive>
                    {rankedChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <ul className="space-y-3">
              {topRestaurants.map((r, index) => (
                <li
                  key={r.restaurantId}
                  className="flex justify-between items-center p-3 border border-gray-200 rounded"
                >
                  <span className="font-medium">
                    #{index + 1} — {restaurantNames[r.restaurantId] || `Restaurant ${r.restaurantId}`}
                  </span>
                  <span className="text-gray-700 font-semibold">{r.bookingCount} bookings</span>
                </li>
              ))}
            </ul>
          )
        ) : (
          <p className="text-gray-600">No booking data available.</p>
        )}
      </div>

      {pendingRestaurants.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-yellow-700">Pending Restaurant Approvals</h2>
          <ul className="space-y-4">
            {pendingRestaurants.map((rest) => (
              <li key={rest.restaurantId} className="border p-4 rounded-md shadow-sm bg-yellow-50">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold">{rest.name}</h3>
                    <p className="text-sm text-gray-600">{rest.address}, {rest.city}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => handleApprove(rest.restaurantId)} className="bg-green-600 hover:bg-green-700">Approve</Button>
                    <Button onClick={() => handleRemove(rest.restaurantId)} variant="destructive">Remove</Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, highlight = false }) {
  return (
    <div className={`p-4 rounded shadow border ${highlight ? "bg-yellow-100 border-yellow-300" : "bg-white"}`}>
      <h3 className="text-sm text-gray-600">{title}</h3>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  );
}
