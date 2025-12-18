import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ANSI color codes for terminal output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    cyan: '\x1b[36m',
    dim: '\x1b[2m',
};

const c = {
    info: (text) => `${colors.cyan}${text}${colors.reset}`,
    bright: (text) => `${colors.bright}${text}${colors.reset}`,
    dim: (text) => `${colors.dim}${text}${colors.reset}`,
};

// Use DATABASE_PATH environment variable if set, otherwise use default location
const DB_PATH = process.env.DATABASE_PATH || path.join(__dirname, 'auth.db');
const INIT_SQL_PATH = path.join(__dirname, 'init.sql');

// Ensure database directory exists if custom path is provided
if (process.env.DATABASE_PATH) {
  const dbDir = path.dirname(DB_PATH);
  try {
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
      console.log(`Created database directory: ${dbDir}`);
    }
  } catch (error) {
    console.error(`Failed to create database directory ${dbDir}:`, error.message);
    throw error;
  }
}

// Create database connection
const db = new Database(DB_PATH);

// Show app installation path prominently
const appInstallPath = path.join(__dirname, '../..');
console.log('');
console.log(c.dim('═'.repeat(60)));
console.log(`${c.info('[INFO]')} App Installation: ${c.bright(appInstallPath)}`);
console.log(`${c.info('[INFO]')} Database: ${c.dim(path.relative(appInstallPath, DB_PATH))}`);
if (process.env.DATABASE_PATH) {
  console.log(`       ${c.dim('(Using custom DATABASE_PATH from environment)')}`);
}
console.log(c.dim('═'.repeat(60)));
console.log('');

const runMigrations = () => {
  try {
    // User table migrations
    const userTableInfo = db.prepare("PRAGMA table_info(users)").all();
    const userColumns = userTableInfo.map(col => col.name);

    if (!userColumns.includes('git_name')) {
      console.log('Running migration: Adding git_name column');
      db.exec('ALTER TABLE users ADD COLUMN git_name TEXT');
    }

    if (!userColumns.includes('git_email')) {
      console.log('Running migration: Adding git_email column');
      db.exec('ALTER TABLE users ADD COLUMN git_email TEXT');
    }

    if (!userColumns.includes('has_completed_onboarding')) {
      console.log('Running migration: Adding has_completed_onboarding column');
      db.exec('ALTER TABLE users ADD COLUMN has_completed_onboarding BOOLEAN DEFAULT 0');
    }

    // Agents table migrations - check if table exists first
    try {
      const agentsTableInfo = db.prepare("PRAGMA table_info(agents)").all();
      if (agentsTableInfo.length > 0) {
        const agentColumns = agentsTableInfo.map(col => col.name);

        if (!agentColumns.includes('source')) {
          console.log('Running migration: Adding source column to agents');
          db.exec("ALTER TABLE agents ADD COLUMN source TEXT DEFAULT 'database'");
          db.exec("CREATE INDEX IF NOT EXISTS idx_agents_source ON agents(source)");
        }

        if (!agentColumns.includes('category')) {
          console.log('Running migration: Adding category column to agents');
          db.exec("ALTER TABLE agents ADD COLUMN category TEXT DEFAULT 'general'");
          db.exec("CREATE INDEX IF NOT EXISTS idx_agents_category ON agents(category)");
        }
      }
    } catch (agentsMigrationError) {
      // Table might not exist yet, that's okay - it will be created by init.sql
      console.log('Agents table migrations skipped (table may not exist yet)');
    }

    console.log('Database migrations completed successfully');
  } catch (error) {
    console.error('Error running migrations:', error.message);
    throw error;
  }
};

// Initialize database with schema
const initializeDatabase = async () => {
  try {
    const initSQL = fs.readFileSync(INIT_SQL_PATH, 'utf8');
    db.exec(initSQL);
    console.log('Database initialized successfully');
    runMigrations();
  } catch (error) {
    console.error('Error initializing database:', error.message);
    throw error;
  }
};

