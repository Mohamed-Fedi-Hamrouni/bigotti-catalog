"use client";

import { gql } from "@apollo/client";
import { useMutation, useQuery } from "@apollo/client/react";
import Image from "next/image";
import Link from "next/link";
import { FormEvent, KeyboardEvent, useState } from "react";

const navigationItems = [
    { label: "Recherche", href: "/" },
    { label: "Ajouter un article", href: "/products/new" },
    { label: "Liste des articles", href: "/products" },
    { label: "Types d'articles", href: "/product-types" },
    { label: "Tags", href: "/tags" },
];

const GET_FORM_DATA = gql`
    query GetFormData {
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

const CREATE_PRODUCT_TYPE = gql`
    mutation CreateProductType($input: CreateProductTypeInput!) {
        createProductType(input: $input) {
            id
            name
        }
    }
`;

const CREATE_TAG = gql`
    mutation CreateTag($input: CreateTagInput!) {
        createTag(input: $input) {
            id
            name
        }
    }
`;

const CREATE_PRODUCT = gql`
    mutation CreateProduct($input: CreateProductInput!) {
        createProduct(input: $input) {
            id
            ref
            name
        }
    }
`;

const CREATE_PRODUCT_VARIANT = gql`
    mutation CreateProductVariant($input: CreateProductVariantInput!) {
        createProductVariant(input: $input) {
            id
            color
            size
            price
        }
    }
