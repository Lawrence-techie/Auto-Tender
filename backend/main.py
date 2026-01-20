#!/usr/bin/env python3
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import uvicorn
import tempfile
import os
from typing import Dict, Any
import json

from pdf_service import PDFService, TenderInfo

app = FastAPI(title="Auto-Tender PDF Service", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Auto-Tender PDF Service is running"}

@app.post("/extract-tender-info")
async def extract_tender_info(file: UploadFile = File(...)):
    """Extract tender information from uploaded PDF"""
    try:
        # Read the uploaded file
        content = await file.read()
        
        # Extract tender information
        tender_info = PDFService.extract_tender_info(content)
        
        return {
            "tender_name": tender_info.tender_name,
            "tender_number": tender_info.tender_number,
            "organization": tender_info.organization,
            "date": tender_info.date
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error extracting tender info: {str(e)}")

@app.post("/fill-pdf")
async def fill_pdf(
    template_file: UploadFile = File(...),
    profile_data: str = None,  # JSON string
    tender_info: str = None    # JSON string
):
    """Fill PDF with profile data and tender information"""
    try:
        # Read the template PDF
        template_content = await template_file.read()
        
        # Parse profile data
        if not profile_data:
            raise HTTPException(status_code=400, detail="Profile data is required")
        
        profile_dict = json.loads(profile_data)
        
        # Parse tender info
        tender_dict = json.loads(tender_info) if tender_info else {}
        tender_info_obj = TenderInfo(
            tender_name=tender_dict.get("tender_name", "Road Construction Project"),
            tender_number=tender_dict.get("tender_number", "KURA/2024/001"),
            organization=tender_dict.get("organization", "Kenya Urban Roads Authority"),
            date=tender_dict.get("date")
        )
        
        # Validate profile data
        is_valid, missing_fields = PDFService.validate_profile_data(profile_dict)
        if not is_valid:
            raise HTTPException(
                status_code=400, 
                detail=f"Profile data is incomplete. Missing fields: {', '.join(missing_fields)}"
            )
        
        # Fill the PDF
        filled_pdf_content = PDFService.fill_pdf(template_content, profile_dict, tender_info_obj)
        
        # Create temporary file for the filled PDF
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp_file:
            tmp_file.write(filled_pdf_content)
            tmp_file_path = tmp_file.name
        
        # Return the filled PDF as a file response
        return FileResponse(
            tmp_file_path,
            media_type="application/pdf",
            filename=f"filled_{profile_dict.get('company_name', 'document')}.pdf"
        )
        
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON data")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error filling PDF: {str(e)}")

@app.post("/compare-pdfs-and-create-template")
async def compare_pdfs_and_create_template(
    filled_pdf: UploadFile = File(...),
    blank_pdf: UploadFile = File(...)
):
    """Compare filled and blank PDFs to create a template mapping"""
    try:
        # Read both PDFs
        filled_content = await filled_pdf.read()
        blank_content = await blank_pdf.read()
        
        # Compare PDFs and extract template
        template = PDFService.compare_pdfs_and_extract_template(filled_content, blank_content)
        
        return {
            "template": template,
            "message": "Template created successfully",
            "extracted_fields": list(template['filled_values'].keys())
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating template: {str(e)}")

@app.post("/fill-pdf-using-template")
async def fill_pdf_using_template(blank_pdf: UploadFile = File(...), template_data: str = None, profile_data: str = None):
    """Fill a blank PDF using template data and profile information"""
    try:
        # Read the blank PDF
        blank_content = await blank_pdf.read()
        
        # Parse template and profile data
        template_dict = json.loads(template_data) if template_data else {}
        profile_dict = json.loads(profile_data) if profile_data else {}
        
        print(f"DEBUG: Filling PDF with template data: {len(template_dict.get('filled_values', {}))} fields")
        
        # Fill the PDF
        filled_pdf_content = PDFService.fill_pdf_using_template(template_dict, blank_content, profile_dict)
        
        # Return the filled PDF as a downloadable file
        from fastapi.responses import Response
        return Response(
            content=filled_pdf_content,
            media_type="application/pdf",
            headers={
                "Content-Disposition": "attachment; filename=filled_document.pdf"
            }
        )
        
    except Exception as e:
        print(f"ERROR: Failed to fill PDF: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error filling PDF: {str(e)}")

@app.post("/extract-data-from-filled-pdf")
async def extract_data_from_filled_pdf(filled_pdf: UploadFile = File(...)):
    """Extract data from a filled PDF"""
    try:
        # Read the filled PDF
        filled_content = await filled_pdf.read()
        
        print(f"DEBUG: Processing PDF: {filled_pdf.filename}, size: {len(filled_content)} bytes")
        
        # Extract data from filled PDF
        extracted_data = PDFService.extract_data_from_filled_pdf(filled_content)
        
        print(f"DEBUG: Extracted {len(extracted_data.filled_values)} fields")
        
        return {
            "extracted_values": extracted_data.filled_values,
            "pages_processed": len(extracted_data.text_content),
            "fields_found": list(extracted_data.filled_values.keys())
        }
    except Exception as e:
        print(f"ERROR: Failed to extract data from PDF: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error extracting data from filled PDF: {str(e)}")

@app.post("/compare-pdfs-and-extract-differences")
async def compare_pdfs_and_extract_differences(filled_pdf: UploadFile = File(...), blank_pdf: UploadFile = File(...)):
    """Compare filled vs blank PDFs and extract exact differences"""
    try:
        # Read both PDFs
        filled_content = await filled_pdf.read()
        blank_content = await blank_pdf.read()
        
        print(f"DEBUG: Processing filled PDF: {filled_pdf.filename}, size: {len(filled_content)} bytes")
        print(f"DEBUG: Processing blank PDF: {blank_pdf.filename}, size: {len(blank_content)} bytes")
        
        # Compare PDFs and extract differences
        result = PDFService.compare_pdfs_and_extract_differences(filled_content, blank_content)
        
        print(f"DEBUG: Found differences on {len(result['pages_compared'])} pages")
        print(f"DEBUG: Extracted {len(result['filled_values'])} specific fields")
        
        return {
            "differences": result['differences'],
            "filled_values": result['filled_values'],
            "pages_compared": result['pages_compared'],
            "total_differences": result['total_differences']
        }
    except Exception as e:
        print(f"ERROR: Failed to compare PDFs: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error comparing PDFs: {str(e)}")

@app.get("/field-coordinates")
async def get_field_coordinates():
    """Get field coordinates for PDF templates"""
    try:
        # This would normally analyze a PDF to get coordinates
        # For now, returning mock coordinates
        fields = PDFService.get_field_coordinates(b"")
        
        return {
            "fields": [
                {
                    "name": field.name,
                    "x": field.x,
                    "y": field.y,
                    "width": field.width,
                    "height": field.height
                }
                for field in fields
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting field coordinates: {str(e)}")

@app.post("/validate-profile")
async def validate_profile(profile_data: Dict[str, Any]):
    """Validate profile data completeness"""
    try:
        is_valid, missing_fields = PDFService.validate_profile_data(profile_data)
        
        return {
            "is_valid": is_valid,
            "missing_fields": missing_fields
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error validating profile: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000) 