// User database operations
const userDb = {
  // Check if any users exist
  hasUsers: () => {
    try {
      const row = db.prepare('SELECT COUNT(*) as count FROM users').get();
      return row.count > 0;
    } catch (err) {
      throw err;
    }
  },

  // Create a new user
  createUser: (username, passwordHash) => {
    try {
      const stmt = db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)');
      const result = stmt.run(username, passwordHash);
      return { id: result.lastInsertRowid, username };
    } catch (err) {
      throw err;
    }
  },

  // Get user by username
  getUserByUsername: (username) => {
    try {
      const row = db.prepare('SELECT * FROM users WHERE username = ? AND is_active = 1').get(username);
      return row;
    } catch (err) {
      throw err;
    }
  },

  // Update last login time
  updateLastLogin: (userId) => {
    try {
      db.prepare('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?').run(userId);
    } catch (err) {
      throw err;
    }
  },

  // Get user by ID
  getUserById: (userId) => {
    try {
      const row = db.prepare('SELECT id, username, created_at, last_login FROM users WHERE id = ? AND is_active = 1').get(userId);
      return row;
    } catch (err) {
      throw err;
    }
  },

  getFirstUser: () => {
    try {
      const row = db.prepare('SELECT id, username, created_at, last_login FROM users WHERE is_active = 1 LIMIT 1').get();
      return row;
    } catch (err) {
      throw err;
    }
  },

  updateGitConfig: (userId, gitName, gitEmail) => {
    try {
      const stmt = db.prepare('UPDATE users SET git_name = ?, git_email = ? WHERE id = ?');
      stmt.run(gitName, gitEmail, userId);
    } catch (err) {
      throw err;
    }
  },

  getGitConfig: (userId) => {
    try {
      const row = db.prepare('SELECT git_name, git_email FROM users WHERE id = ?').get(userId);
      return row;
    } catch (err) {
      throw err;
    }
  },

  completeOnboarding: (userId) => {
    try {
      const stmt = db.prepare('UPDATE users SET has_completed_onboarding = 1 WHERE id = ?');
      stmt.run(userId);
    } catch (err) {
      throw err;
    }
  },

  hasCompletedOnboarding: (userId) => {
    try {
      const row = db.prepare('SELECT has_completed_onboarding FROM users WHERE id = ?').get(userId);
      return row?.has_completed_onboarding === 1;
    } catch (err) {
      throw err;
    }
  }
};

// API Keys database operations
const apiKeysDb = {
  // Generate a new API key
  generateApiKey: () => {
    return 'ck_' + crypto.randomBytes(32).toString('hex');
  },

  // Create a new API key
  createApiKey: (userId, keyName) => {
    try {
      const apiKey = apiKeysDb.generateApiKey();
      const stmt = db.prepare('INSERT INTO api_keys (user_id, key_name, api_key) VALUES (?, ?, ?)');
      const result = stmt.run(userId, keyName, apiKey);
      return { id: result.lastInsertRowid, keyName, apiKey };
    } catch (err) {
      throw err;
    }
  },

  // Get all API keys for a user
  getApiKeys: (userId) => {
    try {
      const rows = db.prepare('SELECT id, key_name, api_key, created_at, last_used, is_active FROM api_keys WHERE user_id = ? ORDER BY created_at DESC').all(userId);
      return rows;
    } catch (err) {
      throw err;
    }
  },

  // Validate API key and get user
  validateApiKey: (apiKey) => {
    try {
      const row = db.prepare(`
        SELECT u.id, u.username, ak.id as api_key_id
        FROM api_keys ak
        JOIN users u ON ak.user_id = u.id
        WHERE ak.api_key = ? AND ak.is_active = 1 AND u.is_active = 1
      `).get(apiKey);

      if (row) {
        // Update last_used timestamp
        db.prepare('UPDATE api_keys SET last_used = CURRENT_TIMESTAMP WHERE id = ?').run(row.api_key_id);
      }

      return row;
    } catch (err) {
      throw err;
    }
  },

  // Delete an API key
  deleteApiKey: (userId, apiKeyId) => {
    try {
      const stmt = db.prepare('DELETE FROM api_keys WHERE id = ? AND user_id = ?');
      const result = stmt.run(apiKeyId, userId);
      return result.changes > 0;
    } catch (err) {
      throw err;
    }
  },

  // Toggle API key active status
  toggleApiKey: (userId, apiKeyId, isActive) => {
    try {
      const stmt = db.prepare('UPDATE api_keys SET is_active = ? WHERE id = ? AND user_id = ?');
      const result = stmt.run(isActive ? 1 : 0, apiKeyId, userId);
      return result.changes > 0;
    } catch (err) {
      throw err;
    }
  }
};

