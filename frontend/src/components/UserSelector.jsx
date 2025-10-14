import { useState, useEffect, useRef } from 'react';
import { ChevronDown, User, Search } from 'lucide-react';
import { getUsers } from '../services/api';

const UserSelector = ({ selectedUser, onUserSelect, className = '' }) => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);

  // Load users from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getUsers();
        const usersArray = Array.isArray(data) ? data : [];
        setUsers(usersArray);
        setFilteredUsers(usersArray);
        
        // Load selected user from localStorage if exists
        const savedUserId = localStorage.getItem('selectedUserId');
        if (savedUserId && usersArray.length > 0) {
          const savedUser = usersArray.find(user => user.id.toString() === savedUserId);
          if (savedUser) {
            onUserSelect(savedUser);
          }
        }
      } catch (err) {
        console.error('Failed to fetch users:', err);
        setError('Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [onUserSelect]);

  // Filter users based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);

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
    if (isOpen && searchRef.current) {
      setTimeout(() => searchRef.current.focus(), 100);
    }
  }, [isOpen]);

  const handleUserSelect = (user) => {
    onUserSelect(user);
    setIsOpen(false);
    setSearchTerm('');
    
    // Save to localStorage
    localStorage.setItem('selectedUserId', user.id.toString());
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setSearchTerm('');
    }
  };

  if (loading) {
    return (
      <div className={`relative ${className}`}>
        <button
          disabled
          className="flex items-center gap-3 px-4 py-2 bg-white border border-gray-200 rounded-lg text-neutral-700 cursor-not-allowed opacity-50"
        >
          <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
          <span className="text-sm">Loading users...</span>
          <ChevronDown className="w-4 h-4 ml-auto" />
        </button>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`relative ${className}`}>
        <button
          disabled
          className="flex items-center gap-3 px-4 py-2 bg-white border border-red-200 rounded-lg text-red-700 cursor-not-allowed"
        >
          <User className="w-5 h-5" />
          <span className="text-sm">Error loading users</span>
          <ChevronDown className="w-4 h-4 ml-auto" />
        </button>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* User Selector Button */}
      <button
        onClick={toggleDropdown}
        className="flex items-center gap-3 px-4 py-2 bg-white border border-gray-200 rounded-lg text-neutral-900 hover:border-primary-600 hover:shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-primary-600"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Select user"
      >
        {selectedUser ? (
          <>
            <div className="flex items-center justify-center w-8 h-8 bg-primary-600 text-white rounded-full text-sm font-medium">
              {getInitials(selectedUser.name || selectedUser.username)}
            </div>
            <div className="flex flex-col items-start">
              <span className="text-sm font-medium text-neutral-900">
                {selectedUser.name || selectedUser.username}
              </span>
              <span className="text-xs text-neutral-700">
                {selectedUser.email}
              </span>
            </div>
          </>
        ) : (
          <>
            <User className="w-5 h-5 text-neutral-700" />
            <span className="text-sm text-neutral-700">Select User</span>
          </>
        )}
        <ChevronDown 
          className={`w-4 h-4 ml-auto text-neutral-500 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-hidden">
          {/* Search Input */}
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input
                ref={searchRef}
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-primary-600"
                aria-label="Search users"
              />
            </div>
          </div>

          {/* Users List */}
          <div className="max-h-64 overflow-y-auto">
            {filteredUsers.length === 0 ? (
              <div className="p-4 text-center text-sm text-neutral-500">
                {searchTerm ? 'No users found' : 'No users available'}
              </div>
            ) : (
              filteredUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleUserSelect(user)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-neutral-100 transition-colors duration-150 focus:outline-none focus:bg-neutral-100"
                  role="option"
                  aria-selected={selectedUser?.id === user.id}
                >
                  <div className="flex items-center justify-center w-8 h-8 bg-primary-600 text-white rounded-full text-sm font-medium">
                    {getInitials(user.name || user.username)}
                  </div>
                  <div className="flex flex-col items-start min-w-0 flex-1">
                    <span className="text-sm font-medium text-neutral-900 truncate">
                      {user.name || user.username}
                    </span>
                    <span className="text-xs text-neutral-700 truncate">
                      {user.email}
                    </span>
                  </div>
                  {selectedUser?.id === user.id && (
                    <div className="w-2 h-2 bg-primary-600 rounded-full" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserSelector;
