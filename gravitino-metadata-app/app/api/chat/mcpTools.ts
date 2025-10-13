import { tool } from "ai"
import { z } from "zod"

// Cấu hình MCP server - sử dụng internal proxy để bypass CORS
const MCP_BASE_URL = "/api/mcp-proxy"

// Helper gọi MCP tool
async function callMCP<TInput extends object, TOutput>(toolName: string, input: TInput): Promise<TOutput> {
  try {
    const url = MCP_BASE_URL
    const resp = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ toolName, input }),
      // Add timeout
      signal: AbortSignal.timeout(10000), // 10 second timeout
    })
    
    if (!resp.ok) {
      const bodyText = await resp.text()
      console.error(`MCP tool ${toolName} failed:`, resp.status, resp.statusText, bodyText)
      throw new Error(`MCP tool ${toolName} failed: ${resp.status} ${resp.statusText} — ${bodyText}`)
    }
    
    const json = await resp.json()
    return json as TOutput
  } catch (error) {
    console.error(`Error calling MCP tool ${toolName}:`, error)
    if (error instanceof Error) {
      if (error.name === 'TimeoutError') {
        throw new Error(`MCP tool ${toolName} timed out after 10 seconds`)
      }
      throw new Error(`MCP tool ${toolName} error: ${error.message}`)
    }
    throw new Error(`MCP tool ${toolName} failed with unknown error`)
  }
}

// Định nghĩa tool wrappers

export const getListOfCatalogsTool = tool({
  description: "Retrieve a list of all catalogs in the system",
  inputSchema: z.object({}), // không cần input
  execute: async (_input) => {
    return await callMCP<{}, { catalogs: Array<{ name: string; type: string; schemas: number; tables: number }> }>(
      "mcp_gravitino_get_list_of_catalogs",
      {},
    )
  },
})

export const getListOfSchemasTool = tool({
  description: "Retrieve a list of schemas in a specific catalog",
  inputSchema: z.object({
    catalog: z.string().describe("The catalog name"),
  }),
  execute: async ({ catalog }) => {
    return await callMCP<
      { catalog: string },
      { catalog: string; schemas: Array<{ name: string; tables: number; views?: number }> }
    >("mcp_gravitino_get_list_of_schemas", { catalog })
  },
})

export const getListOfTablesTool = tool({
  description: "Retrieve a list of tables in a specific catalog and schema",
  inputSchema: z.object({
    catalog: z.string().describe("The catalog name"),
    schema: z.string().describe("The schema name"),
  }),
  execute: async ({ catalog, schema }) => {
    return await callMCP<
      { catalog: string; schema: string },
      { catalog: string; schema: string; tables: Array<{ name: string }> }
    >("mcp_gravitino_get_list_of_tables", { catalog, schema })
  },
})

export const getTableMetadataDetailsTool = tool({
  description: "Retrieve comprehensive metadata details for a specific table",
  inputSchema: z.object({
    catalog: z.string().describe("Catalog name"),
    schema: z.string().describe("Schema name"),
    table: z.string().describe("Table name"),
  }),
  execute: async ({ catalog, schema, table }) => {
    return await callMCP<
      { catalog: string; schema: string; table: string },
      { catalog: string; schema: string; table: string; columns: Array<unknown>; metadata?: object }
    >("mcp_gravitino_get_table_metadata_details", { catalog, schema, table })
  },
})

export const listOfModelsTool = tool({
  description: "Retrieve a list of models within a specific catalog and schema",
  inputSchema: z.object({
    catalog: z.string().describe("Catalog name"),
    schema: z.string().describe("Schema name"),
  }),
  execute: async ({ catalog, schema }) => {
    return await callMCP<
      { catalog: string; schema: string },
      { catalog: string; schema: string; models: Array<{ name: string }> }
    >("mcp_gravitino_list_of_models", { catalog, schema })
  },
})

export const loadModelTool = tool({
  description: "Retrieve comprehensive metadata details for a specific model",
  inputSchema: z.object({
    catalog: z.string(),
    schema: z.string(),
    model: z.string(),
  }),
  execute: async ({ catalog, schema, model }) => {
    return await callMCP<
      { catalog: string; schema: string; model: string },
      { catalog: string; schema: string; model: string; metadata: object }
    >("mcp_gravitino_load_model", { catalog, schema, model })
  },
})

export const listModelVersionsTool = tool({
  description: "Retrieve a list of versions for a specific model",
  inputSchema: z.object({
    catalog: z.string(),
    schema: z.string(),
    model: z.string(),
  }),
  execute: async ({ catalog, schema, model }) => {
    return await callMCP<
      { catalog: string; schema: string; model: string },
      { catalog: string; schema: string; model: string; versions: Array<string> }
    >("mcp_gravitino_list_model_versions", { catalog, schema, model })
  },
})

export const loadModelVersionTool = tool({
  description: "Retrieve comprehensive metadata details for a specific model version",
  inputSchema: z.object({
    catalog: z.string(),
    schema: z.string(),
    model: z.string(),
    version: z.string(),
  }),
  execute: async ({ catalog, schema, model, version }) => {
    return await callMCP<
      { catalog: string; schema: string; model: string; version: string },
      { catalog: string; schema: string; model: string; version: string; metadata: object }
    >("mcp_gravitino_load_model_version", { catalog, schema, model, version })
  },
})

export const loadModelVersionByAliasTool = tool({
  description: "Retrieve metadata for a specific model version by alias",
  inputSchema: z.object({
    catalog: z.string(),
    schema: z.string(),
    model: z.string(),
    alias: z.string(),
  }),
  execute: async ({ catalog, schema, model, alias }) => {
    return await callMCP<
      { catalog: string; schema: string; model: string; alias: string },
      { catalog: string; schema: string; model: string; version: string; metadata: object }
    >("mcp_gravitino_load_model_version_by_alias", { catalog, schema, model, alias })
  },
})

export const metadataTypeToFullnameFormatsTool = tool({
  description: "Retrieve the metadata type to fullname formats mapping",
  inputSchema: z.object({}),
  execute: async (_input) => {
    return await callMCP<{}, { mappings: Record<string, string> }>("mcp_gravitino_metadata_type_to_fullname_formats", {})
  },
})

export const listOfTopicsTool = tool({
  description: "Retrieve a list of topics within a specific catalog and schema",
  inputSchema: z.object({
    catalog: z.string(),
    schema: z.string(),
  }),
  execute: async ({ catalog, schema }) => {
    return await callMCP<
      { catalog: string; schema: string },
      { catalog: string; schema: string; topics: Array<{ name: string }> }
    >("mcp_gravitino_list_of_topics", { catalog, schema })
  },
})

export const loadTopicTool = tool({
  description: "Retrieve metadata details for a specific topic",
  inputSchema: z.object({
    catalog: z.string(),
    schema: z.string(),
    topic: z.string(),
  }),
  execute: async ({ catalog, schema, topic }) => {
    return await callMCP<
      { catalog: string; schema: string; topic: string },
      { catalog: string; schema: string; topic: string; metadata: object }
    >("mcp_gravitino_load_topic", { catalog, schema, topic })
  },
})

export const listOfFilesetsTool = tool({
  description: "Retrieve a list of filesets within a specific catalog and schema",
  inputSchema: z.object({
    catalog: z.string(),
    schema: z.string(),
  }),
  execute: async ({ catalog, schema }) => {
    return await callMCP<
      { catalog: string; schema: string },
      { catalog: string; schema: string; filesets: Array<{ name: string }> }
    >("mcp_gravitino_list_of_filesets", { catalog, schema })
  },
})

export const loadFilesetTool = tool({
  description: "Retrieve metadata details for a specific fileset",
  inputSchema: z.object({
    catalog: z.string(),
    schema: z.string(),
    fileset: z.string(),
  }),
  execute: async ({ catalog, schema, fileset }) => {
    return await callMCP<
      { catalog: string; schema: string; fileset: string },
      { catalog: string; schema: string; fileset: string; metadata: object }
    >("mcp_gravitino_load_fileset", { catalog, schema, fileset })
  },
})

export const listFilesInFilesetTool = tool({
  description: "Retrieve a list of files within a specific fileset",
  inputSchema: z.object({
    catalog: z.string(),
    schema: z.string(),
    fileset: z.string(),
  }),
  execute: async ({ catalog, schema, fileset }) => {
    return await callMCP<
      { catalog: string; schema: string; fileset: string },
      { catalog: string; schema: string; files: Array<string> }
    >("mcp_gravitino_list_files_in_fileset", { catalog, schema, fileset })
  },
})

export const listOfJobsTool = tool({
  description: "Retrieve a list of jobs",
  inputSchema: z.object({}),
  execute: async (_input) => {
    return await callMCP<{}, { jobs: Array<{ id: string; name: string }> }>("mcp_gravitino_list_of_jobs", {})
  },
})

