"use client";

import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";

const GET_PRODUCT = gql`
    query GetProduct($id: ID!) {
        product(id: $id) {
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
            createdAt
            updatedAt
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
    createdAt: string;
    updatedAt: string;
};

type GetProductData = {
    product: Product;
};

type GetProductVariables = {
    id: string;
};

const navigationItems = [
    { label: "Recherche", href: "/" },
    { label: "Ajouter un article", href: "/products/new" },
    { label: "Liste des articles", href: "/products" },
    { label: "Types d'articles", href: "/product-types" },
    { label: "Tags", href: "/tags" },
];

export default function ProductDetailsPage() {
    const params = useParams<{ id: string }>();
    const productId = params.id;

    const { data, loading, error } = useQuery<
        GetProductData,
        GetProductVariables
    >(GET_PRODUCT, {
        variables: {
            id: productId,
        },
        skip: !productId,
        fetchPolicy: "network-only",
    });

    const product = data?.product;
    const mainImage =
        product?.images.find((image) => image.isMain) ?? product?.images[0];

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
                    {navigationItems.map((item) => {
                        const isActive = item.href === "/products";

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
                    <p className="text-sm font-semibold text-slate-800">
                        Détails article
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                        Consulter les informations complètes d’un article.
                    </p>
                </div>
            </aside>

            <section className="ml-72 min-h-screen flex-1 px-10 py-10">
                <div className="mx-auto w-full max-w-6xl">
                    <div className="mb-8 flex items-center justify-between gap-4">
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
                                Catalogue
                            </p>
                            <h1 className="mt-3 text-4xl font-bold tracking-tight">
                                Détails article
                            </h1>
                        </div>

                        <div className="flex gap-3">
                            <Link
                                href={`/products/${productId}/edit`}
                                className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
                            >
                                Modifier
                            </Link>

                            <Link
                                href="/products"
                                className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                            >
                                Retour à la liste
                            </Link>
                        </div>
                    </div>

                    {loading && (
                        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
                            Chargement de l’article...
                        </div>
                    )}

                    {error && (
                        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
                            Erreur pendant le chargement : {error.message}
                        </div>
                    )}

                    {!loading && !error && !product && (
                        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
                            <h2 className="text-xl font-bold text-slate-950">
                                Article introuvable
                            </h2>
                            <p className="mt-2 text-sm text-slate-500">
                                Cet article n’existe pas ou a été supprimé.
                            </p>
                        </div>
                    )}

                    {product && (
                        <div className="grid gap-8 lg:grid-cols-[420px_1fr]">
                            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                                <div className="aspect-square overflow-hidden rounded-2xl bg-slate-100">
                                    {mainImage ? (
                                        <img
                                            src={mainImage.url}
                                            alt={product.name}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center text-sm text-slate-400">
                                            Pas d’image
                                        </div>
                                    )}
                                </div>

                                {product.images.length > 1 && (
                                    <div className="mt-4 grid grid-cols-4 gap-3">
                                        {product.images.map((image) => (
                                            <div
                                                key={image.id}
                                                className="aspect-square overflow-hidden rounded-xl bg-slate-100"
                                            >
                                                <img
                                                    src={image.url}
                                                    alt={product.name}
                                                    className="h-full w-full object-cover"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-6">
                                <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <p className="text-sm font-semibold text-slate-500">
                                                {product.ref}
                                            </p>
                                            <h2 className="mt-2 text-3xl font-bold text-slate-950">
                                                {product.name}
                                            </h2>
                                        </div>

                                        <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
                                            {product.type.name}
                                        </span>
                                    </div>

                                    <div className="mt-6 flex flex-wrap gap-2">
                                        {product.tags.length > 0 ? (
                                            product.tags.map((tag) => (
                                                <span
                                                    key={tag.id}
                                                    className="rounded-full bg-slate-950 px-3 py-1 text-xs font-medium text-white"
                                                >
                                                    {tag.name}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-sm text-slate-400">
                                                Aucun tag
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                                    <h3 className="text-xl font-bold text-slate-950">
                                        Variantes
                                    </h3>

                                    <div className="mt-5 grid gap-3">
                                        {product.variants.length > 0 ? (
                                            product.variants.map((variant) => (
                                                <div
                                                    key={variant.id}
                                                    className="grid grid-cols-3 items-center rounded-2xl bg-slate-50 px-5 py-4 text-sm"
                                                >
                                                    <div>
                                                        <p className="text-xs font-semibold uppercase text-slate-400">
                                                            Couleur
                                                        </p>
                                                        <p className="mt-1 font-semibold text-slate-800">
                                                            {variant.color}
                                                        </p>
                                                    </div>

                                                    <div>
                                                        <p className="text-xs font-semibold uppercase text-slate-400">
                                                            Taille
                                                        </p>
                                                        <p className="mt-1 font-semibold text-slate-800">
                                                            {variant.size}
                                                        </p>
                                                    </div>

                                                    <div className="text-right">
                                                        <p className="text-xs font-semibold uppercase text-slate-400">
                                                            Prix
                                                        </p>
                                                        <p className="mt-1 text-lg font-bold text-slate-950">
                                                            {variant.price} TND
                                                        </p>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="rounded-2xl bg-slate-50 px-5 py-4 text-sm text-slate-400">
                                                Aucune variante
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                                    <h3 className="text-xl font-bold text-slate-950">
                                        Informations techniques
                                    </h3>

                                    <div className="mt-5 grid gap-4 text-sm text-slate-600 md:grid-cols-2">
                                        <div className="rounded-2xl bg-slate-50 p-4">
                                            <p className="font-semibold text-slate-950">
                                                ID article
                                            </p>
                                            <p className="mt-1 break-all">
                                                {product.id}
                                            </p>
                                        </div>

                                        <div className="rounded-2xl bg-slate-50 p-4">
                                            <p className="font-semibold text-slate-950">
                                                Nombre d’images
                                            </p>
                                            <p className="mt-1">
                                                {product.images.length}
                                            </p>
                                        </div>

                                        <div className="rounded-2xl bg-slate-50 p-4">
                                            <p className="font-semibold text-slate-950">
                                                Créé le
                                            </p>
                                            <p className="mt-1">
                                                {new Date(
                                                    product.createdAt,
                                                ).toLocaleString("fr-FR")}
                                            </p>
                                        </div>

                                        <div className="rounded-2xl bg-slate-50 p-4">
                                            <p className="font-semibold text-slate-950">
                                                Dernière mise à jour
                                            </p>
                                            <p className="mt-1">
                                                {new Date(
                                                    product.updatedAt,
                                                ).toLocaleString("fr-FR")}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
}
