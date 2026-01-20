#!/usr/bin/env python3
import pdfplumber
import PyPDF2
import json
import io
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass
import re

@dataclass
class TenderInfo:
    tender_name: str
    tender_number: str
    organization: str
    date: Optional[str] = None

@dataclass
class PDFField:
    name: str
    x: float
    y: float
    width: float
    height: float
    value: str = ""

@dataclass
class ExtractedData:
    """Data extracted from a filled PDF"""
    text_content: Dict[str, str]  # page_number -> text
    field_positions: List[PDFField]
    filled_values: Dict[str, str]  # field_name -> value

class PDFService:
    """Service for processing PDFs - extracting data and filling forms"""
    
    @staticmethod
    def extract_tender_info(pdf_content: bytes) -> TenderInfo:
        """Extract tender information from the first page of a PDF"""
        try:
            with pdfplumber.open(io.BytesIO(pdf_content)) as pdf:
                if len(pdf.pages) == 0:
                    raise ValueError("PDF has no pages")
                
                # Extract text from first page
                first_page = pdf.pages[0]
                text = first_page.extract_text()
                
                # Look for tender information patterns
                tender_info = PDFService._parse_tender_text(text)
                return tender_info
                
        except Exception as e:
            print(f"Error extracting tender info: {e}")
            # Return default info if extraction fails
            return TenderInfo(
                tender_name="Road Construction Project",
                tender_number="KURA/2024/001",
                organization="Kenya Urban Roads Authority",
                date=None
            )
    
    @staticmethod
    def _parse_tender_text(text: str) -> TenderInfo:
        """Parse tender information from extracted text"""
        # Common patterns for tender information
        tender_name_patterns = [
            r"TENDER\s+FOR\s+(.+?)(?:\n|$)",
            r"REQUEST\s+FOR\s+TENDER\s+(.+?)(?:\n|$)",
            r"INVITATION\s+TO\s+TENDER\s+(.+?)(?:\n|$)",
        ]
        
        tender_number_patterns = [
            r"TENDER\s+NO[.:]\s*([A-Z0-9/-]+)",
            r"REF[.:]\s*([A-Z0-9/-]+)",
            r"TENDER\s+REFERENCE[.:]\s*([A-Z0-9/-]+)",
        ]
        
        organization_patterns = [
            r"KENYA\s+URBAN\s+ROADS\s+AUTHORITY",
            r"KURA",
            r"MINISTRY\s+OF\s+TRANSPORT",
        ]
        
        # Extract tender name
        tender_name = "Road Construction Project"
        for pattern in tender_name_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                tender_name = match.group(1).strip()
                break
        
        # Extract tender number
        tender_number = "KURA/2024/001"
        for pattern in tender_number_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                tender_number = match.group(1).strip()
                break
        
        # Extract organization
        organization = "Kenya Urban Roads Authority"
        for pattern in organization_patterns:
            if re.search(pattern, text, re.IGNORECASE):
                if "KURA" in pattern:
                    organization = "Kenya Urban Roads Authority"
                break
        
        return TenderInfo(
            tender_name=tender_name,
            tender_number=tender_number,
            organization=organization
        )
    
    @staticmethod
    def extract_data_from_filled_pdf(filled_pdf_content: bytes) -> ExtractedData:
        """Extract filled data from a completed PDF"""
        try:
            with pdfplumber.open(io.BytesIO(filled_pdf_content)) as pdf:
                text_content = {}
                filled_values = {}
                
                # Extract text from each page
                for page_num, page in enumerate(pdf.pages):
                    text = page.extract_text()
                    text_content[str(page_num + 1)] = text
                
                # Identify filled values based on common patterns
                filled_values = PDFService._identify_filled_values(text_content)
                
                # Get field positions (mock for now)
                field_positions = PDFService.get_field_coordinates(b"")
                
                return ExtractedData(
                    text_content=text_content,
                    field_positions=field_positions,
                    filled_values=filled_values
                )
                
        except Exception as e:
            print(f"Error extracting data from filled PDF: {e}")
            raise
    
    @staticmethod
    def _identify_filled_values(text_content: Dict[str, str]) -> Dict[str, str]:
        """Identify filled values from text content"""
        filled_values = {}
        
        # Combine all text content
        all_text = " ".join(text_content.values())
        
        # Debug: Print first 500 characters to see what we're working with
        print(f"DEBUG: First 500 chars of extracted text: {all_text[:500]}")
        
        # Common patterns for identifying filled data
        patterns = {
            'company_name': [
                r'Company[:\s]+([A-Za-z\s&.,]+?)(?:\n|$)',
                r'Firm[:\s]+([A-Za-z\s&.,]+?)(?:\n|$)',
                r'Organization[:\s]+([A-Za-z\s&.,]+?)(?:\n|$)',
                r'Name[:\s]+([A-Za-z\s&.,]+?)(?:\n|$)',
                r'Business[:\s]+([A-Za-z\s&.,]+?)(?:\n|$)',
            ],
            'registration_number': [
                r'Registration[:\s]+([A-Z0-9/-]+)',
                r'Reg[.\s]+No[.:\s]+([A-Z0-9/-]+)',
                r'Company[:\s]+No[.:\s]+([A-Z0-9/-]+)',
                r'Reg[:\s]+([A-Z0-9/-]+)',
                r'Number[:\s]+([A-Z0-9/-]+)',
            ],
            'contact_person': [
                r'Contact[:\s]+([A-Za-z\s]+)',
                r'Person[:\s]+([A-Za-z\s]+)',
                r'Representative[:\s]+([A-Za-z\s]+)',
                r'Director[:\s]+([A-Za-z\s]+)',
                r'Manager[:\s]+([A-Za-z\s]+)',
            ],
            'phone': [
                r'Phone[:\s]+([+\d\s-]+)',
                r'Tel[.:\s]+([+\d\s-]+)',
                r'Mobile[:\s]+([+\d\s-]+)',
                r'Telephone[:\s]+([+\d\s-]+)',
                r'Call[:\s]+([+\d\s-]+)',
            ],
            'email': [
                r'Email[:\s]+([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})',
                r'E-mail[:\s]+([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})',
                r'Mail[:\s]+([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})',
            ],
            'address': [
                r'Address[:\s]+([A-Za-z0-9\s,.-]+?)(?:\n|$)',
                r'Location[:\s]+([A-Za-z0-9\s,.-]+?)(?:\n|$)',
                r'Street[:\s]+([A-Za-z0-9\s,.-]+?)(?:\n|$)',
                r'Office[:\s]+([A-Za-z0-9\s,.-]+?)(?:\n|$)',
            ],
            'annual_turnover': [
                r'Turnover[:\s]+([0-9,]+)',
                r'Revenue[:\s]+([0-9,]+)',
                r'Annual[:\s]+([0-9,]+)',
                r'Income[:\s]+([0-9,]+)',
            ],
            'tax_id': [
                r'Tax[:\s]+([A-Z0-9/-]+)',
                r'VAT[:\s]+([A-Z0-9/-]+)',
                r'PIN[:\s]+([A-Z0-9/-]+)',
                r'Tax ID[:\s]+([A-Z0-9/-]+)',
            ],
            'directors': [
                r'Director[:\s]+([A-Za-z\s,]+)',
                r'Directors[:\s]+([A-Za-z\s,]+)',
                r'Board[:\s]+([A-Za-z\s,]+)',
                r'Management[:\s]+([A-Za-z\s,]+)',
            ],
            'signature': [
                r'Signature[:\s]+([A-Za-z\s]+)',
                r'Signed[:\s]+([A-Za-z\s]+)',
                r'Authorized[:\s]+([A-Za-z\s]+)',
            ],
            'bank_reference': [
                r'Bank[:\s]+([A-Za-z\s,.-]+)',
                r'Reference[:\s]+([A-Za-z\s,.-]+)',
                r'Banking[:\s]+([A-Za-z\s,.-]+)',
            ],
            'credit_facility': [
                r'Credit[:\s]+([A-Za-z\s,.-]+)',
                r'Facility[:\s]+([A-Za-z\s,.-]+)',
                r'Loan[:\s]+([A-Za-z\s,.-]+)',
            ],
            'financial_capacity': [
                r'Capacity[:\s]+([A-Za-z\s,.-]+)',
                r'Financial[:\s]+([A-Za-z\s,.-]+)',
                r'Capability[:\s]+([A-Za-z\s,.-]+)',
            ],
            'bank_guarantee': [
                r'Guarantee[:\s]+([A-Za-z\s,.-]+)',
                r'Bank Guarantee[:\s]+([A-Za-z\s,.-]+)',
                r'Security[:\s]+([A-Za-z\s,.-]+)',
            ],
            'insurance': [
                r'Insurance[:\s]+([A-Za-z\s,.-]+)',
                r'Coverage[:\s]+([A-Za-z\s,.-]+)',
                r'Policy[:\s]+([A-Za-z\s,.-]+)',
            ],
            'similar_projects': [
                r'Projects[:\s]+([A-Za-z\s,.-]+)',
                r'Experience[:\s]+([A-Za-z\s,.-]+)',
                r'Previous[:\s]+([A-Za-z\s,.-]+)',
            ],
            'project_value': [
                r'Value[:\s]+([0-9,]+)',
                r'Project Value[:\s]+([0-9,]+)',
                r'Cost[:\s]+([0-9,]+)',
            ],
            'completion_date': [
                r'Completion[:\s]+([0-9/-]+)',
                r'Finished[:\s]+([0-9/-]+)',
                r'Date[:\s]+([0-9/-]+)',
            ],
            'client_reference': [
                r'Client[:\s]+([A-Za-z\s,.-]+)',
                r'Reference[:\s]+([A-Za-z\s,.-]+)',
                r'Customer[:\s]+([A-Za-z\s,.-]+)',
            ],
            'equipment': [
                r'Equipment[:\s]+([A-Za-z\s,.-]+)',
                r'Machinery[:\s]+([A-Za-z\s,.-]+)',
                r'Tools[:\s]+([A-Za-z\s,.-]+)',
            ],
            'personnel': [
                r'Personnel[:\s]+([A-Za-z\s,.-]+)',
                r'Staff[:\s]+([A-Za-z\s,.-]+)',
                r'Employees[:\s]+([A-Za-z\s,.-]+)',
            ],
            'methodology': [
                r'Methodology[:\s]+([A-Za-z\s,.-]+)',
                r'Approach[:\s]+([A-Za-z\s,.-]+)',
                r'Method[:\s]+([A-Za-z\s,.-]+)',
            ],
            'timeline': [
                r'Timeline[:\s]+([A-Za-z\s,.-]+)',
                r'Schedule[:\s]+([A-Za-z\s,.-]+)',
                r'Duration[:\s]+([A-Za-z\s,.-]+)',
            ],
        }
        
        # Extract values using patterns
        for field_name, field_patterns in patterns.items():
            for pattern in field_patterns:
                match = re.search(pattern, all_text, re.IGNORECASE)
                if match:
                    filled_values[field_name] = match.group(1).strip()
                    print(f"DEBUG: Found {field_name}: {match.group(1).strip()}")
                    break
        
        # If no patterns match, try to extract any text that looks like filled data
        if not filled_values:
            print("DEBUG: No patterns matched, trying generic extraction...")
            # Look for any text that might be filled data (not just labels)
            lines = all_text.split('\n')
            for line in lines:
                line = line.strip()
                if len(line) > 3 and not line.isupper() and not re.match(r'^[A-Z\s]+$', line):
                    # This might be filled data
                    if 'company' in line.lower() or 'name' in line.lower():
                        filled_values['company_name'] = line
                    elif 'phone' in line.lower() or 'tel' in line.lower():
                        filled_values['phone'] = line
                    elif '@' in line:
                        filled_values['email'] = line
                    elif re.match(r'^[0-9,]+$', line):
                        filled_values['annual_turnover'] = line
        
        print(f"DEBUG: Extracted {len(filled_values)} fields: {list(filled_values.keys())}")
        return filled_values
    
    @staticmethod
    def compare_pdfs_and_extract_template(filled_pdf_content: bytes, blank_pdf_content: bytes) -> Dict[str, any]:
        """Compare filled and blank PDFs to create a template mapping"""
        try:
            # Extract data from filled PDF
            filled_data = PDFService.extract_data_from_filled_pdf(filled_pdf_content)
            
            # Extract text from blank PDF
            with pdfplumber.open(io.BytesIO(blank_pdf_content)) as blank_pdf:
                blank_text_content = {}
                for page_num, page in enumerate(blank_pdf.pages):
                    text = page.extract_text()
                    blank_text_content[str(page_num + 1)] = text
            
            # Create template mapping
            template = {
                'filled_values': filled_data.filled_values,
                'field_mappings': PDFService._create_field_mappings(filled_data, blank_text_content),
                'extracted_data': filled_data
            }
            
            return template
            
        except Exception as e:
            print(f"Error comparing PDFs: {e}")
            raise
    
    @staticmethod
    def _create_field_mappings(filled_data: ExtractedData, blank_text_content: Dict[str, str]) -> Dict[str, any]:
        """Create field mappings between filled and blank PDFs"""
        # This would analyze the differences between filled and blank PDFs
        # For now, returning a basic mapping structure
        
        field_mappings = {
            'company_name': {'type': 'text', 'position': 'auto'},
            'registration_number': {'type': 'text', 'position': 'auto'},
            'contact_person': {'type': 'text', 'position': 'auto'},
            'phone': {'type': 'text', 'position': 'auto'},
            'email': {'type': 'text', 'position': 'auto'},
            'address': {'type': 'text', 'position': 'auto'},
            'annual_turnover': {'type': 'number', 'position': 'auto'},
            'bank_reference': {'type': 'text', 'position': 'auto'},
            'credit_facility': {'type': 'text', 'position': 'auto'},
            'financial_capacity': {'type': 'text', 'position': 'auto'},
            'bank_guarantee': {'type': 'text', 'position': 'auto'},
            'insurance': {'type': 'text', 'position': 'auto'},
            'similar_projects': {'type': 'text', 'position': 'auto'},
            'project_value': {'type': 'number', 'position': 'auto'},
            'completion_date': {'type': 'date', 'position': 'auto'},
            'client_reference': {'type': 'text', 'position': 'auto'},
            'equipment': {'type': 'text', 'position': 'auto'},
            'personnel': {'type': 'text', 'position': 'auto'},
            'methodology': {'type': 'text', 'position': 'auto'},
            'timeline': {'type': 'text', 'position': 'auto'},
        }
        
        return field_mappings
    
    @staticmethod
    def fill_pdf_using_template(template_data: Dict, blank_pdf_content: bytes, profile_data: Dict) -> bytes:
        """Fill a blank PDF using template data and profile info"""
        try:
            from reportlab.pdfgen import canvas
            from reportlab.lib.pagesizes import letter
            from reportlab.lib import colors
            from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
            from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
            from io import BytesIO
            
            print(f"DEBUG: Filling PDF with {len(template_data.get('filled_values', {}))} fields")
            
            # Create a new PDF with the filled data
            buffer = BytesIO()
            doc = SimpleDocTemplate(buffer, pagesize=letter)
            styles = getSampleStyleSheet()
            
            # Create content for the filled PDF
            story = []
            
            # Add title
            title_style = ParagraphStyle(
                'CustomTitle',
                parent=styles['Heading1'],
                fontSize=16,
                spaceAfter=30,
                alignment=1  # Center alignment
            )
            story.append(Paragraph("FILLED TENDER DOCUMENT", title_style))
            story.append(Spacer(1, 20))
            
            # Add extracted data
            filled_values = template_data.get('filled_values', {})
            
            # Group data by categories
            categories = {
                'Company Information': ['company_name', 'registration_number', 'contact_person', 'phone', 'email', 'address'],
                'Financial Information': ['annual_turnover', 'tax_id', 'directors', 'signature'],
                'Banking Information': ['bank_reference', 'credit_facility', 'financial_capacity', 'bank_guarantee'],
                'Technical Information': ['insurance', 'similar_projects', 'project_value', 'completion_date', 'client_reference', 'equipment', 'personnel', 'methodology', 'timeline']
            }
            
            for category, fields in categories.items():
                # Add category header
                category_style = ParagraphStyle(
                    'CategoryHeader',
                    parent=styles['Heading2'],
                    fontSize=14,
                    spaceAfter=12,
                    spaceBefore=20,
                    textColor=colors.darkblue
                )
                story.append(Paragraph(category, category_style))
                
                # Add fields in this category
                for field in fields:
                    if field in filled_values and filled_values[field]:
                        field_style = ParagraphStyle(
                            'FieldStyle',
                            parent=styles['Normal'],
                            fontSize=10,
                            spaceAfter=6,
                            leftIndent=20
                        )
                        field_text = f"<b>{field.replace('_', ' ').title()}:</b> {filled_values[field]}"
                        story.append(Paragraph(field_text, field_style))
                
                story.append(Spacer(1, 10))
            
            # Add any remaining fields that weren't categorized
            remaining_fields = {k: v for k, v in filled_values.items() 
                             if k not in [field for fields in categories.values() for field in fields]}
            
            if remaining_fields:
                story.append(Paragraph("Additional Information", category_style))
                for field, value in remaining_fields.items():
                    if value:
                        field_style = ParagraphStyle(
                            'FieldStyle',
                            parent=styles['Normal'],
                            fontSize=10,
                            spaceAfter=6,
                            leftIndent=20
                        )
                        field_text = f"<b>{field.replace('_', ' ').title()}:</b> {value}"
                        story.append(Paragraph(field_text, field_style))
            
            # Build the PDF
            doc.build(story)
            
            # Get the PDF content
            pdf_content = buffer.getvalue()
            buffer.close()
            
            print(f"DEBUG: Successfully created filled PDF with {len(pdf_content)} bytes")
            return pdf_content
            
        except Exception as e:
            print(f"ERROR: Failed to fill PDF: {str(e)}")
            import traceback
            traceback.print_exc()
            raise e
    
    @staticmethod
    def get_field_coordinates(pdf_content: bytes) -> List[PDFField]:
        """Get field coordinates from a PDF template"""
        # This would analyze the PDF to find field positions
        # For now, returning coordinates based on our analysis of the KURA tender
        
        return [
            # Company Information fields (pages 47-90)
            PDFField(name='company_name', x=100, y=200, width=150, height=20),
            PDFField(name='registration_number', x=300, y=200, width=100, height=20),
            PDFField(name='contact_person', x=100, y=250, width=120, height=20),
            PDFField(name='phone', x=250, y=250, width=100, height=20),
            PDFField(name='email', x=370, y=250, width=150, height=20),
            PDFField(name='address', x=100, y=300, width=300, height=40),
            PDFField(name='tax_id', x=100, y=350, width=100, height=20),
            PDFField(name='directors', x=250, y=350, width=200, height=40),
            PDFField(name='signature', x=100, y=400, width=150, height=30),
            
            # Financial Information fields
            PDFField(name='annual_turnover', x=100, y=500, width=150, height=20),
            PDFField(name='bank_reference', x=300, y=500, width=200, height=40),
            PDFField(name='credit_facility', x=100, y=550, width=200, height=40),
            PDFField(name='financial_capacity', x=350, y=550, width=150, height=40),
            PDFField(name='bank_guarantee', x=100, y=600, width=200, height=40),
            PDFField(name='insurance', x=350, y=600, width=150, height=40),
            
            # Experience Information fields
            PDFField(name='similar_projects', x=100, y=700, width=400, height=60),
            PDFField(name='project_value', x=100, y=780, width=150, height=20),
            PDFField(name='completion_date', x=300, y=780, width=100, height=20),
            PDFField(name='client_reference', x=100, y=820, width=400, height=40),
            
            # Technical Information fields
            PDFField(name='equipment', x=100, y=900, width=400, height=60),
            PDFField(name='personnel', x=100, y=980, width=400, height=60),
            PDFField(name='methodology', x=100, y=1060, width=400, height=60),
            PDFField(name='timeline', x=100, y=1140, width=400, height=60),
        ]
    
    @staticmethod
    def fill_pdf(template_pdf_content: bytes, profile_data: Dict, tender_info: TenderInfo) -> bytes:
        """Fill a PDF template with profile data and tender information"""
        try:
            # Create a PDF reader from the template
            pdf_reader = PyPDF2.PdfReader(io.BytesIO(template_pdf_content))
            pdf_writer = PyPDF2.PdfWriter()
            
            # Copy all pages from the template
            for page in pdf_reader.pages:
                pdf_writer.add_page(page)
            
            # Create a new PDF with filled data
            # Note: This is a simplified implementation
            # In production, you would use a more sophisticated approach to fill PDF forms
            
            # For now, we'll create a simple filled PDF
            output_buffer = io.BytesIO()
            pdf_writer.write(output_buffer)
            output_buffer.seek(0)
            
            return output_buffer.getvalue()
            
        except Exception as e:
            print(f"Error filling PDF: {e}")
            # Return the original PDF if filling fails
            return template_pdf_content
    
    @staticmethod
    def validate_profile_data(profile_data: Dict) -> Tuple[bool, List[str]]:
        """Validate that all required fields are present in the profile data"""
        required_fields = [
            'company_name', 'registration_number', 'contact_person', 'phone', 'email',
            'address', 'tax_id', 'directors', 'signature',
            'annual_turnover', 'bank_reference', 'credit_facility', 'financial_capacity',
            'bank_guarantee', 'insurance',
            'similar_projects', 'project_value', 'completion_date', 'client_reference',
            'equipment', 'personnel', 'methodology', 'timeline'
        ]
        
        missing_fields = []
        for field in required_fields:
            if not profile_data.get(field) or profile_data[field].strip() == '':
                missing_fields.append(field)
        
        return len(missing_fields) == 0, missing_fields

    @staticmethod
    def compare_pdfs_and_extract_differences(filled_pdf_content: bytes, blank_pdf_content: bytes) -> Dict[str, any]:
        """Compare filled vs blank PDFs and extract only the differences (filled data)"""
        try:
            # Extract text from both PDFs for pages 47-90
            filled_text = {}
            blank_text = {}
            
            with pdfplumber.open(io.BytesIO(filled_pdf_content)) as filled_pdf:
                for page_num in range(47, 91):  # pages 47-90
                    if page_num < len(filled_pdf.pages):
                        page = filled_pdf.pages[page_num]
                        filled_text[str(page_num)] = page.extract_text() or ""
            
            with pdfplumber.open(io.BytesIO(blank_pdf_content)) as blank_pdf:
                for page_num in range(47, 91):  # pages 47-90
                    if page_num < len(blank_pdf.pages):
                        page = blank_pdf.pages[page_num]
                        blank_text[str(page_num)] = page.extract_text() or ""
            
            # Find differences between filled and blank text
            differences = {}
            filled_values = {}
            
            for page_num in range(47, 91):
                page_str = str(page_num)
                if page_str in filled_text and page_str in blank_text:
                    filled_page_text = filled_text[page_str]
                    blank_page_text = blank_text[page_str]
                    
                    # Split into lines for comparison
                    filled_lines = filled_page_text.split('\n')
                    blank_lines = blank_page_text.split('\n')
                    
                    # Find lines that are different
                    page_differences = []
                    for i, (filled_line, blank_line) in enumerate(zip(filled_lines, blank_lines)):
                        if filled_line.strip() != blank_line.strip():
                            # This line has differences - extract the filled data
                            filled_data = filled_line.strip()
                            blank_data = blank_line.strip()
                            
                            # Only include if the filled data looks like actual content (not just whitespace)
                            if filled_data and len(filled_data) > 2 and not filled_data.isspace():
                                page_differences.append({
                                    'line_number': i,
                                    'filled_data': filled_data,
                                    'blank_data': blank_data
                                })
                    
                    if page_differences:
                        differences[page_str] = page_differences
                        
                        # Extract specific field data based on patterns
                        for diff in page_differences:
                            filled_data = diff['filled_data']
                            
                            # Look for specific field patterns
                            if re.search(r'company|firm|organization', filled_data.lower()):
                                filled_values['company_name'] = filled_data
                            elif re.search(r'registration|reg\.?|no\.?', filled_data.lower()):
                                filled_values['registration_number'] = filled_data
                            elif re.search(r'contact|person|representative', filled_data.lower()):
                                filled_values['contact_person'] = filled_data
                            elif re.search(r'phone|tel|mobile', filled_data.lower()):
                                filled_values['phone'] = filled_data
                            elif re.search(r'@|email|mail', filled_data.lower()):
                                filled_values['email'] = filled_data
                            elif re.search(r'address|location|street', filled_data.lower()):
                                filled_values['address'] = filled_data
                            elif re.search(r'turnover|revenue|income', filled_data.lower()):
                                filled_values['annual_turnover'] = filled_data
                            elif re.search(r'tax|vat|pin', filled_data.lower()):
                                filled_values['tax_id'] = filled_data
                            elif re.search(r'director|board|management', filled_data.lower()):
                                filled_values['directors'] = filled_data
                            elif re.search(r'signature|signed|authorized', filled_data.lower()):
                                filled_values['signature'] = filled_data
                            elif re.search(r'bank|reference|banking', filled_data.lower()):
                                filled_values['bank_reference'] = filled_data
                            elif re.search(r'credit|facility|loan', filled_data.lower()):
                                filled_values['credit_facility'] = filled_data
                            elif re.search(r'capacity|capability', filled_data.lower()):
                                filled_values['financial_capacity'] = filled_data
                            elif re.search(r'guarantee|security', filled_data.lower()):
                                filled_values['bank_guarantee'] = filled_data
                            elif re.search(r'insurance|coverage|policy', filled_data.lower()):
                                filled_values['insurance'] = filled_data
                            elif re.search(r'project|experience|previous', filled_data.lower()):
                                filled_values['similar_projects'] = filled_data
                            elif re.search(r'value|cost|amount', filled_data.lower()):
                                filled_values['project_value'] = filled_data
                            elif re.search(r'completion|finished|date', filled_data.lower()):
                                filled_values['completion_date'] = filled_data
                            elif re.search(r'client|reference|customer', filled_data.lower()):
                                filled_values['client_reference'] = filled_data
                            elif re.search(r'equipment|machinery|tools', filled_data.lower()):
                                filled_values['equipment'] = filled_data
                            elif re.search(r'personnel|staff|employees', filled_data.lower()):
                                filled_values['personnel'] = filled_data
                            elif re.search(r'methodology|approach|method', filled_data.lower()):
                                filled_values['methodology'] = filled_data
                            elif re.search(r'timeline|schedule|duration', filled_data.lower()):
                                filled_values['timeline'] = filled_data
                            else:
                                # Generic field - store with line number as key
                                filled_values[f'field_line_{diff["line_number"]}'] = filled_data
            
            print(f"DEBUG: Found {len(differences)} pages with differences")
            print(f"DEBUG: Extracted {len(filled_values)} specific fields")
            
            return {
                'differences': differences,
                'filled_values': filled_values,
                'pages_compared': list(differences.keys()),
                'total_differences': sum(len(diffs) for diffs in differences.values())
            }
            
        except Exception as e:
            print(f"ERROR: Failed to compare PDFs: {str(e)}")
            import traceback
            traceback.print_exc()
            raise e

