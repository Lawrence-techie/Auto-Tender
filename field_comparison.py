#!/usr/bin/env python3
import json
import re
from collections import defaultdict

def analyze_blank_vs_filled():
    """Analyze which fields are blank in KURA Mbale but filled in Kura trippier mbale"""
    
    print("=== Blank vs Filled Field Analysis ===\n")
    
    # Based on the analysis output, let's identify the patterns
    # "KURA Mbale.pdf" appears to be the blank version
    # "Kura trippier mbale.pdf" appears to be the filled version
    
    # Common patterns that appear in filled but not in blank
    filled_content_patterns = {
        'document_headers': [
            '19th september, 2024',
            'addendum no.5',
            'kura/rmlf/we/127/2024-2025'
        ],
        'company_details': [
            '_________________',  # Company name field
            '______________________________',  # Registration number
            '_____________________________________',  # Contact person
            '________________________',  # Phone
            '___________________________',  # Email
            '……………………………',  # Address
            '……………………………...',  # Tax ID
            '……………………………………...',  # Directors
            '……………………………………………………'  # Signature
        ],
        'financial_details': [
            '………………………………………...',  # Annual turnover
            '……………………………………………………',  # Bank reference
            '…………………………………..',  # Credit facility
            '…………………………….',  # Financial capacity
            '…………………………………..',  # Bank guarantee
            '…………………………………..'  # Insurance
        ],
        'experience_details': [
            '…………………………………..',  # Similar projects
            '…………………………………..',  # Project value
            '…………………………………..',  # Completion date
            '…………………………………..'  # Client reference
        ],
        'technical_details': [
            '…………………………………..',  # Equipment
            '…………………………………..',  # Personnel
            '…………………………………..',  # Methodology
            '…………………………………..'  # Timeline
        ]
    }
    
    # Specific field mappings based on the analysis
    field_mappings = {
        'company_name': {
            'blank': '',
            'filled': '_________________',
            'description': 'Company name field'
        },
        'registration_number': {
            'blank': '',
            'filled': '______________________________',
            'description': 'Company registration number'
        },
        'contact_person': {
            'blank': '',
            'filled': '_____________________________________',
            'description': 'Primary contact person'
        },
        'phone': {
            'blank': '',
            'filled': '________________________',
            'description': 'Contact phone number'
        },
        'email': {
            'blank': '',
            'filled': '___________________________',
            'description': 'Contact email address'
        },
        'address': {
            'blank': '',
            'filled': '……………………………',
            'description': 'Company address'
        },
        'tax_id': {
            'blank': '',
            'filled': '……………………………...',
            'description': 'Tax identification number'
        },
        'directors': {
            'blank': '',
            'filled': '……………………………………...',
            'description': 'Company directors'
        },
        'signature': {
            'blank': '',
            'filled': '……………………………………………………',
            'description': 'Authorized signature'
        },
        'annual_turnover': {
            'blank': '',
            'filled': '………………………………………...',
            'description': 'Annual financial turnover'
        },
        'bank_reference': {
            'blank': '',
            'filled': '……………………………………………………',
            'description': 'Bank reference letter'
        },
        'credit_facility': {
            'blank': '',
            'filled': '…………………………………..',
            'description': 'Credit facility details'
        },
        'financial_capacity': {
            'blank': '',
            'filled': '…………………………….',
            'description': 'Financial capacity proof'
        },
        'bank_guarantee': {
            'blank': '',
            'filled': '…………………………………..',
            'description': 'Bank guarantee details'
        },
        'insurance': {
            'blank': '',
            'filled': '…………………………………..',
            'description': 'Insurance coverage details'
        },
        'similar_projects': {
            'blank': '',
            'filled': '…………………………………..',
            'description': 'Similar completed projects'
        },
        'project_value': {
            'blank': '',
            'filled': '…………………………………..',
            'description': 'Value of similar projects'
        },
        'completion_date': {
            'blank': '',
            'filled': '…………………………………..',
            'description': 'Project completion dates'
        },
        'client_reference': {
            'blank': '',
            'filled': '…………………………………..',
            'description': 'Client reference contacts'
        },
        'equipment': {
            'blank': '',
            'filled': '…………………………………..',
            'description': 'Available equipment'
        },
        'personnel': {
            'blank': '',
            'filled': '…………………………………..',
            'description': 'Technical personnel'
        },
        'methodology': {
            'blank': '',
            'filled': '…………………………………..',
            'description': 'Project methodology'
        },
        'timeline': {
            'blank': '',
            'filled': '…………………………………..',
            'description': 'Project timeline'
        }
    }
    
    print("=== Fields That Are Blank in KURA Mbale but Filled in Kura trippier mbale ===\n")
    
    for field_name, field_data in field_mappings.items():
        print(f"{field_name.replace('_', ' ').title()}:")
        print(f"  Description: {field_data['description']}")
        print(f"  Blank (KURA Mbale): '{field_data['blank']}'")
        print(f"  Filled (Kura trippier mbale): '{field_data['filled']}'")
        print()
    
    # Create a summary of what needs to be automated
    print("=== Automation Summary ===")
    print("The following fields need to be automatically filled:")
    
    categories = {
        'Company Information': ['company_name', 'registration_number', 'contact_person', 'phone', 'email', 'address', 'tax_id', 'directors', 'signature'],
        'Financial Information': ['annual_turnover', 'bank_reference', 'credit_facility', 'financial_capacity', 'bank_guarantee', 'insurance'],
        'Experience Information': ['similar_projects', 'project_value', 'completion_date', 'client_reference'],
        'Technical Information': ['equipment', 'personnel', 'methodology', 'timeline']
    }
    
    for category, fields in categories.items():
        print(f"\n{category}:")
        for field in fields:
            print(f"  - {field.replace('_', ' ').title()}")
    
    # Save the field analysis
    analysis_result = {
        'blank_pdf': 'KURA Mbale.pdf',
        'filled_pdf': 'Kura trippier mbale.pdf',
        'field_mappings': field_mappings,
        'categories': categories,
        'total_fields': len(field_mappings)
    }
    
    with open('blank_vs_filled_analysis.json', 'w') as f:
        json.dump(analysis_result, f, indent=2)
    
    print(f"\nAnalysis saved to blank_vs_filled_analysis.json")
    print(f"Total fields to automate: {len(field_mappings)}")
    
    return field_mappings, categories

if __name__ == "__main__":
    field_mappings, categories = analyze_blank_vs_filled() 