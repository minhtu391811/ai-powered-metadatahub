// Gravitino REST API Client  
// This client provides methods to interact with Apache Gravitino REST API  

export interface GravitinoConfig {
  baseUrl: string
  metalake?: string
}

export interface Catalog {
  name: string
  type: string
  provider: string
  comment?: string
  properties?: Record<string, string>
  audit?: {
    creator: string
    createTime: string
    lastModifier?: string
    lastModifiedTime?: string
  }
}

export interface Schema {
  name: string
  comment?: string
  properties?: Record<string, string>
  audit?: {
    creator: string
    createTime: string
  }
}

export interface Table {
  name: string
  comment?: string
  columns: Column[]
  properties?: Record<string, string>
  partitioning?: Partitioning[]
  sortOrders?: SortOrder[]
  distribution?: Distribution
  audit?: {
    creator: string
    createTime: string
  }
}

export interface Fileset {
  name: string;
  type: "MANAGED" | "EXTERNAL";
  comment?: string;
  storageLocation?: string;
  properties?: Record<string, string>;
  audit?: {
    creator: string;
    createTime: string;
    lastModifier?: string;
    lastModifiedTime?: string;
  };
}

export interface Topic {
  name: string;
  comment?: string;
  properties?: Record<string, string>;
  audit?: { creator: string; createTime: string; lastModifier?: string; lastModifiedTime?: string };
}

export interface Model {
  name: string;
  latestVersion: number;
  comment?: string;
  properties?: Record<string, string>;
  audit?: { creator: string; createTime: string; lastModifier?: string; lastModifiedTime?: string };
}

export interface ModelVersion {
  version: number;
  alias?: string[];
  properties?: Record<string, string>;
  comment?: string;
  audit?: { creator: string; createTime: string; lastModifier?: string; lastModifiedTime?: string };
}

export interface Column {
  name: string
  type: string
  comment?: string
  nullable: boolean
  autoIncrement?: boolean
  defaultValue?: string
}

export interface Partitioning {
  strategy: string
  fieldName: string[]
}

export interface SortOrder {
  fieldName: string[]
  ascending: boolean
}

export interface Distribution {
  strategy: string
  fieldName?: string[]
}

export interface Tag {
  name: string
  description?: string
  properties?: Record<string, string>
}

export interface Statistic {
  objectType: string;
  objectName: string;
  reserved?: string;
  modified?: string;
  audit?: { creator: string; createTime: string; lastModifier?: string; lastModifiedTime?: string };
}

export interface PolicyContent {
  customRules?: Record<string, any>;
  supportedObjectTypes: ("CATALOG" | "SCHEMA" | "TABLE" | "FILESET" | "TOPIC" | "MODEL")[];
  properties?: Record<string, any>;
}

export interface Policy {
  name: string;
  comment?: string;
  policyType: string;
  enabled: boolean;
  content: PolicyContent;
}

export interface PolicyUpdate {
  type: 'rename' | 'updateComment' | 'updateContent' | 'enable' | 'disable';
  newName?: string;
  newComment?: string;
  newContent?: PolicyContent;
}

export interface JobTemplate {
  name: string;
  jobType: 'shell' | 'spark';
  comment?: string;
  executable: string;
  arguments?: string[];
  environments?: Record<string, string>;
  customFields?: Record<string, string>;
  scripts?: string[];       // only for shell
  className?: string;       // only for spark
  jars?: string[];          // only for spark
  files?: string[];         // only for spark
  archives?: string[];      // only for spark
  configs?: Record<string, string>; // only for spark
}

export interface Job {
  id: string;
  jobTemplateName: string;
  status: string;
  startTime?: string;
  endTime?: string;
  details?: Record<string, any>;
}

export interface User {
  name: string;
  roles?: string[];
  audit?: { creator: string; createTime: string; lastModifier?: string; lastModifiedTime?: string };
}

export interface Group {
  name: string;
  roles: string[];
  audit?: { creator: string; createTime: string; lastModifier?: string; lastModifiedTime?: string };
}

