import React, { useState } from 'react';

const BrowsePets = () => {
  const [filters, setFilters] = useState({
    species: 'All Species',
    age: 'All Ages',
    size: 'All Sizes',
    location: 'All Locations',
    source: 'All Sources'
  });

  const pets = [
    {
      name: 'Whiskers',
      type: 'Tabby Cat',
      age: '3 years',
      distance: '2 miles',
      traits: ['Calm', 'Indoor'],
      image: '/path-to-whiskers-image.jpg'
    },
    {
      name: 'Luna',
      type: 'Border Collie',
      age: '1 year',
      distance: '5 miles',
      traits: ['Active', 'Smart'],
      image: '/path-to-luna-image.jpg'
    },
    {
      name: 'Milo',
      type: 'French Bulldog',
      age: '6 months',
      distance: '1 mile',
      traits: ['Playful', 'Puppy'],
      image: '/path-to-milo-image.jpg'
    },
    {
      name: 'Duchess',
      type: 'Persian Cat',
      age: '5 years',
      distance: '8 miles',
      traits: ['Gentle', 'Quiet'],
      image: '/path-to-duchess-image.jpg'
    },
    {
      name: 'Whiskers',
      type: 'Tabby Cat',
      age: '3 years',
      distance: '2 miles',
      traits: ['Calm', 'Indoor'],
      image: '/path-to-whiskers-image.jpg'
    },
    {
      name: 'Luna',
      type: 'Border Collie',
      age: '1 year',
      distance: '5 miles',
      traits: ['Active', 'Smart'],
      image: '/path-to-luna-image.jpg'
    },
    {
      name: 'Milo',
      type: 'French Bulldog',
      age: '6 months',
      distance: '1 mile',
      traits: ['Playful', 'Puppy'],
      image: '/path-to-milo-image.jpg'
    },
    {
      name: 'Duchess',
      type: 'Persian Cat',
      age: '5 years',
      distance: '8 miles',
      traits: ['Gentle', 'Quiet'],
      image: '/path-to-duchess-image.jpg'
    }
  ];

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      species: 'All Species',
      age: 'All Ages',
      size: 'All Sizes',
      location: 'All Locations',
      source: 'All Sources'
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 bg-white">
      {/* Header Section */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-black mb-4">
          Browse All Available Pets
        </h1>
        <p className="text-gray-600">
          Find your perfect companion with our advanced search filters
        </p>
      </div>

      {/* Filters Section */}
      <div className="flex flex-wrap gap-4 mb-8 justify-center items-center">
        <select
          className="px-4 py-2 border rounded-md bg-white"
          value={filters.species}
          onChange={(e) => handleFilterChange('species', e.target.value)}
        >
          <option>All Species</option>
          <option>Dogs</option>
          <option>Cats</option>
          <option>Rabbits</option>
          <option>Birds</option>
        </select>

        <select
          className="px-4 py-2 border rounded-md bg-white"
          value={filters.age}
          onChange={(e) => handleFilterChange('age', e.target.value)}
        >
          <option>All Ages</option>
          <option>Youngling</option>
          <option>Mature</option>
          <option>Old soul</option>
        </select>

        <select
          className="px-4 py-2 border rounded-md bg-white"
          value={filters.size}
          onChange={(e) => handleFilterChange('size', e.target.value)}
        >
          <option>All Sizes</option>
          <option>Small</option>
          <option>Medium</option>
          <option>Large</option>
        </select>

        <select
          className="px-4 py-2 border rounded-md bg-white"
          value={filters.location}
          onChange={(e) => handleFilterChange('location', e.target.value)}
        >
          <option>All Locations</option>
          <option>Near me</option>
        </select>

        <select
          className="px-4 py-2 border rounded-md bg-white"
          value={filters.source}
          onChange={(e) => handleFilterChange('source', e.target.value)}
        >
          <option>All Sources</option>
          <option>Adoption Center</option>
          <option>Foster Home</option>
        </select>

        <button
          onClick={clearFilters}
          className="px-6 py-2 bg-[#fe8a67] text-white rounded-md hover:bg-[#fbaa92] transition-colors"
        >
          Clear Filters
        </button>
      </div>

      {/* Pets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {pets.map((pet, index) => (
          <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="h-48 overflow-hidden">
              <img
                src={pet.image}
                alt={pet.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-semibold text-black">{pet.name}</h3>
                <span className="text-[#fe8a67] text-sm">{pet.distance}</span>
              </div>
              <p className="text-gray-600 mb-2">{`${pet.type} • ${pet.age}`}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {pet.traits.map((trait, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 bg-gray-100 rounded-full text-sm text-gray-600"
                  >
                    {trait}
                  </span>
                ))}
              </div>
              <button className="w-full py-2 bg-[#fe8a67] text-white rounded-md hover:bg-[#fbaa92] transition-colors">
                View Profile
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BrowsePets;