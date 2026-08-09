"use client";

import { dashboardStats } from "./DashboardData";

import {
    FiFolder,
    FiGithub,
    FiGitPullRequest,
    FiTrendingDown,
    FiCpu,
    FiAward,
} from "react-icons/fi";

const icons = [
    FiFolder,
    FiGithub,
    FiGitPullRequest,
    FiTrendingDown,
    FiCpu,
    FiAward,
];

export default function DashboardCards() {
    return (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {dashboardStats.map((item, index) => {
                const Icon = icons[index];

                return (
                    <div
                        key={item.title}
                        className="rounded-2xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                    >
                        <div className="flex items-center justify-between">

                            <div>

                                <p className="text-sm text-gray-500">
                                    {item.title}
                                </p>

                                <h2 className="mt-2 text-3xl font-bold text-gray-800">
                                    {item.value}
                                </h2>

                                <p className="mt-2 text-sm text-green-600">
                                    {item.change}
                                </p>

                            </div>

                            <div className="rounded-xl bg-indigo-100 p-4">

                                <Icon
                                    size={28}
                                    className="text-[#4338CA]"
                                />

                            </div>

                        </div>
                    </div>
                );
            })}
        </div>
    );
}