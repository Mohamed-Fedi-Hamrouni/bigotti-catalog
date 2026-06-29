"use client";

import { gql } from "@apollo/client";
import { useMutation, useQuery } from "@apollo/client/react";
import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";

const navigationItems = [
    { label: "Recherche", href: "/" },
    { label: "Ajouter un article", href: "/products/new" },
    { label: "Liste des articles", href: "/products" },
    { label: "Types d'articles", href: "/product-types" },
    { label: "Tags", href: "/tags" },
];

const GET_PRODUCT_TYPES = gql`
    query GetProductTypes {
        productTypes {
            id
            name
        }
    }
`;

const CREATE_PRODUCT_TYPE = gql`
    mutation CreateProductType($input: CreateProductTypeInput!) {
        createProductType(input: $input) {
            id
            name
        }
    }
`;

const UPDATE_PRODUCT_TYPE = gql`
    mutation UpdateProductType($input: UpdateProductTypeInput!) {
        updateProductType(input: $input) {
            id
            name
        }
    }
`;

const DELETE_PRODUCT_TYPE = gql`
    mutation DeleteProductType($id: ID!) {
        deleteProductType(id: $id)
    }
`;

type ProductType = {
    id: string;
    name: string;
};

type GetProductTypesData = {
    productTypes: ProductType[];
};

type CreateProductTypeData = {
    createProductType: ProductType;
};

type UpdateProductTypeData = {
    updateProductType: ProductType;
};

type DeleteProductTypeData = {
    deleteProductType: boolean;
};

