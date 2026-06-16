import { useState, useEffect, useRef } from 'react'
import api from '../services/api'

function LocationSearch({ 
  placeholder = "Enter location", 
  value, 
  onChange, 
  onSelect,
  className = "",
  error = null
}) {
  const [input, setInput] = useState(value || '')
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const wrapperRef = useRef(null)
  const debounceRef = useRef(null)

  useEffect(() => {
    setInput(value || '')
  }, [value])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchSuggestions = async (query) => {
    if (query.length < 2) {
      setSuggestions([])
      return
    }
    
    setLoading(true)
    try {
      const response = await api.get(`/locations/autocomplete?input=${encodeURIComponent(query)}&limit=10`)
      setSuggestions(response.data.data || [])
    } catch (err) {
      console.error('Failed to fetch suggestions:', err)
      setSuggestions([])
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const val = e.target.value
    setInput(val)
    onChange?.(val)
    setSelectedIndex(-1)

    // Always show suggestions when typing
    if (val.length >= 2) {
      setShowSuggestions(true)
    } else {
      setShowSuggestions(false)
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }
    
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(val)
    }, 300)
  }

  const handleSelect = (suggestion) => {
    const text = suggestion.type === 'city' 
      ? `${suggestion.city}, ${suggestion.state}` 
      : `${suggestion.subLocation}, ${suggestion.city}`
    
    setInput(text)
    onChange?.(text)
    onSelect?.({
      ...suggestion,
      coordinates: suggestion.coordinates || null
    })
    setShowSuggestions(false)
    setSuggestions([])
  }

  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => 
        prev < suggestions.length - 1 ? prev + 1 : prev
      )
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => prev > 0 ? prev - 1 : prev)
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault()
      handleSelect(suggestions[selectedIndex])
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
    }
  }

  const getIcon = (type) => {
    if (type === 'city') {
      return (
        <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      )
    }
    return (
      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )
  }

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <div className="relative">
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`input-field w-full pr-10 ${error ? 'border-red-500' : ''}`}
          autoComplete="off"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <svg className="w-5 h-5 animate-spin text-gray-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div 
          className="absolute z-[9999] w-full mt-1 bg-white border-2 border-blue-300 rounded-xl shadow-2xl max-h-72 overflow-auto"
          style={{ position: 'absolute', top: '100%', left: 0, right: 0, minWidth: '300px' }}
        >
          <div className="sticky top-0 bg-blue-500 text-white text-xs px-4 py-2 font-medium">
            {suggestions.length} location(s) found - Click to select
          </div>
          {suggestions.map((suggestion, index) => (
            <div
              key={`${suggestion.type}-${suggestion.city}-${suggestion.subLocation || index}`}
              className={`px-4 py-3 cursor-pointer flex items-center gap-3 transition-all ${
                index === selectedIndex 
                  ? 'bg-blue-100 border-l-4 border-blue-500' 
                  : 'hover:bg-gray-50 border-l-4 border-transparent'
              }`}
              onClick={() => handleSelect(suggestion)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              {getIcon(suggestion.type)}
              <div className="flex-1">
                <div className="font-medium text-gray-900">
                  {suggestion.type === 'city' ? suggestion.city : suggestion.subLocation}
                </div>
                <div className="text-sm text-gray-500">
                  {suggestion.type === 'city' 
                    ? `${suggestion.state}`
                    : `${suggestion.subLocation}, ${suggestion.city}`
                  }
                </div>
              </div>
              <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                suggestion.type === 'city' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-700'
              }`}>
                {suggestion.type === 'city' ? 'City' : 'Area'}
              </span>
            </div>
          ))}
        </div>
      )}

      {showSuggestions && input.length >= 2 && !loading && suggestions.length === 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-center text-gray-500">
          No locations found
        </div>
      )}

      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  )
}

export default LocationSearch