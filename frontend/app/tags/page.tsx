"use client";

import { gql } from "@apollo/client";
import { useMutation, useQuery } from "@apollo/client/react";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { AppSidebar } from "../../components/AppSidebar";

const GET_TAGS = gql`
    query GetTags {
        tags {
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

const UPDATE_TAG = gql`
    mutation UpdateTag($input: UpdateTagInput!) {
        updateTag(input: $input) {
            id
            name
        }
    }
`;

const DELETE_TAG = gql`
    mutation DeleteTag($id: ID!) {
        deleteTag(id: $id)
    }
`;

type Tag = {
    id: string;
    name: string;
};

type GetTagsData = {
    tags: Tag[];
};

type CreateTagData = {
    createTag: Tag;
};

type UpdateTagData = {
    updateTag: Tag;
};

type DeleteTagData = {
    deleteTag: boolean;
};

export default function TagsPage() {
    const [newTagName, setNewTagName] = useState("");
    const [editingTagId, setEditingTagId] = useState<string | null>(null);
    const [editingTagName, setEditingTagName] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const { data, loading, error, refetch } = useQuery<GetTagsData>(GET_TAGS, {
        fetchPolicy: "network-only",
    });

    const [createTag, { loading: creatingTag }] =
        useMutation<CreateTagData>(CREATE_TAG);

    const [updateTag, { loading: updatingTag }] =
        useMutation<UpdateTagData>(UPDATE_TAG);

    const [deleteTag, { loading: deletingTag }] =
        useMutation<DeleteTagData>(DELETE_TAG);

    const tags = data?.tags ?? [];
    const isWorking = creatingTag || updatingTag || deletingTag;

    async function handleCreateTag(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const cleanName = newTagName.trim();

        if (!cleanName) {
            setErrorMessage("Le nom du tag est obligatoire.");
            return;
        }

        setErrorMessage("");
        setSuccessMessage("");

        try {
            const result = await createTag({
                variables: {
                    input: {
                        name: cleanName,
                    },
                },
            });

            const createdTag = result.data?.createTag;

            if (!createdTag) {
                throw new Error("Tag non créé.");
            }

            setNewTagName("");
            setSuccessMessage(`Tag "${createdTag.name}" créé avec succès.`);
            await refetch();
        } catch (creationError) {
            setErrorMessage(
                creationError instanceof Error
                    ? creationError.message
                    : "Erreur pendant la création du tag.",
            );
        }
    }

    function startEditing(tag: Tag) {
        setEditingTagId(tag.id);
        setEditingTagName(tag.name);
        setErrorMessage("");
        setSuccessMessage("");
    }

    function cancelEditing() {
        setEditingTagId(null);
        setEditingTagName("");
    }

    async function handleUpdateTag(tagId: string) {
        const cleanName = editingTagName.trim();

        if (!cleanName) {
            setErrorMessage("Le nom du tag est obligatoire.");
            return;
        }

        setErrorMessage("");
        setSuccessMessage("");

        try {
            const result = await updateTag({
                variables: {
                    input: {
                        id: tagId,
                        name: cleanName,
                    },
                },
            });

            const updatedTag = result.data?.updateTag;

            if (!updatedTag) {
                throw new Error("Tag non modifié.");
            }

            setEditingTagId(null);
            setEditingTagName("");
            setSuccessMessage(`Tag "${updatedTag.name}" modifié avec succès.`);
            await refetch();
        } catch (updateError) {
            setErrorMessage(
                updateError instanceof Error
                    ? updateError.message
                    : "Erreur pendant la modification du tag.",
            );
        }
    }

    async function handleDeleteTag(tag: Tag) {
        const confirmed = window.confirm(
            `Supprimer le tag "${tag.name}" ? Cette action est impossible si le tag est utilisé par des articles.`,
        );

        if (!confirmed) {
            return;
        }

        setErrorMessage("");
        setSuccessMessage("");

        try {
            await deleteTag({
                variables: {
                    id: tag.id,
                },
            });

            setSuccessMessage(`Tag "${tag.name}" supprimé.`);
            await refetch();
        } catch (deleteError) {
            setErrorMessage(
                deleteError instanceof Error
                    ? deleteError.message
                    : "Erreur pendant la suppression du tag.",
            );
        }
    }

    return (
        <main className="flex min-h-screen bg-slate-100 text-slate-950">
            <AppSidebar
                activeHref="/tags"
                title="Tags"
                description="Gérer les mots-clés utilisés pour retrouver rapidement les articles."
            />

            <section className="ml-72 min-h-screen flex-1 px-10 py-10">
                <div className="mx-auto w-full max-w-5xl">
                    <div className="flex items-start justify-between gap-6">
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
                                Catalogue
                            </p>
                            <h1 className="mt-3 text-4xl font-bold tracking-tight">
                                Tags
                            </h1>
                            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
                                Créer, modifier ou supprimer les tags utilisés
                                pour faciliter la recherche des articles.
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
                                Nouveau tag
                            </h2>

                            <form
                                onSubmit={handleCreateTag}
                                className="mt-5 space-y-4"
                            >
                                <label className="block">
                                    <span className="text-sm font-semibold text-slate-700">
                                        Nom du tag
                                    </span>
                                    <input
                                        value={newTagName}
                                        onChange={(event) =>
                                            setNewTagName(event.target.value)
                                        }
                                        type="text"
                                        placeholder="Exemple : coton"
                                        className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-950"
                                    />
                                </label>

                                <button
                                    type="submit"
                                    disabled={creatingTag}
                                    className="w-full rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                                >
                                    {creatingTag
                                        ? "Création..."
                                        : "Créer le tag"}
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
                                        Liste des tags
                                    </h2>
                                    <p className="mt-1 text-sm text-slate-500">
                                        {tags.length} tag(s) enregistré(s)
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
                                        Chargement des tags...
                                    </div>
                                )}

                                {error && (
                                    <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
                                        Erreur pendant le chargement :{" "}
                                        {error.message}
                                    </div>
                                )}

                                {!loading && !error && tags.length === 0 && (
                                    <div className="rounded-2xl bg-slate-50 p-5 text-center text-sm text-slate-500">
                                        Aucun tag enregistré.
                                    </div>
                                )}

                                {!loading && !error && tags.length > 0 && (
                                    <div className="space-y-3">
                                        {tags.map((tag) => {
                                            const isEditing =
                                                editingTagId === tag.id;

                                            return (
                                                <div
                                                    key={tag.id}
                                                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                                                >
                                                    {!isEditing ? (
                                                        <div className="flex items-center justify-between gap-4">
                                                            <div>
                                                                <p className="font-semibold text-slate-950">
                                                                    {tag.name}
                                                                </p>
                                                                <p className="mt-1 break-all text-xs text-slate-400">
                                                                    {tag.id}
                                                                </p>
                                                            </div>

                                                            <div className="flex shrink-0 gap-2">
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        startEditing(
                                                                            tag,
                                                                        )
                                                                    }
                                                                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                                                                >
                                                                    Modifier
                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        handleDeleteTag(
                                                                            tag,
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
                                                                    editingTagName
                                                                }
                                                                onChange={(
                                                                    event,
                                                                ) =>
                                                                    setEditingTagName(
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
                                                                    handleUpdateTag(
                                                                        tag.id,
                                                                    )
                                                                }
                                                                disabled={
                                                                    updatingTag
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
