import React from 'react';

interface TestItem {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
}

interface TestItemListProps {
  items: TestItem[];
  onStatusChange?: (id: string, newStatus: TestItem['status']) => void;
}

const statusColors: Record<TestItem['status'], string> = {
  pending: '#9ca3af',
  running: '#3b82f6',
  completed: '#10b981',
  failed: '#ef4444',
};

export const TestItemList: React.FC<TestItemListProps> = ({ items, onStatusChange }) => {
  if (items.length === 0) {
    return (
      <div className="test-item-list empty">
        <p>No test items found.</p>
      </div>
    );
  }

  return (
    <ul className="test-item-list">
      {items.map((item) => (
        <li key={item.id} className={`test-item status-${item.status}`}>
          <span className="test-item-name">{item.name}</span>
          <span 
            className="test-item-status" 
            style={{ backgroundColor: statusColors[item.status] }}
            aria-label={`Status: ${item.status}`}
          />
          {onStatusChange && (
            <button
              className="test-item-action"
              onClick={() => onStatusChange(item.id, item.status === 'completed' ? 'pending' : 'completed')}
              aria-label={`Mark as ${item.status === 'completed' ? 'pending' : 'completed'}`}
            >
              {item.status === 'completed' ? '↺' : '✓'}
            </button>
          )}
        </li>
      ))}
    </ul>
  );
};

export default TestItemList;