export const getJobByIdTool = tool({
  description: "Retrieve a job by its ID",
  inputSchema: z.object({
    job_id: z.string(),
  }),
  execute: async ({ job_id }) => {
    return await callMCP<{ job_id: string }, { id: string; name: string; metadata: object }>("mcp_gravitino_get_job_by_id", {
      job_id,
    })
  },
})

export const listOfJobTemplatesTool = tool({
  description: "Retrieve a list of job templates",
  inputSchema: z.object({}),
  execute: async (_input) => {
    return await callMCP<{}, { templates: Array<{ name: string }> }>("mcp_gravitino_list_of_job_templates", {})
  },
})

export const getJobTemplateByNameTool = tool({
  description: "Retrieve a job template by its name",
  inputSchema: z.object({
    template_name: z.string(),
  }),
  execute: async ({ template_name }) => {
    return await callMCP<{ template_name: string }, { name: string; metadata: object }>("mcp_gravitino_get_job_template_by_name", {
      template_name,
    })
  },
})

export const runJobTool = tool({
  description: "Run a job with specified parameters",
  inputSchema: z.object({
    job_id: z.string(),
    parameters: z.record(z.string(), z.any()).optional(),
  }),
  execute: async ({ job_id, parameters }) => {
    return await callMCP<
      { job_id: string; parameters?: Record<string, unknown> },
      { job_id: string; status: string; result?: any }
    >("mcp_gravitino_run_job", { job_id, parameters })
  },
})

export const cancelJobTool = tool({
  description: "Cancel a running job by its ID",
  inputSchema: z.object({
    job_id: z.string(),
  }),
  execute: async ({ job_id }) => {
    return await callMCP<{ job_id: string }, { job_id: string; status: string }>("mcp_gravitino_cancel_job", { job_id })
  },
})

export const getTagByNameTool = tool({
  description: "Retrieve a tag by name",
  inputSchema: z.object({
    tag_name: z.string(),
  }),
  execute: async ({ tag_name }) => {
    return await callMCP<{ tag_name: string }, { tag_name: string; metadata: object }>("mcp_gravitino_get_tag_by_name", { tag_name })
  },
})

export const listOfTagsTool = tool({
  description: "Retrieve a list of tags",
  inputSchema: z.object({}),
  execute: async (_input) => {
    return await callMCP<{}, { tags: Array<{ name: string }> }>("mcp_gravitino_list_of_tags", {})
  },
})

export const listTagsForMetadataTool = tool({
  description: "Retrieve tags for a metadata item",
  inputSchema: z.object({
    metadata_id: z.string(),
  }),
  execute: async ({ metadata_id }) => {
    return await callMCP<{ metadata_id: string }, { metadata_id: string; tags: Array<string> }>(
      "mcp_gravitino_list_tags_for_metadata",
      { metadata_id },
    )
  },
})

export const listMetadataByTagTool = tool({
  description: "Retrieve metadata items associated with a tag",
  inputSchema: z.object({
    tag_name: z.string(),
  }),
  execute: async ({ tag_name }) => {
    return await callMCP<{ tag_name: string }, { tag_name: string; metadata_items: Array<{ metadata_id: string }> }>(
      "mcp_gravitino_list_metadata_by_tag",
      { tag_name },
    )
  },
})

export const associateTagWithMetadataTool = tool({
  description: "Associate a tag with a metadata item",
  inputSchema: z.object({
    metadata_id: z.string(),
    tag_name: z.string(),
  }),
  execute: async ({ metadata_id, tag_name }) => {
    return await callMCP<{ metadata_id: string; tag_name: string }, { success: boolean }>(
      "mcp_gravitino_associate_tag_with_metadata",
      { metadata_id, tag_name },
    )
  },
})

export const disassociateTagFromMetadataTool = tool({
  description: "Disassociate a tag from a metadata item",
  inputSchema: z.object({
    metadata_id: z.string(),
    tag_name: z.string(),
  }),
  execute: async ({ metadata_id, tag_name }) => {
    return await callMCP<{ metadata_id: string; tag_name: string }, { success: boolean }>(
      "mcp_gravitino_disassociate_tag_from_metadata",
      { metadata_id, tag_name },
    )
  },
})

export const listStatisticsForMetadataTool = tool({
  description: "Retrieve statistics for a metadata item",
  inputSchema: z.object({
    metadata_id: z.string(),
  }),
  execute: async ({ metadata_id }) => {
    return await callMCP<{ metadata_id: string }, { metadata_id: string; statistics: any }>(
      "mcp_gravitino_list_statistics_for_metadata",
      { metadata_id },
    )
  },
})

