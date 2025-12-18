import express from 'express';
import { agentsDb, userDb } from '../database/db.js';
import agentLoader from '../../agents/index.js';

const router = express.Router();

// GET /api/agents - List all agents for user
router.get('/', async (req, res) => {
  try {
    // Get user from auth middleware or use first user for now
    const user = req.user || userDb.getFirstUser();
    if (!user) {
      return res.status(401).json({ success: false, error: 'User not authenticated' });
    }

    // Seed templates if this is the first time
    agentsDb.seedTemplates(user.id);

    // Get database agents
    const dbAgents = agentsDb.getAgents(user.id);

    // Get file-based agents
    const fileAgents = agentLoader.listAgents().map(agent => ({
      id: `file:${agent.name}`,
      name: agent.name,
      displayName: agent.displayName,
      description: agent.description,
      category: agent.category,
      isTemplate: true,
      isActive: true,
      source: 'file'
    }));

    // Combine both sources (file-based agents first as they are specialized)
    const allAgents = [...fileAgents, ...dbAgents.map(a => ({ ...a, source: 'database' }))];

    res.json({ success: true, agents: allAgents });
  } catch (error) {
    console.error('Error fetching agents:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/agents/templates - Get pre-defined template definitions
router.get('/templates', async (req, res) => {
  try {
    const dbTemplates = agentsDb.getTemplateDefinitions();
    const fileAgents = agentLoader.listAgents();

    res.json({
      success: true,
      templates: dbTemplates,
      fileBasedAgents: fileAgents
    });
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/agents/:id - Get agent details
router.get('/:id', async (req, res) => {
  try {
    const idParam = req.params.id;

    // Check if it's a file-based agent (id starts with "file:")
    if (idParam.startsWith('file:')) {
      const agentName = idParam.substring(5); // Remove "file:" prefix
      const agentConfig = agentLoader.loadAgent(agentName);

      if (!agentConfig || !agentConfig.persona) {
        return res.status(404).json({ success: false, error: 'File-based agent not found' });
      }

      const metadata = agentLoader.getAgentMetadata(agentName);

      res.json({
        success: true,
        agent: {
          id: idParam,
          name: agentConfig.name,
          displayName: metadata.displayName || agentConfig.name,
          description: metadata.description || '',
          category: metadata.category || 'general',
          systemPrompt: agentConfig.systemPrompt,
          isTemplate: true,
          isActive: true,
          source: 'file',
          knowledge: agentConfig.knowledge.map(k => k.name),
          skills: agentConfig.skills.map(s => s.name),
          workflows: agentConfig.workflows.map(w => w.name)
        }
      });
      return;
    }

    // Database agent
    const agentId = parseInt(idParam, 10);
    if (isNaN(agentId)) {
      return res.status(400).json({ success: false, error: 'Invalid agent ID' });
    }

    const agent = agentsDb.getAgentById(agentId);
    if (!agent) {
      return res.status(404).json({ success: false, error: 'Agent not found' });
    }

    res.json({ success: true, agent: { ...agent, source: 'database' } });
  } catch (error) {
    console.error('Error fetching agent:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/agents - Create new agent
router.post('/', async (req, res) => {
  try {
    const user = req.user || userDb.getFirstUser();
    if (!user) {
      return res.status(401).json({ success: false, error: 'User not authenticated' });
    }

    const { name, displayName, description, systemPrompt } = req.body;

    // Validate required fields
    if (!name || !displayName || !systemPrompt) {
      return res.status(400).json({
        success: false,
        error: 'Name, displayName, and systemPrompt are required'
      });
    }

    // Validate name format (lowercase, hyphens only)
    const nameRegex = /^[a-z0-9-]+$/;
    if (!nameRegex.test(name)) {
      return res.status(400).json({
        success: false,
        error: 'Name must be lowercase letters, numbers, and hyphens only'
      });
    }

    // Check if name already exists
    const existing = agentsDb.getAgentByName(user.id, name);
    if (existing) {
      return res.status(409).json({
        success: false,
        error: 'An agent with this name already exists'
      });
    }

    const agent = agentsDb.createAgent(
      user.id,
      name,
      displayName,
      description || '',
      systemPrompt,
      false // Not a template
    );

    res.status(201).json({ success: true, agent });
  } catch (error) {
    console.error('Error creating agent:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/agents/:id - Update agent
router.put('/:id', async (req, res) => {
  try {
    const user = req.user || userDb.getFirstUser();
    if (!user) {
      return res.status(401).json({ success: false, error: 'User not authenticated' });
    }

    const agentId = parseInt(req.params.id, 10);
    if (isNaN(agentId)) {
      return res.status(400).json({ success: false, error: 'Invalid agent ID' });
    }

    const { name, displayName, description, systemPrompt, isActive } = req.body;

    // Validate name format if provided
    if (name) {
      const nameRegex = /^[a-z0-9-]+$/;
      if (!nameRegex.test(name)) {
        return res.status(400).json({
          success: false,
          error: 'Name must be lowercase letters, numbers, and hyphens only'
        });
      }
    }

    const updated = agentsDb.updateAgent(user.id, agentId, {
      name,
      displayName,
      description,
      systemPrompt,
      isActive
    });

    if (!updated) {
      return res.status(404).json({ success: false, error: 'Agent not found or not owned by user' });
    }

    const agent = agentsDb.getAgentById(agentId);
    res.json({ success: true, agent });
  } catch (error) {
    console.error('Error updating agent:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/agents/:id - Delete agent
router.delete('/:id', async (req, res) => {
  try {
    const user = req.user || userDb.getFirstUser();
    if (!user) {
      return res.status(401).json({ success: false, error: 'User not authenticated' });
    }

    const agentId = parseInt(req.params.id, 10);
    if (isNaN(agentId)) {
      return res.status(400).json({ success: false, error: 'Invalid agent ID' });
    }

    const deleted = agentsDb.deleteAgent(user.id, agentId);

    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Agent not found or not owned by user' });
    }

    res.json({ success: true, message: 'Agent deleted successfully' });
  } catch (error) {
    console.error('Error deleting agent:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
