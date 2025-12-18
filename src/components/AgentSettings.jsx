import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Bot, Plus, Trash2, Edit2, Copy, Check, Sparkles, Save, X } from 'lucide-react';
import { authenticatedFetch } from '../utils/api';

function AgentSettings() {
  const [agents, setAgents] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewAgentForm, setShowNewAgentForm] = useState(false);
  const [editingAgent, setEditingAgent] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    description: '',
    systemPrompt: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch agents
      const agentsRes = await authenticatedFetch('/api/agents');
      const agentsData = await agentsRes.json();
      setAgents(agentsData.agents || []);

      // Fetch templates
      const templatesRes = await authenticatedFetch('/api/agents/templates');
      const templatesData = await templatesRes.json();
      setTemplates(templatesData.templates || []);
    } catch (error) {
      console.error('Error fetching agents:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      displayName: '',
      description: '',
      systemPrompt: ''
    });
  };

  const handleStartFromTemplate = (template) => {
    setFormData({
      name: '',
      displayName: template.displayName + ' (Custom)',
      description: template.description,
      systemPrompt: template.systemPrompt
    });
    setShowNewAgentForm(true);
    setEditingAgent(null);
  };

  const handleEditAgent = (agent) => {
    setFormData({
      name: agent.name,
      displayName: agent.displayName,
      description: agent.description || '',
      systemPrompt: agent.systemPrompt
    });
    setEditingAgent(agent);
    setShowNewAgentForm(true);
  };

  const handleCreateAgent = async () => {
    if (!formData.name.trim() || !formData.displayName.trim() || !formData.systemPrompt.trim()) {
      alert('Name, Display Name, and System Prompt are required');
      return;
    }

    try {
      const res = await authenticatedFetch('/api/agents', {
        method: 'POST',
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (data.success) {
        resetForm();
        setShowNewAgentForm(false);
        fetchData();
      } else {
        alert(data.error || 'Failed to create agent');
      }
    } catch (error) {
      console.error('Error creating agent:', error);
      alert('Failed to create agent');
    }
  };

  const handleUpdateAgent = async () => {
    if (!formData.displayName.trim() || !formData.systemPrompt.trim()) {
      alert('Display Name and System Prompt are required');
      return;
    }

    try {
      const res = await authenticatedFetch(`/api/agents/${editingAgent.id}`, {
        method: 'PUT',
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (data.success) {
        resetForm();
        setShowNewAgentForm(false);
        setEditingAgent(null);
        fetchData();
      } else {
        alert(data.error || 'Failed to update agent');
      }
    } catch (error) {
      console.error('Error updating agent:', error);
      alert('Failed to update agent');
    }
  };

  const handleDeleteAgent = async (agentId) => {
    if (!confirm('Are you sure you want to delete this agent?')) return;

    try {
      await authenticatedFetch(`/api/agents/${agentId}`, {
        method: 'DELETE'
      });
      fetchData();
    } catch (error) {
      console.error('Error deleting agent:', error);
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const generateSlug = (displayName) => {
    return displayName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-blue-500" />
          <h3 className="text-lg font-semibold">AI Agents</h3>
        </div>
        {!showNewAgentForm && (
          <Button
            onClick={() => {
              resetForm();
              setEditingAgent(null);
              setShowNewAgentForm(true);
            }}
            size="sm"
            className="flex items-center gap-1"
          >
            <Plus className="h-4 w-4" />
            New Agent
          </Button>
        )}
      </div>

      <p className="text-sm text-muted-foreground">
        Create custom AI agents with specific personas. Use <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">@agent-name</code> in chat to activate an agent.
      </p>

      {/* New/Edit Agent Form */}
      {showNewAgentForm && (
        <div className="border rounded-lg p-4 space-y-4 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">{editingAgent ? 'Edit Agent' : 'Create New Agent'}</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowNewAgentForm(false);
                setEditingAgent(null);
                resetForm();
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Start from template dropdown */}
          {!editingAgent && templates.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-1">Start from template</label>
              <select
                className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-900 dark:border-gray-700"
                onChange={(e) => {
                  const template = templates.find(t => t.name === e.target.value);
                  if (template) handleStartFromTemplate(template);
                }}
                value=""
              >
                <option value="">Select a template...</option>
                {templates.map(t => (
                  <option key={t.name} value={t.name}>{t.displayName}</option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="my-agent"
                disabled={editingAgent?.isTemplate}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Lowercase, hyphens only. Used for @mention
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Display Name <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.displayName}
                onChange={(e) => {
                  const displayName = e.target.value;
                  setFormData({
                    ...formData,
                    displayName,
                    name: editingAgent ? formData.name : generateSlug(displayName)
                  });
                }}
                placeholder="My Custom Agent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <Input
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="What does this agent do?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              System Prompt <span className="text-red-500">*</span>
            </label>
            <textarea
              className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-900 dark:border-gray-700 min-h-[200px] font-mono text-sm"
              value={formData.systemPrompt}
              onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
              placeholder="You are an expert..."
            />
            <p className="text-xs text-muted-foreground mt-1">
              Instructions that define how the agent behaves. This is prepended to every conversation.
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowNewAgentForm(false);
                setEditingAgent(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={editingAgent ? handleUpdateAgent : handleCreateAgent}>
              <Save className="h-4 w-4 mr-1" />
              {editingAgent ? 'Save Changes' : 'Create Agent'}
            </Button>
          </div>
        </div>
      )}

      {/* Agents List */}
      <div className="space-y-2">
        {agents.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No agents yet. Create one or start from a template!
          </p>
        ) : (
          agents.map(agent => (
            <div
              key={agent.id}
              className="flex items-start justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{agent.displayName}</span>
                  {agent.isTemplate && (
                    <span className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 px-1.5 py-0.5 rounded">
                      Template
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <code className="text-xs bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
                    @{agent.name}
                  </code>
                  <button
                    onClick={() => copyToClipboard(`@${agent.name}`, agent.id)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {copiedId === agent.id ? (
                      <Check className="h-3 w-3 text-green-500" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </button>
                </div>
                {agent.description && (
                  <p className="text-sm text-muted-foreground mt-1 truncate">
                    {agent.description}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1 ml-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEditAgent(agent)}
                  title="Edit agent"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                {!agent.isTemplate && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteAgent(agent.id)}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    title="Delete agent"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Quick Templates Section */}
      {!showNewAgentForm && templates.length > 0 && (
        <div className="border-t pt-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-yellow-500" />
            <span className="text-sm font-medium">Quick Start Templates</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {templates.map(template => (
              <button
                key={template.name}
                onClick={() => handleStartFromTemplate(template)}
                className="text-xs px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                {template.displayName}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default AgentSettings;
