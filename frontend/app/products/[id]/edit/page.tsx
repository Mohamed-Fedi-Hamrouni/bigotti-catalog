"use client";

import { gql } from "@apollo/client";
import { useMutation, useQuery } from "@apollo/client/react";
import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useParams } from "next/navigation";

const navigationItems = [
    { label: "Recherche", href: "/" },
    { label: "Ajouter un article", href: "/products/new" },
    { label: "Liste des articles", href: "/products" },
    { label: "Types d'articles", href: "/product-types" },
    { label: "Tags", href: "/tags" },
];

const GET_PRODUCT_EDIT_DATA = gql`
    query GetProductEditData($id: ID!) {
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

const UPDATE_PRODUCT = gql`
    mutation UpdateProduct($input: UpdateProductInput!) {
        updateProduct(input: $input) {
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

type ProductVariant = {
    id: string;
    color: string;
    size: string;
    price: number;
};

type ProductImage = {
    id: string;
    url: string;
    isMain: boolean;
    position: number;
};

type Product = {
    id: string;
    ref: string;
    name: string;
    type: ProductType;
    tags: Tag[];
    variants: ProductVariant[];
    images: ProductImage[];
};

type ProductEditData = {
    product: Product;
    productTypes: ProductType[];
    tags: Tag[];
};

type ProductEditVariables = {
    id: string;
};

type UpdateProductResponse = {
    updateProduct: {
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

type NewVariantForm = {
    localId: string;
    color: string;
    size: string;
    price: string;
};

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export default function EditProductPage() {
    const params = useParams<{ id: string }>();
    const productId = params.id;

    const [ref, setRef] = useState("");
    const [name, setName] = useState("");
    const [typeId, setTypeId] = useState("");
    const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
    const [newVariants, setNewVariants] = useState<NewVariantForm[]>([]);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [initialized, setInitialized] = useState(false);

    const [submitting, setSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const { data, loading, error, refetch } = useQuery<
        ProductEditData,
        ProductEditVariables
    >(GET_PRODUCT_EDIT_DATA, {
        variables: { id: productId },
        skip: !productId,
        fetchPolicy: "network-only",
    });

    const [updateProduct] = useMutation<UpdateProductResponse>(UPDATE_PRODUCT);

    const [createProductVariant] = useMutation<CreateProductVariantResponse>(
        CREATE_PRODUCT_VARIANT,
    );

    const product = data?.product;
    const mainImage =
        product?.images.find((image) => image.isMain) ?? product?.images[0];

    useEffect(() => {
        if (!product || initialized) {
            return;
        }

        setRef(product.ref);
        setName(product.name);
        setTypeId(product.type.id);
        setSelectedTagIds(product.tags.map((tag) => tag.id));
        setInitialized(true);
    }, [product, initialized]);

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

    function addNewVariant() {
        setNewVariants((currentVariants) => [
            ...currentVariants,
            {
                localId: `new-variant-${Date.now()}-${currentVariants.length + 1}`,
                color: "",
                size: "",
                price: "",
            },
        ]);
    }

    function removeNewVariant(localId: string) {
        setNewVariants((currentVariants) =>
            currentVariants.filter((variant) => variant.localId !== localId),
        );
    }

    function updateNewVariant(
        localId: string,
        field: keyof Omit<NewVariantForm, "localId">,
        value: string,
    ) {
        setNewVariants((currentVariants) =>
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

    async function uploadImage(productName: string) {
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

        const variantsToCreate = newVariants.map((variant, index) => ({
            index: index + 1,
            color: variant.color.trim(),
            size: variant.size.trim(),
            priceText: variant.price.trim(),
            price: Number(variant.price),
        }));

        const invalidVariant = variantsToCreate.find(
            (variant) =>
                !variant.color ||
                !variant.size ||
                !variant.priceText ||
                Number.isNaN(variant.price) ||
                variant.price < 0,
        );

        if (invalidVariant) {
            setErrorMessage(
                `La nouvelle variante ${invalidVariant.index} est incomplète.`,
            );
            return;
        }

        setSubmitting(true);

        try {
            await updateProduct({
                variables: {
                    input: {
                        id: productId,
                        ref: cleanRef,
                        name: cleanName,
                        typeId,
                        tagIds: selectedTagIds,
                    },
                },
            });

            for (const variant of variantsToCreate) {
                await createProductVariant({
                    variables: {
                        input: {
                            productId,
                            color: variant.color,
                            size: variant.size,
                            price: variant.price,
                        },
                    },
                });
            }

            await uploadImage(cleanName);

            setSuccessMessage("Article modifié avec succès.");
            setNewVariants([]);
            setImageFile(null);

            await refetch();
        } catch (submitError) {
            setErrorMessage(
                submitError instanceof Error
                    ? submitError.message
                    : "Erreur pendant la modification de l’article.",
            );
        } finally {
            setSubmitting(false);
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
                        Modifier article
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                        Modifier les informations et ajouter des variantes ou
                        images.
                    </p>
                </div>
            </aside>

            <section className="ml-72 min-h-screen flex-1 px-10 py-10">
                <div className="mx-auto w-full max-w-6xl">
                    <div className="mb-8 flex items-start justify-between gap-6">
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
                                Catalogue
                            </p>
                            <h1 className="mt-3 text-4xl font-bold tracking-tight">
                                Modifier l’article
                            </h1>
                            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
                                Modifier les informations principales, les tags,
                                puis ajouter des variantes ou une image.
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <Link
                                href={`/products/${productId}`}
                                className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                            >
                                Voir détails
                            </Link>

                            <Link
                                href="/products"
                                className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                            >
                                Retour liste
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

                    {!loading && !error && product && (
                        <form
                            onSubmit={handleSubmit}
                            className="grid gap-8 lg:grid-cols-[360px_1fr]"
                        >
                            <div className="space-y-6">
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

                                    <label className="mt-5 block rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center transition hover:bg-slate-100">
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
                                                : "Ajouter une nouvelle image principale"}
                                        </span>

                                        <p className="mt-2 text-xs text-slate-500">
                                            La nouvelle image sera ajoutée et
                                            marquée comme image principale.
                                        </p>
                                    </label>
                                </div>

                                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                                    <h2 className="text-lg font-bold text-slate-950">
                                        Variantes existantes
                                    </h2>

                                    <div className="mt-4 space-y-3">
                                        {product.variants.map((variant) => (
                                            <div
                                                key={variant.id}
                                                className="rounded-2xl bg-slate-50 p-4 text-sm"
                                            >
                                                <div className="flex justify-between gap-4">
                                                    <span className="font-semibold text-slate-700">
                                                        {variant.color} · Taille{" "}
                                                        {variant.size}
                                                    </span>
                                                    <span className="font-bold text-slate-950">
                                                        {variant.price} TND
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
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
                                                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-950"
                                            />
                                        </label>

                                        <label className="block md:col-span-2">
                                            <span className="text-sm font-semibold text-slate-700">
                                                Type d’article
                                            </span>
                                            <select
                                                value={typeId}
                                                onChange={(event) =>
                                                    setTypeId(
                                                        event.target.value,
                                                    )
                                                }
                                                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-950"
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
                                        </label>
                                    </div>
                                </div>

                                <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                                    <h2 className="text-xl font-bold text-slate-950">
                                        Tags
                                    </h2>

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

                                <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                                    <div className="flex items-center justify-between gap-4">
                                        <div>
                                            <h2 className="text-xl font-bold text-slate-950">
                                                Ajouter des variantes
                                            </h2>
                                            <p className="mt-1 text-sm text-slate-500">
                                                Les variantes existantes sont
                                                affichées à gauche. Ici tu
                                                ajoutes seulement de nouvelles
                                                variantes.
                                            </p>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={addNewVariant}
                                            className="rounded-full bg-slate-950 px-5 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
                                        >
                                            + Variante
                                        </button>
                                    </div>

                                    {newVariants.length === 0 && (
                                        <div className="mt-5 rounded-2xl bg-slate-50 p-5 text-center text-sm text-slate-500">
                                            Aucune nouvelle variante à ajouter.
                                        </div>
                                    )}

                                    <div className="mt-5 space-y-4">
                                        {newVariants.map((variant, index) => (
                                            <div
                                                key={variant.localId}
                                                className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                                            >
                                                <div className="mb-4 flex items-center justify-between">
                                                    <p className="text-sm font-bold text-slate-800">
                                                        Nouvelle variante{" "}
                                                        {index + 1}
                                                    </p>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            removeNewVariant(
                                                                variant.localId,
                                                            )
                                                        }
                                                        className="rounded-full px-3 py-1 text-xs font-semibold text-red-600 transition hover:bg-red-50"
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
                                                                updateNewVariant(
                                                                    variant.localId,
                                                                    "color",
                                                                    event.target
                                                                        .value,
                                                                )
                                                            }
                                                            type="text"
                                                            placeholder="Noir"
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
                                                                updateNewVariant(
                                                                    variant.localId,
                                                                    "size",
                                                                    event.target
                                                                        .value,
                                                                )
                                                            }
                                                            type="text"
                                                            placeholder="L"
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
                                                                updateNewVariant(
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
                                        disabled={submitting}
                                        className="rounded-xl bg-slate-950 px-8 py-4 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                                    >
                                        {submitting
                                            ? "Enregistrement..."
                                            : "Enregistrer les modifications"}
                                    </button>
                                </div>
                            </div>
                        </form>
                    )}
                </div>
            </section>
        </main>
    );
}
