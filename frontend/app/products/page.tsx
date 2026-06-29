"use client";

import { gql } from "@apollo/client";
import { useMutation, useQuery } from "@apollo/client/react";
import Link from "next/link";
import { useState } from "react";
import { AppSidebar } from "../../components/AppSidebar";

const GET_PRODUCTS = gql`
    query GetProducts {
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
    }
`;

const DELETE_PRODUCT = gql`
    mutation DeleteProduct($id: ID!) {
        deleteProduct(id: $id)
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

type GetProductsData = {
    products: Product[];
};

type DeleteProductData = {
    deleteProduct: boolean;
};

type DeleteProductVariables = {
    id: string;
};

export default function ProductsPage() {
    const [deletingProductId, setDeletingProductId] = useState<string | null>(
        null,
    );
    const [successMessage, setSuccessMessage] = useState("");
    const [deleteErrorMessage, setDeleteErrorMessage] = useState("");

    const { data, loading, error, refetch } = useQuery<GetProductsData>(
        GET_PRODUCTS,
        {
            fetchPolicy: "network-only",
        },
    );

    const [deleteProduct] = useMutation<
        DeleteProductData,
        DeleteProductVariables
    >(DELETE_PRODUCT);

    const products = data?.products ?? [];

    async function handleDeleteProduct(product: Product) {
        const confirmed = window.confirm(
            `Supprimer définitivement l’article "${product.name}" ?`,
        );

        if (!confirmed) {
            return;
        }

        setDeletingProductId(product.id);
        setSuccessMessage("");
        setDeleteErrorMessage("");

        try {
            const result = await deleteProduct({
                variables: {
                    id: product.id,
                },
            });

            if (!result.data?.deleteProduct) {
                throw new Error("Article non supprimé.");
            }

            setSuccessMessage(
                `Article "${product.name}" supprimé avec succès.`,
            );
            await refetch();
        } catch (deleteError) {
            setDeleteErrorMessage(
                deleteError instanceof Error
                    ? deleteError.message
                    : "Erreur pendant la suppression de l’article.",
            );
        } finally {
            setDeletingProductId(null);
        }
    }

    return (
        <main className="flex min-h-screen bg-slate-100 text-slate-950">
            <AppSidebar
                activeHref="/products"
                title="Liste complète"
                description="Consulter tous les articles enregistrés dans le catalogue Bigotti."
            />

            <section className="ml-72 min-h-screen flex-1 px-10 py-10">
                <div className="mx-auto w-full max-w-7xl">
                    <div className="flex items-start justify-between gap-6">
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
                                Catalogue
                            </p>
                            <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950">
                                Liste des articles
                            </h1>
                            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
                                Vue globale des articles avec leurs références,
                                images, types, tags, couleurs, tailles et prix.
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => refetch()}
                                className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                            >
                                Actualiser
                            </button>

                            <Link
                                href="/products/new"
                                className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
                            >
                                Ajouter un article
                            </Link>
                        </div>
                    </div>

                    {successMessage && (
                        <div className="mt-8 rounded-3xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-700">
                            {successMessage}
                        </div>
                    )}

                    {deleteErrorMessage && (
                        <div className="mt-8 rounded-3xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
                            {deleteErrorMessage}
                        </div>
                    )}

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

                        {!loading && !error && products.length === 0 && (
                            <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
                                <h2 className="text-xl font-bold text-slate-950">
                                    Aucun article trouvé
                                </h2>
                                <p className="mt-2 text-sm text-slate-500">
                                    Commence par ajouter un premier article dans
                                    le catalogue.
                                </p>
                            </div>
                        )}

                        {!loading && !error && products.length > 0 && (
                            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                                {products.map((product) => {
                                    const mainImage =
                                        product.images.find(
                                            (image) => image.isMain,
                                        ) ?? product.images[0];

                                    const isDeleting =
                                        deletingProductId === product.id;

                                    return (
                                        <article
                                            key={product.id}
                                            className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                                        >
                                            <div className="flex gap-5">
                                                <div className="h-40 w-40 shrink-0 overflow-hidden rounded-2xl bg-slate-100">
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

                                                <div className="flex min-w-0 flex-1 flex-col">
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-semibold text-slate-500">
                                                                {product.ref}
                                                            </p>
                                                            <h2 className="mt-1 truncate text-xl font-bold text-slate-950">
                                                                {product.name}
                                                            </h2>
                                                        </div>

                                                        <span className="shrink-0 rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
                                                            {product.type.name}
                                                        </span>
                                                    </div>

                                                    <div className="mt-4 flex flex-wrap gap-2">
                                                        {product.tags.length >
                                                        0 ? (
                                                            product.tags.map(
                                                                (tag) => (
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
                                                                Aucun tag
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="mt-5 grid gap-2">
                                                        {product.variants
                                                            .length > 0 ? (
                                                            product.variants.map(
                                                                (variant) => (
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
                                                                Aucune variante
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

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleDeleteProduct(
                                                            product,
                                                        )
                                                    }
                                                    disabled={isDeleting}
                                                    className="rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:text-slate-300"
                                                >
                                                    {isDeleting
                                                        ? "Suppression..."
                                                        : "Supprimer"}
                                                </button>
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