export interface Role {
  name: string;
  properties: Record<string, any>;
  securableObjects: SecurableObject[];
  audit?: { creator: string; createTime: string; lastModifier?: string; lastModifiedTime?: string };
}

export interface SecurableObject {
  fullName: string;
  type: 'METALAKE' | 'CATALOG' | 'SCHEMA' | 'TABLE' | 'COLUMN' | 'FILESET' | 'TOPIC' | 'MODEL' | 'GROUP' | 'USER' | 'ROLE';
  privileges: Privilege[];
}

export interface Privilege {
  name: 'CREATE_CATALOG' | 'USE_CATALOG' | 'CREATE_SCHEMA' | 'USE_SCHEMA' | 'CREATE_TABLE' | 'MODIFY_TABLE' | 'SELECT_TABLE' | 'CREATE_FILESET' | 'WRITE_FILESET' | 'READ_FILESET' | 'CREATE_TOPIC' | 'PRODUCE_TOPIC' | 'CONSUME_TOPIC' | 'MANAGE_USERS' | 'MANAGE_GROUPS' | 'CREATE_ROLE' | 'MANAGE_GRANTS';
  condition: 'ALLOW' | 'DENY';
}

export interface BaseResponse {
  code: number
}

export interface IdentifierResponse extends BaseResponse {
  identifiers: Array<{
    namespace: string[]
    name: string
  }>
}

export interface NameListResponse extends BaseResponse {
  names: string[]
}

export interface ObjectResponse extends BaseResponse {
  metadataObjects: Array<{
    objectType: string;
    objectName: string;
  }>;
}

export interface DeleteResponse extends BaseResponse {
  dropped: boolean
}

export interface RemoveResponse extends BaseResponse {
  removed: boolean
}

export interface SetResponse extends BaseResponse {
  set: boolean
}

export interface CatalogResponse extends BaseResponse {
  catalog: Catalog
}

export interface SchemaResponse extends BaseResponse {
  schema: Schema
}

export interface TableResponse extends BaseResponse {
  table: Table
}

export interface FilesetResponse extends BaseResponse {
  fileset: Fileset
}

export interface TopicResponse extends BaseResponse {
  topic: Topic
}

export interface ModelResponse extends BaseResponse {
  model: Model
}

export interface ModelVersionResponse extends BaseResponse {
  modelVersion: ModelVersion
}

export interface StatisticListResponse extends BaseResponse {
  statistics: Statistic[]
}

export interface PartitionStatisticListResponse extends BaseResponse {
  partitionStatistics: Array<{
    partitionName: string;
    statistics: Statistic[]
  }>;
}

export interface TagResponse extends BaseResponse {
  tag: Tag
}

export interface JobTemplateResponse extends BaseResponse {
  jobTemplate: JobTemplate
}

export interface JobResponse extends BaseResponse {
  job: Job
}

export interface JobListResponse extends BaseResponse {
  jobs: Job[]
}

export interface PolicyResponse extends BaseResponse {
  policy: Policy
}

export interface PolicyListResponse extends BaseResponse {
  policies: Policy[]
}

export interface UserResponse extends BaseResponse {
  user: User
}

export interface GroupResponse extends BaseResponse {
  group: Group
}

export interface RoleResponse extends BaseResponse {
  role: Role
}

export interface PrivilegeResponse extends BaseResponse {
  role: {
    name: string;
    properties: Record<string, any>;
    securableObjects: SecurableObject[]
  }
}

export class GravitinoClient {
  private baseUrl: string
  private metalake: string

