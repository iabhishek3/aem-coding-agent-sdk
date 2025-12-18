/**
 * Agent Configuration Loader
 *
 * This module loads and assembles agent configurations from the folder structure:
 * - personas/    - Agent personality, role, and behavior definitions
 * - knowledge/   - Domain-specific knowledge bases
 * - skills/      - Specific capabilities and techniques
 * - workflows/   - Step-by-step process definitions
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Load a markdown/text file and return its contents
 */
function loadFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, 'utf8');
    }
  } catch (error) {
    console.error(`Error loading file ${filePath}:`, error.message);
  }
  return null;
}

/**
 * Load JSON configuration file
 */
function loadJsonConfig(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
  } catch (error) {
    console.error(`Error loading JSON ${filePath}:`, error.message);
  }
  return null;
}

/**
 * Load all files from a directory matching a pattern
 */
function loadDirectory(dirPath, extension = '.md') {
  const contents = [];
  try {
    if (fs.existsSync(dirPath)) {
      const files = fs.readdirSync(dirPath).filter(f => f.endsWith(extension));
      for (const file of files) {
        const content = loadFile(path.join(dirPath, file));
        if (content) {
          contents.push({
            name: path.basename(file, extension),
            content
          });
        }
      }
    }
  } catch (error) {
    console.error(`Error loading directory ${dirPath}:`, error.message);
  }
  return contents;
}

/**
 * Load a complete agent configuration by name
 * @param {string} agentName - Name of the agent (folder name under each category)
 * @returns {Object} Complete agent configuration
 */
export function loadAgent(agentName) {
  const agentConfig = {
    name: agentName,
    persona: null,
    knowledge: [],
    skills: [],
    workflows: [],
    systemPrompt: ''
  };

  // Load persona
  const personaPath = path.join(__dirname, 'personas', `${agentName}.md`);
  agentConfig.persona = loadFile(personaPath);

  // Load knowledge base files
  const knowledgePath = path.join(__dirname, 'knowledge', agentName);
  agentConfig.knowledge = loadDirectory(knowledgePath);

  // Load skills
  const skillsPath = path.join(__dirname, 'skills', agentName);
  agentConfig.skills = loadDirectory(skillsPath);

  // Load workflows
  const workflowsPath = path.join(__dirname, 'workflows', agentName);
  agentConfig.workflows = loadDirectory(workflowsPath);

  // Assemble the complete system prompt
  agentConfig.systemPrompt = assembleSystemPrompt(agentConfig);

  return agentConfig;
}

/**
 * Assemble a complete system prompt from agent components
 */
function assembleSystemPrompt(config) {
  const parts = [];

  // Add persona
  if (config.persona) {
    parts.push('# PERSONA & ROLE\n' + config.persona);
  }

  // Add knowledge base
  if (config.knowledge.length > 0) {
    parts.push('\n# KNOWLEDGE BASE');
    for (const kb of config.knowledge) {
      parts.push(`\n## ${kb.name}\n${kb.content}`);
    }
  }

  // Add skills
  if (config.skills.length > 0) {
    parts.push('\n# SKILLS & CAPABILITIES');
    for (const skill of config.skills) {
      parts.push(`\n## ${skill.name}\n${skill.content}`);
    }
  }

  // Add workflows
  if (config.workflows.length > 0) {
    parts.push('\n# WORKFLOWS & PROCESSES');
    for (const workflow of config.workflows) {
      parts.push(`\n## ${workflow.name}\n${workflow.content}`);
    }
  }

  return parts.join('\n\n');
}

/**
 * Get list of all available agents
 */
export function listAgents() {
  const agents = [];
  const personasDir = path.join(__dirname, 'personas');

  try {
    if (fs.existsSync(personasDir)) {
      const files = fs.readdirSync(personasDir).filter(f => f.endsWith('.md'));
      for (const file of files) {
        const name = path.basename(file, '.md');
        const config = loadJsonConfig(path.join(__dirname, 'personas', `${name}.json`));
        agents.push({
          name,
          displayName: config?.displayName || name,
          description: config?.description || '',
          category: config?.category || 'general'
        });
      }
    }
  } catch (error) {
    console.error('Error listing agents:', error.message);
  }

  return agents;
}

/**
 * Get agent metadata without loading full content
 */
export function getAgentMetadata(agentName) {
  const configPath = path.join(__dirname, 'personas', `${agentName}.json`);
  return loadJsonConfig(configPath) || {
    name: agentName,
    displayName: agentName,
    description: ''
  };
}

export default {
  loadAgent,
  listAgents,
  getAgentMetadata
};
