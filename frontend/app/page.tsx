"use client";

import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import Image from "next/image";
import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { AppSidebar } from "../components/AppSidebar";

const GET_SEARCH_DATA = gql`
    query GetSearchData {
        products {
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

        productTypes {
            id
            name
        }

        tags {
            id
            name
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

type SearchData = {
    products: Product[];
    productTypes: ProductType[];
    tags: ProductTag[];
};

export default function Home() {
    const [searchValue, setSearchValue] = useState("");
    const [selectedTypeId, setSelectedTypeId] = useState("");
    const [selectedTagId, setSelectedTagId] = useState("");
    const [selectedColor, setSelectedColor] = useState("");
    const [selectedSize, setSelectedSize] = useState("");
    const [hasSearched, setHasSearched] = useState(false);

    const { data, loading, error, refetch } = useQuery<SearchData>(
        GET_SEARCH_DATA,
        {
            fetchPolicy: "network-only",
        },
    );

    const products = data?.products ?? [];
    const productTypes = data?.productTypes ?? [];
    const tags = data?.tags ?? [];

    const colorOptions = useMemo(() => {
        const colors = new Set<string>();

        products.forEach((product) => {
            product.variants.forEach((variant) => {
                const cleanColor = variant.color.trim();

                if (cleanColor) {
                    colors.add(cleanColor);
                }
            });
        });

        return Array.from(colors).sort((firstColor, secondColor) =>
            firstColor.localeCompare(secondColor),
        );
    }, [products]);

    const sizeOptions = useMemo(() => {
        const sizes = new Set<string>();

        products.forEach((product) => {
            product.variants.forEach((variant) => {
                const cleanSize = variant.size.trim();

                if (cleanSize) {
                    sizes.add(cleanSize);
                }
            });
        });

        return Array.from(sizes).sort((firstSize, secondSize) =>
            firstSize.localeCompare(secondSize),
        );
    }, [products]);

    const hasActiveFilters =
        Boolean(searchValue.trim()) ||
        Boolean(selectedTypeId) ||
        Boolean(selectedTagId) ||
        Boolean(selectedColor) ||
        Boolean(selectedSize);

    const filteredProducts = useMemo(() => {
        const keyword = searchValue.trim().toLowerCase();

        return products.filter((product) => {
            const matchesKeyword =
                !keyword ||
                product.ref.toLowerCase().includes(keyword) ||
                product.name.toLowerCase().includes(keyword) ||
                product.type.name.toLowerCase().includes(keyword) ||
                product.tags.some((tag) =>
                    tag.name.toLowerCase().includes(keyword),
                ) ||
                product.variants.some(
                    (variant) =>
                        variant.color.toLowerCase().includes(keyword) ||
                        variant.size.toLowerCase().includes(keyword),
                );

            const matchesType =
                !selectedTypeId || product.type.id === selectedTypeId;

            const matchesTag =
                !selectedTagId ||
                product.tags.some((tag) => tag.id === selectedTagId);

            const matchesColor =
                !selectedColor ||
                product.variants.some(
                    (variant) =>
                        variant.color.toLowerCase() ===
                        selectedColor.toLowerCase(),
                );

            const matchesSize =
                !selectedSize ||
                product.variants.some(
                    (variant) =>
                        variant.size.toLowerCase() ===
                        selectedSize.toLowerCase(),
                );

            return (
                matchesKeyword &&
                matchesType &&
                matchesTag &&
                matchesColor &&
                matchesSize
            );
        });
    }, [
        products,
        searchValue,
        selectedTypeId,
        selectedTagId,
        selectedColor,
        selectedSize,
    ]);

    function handleSearch(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setHasSearched(true);
    }

    function handleResetFilters() {
        setSearchValue("");
        setSelectedTypeId("");
        setSelectedTagId("");
        setSelectedColor("");
        setSelectedSize("");
        setHasSearched(false);
    }

    const shouldShowResults = hasSearched || hasActiveFilters;

    return (
        <main className="flex min-h-screen bg-slate-100 text-slate-950">
            <AppSidebar
                activeHref="/"
                title="Aide vente en ligne"
                description="Rechercher rapidement un article par référence, nom, type, tag, couleur ou taille."
            />

            <section className="ml-72 min-h-screen flex-1 px-10 py-12">
                <div className="mx-auto w-full max-w-6xl">
                    <div className="text-center">
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

                        <h1 className="text-4xl font-bold tracking-tight text-slate-950">
                            Trouver rapidement un article
                        </h1>

                        <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600">
                            Utilise la recherche et les filtres pour retrouver
                            rapidement un article dans le catalogue Bigotti.
                        </p>
                    </div>

                    <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                        <form onSubmit={handleSearch} className="space-y-5">
                            <div className="flex rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-200">
                                <input
                                    value={searchValue}
                                    onChange={(event) => {
                                        setSearchValue(event.target.value);
                                        setHasSearched(true);
                                    }}
                                    type="text"
                                    placeholder="Exemple : CH-001, chemise, coton, noir, M..."
                                    className="min-h-14 flex-1 rounded-xl border-0 bg-transparent px-5 text-lg outline-none placeholder:text-slate-400"
                                />

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="rounded-xl bg-slate-950 px-8 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                                >
                                    {loading ? "Chargement..." : "Rechercher"}
                                </button>
                            </div>

                            <div className="grid gap-4 md:grid-cols-4">
                                <label className="block text-left">
                                    <span className="text-sm font-semibold text-slate-700">
                                        Type
                                    </span>
                                    <select
                                        value={selectedTypeId}
                                        onChange={(event) => {
                                            setSelectedTypeId(
                                                event.target.value,
                                            );
                                            setHasSearched(true);
                                        }}
                                        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-950"
                                    >
                                        <option value="">Tous les types</option>
                                        {productTypes.map((productType) => (
                                            <option
                                                key={productType.id}
                                                value={productType.id}
                                            >
                                                {productType.name}
                                            </option>
                                        ))}
                                    </select>
                                </label>

                                <label className="block text-left">
                                    <span className="text-sm font-semibold text-slate-700">
                                        Tag
                                    </span>
                                    <select
                                        value={selectedTagId}
                                        onChange={(event) => {
                                            setSelectedTagId(
                                                event.target.value,
                                            );
                                            setHasSearched(true);
                                        }}
                                        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-950"
                                    >
                                        <option value="">Tous les tags</option>
                                        {tags.map((tag) => (
                                            <option key={tag.id} value={tag.id}>
                                                {tag.name}
                                            </option>
                                        ))}
                                    </select>
                                </label>

                                <label className="block text-left">
                                    <span className="text-sm font-semibold text-slate-700">
                                        Couleur
                                    </span>
                                    <select
                                        value={selectedColor}
                                        onChange={(event) => {
                                            setSelectedColor(
                                                event.target.value,
                                            );
                                            setHasSearched(true);
                                        }}
                                        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-950"
                                    >
                                        <option value="">
                                            Toutes les couleurs
                                        </option>
                                        {colorOptions.map((color) => (
                                            <option key={color} value={color}>
                                                {color}
                                            </option>
                                        ))}
                                    </select>
                                </label>

                                <label className="block text-left">
                                    <span className="text-sm font-semibold text-slate-700">
                                        Taille
                                    </span>
                                    <select
                                        value={selectedSize}
                                        onChange={(event) => {
                                            setSelectedSize(event.target.value);
                                            setHasSearched(true);
                                        }}
                                        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-950"
                                    >
                                        <option value="">
                                            Toutes les tailles
                                        </option>
                                        {sizeOptions.map((size) => (
                                            <option key={size} value={size}>
                                                {size}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                            </div>

                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <p className="text-sm text-slate-500">
                                    {shouldShowResults
                                        ? `${filteredProducts.length} résultat(s) trouvé(s)`
                                        : `${products.length} article(s) disponible(s) dans le catalogue`}
                                </p>

                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => refetch()}
                                        className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                                    >
                                        Actualiser
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleResetFilters}
                                        disabled={
                                            !hasActiveFilters && !hasSearched
                                        }
                                        className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300"
                                    >
                                        Réinitialiser
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>

                    <div className="mt-8">
                        {loading && (
                            <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
                                Chargement des articles...
                            </div>
                        )}

                        {error && (
                            <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
                                Erreur pendant le chargement : {error.message}
                            </div>
                        )}

                        {!loading && !error && !shouldShowResults && (
                            <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
                                <h2 className="text-xl font-bold text-slate-950">
                                    Commence une recherche
                                </h2>
                                <p className="mt-2 text-sm text-slate-500">
                                    Saisis un mot-clé ou choisis un filtre pour
                                    afficher les articles correspondants.
                                </p>
                            </div>
                        )}

                        {!loading &&
                            !error &&
                            shouldShowResults &&
                            filteredProducts.length === 0 && (
                                <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
                                    <h2 className="text-xl font-bold text-slate-950">
                                        Aucun article trouvé
                                    </h2>
                                    <p className="mt-2 text-sm text-slate-500">
                                        Essaie de modifier le mot-clé ou de
                                        réinitialiser les filtres.
                                    </p>
                                </div>
                            )}

                        {!loading &&
                            !error &&
                            shouldShowResults &&
                            filteredProducts.length > 0 && (
                                <div className="grid gap-5">
                                    {filteredProducts.map((product) => {
                                        const mainImage =
                                            product.images.find(
                                                (image) => image.isMain,
                                            ) ?? product.images[0];

                                        return (
                                            <article
                                                key={product.id}
                                                className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                                            >
                                                <div className="flex gap-5">
                                                    <div className="h-36 w-36 shrink-0 overflow-hidden rounded-2xl bg-slate-100">
                                                        {mainImage ? (
                                                            <img
                                                                src={
                                                                    mainImage.url
                                                                }
                                                                alt={
                                                                    product.name
                                                                }
                                                                className="h-full w-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                                                                Pas d’image
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="flex min-w-0 flex-1 flex-col justify-between text-left">
                                                        <div>
                                                            <div className="flex items-start justify-between gap-4">
                                                                <div className="min-w-0">
                                                                    <p className="text-sm font-semibold text-slate-500">
                                                                        {
                                                                            product.ref
                                                                        }
                                                                    </p>
                                                                    <h3 className="mt-1 truncate text-xl font-bold text-slate-950">
                                                                        {
                                                                            product.name
                                                                        }
                                                                    </h3>
                                                                </div>

                                                                <span className="shrink-0 rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
                                                                    {
                                                                        product
                                                                            .type
                                                                            .name
                                                                    }
                                                                </span>
                                                            </div>

                                                            <div className="mt-4 flex flex-wrap gap-2">
                                                                {product.tags
                                                                    .length >
                                                                0 ? (
                                                                    product.tags.map(
                                                                        (
                                                                            tag,
                                                                        ) => (
                                                                            <span
                                                                                key={
                                                                                    tag.id
                                                                                }
                                                                                className="rounded-full bg-slate-950 px-3 py-1 text-xs font-medium text-white"
                                                                            >
                                                                                {
                                                                                    tag.name
                                                                                }
                                                                            </span>
                                                                        ),
                                                                    )
                                                                ) : (
                                                                    <span className="text-xs text-slate-400">
                                                                        Aucun
                                                                        tag
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className="mt-5 grid gap-2">
                                                            {product.variants
                                                                .length > 0 ? (
                                                                product.variants.map(
                                                                    (
                                                                        variant,
                                                                    ) => (
                                                                        <div
                                                                            key={
                                                                                variant.id
                                                                            }
                                                                            className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm"
                                                                        >
                                                                            <span className="font-medium text-slate-700">
                                                                                {
                                                                                    variant.color
                                                                                }{" "}
                                                                                ·
                                                                                Taille{" "}
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
                                                                )
                                                            ) : (
                                                                <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-400">
                                                                    Aucune
                                                                    variante
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="mt-5 flex justify-end gap-3">
                                                    <Link
                                                        href={`/products/${product.id}`}
                                                        className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                                                    >
                                                        Voir détails
                                                    </Link>

                                                    <Link
                                                        href={`/products/${product.id}/edit`}
                                                        className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                                                    >
                                                        Modifier
                                                    </Link>
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
