"use client";

import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import { ApolloProvider } from "@apollo/client/react";
import { ReactNode } from "react";

const graphqlUrl =
    process.env.NEXT_PUBLIC_GRAPHQL_URL ?? "http://localhost:3000/graphql";

const client = new ApolloClient({
    link: new HttpLink({
        uri: graphqlUrl,
    }),
    cache: new InMemoryCache(),
});

export function Providers({ children }: { children: ReactNode }) {
    return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
