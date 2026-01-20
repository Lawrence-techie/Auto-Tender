import { CompanyProfile } from '@/types/profile';

export interface TenderInfo {
  tenderName: string;
  tenderNumber: string;
  organization: string;
  date?: string;
}

export interface PDFField {
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  value: string;
}

export interface PDFTemplate {
  id: string;
  name: string;
  pdfPath: string;
  fields: PDFField[];
  tenderInfo: TenderInfo;
}

export class PDFProcessor {
  /**
   * Extract tender information from the cover page of a blank PDF
   */
  static async extractTenderInfo(pdfFile: File): Promise<TenderInfo> {
    // This would use pdfplumber or similar to extract text from first page
    // For now, returning mock data - in production this would parse the actual PDF
    return {
      tenderName: "Road Construction Project",
      tenderNumber: "KURA/2024/001",
      organization: "Kenya Urban Roads Authority",
      date: new Date().toISOString().split('T')[0]
    };
  }

  /**
   * Map profile data to PDF fields based on field names
   */
  static mapProfileToFields(profile: CompanyProfile): Record<string, string> {
    return {
      // Company Information
      'company_name': profile.companyInfo.companyName,
      'registration_number': profile.companyInfo.registrationNumber,
      'contact_person': profile.companyInfo.contactPerson,
      'phone': profile.companyInfo.phone,
      'email': profile.companyInfo.email,
      'address': profile.companyInfo.address,
      'tax_id': profile.companyInfo.taxId,
      'directors': profile.companyInfo.directors,
      'signature': profile.companyInfo.signature,

      // Financial Information
      'annual_turnover': profile.financialInfo.annualTurnover,
      'bank_reference': profile.financialInfo.bankReference,
      'credit_facility': profile.financialInfo.creditFacility,
      'financial_capacity': profile.financialInfo.financialCapacity,
      'bank_guarantee': profile.financialInfo.bankGuarantee,
      'insurance': profile.financialInfo.insurance,

      // Experience Information
      'similar_projects': profile.experienceInfo.similarProjects,
      'project_value': profile.experienceInfo.projectValue,
      'completion_date': profile.experienceInfo.completionDate,
      'client_reference': profile.experienceInfo.clientReference,

      // Technical Information
      'equipment': profile.technicalInfo.equipment,
      'personnel': profile.technicalInfo.personnel,
      'methodology': profile.technicalInfo.methodology,
      'timeline': profile.technicalInfo.timeline,
    };
  }

  /**
   * Fill PDF with profile data and tender information
   */
  static async fillPDF(
    templatePDF: File,
    profile: CompanyProfile,
    tenderInfo: TenderInfo
  ): Promise<Blob> {
    // This would use PyPDF2 or similar to fill the PDF
    // For now, returning a mock blob - in production this would create the actual filled PDF
    
    // Mock implementation - in real implementation this would:
    // 1. Load the template PDF
    // 2. Extract field coordinates from the template
    // 3. Fill in the fields with profile data
    // 4. Add tender information to appropriate fields
    // 5. Return the filled PDF as a blob
    
    const filledPDFBlob = new Blob(['Mock filled PDF content'], {
      type: 'application/pdf'
    });
    
    return filledPDFBlob;
  }

  /**
   * Get field coordinates from a PDF template
   */
  static async getFieldCoordinates(pdfFile: File): Promise<PDFField[]> {
    // This would analyze the PDF to find field positions
    // For now, returning mock coordinates based on our analysis
    
    return [
      // Company Information fields
      { name: 'company_name', x: 100, y: 200, width: 150, height: 20, value: '' },
      { name: 'registration_number', x: 300, y: 200, width: 100, height: 20, value: '' },
      { name: 'contact_person', x: 100, y: 250, width: 120, height: 20, value: '' },
      { name: 'phone', x: 250, y: 250, width: 100, height: 20, value: '' },
      { name: 'email', x: 370, y: 250, width: 150, height: 20, value: '' },
      { name: 'address', x: 100, y: 300, width: 300, height: 40, value: '' },
      { name: 'tax_id', x: 100, y: 350, width: 100, height: 20, value: '' },
      { name: 'directors', x: 250, y: 350, width: 200, height: 40, value: '' },
      { name: 'signature', x: 100, y: 400, width: 150, height: 30, value: '' },

      // Financial Information fields
      { name: 'annual_turnover', x: 100, y: 500, width: 150, height: 20, value: '' },
      { name: 'bank_reference', x: 300, y: 500, width: 200, height: 40, value: '' },
      { name: 'credit_facility', x: 100, y: 550, width: 200, height: 40, value: '' },
      { name: 'financial_capacity', x: 350, y: 550, width: 150, height: 40, value: '' },
      { name: 'bank_guarantee', x: 100, y: 600, width: 200, height: 40, value: '' },
      { name: 'insurance', x: 350, y: 600, width: 150, height: 40, value: '' },

      // Experience Information fields
      { name: 'similar_projects', x: 100, y: 700, width: 400, height: 60, value: '' },
      { name: 'project_value', x: 100, y: 780, width: 150, height: 20, value: '' },
      { name: 'completion_date', x: 300, y: 780, width: 100, height: 20, value: '' },
      { name: 'client_reference', x: 100, y: 820, width: 400, height: 40, value: '' },

      // Technical Information fields
      { name: 'equipment', x: 100, y: 900, width: 400, height: 60, value: '' },
      { name: 'personnel', x: 100, y: 980, width: 400, height: 60, value: '' },
      { name: 'methodology', x: 100, y: 1060, width: 400, height: 60, value: '' },
      { name: 'timeline', x: 100, y: 1140, width: 400, height: 60, value: '' },
    ];
  }

  /**
   * Validate that all required fields are present in the profile
   */
  static validateProfile(profile: CompanyProfile): { isValid: boolean; missingFields: string[] } {
    const requiredFields = [
      'companyInfo.companyName',
      'companyInfo.registrationNumber',
      'companyInfo.contactPerson',
      'companyInfo.phone',
      'companyInfo.email',
      'companyInfo.address',
      'companyInfo.taxId',
      'companyInfo.directors',
      'companyInfo.signature',
      'financialInfo.annualTurnover',
      'financialInfo.bankReference',
      'financialInfo.creditFacility',
      'financialInfo.financialCapacity',
      'financialInfo.bankGuarantee',
      'financialInfo.insurance',
      'experienceInfo.similarProjects',
      'experienceInfo.projectValue',
      'experienceInfo.completionDate',
      'experienceInfo.clientReference',
      'technicalInfo.equipment',
      'technicalInfo.personnel',
      'technicalInfo.methodology',
      'technicalInfo.timeline',
    ];

    const missingFields: string[] = [];

    for (const fieldPath of requiredFields) {
      const [category, field] = fieldPath.split('.');
      let value: string = '';
      
      if (category === 'companyInfo') {
        value = profile.companyInfo[field as keyof typeof profile.companyInfo] || '';
      } else if (category === 'financialInfo') {
        value = profile.financialInfo[field as keyof typeof profile.financialInfo] || '';
      } else if (category === 'experienceInfo') {
        value = profile.experienceInfo[field as keyof typeof profile.experienceInfo] || '';
      } else if (category === 'technicalInfo') {
        value = profile.technicalInfo[field as keyof typeof profile.technicalInfo] || '';
      }
      
      if (!value || value.trim() === '') {
        missingFields.push(fieldPath);
      }
    }

    return {
      isValid: missingFields.length === 0,
      missingFields
    };
  }
} 