  constructor(config: GravitinoConfig) {
    this.baseUrl = config.baseUrl.replace(/\/api\/?$/, "")
    this.metalake = config.metalake || "metalake_demo"
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const apiEndpoint = endpoint.startsWith("/api") ? endpoint : `/api${endpoint}`
    const url = `${this.baseUrl}${apiEndpoint}`

    try {
      console.log("[Gravitino] API request:", url)

      const response = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/vnd.gravitino.v1+json",
          ...options?.headers,
        },
      })

      const responseText = await response.text()
      console.log("[Gravitino] Response status:", response.status)

      if (!response.ok) {
        let errorMessage = `Gravitino API error: ${response.status} ${response.statusText}`
        try {
          const errorData = JSON.parse(responseText)
          errorMessage = errorData.message || errorData.error || errorMessage
        } catch {
          errorMessage = responseText || errorMessage
        }
        throw new Error(errorMessage)
      }

      // Parse successful response as JSON  
      const data = JSON.parse(responseText) as T

      // Check response code  
      if (typeof data === "object" && data !== null && "code" in data) {
        const baseResponse = data as BaseResponse
        if (baseResponse.code !== 0) {
          throw new Error(`Gravitino API error code ${baseResponse.code}: ${JSON.stringify(data)}`)
        }
      }

      return data
    } catch (error) {
      console.error("[Gravitino] API request failed:", error)
      throw error
    }
  }

  // --- Catalogs ---
  async listCatalogs(): Promise<string[]> {
    const response = await this.request<IdentifierResponse>(
      `/metalakes/${this.metalake}/catalogs`
    )
    return response.identifiers.map((identifier) => identifier.name)
  }

  async getCatalog(catalogName: string): Promise<Catalog> {
    const response = await this.request<CatalogResponse>(`/metalakes/${this.metalake}/catalogs/${catalogName}`)
    return response.catalog
  }

  // --- Schemas ---
  async listSchemas(catalogName: string): Promise<string[]> {
    const response = await this.request<IdentifierResponse>(
      `/metalakes/${this.metalake}/catalogs/${catalogName}/schemas`
    )
    return response.identifiers.map((identifier) => identifier.name)
  }

  async getSchema(catalogName: string, schemaName: string): Promise<Schema> {
    const response = await this.request<SchemaResponse>(
      `/metalakes/${this.metalake}/catalogs/${catalogName}/schemas/${schemaName}`
    )
    return response.schema
  }

  // --- Tables ---
  async listTables(catalogName: string, schemaName: string): Promise<string[]> {
    const response = await this.request<IdentifierResponse>(
      `/metalakes/${this.metalake}/catalogs/${catalogName}/schemas/${schemaName}/tables`
    )
    return response.identifiers.map((identifier) => identifier.name)
  }

  async getTable(catalogName: string, schemaName: string, tableName: string): Promise<Table> {
    const response = await this.request<TableResponse>(
      `/metalakes/${this.metalake}/catalogs/${catalogName}/schemas/${schemaName}/tables/${tableName}`
    )
    return response.table
  }

  // --- Filesets ---
  async listFilesets(catalogName: string, schemaName: string): Promise<string[]> {
    const response = await this.request<IdentifierResponse>(
      `/metalakes/${this.metalake}/catalogs/${catalogName}/schemas/${schemaName}/filesets`
    );
    return response.identifiers.map((identifier) => identifier.name)
  }

  async getFileset(catalogName: string, schemaName: string, filesetName: string): Promise<Fileset> {
    const response = await this.request<FilesetResponse>(
      `/metalakes/${this.metalake}/catalogs/${catalogName}/schemas/${schemaName}/filesets/${filesetName}`
    );
    return response.fileset;
  }

  // --- Topics ---
  async listTopics(catalogName: string, schemaName: string): Promise<string[]> {
    const response = await this.request<IdentifierResponse>(
      `/metalakes/${this.metalake}/catalogs/${catalogName}/schemas/${schemaName}/topics`
    );
    return response.identifiers.map((identifier) => identifier.name)
  }

  async getTopic(catalogName: string, schemaName: string, topicName: string): Promise<Topic> {
    const response = await this.request<TopicResponse>(
      `/metalakes/${this.metalake}/catalogs/${catalogName}/schemas/${schemaName}/topics/${topicName}`
    );
    return response.topic;
  }

  // --- Models ---
  async listModels(catalogName: string, schemaName: string): Promise<string[]> {
    const response = await this.request<IdentifierResponse>(
      `/metalakes/${this.metalake}/catalogs/${catalogName}/schemas/${schemaName}/models`
    );
    return response.identifiers.map((identifier) => identifier.name)
  }

  async getModel(catalogName: string, schemaName: string, modelName: string): Promise<Model> {
    const response = await this.request<ModelResponse>(
      `/metalakes/${this.metalake}/catalogs/${catalogName}/schemas/${schemaName}/models/${modelName}`
    );
    return response.model;
  }

  async listModelVersions(catalogName: string, schemaName: string, modelName: string): Promise<number[]> {
    const response = await this.request<IdentifierResponse>(
      `/metalakes/${this.metalake}/catalogs/${catalogName}/schemas/${schemaName}/models/${modelName}/versions`
    );
    return response.identifiers.map((identifier) => parseInt(identifier.name, 10))
  }

  async getModelVersion(catalogName: string, schemaName: string, modelName: string, version: number): Promise<ModelVersion> {
    const response = await this.request<ModelVersionResponse>(
      `/metalakes/${this.metalake}/catalogs/${catalogName}/schemas/${schemaName}/models/${modelName}/versions/${version}`
    );
    return response.modelVersion;
  }

  async getModelVersionByAlias(catalogName: string, schemaName: string, modelName: string, alias: string): Promise<ModelVersion> {
    const response = await this.request<ModelVersionResponse>(
      `/metalakes/${this.metalake}/catalogs/${catalogName}/schemas/${schemaName}/models/${modelName}/aliases/${alias}`
    );
    return response.modelVersion;
  }

  // --- Tags ---
  async listTags(): Promise<string[]> {
    const response = await this.request<NameListResponse>(
      `/metalakes/${this.metalake}/tags`
    )
    return response.names
  }

  async getTag(tagName: string): Promise<Tag> {
    const response = await this.request<TagResponse>(
      `/metalakes/${this.metalake}/tags/${tagName}`
    )
    return response.tag
  }

  async createTag(tag: Partial<Tag>): Promise<Tag> {
    const response = await this.request<TagResponse>(
      `/metalakes/${this.metalake}/tags`,
      {
        method: "POST",
        body: JSON.stringify(tag),
      }
    )
    return response.tag
  }

  async updateTag(tagName: string, updates: Partial<Tag>): Promise<Tag> {
    const response = await this.request<TagResponse>(
      `/metalakes/${this.metalake}/tags/${tagName}`,
      {
        method: "PUT",
        body: JSON.stringify(updates),
      }
    )
    return response.tag
  }

  async deleteTag(tagName: string): Promise<boolean> {
    const resp = await this.request<BaseResponse>(
      `/metalakes/${this.metalake}/tags/${tagName}`,
      { method: "DELETE" }
    )
    return resp.code === 0
  }

  async listTagsForObject(objectType: string, objectName: string): Promise<string[]> {
    const response = await this.request<NameListResponse>(
      `/metalakes/${this.metalake}/objects/${objectType}/${objectName}/tags`
    )
    return response.names
  }

  async associateTagWithObject(objectType: string, objectName: string, tagsToAdd: string[] = [], tagsToRemove: string[] = []): Promise<boolean> {
    const response = await this.request<RemoveResponse>(
      `/metalakes/${this.metalake}/objects/${objectType}/${objectName}/tags`,
      {
        method: "POST",
        body: JSON.stringify({ tagsToAdd, tagsToRemove }),
      }
    )
    return response.removed === true;
  }

  async getTagForObject(objectType: string, objectName: string, tagName: string): Promise<Tag> {
    const response = await this.request<TagResponse>(
      `/metalakes/${this.metalake}/objects/${objectType}/${objectName}/tags/${tagName}`
    )
    return response.tag
  }

  async listObjectsForTag(tagName: string): Promise<Array<{ objectType: string; objectName: string }>> {
    const response = await this.request<ObjectResponse>(
      `/metalakes/${this.metalake}/tags/${tagName}/objects`
    )
    return response.metadataObjects.map(object => ({
      objectType: object.objectType,
      objectName: object.objectName,
    }))
  }

  // --- Statistics ---
  async listStatistics(objectType: string, objectName: string): Promise<Statistic[]> {
    const response = await this.request<StatisticListResponse>(
      `/metalakes/${this.metalake}/objects/${objectType}/${objectName}/statistics`
    )
    return response.statistics
  }

  async listPartitionStatistics(objectType: string, objectName: string): Promise<Array<{ partitionName: string; statistics: Record<string, any>; }>> {
    const response = await this.request<PartitionStatisticListResponse>(
      `/metalakes/${this.metalake}/objects/${objectType}/${objectName}/statistics/partitions`
    )
    return response.partitionStatistics
  }

  // --- Policies ---

  async createPolicy(policy: Policy): Promise<Policy> {
    const response = await this.request<PolicyResponse>(
      `/metalakes/${this.metalake}/policies`,
      {
        method: "POST",
        body: JSON.stringify(policy),
      }
    );
    return response.policy;
  }

  async listPolicies(details = false): Promise<string[]> {
    const response = await this.request<NameListResponse>(
      `/metalakes/${this.metalake}/policies`
    );
    return response.names;
  }

  async getPolicy(policyName: string) {
    const response = await this.request<PolicyResponse>(
      `/metalakes/${this.metalake}/policies/${policyName}`
    );
    return response.policy;
  }

  async updatePolicy(policyName: string, changes: PolicyUpdate[]): Promise<Policy> {
    const response = await this.request<PolicyResponse>(
      `/metalakes/${this.metalake}/policies/${policyName}`,
      {
        method: "PATCH",
        body: JSON.stringify({ changes }),
      }
    );
    return response.policy;
  }

  async enablePolicy(policyName: string, enabled: boolean) {
    const response = await this.request<BaseResponse>(
      `/metalakes/${this.metalake}/policies/${policyName}/status`,
      {
        method: "PATCH",
        body: JSON.stringify({ enable: enabled }),
      }
    );
    return response.code === 0;
  }

  async deletePolicy(policyName: string): Promise<boolean> {
    const response = await this.request<DeleteResponse>(
      `/metalakes/${this.metalake}/policies/${policyName}`, 
      {
        method: "DELETE",
      }
    );
    return response.dropped === true;
  }

  async associatePolicies(objectType: string, objectName: string, policiesToAdd: string[], policiesToRemove: string[] = []): Promise<boolean> {
    const response = await this.request<BaseResponse>(
      `/metalakes/${this.metalake}/objects/${objectType}/${objectName}/policies`,
      {
        method: "POST",
        body: JSON.stringify({ policiesToAdd, policiesToRemove }),
      }
    );
    return response.code === 0;
  }

  async listObjectPolicies(objectType: string, objectName: string, details = false): Promise<string[]> {
    const response = await this.request<NameListResponse>(
      `/metalakes/${this.metalake}/objects/${objectType}/${objectName}/policies`
    );
    return response.names;
  }

  async getObjectPolicy(metalake: string, objectType: string, objectName: string, policyName: string): Promise<Policy> {
    const response = await this.request<PolicyResponse>(
      `/metalakes/${metalake}/objects/${objectType}/${objectName}/policies/${policyName}`
    );
    return response.policy;
  }

  async listPolicyObjects(metalake: string, policyName: string): Promise<Array<{ objectType: string; objectName: string }>> {
    const response = await this.request<ObjectResponse>(
      `/metalakes/${metalake}/policies/${policyName}/objects`
    );
    return response.metadataObjects.map(object => ({
      objectType: object.objectType,
      objectName: object.objectName,
    }));
  }

  // --- Job Templates ---
  async registerJobTemplate(template: JobTemplate): Promise<JobTemplate> {
    const response = await this.request<JobTemplateResponse>(
      `/metalakes/${this.metalake}/jobs/templates`,
      { method: 'POST', body: JSON.stringify({ jobTemplate: template }) }
    );
    return response.jobTemplate;
  }

  async listJobTemplates(details = false): Promise<string[]> {
    const response = await this.request<NameListResponse>(
      `/metalakes/${this.metalake}/jobs/templates`
    );
    return response.names;
  }

  async getJobTemplate(templateName: string): Promise<JobTemplate> {
    const response = await this.request<JobTemplateResponse>(
      `/metalakes/${this.metalake}/jobs/templates/${templateName}`
    );
    return response.jobTemplate;
  }

  async deleteJobTemplate(templateName: string): Promise<boolean> {
    const response = await this.request<BaseResponse>(
      `/metalakes/${this.metalake}/jobs/templates/${templateName}`,
      { method: 'DELETE' }
    );
    return response.code === 0;
  }

  // --- Jobs ---
  async listJobs(): Promise<Job[]> {
    const response = await this.request<JobListResponse>(
      `/metalakes/${this.metalake}/jobs/runs`
    )
    return response.jobs
  }

  async getJob(jobId: string): Promise<Job> {
    const response = await this.request<JobResponse>(
      `/metalakes/${this.metalake}/jobs/${jobId}`
    )
    return response.job
  }

  async runJob(templateName: string, parameters: Record<string, any>): Promise<Job> {
    const response = await this.request<JobResponse>(
      `/metalakes/${this.metalake}/jobs/runs`,
      { method: 'POST', body: JSON.stringify({ jobTemplateName: templateName, jobConf: parameters }) }
    );
    return response.job;
  }

  async cancelJob(jobId: string): Promise<boolean> {
    const response = await this.request<BaseResponse>(
      `/metalakes/${this.metalake}/jobs/runs/${jobId}`,
      { method: 'POST' }
    );
    return response.code === 0;
  }

  // User Operations
  async addUser(name: string): Promise<User> {
    const response = await this.request<UserResponse>(
      `/metalakes/${this.metalake}/users`, 
      {
        method: 'POST',
        body: JSON.stringify({ name }),
      }
    );
    return response.user;
  }

  async listUsers(details = false): Promise<string[]> {
    const response = await this.request<NameListResponse>(
      `/metalakes/${this.metalake}/users`
    );
    return response.names;
  }

  async getUser(name: string): Promise<User> {
    const response = await this.request<UserResponse>(
      `/metalakes/${this.metalake}/users/${name}`
    );
    return response.user;
  }

  async deleteUser(name: string): Promise<boolean> {
    const response = await this.request<BaseResponse>(
      `/metalakes/${this.metalake}/users/${name}`,
      { method: 'DELETE' }
    );
    return response.code === 0;
  }

  // Group Operations
  async addGroup(name: string): Promise<Group> {
    const response = await this.request<GroupResponse>(
      `/metalakes/${this.metalake}/groups`, 
      {
        method: 'POST',
        body: JSON.stringify({ name }),
      }
    );
    return response.group;
  }

  async listGroups(details = false): Promise<string[]> {
    const response = await this.request<NameListResponse>(
      `/metalakes/${this.metalake}/groups`
    );
    return response.names;
  }

  async getGroup(name: string): Promise<Group> {
    const response = await this.request<GroupResponse>(
      `/metalakes/${this.metalake}/groups/${name}`
    );
    return response.group;
  }

  async deleteGroup(name: string): Promise<boolean> {
    const response = await this.request<BaseResponse>(
      `/metalakes/${this.metalake}/groups/${name}`,
      { method: 'DELETE' }
    );
    return response.code === 0;
  }

  // Role Operations
  async createRole(role: { name: string; properties?: Record<string, any>; securableObjects?: SecurableObject[] }): Promise<Role> {
    const response = await this.request<RoleResponse>(
      `/metalakes/${this.metalake}/roles`,
      {
        method: 'POST',
        body: JSON.stringify({
          name: role.name,
          properties: role.properties || {},
          securableObjects: role.securableObjects || [],
        }),
      }
    );
    return response.role;
  }

  async listRoles(): Promise<string[]> {
    const response = await this.request<NameListResponse>(
      `/metalakes/${this.metalake}/roles`
    );
    return response.names;
  }

  async getRole(name: string): Promise<Role> {
    const response = await this.request<RoleResponse>(
      `/metalakes/${this.metalake}/roles/${name}`
    );
    return response.role;
  }

  async deleteRole(name: string): Promise<boolean> {
    const response = await this.request<BaseResponse>(
      `/metalakes/${this.metalake}/roles/${name}`,
      { method: 'DELETE' }
    );
    return response.code === 0;
  }

  // Permission Operations
  async grantRoleToUser(userName: string, roleNames: string[]): Promise<User> {
    const response = await this.request<UserResponse>(
      `/metalakes/${this.metalake}/permissions/users/${userName}/grant`, 
      {
        method: 'PUT',
        body: JSON.stringify({ roleNames }),
      }
    );
    return response.user;
  }

  async revokeRoleFromUser(userName: string, roleNames: string[]): Promise<User> {
    const response = await this.request<UserResponse>(
      `/metalakes/${this.metalake}/permissions/users/${userName}/revoke`, 
      {
        method: 'PUT',
        body: JSON.stringify({ roleNames }),
      }
    );
    return response.user;
  }

  async grantRoleToGroup(groupName: string, roleNames: string[]): Promise<Group> {
    const response = await this.request<GroupResponse>(
      `/metalakes/${this.metalake}/permissions/groups/${groupName}/grant`, 
      {
        method: 'PUT',
        body: JSON.stringify({ roleNames }),
      }
    );
    return response.group;
  }

  async revokeRoleFromGroup(groupName: string, roleNames: string[]): Promise<Group> {
    const response = await this.request<GroupResponse>(
      `/metalakes/${this.metalake}/permissions/groups/${groupName}/revoke`, 
      {
        method: 'PUT',
        body: JSON.stringify({ roleNames }),
      }
    );
    return response.group;
  }

  async grantPrivilegeToRole(roleName: string, object: SecurableObject, privileges: Privilege[]): Promise<Role> {
    const response = await this.request<RoleResponse>(
      `/metalakes/${this.metalake}/permissions/roles/${roleName}/${object.type}/${object.fullName}/grant`, 
      {
        method: 'PUT',
        body: JSON.stringify({ privileges }),
      }
    );
    return response.role;
  }

  async revokePrivilegeToRole(roleName: string, object: SecurableObject, privileges: Privilege[]): Promise<Role> {
    const response = await this.request<RoleResponse>(
      `/metalakes/${this.metalake}/permissions/roles/${roleName}/${object.type}/${object.fullName}/revoke`, 
      {
        method: 'PUT',
        body: JSON.stringify({ privileges }),
      }
    );
    return response.role;
  }

  // Ownership Operations
  async getOwner(objectType: string, objectName: string): Promise<User | Group> {
    const response = await this.request<{ owner: User | Group }>(
      `/metalakes/${this.metalake}/owners/${objectType}/${objectName}`
    );
    return response.owner;
  }

  async setOwner(objectType: string, objectName: string, ownerName: string, ownerType: string): Promise<boolean> {
    const response = await this.request<SetResponse>(
      `/metalakes/${this.metalake}/owners/${objectType}/${objectName}`,
      {
        method: 'PUT',
        body: JSON.stringify({ name: ownerName, type: ownerType }),
      }
    );
    return response.set === true;
  }
}

// Singleton instance  
let gravitinoClient: GravitinoClient | null = null

export function getGravitinoClient(): GravitinoClient {
  if (!gravitinoClient) {
    gravitinoClient = new GravitinoClient({
      baseUrl: process.env.GRAVITINO_API_URL || "http://localhost:8090",
      metalake: process.env.GRAVITINO_METALAKE || "metalake_demo",
    })
  }
  return gravitinoClient
}