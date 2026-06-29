"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";

const navigationItems = [
    { label: "Recherche", href: "/" },
    { label: "Ajouter un article", href: "/products/new" },
    { label: "Liste des articles", href: "/products" },
    { label: "Types d'articles", href: "/product-types" },
    { label: "Tags", href: "/tags" },
];

export default function Home() {
    const [searchValue, setSearchValue] = useState("");

    function handleSearch(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!searchValue.trim()) {
            return;
        }

        console.log("Recherche article:", searchValue.trim());
    }

    return (
        <main className="flex min-h-screen bg-slate-100 text-slate-950">
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

                    <p className="mt-3 text-sm text-slate-500">
                        Catalogue interne
                    </p>
                </div>

                <nav className="flex flex-col gap-2">
                    {navigationItems.map((item) => (
                        <a
                            key={item.label}
                            href={item.href}
                            className="rounded-xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
                        >
                            {item.label}
                        </a>
                    ))}
                </nav>

                <div className="mt-auto rounded-2xl bg-slate-100 p-4">
                    <p className="text-sm font-semibold text-slate-800">
                        Aide vente en ligne
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                        Rechercher rapidement un article par référence, nom,
                        type ou tag.
                    </p>
                </div>
            </aside>

            <section className="ml-72 flex min-h-screen flex-1 items-center justify-center px-10">
                <div className="w-full max-w-3xl text-center">
                    <div className="mb-8 flex justify-center">
                        <Image
                            src="/bigotti-logo.jpg"
                            alt="Logo Bigotti"
                            width={320}
                            height={140}
                            className="h-auto w-72 object-contain"
                            priority
                        />
                    </div>

                    <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
                        Recherche catalogue
                    </p>

                    <h2 className="text-4xl font-bold tracking-tight text-slate-950">
                        Trouver rapidement un article
                    </h2>

                    <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600">
                        Entrez une référence ou le nom d’un article pour aider
                        le vendeur à retrouver rapidement le bon produit.
                    </p>

                    <form onSubmit={handleSearch} className="mt-10">
                        <div className="flex rounded-2xl bg-white p-3 shadow-lg ring-1 ring-slate-200">
                            <input
                                value={searchValue}
                                onChange={(event) =>
                                    setSearchValue(event.target.value)
                                }
                                type="text"
                                placeholder="Exemple : CH-001 ou Chemise col mao blanche"
                                className="min-h-14 flex-1 rounded-xl border-0 bg-transparent px-5 text-lg outline-none placeholder:text-slate-400"
                            />

                            <button
                                type="submit"
                                className="rounded-xl bg-slate-950 px-8 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                            >
                                Rechercher
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 flex flex-wrap justify-center gap-3 text-sm text-slate-500">
                        <span className="rounded-full bg-white px-4 py-2 shadow-sm">
                            Référence
                        </span>
                        <span className="rounded-full bg-white px-4 py-2 shadow-sm">
                            Nom article
                        </span>
                        <span className="rounded-full bg-white px-4 py-2 shadow-sm">
                            Type
                        </span>
                        <span className="rounded-full bg-white px-4 py-2 shadow-sm">
                            Tag
                        </span>
                        <span className="rounded-full bg-white px-4 py-2 shadow-sm">
                            Couleur
                        </span>
                    </div>
                </div>
            </section>
        </main>
    );
}
