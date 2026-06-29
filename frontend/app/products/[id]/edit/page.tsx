"use client";

import { gql } from "@apollo/client";
import { useMutation, useQuery } from "@apollo/client/react";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AppSidebar } from "../../../../components/AppSidebar";

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

const UPDATE_PRODUCT_VARIANT = gql`
    mutation UpdateProductVariant($input: UpdateProductVariantInput!) {
        updateProductVariant(input: $input) {
            id
            color
            size
            price
        }
    }
`;

const UPDATE_VARIANT_PRICE = gql`
    mutation UpdateVariantPrice($input: UpdateVariantPriceInput!) {
        updateVariantPrice(input: $input) {
            id
            color
            size
            price
        }
    }
`;

const DELETE_PRODUCT_VARIANT = gql`
    mutation DeleteProductVariant($id: ID!) {
        deleteProductVariant(id: $id)
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
    createProductVariant: ProductVariant;
};

type UpdateProductVariantResponse = {
    updateProductVariant: ProductVariant;
};

type UpdateVariantPriceResponse = {
    updateVariantPrice: ProductVariant;
};

type DeleteProductVariantResponse = {
    deleteProductVariant: boolean;
};

type ExistingVariantForm = {
    id: string;
    color: string;
    size: string;
    price: string;
    originalColor: string;
    originalSize: string;
    originalPrice: string;
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
    const [existingVariants, setExistingVariants] = useState<
        ExistingVariantForm[]
    >([]);
    const [newVariants, setNewVariants] = useState<NewVariantForm[]>([]);
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [initializedProductId, setInitializedProductId] = useState<
        string | null
    >(null);

    const [submitting, setSubmitting] = useState(false);
    const [savingVariantId, setSavingVariantId] = useState<string | null>(null);
    const [deletingVariantId, setDeletingVariantId] = useState<string | null>(
        null,
    );
    const [settingMainImageId, setSettingMainImageId] = useState<string | null>(
        null,
    );
    const [deletingImageId, setDeletingImageId] = useState<string | null>(null);
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

    const [updateProductVariant] = useMutation<UpdateProductVariantResponse>(
        UPDATE_PRODUCT_VARIANT,
    );

    const [updateVariantPrice] =
        useMutation<UpdateVariantPriceResponse>(UPDATE_VARIANT_PRICE);

    const [deleteProductVariant] = useMutation<DeleteProductVariantResponse>(
        DELETE_PRODUCT_VARIANT,
    );

    const product = data?.product;

    const productImages = product
        ? [...product.images].sort((firstImage, secondImage) => {
              return firstImage.position - secondImage.position;
          })
        : [];

    const mainImage =
        productImages.find((image) => image.isMain) ?? productImages[0];

    useEffect(() => {
        if (!product || initializedProductId === product.id) {
            return;
        }

        setRef(product.ref);
        setName(product.name);
        setTypeId(product.type.id);
        setSelectedTagIds(product.tags.map((tag) => tag.id));
        setExistingVariants(
            product.variants.map((variant) => ({
                id: variant.id,
                color: variant.color,
                size: variant.size,
                price: String(variant.price),
                originalColor: variant.color,
                originalSize: variant.size,
                originalPrice: String(variant.price),
            })),
        );
        setInitializedProductId(product.id);
    }, [product, initializedProductId]);

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

    function updateExistingVariant(
        variantId: string,
        field: keyof Pick<ExistingVariantForm, "color" | "size" | "price">,
        value: string,
    ) {
        setExistingVariants((currentVariants) =>
            currentVariants.map((variant) => {
                if (variant.id !== variantId) {
                    return variant;
                }

                return {
                    ...variant,
                    [field]: value,
                };
            }),
        );
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

    function removeSelectedImageFile(fileIndex: number) {
        setImageFiles((currentFiles) =>
            currentFiles.filter((_, index) => index !== fileIndex),
        );
    }

    async function uploadProductImage(
        file: File,
        productName: string,
        isMain = false,
    ) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("altText", productName);
        formData.append("isMain", String(isMain));

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

    async function handleSetMainImage(imageId: string) {
        setSettingMainImageId(imageId);
        setErrorMessage("");
        setSuccessMessage("");

        try {
            const response = await fetch(
                `${apiUrl}/uploads/products/images/${imageId}/main`,
                {
                    method: "PATCH",
                },
            );

            if (!response.ok) {
                const errorBody = await response.text();
                throw new Error(`Set main image failed: ${errorBody}`);
            }

            setSuccessMessage("Image principale modifiée avec succès.");
            await refetch();
        } catch (setMainError) {
            setErrorMessage(
                setMainError instanceof Error
                    ? setMainError.message
                    : "Erreur pendant le changement de l’image principale.",
            );
        } finally {
            setSettingMainImageId(null);
        }
    }

    async function handleDeleteImage(image: ProductImage) {
        const confirmed = window.confirm("Supprimer cette image ?");

        if (!confirmed) {
            return;
        }

        setDeletingImageId(image.id);
        setErrorMessage("");
        setSuccessMessage("");

        try {
            const response = await fetch(
                `${apiUrl}/uploads/products/images/${image.id}`,
                {
                    method: "DELETE",
                },
            );

            if (!response.ok) {
                const errorBody = await response.text();
                throw new Error(`Delete image failed: ${errorBody}`);
            }

            setSuccessMessage("Image supprimée avec succès.");
            await refetch();
        } catch (deleteError) {
            setErrorMessage(
                deleteError instanceof Error
                    ? deleteError.message
                    : "Erreur pendant la suppression de l’image.",
            );
        } finally {
            setDeletingImageId(null);
        }
    }

    async function handleSaveExistingVariant(variantId: string) {
        const variant = existingVariants.find(
            (currentVariant) => currentVariant.id === variantId,
        );

        if (!variant) {
            return;
        }

        const cleanColor = variant.color.trim();
        const cleanSize = variant.size.trim();
        const cleanPriceText = variant.price.trim();
        const numericPrice = Number(cleanPriceText);

        if (
            !cleanColor ||
            !cleanSize ||
            !cleanPriceText ||
            Number.isNaN(numericPrice) ||
            numericPrice < 0
        ) {
            setErrorMessage(
                "Couleur, taille et prix sont obligatoires pour modifier la variante.",
            );
            return;
        }

        const colorOrSizeChanged =
            cleanColor !== variant.originalColor ||
            cleanSize !== variant.originalSize;

        const priceChanged = cleanPriceText !== variant.originalPrice;

        if (!colorOrSizeChanged && !priceChanged) {
            setErrorMessage("Aucune modification détectée sur cette variante.");
            return;
        }

        setSavingVariantId(variantId);
        setErrorMessage("");
        setSuccessMessage("");

        try {
            let updatedVariant: ProductVariant | null = null;

            if (colorOrSizeChanged) {
                const result = await updateProductVariant({
                    variables: {
                        input: {
                            id: variantId,
                            color: cleanColor,
                            size: cleanSize,
                        },
                    },
                });

                updatedVariant = result.data?.updateProductVariant ?? null;
            }

            if (priceChanged) {
                const result = await updateVariantPrice({
                    variables: {
                        input: {
                            variantId,
                            newPrice: numericPrice,
                        },
                    },
                });

                updatedVariant = result.data?.updateVariantPrice ?? null;
            }

            setExistingVariants((currentVariants) =>
                currentVariants.map((currentVariant) => {
                    if (currentVariant.id !== variantId) {
                        return currentVariant;
                    }

                    return {
                        id: currentVariant.id,
                        color: updatedVariant?.color ?? cleanColor,
                        size: updatedVariant?.size ?? cleanSize,
                        price: String(updatedVariant?.price ?? numericPrice),
                        originalColor: updatedVariant?.color ?? cleanColor,
                        originalSize: updatedVariant?.size ?? cleanSize,
                        originalPrice: String(
                            updatedVariant?.price ?? numericPrice,
                        ),
                    };
                }),
            );

            setSuccessMessage("Variante modifiée avec succès.");
            await refetch();
        } catch (saveError) {
            setErrorMessage(
                saveError instanceof Error
                    ? saveError.message
                    : "Erreur pendant la modification de la variante.",
            );
        } finally {
            setSavingVariantId(null);
        }
    }

    async function handleDeleteExistingVariant(variantId: string) {
        const variant = existingVariants.find(
            (currentVariant) => currentVariant.id === variantId,
        );

        if (!variant) {
            return;
        }

        const confirmed = window.confirm(
            `Supprimer la variante "${variant.color} / ${variant.size}" ?`,
        );

        if (!confirmed) {
            return;
        }

        setDeletingVariantId(variantId);
        setErrorMessage("");
        setSuccessMessage("");

        try {
            await deleteProductVariant({
                variables: {
                    id: variantId,
                },
            });

            setExistingVariants((currentVariants) =>
                currentVariants.filter(
                    (currentVariant) => currentVariant.id !== variantId,
                ),
            );

            setSuccessMessage("Variante supprimée avec succès.");
            await refetch();
        } catch (deleteError) {
            setErrorMessage(
                deleteError instanceof Error
                    ? deleteError.message
                    : "Erreur pendant la suppression de la variante.",
            );
        } finally {
            setDeletingVariantId(null);
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

            const createdVariants: ProductVariant[] = [];

            for (const variant of variantsToCreate) {
                const result = await createProductVariant({
                    variables: {
                        input: {
                            productId,
                            color: variant.color,
                            size: variant.size,
                            price: variant.price,
                        },
                    },
                });

                if (result.data?.createProductVariant) {
                    createdVariants.push(result.data.createProductVariant);
                }
            }

            for (const imageFile of imageFiles) {
                await uploadProductImage(imageFile, cleanName, false);
            }

            if (createdVariants.length > 0) {
                setExistingVariants((currentVariants) => [
                    ...currentVariants,
                    ...createdVariants.map((variant) => ({
                        id: variant.id,
                        color: variant.color,
                        size: variant.size,
                        price: String(variant.price),
                        originalColor: variant.color,
                        originalSize: variant.size,
                        originalPrice: String(variant.price),
                    })),
                ]);
            }

            setSuccessMessage("Article modifié avec succès.");
            setNewVariants([]);
            setImageFiles([]);

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

            <AppSidebar
                activeHref="/products"
                title="Modifier article"
                description="Modifier les informations, variantes et images."
            />

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
                                les variantes existantes, puis gérer les images.
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

                    {!loading && !error && product && (
                        <form
                            onSubmit={handleSubmit}
                            className="grid gap-8 lg:grid-cols-[380px_1fr]"
                        >
                            <div className="space-y-6">
                                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                                    <h2 className="text-lg font-bold text-slate-950">
                                        Image principale
                                    </h2>

                                    <div className="mt-4 aspect-square overflow-hidden rounded-2xl bg-slate-100">
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
                                            multiple
                                            onChange={(event) =>
                                                setImageFiles(
                                                    Array.from(
                                                        event.target.files ??
                                                            [],
                                                    ),
                                                )
                                            }
                                            className="hidden"
                                        />

                                        <span className="text-sm font-semibold text-slate-700">
                                            {imageFiles.length > 0
                                                ? `${imageFiles.length} image(s) sélectionnée(s)`
                                                : "Ajouter une ou plusieurs images"}
                                        </span>

                                        <p className="mt-2 text-xs text-slate-500">
                                            Les images seront envoyées après le
                                            clic sur “Enregistrer les
                                            modifications”.
                                        </p>
                                    </label>

                                    {imageFiles.length > 0 && (
                                        <div className="mt-4 space-y-2">
                                            {imageFiles.map(
                                                (imageFile, index) => (
                                                    <div
                                                        key={`${imageFile.name}-${index}`}
                                                        className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600"
                                                    >
                                                        <span className="truncate">
                                                            {imageFile.name}
                                                        </span>

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                removeSelectedImageFile(
                                                                    index,
                                                                )
                                                            }
                                                            className="font-semibold text-red-600"
                                                        >
                                                            Retirer
                                                        </button>
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                                    <div className="flex items-center justify-between gap-4">
                                        <div>
                                            <h2 className="text-lg font-bold text-slate-950">
                                                Toutes les images
                                            </h2>
                                            <p className="mt-1 text-sm text-slate-500">
                                                {productImages.length} image(s)
                                                enregistrée(s)
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-4 space-y-4">
                                        {productImages.length === 0 && (
                                            <div className="rounded-2xl bg-slate-50 p-5 text-center text-sm text-slate-500">
                                                Aucune image enregistrée.
                                            </div>
                                        )}

                                        {productImages.map((image) => (
                                            <div
                                                key={image.id}
                                                className={`rounded-2xl border p-3 ${
                                                    image.isMain
                                                        ? "border-slate-950 bg-slate-50"
                                                        : "border-slate-200 bg-white"
                                                }`}
                                            >
                                                <div className="aspect-video overflow-hidden rounded-xl bg-slate-100">
                                                    <img
                                                        src={image.url}
                                                        alt={product.name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                </div>

                                                <div className="mt-3 flex items-center justify-between gap-3">
                                                    <span
                                                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                                            image.isMain
                                                                ? "bg-slate-950 text-white"
                                                                : "bg-slate-100 text-slate-600"
                                                        }`}
                                                    >
                                                        {image.isMain
                                                            ? "Image principale"
                                                            : `Image ${image.position + 1}`}
                                                    </span>
                                                </div>

                                                <div className="mt-3 flex gap-2">
                                                    {!image.isMain && (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleSetMainImage(
                                                                    image.id,
                                                                )
                                                            }
                                                            disabled={
                                                                settingMainImageId ===
                                                                    image.id ||
                                                                deletingImageId ===
                                                                    image.id
                                                            }
                                                            className="flex-1 rounded-xl bg-slate-950 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                                                        >
                                                            {settingMainImageId ===
                                                            image.id
                                                                ? "..."
                                                                : "Définir principale"}
                                                        </button>
                                                    )}

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleDeleteImage(
                                                                image,
                                                            )
                                                        }
                                                        disabled={
                                                            settingMainImageId ===
                                                                image.id ||
                                                            deletingImageId ===
                                                                image.id
                                                        }
                                                        className="rounded-xl border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:text-slate-300"
                                                    >
                                                        {deletingImageId ===
                                                        image.id
                                                            ? "..."
                                                            : "Supprimer"}
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                                    <h2 className="text-lg font-bold text-slate-950">
                                        Variantes existantes
                                    </h2>

                                    <p className="mt-1 text-sm text-slate-500">
                                        Modifie couleur, taille ou prix. Le prix
                                        passe par l’historique des prix.
                                    </p>

                                    <div className="mt-4 space-y-4">
                                        {existingVariants.length === 0 && (
                                            <div className="rounded-2xl bg-slate-50 p-5 text-center text-sm text-slate-500">
                                                Aucune variante existante.
                                            </div>
                                        )}

                                        {existingVariants.map((variant) => (
                                            <div
                                                key={variant.id}
                                                className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                                            >
                                                <div className="space-y-3">
                                                    <label className="block">
                                                        <span className="text-xs font-semibold uppercase text-slate-400">
                                                            Couleur
                                                        </span>
                                                        <input
                                                            value={
                                                                variant.color
                                                            }
                                                            onChange={(event) =>
                                                                updateExistingVariant(
                                                                    variant.id,
                                                                    "color",
                                                                    event.target
                                                                        .value,
                                                                )
                                                            }
                                                            type="text"
                                                            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-950"
                                                        />
                                                    </label>

                                                    <label className="block">
                                                        <span className="text-xs font-semibold uppercase text-slate-400">
                                                            Taille
                                                        </span>
                                                        <input
                                                            value={variant.size}
                                                            onChange={(event) =>
                                                                updateExistingVariant(
                                                                    variant.id,
                                                                    "size",
                                                                    event.target
                                                                        .value,
                                                                )
                                                            }
                                                            type="text"
                                                            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-950"
                                                        />
                                                    </label>

                                                    <label className="block">
                                                        <span className="text-xs font-semibold uppercase text-slate-400">
                                                            Prix
                                                        </span>
                                                        <input
                                                            value={
                                                                variant.price
                                                            }
                                                            onChange={(event) =>
                                                                updateExistingVariant(
                                                                    variant.id,
                                                                    "price",
                                                                    event.target
                                                                        .value,
                                                                )
                                                            }
                                                            type="number"
                                                            min="0"
                                                            step="0.01"
                                                            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-950"
                                                        />
                                                    </label>
                                                </div>

                                                <div className="mt-4 flex gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleSaveExistingVariant(
                                                                variant.id,
                                                            )
                                                        }
                                                        disabled={
                                                            savingVariantId ===
                                                                variant.id ||
                                                            deletingVariantId ===
                                                                variant.id
                                                        }
                                                        className="flex-1 rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                                                    >
                                                        {savingVariantId ===
                                                        variant.id
                                                            ? "Sauvegarde..."
                                                            : "Sauvegarder"}
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleDeleteExistingVariant(
                                                                variant.id,
                                                            )
                                                        }
                                                        disabled={
                                                            savingVariantId ===
                                                                variant.id ||
                                                            deletingVariantId ===
                                                                variant.id
                                                        }
                                                        className="rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:text-slate-300"
                                                    >
                                                        {deletingVariantId ===
                                                        variant.id
                                                            ? "..."
                                                            : "Supprimer"}
                                                    </button>
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
                                                Ici tu ajoutes seulement de
                                                nouvelles variantes.
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
