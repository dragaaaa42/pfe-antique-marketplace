import sys
import os

try:
    from docx2pdf import convert
except ImportError:
    print("docx2pdf is not installed.")
    sys.exit(1)

docx_path = r"c:\Users\boura\ouissal\pfe-antique-marketplace-1\docs\Rapport_PFE_Artisans_Echo_AIT_OUAHMAN_OUISSAL.docx"
pdf_path = r"c:\Users\boura\ouissal\pfe-antique-marketplace-1\docs\Rapport_PFE_Artisans_Echo_AIT_OUAHMAN_OUISSAL.pdf"

if not os.path.exists(docx_path):
    print(f"Error: DOCX file not found at {docx_path}")
    sys.exit(1)

print(f"Converting {docx_path} to {pdf_path}...")
try:
    convert(docx_path, pdf_path)
    print("Conversion successful.")
except Exception as e:
    print(f"Error during conversion: {e}")
    sys.exit(1)