// User credentials database operations (for GitHub tokens, GitLab tokens, etc.)
const credentialsDb = {
  // Create a new credential
  createCredential: (userId, credentialName, credentialType, credentialValue, description = null) => {
    try {
      const stmt = db.prepare('INSERT INTO user_credentials (user_id, credential_name, credential_type, credential_value, description) VALUES (?, ?, ?, ?, ?)');
      const result = stmt.run(userId, credentialName, credentialType, credentialValue, description);
      return { id: result.lastInsertRowid, credentialName, credentialType };
    } catch (err) {
      throw err;
    }
  },

  // Get all credentials for a user, optionally filtered by type
  getCredentials: (userId, credentialType = null) => {
    try {
      let query = 'SELECT id, credential_name, credential_type, description, created_at, is_active FROM user_credentials WHERE user_id = ?';
      const params = [userId];

      if (credentialType) {
        query += ' AND credential_type = ?';
        params.push(credentialType);
      }

      query += ' ORDER BY created_at DESC';

      const rows = db.prepare(query).all(...params);
      return rows;
    } catch (err) {
      throw err;
    }
  },

  // Get active credential value for a user by type (returns most recent active)
  getActiveCredential: (userId, credentialType) => {
    try {
      const row = db.prepare('SELECT credential_value FROM user_credentials WHERE user_id = ? AND credential_type = ? AND is_active = 1 ORDER BY created_at DESC LIMIT 1').get(userId, credentialType);
      return row?.credential_value || null;
    } catch (err) {
      throw err;
    }
  },

  // Delete a credential
  deleteCredential: (userId, credentialId) => {
    try {
      const stmt = db.prepare('DELETE FROM user_credentials WHERE id = ? AND user_id = ?');
      const result = stmt.run(credentialId, userId);
      return result.changes > 0;
    } catch (err) {
      throw err;
    }
  },

  // Toggle credential active status
  toggleCredential: (userId, credentialId, isActive) => {
    try {
      const stmt = db.prepare('UPDATE user_credentials SET is_active = ? WHERE id = ? AND user_id = ?');
      const result = stmt.run(isActive ? 1 : 0, credentialId, userId);
      return result.changes > 0;
    } catch (err) {
      throw err;
    }
  }
};

// Agent templates that will be seeded for new users
const AGENT_TEMPLATES = [
  {
    name: 'code-reviewer',
    displayName: 'Code Reviewer',
    description: 'Reviews code for quality, security, and best practices',
    systemPrompt: `You are an expert code reviewer. Focus on:
- Code quality and readability
- Security vulnerabilities (OWASP top 10)
- Performance optimizations
- Best practices and design patterns
- Potential bugs and edge cases

Always provide specific, actionable feedback with code examples.`
  },
  {
    name: 'bug-fixer',
    displayName: 'Bug Fixer',
    description: 'Systematic debugging and fix suggestions',
    systemPrompt: `You are a debugging expert. Your approach:
- Analyze the error/bug systematically
- Identify root causes, not just symptoms
- Provide step-by-step fix instructions
- Explain why the bug occurred
- Suggest preventive measures

Be thorough but focused on solving the immediate issue.`
  },
  {
    name: 'doc-writer',
    displayName: 'Documentation Writer',
    description: 'Generate documentation, comments, and README files',
    systemPrompt: `You are a technical documentation specialist. You excel at:
- Writing clear, concise documentation
- Creating comprehensive README files
- Adding helpful code comments
- Generating API documentation
- Writing usage examples

Focus on clarity and completeness while avoiding unnecessary verbosity.`
  },
  {
    name: 'refactorer',
    displayName: 'Refactorer',
    description: 'Code optimization and restructuring',
    systemPrompt: `You are a refactoring expert. Focus on:
- Improving code structure and organization
- Reducing complexity and duplication
- Applying SOLID principles
- Optimizing performance
- Maintaining backwards compatibility

Always explain the reasoning behind refactoring decisions.`
  },
  {
    name: 'test-writer',
    displayName: 'Test Writer',
    description: 'Generate unit tests and test scenarios',
    systemPrompt: `You are a testing expert. Your focus:
- Writing comprehensive unit tests
- Identifying edge cases and boundary conditions
- Creating meaningful test descriptions
- Using appropriate testing patterns (AAA, etc.)
- Achieving good code coverage

Prioritize test quality over quantity.`
  }
];

