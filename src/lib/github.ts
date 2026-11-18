import { cacheLife } from "next/cache";
import { profile } from "@/data/profile";
import { githubSnapshot } from "@/data/github-snapshot";

// Lấy số liệu GitHub lúc build, sau đó Next.js tự làm mới ngầm khoảng mỗi giờ (giống ISR).
// Không cần token. Nếu bị GitHub giới hạn lượt gọi, đặt biến môi trường GITHUB_TOKEN
// (token loại fine-grained, không cần quyền gì thêm) trên Vercel. Token chỉ dùng ở server,
// không bao giờ gửi xuống trình duyệt.

export type GitHubRepo = {
  name: string;
  description: string | null;
  url: string;
  language: string | null;
  stars: number;
  fork: boolean;
  createdAt: string;
  pushedAt: string;
};

export type ContributionDay = {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
};

export type GitHubData = {
  username: string;
  profileUrl: string;
  publicRepos: number;
  followers: number | null;
  stars: number;
  sinceYear: number;
  languages: { name: string; count: number; percent: number }[];
  /** Tổng số ngôn ngữ chính khác nhau */
  languageCount: number;
  recent: GitHubRepo[];
  /** Mỗi phần tử là một tuần (Chủ nhật → Thứ bảy), ngày trống là null */
  contributions: { total: number; weeks: (ContributionDay | null)[][] } | null;
  updatedAt: string;
  live: boolean;
};

const API = "https://api.github.com";
const TIMEOUT = 8000;

function apiHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "personal-portfolio",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (process.env.GITHUB_TOKEN)
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  return headers;
}

async function getJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: { ...apiHeaders(), ...init?.headers },
    signal: AbortSignal.timeout(TIMEOUT),
  });
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  return response.json() as Promise<T>;
}

type ApiUser = { public_repos: number; followers: number; created_at: string };
type ApiRepo = {
  name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  fork: boolean;
  created_at: string;
  pushed_at: string;
};

async function fetchProfile(username: string) {
  const [user, repos] = await Promise.all([
    getJson<ApiUser>(`${API}/users/${username}`),
    getJson<ApiRepo[]>(
      `${API}/users/${username}/repos?per_page=100&type=owner&sort=pushed`,
    ),
  ]);
  return {
    publicRepos: user.public_repos,
    followers: user.followers,
    createdAt: user.created_at,
    repos: repos.map<GitHubRepo>((repo) => ({
      name: repo.name,
      description: repo.description,
      url: repo.html_url,
      language: repo.language,
      stars: repo.stargazers_count,
      fork: repo.fork,
      createdAt: repo.created_at,
      pushedAt: repo.pushed_at,
    })),
  };
}

const levels = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
} as const;

/** Biểu đồ đóng góp: có GITHUB_TOKEN thì dùng GraphQL chính thức, không thì dùng API công khai miễn phí. */
async function fetchContributions(
  username: string,
): Promise<{ total: number; days: ContributionDay[] }> {
  if (process.env.GITHUB_TOKEN) {
    type Calendar = {
      data: {
        user: {
          contributionsCollection: {
            contributionCalendar: {
              totalContributions: number;
              weeks: {
                contributionDays: {
                  date: string;
                  contributionCount: number;
                  contributionLevel: keyof typeof levels;
                }[];
              }[];
            };
          };
        };
      };
    };
    const query = `query($login: String!) { user(login: $login) { contributionsCollection { contributionCalendar {
      totalContributions weeks { contributionDays { date contributionCount contributionLevel } } } } } }`;
    const json = await getJson<Calendar>(`${API}/graphql`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables: { login: username } }),
    });
    const calendar =
      json.data.user.contributionsCollection.contributionCalendar;
    return {
      total: calendar.totalContributions,
      days: calendar.weeks.flatMap((week) =>
        week.contributionDays.map((day) => ({
          date: day.date,
          count: day.contributionCount,
          level: levels[day.contributionLevel] ?? 0,
        })),
      ),
    };
  }

  type Public = {
    total: Record<string, number>;
    contributions: { date: string; count: number; level: number }[];
  };
  const json = await getJson<Public>(
    `https://github-contributions-api.jogruber.de/v4/${username}?y=last`,
  );
  return {
    total:
      json.total.lastYear ??
      json.contributions.reduce((sum, day) => sum + day.count, 0),
    days: json.contributions.map((day) => ({
      date: day.date,
      count: day.count,
      level: Math.min(4, Math.max(0, day.level)) as ContributionDay["level"],
    })),
  };
}

/** Xếp các ngày thành từng cột tuần, bắt đầu từ Chủ nhật như trên GitHub. */
function toWeeks(days: ContributionDay[]) {
  const sorted = [...days].sort((a, b) => a.date.localeCompare(b.date));
  const weeks: (ContributionDay | null)[][] = [];
  let week: (ContributionDay | null)[] = [];
  sorted.forEach((day, index) => {
    const weekday = new Date(`${day.date}T00:00:00Z`).getUTCDay();
    if (index === 0) week = Array.from({ length: weekday }, () => null);
    week.push(day);
    if (weekday === 6) {
      weeks.push(week);
      week = [];
    }
  });
  if (week.length)
    weeks.push([
      ...week,
      ...Array.from({ length: 7 - week.length }, () => null),
    ]);
  return weeks;
}

export async function getGitHubData(): Promise<GitHubData> {
  "use cache";
  cacheLife("hours");

  const username = profile.githubUsername;
  const [profileResult, contributionResult] = await Promise.allSettled([
    fetchProfile(username),
    fetchContributions(username),
  ]);

  const live = profileResult.status === "fulfilled";
  if (!live)
    console.warn("[github] dùng số liệu lưu sẵn:", profileResult.reason);
  const base = live ? profileResult.value : githubSnapshot;
  const own = base.repos.filter((repo) => !repo.fork);

  // Ngôn ngữ chính của từng repo, tính theo số repo
  const counts = new Map<string, number>();
  for (const repo of own)
    if (repo.language)
      counts.set(repo.language, (counts.get(repo.language) ?? 0) + 1);
  const withLanguage = [...counts.values()].reduce(
    (sum, count) => sum + count,
    0,
  );
  const languages = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, count]) => ({
      name,
      count,
      percent: Math.round((count / withLanguage) * 100),
    }));

  const contributions =
    contributionResult.status === "fulfilled" &&
    contributionResult.value.days.length > 0
      ? {
          total: contributionResult.value.total,
          weeks: toWeeks(contributionResult.value.days),
        }
      : null;
  if (contributionResult.status === "rejected")
    console.warn(
      "[github] không lấy được biểu đồ đóng góp:",
      contributionResult.reason,
    );

  return {
    username,
    profileUrl: `https://github.com/${username}`,
    publicRepos: base.publicRepos,
    followers: base.followers,
    stars: own.reduce((sum, repo) => sum + repo.stars, 0),
    sinceYear: new Date(base.createdAt).getUTCFullYear(),
    languages,
    languageCount: counts.size,
    recent: [...own]
      .sort((a, b) => b.pushedAt.localeCompare(a.pushedAt))
      .slice(0, 4),
    contributions,
    updatedAt: live ? new Date().toISOString() : githubSnapshot.updatedAt,
    live,
  };
}
