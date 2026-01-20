import { CompanyProfile } from '@/types/profile';
import { TenderInfo } from '@/lib/pdf-processor';

const API_BASE_URL = 'http://localhost:8000';

export interface TemplateData {
  filled_values: Record<string, string>;
  field_mappings: Record<string, any>;
  extracted_data: any;
}

export class APIClient {
  /**
   * Extract tender information from uploaded PDF
   */
  static async extractTenderInfo(file: File): Promise<TenderInfo> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/extract-tender-info`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to extract tender info: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      tenderName: data.tender_name,
      tenderNumber: data.tender_number,
      organization: data.organization,
      date: data.date,
    };
  }

  /**
   * Fill PDF with profile data and tender information
   */
  static async fillPDF(
    templateFile: File,
    profile: CompanyProfile,
    tenderInfo: TenderInfo
  ): Promise<Blob> {
    const formData = new FormData();
    formData.append('template_file', templateFile);
    
    // Convert profile to flat structure for backend
    const profileData = {
      company_name: profile.companyInfo.companyName,
      registration_number: profile.companyInfo.registrationNumber,
      contact_person: profile.companyInfo.contactPerson,
      phone: profile.companyInfo.phone,
      email: profile.companyInfo.email,
      address: profile.companyInfo.address,
      tax_id: profile.companyInfo.taxId,
      directors: profile.companyInfo.directors,
      signature: profile.companyInfo.signature,
      annual_turnover: profile.financialInfo.annualTurnover,
      bank_reference: profile.financialInfo.bankReference,
      credit_facility: profile.financialInfo.creditFacility,
      financial_capacity: profile.financialInfo.financialCapacity,
      bank_guarantee: profile.financialInfo.bankGuarantee,
      insurance: profile.financialInfo.insurance,
      similar_projects: profile.experienceInfo.similarProjects,
      project_value: profile.experienceInfo.projectValue,
      completion_date: profile.experienceInfo.completionDate,
      client_reference: profile.experienceInfo.clientReference,
      equipment: profile.technicalInfo.equipment,
      personnel: profile.technicalInfo.personnel,
      methodology: profile.technicalInfo.methodology,
      timeline: profile.technicalInfo.timeline,
    };

    formData.append('profile_data', JSON.stringify(profileData));
    formData.append('tender_info', JSON.stringify(tenderInfo));

    const response = await fetch(`${API_BASE_URL}/fill-pdf`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fill PDF: ${errorText}`);
    }

    return await response.blob();
  }

  /**
   * Compare filled and blank PDFs to create a template
   */
  static async comparePDFsAndCreateTemplate(
    filledPDF: File,
    blankPDF: File
  ): Promise<TemplateData> {
    const formData = new FormData();
    formData.append('filled_pdf', filledPDF);
    formData.append('blank_pdf', blankPDF);

    const response = await fetch(`${API_BASE_URL}/compare-pdfs-and-create-template`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create template: ${errorText}`);
    }

    const data = await response.json();
    return data.template;
  }

  /**
   * Fill PDF using extracted template data
   */
  static async fillPDFUsingTemplate(blankPDF: File, templateData: TemplateData, profile: CompanyProfile): Promise<Blob> {
    const formData = new FormData();
    formData.append('blank_pdf', blankPDF);
    formData.append('template_data', JSON.stringify(templateData));
    formData.append('profile_data', JSON.stringify(profile));

    const response = await fetch(`${API_BASE_URL}/fill-pdf-using-template`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fill PDF: ${errorText}`);
    }

    // Return the PDF as a blob for download
    return response.blob();
  }

  /**
   * Extract data from a filled PDF
   */
  static async extractDataFromFilledPDF(filledPDF: File): Promise<{
    extracted_values: Record<string, string>;
    pages_processed: number;
    fields_found: string[];
  }> {
    const formData = new FormData();
    formData.append('filled_pdf', filledPDF);

    const response = await fetch(`${API_BASE_URL}/extract-data-from-filled-pdf`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to extract data from filled PDF: ${errorText}`);
    }

    return await response.json();
  }

  /**
   * Validate profile data completeness
   */
  static async validateProfile(profile: CompanyProfile): Promise<{ isValid: boolean; missingFields: string[] }> {
    const profileData = {
      company_name: profile.companyInfo.companyName,
      registration_number: profile.companyInfo.registrationNumber,
      contact_person: profile.companyInfo.contactPerson,
      phone: profile.companyInfo.phone,
      email: profile.companyInfo.email,
      address: profile.companyInfo.address,
      tax_id: profile.companyInfo.taxId,
      directors: profile.companyInfo.directors,
      signature: profile.companyInfo.signature,
      annual_turnover: profile.financialInfo.annualTurnover,
      bank_reference: profile.financialInfo.bankReference,
      credit_facility: profile.financialInfo.creditFacility,
      financial_capacity: profile.financialInfo.financialCapacity,
      bank_guarantee: profile.financialInfo.bankGuarantee,
      insurance: profile.financialInfo.insurance,
      similar_projects: profile.experienceInfo.similarProjects,
      project_value: profile.experienceInfo.projectValue,
      completion_date: profile.experienceInfo.completionDate,
      client_reference: profile.experienceInfo.clientReference,
      equipment: profile.technicalInfo.equipment,
      personnel: profile.technicalInfo.personnel,
      methodology: profile.technicalInfo.methodology,
      timeline: profile.technicalInfo.timeline,
    };

    const response = await fetch(`${API_BASE_URL}/validate-profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      throw new Error(`Failed to validate profile: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Get field coordinates for PDF templates
   */
  static async getFieldCoordinates(): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/field-coordinates`);

    if (!response.ok) {
      throw new Error(`Failed to get field coordinates: ${response.statusText}`);
    }

    const data = await response.json();
    return data.fields;
  }

  static async comparePDFsAndExtractDifferences(filledPDF: File, blankPDF: File): Promise<{
    differences: Record<string, any[]>;
    filled_values: Record<string, string>;
    pages_compared: string[];
    total_differences: number;
  }> {
    const formData = new FormData();
    formData.append('filled_pdf', filledPDF);
    formData.append('blank_pdf', blankPDF);

    const response = await fetch(`${API_BASE_URL}/compare-pdfs-and-extract-differences`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to compare PDFs: ${errorText}`);
    }

    return response.json();
  }
} 