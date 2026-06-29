"use client";

import Image from "next/image";
import Link from "next/link";

const navigationItems = [
    { label: "Recherche", href: "/" },
    { label: "Ajouter un article", href: "/products/new" },
    { label: "Liste des articles", href: "/products" },
    { label: "Types d'articles", href: "/product-types" },
    { label: "Tags", href: "/tags" },
];

type AppSidebarProps = {
    activeHref: string;
    title: string;
    description: string;
};

export function AppSidebar({
    activeHref,
    title,
    description,
}: AppSidebarProps) {
    return (
        <aside className="fixed left-0 top-0 flex h-screen w-72 flex-col border-r border-slate-200 bg-white px-6 py-8 shadow-sm">
            <div className="mb-10">
                <Image
                    src="/bigotti-logo.jpg"
                    alt="Logo Bigotti"
                    width={180}
                    height={80}
                    className="h-auto w-44 object-contain"
                    priority
                />

                <p className="mt-3 text-sm text-slate-500">Catalogue interne</p>
            </div>

            <nav className="flex flex-col gap-2">
                {navigationItems.map((item) => {
                    const isActive = item.href === activeHref;

                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={`rounded-xl px-4 py-3 text-sm font-medium transition ${
                                isActive
                                    ? "bg-slate-950 text-white"
                                    : "text-slate-700 hover:bg-slate-100 hover:text-slate-950"
                            }`}
                        >
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            <div className="mt-auto rounded-2xl bg-slate-100 p-4">
                <p className="text-sm font-semibold text-slate-800">{title}</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                    {description}
                </p>
            </div>
        </aside>
    );
}