export default function ProductTypesPage() {
    const [newTypeName, setNewTypeName] = useState("");
    const [editingTypeId, setEditingTypeId] = useState<string | null>(null);
    const [editingTypeName, setEditingTypeName] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const { data, loading, error, refetch } = useQuery<GetProductTypesData>(
        GET_PRODUCT_TYPES,
        {
            fetchPolicy: "network-only",
        },
    );

    const [createProductType, { loading: creatingType }] =
        useMutation<CreateProductTypeData>(CREATE_PRODUCT_TYPE);

    const [updateProductType, { loading: updatingType }] =
        useMutation<UpdateProductTypeData>(UPDATE_PRODUCT_TYPE);

    const [deleteProductType, { loading: deletingType }] =
        useMutation<DeleteProductTypeData>(DELETE_PRODUCT_TYPE);

    const productTypes = data?.productTypes ?? [];
    const isWorking = creatingType || updatingType || deletingType;

    async function handleCreateType(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const cleanName = newTypeName.trim();

        if (!cleanName) {
            setErrorMessage("Le nom du type est obligatoire.");
            return;
        }

        setErrorMessage("");
        setSuccessMessage("");

        try {
            const result = await createProductType({
                variables: {
                    input: {
                        name: cleanName,
                    },
                },
            });

            const createdType = result.data?.createProductType;

            if (!createdType) {
                throw new Error("Type non créé.");
            }

            setNewTypeName("");
            setSuccessMessage(`Type "${createdType.name}" créé avec succès.`);
            await refetch();
        } catch (creationError) {
            setErrorMessage(
                creationError instanceof Error
                    ? creationError.message
                    : "Erreur pendant la création du type.",
            );
        }
    }

    function startEditing(productType: ProductType) {
        setEditingTypeId(productType.id);
        setEditingTypeName(productType.name);
        setErrorMessage("");
        setSuccessMessage("");
    }

    function cancelEditing() {
        setEditingTypeId(null);
        setEditingTypeName("");
    }

    async function handleUpdateType(productTypeId: string) {
        const cleanName = editingTypeName.trim();

        if (!cleanName) {
            setErrorMessage("Le nom du type est obligatoire.");
            return;
        }

        setErrorMessage("");
        setSuccessMessage("");

        try {
            const result = await updateProductType({
                variables: {
                    input: {
                        id: productTypeId,
                        name: cleanName,
                    },
                },
            });

            const updatedType = result.data?.updateProductType;

            if (!updatedType) {
                throw new Error("Type non modifié.");
            }

            setEditingTypeId(null);
            setEditingTypeName("");
            setSuccessMessage(
                `Type "${updatedType.name}" modifié avec succès.`,
            );
            await refetch();
        } catch (updateError) {
            setErrorMessage(
                updateError instanceof Error
                    ? updateError.message
                    : "Erreur pendant la modification du type.",
            );
        }
    }

    async function handleDeleteType(productType: ProductType) {
        const confirmed = window.confirm(
            `Supprimer le type "${productType.name}" ? Cette action est impossible si le type est utilisé par des articles.`,
        );

        if (!confirmed) {
            return;
        }

        setErrorMessage("");
        setSuccessMessage("");

        try {
            await deleteProductType({
                variables: {
                    id: productType.id,
                },
            });

            setSuccessMessage(`Type "${productType.name}" supprimé.`);
            await refetch();
        } catch (deleteError) {
            setErrorMessage(
                deleteError instanceof Error
                    ? deleteError.message
                    : "Erreur pendant la suppression du type.",
            );
        }
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
                    {navigationItems.map((item) => {
                        const isActive = item.href === "/product-types";

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
                        Types d’articles
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                        Gérer les catégories principales des articles.
                    </p>
                </div>
            </aside>

            <section className="ml-72 min-h-screen flex-1 px-10 py-10">
                <div className="mx-auto w-full max-w-5xl">
                    <div className="flex items-start justify-between gap-6">
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
                                Catalogue
                            </p>
                            <h1 className="mt-3 text-4xl font-bold tracking-tight">
                                Types d’articles
                            </h1>
                            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
                                Créer, modifier ou supprimer les types utilisés
                                pour classer les articles Bigotti.
                            </p>
                        </div>

                        <Link
                            href="/products/new"
                            className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
                        >
                            Ajouter un article
                        </Link>
                    </div>

                    <div className="mt-8 grid gap-6 lg:grid-cols-[360px_1fr]">
                        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                            <h2 className="text-xl font-bold text-slate-950">
                                Nouveau type
                            </h2>

                            <form
                                onSubmit={handleCreateType}
                                className="mt-5 space-y-4"
                            >
                                <label className="block">
                                    <span className="text-sm font-semibold text-slate-700">
                                        Nom du type
                                    </span>
                                    <input
                                        value={newTypeName}
                                        onChange={(event) =>
                                            setNewTypeName(event.target.value)
                                        }
                                        type="text"
                                        placeholder="Exemple : Pantalon"
                                        className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-950"
                                    />
                                </label>

                                <button
                                    type="submit"
                                    disabled={creatingType}
                                    className="w-full rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                                >
                                    {creatingType
                                        ? "Création..."
                                        : "Créer le type"}
                                </button>
                            </form>

                            {successMessage && (
                                <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                                    {successMessage}
                                </div>
                            )}

                            {errorMessage && (
                                <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                                    {errorMessage}
                                </div>
                            )}
                        </div>

                        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-950">
                                        Liste des types
                                    </h2>
                                    <p className="mt-1 text-sm text-slate-500">
                                        {productTypes.length} type(s)
                                        enregistré(s)
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => refetch()}
                                    className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                                >
                                    Actualiser
                                </button>
                            </div>

                            <div className="mt-6">
                                {loading && (
                                    <div className="rounded-2xl bg-slate-50 p-5 text-center text-sm text-slate-500">
                                        Chargement des types...
                                    </div>
                                )}

                                {error && (
                                    <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
                                        Erreur pendant le chargement :{" "}
                                        {error.message}
                                    </div>
                                )}

                                {!loading &&
                                    !error &&
                                    productTypes.length === 0 && (
                                        <div className="rounded-2xl bg-slate-50 p-5 text-center text-sm text-slate-500">
                                            Aucun type enregistré.
                                        </div>
                                    )}

                                {!loading &&
                                    !error &&
                                    productTypes.length > 0 && (
                                        <div className="space-y-3">
                                            {productTypes.map((productType) => {
                                                const isEditing =
                                                    editingTypeId ===
                                                    productType.id;

                                                return (
                                                    <div
                                                        key={productType.id}
                                                        className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                                                    >
                                                        {!isEditing ? (
                                                            <div className="flex items-center justify-between gap-4">
                                                                <div>
                                                                    <p className="font-semibold text-slate-950">
                                                                        {
                                                                            productType.name
                                                                        }
                                                                    </p>
                                                                    <p className="mt-1 break-all text-xs text-slate-400">
                                                                        {
                                                                            productType.id
                                                                        }
                                                                    </p>
                                                                </div>

                                                                <div className="flex shrink-0 gap-2">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            startEditing(
                                                                                productType,
                                                                            )
                                                                        }
                                                                        className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                                                                    >
                                                                        Modifier
                                                                    </button>

                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            handleDeleteType(
                                                                                productType,
                                                                            )
                                                                        }
                                                                        disabled={
                                                                            isWorking
                                                                        }
                                                                        className="rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:text-slate-300"
                                                                    >
                                                                        Supprimer
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="flex gap-3">
                                                                <input
                                                                    value={
                                                                        editingTypeName
                                                                    }
                                                                    onChange={(
                                                                        event,
                                                                    ) =>
                                                                        setEditingTypeName(
                                                                            event
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    type="text"
                                                                    className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-slate-950"
                                                                />

                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        handleUpdateType(
                                                                            productType.id,
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        updatingType
                                                                    }
                                                                    className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                                                                >
                                                                    Enregistrer
                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    onClick={
                                                                        cancelEditing
                                                                    }
                                                                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                                                                >
                                                                    Annuler
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
