"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MESSAGES } from "@/constants/lang/messages";
import { useSession } from "@/lib/auth-client";

export default function AdminPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);

  const [forbidden, setForbidden] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/admin/me");
        const data = await res.json();

        if (!data.user) {
          setForbidden(true);
        } else if (data.user.role !== "admin") {
          setForbidden(true);
        } else {
          // ⬅️ Admin confirmed → Log dashboard view
          await fetch("/api/admin/log-dashboard-open", {
            method: "POST",
          });

          setForbidden(false);
        }
      } catch {
        setForbidden(true);
      } finally {
        setAuthLoading(false);
      }
    }

    checkAuth();
  }, []);

  useEffect(() => {
    if (forbidden || authLoading) return;

    async function loadStats() {
      try {
        const res = await fetch("/api/admin/user-stats");
        const data = await res.json();
        setStats(data);
      } finally {
        setLoadingStats(false);
      }
    }

    async function loadUsers() {
      try {
        const res = await fetch("/api/admin/users");
        const data = await res.json();
        setUsers(data);
      } finally {
        setLoadingUsers(false);
      }
    }

    loadStats();
    loadUsers();
  }, [forbidden, authLoading]);

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this user?")) return;

    const res = await fetch(`/api/admin/delete-user/${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } else {
      alert(MESSAGES.admin.deleteUserFailed);
    }
  }

  async function handlePromote(id: string) {
    if (!confirm("Promote this user to admin?")) return;

    const res = await fetch(`/api/admin/promote-user/${id}`, {
      method: "PUT",
    });

    if (res.ok) {
      alert("User promoted.");
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, role: "admin" } : u))
      );
    } else {
      alert(MESSAGES.admin.promoteUserFailed);
    }
  }

  if (authLoading) {
    return <p className="p-8 text-center">{MESSAGES.admin.checkingAccess}</p>;
  }

  if (forbidden) {
    return (
      <div className="p-8 max-w-3xl mx-auto">
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg text-center text-lg font-medium">
          {MESSAGES.admin.onlyAdmins}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <div className="flex justify-end mb-6">
        <Link
          href="/admin/"
          className="px-4 py-2 bg-blue-600 text-white rounded-md"
        >
          View Endpoint Stats →
        </Link>
      </div>

      {/* API USAGE SUMMARY */}
      <h2 className="text-2xl font-semibold mb-3">User API Usage Summary</h2>

      {loadingStats ? (
        <p>Loading…</p>
      ) : (
        <table className="min-w-full border border-gray-300 mb-12">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-4 py-2">User ID</th>
              <th className="border px-4 py-2">Name</th>
              <th className="border px-4 py-2">Email</th>
              <th className="border px-4 py-2">Total Usage</th>
            </tr>
          </thead>
          <tbody>
            {stats.map((s) => (
              <tr key={s.userId}>
                <td className="border px-4 py-2">{s.userId}</td>
                <td className="border px-4 py-2">{s.user?.name}</td>
                <td className="border px-4 py-2">{s.user?.email}</td>
                <td className="border px-4 py-2">{s.totalUsage}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* USER LIST */}
      <h2 className="text-2xl font-semibold mb-3">User List</h2>

      {loadingUsers ? (
        <p>Loading users…</p>
      ) : (
        <table className="min-w-full border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-4 py-2">User ID</th>
              <th className="border px-4 py-2">Name</th>
              <th className="border px-4 py-2">Email</th>
              <th className="border px-4 py-2">Role</th>
              <th className="border px-4 py-2">Actions</th>
            </tr>
          </thead>

          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td className="border px-4 py-2">{u.id}</td>
                <td className="border px-4 py-2">{u.name}</td>
                <td className="border px-4 py-2">{u.email}</td>
                <td className="border px-4 py-2">{u.role}</td>
                <td className="border px-4 py-2 flex gap-2">
                  {session?.user?.id !== u.id && (
                    <>
                      <button
                        className="px-3 py-1 bg-yellow-500 text-white rounded"
                        onClick={() => handlePromote(u.id)}
                      >
                        Promote
                      </button>

                      <button
                        className="px-3 py-1 bg-red-600 text-white rounded"
                        onClick={() => handleDelete(u.id)}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
