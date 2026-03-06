import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { fetchAuthUser, selectTable } from "../../lib/supabase"

export default async function DashboardPage() {
  const accessToken = cookies().get("sb-access-token")?.value

  if (!accessToken) {
    redirect("/login")
  }

  const user = await fetchAuthUser(accessToken)
  if (!user) {
    redirect("/login")
  }

  const [devices, analytics] = await Promise.all([
    selectTable(accessToken, "devices", "select=id,device_name,last_seen_at,revoked_at&order=created_at.desc&limit=20"),
    selectTable(
      accessToken,
      "device_analytics",
      "select=id,device_id,metric_name,metric_value,recorded_at&order=recorded_at.desc&limit=20"
    ),
  ])

  return (
    <main style={{ fontFamily: "sans-serif", padding: 24 }}>
      <h1>MurMur Stronghold Dashboard</h1>
      <p>Signed in as {user.email ?? user.id}</p>
      <form action="/auth/signout" method="post">
        <button type="submit">Sign out</button>
      </form>

      <h2 style={{ marginTop: 32 }}>Devices</h2>
      <table border={1} cellPadding={8} style={{ borderCollapse: "collapse", minWidth: 720 }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Last Seen</th>
            <th>Revoked</th>
          </tr>
        </thead>
        <tbody>
          {devices.length ? (
            devices.map((device: any) => (
              <tr key={device.id}>
                <td>{device.id}</td>
                <td>{device.device_name}</td>
                <td>{device.last_seen_at ?? "-"}</td>
                <td>{device.revoked_at ?? "active"}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4}>No devices available.</td>
            </tr>
          )}
        </tbody>
      </table>

      <h2 style={{ marginTop: 32 }}>Analytics</h2>
      <table border={1} cellPadding={8} style={{ borderCollapse: "collapse", minWidth: 720 }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Device ID</th>
            <th>Metric</th>
            <th>Value</th>
            <th>Recorded</th>
          </tr>
        </thead>
        <tbody>
          {analytics.length ? (
            analytics.map((entry: any) => (
              <tr key={entry.id}>
                <td>{entry.id}</td>
                <td>{entry.device_id}</td>
                <td>{entry.metric_name}</td>
                <td>{entry.metric_value}</td>
                <td>{entry.recorded_at}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5}>No analytics events available.</td>
            </tr>
          )}
        </tbody>
      </table>
    </main>
  )
}
