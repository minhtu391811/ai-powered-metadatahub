"use client"

import { useState, useEffect } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus, MoreVertical, Tags, Shield, BarChart3, Trash2, Edit, Eye, PlusCircle, CheckCircle, AlertCircle, ToggleLeft, ToggleRight, Copy } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { getGravitinoClient, Tag, Policy, Statistic, TagUpdate, PolicyUpdate } from "@/lib/gravitino-client"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function GovernancePage() {
  const gravitino = getGravitinoClient()
  
  // State for tags
  const [tags, setTags] = useState<Tag[]>([])
  const [tagSearchQuery, setTagSearchQuery] = useState("")
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null)
  const [tagObjects, setTagObjects] = useState<Array<{objectType: string, objectName: string}>>([])
  const [isTagDialogOpen, setIsTagDialogOpen] = useState(false)
  const [isTagEditDialogOpen, setIsTagEditDialogOpen] = useState(false)
  const [isTagAssociateDialogOpen, setIsTagAssociateDialogOpen] = useState(false)
  const [isTagViewDialogOpen, setIsTagViewDialogOpen] = useState(false)
  const [isDeleteTagDialogOpen, setIsDeleteTagDialogOpen] = useState(false)
  const [tagFormData, setTagFormData] = useState<Partial<Tag>>({})
  const [tagUpdates, setTagUpdates] = useState<TagUpdate[]>([])
  const [tagLoading, setTagLoading] = useState(false)
  const [tagError, setTagError] = useState<string | null>(null)

  // UI form state for editing/associating tags
  const [tagRenameInput, setTagRenameInput] = useState("")
  const [tagCommentInput, setTagCommentInput] = useState("")
  const [tagPropKeyInput, setTagPropKeyInput] = useState("")
  const [tagPropValInput, setTagPropValInput] = useState("")
  const [tagPropRemoveKeyInput, setTagPropRemoveKeyInput] = useState("")
  const [editableProperties, setEditableProperties] = useState<Array<{ key: string; value: string }>>([])
  const [originalProperties, setOriginalProperties] = useState<Record<string, string>>({})

  const [associateObjectType, setAssociateObjectType] = useState<string>("TABLE")
  const [associateObjectName, setAssociateObjectName] = useState<string>("")
  const [tagNameToDelete, setTagNameToDelete] = useState<string | null>(null)

  // Update-type builder state
  const [updateType, setUpdateType] = useState<TagUpdate["@type"]>("rename")
  const [builderNewName, setBuilderNewName] = useState("")
  const [builderNewComment, setBuilderNewComment] = useState("")
  const [builderPropKey, setBuilderPropKey] = useState("")
  const [builderPropValue, setBuilderPropValue] = useState("")

  // State for policies
  const [policies, setPolicies] = useState<Policy[]>([])
  const [policySearchQuery, setPolicySearchQuery] = useState("")
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null)
  const [policyObjects, setPolicyObjects] = useState<Array<{objectType: string, objectName: string}>>([])
  const [isPolicyDialogOpen, setIsPolicyDialogOpen] = useState(false)
  const [isPolicyEditDialogOpen, setIsPolicyEditDialogOpen] = useState(false)
  const [isPolicyViewDialogOpen, setIsPolicyViewDialogOpen] = useState(false)
  const [isPolicyAssociateDialogOpen, setIsPolicyAssociateDialogOpen] = useState(false)
  const [policyFormData, setPolicyFormData] = useState<Partial<Policy>>({})
  const [policyEnabled, setPolicyEnabled] = useState<boolean>(true)
  const [policyProps, setPolicyProps] = useState<Array<{ key: string; value: string }>>([])
  const [policyCustomRules, setPolicyCustomRules] = useState<string>("{}")
  const [policyUpdates, setPolicyUpdates] = useState<PolicyUpdate[]>([])
  const [policyLoading, setPolicyLoading] = useState(false)
  const [policyError, setPolicyError] = useState<string | null>(null)
  const [policyEditName, setPolicyEditName] = useState<string>("")
  const [policyEditComment, setPolicyEditComment] = useState<string>("")
  const [policyEditType, setPolicyEditType] = useState<string>("custom")
  const [policyEditProps, setPolicyEditProps] = useState<Array<{ key: string; value: string }>>([])
  const [policyEditCustomRules, setPolicyEditCustomRules] = useState<string>("{}")
  const [associatePolicyObjectType, setAssociatePolicyObjectType] = useState<string>("TABLE")
  const [associatePolicyObjectName, setAssociatePolicyObjectName] = useState<string>("")

  // State for statistics
  const [statistics, setStatistics] = useState<Statistic[]>([])
  const [statSearchQuery, setStatSearchQuery] = useState("")
  const [selectedStatObject, setSelectedStatObject] = useState<{objectType: string, objectName: string} | null>(null)
  const [isStatDialogOpen, setIsStatDialogOpen] = useState(false)
  const [isStatCreateDialogOpen, setIsStatCreateDialogOpen] = useState(false)
  const [statFormData, setStatFormData] = useState<Record<string, any>>({})
  const [statCreateFormData, setStatCreateFormData] = useState<{objectType: string, objectName: string, statistics: Array<{name: string, value: string}>}>({objectType: 'TABLE', objectName: '', statistics: [{name: '', value: ''}]})
  const [statPartitionCreateFormData, setStatPartitionCreateFormData] = useState<{objectType: string, objectName: string, partitions: Array<{partitionName: string, statistics: Array<{name: string, value: string}>}>}>({objectType: 'TABLE', objectName: '', partitions: [{partitionName: '', statistics: [{name: '', value: ''}]}]})
  const [statLoading, setStatLoading] = useState(false)
  const [statError, setStatError] = useState<string | null>(null)
  const [partitionStats, setPartitionStats] = useState<Array<{ objectType: string; objectName: string; partitionName: string; statistics: Array<{ name?: string; value?: string; reserved?: string; modified?: string; audit?: { creator: string; createTime: string; lastModifier?: string; lastModifiedTime?: string } }> }>>([])
  const [statTab, setStatTab] = useState<'object' | 'partition'>("object")
  const [statPartitionSearchQuery, setStatPartitionSearchQuery] = useState("")
  const [selectedStatPartitionObject, setSelectedStatPartitionObject] = useState<{objectType: string, objectName: string} | null>(null)
  const [isStatPartitionDialogOpen, setIsStatPartitionDialogOpen] = useState(false)
  const [statPartitionFormData, setStatPartitionFormData] = useState<{partitionName: string; updates: Record<string, any>}>({partitionName: "", updates: {}})
  const [statPartitionLoading, setStatPartitionLoading] = useState(false)
  const [statPartitionError, setStatPartitionError] = useState<string | null>(null)
  const [isStatLoadDialogOpen, setIsStatLoadDialogOpen] = useState(false)
  const [isStatPartitionLoadDialogOpen, setIsStatPartitionLoadDialogOpen] = useState(false)
  const [statLoadFormData, setStatLoadFormData] = useState<{objectType: string, objectName: string}>({objectType: 'TABLE', objectName: ''})
  const [statPartitionLoadFormData, setStatPartitionLoadFormData] = useState<{objectType: string, objectName: string}>({objectType: 'TABLE', objectName: ''})
  const [isStatViewDialogOpen, setIsStatViewDialogOpen] = useState(false)
  const [isStatPartitionViewDialogOpen, setIsStatPartitionViewDialogOpen] = useState(false)

  // State for additional metrics
  const [totalTagAssociations, setTotalTagAssociations] = useState(0)
  const [totalPolicyAssociations, setTotalPolicyAssociations] = useState(0)

  // Load tags
  const loadTags = async () => {
    try {
      setTagLoading(true)
      setTagError(null)
      const tagNames = await gravitino.listTags()
      const tagDetails = await Promise.all(
        tagNames.map(name => gravitino.getTag(name))
      )
      setTags(tagDetails)
      
      // Calculate total tag associations
      let totalAssociations = 0
      for (const tagName of tagNames) {
        try {
          const objects = await gravitino.listObjectsForTag(tagName)
          totalAssociations += objects.length
        } catch (error) {
          console.error(`Failed to load objects for tag ${tagName}:`, error)
        }
      }
      setTotalTagAssociations(totalAssociations)
    } catch (error) {
      setTagError(error instanceof Error ? error.message : 'Failed to load tags')
    } finally {
      setTagLoading(false)
    }
  }

  // Load policies
  const loadPolicies = async () => {
    try {
      setPolicyLoading(true)
      setPolicyError(null)
      const policyNames = await gravitino.listPolicies()
      const policyDetails = await Promise.all(
        policyNames.map(name => gravitino.getPolicy(name))
      )
      setPolicies(policyDetails)
      
      // Calculate total policy associations
      let totalAssociations = 0
      for (const policyName of policyNames) {
        try {
          const objects = await gravitino.listPolicyObjects(gravitino['metalake'], policyName)
          totalAssociations += objects.length
        } catch (error) {
          console.error(`Failed to load objects for policy ${policyName}:`, error)
        }
      }
      setTotalPolicyAssociations(totalAssociations)
    } catch (error) {
      setPolicyError(error instanceof Error ? error.message : 'Failed to load policies')
    } finally {
      setPolicyLoading(false)
    }
  }

  // Load statistics for a specific object
  const loadStatistics = async (objectType: string, objectName: string) => {
    try {
      setStatLoading(true)
      setStatError(null)
      const stats = await gravitino.listStatistics(objectType, objectName)
      // Add objectType and objectName to each statistic
      const statsWithObjectInfo = stats.map(stat => ({
        ...stat,
        objectType,
        objectName
      }))
      setStatistics(statsWithObjectInfo)
      setSelectedStatObject({ objectType, objectName })
    } catch (error) {
      setStatError(error instanceof Error ? error.message : 'Failed to load statistics')
    } finally {
      setStatLoading(false)
    }
  }

  const loadPartitionStatistics = async (objectType: string, objectName: string) => {
    try {
      setStatPartitionLoading(true)
      setStatPartitionError(null)
      const stats = await gravitino.listPartitionStatistics(objectType, objectName)
      // Add objectType and objectName to each partition statistic
      const statsWithObjectInfo = stats.map(stat => ({
        ...stat,
        objectType,
        objectName
      }))
      setPartitionStats(statsWithObjectInfo as any)
      setSelectedStatPartitionObject({ objectType, objectName })
    } catch (error) {
      setStatPartitionError(error instanceof Error ? error.message : 'Failed to load partition statistics')
    } finally {
      setStatPartitionLoading(false)
    }
  }

  // Load objects associated with a tag
  const loadTagObjects = async (tagName: string) => {
    try {
      const objects = await gravitino.listObjectsForTag(tagName)
      setTagObjects(objects)
    } catch (error) {
      console.error('Failed to load tag objects:', error)
    }
  }

  // Load objects associated with a policy
  const loadPolicyObjects = async (policyName: string) => {
    try {
      const objects = await gravitino.listPolicyObjects(gravitino['metalake'], policyName)
      setPolicyObjects(objects)
    } catch (error) {
      console.error('Failed to load policy objects:', error)
    }
  }

  useEffect(() => {
    loadTags()
    loadPolicies()
  }, [])

  // Tag operations
  const handleCreateTag = async () => {
    try {
      setTagLoading(true)
      await gravitino.createTag(tagFormData)
      await loadTags()
      setIsTagDialogOpen(false)
      setTagFormData({})
    } catch (error) {
      setTagError(error instanceof Error ? error.message : 'Failed to create tag')
    } finally {
      setTagLoading(false)
    }
  }

  const handleUpdateTag = async () => {
    if (!selectedTag) return
    const updates: TagUpdate[] = [...tagUpdates]
    // Rename
    if (builderNewName) {
      updates.push({ "@type": "rename", newName: builderNewName })
    }
    // Comment
    const currentComment = selectedTag.comment || ""
    if (builderNewComment !== currentComment) {
      updates.push({ "@type": "updateComment", newComment: builderNewComment })
    }
    // Properties diff
    const currentMap: Record<string, string> = {}
    editableProperties.forEach(({ key, value }) => { if (key) currentMap[key] = value })
    Object.keys(originalProperties).forEach(k => {
      if (!(k in currentMap)) updates.push({ "@type": "removeProperty", property: k })
    })
    Object.entries(currentMap).forEach(([k, v]) => {
      if (originalProperties[k] !== v) updates.push({ "@type": "setProperty", property: k, value: v })
    })

    if (updates.length === 0) return

    try {
      setTagLoading(true)
      await gravitino.updateTag(selectedTag.name, updates)
      await loadTags()
      setIsTagEditDialogOpen(false)
      setTagUpdates([])
      setBuilderNewName("")
      setBuilderNewComment("")
      setEditableProperties([])
      setOriginalProperties({})
    } catch (error) {
      setTagError(error instanceof Error ? error.message : 'Failed to update tag')
    } finally {
      setTagLoading(false)
    }
  }

  const handleDeleteTag = async (tagName: string) => {
    try {
      setTagLoading(true)
      await gravitino.deleteTag(tagName)
      await loadTags()
    } catch (error) {
      setTagError(error instanceof Error ? error.message : 'Failed to delete tag')
    } finally {
      setTagLoading(false)
    }
  }

  // Policy operations
  const handleCreatePolicy = async () => {
    try {
      setPolicyLoading(true)
      let customRulesParsed: Record<string, any> = {}
      try {
        customRulesParsed = policyCustomRules ? JSON.parse(policyCustomRules) : {}
      } catch (e) {
        setPolicyError('Custom Rules JSON is invalid')
        setPolicyLoading(false)
        return
      }
      const propertiesObj = policyProps.reduce((acc, { key, value }) => {
        if (key) acc[key] = value
        return acc
      }, {} as Record<string, string>)

      const payload: Policy = {
        name: policyFormData.name || '',
        comment: policyFormData.comment || '',
        policyType: policyFormData.policyType || 'custom',
        enabled: policyEnabled,
        content: {
          customRules: customRulesParsed,
          supportedObjectTypes: policyFormData.content?.supportedObjectTypes || ["CATALOG", "SCHEMA", "TABLE", "FILESET", "TOPIC", "MODEL"],
          properties: propertiesObj
        }
      }
      await gravitino.createPolicy(payload)
      await loadPolicies()
      setIsPolicyDialogOpen(false)
      setPolicyFormData({})
      setPolicyEnabled(true)
      setPolicyProps([])
      setPolicyCustomRules('{}')
    } catch (error) {
      setPolicyError(error instanceof Error ? error.message : 'Failed to create policy')
    } finally {
      setPolicyLoading(false)
    }
  }

  const handleUpdatePolicy = async () => {
    if (!selectedPolicy) return
    
    try {
      setPolicyLoading(true)
      await gravitino.updatePolicy(selectedPolicy.name, policyUpdates)
      await loadPolicies()
      setIsPolicyEditDialogOpen(false)
      setPolicyUpdates([])
    } catch (error) {
      setPolicyError(error instanceof Error ? error.message : 'Failed to update policy')
    } finally {
      setPolicyLoading(false)
    }
  }

  const handleDeletePolicy = async (policyName: string) => {
    try {
      setPolicyLoading(true)
      await gravitino.deletePolicy(policyName)
      await loadPolicies()
    } catch (error) {
      setPolicyError(error instanceof Error ? error.message : 'Failed to delete policy')
    } finally {
      setPolicyLoading(false)
    }
  }

  // Statistics operations
  const handleCreateStatistics = async () => {
    if (!statCreateFormData.objectType || !statCreateFormData.objectName || statCreateFormData.statistics.length === 0) {
      setStatError('Please fill in all required fields')
      return
    }
    
    // Validate that all statistics have name and value
    const hasEmptyStats = statCreateFormData.statistics.some(stat => !stat.name || !stat.value)
    if (hasEmptyStats) {
      setStatError('Please fill in all statistic names and values')
      return
    }
    
    try {
      setStatLoading(true)
      const updates = statCreateFormData.statistics.reduce((acc, stat) => {
        acc[stat.name] = stat.value
        return acc
      }, {} as Record<string, any>)
      
      await gravitino.updateStatistics(statCreateFormData.objectType, statCreateFormData.objectName, updates)
      await loadStatistics(statCreateFormData.objectType, statCreateFormData.objectName)
      setIsStatCreateDialogOpen(false)
      setStatCreateFormData({objectType: 'TABLE', objectName: '', statistics: [{name: '', value: ''}]})
    } catch (error) {
      setStatError(error instanceof Error ? error.message : 'Failed to create statistics')
    } finally {
      setStatLoading(false)
    }
  }

  const handleCreatePartitionStatistics = async () => {
    if (!statPartitionCreateFormData.objectType || !statPartitionCreateFormData.objectName || statPartitionCreateFormData.partitions.length === 0) {
      setStatError('Please fill in all required fields')
      return
    }
    
    try {
      setStatLoading(true)
      
      // Process each partition
      for (const partition of statPartitionCreateFormData.partitions) {
        if (!partition.partitionName || partition.statistics.length === 0) continue
        
        const updates = partition.statistics.reduce((acc, stat) => {
          if (stat.name && stat.value) acc[stat.name] = stat.value
          return acc
        }, {} as Record<string, any>)
        
        if (Object.keys(updates).length > 0) {
          await gravitino.updatePartitionStatistics(
            statPartitionCreateFormData.objectType, 
            statPartitionCreateFormData.objectName, 
            partition.partitionName, 
            updates
          )
        }
      }
      
      await loadPartitionStatistics(statPartitionCreateFormData.objectType, statPartitionCreateFormData.objectName)
      setIsStatPartitionDialogOpen(false)
      setStatPartitionCreateFormData({objectType: 'TABLE', objectName: '', partitions: [{partitionName: '', statistics: [{name: '', value: ''}]}]})
    } catch (error) {
      setStatError(error instanceof Error ? error.message : 'Failed to create partition statistics')
    } finally {
      setStatLoading(false)
    }
  }

  const handleUpdateStatistics = async () => {
    if (!selectedStatObject) return
    
    try {
      setStatLoading(true)
      await gravitino.updateStatistics(selectedStatObject.objectType, selectedStatObject.objectName, statFormData)
      await loadStatistics(selectedStatObject.objectType, selectedStatObject.objectName)
      setIsStatDialogOpen(false)
      setStatFormData({})
    } catch (error) {
      setStatError(error instanceof Error ? error.message : 'Failed to update statistics')
    } finally {
      setStatLoading(false)
    }
  }

  const handleUpdateStatisticsForObject = async (objectType: string, objectName: string) => {
    try {
      setStatLoading(true)
      setSelectedStatObject({ objectType, objectName })
      const existingStats = await gravitino.listStatistics(objectType, objectName)
      const existingData = existingStats.reduce((acc, s) => {
        if (s.name && s.value) acc[s.name] = s.value
        return acc
      }, {} as Record<string, any>)
      setStatFormData(existingData)
      setIsStatDialogOpen(true)
    } catch (error) {
      setStatError('Failed to load existing statistics')
    } finally {
      setStatLoading(false)
    }
  }

  const handleDeleteStatistics = async (objectType: string, objectName: string, names: string[]) => {
    try {
      setStatLoading(true)
      await gravitino.dropStatistics(objectType, objectName, names)
      await loadStatistics(objectType, objectName)
    } finally {
      setStatLoading(false)
    }
  }

  const handleUpdatePartitionStatistics = async () => {
    if (!selectedStatPartitionObject) return
    
    try {
      setStatPartitionLoading(true)
      await gravitino.updatePartitionStatistics(selectedStatPartitionObject.objectType, selectedStatPartitionObject.objectName, statPartitionFormData.partitionName, statPartitionFormData.updates)
      await loadPartitionStatistics(selectedStatPartitionObject.objectType, selectedStatPartitionObject.objectName)
      setIsStatPartitionDialogOpen(false)
      setStatPartitionFormData({partitionName: "", updates: {}})
    } catch (error) {
      setStatPartitionError(error instanceof Error ? error.message : 'Failed to update partition statistics')
    } finally {
      setStatPartitionLoading(false)
    }
  }

  const handleDeletePartitionStatistics = async (objectType: string, objectName: string, drops: Array<{ partitionName: string; statisticNames: string[] }>) => {
    try {
      setStatPartitionLoading(true)
      // Get all partitions for this object and delete them
      await gravitino.dropPartitionStatistics(objectType, objectName, drops)
      await loadPartitionStatistics(objectType, objectName)
    } finally {
      setStatPartitionLoading(false)
    }
  }

  const handleLoadStatistics = async () => {
    if (!statLoadFormData.objectType || !statLoadFormData.objectName) {
      setStatError('Please fill in all required fields')
      return
    }
    
    try {
      setStatLoading(true)
      await loadStatistics(statLoadFormData.objectType, statLoadFormData.objectName)
      setIsStatLoadDialogOpen(false)
      setStatLoadFormData({objectType: 'TABLE', objectName: ''})
    } catch (error) {
      setStatError(error instanceof Error ? error.message : 'Failed to load statistics')
    } finally {
      setStatLoading(false)
    }
  }

  const handleLoadPartitionStatistics = async () => {
    if (!statPartitionLoadFormData.objectType || !statPartitionLoadFormData.objectName) {
      setStatPartitionError('Please fill in all required fields')
      return
    }
    
    try {
      setStatPartitionLoading(true)
      await loadPartitionStatistics(statPartitionLoadFormData.objectType, statPartitionLoadFormData.objectName)
      setIsStatPartitionLoadDialogOpen(false)
      setStatPartitionLoadFormData({objectType: 'TABLE', objectName: ''})
    } catch (error) {
      setStatPartitionError(error instanceof Error ? error.message : 'Failed to load partition statistics')
    } finally {
      setStatPartitionLoading(false)
    }
  }

  // Filter functions
  const filteredTags = tags.filter(tag => 
    tag.name.toLowerCase().includes(tagSearchQuery.toLowerCase()) ||
    (tag.comment && tag.comment.toLowerCase().includes(tagSearchQuery.toLowerCase()))
  )

  const filteredPolicies = policies.filter(policy => 
    policy.name.toLowerCase().includes(policySearchQuery.toLowerCase()) ||
    (policy.comment && policy.comment.toLowerCase().includes(policySearchQuery.toLowerCase()))
  )

  const filteredStatistics = statistics.filter(stat => 
    (stat.objectName || '').toLowerCase().includes(statSearchQuery.toLowerCase()) ||
    (stat.objectType || '').toLowerCase().includes(statSearchQuery.toLowerCase())
  )

  const filteredPartitionStatistics = partitionStats.filter(stat => 
    (stat.objectName || '').toLowerCase().includes(statPartitionSearchQuery.toLowerCase()) ||
    (stat.objectType || '').toLowerCase().includes(statPartitionSearchQuery.toLowerCase())
  )

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Governance</h1>
              <p className="text-muted-foreground">Manage tags, policies, and statistics for your metadata</p>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Tags</CardTitle>
                <Tags className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{tags.length}</div>
                <p className="text-xs text-muted-foreground">
                  Managed tags
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Policies</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{policies.length}</div>
                <p className="text-xs text-muted-foreground">
                  {policies.filter(policy => policy.enabled).length} enabled, {policies.filter(policy => !policy.enabled).length} disabled
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tag Associations</CardTitle>
                <PlusCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalTagAssociations}</div>
                <p className="text-xs text-muted-foreground">
                  Objects tagged across all tags
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Policy Associations</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalPolicyAssociations}</div>
                <p className="text-xs text-muted-foreground">
                  Objects with applied policies
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Error Display */}
          {(tagError || policyError || statError || statPartitionError) && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{tagError || policyError || statError || statPartitionError}</AlertDescription>
            </Alert>
          )}

          {/* Main Content */}
          <Tabs defaultValue="tags" className="space-y-4">
            <TabsList>
              <TabsTrigger value="tags"> Tags </TabsTrigger>
              <TabsTrigger value="policies"> Policies </TabsTrigger>
              <TabsTrigger value="statistics"> Statistics </TabsTrigger>
            </TabsList>

            {/* Tags Tab */}
            <TabsContent value="tags" className="space-y-6">
              {/* Search and Actions */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Tags</CardTitle>
                      <CardDescription>Manage metadata tags and their associations</CardDescription>
                    </div>
                    <Dialog open={isTagDialogOpen} onOpenChange={setIsTagDialogOpen}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Create Tag
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Create New Tag</DialogTitle>
                          <DialogDescription>
                            Create a new tag for organizing your metadata objects.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-4">
                            <Label htmlFor="tagName">Name</Label>
                            <Input
                              id="tagName"
                              value={tagFormData.name || ""}
                              onChange={(e) => setTagFormData({...tagFormData, name: e.target.value})}
                              placeholder="Enter tag name"
                            />
                          </div>
                          <div className="space-y-4">
                            <Label htmlFor="tagComment">Comment</Label>
                            <Textarea
                              id="tagComment"
                              value={tagFormData.comment || ""}
                              onChange={(e) => setTagFormData({...tagFormData, comment: e.target.value})}
                              placeholder="Enter tag description"
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsTagDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleCreateTag} disabled={tagLoading}>
                            {tagLoading ? "Creating..." : "Create Tag"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search tags..."
                      className="pl-10"
                      value={tagSearchQuery}
                      onChange={(e) => setTagSearchQuery(e.target.value)}
                    />
                  </div>
                  
                  {tagLoading ? (
                    <div className="text-center py-8">
                      <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></div>
                      <p className="mt-2 text-muted-foreground">Loading tags...</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Comment</TableHead>
                          <TableHead>Properties</TableHead>
                          <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredTags.map((tag) => (
                          <TableRow key={tag.name}>
                            <TableCell className="font-medium">{tag.name}</TableCell>
                            <TableCell>{tag.comment || "-"}</TableCell>
                            <TableCell>
                              {tag.properties && Object.keys(tag.properties).length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {Object.entries(tag.properties).map(([key, value]) => (
                                    <Badge key={key} variant="secondary" className="text-xs">
                                      {key}: {value}
                                    </Badge>
                                  ))}
                                </div>
                              ) : (
                                "-"
                              )}
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                  <DropdownMenuItem onClick={() => {
                                    setSelectedTag(tag)
                                    setBuilderNewName(tag.name)
                                    setBuilderNewComment(tag.comment || "")
                                    setTagPropKeyInput("")
                                    setTagPropValInput("")
                                    setTagPropRemoveKeyInput("")
                                    setTagUpdates([])
                                    const props = tag.properties || {}
                                    setOriginalProperties(props as Record<string, string>)
                                    setEditableProperties(Object.entries(props).map(([k,v]) => ({ key: k, value: String(v) })))
                                    loadTagObjects(tag.name)
                                    setIsTagEditDialogOpen(true)
                                  }}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => {
                                    setSelectedTag(tag)
                                    setAssociateObjectType("TABLE")
                                    setAssociateObjectName("")
                                    setIsTagAssociateDialogOpen(true)
                                  }}>
                                    <PlusCircle className="h-4 w-4 mr-2" />
                                    Associate
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => {
                                    setSelectedTag(tag)
                                    loadTagObjects(tag.name)
                                    setIsTagViewDialogOpen(true)
                                  }}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Objects
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    onClick={() => { setTagNameToDelete(tag.name); setIsDeleteTagDialogOpen(true) }}
                                    className="text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Policies Tab */}
            <TabsContent value="policies" className="space-y-6">
              {/* Search and Actions */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Policies</CardTitle>
                      <CardDescription>Manage data governance policies and their configurations</CardDescription>
                    </div>
                    <Dialog open={isPolicyDialogOpen} onOpenChange={setIsPolicyDialogOpen}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Create Policy
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Create New Policy</DialogTitle>
                          <DialogDescription>
                            Create a new governance policy for your metadata objects.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-4">
                            <Label htmlFor="policyName">Name</Label>
                            <Input
                              id="policyName"
                              value={policyFormData.name || ""}
                              onChange={(e) => setPolicyFormData({...policyFormData, name: e.target.value})}
                              placeholder="Enter policy name"
                            />
                          </div>
                          <div className="space-y-4">
                            <Label htmlFor="policyComment">Comment</Label>
                            <Textarea
                              id="policyComment"
                              value={policyFormData.comment || ""}
                              onChange={(e) => setPolicyFormData({...policyFormData, comment: e.target.value})}
                              placeholder="Enter policy description"
                            />
                          </div>
                          <div className="space-y-4">
                            <Label htmlFor="policyType">Policy Type</Label>
                            <Input
                              id="policyType"
                              value={policyFormData.policyType || "custom"}
                              onChange={(e) => setPolicyFormData({...policyFormData, policyType: e.target.value})}
                              placeholder="Enter policy type"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Status</Label>
                            <div className="flex items-center gap-2">
                              <Button type="button" variant={policyEnabled ? "default" : "outline"} size="sm" onClick={() => setPolicyEnabled(true)}>Enabled</Button>
                              <Button type="button" variant={!policyEnabled ? "default" : "outline"} size="sm" onClick={() => setPolicyEnabled(false)}>Disabled</Button>
                            </div>
                          </div>
                          <div className="space-y-4">
                            <Label>Supported Object Types</Label>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {["CATALOG", "SCHEMA", "TABLE", "FILESET", "TOPIC", "MODEL"].map(type => (
                                <Badge
                                  key={type}
                                  variant={
                                    policyFormData.content?.supportedObjectTypes?.includes(type as any) 
                                      ? "default" : "outline"
                                  }
                                  className="cursor-pointer"
                                  onClick={() => {
                                    const currentTypes = policyFormData.content?.supportedObjectTypes || []
                                    const newTypes = currentTypes.includes(type as any)
                                      ? currentTypes.filter(t => t !== type)
                                      : [...currentTypes, type as any]
                                    setPolicyFormData({
                                      ...policyFormData,
                                      content: {
                                        ...policyFormData.content,
                                        supportedObjectTypes: newTypes
                                      }
                                    })
                                  }}
                                >
                                  {type}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Custom Rules (JSON)</Label>
                            <Textarea
                              placeholder='{"rule1": 123}'
                              value={policyCustomRules}
                              onChange={(e) => setPolicyCustomRules(e.target.value)}
                              rows={4}
                            />
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label>Properties</Label>
                              <Button type="button" size="sm" variant="outline" onClick={() => setPolicyProps([...policyProps, { key: "", value: "" }])}>Add Property</Button>
                            </div>
                            <div className="space-y-2">
                              {policyProps.map((p, idx) => (
                                <div key={idx} className="grid grid-cols-5 gap-2 items-end">
                                  <div className="col-span-2">
                                    <Input placeholder="key" value={p.key} onChange={(e) => {
                                      const next = [...policyProps]
                                      next[idx] = { ...next[idx], key: e.target.value }
                                      setPolicyProps(next)
                                    }} />
                                  </div>
                                  <div className="col-span-2">
                                    <Input placeholder="value" value={p.value} onChange={(e) => {
                                      const next = [...policyProps]
                                      next[idx] = { ...next[idx], value: e.target.value }
                                      setPolicyProps(next)
                                    }} />
                                  </div>
                                  <div className="flex gap-2">
                                    <Button type="button" size="sm" variant="ghost" onClick={() => setPolicyProps(policyProps.filter((_, i) => i !== idx))}>-</Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsPolicyDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleCreatePolicy} disabled={policyLoading}>
                            {policyLoading ? "Creating..." : "Create Policy"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search policies..."
                      className="pl-10"
                      value={policySearchQuery}
                      onChange={(e) => setPolicySearchQuery(e.target.value)}
                    />
                  </div>
                  
                  {policyLoading ? (
                    <div className="text-center py-8">
                      <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></div>
                      <p className="mt-2 text-muted-foreground">Loading policies...</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Comment</TableHead>
                          <TableHead>Supported Objects</TableHead>
                          <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredPolicies.map((policy) => (
                          <TableRow key={policy.name}>
                            <TableCell className="font-medium">{policy.name}</TableCell>
                            <TableCell>{policy.policyType}</TableCell>
                            <TableCell>
                              <Badge variant={policy.enabled ? "default" : "secondary"}>
                                {policy.enabled ? "Enabled" : "Disabled"}
                              </Badge>
                            </TableCell>
                            <TableCell>{policy.comment || "-"}</TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {(policy.content?.supportedObjectTypes || []).map(t => (
                                  <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                                ))}
                              </div>
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                  <DropdownMenuItem onClick={() => {
                                    setSelectedPolicy(policy)
                                    setPolicyEditName(policy.name)
                                    setPolicyEditComment(policy.comment || "")
                                    setPolicyEditType(policy.policyType || "custom")
                                    setPolicyEditProps(Object.entries(policy.content?.properties || {}).map(([k,v]) => ({ key: k, value: String(v) })))
                                    setPolicyEditCustomRules(JSON.stringify(policy.content?.customRules || {}, null, 2))
                                    setPolicyUpdates([])
                                    loadPolicyObjects(policy.name)
                                    setIsPolicyEditDialogOpen(true)
                                  }}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => {
                                    setSelectedPolicy(policy)
                                    setAssociatePolicyObjectType("TABLE")
                                    setAssociatePolicyObjectName("")
                                    setIsPolicyAssociateDialogOpen(true)
                                  }}>
                                    <PlusCircle className="h-4 w-4 mr-2" />
                                    Associate Object
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => {
                                    setSelectedPolicy(policy)
                                    loadPolicyObjects(policy.name)
                                    setIsPolicyViewDialogOpen(true)
                                  }}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Objects
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => {
                                    gravitino.enablePolicy(policy.name, !policy.enabled)
                                      .then(() => loadPolicies())
                                  }}>
                                    {policy.enabled ? (
                                      <ToggleLeft className="h-4 w-4 mr-2 text-red-500" />
                                    ) : (
                                      <ToggleRight className="h-4 w-4 mr-2 text-green-500" />
                                    )}
                                    {policy.enabled ? 'Disable' : 'Enable'}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handleDeletePolicy(policy.name)}
                                    className="text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Statistics Tab */}
            <TabsContent value="statistics" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Statistics</CardTitle>
                      <CardDescription>View and manage metadata statistics</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center mb-4">
                    <Tabs value={statTab} onValueChange={(v:any)=>setStatTab(v)}>
                      <TabsList>
                        <TabsTrigger value="object">Statistics</TabsTrigger>
                        <TabsTrigger value="partition">Partition Statistics</TabsTrigger>
                      </TabsList>
                    </Tabs>
                    <div className="flex gap-2">
                      {statTab === "object" ? (
                        <>
                          <Button variant="outline" onClick={() => {
                            setStatLoadFormData({objectType: 'TABLE', objectName: ''})
                            setIsStatLoadDialogOpen(true)
                          }}>
                            <Search className="h-4 w-4 mr-2" /> Load Statistics
                          </Button>
                          <Button onClick={() => {
                            setStatCreateFormData({objectType: 'TABLE', objectName: '', statistics: [{name: '', value: ''}]})
                            setIsStatCreateDialogOpen(true)
                          }}>
                            <Plus className="h-4 w-4 mr-2" /> Create Statistic
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button variant="outline" onClick={() => {
                            setStatPartitionLoadFormData({objectType: 'TABLE', objectName: ''})
                            setIsStatPartitionLoadDialogOpen(true)
                          }}>
                            <Search className="h-4 w-4 mr-2" /> Load Partition Statistics
                          </Button>
                          <Button onClick={() => {
                            setStatPartitionCreateFormData({objectType: 'TABLE', objectName: '', partitions: [{partitionName: '', statistics: [{name: '', value: ''}]}]})
                            setIsStatPartitionDialogOpen(true)
                          }}>
                            <Plus className="h-4 w-4 mr-2" /> Create Partition Statistic
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                  <Tabs value={statTab} className="space-y-4" onValueChange={(v:any)=>setStatTab(v)}>
                    {/* Statistics Tab */}
                    <TabsContent value="object" className="space-y-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search statistics..." className="pl-10" value={statSearchQuery} onChange={(e)=>setStatSearchQuery(e.target.value)} />
                      </div>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Object Name</TableHead>
                            <TableHead>Object Type</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Value</TableHead>
                            <TableHead>Reserved</TableHead>
                            <TableHead>Modified</TableHead>
                            <TableHead>Creator</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredStatistics.map((stat, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium">{stat.objectName || "-"}</TableCell>
                              <TableCell>{stat.objectType || "-"}</TableCell>
                              <TableCell>{stat.name || "-"}</TableCell>
                              <TableCell>{stat.value || "-"}</TableCell>
                              <TableCell>{stat.reserved || "-"}</TableCell>
                              <TableCell>{stat.modified || "-"}</TableCell>
                              <TableCell>{stat.audit?.creator || "-"}</TableCell>
                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent>
                                    <DropdownMenuItem onClick={() => {
                                      setSelectedStatObject({ objectType: stat.objectType, objectName: stat.objectName })
                                      setStatFormData({ [stat.name || '']: stat.value || '' })
                                      setIsStatDialogOpen(true)
                                    }}>
                                      <Edit className="h-4 w-4 mr-2" />
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleDeleteStatistics(stat.objectType, stat.objectName, Array.from(new Set([stat.name || ''])))} className="text-destructive">
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TabsContent>
                    {/* Partition Statistics Tab */}
                    <TabsContent value="partition" className="space-y-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search partition statistics..." className="pl-10" value={statPartitionSearchQuery} onChange={(e)=>setStatPartitionSearchQuery(e.target.value)} />
                      </div>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Object Name</TableHead>
                            <TableHead>Object Type</TableHead>
                            <TableHead>Partition Name</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Value</TableHead>
                            <TableHead>Reserved</TableHead>
                            <TableHead>Modified</TableHead>
                            <TableHead>Creator</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredPartitionStatistics.flatMap((ps, pIdx) => (
                            (ps.statistics && ps.statistics.length > 0 ? ps.statistics : [{} as any]).map((s: any, sIdx: number) => (
                              <TableRow key={`${pIdx}:${sIdx}`}>
                                <TableCell className="font-medium">{ps.objectName || "-"}</TableCell>
                                <TableCell>{ps.objectType || "-"}</TableCell>
                                <TableCell>{ps.partitionName || "-"}</TableCell>
                                <TableCell>{s.name || "-"}</TableCell>
                                <TableCell>{s.value || "-"}</TableCell>
                                <TableCell>{s.reserved || "-"}</TableCell>
                                <TableCell>{s.modified || "-"}</TableCell>
                                <TableCell>{s.audit?.creator || "-"}</TableCell>
                                <TableCell>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm">
                                        <MoreVertical className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                      <DropdownMenuItem onClick={() => {
                                        setSelectedStatPartitionObject({ objectType: ps.objectType, objectName: ps.objectName })
                                        setStatPartitionFormData({partitionName: ps.partitionName, updates: { [s.name || '']: s.value || '' }})
                                        setIsStatPartitionDialogOpen(true)
                                      }}>
                                        <Edit className="h-4 w-4 mr-2" />
                                        Edit
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => handleDeletePartitionStatistics(ps.objectType, ps.objectName, Array.from(new Set([ps.partitionName, s.name || ''])).map(name => ({ partitionName: ps.partitionName, statisticNames: [name] })))} className="text-destructive">
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </TableRow>
                            ))
                          ))}
                        </TableBody>
                      </Table>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Tag Edit Dialog */}
          <Dialog open={isTagEditDialogOpen} onOpenChange={setIsTagEditDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Edit Tag: {selectedTag?.name}</DialogTitle>
                <DialogDescription>
                  Update tag properties and comment using structured updates.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="renameTag">Name</Label>
                    <Input id="renameTag" placeholder="Tag name" value={builderNewName}
                      onChange={(e) => setBuilderNewName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="commentTag">Comment</Label>
                    <Input id="commentTag" placeholder="Tag comment" value={builderNewComment}
                      onChange={(e) => setBuilderNewComment(e.target.value)} />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Properties</Label>
                    <Button size="sm" variant="outline" onClick={() => setEditableProperties([...editableProperties, { key: "", value: "" }])}>
                      <PlusCircle className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {editableProperties.map((p, idx) => (
                      <div key={idx} className="grid grid-cols-5 gap-4 items-end">
                        <div className="col-span-2">
                          <Label className="sr-only">Key</Label>
                          <Input placeholder="key" value={p.key} onChange={(e) => {
                            const next = [...editableProperties]
                            next[idx] = { ...next[idx], key: e.target.value }
                            setEditableProperties(next)
                          }} />
                        </div>
                        <div className="col-span-2">
                          <Label className="sr-only">Value</Label>
                          <Input placeholder="value" value={p.value} onChange={(e) => {
                            const next = [...editableProperties]
                            next[idx] = { ...next[idx], value: e.target.value }
                            setEditableProperties(next)
                          }} />
                        </div>
                        <div className="flex gap-4">
                          <Button size="sm" variant="ghost" onClick={() => {
                            setEditableProperties(editableProperties.filter((_, i) => i !== idx))
                          }}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {tagObjects.length > 0 && (
                  <div>
                    <Label>Associated Objects</Label>
                    <div className="mt-2 space-y-1">
                      {tagObjects.map((obj, index) => (
                        <div key={index} className="text-sm p-2 bg-muted rounded">
                          {obj.objectType.toUpperCase()}: {obj.objectName}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsTagEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateTag} disabled={tagLoading}>
                  {tagLoading ? "Updating..." : "Update Tag"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Tag Associate Dialog */}
          <Dialog open={isTagAssociateDialogOpen} onOpenChange={setIsTagAssociateDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Associate Tag: {selectedTag?.name}</DialogTitle>
                <DialogDescription>Link this tag to a metadata object.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <Label htmlFor="assocType">Object Type</Label>
                    <Select value={associateObjectType} onValueChange={setAssociateObjectType}>
                      <SelectTrigger id="assocType"><SelectValue placeholder="Select type" /></SelectTrigger>
                      <SelectContent>
                        {['CATALOG','SCHEMA','TABLE','FILESET','TOPIC','MODEL'].map(t => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-4">
                    <Label htmlFor="assocName">Object Name</Label>
                    <Input id="assocName" placeholder="full name" value={associateObjectName}
                      onChange={(e) => setAssociateObjectName(e.target.value)} />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsTagAssociateDialogOpen(false)}>Cancel</Button>
                <Button onClick={async () => {
                  if (!selectedTag || !associateObjectType || !associateObjectName) return
                  try {
                    setTagLoading(true)
                    await gravitino.associateTagWithObject(associateObjectType, associateObjectName, [selectedTag.name], [])
                    await loadTagObjects(selectedTag.name)
                    await loadTags()
                    setIsTagAssociateDialogOpen(false)
                  } catch (error) {
                    setTagError(error instanceof Error ? error.message : 'Failed to associate tag')
                  } finally {
                    setTagLoading(false)
                  }
                }}>Associate</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Tag View Objects Dialog */}
          <Dialog open={isTagViewDialogOpen} onOpenChange={setIsTagViewDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Objects for Tag: {selectedTag?.name}</DialogTitle>
                <DialogDescription>List of metadata objects associated with this tag.</DialogDescription>
              </DialogHeader>
              <div className="max-h-[60vh] overflow-auto">
                {tagObjects.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">No objects found.</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tagObjects.map((obj) => (
                        <TableRow key={`${obj.objectType}:${obj.objectName}`}>
                          <TableCell><Badge variant="outline">{obj.objectType.toUpperCase()}</Badge></TableCell>
                          <TableCell className="font-medium">{obj.objectName}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" onClick={() => navigator.clipboard?.writeText(obj.objectName)}>
                              <Copy className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsTagViewDialogOpen(false)}>Close</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Delete Tag Confirmation Dialog */}
          <AlertDialog open={isDeleteTagDialogOpen} onOpenChange={setIsDeleteTagDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete tag {tagNameToDelete}?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the tag and its associations.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={async () => {
                  if (!tagNameToDelete) return
                  try {
                    setTagLoading(true)
                    await handleDeleteTag(tagNameToDelete)
                  } finally {
                    setIsDeleteTagDialogOpen(false)
                    setTagNameToDelete(null)
                    setTagLoading(false)
                  }
                }} className="bg-destructive text-white hover:bg-destructive/90">Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Policy Edit Dialog */}
          <Dialog open={isPolicyEditDialogOpen} onOpenChange={setIsPolicyEditDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Edit Policy: {selectedPolicy?.name}</DialogTitle>
                <DialogDescription>
                  Update policy properties using structured updates.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="policyEditName">Name</Label>
                    <Input id="policyEditName" placeholder="Policy name" value={policyEditName} onChange={(e) => setPolicyEditName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="policyEditType">Type</Label>
                    <Input id="policyEditType" placeholder="Type" value={policyEditType} onChange={(e) => setPolicyEditType(e.target.value)} />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="policyEditComment">Comment</Label>
                    <Input id="policyEditComment" placeholder="Comment" value={policyEditComment} onChange={(e) => setPolicyEditComment(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Custom Rules (JSON)</Label>
                  <Textarea rows={4} value={policyEditCustomRules} onChange={(e) => setPolicyEditCustomRules(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Properties</Label>
                    <Button size="sm" variant="outline" onClick={() => setPolicyEditProps([...policyEditProps, { key: "", value: "" }])}><PlusCircle className="h-4 w-4" /></Button>
                  </div>
                  <div className="space-y-2">
                    {policyEditProps.map((p, idx) => (
                      <div key={idx} className="grid grid-cols-5 gap-2 items-end">
                        <div className="col-span-2"><Input placeholder="key" value={p.key} onChange={e => { const next = [...policyEditProps]; next[idx] = { ...next[idx], key: e.target.value }; setPolicyEditProps(next) }} /></div>
                        <div className="col-span-2"><Input placeholder="value" value={p.value} onChange={e => { const next = [...policyEditProps]; next[idx] = { ...next[idx], value: e.target.value }; setPolicyEditProps(next) }} /></div>
                        <div className="flex gap-2"><Button size="sm" variant="ghost" onClick={() => setPolicyEditProps(policyEditProps.filter((_, i) => i !== idx))}><Trash2 className="h-4 w-4" /></Button></div>
                      </div>
                    ))}
                  </div>
                </div>
                {policyObjects.length > 0 && (
                  <div>
                    <Label>Associated Objects</Label>
                    <div className="mt-2 space-y-1">
                      {policyObjects.map((obj) => (
                        <div key={`${obj.objectType}:${obj.objectName}`} className="text-sm p-2 bg-muted rounded">
                          {obj.objectType.toUpperCase()}: {obj.objectName}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsPolicyEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdatePolicy} disabled={policyLoading}>
                  {policyLoading ? "Updating..." : "Update Policy"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Policy View Objects Dialog */}
          <Dialog open={isPolicyViewDialogOpen} onOpenChange={setIsPolicyViewDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Objects for Policy: {selectedPolicy?.name}</DialogTitle>
                <DialogDescription>List of metadata objects associated with this policy.</DialogDescription>
              </DialogHeader>
              <div className="max-h-[60vh] overflow-auto">
                {policyObjects.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">No objects found.</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Name</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {policyObjects.map((obj) => (
                        <TableRow key={`${obj.objectType}:${obj.objectName}`}>
                          <TableCell><Badge variant="outline">{obj.objectType.toUpperCase()}</Badge></TableCell>
                          <TableCell className="font-medium">{obj.objectName}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsPolicyViewDialogOpen(false)}>Close</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Policy Associate Dialog */}
          <Dialog open={isPolicyAssociateDialogOpen} onOpenChange={setIsPolicyAssociateDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Associate Policy: {selectedPolicy?.name}</DialogTitle>
                <DialogDescription>Link this policy to a metadata object.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <Label htmlFor="assocPolicyType">Object Type</Label>
                    <Select value={associatePolicyObjectType} onValueChange={setAssociatePolicyObjectType}>
                      <SelectTrigger id="assocPolicyType"><SelectValue placeholder="Select type" /></SelectTrigger>
                      <SelectContent>
                        {['CATALOG','SCHEMA','TABLE','FILESET','TOPIC','MODEL'].map(t => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-4">
                    <Label htmlFor="assocPolicyName">Object Name</Label>
                    <Input id="assocPolicyName" placeholder="full name" value={associatePolicyObjectName}
                      onChange={(e) => setAssociatePolicyObjectName(e.target.value)} />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsPolicyAssociateDialogOpen(false)}>Cancel</Button>
                <Button onClick={async () => {
                  if (!selectedPolicy || !associatePolicyObjectType || !associatePolicyObjectName) return
                  try {
                    setPolicyLoading(true)
                    await gravitino.associatePolicies(associatePolicyObjectType, associatePolicyObjectName, [selectedPolicy.name])
                    await loadPolicyObjects(selectedPolicy.name)
                    await loadPolicies()
                    setIsPolicyAssociateDialogOpen(false)
                  } catch (error) {
                    setPolicyError(error instanceof Error ? error.message : 'Failed to associate policy')
                  } finally {
                    setPolicyLoading(false)
                  }
                }}>Associate</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Statistics Create Dialog */}
          <Dialog open={isStatCreateDialogOpen} onOpenChange={setIsStatCreateDialogOpen}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Statistics</DialogTitle>
                <DialogDescription>
                  Create new statistics for an object
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <Label htmlFor="createObjectType">Object Type</Label>
                    <Select value={statCreateFormData.objectType} onValueChange={(value) => setStatCreateFormData({...statCreateFormData, objectType: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TABLE">TABLE</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-4">
                    <Label htmlFor="createObjectName">Object Name</Label>
                    <Input
                      id="createObjectName"
                      placeholder="e.g., catalog.schema.table"
                      value={statCreateFormData.objectName}
                      onChange={(e) => setStatCreateFormData({...statCreateFormData, objectName: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-2">
                    <Label>Statistics</Label>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => setStatCreateFormData({
                        ...statCreateFormData,
                        statistics: [...statCreateFormData.statistics, {name: '', value: ''}]
                      })}
                    >
                      <PlusCircle className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {statCreateFormData.statistics.map((stat, index) => (
                      <div key={index} className="flex gap-2 items-center">
                        <Input
                          placeholder="Name (e.g., rowCount)"
                          value={stat.name}
                          onChange={(e) => {
                            const newStats = [...statCreateFormData.statistics]
                            newStats[index].name = e.target.value
                            setStatCreateFormData({...statCreateFormData, statistics: newStats})
                          }}
                        />
                        <Input
                          placeholder="Value (e.g., 1000)"
                          value={stat.value}
                          onChange={(e) => {
                            const newStats = [...statCreateFormData.statistics]
                            newStats[index].value = e.target.value
                            setStatCreateFormData({...statCreateFormData, statistics: newStats})
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newStats = statCreateFormData.statistics.filter((_, i) => i !== index)
                            setStatCreateFormData({...statCreateFormData, statistics: newStats})
                          }}
                          disabled={statCreateFormData.statistics.length === 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsStatCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateStatistics} disabled={statLoading}>
                  {statLoading ? "Creating..." : "Create Statistics"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Statistics Update Dialog */}
          <Dialog open={isStatDialogOpen} onOpenChange={setIsStatDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Update Statistics</DialogTitle>
                <DialogDescription>
                  Update statistics for {selectedStatObject?.objectType}: {selectedStatObject?.objectName}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {Object.entries(statFormData).map(([name, value]) => (
                  <div key={name} className="space-y-2">
                    <Label htmlFor={`stat-${name}`}>{name}</Label>
                    <Input
                      id={`stat-${name}`}
                      value={value as string}
                      onChange={(e) => {
                        setStatFormData(prev => ({
                          ...prev,
                          [name]: e.target.value
                        }))
                      }}
                    />
                  </div>
                ))}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsStatDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateStatistics} disabled={statLoading}>
                  {statLoading ? "Updating..." : "Update Statistics"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Load Statistics Dialog */}
          <Dialog open={isStatLoadDialogOpen} onOpenChange={setIsStatLoadDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Load Statistics</DialogTitle>
                <DialogDescription>
                  Load statistics for a specific object
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-4">
                  <Label htmlFor="loadObjectType">Object Type</Label>
                  <Select value={statLoadFormData.objectType} onValueChange={(value) => setStatLoadFormData({...statLoadFormData, objectType: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TABLE">TABLE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-4">
                  <Label htmlFor="loadObjectName">Object Name</Label>
                  <Input
                    id="loadObjectName"
                    placeholder="e.g., catalog.schema.table"
                    value={statLoadFormData.objectName}
                    onChange={(e) => setStatLoadFormData({...statLoadFormData, objectName: e.target.value})}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsStatLoadDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleLoadStatistics} disabled={statLoading}>
                  {statLoading ? "Loading..." : "Load Statistics"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Load Partition Statistics Dialog */}
          <Dialog open={isStatPartitionLoadDialogOpen} onOpenChange={setIsStatPartitionLoadDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Load Partition Statistics</DialogTitle>
                <DialogDescription>
                  Load partition statistics for a specific object
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-4">
                  <Label htmlFor="loadPartitionObjectType">Object Type</Label>
                  <Select value={statPartitionLoadFormData.objectType} onValueChange={(value) => setStatPartitionLoadFormData({...statPartitionLoadFormData, objectType: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TABLE">TABLE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-4">
                  <Label htmlFor="loadPartitionObjectName">Object Name</Label>
                  <Input
                    id="loadPartitionObjectName"
                    placeholder="e.g., catalog.schema.table"
                    value={statPartitionLoadFormData.objectName}
                    onChange={(e) => setStatPartitionLoadFormData({...statPartitionLoadFormData, objectName: e.target.value})}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsStatPartitionLoadDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleLoadPartitionStatistics} disabled={statPartitionLoading}>
                  {statPartitionLoading ? "Loading..." : "Load Partition Statistics"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* View Statistics Dialog */}
          <Dialog open={isStatViewDialogOpen} onOpenChange={setIsStatViewDialogOpen}>
            <DialogContent className="max-w-[100vw] max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>View Statistics</DialogTitle>
                <DialogDescription>
                  Statistics for {selectedStatObject?.objectType}: {selectedStatObject?.objectName}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Reserved</TableHead>
                      <TableHead>Modified</TableHead>
                      <TableHead>Creator</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {statistics.filter(stat => 
                      stat.objectType === selectedStatObject?.objectType && 
                      stat.objectName === selectedStatObject?.objectName
                    ).map((stat, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{stat.name || "-"}</TableCell>
                        <TableCell>{stat.value || "-"}</TableCell>
                        <TableCell>{stat.reserved || "-"}</TableCell>
                        <TableCell>{stat.modified || "-"}</TableCell>
                        <TableCell>{stat.audit?.creator || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsStatViewDialogOpen(false)}>
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* View Partition Statistics Dialog */}
          <Dialog open={isStatPartitionViewDialogOpen} onOpenChange={setIsStatPartitionViewDialogOpen}>
            <DialogContent className="max-w-[100vw] max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>View Partition Statistics</DialogTitle>
                <DialogDescription>
                  Partition statistics for {selectedStatPartitionObject?.objectType}: {selectedStatPartitionObject?.objectName}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Partition Name</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Reserved</TableHead>
                      <TableHead>Modified</TableHead>
                      <TableHead>Creator</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {partitionStats.filter(ps => 
                      ps.objectType === selectedStatPartitionObject?.objectType && 
                      ps.objectName === selectedStatPartitionObject?.objectName
                    ).flatMap((ps, pIdx) => (
                      (ps.statistics && ps.statistics.length > 0 ? ps.statistics : [{} as any]).map((s: any, sIdx: number) => (
                        <TableRow key={`${pIdx}:${sIdx}`}>
                          <TableCell className="font-medium">{ps.partitionName || "-"}</TableCell>
                          <TableCell>{s.name || "-"}</TableCell>
                          <TableCell>{s.value || "-"}</TableCell>
                          <TableCell>{s.reserved || "-"}</TableCell>
                          <TableCell>{s.modified || "-"}</TableCell>
                          <TableCell>{s.audit?.creator || "-"}</TableCell>
                        </TableRow>
                      ))
                    ))}
                  </TableBody>
                </Table>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsStatPartitionViewDialogOpen(false)}>
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Partition Statistics Update Dialog */}
          <Dialog open={isStatPartitionDialogOpen} onOpenChange={setIsStatPartitionDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Update Partition Statistics</DialogTitle>
                <DialogDescription>
                  Update partition statistics for {selectedStatPartitionObject?.objectType}: {selectedStatPartitionObject?.objectName}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="partitionName">Partition Name</Label>
                  <Input
                    id="partitionName"
                    value={statPartitionFormData.partitionName}
                    onChange={(e) => setStatPartitionFormData({...statPartitionFormData, partitionName: e.target.value})}
                    disabled
                  />
                </div>
                {Object.entries(statPartitionFormData.updates).map(([name, value]) => (
                  <div key={name} className="space-y-2">
                    <Label htmlFor={`partition-stat-${name}`}>{name}</Label>
                    <Input
                      id={`partition-stat-${name}`}
                      value={value as string}
                      onChange={(e) => {
                        setStatPartitionFormData(prev => ({
                          ...prev,
                          updates: {
                            ...prev.updates,
                            [name]: e.target.value
                          }
                        }))
                      }}
                    />
                  </div>
                ))}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsStatPartitionDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdatePartitionStatistics} disabled={statPartitionLoading}>
                  {statPartitionLoading ? "Updating..." : "Update Partition Statistics"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Partition Statistics Create Dialog */}
          <Dialog open={isStatPartitionDialogOpen} onOpenChange={setIsStatPartitionDialogOpen}>
            <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Partition Statistics</DialogTitle>
                <DialogDescription>
                  Create new partition statistics for an object
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <Label htmlFor="createPartitionObjectType">Object Type</Label>
                    <Select value={statPartitionCreateFormData.objectType} onValueChange={(value) => setStatPartitionCreateFormData({...statPartitionCreateFormData, objectType: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TABLE">TABLE</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-4">
                    <Label htmlFor="createPartitionObjectName">Object Name</Label>
                    <Input
                      id="createPartitionObjectName"
                      placeholder="e.g., catalog.schema.table"
                      value={statPartitionCreateFormData.objectName}
                      onChange={(e) => setStatPartitionCreateFormData({...statPartitionCreateFormData, objectName: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-2">
                    <Label>Partitions</Label>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => setStatPartitionCreateFormData({
                        ...statPartitionCreateFormData,
                        partitions: [...statPartitionCreateFormData.partitions, {partitionName: '', statistics: [{name: '', value: ''}]}]
                      })}
                    >
                      <Plus className="h-4 w-4 mr-1" /> Add Partition
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {statPartitionCreateFormData.partitions.map((partition, pIndex) => (
                      <div key={pIndex} className="border rounded-lg p-4 space-y-3">
                        <div className="flex justify-between items-center">
                          <Label className="text-sm font-medium">Partition {pIndex + 1}</Label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newPartitions = statPartitionCreateFormData.partitions.filter((_, i) => i !== pIndex)
                              setStatPartitionCreateFormData({...statPartitionCreateFormData, partitions: newPartitions})
                            }}
                            disabled={statPartitionCreateFormData.partitions.length === 1}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="space-y-4">
                          <Label htmlFor={`partitionName-${pIndex}`}>Partition Name</Label>
                          <Input
                            id={`partitionName-${pIndex}`}
                            placeholder="e.g., year=2023/month=01"
                            value={partition.partitionName}
                            onChange={(e) => {
                              const newPartitions = [...statPartitionCreateFormData.partitions]
                              newPartitions[pIndex].partitionName = e.target.value
                              setStatPartitionCreateFormData({...statPartitionCreateFormData, partitions: newPartitions})
                            }}
                          />
                        </div>
                        
                        <div className="space-y-4">
                          <div className="flex justify-between items-center mb-2">
                            <Label className="text-sm">Statistics</Label>
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                const newPartitions = [...statPartitionCreateFormData.partitions]
                                newPartitions[pIndex].statistics.push({name: '', value: ''})
                                setStatPartitionCreateFormData({...statPartitionCreateFormData, partitions: newPartitions})
                              }}
                            >
                              <PlusCircle className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="space-y-4">
                            {partition.statistics.map((stat, sIndex) => (
                              <div key={sIndex} className="flex gap-2 items-center">
                                <Input
                                  placeholder="Name (e.g., rowCount)"
                                  value={stat.name}
                                  onChange={(e) => {
                                    const newPartitions = [...statPartitionCreateFormData.partitions]
                                    newPartitions[pIndex].statistics[sIndex].name = e.target.value
                                    setStatPartitionCreateFormData({...statPartitionCreateFormData, partitions: newPartitions})
                                  }}
                                />
                                <Input
                                  placeholder="Value (e.g., 1000)"
                                  value={stat.value}
                                  onChange={(e) => {
                                    const newPartitions = [...statPartitionCreateFormData.partitions]
                                    newPartitions[pIndex].statistics[sIndex].value = e.target.value
                                    setStatPartitionCreateFormData({...statPartitionCreateFormData, partitions: newPartitions})
                                  }}
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const newPartitions = [...statPartitionCreateFormData.partitions]
                                    newPartitions[pIndex].statistics = newPartitions[pIndex].statistics.filter((_, i) => i !== sIndex)
                                    setStatPartitionCreateFormData({...statPartitionCreateFormData, partitions: newPartitions})
                                  }}
                                  disabled={partition.statistics.length === 1}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsStatPartitionDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreatePartitionStatistics} disabled={statLoading}>
                  {statLoading ? "Creating..." : "Create Partition Statistics"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
