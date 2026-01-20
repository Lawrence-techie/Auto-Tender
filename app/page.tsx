'use client';

import React, { useState } from 'react';
import { ProfileForm } from '@/components/profile-form';
import { PDFAutomation } from '@/components/pdf-automation';
import { PDFComparison } from '@/components/pdf-comparison';
import { ProfileFormData, CompanyProfile } from '@/types/profile';

type ViewMode = 'profiles' | 'pdf-automation' | 'pdf-comparison' | 'form';

export default function HomePage() {
  const [profiles, setProfiles] = useState<CompanyProfile[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('profiles');
  const [editingProfile, setEditingProfile] = useState<CompanyProfile | null>(null);

  const handleCreateProfile = async (data: ProfileFormData) => {
    const newProfile: CompanyProfile = {
      id: Date.now().toString(),
      name: data.name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      companyInfo: data.companyInfo,
      financialInfo: data.financialInfo,
      experienceInfo: data.experienceInfo,
      technicalInfo: data.technicalInfo,
    };

    setProfiles(prev => [...prev, newProfile]);
    setViewMode('profiles');
    
    // Save to localStorage for persistence
    localStorage.setItem('profiles', JSON.stringify([...profiles, newProfile]));
  };

  const handleUpdateProfile = async (data: ProfileFormData) => {
    if (!editingProfile) return;

    const updatedProfile: CompanyProfile = {
      ...editingProfile,
      name: data.name,
      updatedAt: new Date().toISOString(),
      companyInfo: data.companyInfo,
      financialInfo: data.financialInfo,
      experienceInfo: data.experienceInfo,
      technicalInfo: data.technicalInfo,
    };

    setProfiles(prev => prev.map(p => p.id === editingProfile.id ? updatedProfile : p));
    setEditingProfile(null);
    setViewMode('profiles');
    
    // Save to localStorage
    const updatedProfiles = profiles.map(p => p.id === editingProfile.id ? updatedProfile : p);
    localStorage.setItem('profiles', JSON.stringify(updatedProfiles));
  };

  const handleDeleteProfile = (profileId: string) => {
    if (confirm('Are you sure you want to delete this profile?')) {
      const updatedProfiles = profiles.filter(p => p.id !== profileId);
      setProfiles(updatedProfiles);
      localStorage.setItem('profiles', JSON.stringify(updatedProfiles));
    }
  };

  const handleEditProfile = (profile: CompanyProfile) => {
    setEditingProfile(profile);
    setViewMode('form');
  };

  // Load profiles from localStorage on mount
  React.useEffect(() => {
    const savedProfiles = localStorage.getItem('profiles');
    if (savedProfiles) {
      try {
        setProfiles(JSON.parse(savedProfiles));
      } catch (error) {
        console.error('Error loading profiles:', error);
      }
    }
  }, []);

  const renderNavigation = () => (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex space-x-8 overflow-x-auto">
          <button
            onClick={() => setViewMode('profiles')}
            className={`py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap ${
              viewMode === 'profiles'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            📋 Profile Management
          </button>
          <button
            onClick={() => setViewMode('pdf-automation')}
            className={`py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap ${
              viewMode === 'pdf-automation'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            ⚡ PDF Automation
          </button>
          <button
            onClick={() => setViewMode('pdf-comparison')}
            className={`py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap ${
              viewMode === 'pdf-comparison'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            📄 Extract & Fill
          </button>
        </div>
      </div>
    </div>
  );

  if (viewMode === 'form') {
    return (
      <div className="min-h-screen bg-gray-50">
        {renderNavigation()}
        <div className="max-w-4xl mx-auto py-8">
          <div className="mb-6">
            <button
              onClick={() => {
                setViewMode('profiles');
                setEditingProfile(null);
              }}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              ← Back to Profiles
            </button>
          </div>
          <ProfileForm
            initialData={editingProfile ? {
              name: editingProfile.name,
              companyInfo: editingProfile.companyInfo,
              financialInfo: editingProfile.financialInfo,
              experienceInfo: editingProfile.experienceInfo,
              technicalInfo: editingProfile.technicalInfo,
            } : undefined}
            onSubmit={editingProfile ? handleUpdateProfile : handleCreateProfile}
            onCancel={() => {
              setViewMode('profiles');
              setEditingProfile(null);
            }}
          />
        </div>
      </div>
    );
  }

  if (viewMode === 'pdf-automation') {
    return (
      <div className="min-h-screen bg-gray-50">
        {renderNavigation()}
        <PDFAutomation profiles={profiles} />
      </div>
    );
  }

  if (viewMode === 'pdf-comparison') {
    return (
      <div className="min-h-screen bg-gray-50">
        {renderNavigation()}
        <PDFComparison profiles={profiles} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {renderNavigation()}
      <div className="max-w-6xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Auto-Tender Profile Management
          </h1>
          <p className="text-gray-600 text-lg">
            Create and manage company profiles for automated tender document filling
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-primary-100 rounded-lg">
                <span className="text-2xl">📋</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Profiles</p>
                <p className="text-2xl font-bold text-gray-900">{profiles.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-2xl">✅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Ready for Automation</p>
                <p className="text-2xl font-bold text-gray-900">{profiles.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-2xl">⚡</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Fields per Profile</p>
                <p className="text-2xl font-bold text-gray-900">23</p>
              </div>
            </div>
          </div>
        </div>

        {/* Create Profile Button */}
        <div className="mb-8">
          <button
            onClick={() => setViewMode('form')}
            className="bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors"
          >
            + Create New Profile
          </button>
        </div>

        {/* Profiles List */}
        {profiles.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No profiles yet
            </h3>
            <p className="text-gray-600 mb-6">
              Create your first company profile to start automating tender documents
            </p>
            <button
              onClick={() => setViewMode('form')}
              className="bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors"
            >
              Create Your First Profile
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {profiles.map((profile) => (
              <div key={profile.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {profile.name}
                  </h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditProfile(profile)}
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteProfile(profile.id)}
                      className="text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                
                <div className="space-y-3 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Company:</span> {profile.companyInfo.companyName}
                  </div>
                  <div>
                    <span className="font-medium">Contact:</span> {profile.companyInfo.contactPerson}
                  </div>
                  <div>
                    <span className="font-medium">Phone:</span> {profile.companyInfo.phone}
                  </div>
                  <div>
                    <span className="font-medium">Email:</span> {profile.companyInfo.email}
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Created: {new Date(profile.createdAt).toLocaleDateString()}</span>
                    <span>Updated: {new Date(profile.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 