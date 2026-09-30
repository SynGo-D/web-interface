"use client";

import {
    FiFolder,
    FiGithub,
    FiGitPullRequest,
    FiTrendingDown,
    FiCpu,
    FiAward,
} from "react-icons/fi";

type DashboardData = {
    summary: {
        bugs: number;
        vulnerabilities: number;
        codeSmells: number;
        coverage: number;
    };
    technicalDebt: {
        hours: number;
        rating: string;
        debtRatio: number;
    };
    complexity: {
        complexity: number;
        cognitiveComplexity: number;
    };
    duplication: {
        percentage: number;
    };
};

type DashboardCardsProps = {
    data: DashboardData;
};

export default function DashboardCards({
    data,
}: DashboardCardsProps) {

    const cards = [
        {
            title: "Bugs",
            value: data.summary.bugs,
            change: "SonarQube detected bugs",
            icon: FiFolder,
        },
        {
            title: "Vulnerabilities",
            value: data.summary.vulnerabilities,
            change: "Security vulnerabilities",
            icon: FiGithub,
        },
        {
            title: "Code Smells",
            value: data.summary.codeSmells,
            change: "Maintainability issues",
            icon: FiGitPullRequest,
        },
        {
            title: "Coverage",
            value: `${data.summary.coverage}%`,
            change: "Code coverage",
            icon: FiTrendingDown,
        },
        {
            title: "Technical Debt",
            value: `${data.technicalDebt.hours}h`,
            change: `Rating: ${data.technicalDebt.rating}`,
            icon: FiCpu,
        },
        {
            title: "Complexity",
            value: data.complexity.complexity,
            change: `Cognitive: ${data.complexity.cognitiveComplexity}`,
            icon: FiAward,
        },
    ];

    return (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {cards.map((item) => {
                const Icon = item.icon;

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