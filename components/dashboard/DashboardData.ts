export const dashboardStats = [
  {
    title: "Projects",
    value: 8,
    change: "+2 this month",
  },
  {
    title: "Repositories",
    value: 12,
    change: "+1 connected",
  },
  {
    title: "Open Pull Requests",
    value: 19,
    change: "+5 awaiting review",
  },
  {
    title: "Technical Debt",
    value: "18 hrs",
    change: "-3 hrs",
  },
  {
    title: "AI Suggestions",
    value: 64,
    change: "12 new",
  },
  {
    title: "Code Quality",
    value: "A",
    change: "Excellent",
  },
];

export const debtData = [
  { month: "Jan", debt: 45 },
  { month: "Feb", debt: 40 },
  { month: "Mar", debt: 35 },
  { month: "Apr", debt: 31 },
  { month: "May", debt: 26 },
  { month: "Jun", debt: 22 },
  { month: "Jul", debt: 18 },
];

export const qualityData = [
  { project: "Library", score: 94 },
  { project: "Hospital", score: 90 },
  { project: "Social", score: 96 },
  { project: "Trading", score: 88 },
  { project: "Dashboard", score: 92 },
];

export const issueData = [
  { name: "Bugs", value: 15 },
  { name: "Code Smells", value: 42 },
  { name: "Security", value: 8 },
  { name: "Duplications", value: 12 },
];

export const contributors = [
  {
    id: 1,
    name: "John Silva",
    role: "Senior Full Stack Developer",
    expertise: "React • Next.js • TypeScript",
    commits: 184,
    prs: 42,
    quality: "A",
  },
  {
    id: 2,
    name: "Kasun Perera",
    role: "Backend Engineer",
    expertise: "Java • Spring Boot • PostgreSQL",
    commits: 162,
    prs: 39,
    quality: "A",
  },
  {
    id: 3,
    name: "Nimal Fernando",
    role: "AI Engineer",
    expertise: "Python • FastAPI • Machine Learning",
    commits: 138,
    prs: 28,
    quality: "A-",
  },
];

export const pullRequests = [
  {
    id: "#142",
    title: "Improve Login Authentication",
    repository: "Code Review Dashboard",
    author: "John Silva",
    status: "Open",
  },
  {
    id: "#138",
    title: "Fix Repository Authorization",
    repository: "Backend API",
    author: "Kasun Perera",
    status: "In Review",
  },
  {
    id: "#135",
    title: "Improve AI Prompt Generation",
    repository: "AI Service",
    author: "Nimal Fernando",
    status: "Merged",
  },
];

export const codeReviews = [
  {
    file: "login.tsx",
    issues: 2,
    debt: "3 min",
    severity: "Medium",
  },
  {
    file: "auth.ts",
    issues: 5,
    debt: "8 min",
    severity: "High",
  },
  {
    file: "repository.ts",
    issues: 1,
    debt: "1 min",
    severity: "Low",
  },
  {
    file: "dashboard.tsx",
    issues: 3,
    debt: "6 min",
    severity: "Medium",
  },
];