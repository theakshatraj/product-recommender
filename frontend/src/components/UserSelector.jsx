import { useState, useEffect, useRef } from 'react';
import { ChevronDown, Search, User } from 'lucide-react';
import { useUser } from '../contexts/UserContext';

const UserSelector = ({ className = '' }) => {
  const { selectedUser, users, changeUser, loading } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);


  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUserSelect = (user) => {
    changeUser(user.id);
    localStorage.setItem('selectedUserId', user.id.toString());
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  if (loading) {
    return (
      <div className={`flex items-center space-x-2 px-3 py-2 bg-neutral-100 rounded-lg ${className}`}>
        <div className="w-8 h-8 bg-neutral-200 rounded-full animate-pulse"></div>
        <div className="w-20 h-4 bg-neutral-200 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 bg-white border border-neutral-300 rounded-lg hover:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-colors"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Select user"
      >
        {selectedUser ? (
          <>
            <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
              {getInitials(selectedUser.name)}
            </div>
            <div className="text-left">
              <div className="text-sm font-medium text-neutral-900">{selectedUser.name}</div>
              <div className="text-xs text-neutral-700">{selectedUser.email}</div>
            </div>
          </>
        ) : (
          <>
            <User className="w-5 h-5 text-neutral-700" />
            <span className="text-sm text-neutral-700">Select user</span>
          </>
        )}
        <ChevronDown className={`w-4 h-4 text-neutral-700 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-neutral-300 rounded-lg shadow-lg z-50 max-h-80 overflow-hidden">
          <div className="p-3 border-b border-neutral-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full pl-9 pr-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                aria-label="Search users"
              />
            </div>
          </div>
          
          <div className="max-h-60 overflow-y-auto">
            {filteredUsers.length === 0 ? (
              <div className="p-4 text-center text-sm text-neutral-700">
                No users found
              </div>
            ) : (
              <ul role="listbox" className="py-1">
                {filteredUsers.map((user) => (
                  <li key={user.id} role="option">
                    <button
                      onClick={() => handleUserSelect(user)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-neutral-100 focus:bg-neutral-100 focus:outline-none transition-colors ${
                        selectedUser?.id === user.id ? 'bg-primary-50' : ''
                      }`}
                      aria-selected={selectedUser?.id === user.id}
                    >
                      <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                        {getInitials(user.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-neutral-900 truncate">
                          {user.name}
                        </div>
                        {user.email && (
                          <div className="text-xs text-neutral-700 truncate">
                            {user.email}
                          </div>
                        )}
                      </div>
                      {selectedUser?.id === user.id && (
                        <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserSelector;