# Auto-Tender - Complete PDF Automation System

A comprehensive web application for managing company profiles and automating tender document filling with intelligent PDF processing.

## 🚀 Features

### Profile Management
- **Create Company Profiles** - Store all company information once
- **Edit Profiles** - Update any information at any time
- **Multiple Profiles** - Manage multiple companies/entities
- **Local Storage** - Data persists between sessions
- **Form Validation** - Real-time validation with helpful error messages

### PDF Automation
- **Upload Blank PDFs** - Upload tender documents for processing
- **Extract Tender Info** - Automatically extract tender name, number, and organization
- **Profile Selection** - Choose which company profile to use
- **Auto-Fill PDFs** - Fill all 23 fields automatically
- **Download Filled PDFs** - Get completed documents ready for submission

### Form Fields (23 Total)
- **Company Information** (9 fields)
  - Company Name, Registration Number, Contact Person
  - Phone, Email, Address, Tax ID, Directors, Signature

- **Financial Information** (6 fields)
  - Annual Turnover, Bank Reference, Credit Facility
  - Financial Capacity, Bank Guarantee, Insurance

- **Experience Information** (4 fields)
  - Similar Projects, Project Value, Completion Date, Client Reference

- **Technical Information** (4 fields)
  - Equipment, Personnel, Methodology, Timeline

## 🛠️ Technology Stack

### Frontend
- **React 18** + **TypeScript** + **Next.js 14**
- **Tailwind CSS** - Modern, responsive styling
- **React Hook Form** + **Zod** - Form validation
- **Local Storage** - Data persistence

### Backend
- **Python** + **FastAPI** - High-performance API
- **PyPDF2** + **pdfplumber** - PDF processing
- **Uvicorn** - ASGI server

## 📦 Installation

### 1. Clone and Setup Frontend
```bash
git clone <repository-url>
cd Auto-Tender

# Install frontend dependencies
npm install

# Start frontend development server
npm run dev
```

### 2. Setup Backend
```bash
# Navigate to backend directory
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Start backend server
python main.py
```

### 3. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000

## 🎯 Usage

### Creating a Profile
1. Navigate to **Profile Management**
2. Click "Create New Profile"
3. Enter a profile name (e.g., "ABC Construction Ltd")
4. Navigate through the 4 categories using the tab buttons
5. Fill in all required fields with your company information
6. Click "Create Profile" to save

### PDF Automation
1. Navigate to **PDF Automation**
2. **Step 1**: Upload a blank tender PDF
3. **Step 2**: Review extracted tender information
4. **Step 3**: Select a company profile
5. **Step 4**: Click "Generate Filled PDF"
6. Download the completed document

### Managing Profiles
- **View**: See all your profiles on the dashboard
- **Edit**: Click "Edit" on any profile to modify information
- **Delete**: Click "Delete" to remove a profile (with confirmation)

## 🏗️ Project Structure

```
Auto-Tender/
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main page component
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   └── textarea.tsx
│   ├── profile-form.tsx  # Profile management form
│   └── pdf-automation.tsx # PDF automation interface
├── lib/                  # Utility functions
│   ├── profile-fields.ts # Field definitions
│   ├── utils.ts          # Helper functions
│   ├── pdf-processor.ts  # PDF processing logic
│   └── api.ts           # API client
├── types/                # TypeScript types
│   └── profile.ts        # Profile interfaces
├── backend/              # Python backend
│   ├── main.py          # FastAPI application
│   ├── pdf_service.py   # PDF processing service
│   └── requirements.txt  # Python dependencies
└── package.json          # Frontend dependencies
```

## 🔧 Development

### Frontend Development
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Backend Development
```bash
# Install dependencies
pip install -r backend/requirements.txt

# Start development server
cd backend
python main.py

# Or with uvicorn directly
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### API Endpoints

#### PDF Processing
- `POST /extract-tender-info` - Extract tender information from PDF
- `POST /fill-pdf` - Fill PDF with profile data
- `GET /field-coordinates` - Get field coordinates for templates
- `POST /validate-profile` - Validate profile completeness

#### Example API Usage
```javascript
// Extract tender info
const tenderInfo = await APIClient.extractTenderInfo(pdfFile);

// Fill PDF
const filledPDF = await APIClient.fillPDF(templateFile, profile, tenderInfo);

// Validate profile
const validation = await APIClient.validateProfile(profile);
```

## 🎨 UI/UX Features

- **Modern Design** - Clean, professional interface
- **Responsive Layout** - Works on all screen sizes
- **Category Navigation** - Easy switching between field groups
- **Real-time Validation** - Immediate feedback on form errors
- **Loading States** - Visual feedback during operations
- **Confirmation Dialogs** - Safe deletion with confirmation
- **Step-by-step Process** - Clear workflow for PDF automation

## 🔄 PDF Processing Logic

### 1. Tender Information Extraction
- **Upload blank PDF** → Extract text from cover page
- **Pattern matching** → Find tender name, number, organization
- **Return structured data** → Ready for form filling

### 2. Profile Data Mapping
- **23 fields** → Mapped to PDF coordinates
- **4 categories** → Company, Financial, Experience, Technical
- **Validation** → Ensure all required fields are complete

### 3. PDF Filling
- **Coordinate-based** → Fill text at specific positions
- **Template-aware** → Handle different PDF layouts
- **Download ready** → Generate filled PDF for submission

## 📊 Current Status

✅ **Complete System**
- Profile management with 23 fields
- PDF upload and tender info extraction
- Profile selection and validation
- PDF filling and download
- Modern, responsive UI
- Real-time validation and error handling

🔄 **Production Ready**
- Frontend: React/Next.js with TypeScript
- Backend: FastAPI with PDF processing
- Data persistence with localStorage
- API integration for PDF automation

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
npm run build
# Deploy to Vercel or Netlify
```

### Backend (Heroku/DigitalOcean)
```bash
# Install dependencies
pip install -r requirements.txt

# Set environment variables
export PORT=8000

# Start server
uvicorn main:app --host 0.0.0.0 --port $PORT
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues or questions:
1. Check the documentation
2. Review the code structure
3. Create an issue with detailed description
4. Include error logs and steps to reproduce 