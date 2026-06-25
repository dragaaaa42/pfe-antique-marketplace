import re

with open('generate_report.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Restore the back cover
pdf_output = 'pdf.output(OUTPUT_PDF)'
idx = content.find(pdf_output)

if idx != -1:
    new_code = '''
    # --- Back Cover / Remerciements Finaux ---
    pdf.add_page()
    pdf.is_chapter_sep = True # Disable footer
    
    # Let's add a nice background color rectangle to make it look like a cover
    pdf.set_fill_color(250, 250, 250) # Very light grey/white
    pdf.rect(0, 0, 210, 297, 'F')
    
    pdf.set_y(60)
    
    # Logo
    pdf.image(LOGO, x=(210 - 50) / 2, w=50)
    pdf.ln(40)
    
    # Title
    pdf.set_font("Helvetica", "B", 32)
    pdf.set_text_color(*SOFT_GOLD)
    pdf.cell(0, 15, "Artisan's Echo", align="C", border=0)
    pdf.ln(12)
    
    pdf.set_font("Helvetica", "I", 16)
    pdf.set_text_color(*ROYAL_BLUE)
    pdf.cell(0, 10, "Marketplace Premium d'Antiquités", align="C")
    pdf.ln(25)
    
    # Subtle line
    pdf.set_draw_color(*SOFT_GOLD)
    pdf.set_line_width(0.5)
    pdf.line(60, pdf.get_y(), 150, pdf.get_y())
    pdf.ln(25)
    
    # Text
    pdf.set_font("Helvetica", "", 13)
    pdf.set_text_color(*DARK_GREY)
    final_text = (
        "La réalisation de ce projet de fin d'études n'aurait pas été possible sans l'accompagnement "
        "précieux et les conseils avisés de mon encadrant, M. Ait Ben Hamou Khalid.\\n\\n"
        "Je tiens à lui exprimer ma plus profonde gratitude pour sa disponibilité, "
        "son soutien continu et son expertise qui m'ont guidé tout au long de ce parcours.\\n\\n"
        "Un grand merci également à l'établissement Racine pour la qualité de sa formation. "
        "Ce projet représente l'aboutissement d'un apprentissage rigoureux et passionnant."
    )
    
    pdf.set_x(25)
    pdf.multi_cell(160, 8, final_text, align="C")
    
    pdf.ln(40)
    
    pdf.set_font("Helvetica", "B", 11)
    pdf.set_text_color(*MID_GREY)
    pdf.cell(0, 10, "AIT OUAHMAN OUISSAL - Promotion 2025/2026", align="C")
    
    pdf.output(OUTPUT_PDF)
'''
    content = content[:idx] + new_code + content[idx + len(pdf_output):]
    
    with open('generate_report.py', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Re-added creative back cover successfully!")
else:
    print("Could not find pdf_output marker.")
