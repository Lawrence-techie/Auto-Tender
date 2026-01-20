import { ProfileField } from '@/types/profile';

export const profileFields: ProfileField[] = [
  // Company Information
  {
    name: 'companyName',
    label: 'Company Name',
    placeholder: 'Enter your company name',
    type: 'text',
    validation: { required: true, minLength: 2, maxLength: 100 },
    category: 'companyInfo'
  },
  {
    name: 'registrationNumber',
    label: 'Registration Number',
    placeholder: 'Enter company registration number',
    type: 'text',
    validation: { required: true, minLength: 5, maxLength: 50 },
    category: 'companyInfo'
  },
  {
    name: 'contactPerson',
    label: 'Contact Person',
    placeholder: 'Enter primary contact person name',
    type: 'text',
    validation: { required: true, minLength: 2, maxLength: 100 },
    category: 'companyInfo'
  },
  {
    name: 'phone',
    label: 'Phone Number',
    placeholder: 'Enter contact phone number',
    type: 'phone',
    validation: { required: true, type: 'phone' },
    category: 'companyInfo'
  },
  {
    name: 'email',
    label: 'Email Address',
    placeholder: 'Enter contact email address',
    type: 'email',
    validation: { required: true, type: 'email' },
    category: 'companyInfo'
  },
  {
    name: 'address',
    label: 'Company Address',
    placeholder: 'Enter complete company address',
    type: 'textarea',
    validation: { required: true, minLength: 10, maxLength: 200 },
    category: 'companyInfo'
  },
  {
    name: 'taxId',
    label: 'Tax ID Number',
    placeholder: 'Enter tax identification number',
    type: 'text',
    validation: { required: true, minLength: 5, maxLength: 50 },
    category: 'companyInfo'
  },
  {
    name: 'directors',
    label: 'Company Directors',
    placeholder: 'Enter names of company directors',
    type: 'textarea',
    validation: { required: true, minLength: 5, maxLength: 200 },
    category: 'companyInfo'
  },
  {
    name: 'signature',
    label: 'Authorized Signature',
    placeholder: 'Enter authorized signatory name',
    type: 'text',
    validation: { required: true, minLength: 2, maxLength: 100 },
    category: 'companyInfo'
  },

  // Financial Information
  {
    name: 'annualTurnover',
    label: 'Annual Turnover',
    placeholder: 'Enter annual financial turnover',
    type: 'number',
    validation: { required: true, type: 'number' },
    category: 'financialInfo'
  },
  {
    name: 'bankReference',
    label: 'Bank Reference',
    placeholder: 'Enter bank reference details',
    type: 'textarea',
    validation: { required: true, minLength: 10, maxLength: 200 },
    category: 'financialInfo'
  },
  {
    name: 'creditFacility',
    label: 'Credit Facility',
    placeholder: 'Enter credit facility details',
    type: 'textarea',
    validation: { required: true, minLength: 10, maxLength: 200 },
    category: 'financialInfo'
  },
  {
    name: 'financialCapacity',
    label: 'Financial Capacity',
    placeholder: 'Enter financial capacity proof',
    type: 'textarea',
    validation: { required: true, minLength: 10, maxLength: 200 },
    category: 'financialInfo'
  },
  {
    name: 'bankGuarantee',
    label: 'Bank Guarantee',
    placeholder: 'Enter bank guarantee details',
    type: 'textarea',
    validation: { required: true, minLength: 10, maxLength: 200 },
    category: 'financialInfo'
  },
  {
    name: 'insurance',
    label: 'Insurance Coverage',
    placeholder: 'Enter insurance coverage details',
    type: 'textarea',
    validation: { required: true, minLength: 10, maxLength: 200 },
    category: 'financialInfo'
  },

  // Experience Information
  {
    name: 'similarProjects',
    label: 'Similar Projects',
    placeholder: 'Describe similar completed projects',
    type: 'textarea',
    validation: { required: true, minLength: 20, maxLength: 500 },
    category: 'experienceInfo'
  },
  {
    name: 'projectValue',
    label: 'Project Value',
    placeholder: 'Enter value of similar projects',
    type: 'number',
    validation: { required: true, type: 'number' },
    category: 'experienceInfo'
  },
  {
    name: 'completionDate',
    label: 'Completion Date',
    placeholder: 'Enter project completion date',
    type: 'date',
    validation: { required: true, type: 'date' },
    category: 'experienceInfo'
  },
  {
    name: 'clientReference',
    label: 'Client Reference',
    placeholder: 'Enter client reference contacts',
    type: 'textarea',
    validation: { required: true, minLength: 10, maxLength: 200 },
    category: 'experienceInfo'
  },

  // Technical Information
  {
    name: 'equipment',
    label: 'Available Equipment',
    placeholder: 'List available equipment and machinery',
    type: 'textarea',
    validation: { required: true, minLength: 20, maxLength: 500 },
    category: 'technicalInfo'
  },
  {
    name: 'personnel',
    label: 'Technical Personnel',
    placeholder: 'Describe technical personnel and qualifications',
    type: 'textarea',
    validation: { required: true, minLength: 20, maxLength: 500 },
    category: 'technicalInfo'
  },
  {
    name: 'methodology',
    label: 'Project Methodology',
    placeholder: 'Describe project methodology and approach',
    type: 'textarea',
    validation: { required: true, minLength: 20, maxLength: 500 },
    category: 'technicalInfo'
  },
  {
    name: 'timeline',
    label: 'Project Timeline',
    placeholder: 'Describe project timeline and milestones',
    type: 'textarea',
    validation: { required: true, minLength: 20, maxLength: 500 },
    category: 'technicalInfo'
  }
];

export const getFieldsByCategory = (category: string) => {
  return profileFields.filter(field => field.category === category);
};

export const categories = [
  { id: 'companyInfo', name: 'Company Information', icon: '🏢' },
  { id: 'financialInfo', name: 'Financial Information', icon: '💰' },
  { id: 'experienceInfo', name: 'Experience Information', icon: '📋' },
  { id: 'technicalInfo', name: 'Technical Information', icon: '⚙️' }
]; 