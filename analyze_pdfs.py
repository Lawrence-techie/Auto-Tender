#!/usr/bin/env python3
import pdfplumber
import PyPDF2
import json
import sys
from pathlib import Path

def analyze_pdf_structure(pdf_path, start_page=47, end_page=90):
    """Analyze PDF structure and extract field information"""
    print(f"Analyzing {pdf_path}...")
    
    with pdfplumber.open(pdf_path) as pdf:
        total_pages = len(pdf.pages)
        print(f"Total pages in PDF: {total_pages}")
        
        if start_page > total_pages or end_page > total_pages:
            print(f"Warning: Page range {start_page}-{end_page} exceeds total pages {total_pages}")
            return None
        
        fields_data = {}
        
        for page_num in range(start_page - 1, min(end_page, total_pages)):  # pdfplumber uses 0-based indexing
            page = pdf.pages[page_num]
            print(f"\nAnalyzing page {page_num + 1}...")
            
            # Extract text and position information
            text_lines = page.extract_text_lines()
            words = page.extract_words()
            chars = page.extract_text()
            
            page_data = {
                'text_lines': [],
                'words': [],
                'forms': [],
                'raw_text': chars
            }
            
            # Extract text lines with positions
            for line in text_lines:
                page_data['text_lines'].append({
                    'text': line['text'],
                    'x': line.get('x0', 0),
                    'y': line.get('top', 0),
                    'width': line.get('width', 0),
                    'height': line.get('height', 0),
                    'top': line.get('top', 0),
                    'bottom': line.get('bottom', 0)
                })
            
            # Extract individual words with positions
            for word in words:
                page_data['words'].append({
                    'text': word['text'],
                    'x': word['x0'],
                    'y': word['y0'],
                    'width': word['x1'] - word['x0'],
                    'height': word['y1'] - word['y0']
                })
            
            # Try to extract form fields
            try:
                forms = page.find_forms()
                for form in forms:
                    page_data['forms'].append({
                        'name': form.get('name', ''),
                        'value': form.get('value', ''),
                        'type': form.get('type', ''),
                        'x': form.get('x', 0),
                        'y': form.get('y', 0),
                        'width': form.get('width', 0),
                        'height': form.get('height', 0)
                    })
            except Exception as e:
                print(f"Could not extract forms from page {page_num + 1}: {e}")
            
            fields_data[f"page_{page_num + 1}"] = page_data
    
    return fields_data

def compare_pdfs(filled_pdf, blank_pdf, start_page=47, end_page=90):
    """Compare filled and blank PDFs to identify filled fields"""
    print("=== PDF Analysis Report ===\n")
    
    # Analyze both PDFs
    filled_data = analyze_pdf_structure(filled_pdf, start_page, end_page)
    blank_data = analyze_pdf_structure(blank_pdf, start_page, end_page)
    
    if not filled_data or not blank_data:
        print("Error: Could not analyze one or both PDFs")
        return
    
    # Compare and identify differences
    differences = {}
    
    for page_key in filled_data.keys():
        if page_key in blank_data:
            page_num = int(page_key.split('_')[1])
            print(f"\n=== Page {page_num} Analysis ===")
            
            filled_page = filled_data[page_key]
            blank_page = blank_data[page_key]
            
            # Compare text lines
            filled_texts = set([line['text'].strip() for line in filled_page['text_lines']])
            blank_texts = set([line['text'].strip() for line in blank_page['text_lines']])
            
            # Find filled content (in filled but not in blank)
            filled_content = filled_texts - blank_texts
            if filled_content:
                print(f"Filled content found: {filled_content}")
                
                # Get positions of filled content
                for line in filled_page['text_lines']:
                    if line['text'].strip() in filled_content:
                        print(f"  - '{line['text']}' at position ({line['x']:.2f}, {line['y']:.2f})")
            
            # Compare words for more granular analysis
            filled_words = [(w['text'], w['x'], w['y']) for w in filled_page['words']]
            blank_words = [(w['text'], w['x'], w['y']) for w in blank_page['words']]
            
            # Find words that appear in filled but not in blank (at same positions)
            new_words = []
            for fw in filled_words:
                found = False
                for bw in blank_words:
                    if abs(fw[1] - bw[1]) < 5 and abs(fw[2] - bw[2]) < 5:  # Within 5 points
                        if fw[0] == bw[0]:
                            found = True
                            break
                if not found and fw[0].strip():
                    new_words.append(fw)
            
            if new_words:
                print(f"New words/fields found: {len(new_words)}")
                for word, x, y in new_words[:10]:  # Show first 10
                    print(f"  - '{word}' at ({x:.2f}, {y:.2f})")
    
    # Save analysis results
    analysis_result = {
        'filled_pdf': filled_pdf,
        'blank_pdf': blank_pdf,
        'page_range': f"{start_page}-{end_page}",
        'filled_data': filled_data,
        'blank_data': blank_data,
        'differences': differences
    }
    
    with open('pdf_analysis_result.json', 'w') as f:
        json.dump(analysis_result, f, indent=2, default=str)
    
    print(f"\nAnalysis saved to pdf_analysis_result.json")

if __name__ == "__main__":
    filled_pdf = "KURA Mbale.pdf"  # Assuming this is the filled version
    blank_pdf = "Kura trippier mbale.pdf"  # Assuming this is the blank version
    
    if not Path(filled_pdf).exists() or not Path(blank_pdf).exists():
        print("Error: PDF files not found!")
        print("Available files:")
        for file in Path('.').glob('*.pdf'):
            print(f"  - {file}")
        sys.exit(1)
    
    compare_pdfs(filled_pdf, blank_pdf, 47, 90) 