export const listStatisticsForPartitionTool = tool({
  description: "Retrieve statistics for a partition",
  inputSchema: z.object({
    metadata_id: z.string(),
    partition: z.string(),
  }),
  execute: async ({ metadata_id, partition }) => {
    return await callMCP<
      { metadata_id: string; partition: string },
      { metadata_id: string; partition: string; statistics: any }
    >("mcp_gravitino_list_statistics_for_partition", { metadata_id, partition })
  },
})

export const getListOfPoliciesTool = tool({
  description: "Retrieve a list of policies in the system",
  inputSchema: z.object({}),
  execute: async (_input) => {
    return await callMCP<{}, { policies: Array<{ name: string }> }>("mcp_gravitino_get_list_of_policies", {})
  },
})

export const getPolicyDetailInformationTool = tool({
  description: "Retrieve detailed information for a policy by name",
  inputSchema: z.object({
    policy_name: z.string(),
  }),
  execute: async ({ policy_name }) => {
    return await callMCP<{ policy_name: string }, { name: string; metadata: object }>("mcp_gravitino_get_policy_detail_information", {
      policy_name,
    })
  },
})

export const listPoliciesForMetadataTool = tool({
  description: "List all policies associated with a specific metadata item",
  inputSchema: z.object({
    metadata_id: z.string(),
  }),
  execute: async ({ metadata_id }) => {
    return await callMCP<{ metadata_id: string }, { metadata_id: string; policies: Array<string> }>(
      "mcp_gravitino_list_policies_for_metadata",
      { metadata_id },
    )
  },
})

export const listMetadataByPolicyTool = tool({
  description: "List all metadata items associated with a policy",
  inputSchema: z.object({
    policy_name: z.string(),
  }),
  execute: async ({ policy_name }) => {
    return await callMCP<
      { policy_name: string },
      { policy_name: string; metadata_items: Array<{ metadata_id: string }> }
    >("mcp_gravitino_list_metadata_by_policy", { policy_name })
  },
})

export const getPolicyForMetadataTool = tool({
  description: "Get policy associated with a specific metadata item",
  inputSchema: z.object({
    metadata_id: z.string(),
  }),
  execute: async ({ metadata_id }) => {
    return await callMCP<{ metadata_id: string }, { metadata_id: string; policy: string | null }>(
      "mcp_gravitino_get_policy_for_metadata",
      { metadata_id },
    )
  },
})


// Xuất tất cả tools trong một object dễ dùng
export const tools = {
  getListOfCatalogs: getListOfCatalogsTool,
  getListOfSchemas: getListOfSchemasTool,
  getListOfTables: getListOfTablesTool,
  getTableMetadataDetails: getTableMetadataDetailsTool,
  listOfModels: listOfModelsTool,
  loadModel: loadModelTool,
  listModelVersions: listModelVersionsTool,
  loadModelVersion: loadModelVersionTool,
  loadModelVersionByAlias: loadModelVersionByAliasTool,
  metadataTypeToFullnameFormats: metadataTypeToFullnameFormatsTool,
  listOfTopics: listOfTopicsTool,
  loadTopic: loadTopicTool,
  listOfFilesets: listOfFilesetsTool,
  loadFileset: loadFilesetTool,
  listFilesInFileset: listFilesInFilesetTool,
  listOfJobs: listOfJobsTool,
  getJobById: getJobByIdTool,
  listOfJobTemplates: listOfJobTemplatesTool,
  getJobTemplateByName: getJobTemplateByNameTool,
  runJob: runJobTool,
  cancelJob: cancelJobTool,
  getTagByName: getTagByNameTool,
  listOfTags: listOfTagsTool,
  listTagsForMetadata: listTagsForMetadataTool,
  listMetadataByTag: listMetadataByTagTool,
  associateTagWithMetadata: associateTagWithMetadataTool,
  disassociateTagFromMetadata: disassociateTagFromMetadataTool,
  listStatisticsForMetadata: listStatisticsForMetadataTool,
  listStatisticsForPartition: listStatisticsForPartitionTool,
  getListOfPolicies: getListOfPoliciesTool,
  getPolicyDetailInformation: getPolicyDetailInformationTool,
  listPoliciesForMetadata: listPoliciesForMetadataTool,
  listMetadataByPolicy: listMetadataByPolicyTool,
  getPolicyForMetadata: getPolicyForMetadataTool,
}
