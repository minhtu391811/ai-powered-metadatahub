'use client'

import { useState, useEffect } from 'react'
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus, MoreVertical, Play, Square, Eye, Trash2, Edit, Clock, CheckCircle, AlertCircle, XCircle } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { getGravitinoClient, JobTemplate, Job, extractParametersFromTemplate } from '@/lib/gravitino-client'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// ParameterInput component for managing key-value pairs
interface ParameterInputProps {
  label: string;
  placeholder?: string;
  value: Record<string, string>;
  onChange: (value: Record<string, string>) => void;
  allowParameters?: boolean;
}

function ParameterInput({ label, placeholder, value, onChange, allowParameters = true }: ParameterInputProps) {
  const addParameter = () => {
    const newKey = `param_${Date.now()}`;
    onChange({ ...value, [newKey]: '' });
  };

  const removeParameter = (key: string) => {
    const newValue = { ...value };
    delete newValue[key];
    onChange(newValue);
  };

  const updateParameter = (key: string, newKey: string, newValue: string) => {
    const updated = { ...value };
    delete updated[key];
    updated[newKey] = newValue;
    onChange(updated);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <Button type="button" variant="outline" size="sm" onClick={addParameter}>
          <Plus className="h-4 w-4 mr-1" />
          Add
        </Button>
      </div>
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {Object.entries(value).map(([key, val]) => (
          <div key={key} className="flex gap-2 items-center">
            <Input
              placeholder="Key"
              value={key}
              onChange={(e) => updateParameter(key, e.target.value, val)}
              className="flex-1"
            />
            <Input
              placeholder={placeholder || "Value"}
              value={val}
              onChange={(e) => updateParameter(key, key, e.target.value)}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => removeParameter(key)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        {Object.keys(value).length === 0 && (
          <div className="text-center py-4 text-muted-foreground text-sm">
            No parameters defined. Click "Add" to create one.
          </div>
        )}
      </div>
      {allowParameters && (
        <p className="text-xs text-muted-foreground">
          Use {`{{paramName}}`} in values to create parameters that can be filled when running the job.
        </p>
      )}
    </div>
  );
}

// ListInput component for managing arrays of strings
interface ListInputProps {
  label: string;
  placeholder?: string;
  value: string[];
  onChange: (value: string[]) => void;
  allowParameters?: boolean;
}

function ListInput({ label, placeholder, value, onChange, allowParameters = true }: ListInputProps) {
  const addItem = () => {
    onChange([...value, '']);
  };

  const removeItem = (index: number) => {
    const newValue = value.filter((_, i) => i !== index);
    onChange(newValue);
  };

  const updateItem = (index: number, newValue: string) => {
    const updated = [...value];
    updated[index] = newValue;
    onChange(updated);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <Button type="button" variant="outline" size="sm" onClick={addItem}>
          <Plus className="h-4 w-4 mr-1" />
          Add
        </Button>
      </div>
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {value.map((item, index) => (
          <div key={index} className="flex gap-2 items-center">
            <Input
              placeholder={placeholder || "Value"}
              value={item}
              onChange={(e) => updateItem(index, e.target.value)}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => removeItem(index)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        {value.length === 0 && (
          <div className="text-center py-4 text-muted-foreground text-sm">
            No items defined. Click "Add" to create one.
          </div>
        )}
      </div>
      {allowParameters && (
        <p className="text-xs text-muted-foreground">
          Use {`{{paramName}}`} in values to create parameters that can be filled when running the job.
        </p>
      )}
    </div>
  );
}

export default function JobPage() {
  const gravitino = getGravitinoClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Job Template states
  const [jobTemplates, setJobTemplates] = useState<string[]>([])
  const [templateDetails, setTemplateDetails] = useState<Record<string, JobTemplate>>({})
  const [selectedTemplate, setSelectedTemplate] = useState<JobTemplate | null>(null)
  const [showCreateTemplate, setShowCreateTemplate] = useState(false)
  const [newTemplate, setNewTemplate] = useState<Partial<JobTemplate>>({
    name: '',
    jobType: 'shell',
    executable: '',
    comment: '',
    arguments: [],
    environments: {},
    customFields: {},
    scripts: [],
    className: '',
    jars: [],
    files: [],
    archives: [],
    configs: {}
  })

  // Job states
  const [jobs, setJobs] = useState<Job[]>([])
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [showRunJob, setShowRunJob] = useState(false)
  const [runJobTemplate, setRunJobTemplate] = useState('')
  const [runJobParams, setRunJobParams] = useState<Record<string, any>>({})
  const [selectedTemplateForRun, setSelectedTemplateForRun] = useState<JobTemplate | null>(null)
  const [showTemplateDetails, setShowTemplateDetails] = useState(false)


  // Load job templates
  const loadJobTemplates = async () => {
    try {
      setLoading(true)
      setError(null)
      const templates = await gravitino.listJobTemplates()
      setJobTemplates(templates)
      
      // Load details for all templates
      const details: Record<string, JobTemplate> = {}
      for (const templateName of templates) {
        try {
          const template = await gravitino.getJobTemplate(templateName)
          details[templateName] = template
        } catch (err) {
          console.warn(`Failed to load details for template ${templateName}:`, err)
        }
      }
      setTemplateDetails(details)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load job templates')
    } finally {
      setLoading(false)
    }
  }

  // Load jobs
  const loadJobs = async () => {
    try {
      setLoading(true)
      setError(null)
      const jobList = await gravitino.listJobs()
      setJobs(jobList)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load jobs')
    } finally {
      setLoading(false)
    }
  }

  // Get job template details
  const getJobTemplate = async (templateName: string) => {
    const template = templateDetails[templateName]
    if (template) {
      setSelectedTemplate(template)
      setShowTemplateDetails(true)
    } else {
      setError('Template details not found')
    }
  }

  // Get job details
  const getJob = async (jobId: string) => {
    try {
      setLoading(true)
      setError(null)
      const job = await gravitino.getJob(jobId)
      setSelectedJob(job)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get job details')
    } finally {
      setLoading(false)
    }
  }

  // Register new job template
  const registerJobTemplate = async () => {
    try {
      setLoading(true)
      setError(null)
      await gravitino.registerJobTemplate(newTemplate as JobTemplate)
      setShowCreateTemplate(false)
      setNewTemplate({
        name: '',
        jobType: 'shell',
        executable: '',
        comment: '',
        arguments: [],
        environments: {},
        customFields: {},
        scripts: [],
        className: '',
        jars: [],
        files: [],
        archives: [],
        configs: {}
      })
      await loadJobTemplates()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to register job template')
    } finally {
      setLoading(false)
    }
  }

  // Delete job template
  const deleteJobTemplate = async (templateName: string) => {
    try {
      setLoading(true)
      setError(null)
      await gravitino.deleteJobTemplate(templateName)
      await loadJobTemplates()
      if (selectedTemplate?.name === templateName) {
        setSelectedTemplate(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete job template')
    } finally {
      setLoading(false)
    }
  }

  // Handle template selection for running jobs
  const handleTemplateSelection = async (templateName: string) => {
    setRunJobTemplate(templateName)
    const template = templateDetails[templateName]
    if (template) {
      setSelectedTemplateForRun(template)
      // Initialize parameters with empty values
      const parameters = extractParametersFromTemplate(template)
      const initialParams: Record<string, any> = {}
      parameters.forEach(param => {
        initialParams[param] = ''
      })
      setRunJobParams(initialParams)
    } else {
      setError('Template details not found')
    }
  }

  // Run job
  const runJob = async () => {
    try {
      setLoading(true)
      setError(null)
      await gravitino.runJob(runJobTemplate, runJobParams)
      setShowRunJob(false)
      setRunJobTemplate('')
      setRunJobParams({})
      setSelectedTemplateForRun(null)
      await loadJobs()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to run job')
    } finally {
      setLoading(false)
    }
  }

  // Cancel job
  const cancelJob = async (jobId: string) => {
    try {
      setLoading(true)
      setError(null)
      await gravitino.cancelJob(jobId)
      await loadJobs()
      if (selectedJob?.id === jobId) {
        setSelectedJob(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel job')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadJobTemplates()
    loadJobs()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'running':
        return 'default'
      case 'completed':
        return 'default'
      case 'failed':
        return 'destructive'
      case 'cancelled':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'running':
        return <Clock className="h-4 w-4" />
      case 'completed':
        return <CheckCircle className="h-4 w-4" />
      case 'failed':
        return <XCircle className="h-4 w-4" />
      case 'cancelled':
        return <Square className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Job Management</h1>
              <p className="text-muted-foreground">Manage job templates and monitor job executions</p>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Templates</CardTitle>
                <Edit className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{jobTemplates.length}</div>
                <p className="text-xs text-muted-foreground">
                  Job templates available
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
                <Play className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{jobs.length}</div>
                <p className="text-xs text-muted-foreground">
                  {jobs.filter(job => job.status === 'RUNNING').length} running, {jobs.filter(job => job.status === 'COMPLETED').length} completed
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Running Jobs</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{jobs.filter(job => job.status === 'RUNNING').length}</div>
                <p className="text-xs text-muted-foreground">
                  Currently executing
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Failed Jobs</CardTitle>
                <XCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{jobs.filter(job => job.status === 'FAILED').length}</div>
                <p className="text-xs text-muted-foreground">
                  Jobs that failed execution
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Main Content */}
          <Tabs defaultValue="templates" className="space-y-4">
            <TabsList>
              <TabsTrigger value="templates">Job Templates</TabsTrigger>
              <TabsTrigger value="jobs">Job Executions</TabsTrigger>
            </TabsList>

            {/* Job Templates Tab */}
            <TabsContent value="templates" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Job Templates</CardTitle>
                      <CardDescription>Manage job templates for execution</CardDescription>
                    </div>
                    <Dialog open={showCreateTemplate} onOpenChange={setShowCreateTemplate}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Create Template
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Create New Job Template</DialogTitle>
                          <DialogDescription>
                            Create a new job template for execution.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="templateName">Name</Label>
                            <Input
                              id="templateName"
                              value={newTemplate.name || ""}
                              onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
                              placeholder="Enter template name"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="templateType">Type</Label>
                            <Select
                              value={newTemplate.jobType}
                              onValueChange={(value) => setNewTemplate({ ...newTemplate, jobType: value as 'shell' | 'spark' })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select job type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="shell">Shell</SelectItem>
                                <SelectItem value="spark">Spark</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="templateExecutable">Executable</Label>
                            <Input
                              id="templateExecutable"
                              value={newTemplate.executable || ""}
                              onChange={(e) => setNewTemplate({...newTemplate, executable: e.target.value})}
                              placeholder="Executable command or jar path"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="templateComment">Comment</Label>
                            <Textarea
                              id="templateComment"
                              value={newTemplate.comment || ""}
                              onChange={(e) => setNewTemplate({...newTemplate, comment: e.target.value})}
                              placeholder="Optional comment"
                              rows={3}
                            />
                          </div>
                          <ListInput
                            label="Arguments"
                            placeholder="Enter argument (use {{paramName}} for parameters)"
                            value={newTemplate.arguments || []}
                            onChange={(value) => setNewTemplate({ ...newTemplate, arguments: value })}
                          />
                          <ParameterInput
                            label="Environment Variables"
                            placeholder="Enter value (use {{paramName}} for parameters)"
                            value={newTemplate.environments || {}}
                            onChange={(value) => setNewTemplate({ ...newTemplate, environments: value })}
                          />
                          <ParameterInput
                            label="Custom Fields"
                            placeholder="Enter value (use {{paramName}} for parameters)"
                            value={newTemplate.customFields || {}}
                            onChange={(value) => setNewTemplate({ ...newTemplate, customFields: value })}
                          />
                          {newTemplate.jobType === 'shell' && (
                            <ListInput
                              label="Scripts"
                              placeholder="Enter script path (use {{paramName}} for parameters)"
                              value={newTemplate.scripts || []}
                              onChange={(value) => setNewTemplate({ ...newTemplate, scripts: value })}
                            />
                          )}
                          {newTemplate.jobType === 'spark' && (
                            <>
                              <div className="space-y-2">
                                <Label htmlFor="templateClassName">Main Class</Label>
                                <Input
                                  id="templateClassName"
                                  value={newTemplate.className || ""}
                                  onChange={(e) => setNewTemplate({...newTemplate, className: e.target.value})}
                                  placeholder="Main class for Spark job"
                                />
                              </div>
                              <ParameterInput
                                label="Spark Configs"
                                placeholder="Enter config value (use {{paramName}} for parameters)"
                                value={newTemplate.configs || {}}
                                onChange={(value) => setNewTemplate({ ...newTemplate, configs: value })}
                              />
                            </>
                          )}
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setShowCreateTemplate(false)}>
                            Cancel
                          </Button>
                          <Button onClick={registerJobTemplate} disabled={loading || !newTemplate.name || !newTemplate.executable}>
                            {loading ? "Creating..." : "Create Template"}
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
                      placeholder="Search templates..."
                      className="pl-10"
                    />
                  </div>
                  
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></div>
                      <p className="mt-2 text-muted-foreground">Loading templates...</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Executable</TableHead>
                          <TableHead>Parameters</TableHead>
                          <TableHead>Comment</TableHead>
                          <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {jobTemplates.map((template) => {
                          const templateDetail = templateDetails[template]
                          return (
                            <TableRow key={template}>
                              <TableCell className="font-medium">{template}</TableCell>
                              <TableCell>
                                <Badge variant="outline">
                                  {templateDetail?.jobType || 'Unknown'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {templateDetail?.executable || '-'}
                              </TableCell>
                              <TableCell>
                                {templateDetail ? (
                                  <Badge variant="secondary">
                                    {extractParametersFromTemplate(templateDetail).length} params
                                  </Badge>
                                ) : '-'}
                              </TableCell>
                              <TableCell>{templateDetail?.comment || '-'}</TableCell>
                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent>
                                    <DropdownMenuItem onClick={() => getJobTemplate(template)}>
                                      <Eye className="h-4 w-4 mr-2" />
                                      View Details
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem 
                                      onClick={() => deleteJobTemplate(template)}
                                      className="text-destructive"
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>

              {/* Template Details Dialog */}
              <Dialog open={showTemplateDetails} onOpenChange={(open) => {
                setShowTemplateDetails(open)
                if (!open) setSelectedTemplate(null)
              }}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Template Details: {selectedTemplate?.name}</DialogTitle>
                    <DialogDescription>
                      View detailed information about this job template.
                    </DialogDescription>
                  </DialogHeader>
                  {selectedTemplate && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium">Name</Label>
                          <p className="text-sm text-muted-foreground">{selectedTemplate.name}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Type</Label>
                          <p className="text-sm text-muted-foreground">{selectedTemplate.jobType}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Executable</Label>
                          <p className="text-sm text-muted-foreground">{selectedTemplate.executable}</p>
                        </div>
                        {selectedTemplate.comment && (
                          <div>
                            <Label className="text-sm font-medium">Comment</Label>
                            <p className="text-sm text-muted-foreground">{selectedTemplate.comment}</p>
                          </div>
                        )}
                      </div>

                      {selectedTemplate.arguments && selectedTemplate.arguments.length > 0 && (
                        <div>
                          <Label className="text-sm font-medium">Arguments</Label>
                          <div className="mt-2 space-y-1">
                            {selectedTemplate.arguments.map((arg, index) => (
                              <div key={index} className="p-2 bg-muted rounded text-sm font-mono">
                                {arg}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedTemplate.environments && Object.keys(selectedTemplate.environments).length > 0 && (
                        <div>
                          <Label className="text-sm font-medium">Environment Variables</Label>
                          <div className="mt-2 space-y-1">
                            {Object.entries(selectedTemplate.environments).map(([key, value]) => (
                              <div key={key} className="p-2 bg-muted rounded text-sm">
                                <span className="font-medium">{key}:</span> <span className="font-mono">{value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedTemplate.customFields && Object.keys(selectedTemplate.customFields).length > 0 && (
                        <div>
                          <Label className="text-sm font-medium">Custom Fields</Label>
                          <div className="mt-2 space-y-1">
                            {Object.entries(selectedTemplate.customFields).map(([key, value]) => (
                              <div key={key} className="p-2 bg-muted rounded text-sm">
                                <span className="font-medium">{key}:</span> <span className="font-mono">{value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedTemplate.scripts && selectedTemplate.scripts.length > 0 && (
                        <div>
                          <Label className="text-sm font-medium">Scripts</Label>
                          <div className="mt-2 space-y-1">
                            {selectedTemplate.scripts.map((script, index) => (
                              <div key={index} className="p-2 bg-muted rounded text-sm font-mono">
                                {script}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedTemplate.jobType === 'spark' && selectedTemplate.className && (
                        <div>
                          <Label className="text-sm font-medium">Main Class</Label>
                          <p className="text-sm text-muted-foreground font-mono">{selectedTemplate.className}</p>
                        </div>
                      )}

                      {selectedTemplate.configs && Object.keys(selectedTemplate.configs).length > 0 && (
                        <div>
                          <Label className="text-sm font-medium">Spark Configs</Label>
                          <div className="mt-2 space-y-1">
                            {Object.entries(selectedTemplate.configs).map(([key, value]) => (
                              <div key={key} className="p-2 bg-muted rounded text-sm">
                                <span className="font-medium">{key}:</span> <span className="font-mono">{value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div>
                        <Label className="text-sm font-medium">Extracted Parameters</Label>
                        <div className="mt-2">
                          {extractParametersFromTemplate(selectedTemplate).length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {extractParametersFromTemplate(selectedTemplate).map((param) => (
                                <Badge key={param} variant="outline" className="font-mono">
                                  {`{{${param}}}`}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">No parameters found in this template.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  <DialogFooter>
                    <Button variant="outline" onClick={() => {
                      setShowTemplateDetails(false)
                      setSelectedTemplate(null)
                    }}>
                      Close
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </TabsContent>

            {/* Job Executions Tab */}
            <TabsContent value="jobs" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Job Executions</CardTitle>
                      <CardDescription>Monitor and manage job executions</CardDescription>
                    </div>
                    <Dialog open={showRunJob} onOpenChange={setShowRunJob}>
                      <DialogTrigger asChild>
                        <Button>
                          <Play className="h-4 w-4 mr-2" />
                          Run Job
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Run Job</DialogTitle>
                          <DialogDescription>
                            Execute a job from an existing template.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="runJobTemplate">Job Template</Label>
                            <Select
                              value={runJobTemplate}
                              onValueChange={handleTemplateSelection}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select a template" />
                              </SelectTrigger>
                              <SelectContent>
                                {jobTemplates.map((template) => (
                                  <SelectItem key={template} value={template}>
                                    {template}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          {selectedTemplateForRun && extractParametersFromTemplate(selectedTemplateForRun).length > 0 && (
                            <div className="space-y-4">
                              <Label>Template Parameters</Label>
                              <div className="space-y-3 p-4 border rounded-lg bg-muted/50">
                                {extractParametersFromTemplate(selectedTemplateForRun).map((param) => (
                                  <div key={param} className="space-y-2">
                                    <Label htmlFor={`param-${param}`} className="text-sm font-medium">
                                      {param}
                                    </Label>
                                    <Input
                                      id={`param-${param}`}
                                      value={runJobParams[param] || ''}
                                      onChange={(e) => setRunJobParams({
                                        ...runJobParams,
                                        [param]: e.target.value
                                      })}
                                      placeholder={`Enter value for ${param}`}
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {selectedTemplateForRun && extractParametersFromTemplate(selectedTemplateForRun).length === 0 && (
                            <div className="p-4 border rounded-lg bg-muted/50">
                              <p className="text-sm text-muted-foreground">
                                This template has no parameters. It will run with default values.
                              </p>
                            </div>
                          )}
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => {
                            setShowRunJob(false)
                            setRunJobTemplate('')
                            setRunJobParams({})
                            setSelectedTemplateForRun(null)
                          }}>
                            Cancel
                          </Button>
                          <Button onClick={runJob} disabled={loading || !runJobTemplate}>
                            {loading ? "Running..." : "Run Job"}
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
                      placeholder="Search jobs..."
                      className="pl-10"
                    />
                  </div>
                  
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></div>
                      <p className="mt-2 text-muted-foreground">Loading jobs...</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Job ID</TableHead>
                          <TableHead>Template</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Start Time</TableHead>
                          <TableHead>End Time</TableHead>
                          <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {jobs.map((job) => (
                          <TableRow key={job.id}>
                            <TableCell className="font-mono text-sm">{job.id}</TableCell>
                            <TableCell className="font-medium">{job.jobTemplateName}</TableCell>
                            <TableCell>
                              <Badge variant={getStatusColor(job.status)} className="flex items-center gap-1 w-fit">
                                {getStatusIcon(job.status)}
                                {job.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {job.startTime ? new Date(job.startTime).toLocaleString() : '-'}
                            </TableCell>
                            <TableCell>
                              {job.endTime ? new Date(job.endTime).toLocaleString() : '-'}
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                  <DropdownMenuItem onClick={() => getJob(job.id)}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Details
                                  </DropdownMenuItem>
                                  {job.status === 'RUNNING' && (
                                    <>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem 
                                        onClick={() => cancelJob(job.id)}
                                        className="text-destructive"
                                      >
                                        <Square className="h-4 w-4 mr-2" />
                                        Cancel Job
                                      </DropdownMenuItem>
                                    </>
                                  )}
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
          </Tabs>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}