// Agents database operations
const agentsDb = {
  // Create a new agent
  createAgent: (userId, name, displayName, description, systemPrompt, isTemplate = false) => {
    try {
      const stmt = db.prepare('INSERT INTO agents (user_id, name, display_name, description, system_prompt, is_template) VALUES (?, ?, ?, ?, ?, ?)');
      const result = stmt.run(userId, name, displayName, description, systemPrompt, isTemplate ? 1 : 0);
      return { id: result.lastInsertRowid, name, displayName, description, systemPrompt, isTemplate };
    } catch (err) {
      throw err;
    }
  },

  // Get all agents for a user
  getAgents: (userId) => {
    try {
      const rows = db.prepare('SELECT id, name, display_name, description, system_prompt, is_template, is_active, created_at, updated_at FROM agents WHERE user_id = ? ORDER BY is_template DESC, display_name ASC').all(userId);
      return rows.map(row => ({
        id: row.id,
        name: row.name,
        displayName: row.display_name,
        description: row.description,
        systemPrompt: row.system_prompt,
        isTemplate: row.is_template === 1,
        isActive: row.is_active === 1,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }));
    } catch (err) {
      throw err;
    }
  },

  // Get agent by name for a user
  getAgentByName: (userId, name) => {
    try {
      const row = db.prepare('SELECT id, name, display_name, description, system_prompt, is_template, is_active FROM agents WHERE user_id = ? AND name = ? AND is_active = 1').get(userId, name);
      if (!row) return null;
      return {
        id: row.id,
        name: row.name,
        displayName: row.display_name,
        description: row.description,
        systemPrompt: row.system_prompt,
        isTemplate: row.is_template === 1,
        isActive: row.is_active === 1
      };
    } catch (err) {
      throw err;
    }
  },

  // Get agent by ID
  getAgentById: (agentId) => {
    try {
      const row = db.prepare('SELECT id, user_id, name, display_name, description, system_prompt, is_template, is_active FROM agents WHERE id = ?').get(agentId);
      if (!row) return null;
      return {
        id: row.id,
        userId: row.user_id,
        name: row.name,
        displayName: row.display_name,
        description: row.description,
        systemPrompt: row.system_prompt,
        isTemplate: row.is_template === 1,
        isActive: row.is_active === 1
      };
    } catch (err) {
      throw err;
    }
  },

  // Update an agent
  updateAgent: (userId, agentId, updates) => {
    try {
      const { name, displayName, description, systemPrompt, isActive } = updates;
      const fields = [];
      const values = [];

      if (name !== undefined) { fields.push('name = ?'); values.push(name); }
      if (displayName !== undefined) { fields.push('display_name = ?'); values.push(displayName); }
      if (description !== undefined) { fields.push('description = ?'); values.push(description); }
      if (systemPrompt !== undefined) { fields.push('system_prompt = ?'); values.push(systemPrompt); }
      if (isActive !== undefined) { fields.push('is_active = ?'); values.push(isActive ? 1 : 0); }

      fields.push('updated_at = CURRENT_TIMESTAMP');
      values.push(agentId, userId);

      const stmt = db.prepare(`UPDATE agents SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`);
      const result = stmt.run(...values);
      return result.changes > 0;
    } catch (err) {
      throw err;
    }
  },

  // Delete an agent
  deleteAgent: (userId, agentId) => {
    try {
      const stmt = db.prepare('DELETE FROM agents WHERE id = ? AND user_id = ?');
      const result = stmt.run(agentId, userId);
      return result.changes > 0;
    } catch (err) {
      throw err;
    }
  },

  // Seed template agents for a user
  seedTemplates: (userId) => {
    try {
      const existingAgents = agentsDb.getAgents(userId);
      const existingNames = new Set(existingAgents.map(a => a.name));

      for (const template of AGENT_TEMPLATES) {
        if (!existingNames.has(template.name)) {
          agentsDb.createAgent(
            userId,
            template.name,
            template.displayName,
            template.description,
            template.systemPrompt,
            true // isTemplate
          );
        }
      }
      return true;
    } catch (err) {
      console.error('Error seeding agent templates:', err);
      return false;
    }
  },

  // Get template definitions (not from DB, just the templates)
  getTemplateDefinitions: () => {
    return AGENT_TEMPLATES;
  }
};

// Backward compatibility - keep old names pointing to new system
const githubTokensDb = {
  createGithubToken: (userId, tokenName, githubToken, description = null) => {
    return credentialsDb.createCredential(userId, tokenName, 'github_token', githubToken, description);
  },
  getGithubTokens: (userId) => {
    return credentialsDb.getCredentials(userId, 'github_token');
  },
  getActiveGithubToken: (userId) => {
    return credentialsDb.getActiveCredential(userId, 'github_token');
  },
  deleteGithubToken: (userId, tokenId) => {
    return credentialsDb.deleteCredential(userId, tokenId);
  },
  toggleGithubToken: (userId, tokenId, isActive) => {
    return credentialsDb.toggleCredential(userId, tokenId, isActive);
  }
};

export {
  db,
  initializeDatabase,
  userDb,
  apiKeysDb,
  credentialsDb,
  githubTokensDb, // Backward compatibility
  agentsDb
};