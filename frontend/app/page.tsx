"use client";

import { gql } from "@apollo/client";
import { useLazyQuery } from "@apollo/client/react";
import Image from "next/image";
import { FormEvent, useState } from "react";

const navigationItems = [
    { label: "Recherche", href: "/" },
    { label: "Ajouter un article", href: "/products/new" },
    { label: "Liste des articles", href: "/products" },
    { label: "Types d'articles", href: "/product-types" },
    { label: "Tags", href: "/tags" },
];

const SEARCH_PRODUCTS = gql`
    query SearchProducts($keyword: String!) {
        searchProducts(keyword: $keyword) {
            id
            ref
            name
            type {
                id
                name
            }
            tags {
                id
                name
            }
            variants {
                id
                color
                size
                price
            }
            images {
                id
                url
                storagePath
                isMain
                position
            }
        }
    }
`;

type ProductImage = {
    id: string;
    url: string;
    storagePath: string;
    isMain: boolean;
    position: number;
};

type ProductVariant = {
    id: string;
    color: string;
    size: string;
    price: number;
};

type ProductTag = {
    id: string;
    name: string;
};

type ProductType = {
    id: string;
    name: string;
};

type Product = {
    id: string;
    ref: string;
    name: string;
    type: ProductType;
    tags: ProductTag[];
    variants: ProductVariant[];
    images: ProductImage[];
};

type SearchProductsData = {
    searchProducts: Product[];
};

type SearchProductsVariables = {
    keyword: string;
};

export default function Home() {
    const [searchValue, setSearchValue] = useState("");

    const [searchProducts, { data, loading, error, called }] = useLazyQuery<
        SearchProductsData,
        SearchProductsVariables
    >(SEARCH_PRODUCTS, {
        fetchPolicy: "network-only",
    });

    const products = data?.searchProducts ?? [];

    function handleSearch(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const keyword = searchValue.trim();

        if (!keyword) {
            return;
        }

        searchProducts({
            variables: {
                keyword,
            },
        });
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

            <section className="ml-72 min-h-screen flex-1 px-10 py-12">
                <div className="mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-5xl flex-col items-center justify-center">
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
                            Entrez une référence ou le nom d’un article pour
                            aider le vendeur à retrouver rapidement le bon
                            produit.
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
                                    disabled={loading}
                                    className="rounded-xl bg-slate-950 px-8 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                                >
                                    {loading ? "Recherche..." : "Rechercher"}
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

                    <div className="mt-12 w-full">
                        {error && (
                            <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
                                Erreur pendant la recherche : {error.message}
                            </div>
                        )}

                        {called &&
                            !loading &&
                            !error &&
                            products.length === 0 && (
                                <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500 shadow-sm">
                                    Aucun article trouvé.
                                </div>
                            )}

                        {products.length > 0 && (
                            <div className="grid gap-5">
                                {products.map((product) => {
                                    const mainImage =
                                        product.images.find(
                                            (image) => image.isMain,
                                        ) ?? product.images[0];

                                    return (
                                        <article
                                            key={product.id}
                                            className="flex gap-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
                                        >
                                            <div className="h-36 w-36 shrink-0 overflow-hidden rounded-2xl bg-slate-100">
                                                {mainImage ? (
                                                    <img
                                                        src={mainImage.url}
                                                        alt={product.name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                                                        Pas d’image
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex flex-1 flex-col justify-between text-left">
                                                <div>
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div>
                                                            <p className="text-sm font-semibold text-slate-500">
                                                                {product.ref}
                                                            </p>
                                                            <h3 className="mt-1 text-xl font-bold text-slate-950">
                                                                {product.name}
                                                            </h3>
                                                        </div>

                                                        <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
                                                            {product.type.name}
                                                        </span>
                                                    </div>

                                                    <div className="mt-4 flex flex-wrap gap-2">
                                                        {product.tags.map(
                                                            (tag) => (
                                                                <span
                                                                    key={tag.id}
                                                                    className="rounded-full bg-slate-950 px-3 py-1 text-xs font-medium text-white"
                                                                >
                                                                    {tag.name}
                                                                </span>
                                                            ),
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="mt-5 grid gap-2">
                                                    {product.variants.map(
                                                        (variant) => (
                                                            <div
                                                                key={variant.id}
                                                                className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm"
                                                            >
                                                                <span className="font-medium text-slate-700">
                                                                    Couleur :{" "}
                                                                    {
                                                                        variant.color
                                                                    }{" "}
                                                                    | Taille :{" "}
                                                                    {
                                                                        variant.size
                                                                    }
                                                                </span>
                                                                <span className="font-bold text-slate-950">
                                                                    {
                                                                        variant.price
                                                                    }{" "}
                                                                    TND
                                                                </span>
                                                            </div>
                                                        ),
                                                    )}
                                                </div>
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </main>
    );
}
