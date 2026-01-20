export interface CompanyProfile {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  
  // Company Information
  companyInfo: {
    companyName: string;
    registrationNumber: string;
    contactPerson: string;
    phone: string;
    email: string;
    address: string;
    taxId: string;
    directors: string;
    signature: string;
  };
  
  // Financial Information
  financialInfo: {
    annualTurnover: string;
    bankReference: string;
    creditFacility: string;
    financialCapacity: string;
    bankGuarantee: string;
    insurance: string;
  };
  
  // Experience Information
  experienceInfo: {
    similarProjects: string;
    projectValue: string;
    completionDate: string;
    clientReference: string;
  };
  
  // Technical Information
  technicalInfo: {
    equipment: string;
    personnel: string;
    methodology: string;
    timeline: string;
  };
}

export interface ProfileFormData {
  name: string;
  companyInfo: {
    companyName: string;
    registrationNumber: string;
    contactPerson: string;
    phone: string;
    email: string;
    address: string;
    taxId: string;
    directors: string;
    signature: string;
  };
  financialInfo: {
    annualTurnover: string;
    bankReference: string;
    creditFacility: string;
    financialCapacity: string;
    bankGuarantee: string;
    insurance: string;
  };
  experienceInfo: {
    similarProjects: string;
    projectValue: string;
    completionDate: string;
    clientReference: string;
  };
  technicalInfo: {
    equipment: string;
    personnel: string;
    methodology: string;
    timeline: string;
  };
}

export interface FieldValidation {
  required?: boolean;
  type?: 'text' | 'email' | 'phone' | 'date' | 'number';
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
}

export interface ProfileField {
  name: string;
  label: string;
  placeholder: string;
  type: 'text' | 'textarea' | 'email' | 'phone' | 'date' | 'number';
  validation: FieldValidation;
  category: 'companyInfo' | 'financialInfo' | 'experienceInfo' | 'technicalInfo';
} 