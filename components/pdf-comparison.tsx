'use client';
import React, { useState, useRef } from 'react';
import { CompanyProfile } from '@/types/profile';
import { APIClient } from '@/lib/api';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface PDFComparisonProps {
  profiles: CompanyProfile[];
}

export function PDFComparison({ profiles }: PDFComparisonProps) {
  const [filledPDF, setFilledPDF] = useState<File | null>(null);
  const [blankPDF, setBlankPDF] = useState<File | null>(null);
  const [extractedData, setExtractedData] = useState<Record<string, string> | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [comparisonResult, setComparisonResult] = useState<any>(null);

  const filledFileInputRef = useRef<HTMLInputElement>(null);
  const blankFileInputRef = useRef<HTMLInputElement>(null);

  const handleFilledPDFUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFilledPDF(file);
      setError(null);
      setSuccess(null);
      setExtractedData(null);
      setComparisonResult(null);
    }
  };

  const handleBlankPDFUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setBlankPDF(file);
      setError(null);
      setSuccess(null);
    }
  };

  const handleComparePDFs = async () => {
    if (!filledPDF || !blankPDF) {
      setError('Please upload both filled and blank PDFs');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setSuccess(null);

    try {
      // Compare PDFs and extract differences
      const result = await APIClient.comparePDFsAndExtractDifferences(filledPDF, blankPDF);
      
      if (!result.filled_values || Object.keys(result.filled_values).length === 0) {
        setError('No differences found between the PDFs. Please ensure the filled PDF contains actual data.');
        return;
      }
      
      setExtractedData(result.filled_values);
      setComparisonResult(result);
      setSuccess(`Successfully found ${result.total_differences} differences across ${result.pages_compared.length} pages!`);
    } catch (err) {
      console.error('Comparison error:', err);
      setError('Failed to compare PDFs. Please ensure both PDFs are readable and contain the same structure.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFillBlankPDF = async () => {
    if (!extractedData || !blankPDF) {
      setError('Please compare PDFs first and ensure a blank PDF is uploaded');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Create a mock profile from extracted data
      const mockProfile: CompanyProfile = {
        id: 'extracted-data',
        name: 'Extracted Data Profile',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        companyInfo: {
          companyName: extractedData.company_name || '',
          registrationNumber: extractedData.registration_number || '',
          contactPerson: extractedData.contact_person || '',
          phone: extractedData.phone || '',
          email: extractedData.email || '',
          address: extractedData.address || '',
          taxId: extractedData.tax_id || '',
          directors: extractedData.directors || '',
          signature: extractedData.signature || '',
        },
        financialInfo: {
          annualTurnover: extractedData.annual_turnover || '',
          bankReference: extractedData.bank_reference || '',
          creditFacility: extractedData.credit_facility || '',
          financialCapacity: extractedData.financial_capacity || '',
          bankGuarantee: extractedData.bank_guarantee || '',
          insurance: extractedData.insurance || '',
        },
        experienceInfo: {
          similarProjects: extractedData.similar_projects || '',
          projectValue: extractedData.project_value || '',
          completionDate: extractedData.completion_date || '',
          clientReference: extractedData.client_reference || '',
        },
        technicalInfo: {
          equipment: extractedData.equipment || '',
          personnel: extractedData.personnel || '',
          methodology: extractedData.methodology || '',
          timeline: extractedData.timeline || '',
        },
      };

      // Fill the blank PDF using the extracted data
      const filledPDF = await APIClient.fillPDFUsingTemplate(blankPDF, {
        filled_values: extractedData,
        field_mappings: {},
        extracted_data: comparisonResult?.differences || {}
      }, mockProfile);

      // Download the filled PDF
      const url = window.URL.createObjectURL(filledPDF);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'filled_document.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setSuccess('PDF filled successfully! Download started.');
    } catch (err) {
      console.error('Fill error:', err);
      setError('Failed to fill PDF. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">📄 Extract & Fill PDFs</h1>
        <p className="text-gray-600">
          Upload a filled PDF and a blank PDF to extract the exact differences and fill the blank PDF with the same data.
        </p>
      </div>

      <div className="space-y-8">
        {/* Step 1: Upload Both PDFs */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Step 1: Upload Both PDFs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Filled PDF (Source Data)
              </label>
              <input
                ref={filledFileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFilledPDFUpload}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
              />
              <p className="mt-2 text-sm text-gray-600">
                💡 <strong>Tip:</strong> This should be the PDF with all the data filled in.
              </p>
              {filledPDF && (
                <div className="mt-2 bg-green-50 border border-green-200 rounded-md p-3">
                  <div className="flex items-center">
                    <span className="text-green-600 text-lg mr-2">✓</span>
                    <div>
                      <p className="text-sm font-medium text-green-800">
                        Filled PDF: {filledPDF.name}
                      </p>
                      <p className="text-sm text-green-600">
                        Size: {(filledPDF.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Blank PDF (Target)
              </label>
              <input
                ref={blankFileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleBlankPDFUpload}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <p className="mt-2 text-sm text-gray-600">
                💡 <strong>Tip:</strong> This should be the blank PDF that needs to be filled.
              </p>
              {blankPDF && (
                <div className="mt-2 bg-blue-50 border border-blue-200 rounded-md p-3">
                  <div className="flex items-center">
                    <span className="text-blue-600 text-lg mr-2">✓</span>
                    <div>
                      <p className="text-sm font-medium text-blue-800">
                        Blank PDF: {blankPDF.name}
                      </p>
                      <p className="text-sm text-blue-600">
                        Size: {(blankPDF.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Step 2: Compare and Extract */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Step 2: Compare and Extract Differences</h2>
          <div className="space-y-4">
            <Button
              onClick={handleComparePDFs}
              disabled={!filledPDF || !blankPDF || isProcessing}
              className="w-full md:w-auto"
            >
              {isProcessing ? 'Comparing PDFs...' : 'Compare PDFs and Extract Data'}
            </Button>
            
            {comparisonResult && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <h3 className="font-medium text-blue-800 mb-2">Comparison Results:</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Pages compared: {comparisonResult.pages_compared.join(', ')}</li>
                  <li>• Total differences found: {comparisonResult.total_differences}</li>
                  <li>• Fields extracted: {Object.keys(extractedData || {}).length}</li>
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Step 3: Fill Blank PDF */}
        {extractedData && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Step 3: Fill Blank PDF</h2>
            <div className="space-y-4">
              <Button
                onClick={handleFillBlankPDF}
                disabled={!extractedData || !blankPDF || isProcessing}
                className="w-full md:w-auto"
              >
                {isProcessing ? 'Filling PDF...' : 'Fill Blank PDF with Extracted Data'}
              </Button>
              
              <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                <h3 className="font-medium text-gray-800 mb-2">Extracted Data Preview:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {Object.entries(extractedData).slice(0, 10).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="font-medium text-gray-600">{key}:</span>
                      <span className="text-gray-800">{value}</span>
                    </div>
                  ))}
                  {Object.keys(extractedData).length > 10 && (
                    <div className="col-span-2 text-gray-500">
                      ... and {Object.keys(extractedData).length - 10} more fields
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error and Success Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <span className="text-red-600 text-lg mr-2">⚠</span>
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex">
              <span className="text-green-600 text-lg mr-2">✓</span>
              <p className="text-green-800">{success}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 