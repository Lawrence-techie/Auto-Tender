#!/usr/bin/env python3
import json
import re
from collections import defaultdict

def analyze_field_patterns():
    """Analyze the PDF analysis results to identify field patterns"""
    
    # Based on the analysis output, let's identify the key patterns
    print("=== Field Analysis Report ===\n")
    
    # Common patterns found in the analysis
    common_new_words = {
        '19th', '2024', 'addendum', 'kura/rmlf/we/127/2024-2025', 'no.5', 'september,', 'on'
    }
    
    # Field categories based on the analysis
    field_categories = {
        'document_info': {
            'tender_number': 'kura/rmlf/we/127/2024-2025',
            'addendum_number': 'no.5',
            'date': '19th september, 2024'
        },
        'company_info': {
            'company_name': '_________________',
            'registration_number': '______________________________',
            'contact_person': '_____________________________________',
            'phone': '________________________',
            'email': '___________________________',
            'address': '……………………………',
            'tax_id': '……………………………...',
            'directors': '……………………………………...',
            'signature': '……………………………………………………'
        },
        'financial_info': {
            'annual_turnover': '………………………………………...',
            'bank_reference': '……………………………………………………',
            'credit_facility': '…………………………………..',
            'financial_capacity': '…………………………….',
            'bank_guarantee': '…………………………………..',
            'insurance': '…………………………………..'
        },
        'experience_info': {
            'similar_projects': '…………………………………..',
            'project_value': '…………………………………..',
            'completion_date': '…………………………………..',
            'client_reference': '…………………………………..'
        },
        'technical_info': {
            'equipment': '…………………………………..',
            'personnel': '…………………………………..',
            'methodology': '…………………………………..',
            'timeline': '…………………………………..'
        }
    }
    
    print("=== Identified Field Categories ===")
    for category, fields in field_categories.items():
        print(f"\n{category.replace('_', ' ').title()}:")
        for field_name, placeholder in fields.items():
            print(f"  - {field_name}: {placeholder}")
    
    # Create field mapping structure
    field_mapping = {
        'template_id': 'kura_tender_2024',
        'template_name': 'KURA Tender 2024',
        'pages': '47-90',
        'fields': {}
    }
    
    # Add fields to mapping
    field_id = 1
    for category, fields in field_categories.items():
        for field_name, placeholder in fields.items():
            field_mapping['fields'][f'field_{field_id}'] = {
                'name': field_name,
                'category': category,
                'placeholder': placeholder,
                'type': 'text',  # Default type
                'required': True
            }
            field_id += 1
    
    # Save field mapping
    with open('field_mapping.json', 'w') as f:
        json.dump(field_mapping, f, indent=2)
    
    print(f"\nField mapping saved to field_mapping.json")
    
    # Create user profile template
    profile_template = {
        'company_info': {
            'company_name': '',
            'registration_number': '',
            'contact_person': '',
            'phone': '',
            'email': '',
            'address': '',
            'tax_id': '',
            'directors': '',
            'signature': ''
        },
        'financial_info': {
            'annual_turnover': '',
            'bank_reference': '',
            'credit_facility': '',
            'financial_capacity': '',
            'bank_guarantee': '',
            'insurance': ''
        },
        'experience_info': {
            'similar_projects': '',
            'project_value': '',
            'completion_date': '',
            'client_reference': ''
        },
        'technical_info': {
            'equipment': '',
            'personnel': '',
            'methodology': '',
            'timeline': ''
        }
    }
    
    with open('profile_template.json', 'w') as f:
        json.dump(profile_template, f, indent=2)
    
    print(f"Profile template saved to profile_template.json")
    
    return field_mapping, profile_template

def create_automation_strategy():
    """Create the automation strategy based on field analysis"""
    
    print("\n=== Automation Strategy ===")
    
    strategy = {
        'approach': 'Coordinate-based PDF filling',
        'field_detection': 'Pre-mapped field coordinates',
        'data_source': 'User profiles with editable fields',
        'pdf_processing': 'PyPDF2 for form filling',
        'field_types': {
            'text': 'Standard text fields',
            'date': 'Date fields (e.g., completion_date)',
            'number': 'Numeric fields (e.g., project_value)',
            'email': 'Email validation fields',
            'phone': 'Phone number fields'
        }
    }
    
    print("Strategy:")
    print(f"- {strategy['approach']}")
    print(f"- {strategy['field_detection']}")
    print(f"- {strategy['data_source']}")
    print(f"- {strategy['pdf_processing']}")
    
    print("\nField Types:")
    for field_type, description in strategy['field_types'].items():
        print(f"- {field_type}: {description}")
    
    return strategy

if __name__ == "__main__":
    field_mapping, profile_template = analyze_field_patterns()
    strategy = create_automation_strategy() 