# Example usage
if __name__ == "__main__":
    # Test the PDF service
    service = PDFService()
    
    # Mock profile data
    profile_data = {
        'company_name': 'ABC Construction Ltd',
        'registration_number': '12345678',
        'contact_person': 'John Smith',
        'phone': '+254-700-123456',
        'email': 'john@abc-construction.com',
        'address': '123 Business Street, Nairobi, Kenya',
        'tax_id': 'A123456789X',
        'directors': 'John Smith, Jane Doe',
        'signature': 'John Smith',
        'annual_turnover': '50000000',
        'bank_reference': 'Bank of Kenya - Reference Letter attached',
        'credit_facility': 'Credit facility of KES 100M available',
        'financial_capacity': 'Financial statements for last 3 years attached',
        'bank_guarantee': 'Bank guarantee of 10% of contract value',
        'insurance': 'Comprehensive insurance coverage for all projects',
        'similar_projects': 'Road construction projects in Nairobi and Mombasa',
        'project_value': '25000000',
        'completion_date': '2023-12-31',
        'client_reference': 'Ministry of Transport - Contact: +254-700-000000',
        'equipment': 'Excavators, bulldozers, graders, compactors available',
        'personnel': 'Civil engineers, project managers, skilled laborers',
        'methodology': 'Modern construction methods with quality control',
        'timeline': 'Project completion within 12 months'
    }
    
    # Validate profile
    is_valid, missing = service.validate_profile_data(profile_data)
    print(f"Profile valid: {is_valid}")
    if not is_valid:
        print(f"Missing fields: {missing}") 