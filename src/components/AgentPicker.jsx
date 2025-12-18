import { useState, useEffect, useRef } from 'react';
import { Bot, X } from 'lucide-react';
import { authenticatedFetch } from '../utils/api';

/**
 * AgentPicker - Dropdown component for selecting AI agents via @mention
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the picker is visible
 * @param {Function} props.onSelect - Callback when an agent is selected
 * @param {Function} props.onClose - Callback when picker is closed
 * @param {string} props.searchQuery - Current search/filter query
 * @param {Object} props.position - Position for the dropdown { top, left }
 */
function AgentPicker({ isOpen, onSelect, onClose, searchQuery = '', position = {} }) {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      fetchAgents();
    }
  }, [isOpen]);

  useEffect(() => {
    // Reset selection when search query changes
    setSelectedIndex(0);
  }, [searchQuery]);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const res = await authenticatedFetch('/api/agents');
      const data = await res.json();
      setAgents(data.agents || []);
    } catch (error) {
      console.error('Error fetching agents:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter agents based on search query
  const filteredAgents = agents.filter(agent => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      agent.name.toLowerCase().includes(query) ||
      agent.displayName.toLowerCase().includes(query) ||
      (agent.description && agent.description.toLowerCase().includes(query))
    );
  });

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev =>
          prev < filteredAgents.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : 0);
      } else if (e.key === 'Enter' && filteredAgents.length > 0) {
        e.preventDefault();
        onSelect(filteredAgents[selectedIndex]);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredAgents, selectedIndex, onSelect, onClose]);

  // Scroll selected item into view
  useEffect(() => {
    if (containerRef.current && filteredAgents.length > 0) {
      const selectedElement = containerRef.current.children[selectedIndex];
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex, filteredAgents.length]);

  if (!isOpen) return null;

  return (
    <div
      className="absolute z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden"
      style={{
        bottom: position.bottom || 'auto',
        left: position.left || 0,
        top: position.top || 'auto',
        minWidth: '280px',
        maxWidth: '400px',
        maxHeight: '300px'
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          <Bot className="h-4 w-4" />
          Select Agent
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Agent List */}
      <div
        ref={containerRef}
        className="overflow-y-auto"
        style={{ maxHeight: '250px' }}
      >
        {loading ? (
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredAgents.length === 0 ? (
          <div className="p-4 text-center text-sm text-gray-500">
            {searchQuery ? `No agents matching "${searchQuery}"` : 'No agents available'}
          </div>
        ) : (
          filteredAgents.map((agent, index) => (
            <button
              key={agent.id}
              onClick={() => onSelect(agent)}
              className={`w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors ${
                index === selectedIndex ? 'bg-blue-50 dark:bg-blue-900/30' : ''
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900 dark:text-white text-sm">
                  {agent.displayName}
                </span>
                {agent.isTemplate && (
                  <span className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 px-1 py-0.5 rounded">
                    Template
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <code className="text-xs text-gray-500 dark:text-gray-400">
                  @{agent.name}
                </code>
              </div>
              {agent.description && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                  {agent.description}
                </p>
              )}
            </button>
          ))
        )}
      </div>

      {/* Footer hint */}
      <div className="px-3 py-1.5 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
        <p className="text-xs text-gray-500">
          <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">↑↓</kbd> navigate
          <span className="mx-2">·</span>
          <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">↵</kbd> select
          <span className="mx-2">·</span>
          <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">esc</kbd> close
        </p>
      </div>
    </div>
  );
}

export default AgentPicker;