`;

type ProductType = {
    id: string;
    name: string;
};

type Tag = {
    id: string;
    name: string;
};

type FormDataResponse = {
    productTypes: ProductType[];
    tags: Tag[];
};

type CreateProductTypeResponse = {
    createProductType: ProductType;
};

type CreateTagResponse = {
    createTag: Tag;
};

type CreateProductResponse = {
    createProduct: {
        id: string;
        ref: string;
        name: string;
    };
};

type CreateProductVariantResponse = {
    createProductVariant: {
        id: string;
        color: string;
        size: string;
        price: number;
    };
};

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export default function NewProductPage() {
    const [ref, setRef] = useState("");
    const [name, setName] = useState("");
    const [typeId, setTypeId] = useState("");
    const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
    const [color, setColor] = useState("");
    const [size, setSize] = useState("");
    const [price, setPrice] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);

    const [showTypeCreator, setShowTypeCreator] = useState(false);
    const [showTagCreator, setShowTagCreator] = useState(false);
    const [newTypeName, setNewTypeName] = useState("");
    const [newTagName, setNewTagName] = useState("");

    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const { data, loading, error, refetch } =
        useQuery<FormDataResponse>(GET_FORM_DATA);

    const [createProductType, { loading: creatingType }] =
        useMutation<CreateProductTypeResponse>(CREATE_PRODUCT_TYPE);

    const [createTag, { loading: creatingTag }] =
        useMutation<CreateTagResponse>(CREATE_TAG);

    const [createProduct, { loading: creatingProduct }] =
        useMutation<CreateProductResponse>(CREATE_PRODUCT);

    const [createProductVariant, { loading: creatingVariant }] =
        useMutation<CreateProductVariantResponse>(CREATE_PRODUCT_VARIANT);

    const isSubmitting = creatingProduct || creatingVariant;

    function toggleTag(tagId: string) {
        setSelectedTagIds((currentTagIds) => {
            if (currentTagIds.includes(tagId)) {
                return currentTagIds.filter(
                    (currentTagId) => currentTagId !== tagId,
                );
            }

            return [...currentTagIds, tagId];
        });
    }

    async function handleCreateProductType() {
        const cleanTypeName = newTypeName.trim();

        if (!cleanTypeName) {
            setErrorMessage("Le nom du type est obligatoire.");
            return;
        }

        setErrorMessage("");
        setSuccessMessage("");

        try {
            const result = await createProductType({
                variables: {
                    input: {
                        name: cleanTypeName,
                    },
                },
            });

            const createdType = result.data?.createProductType;

            if (!createdType) {
                throw new Error("Type non créé.");
            }

            await refetch();

            setTypeId(createdType.id);
            setNewTypeName("");
            setShowTypeCreator(false);
            setSuccessMessage(`Type "${createdType.name}" créé avec succès.`);
        } catch (creationError) {
            setErrorMessage(
                creationError instanceof Error
                    ? creationError.message
                    : "Erreur pendant la création du type.",
            );
        }
    }

    async function handleCreateTag() {
        const cleanTagName = newTagName.trim();

        if (!cleanTagName) {
            setErrorMessage("Le nom du tag est obligatoire.");
            return;
        }

        setErrorMessage("");
        setSuccessMessage("");

        try {
            const result = await createTag({
                variables: {
                    input: {
                        name: cleanTagName,
                    },
                },
            });

            const createdTag = result.data?.createTag;

            if (!createdTag) {
                throw new Error("Tag non créé.");
            }

            await refetch();

            setSelectedTagIds((currentTagIds) => {
                if (currentTagIds.includes(createdTag.id)) {
                    return currentTagIds;
                }

                return [...currentTagIds, createdTag.id];
            });

            setNewTagName("");
            setShowTagCreator(false);
            setSuccessMessage(`Tag "${createdTag.name}" créé avec succès.`);
        } catch (creationError) {
            setErrorMessage(
                creationError instanceof Error
                    ? creationError.message
                    : "Erreur pendant la création du tag.",
            );
        }
    }

    function handleTypeCreatorKeyDown(event: KeyboardEvent<HTMLInputElement>) {
        if (event.key === "Enter") {
            event.preventDefault();
            handleCreateProductType();
        }
    }

    function handleTagCreatorKeyDown(event: KeyboardEvent<HTMLInputElement>) {
        if (event.key === "Enter") {
            event.preventDefault();
            handleCreateTag();
        }
    }

    async function uploadImage(productId: string, productName: string) {
        if (!imageFile) {
            return;
        }

        const formData = new FormData();
        formData.append("file", imageFile);
        formData.append("altText", productName);
        formData.append("isMain", "true");

        const response = await fetch(
            `${apiUrl}/uploads/products/${productId}/images`,
            {
                method: "POST",
                body: formData,
            },
        );

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Image upload failed: ${errorBody}`);
        }
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setSuccessMessage("");
        setErrorMessage("");

        const cleanRef = ref.trim();
        const cleanName = name.trim();
        const cleanColor = color.trim();
        const cleanSize = size.trim();
        const numericPrice = Number(price);

        if (!cleanRef || !cleanName || !typeId) {
            setErrorMessage("Référence, nom et type sont obligatoires.");
            return;
        }

        if (!cleanColor || !cleanSize || !price || Number.isNaN(numericPrice)) {
            setErrorMessage("Couleur, taille et prix sont obligatoires.");
            return;
        }

        try {
            const productResult = await createProduct({
                variables: {
                    input: {
                        ref: cleanRef,
                        name: cleanName,
                        typeId,
                        tagIds: selectedTagIds,
                    },
                },
            });

            const createdProduct = productResult.data?.createProduct;

            if (!createdProduct) {
                throw new Error("Article non créé.");
            }

            await createProductVariant({
                variables: {
                    input: {
                        productId: createdProduct.id,
                        color: cleanColor,
                        size: cleanSize,
                        price: numericPrice,
                    },
                },
            });

            await uploadImage(createdProduct.id, createdProduct.name);

            setSuccessMessage(
                `Article ${createdProduct.ref} créé avec succès.`,
            );

            setRef("");
            setName("");
            setTypeId("");
            setSelectedTagIds([]);
            setColor("");
            setSize("");
            setPrice("");
            setImageFile(null);
        } catch (submissionError) {
            setErrorMessage(
                submissionError instanceof Error
                    ? submissionError.message
                    : "Erreur pendant la création de l’article.",
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
                        const isActive = item.href === "/products/new";

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
                        Nouvel article
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                        Ajouter un article, sa première variante et son image
                        principale.
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
                                Ajouter un article
                            </h1>
                            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
                                Créer un nouvel article avec sa référence, son
                                type, ses tags, une variante et une image.
                            </p>
                        </div>

                        <Link
                            href="/products"
                            className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                        >
                            Voir la liste
                        </Link>
                    </div>

                    <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                        {loading && (
                            <p className="text-sm text-slate-500">
                                Chargement des types et tags...
                            </p>
                        )}

                        {error && (
                            <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
                                Erreur pendant le chargement : {error.message}
                            </div>
                        )}

                        {!loading && !error && (
                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-950">
                                        Informations article
                                    </h2>

                                    <div className="mt-5 grid gap-5 md:grid-cols-2">
                                        <label className="block">
                                            <span className="text-sm font-semibold text-slate-700">
                                                Référence
                                            </span>
                                            <input
                                                value={ref}
                                                onChange={(event) =>
                                                    setRef(event.target.value)
                                                }
                                                type="text"
                                                placeholder="Exemple : CH-002"
                                                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-950"
                                            />
                                        </label>

                                        <label className="block">
                                            <span className="text-sm font-semibold text-slate-700">
                                                Nom article
                                            </span>
                                            <input
                                                value={name}
                                                onChange={(event) =>
                                                    setName(event.target.value)
                                                }
                                                type="text"
                                                placeholder="Exemple : Chemise noire"
                                                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-950"
                                            />
                                        </label>

                                        <div className="block md:col-span-2">
                                            <div className="mb-2 flex items-center justify-between gap-4">
                                                <span className="text-sm font-semibold text-slate-700">
                                                    Type d’article
                                                </span>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setShowTypeCreator(
                                                            (currentValue) =>
                                                                !currentValue,
                                                        )
                                                    }
                                                    className="rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-200"
                                                >
                                                    {showTypeCreator
                                                        ? "Fermer"
                                                        : "+ Type"}
                                                </button>
                                            </div>

                                            <select
                                                value={typeId}
                                                onChange={(event) =>
                                                    setTypeId(
                                                        event.target.value,
                                                    )
                                                }
                                                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-950"
                                            >
                                                <option value="">
                                                    Choisir un type
                                                </option>
                                                {data?.productTypes.map(
                                                    (productType) => (
                                                        <option
                                                            key={productType.id}
                                                            value={
                                                                productType.id
                                                            }
                                                        >
                                                            {productType.name}
                                                        </option>
                                                    ),
                                                )}
                                            </select>

                                            {showTypeCreator && (
                                                <div className="mt-3 flex gap-3 rounded-2xl bg-slate-50 p-3">
                                                    <input
                                                        value={newTypeName}
                                                        onChange={(event) =>
                                                            setNewTypeName(
                                                                event.target
                                                                    .value,
                                                            )
                                                        }
                                                        onKeyDown={
                                                            handleTypeCreatorKeyDown
                                                        }
                                                        type="text"
                                                        placeholder="Nouveau type, ex : T-shirt"
                                                        className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-950"
                                                    />

                                                    <button
                                                        type="button"
                                                        onClick={
                                                            handleCreateProductType
                                                        }
                                                        disabled={creatingType}
                                                        className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                                                    >
                                                        {creatingType
                                                            ? "Ajout..."
                                                            : "Ajouter"}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center justify-between gap-4">
                                        <h2 className="text-xl font-bold text-slate-950">
                                            Tags
                                        </h2>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowTagCreator(
                                                    (currentValue) =>
                                                        !currentValue,
                                                )
                                            }
                                            className="rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-200"
                                        >
                                            {showTagCreator
                                                ? "Fermer"
                                                : "+ Tag"}
                                        </button>
                                    </div>

                                    {showTagCreator && (
                                        <div className="mt-4 flex gap-3 rounded-2xl bg-slate-50 p-3">
                                            <input
                                                value={newTagName}
                                                onChange={(event) =>
                                                    setNewTagName(
                                                        event.target.value,
                                                    )
                                                }
                                                onKeyDown={
                                                    handleTagCreatorKeyDown
                                                }
                                                type="text"
                                                placeholder="Nouveau tag, ex : coton"
                                                className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-950"
                                            />

                                            <button
                                                type="button"
                                                onClick={handleCreateTag}
                                                disabled={creatingTag}
                                                className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                                            >
                                                {creatingTag
                                                    ? "Ajout..."
                                                    : "Ajouter"}
                                            </button>
                                        </div>
                                    )}

                                    <div className="mt-4 flex flex-wrap gap-3">
                                        {data?.tags.map((tag) => {
                                            const isSelected =
                                                selectedTagIds.includes(tag.id);

                                            return (
                                                <button
                                                    key={tag.id}
                                                    type="button"
                                                    onClick={() =>
                                                        toggleTag(tag.id)
                                                    }
                                                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                                                        isSelected
                                                            ? "bg-slate-950 text-white"
                                                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                                                    }`}
                                                >
                                                    {tag.name}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div>
                                    <h2 className="text-xl font-bold text-slate-950">
                                        Première variante
                                    </h2>

                                    <div className="mt-5 grid gap-5 md:grid-cols-3">
                                        <label className="block">
                                            <span className="text-sm font-semibold text-slate-700">
                                                Couleur
                                            </span>
                                            <input
                                                value={color}
                                                onChange={(event) =>
                                                    setColor(event.target.value)
                                                }
                                                type="text"
                                                placeholder="Blanc"
                                                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-950"
                                            />
                                        </label>

                                        <label className="block">
                                            <span className="text-sm font-semibold text-slate-700">
                                                Taille
                                            </span>
                                            <input
                                                value={size}
                                                onChange={(event) =>
                                                    setSize(event.target.value)
                                                }
                                                type="text"
                                                placeholder="M"
                                                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-950"
                                            />
                                        </label>

                                        <label className="block">
                                            <span className="text-sm font-semibold text-slate-700">
                                                Prix
                                            </span>
                                            <input
                                                value={price}
                                                onChange={(event) =>
                                                    setPrice(event.target.value)
                                                }
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                placeholder="99"
                                                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-950"
                                            />
                                        </label>
                                    </div>
                                </div>

                                <div>
                                    <h2 className="text-xl font-bold text-slate-950">
                                        Image principale
                                    </h2>

                                    <label className="mt-5 block rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center transition hover:bg-slate-100">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(event) =>
                                                setImageFile(
                                                    event.target.files?.[0] ??
                                                        null,
                                                )
                                            }
                                            className="hidden"
                                        />

                                        <span className="text-sm font-semibold text-slate-700">
                                            {imageFile
                                                ? imageFile.name
                                                : "Cliquer pour choisir une image"}
                                        </span>

                                        <p className="mt-2 text-xs text-slate-500">
                                            L’image sera envoyée vers Supabase
                                            Storage après la création de
                                            l’article.
                                        </p>
                                    </label>
                                </div>

                                {errorMessage && (
                                    <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
                                        {errorMessage}
                                    </div>
                                )}

                                {successMessage && (
                                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-700">
                                        {successMessage}
                                    </div>
                                )}

                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="rounded-xl bg-slate-950 px-8 py-4 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                                    >
                                        {isSubmitting
                                            ? "Création..."
                                            : "Créer l’article"}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </section>
        </main>
    );
}
