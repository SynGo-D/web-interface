export async function getSonarDashboard() {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/sonar/analysis`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch SonarQube dashboard data");
  }

  return response.json();
}