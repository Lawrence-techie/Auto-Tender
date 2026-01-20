'use client';

import React, { useState, useRef } from 'react';
import { CompanyProfile } from '@/types/profile';
import { TenderInfo } from '@/lib/pdf-processor';
import { APIClient } from '@/lib/api';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface PDFAutomationProps {
  profiles: CompanyProfile[];
}

export function PDFAutomation({ profiles }: PDFAutomationProps) {
  const [selectedPDF, setSelectedPDF] = useState<File | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<CompanyProfile | null>(null);
  const [tenderInfo, setTenderInfo] = useState<TenderInfo | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file');
      return;
    }

    setSelectedPDF(file);
    setError(null);
    setSuccess(null);

    try {
      // Extract tender information from the PDF using the API
      const extractedTenderInfo = await APIClient.extractTenderInfo(file);
      setTenderInfo(extractedTenderInfo);
    } catch (err) {
      setError('Failed to extract tender information from PDF. Please try again.');
      console.error(err);
    }
  };

  const handleProfileSelect = (profile: CompanyProfile) => {
    setSelectedProfile(profile);
    setError(null);
    setSuccess(null);
  };

  const handleFillPDF = async () => {
    if (!selectedPDF || !selectedProfile || !tenderInfo) {
      setError('Please select a PDF file and a profile');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setSuccess(null);

    try {
      // Validate profile completeness using the API
      const validation = await APIClient.validateProfile(selectedProfile);
      if (!validation.isValid) {
        setError(`Profile is incomplete. Missing fields: ${validation.missingFields.join(', ')}`);
        return;
      }

      // Fill the PDF with profile data and tender information using the API
      const filledPDF = await APIClient.fillPDF(selectedPDF, selectedProfile, tenderInfo);
      
      // Create download link
      const url = URL.createObjectURL(filledPDF);
      const link = document.createElement('a');
      link.href = url;
      link.download = `filled_${selectedProfile.name}_${tenderInfo.tenderNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setSuccess('PDF filled successfully and downloaded!');
    } catch (err) {
      setError('Failed to fill PDF. Please try again.');
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setSelectedPDF(null);
    setSelectedProfile(null);
    setTenderInfo(null);
    setError(null);
    setSuccess(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          PDF Automation
        </h1>
        <p className="text-gray-600">
          Upload a blank tender PDF and select a profile to automatically fill the document.
        </p>
      </div>

      <div className="space-y-8">
        {/* Step 1: Upload PDF */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Step 1: Upload Blank PDF</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Blank Tender PDF
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
              />
            </div>
            
            {selectedPDF && (
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <div className="flex items-center">
                  <span className="text-green-600 text-lg mr-2">✓</span>
                  <div>
                    <p className="text-sm font-medium text-green-800">
                      PDF uploaded: {selectedPDF.name}
                    </p>
                    <p className="text-sm text-green-600">
                      Size: {(selectedPDF.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Step 2: Tender Information */}
        {tenderInfo && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Step 2: Extracted Tender Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Tender Name</label>
                <Input value={tenderInfo.tenderName} readOnly />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Tender Number</label>
                <Input value={tenderInfo.tenderNumber} readOnly />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Organization</label>
                <Input value={tenderInfo.organization} readOnly />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Date</label>
                <Input value={tenderInfo.date || 'N/A'} readOnly />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Select Profile */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Step 3: Select Profile</h2>
          {profiles.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No profiles available</p>
              <p className="text-sm text-gray-400">
                Create a profile first to use PDF automation
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {profiles.map((profile) => (
                <div
                  key={profile.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedProfile?.id === profile.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleProfileSelect(profile)}
                >
                  <h3 className="font-medium text-gray-900 mb-2">{profile.name}</h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><span className="font-medium">Company:</span> {profile.companyInfo.companyName}</p>
                    <p><span className="font-medium">Contact:</span> {profile.companyInfo.contactPerson}</p>
                    <p><span className="font-medium">Phone:</span> {profile.companyInfo.phone}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Step 4: Generate Filled PDF */}
        {selectedPDF && selectedProfile && tenderInfo && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Step 4: Generate Filled PDF</h2>
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <h3 className="font-medium text-blue-900 mb-2">Summary</h3>
                <div className="text-sm text-blue-800 space-y-1">
                  <p><span className="font-medium">PDF:</span> {selectedPDF.name}</p>
                  <p><span className="font-medium">Profile:</span> {selectedProfile.name}</p>
                  <p><span className="font-medium">Tender:</span> {tenderInfo.tenderName}</p>
                  <p><span className="font-medium">Fields to fill:</span> 23</p>
                </div>
              </div>

              <div className="flex space-x-4">
                <Button
                  onClick={handleFillPDF}
                  disabled={isProcessing}
                  className="flex-1"
                >
                  {isProcessing ? 'Processing...' : 'Generate Filled PDF'}
                </Button>
                <Button
                  variant="outline"
                  onClick={resetForm}
                  disabled={isProcessing}
                >
                  Reset
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Error and Success Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex items-center">
              <span className="text-red-600 text-lg mr-2">⚠</span>
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex items-center">
              <span className="text-green-600 text-lg mr-2">✓</span>
              <p className="text-sm text-green-800">{success}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 