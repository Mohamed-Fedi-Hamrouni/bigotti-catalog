"use client";

import { gql } from "@apollo/client";
import { useMutation, useQuery } from "@apollo/client/react";
import Link from "next/link";
import { FormEvent, KeyboardEvent, useState } from "react";
import { AppSidebar } from "../../../components/AppSidebar";

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

type VariantForm = {
    localId: string;
    color: string;
    size: string;
    price: string;
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

const initialVariant: VariantForm = {
    localId: "variant-1",
    color: "",
    size: "",
    price: "",
};

export default function NewProductPage() {
    const [ref, setRef] = useState("");
    const [name, setName] = useState("");
    const [typeId, setTypeId] = useState("");
    const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
    const [variants, setVariants] = useState<VariantForm[]>([initialVariant]);
    const [imageFile, setImageFile] = useState<File | null>(null);

    const [showTypeCreator, setShowTypeCreator] = useState(false);
    const [showTagCreator, setShowTagCreator] = useState(false);
    const [newTypeName, setNewTypeName] = useState("");
    const [newTagName, setNewTagName] = useState("");

    const [submitting, setSubmitting] = useState(false);
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

    const isSubmitting = submitting || creatingProduct || creatingVariant;

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

    function addVariant() {
        setVariants((currentVariants) => [
            ...currentVariants,
            {
                localId: `variant-${Date.now()}-${currentVariants.length + 1}`,
                color: "",
                size: "",
                price: "",
            },
        ]);
    }

    function removeVariant(localId: string) {
        setVariants((currentVariants) => {
            if (currentVariants.length === 1) {
                return currentVariants;
            }

            return currentVariants.filter(
                (variant) => variant.localId !== localId,
            );
        });
    }

    function updateVariant(
        localId: string,
        field: keyof Omit<VariantForm, "localId">,
        value: string,
    ) {
        setVariants((currentVariants) =>
            currentVariants.map((variant) => {
                if (variant.localId !== localId) {
                    return variant;
                }

                return {
                    ...variant,
                    [field]: value,
                };
            }),
        );
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

        if (!cleanRef || !cleanName || !typeId) {
            setErrorMessage("Référence, nom et type sont obligatoires.");
            return;
        }

        const cleanVariants = variants.map((variant, index) => ({
            index: index + 1,
            color: variant.color.trim(),
            size: variant.size.trim(),
            priceText: variant.price.trim(),
            price: Number(variant.price),
        }));

        const invalidVariant = cleanVariants.find(
            (variant) =>
                !variant.color ||
                !variant.size ||
                !variant.priceText ||
                Number.isNaN(variant.price) ||
                variant.price < 0,
        );

        if (invalidVariant) {
            setErrorMessage(
                `La variante ${invalidVariant.index} est incomplète. Couleur, taille et prix sont obligatoires.`,
            );
            return;
        }

        setSubmitting(true);

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

            for (const variant of cleanVariants) {
                await createProductVariant({
                    variables: {
                        input: {
                            productId: createdProduct.id,
                            color: variant.color,
                            size: variant.size,
                            price: variant.price,
                        },
                    },
                });
            }

            await uploadImage(createdProduct.id, createdProduct.name);

            setSuccessMessage(
                `Article ${createdProduct.ref} créé avec ${cleanVariants.length} variante(s).`,
            );

            setRef("");
            setName("");
            setTypeId("");
            setSelectedTagIds([]);
            setVariants([initialVariant]);
            setImageFile(null);
        } catch (submissionError) {
            setErrorMessage(
                submissionError instanceof Error
                    ? submissionError.message
                    : "Erreur pendant la création de l’article.",
            );
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <main className="flex min-h-screen bg-slate-100 text-slate-950">
            <AppSidebar
                activeHref="/products/new"
                title="Nouvel article"
                description="Ajouter un article, ses variantes et son image principale."
            />

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
                                type, ses tags, plusieurs variantes et une
                                image.
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
                                    <div className="flex items-center justify-between gap-4">
                                        <div>
                                            <h2 className="text-xl font-bold text-slate-950">
                                                Variantes
                                            </h2>
                                            <p className="mt-1 text-sm text-slate-500">
                                                Ajoute une ou plusieurs
                                                combinaisons couleur / taille /
                                                prix.
                                            </p>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={addVariant}
                                            className="rounded-full bg-slate-950 px-5 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
                                        >
                                            + Variante
                                        </button>
                                    </div>

                                    <div className="mt-5 space-y-4">
                                        {variants.map((variant, index) => (
                                            <div
                                                key={variant.localId}
                                                className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                                            >
                                                <div className="mb-4 flex items-center justify-between">
                                                    <p className="text-sm font-bold text-slate-800">
                                                        Variante {index + 1}
                                                    </p>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            removeVariant(
                                                                variant.localId,
                                                            )
                                                        }
                                                        disabled={
                                                            variants.length ===
                                                            1
                                                        }
                                                        className="rounded-full px-3 py-1 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:bg-transparent"
                                                    >
                                                        Supprimer
                                                    </button>
                                                </div>

                                                <div className="grid gap-5 md:grid-cols-3">
                                                    <label className="block">
                                                        <span className="text-sm font-semibold text-slate-700">
                                                            Couleur
                                                        </span>
                                                        <input
                                                            value={
                                                                variant.color
                                                            }
                                                            onChange={(event) =>
                                                                updateVariant(
                                                                    variant.localId,
                                                                    "color",
                                                                    event.target
                                                                        .value,
                                                                )
                                                            }
                                                            type="text"
                                                            placeholder="Blanc"
                                                            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-slate-950"
                                                        />
                                                    </label>

                                                    <label className="block">
                                                        <span className="text-sm font-semibold text-slate-700">
                                                            Taille
                                                        </span>
                                                        <input
                                                            value={variant.size}
                                                            onChange={(event) =>
                                                                updateVariant(
                                                                    variant.localId,
                                                                    "size",
                                                                    event.target
                                                                        .value,
                                                                )
                                                            }
                                                            type="text"
                                                            placeholder="M"
                                                            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-slate-950"
                                                        />
                                                    </label>

                                                    <label className="block">
                                                        <span className="text-sm font-semibold text-slate-700">
                                                            Prix
                                                        </span>
                                                        <input
                                                            value={
                                                                variant.price
                                                            }
                                                            onChange={(event) =>
                                                                updateVariant(
                                                                    variant.localId,
                                                                    "price",
                                                                    event.target
                                                                        .value,
                                                                )
                                                            }
                                                            type="number"
                                                            min="0"
                                                            step="0.01"
                                                            placeholder="99"
                                                            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-slate-950"
                                                        />
                                                    </label>
                                                </div>
                                            </div>
                                        ))}
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
