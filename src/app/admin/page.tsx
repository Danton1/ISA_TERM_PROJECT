// ChatGPT and Copoilot assisted with the proofreading and optimization of this code.
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MESSAGES } from "@/constants/lang/messages";

export default function AdminPage() {
  const [stats, setStats] = useState<any[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);

  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  // ============================================================
  // 🔐 CHECK ADMIN ROLE
  // ============================================================
  useEffect(() => {
    async function checkRole() {
      try {
        const res = await fetch("/api/v1/admin/me");
        const data = await res.json();

        if (!data.user || data.user.role !== "admin") {
          setIsAdmin(false);
        } else {
          setIsAdmin(true);
        }
      } catch (err) {
        setIsAdmin(false);
      }
    }

    checkRole();
  }, []);

  // ============================================================
  // 📌 LOAD STATS + TRIGGER LOGGING WHEN ADMIN
  // ============================================================
  useEffect(() => {
    if (isAdmin !== true) return;

    async function loadStatsAndLog() {
      try {
        // 1️⃣ Call your logging endpoint
        await fetch("/api/v1/admin/log-dashboard-open", { method: "POST" });

        // 2️⃣ Load endpoint stats
        const res = await fetch("/api/v1/admin/enpoint-stats");
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error("Error loading stats or logging:", err);
      } finally {
        setLoadingStats(false);
      }
    }

    loadStatsAndLog();
  }, [isAdmin]);

  // ============================================================
  // 🚫 BLOCK NON-ADMINS
  // ============================================================
  if (isAdmin === false) {
    return (
      <div className="p-8 text-center text-red-600 text-2xl font-bold">
        {MESSAGES.admin.accessDenied}
      </div>
    );
  }

  if (isAdmin === null || loadingStats) {
    return <p className="p-8 text-center">{MESSAGES.admin.checkingPermissions}</p>;
  }

  // ============================================================
  // 📊 ADMIN CONTENT
  // ============================================================
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <div className="flex justify-end mb-6">
        <Link
          href="/admin/user-stats"
          className="px-4 py-2 bg-blue-600 text-white rounded-md"
        >
          View User Stats →
        </Link>
      </div>

      <h2 className="text-2xl font-semibold mb-3">Endpoint Stats</h2>

      <table className="min-w-full border border-gray-300 mt-3">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-4 py-2">Method</th>
            <th className="border px-4 py-2">Endpoint</th>
            <th className="border px-4 py-2">Count</th>
            <th className="border px-4 py-2">Last Updated</th>
          </tr>
        </thead>

        <tbody>
          {stats.map((s) => (
            <tr key={s.id}>
              <td className="border px-4 py-2">{s.method}</td>
              <td className="border px-4 py-2">{s.endpoint}</td>
              <td className="border px-4 py-2">{s.count}</td>
              <td className="border px-4 py-2">
                {new Date(s.updatedAt).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
