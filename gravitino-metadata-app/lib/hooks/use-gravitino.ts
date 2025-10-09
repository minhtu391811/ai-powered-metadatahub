"use client"

import useSWR from "swr"
import type { Catalog, Schema, Table } from "@/lib/gravitino-client"
import { getGravitinoClient } from "@/lib/gravitino-client"

const catalogsFetcher = async () => {
  const client = getGravitinoClient()
  return await client.listCatalogs()
}

const schemasFetcher = async (catalogName: string) => {
  const client = getGravitinoClient()
  return await client.listSchemas(catalogName)
}

const tablesFetcher = async ([catalogName, schemaName]: [string, string]) => {
  const client = getGravitinoClient()
  return await client.listTables(catalogName, schemaName)
}

export function useCatalogs() {
  const { data, error, isLoading, mutate } = useSWR<Catalog[]>("catalogs", catalogsFetcher)

  return {
    catalogs: data || [],
    isLoading,
    isError: error,
    mutate,
  }
}

export function useSchemas(catalogName: string | null) {
  const { data, error, isLoading, mutate } = useSWR<Schema[]>(catalogName ? `schemas-${catalogName}` : null, () =>
    schemasFetcher(catalogName!),
  )

  return {
    schemas: data || [],
    isLoading,
    isError: error,
    mutate,
  }
}

export function useTables(catalogName: string | null, schemaName: string | null) {
  const { data, error, isLoading, mutate } = useSWR<Table[]>(
    catalogName && schemaName ? `tables-${catalogName}-${schemaName}` : null,
    () => tablesFetcher([catalogName!, schemaName!]),
  )

  return {
    tables: data || [],
    isLoading,
    isError: error,
    mutate,
  }
}
