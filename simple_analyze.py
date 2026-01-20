#!/usr/bin/env python3
import pdfplumber
import json
import sys
from pathlib import Path

def analyze_pdf_simple(pdf_path, start_page=47, end_page=90):
    """Simple PDF analysis focusing on text extraction"""
    print(f"Analyzing {pdf_path}...")
    
    with pdfplumber.open(pdf_path) as pdf:
        total_pages = len(pdf.pages)
        print(f"Total pages in PDF: {total_pages}")
        
        if start_page > total_pages or end_page > total_pages:
            print(f"Warning: Page range {start_page}-{end_page} exceeds total pages {total_pages}")
            return None
        
        pages_data = {}
        
        for page_num in range(start_page - 1, min(end_page, total_pages)):
            page = pdf.pages[page_num]
            print(f"\nAnalyzing page {page_num + 1}...")
            
            # Extract all text from the page
            text = page.extract_text()
            
            # Extract words with positions
            words = page.extract_words()
            
            # Extract text lines
            text_lines = page.extract_text_lines()
            
            page_data = {
                'raw_text': text,
                'words': [],
                'text_lines': []
            }
            
            # Process words
            for word in words:
                try:
                    page_data['words'].append({
                        'text': word.get('text', ''),
                        'x': word.get('x0', 0),
                        'y': word.get('top', 0),  # Using 'top' instead of 'y0'
                        'width': word.get('width', 0),
                        'height': word.get('height', 0)
                    })
                except Exception as e:
                    print(f"Error processing word: {e}")
                    continue
            
            # Process text lines
            for line in text_lines:
                try:
                    page_data['text_lines'].append({
                        'text': line.get('text', ''),
                        'x': line.get('x0', 0),
                        'y': line.get('top', 0),
                        'width': line.get('width', 0),
                        'height': line.get('height', 0)
                    })
                except Exception as e:
                    print(f"Error processing line: {e}")
                    continue
            
            pages_data[f"page_{page_num + 1}"] = page_data
    
    return pages_data

def compare_pdfs_simple(filled_pdf, blank_pdf, start_page=47, end_page=90):
    """Compare filled and blank PDFs to identify differences"""
    print("=== PDF Analysis Report ===\n")
    
    # Analyze both PDFs
    filled_data = analyze_pdf_simple(filled_pdf, start_page, end_page)
    blank_data = analyze_pdf_simple(blank_pdf, start_page, end_page)
    
    if not filled_data or not blank_data:
        print("Error: Could not analyze one or both PDFs")
        return
    
    print("\n=== Summary of Analysis ===")
    
    for page_key in filled_data.keys():
        if page_key in blank_data:
            page_num = int(page_key.split('_')[1])
            print(f"\n--- Page {page_num} ---")
            
            filled_page = filled_data[page_key]
            blank_page = blank_data[page_key]
            
            # Compare raw text
            filled_text = filled_page['raw_text']
            blank_text = blank_page['raw_text']
            
            print(f"Filled text length: {len(filled_text)}")
            print(f"Blank text length: {len(blank_text)}")
            
            # Find differences in words
            filled_words = set([w['text'].lower().strip() for w in filled_page['words'] if w['text'].strip()])
            blank_words = set([w['text'].lower().strip() for w in blank_page['words'] if w['text'].strip()])
            
            # Find new words in filled version
            new_words = filled_words - blank_words
            if new_words:
                print(f"New words found: {len(new_words)}")
                for word in sorted(new_words)[:20]:  # Show first 20
                    print(f"  - '{word}'")
            
            # Find words that are in blank but not in filled (deleted)
            deleted_words = blank_words - filled_words
            if deleted_words:
                print(f"Deleted words found: {len(deleted_words)}")
                for word in sorted(deleted_words)[:10]:
                    print(f"  - '{word}'")
    
    # Save analysis results
    analysis_result = {
        'filled_pdf': filled_pdf,
        'blank_pdf': blank_pdf,
        'page_range': f"{start_page}-{end_page}",
        'filled_data': filled_data,
        'blank_data': blank_data
    }
    
    with open('pdf_analysis_result.json', 'w') as f:
        json.dump(analysis_result, f, indent=2, default=str)
    
    print(f"\nAnalysis saved to pdf_analysis_result.json")

if __name__ == "__main__":
    filled_pdf = "KURA Mbale.pdf"
    blank_pdf = "Kura trippier mbale.pdf"
    
    if not Path(filled_pdf).exists() or not Path(blank_pdf).exists():
        print("Error: PDF files not found!")
        print("Available files:")
        for file in Path('.').glob('*.pdf'):
            print(f"  - {file}")
        sys.exit(1)
    
    compare_pdfs_simple(filled_pdf, blank_pdf, 47, 90) 