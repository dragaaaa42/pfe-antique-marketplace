import re

with open('generate_report.py', 'r', encoding='utf-8') as f:
    content = f.read()

start_marker = '# --- Final Remerciements ---'
end_marker = 'pdf.output(OUTPUT_PDF)'

idx_start = content.find(start_marker)
idx_end = content.find(end_marker)

if idx_start != -1 and idx_end != -1:
    new_code = '''
    # --- Back Cover / Remerciements Finaux ---
    pdf.add_page()
    pdf.is_chapter_sep = True # Disable footer
    
    # Background or subtle border can be added, but let's keep it clean
    pdf.set_y(60)
    
    # Logo
    pdf.image(LOGO, x=(210 - 40) / 2, w=40)
    pdf.ln(50)
    
    # Title
    pdf.set_font("Helvetica", "B", 28)
    pdf.set_text_color(*SOFT_GOLD)
    pdf.cell(0, 15, "Artisan's Echo", align="C", border=0)
    pdf.ln(10)
    
    pdf.set_font("Helvetica", "I", 14)
    pdf.set_text_color(*ROYAL_BLUE)
    pdf.cell(0, 10, "Marketplace Premium d'Antiquités", align="C")
    pdf.ln(25)
    
    # Subtle line
    pdf.set_draw_color(*SOFT_GOLD)
    pdf.set_line_width(0.5)
    pdf.line(70, pdf.get_y(), 140, pdf.get_y())
    pdf.ln(20)
    
    # Text
    pdf.set_font("Helvetica", "", 12)
    pdf.set_text_color(*DARK_GREY)
    final_text = (
        "La réalisation de ce projet de fin d'études n'aurait pas été possible sans l'accompagnement "
        "précieux et les conseils avisés de mon encadrant, M. Ait Ben Hamou Khalid.\\n\\n"
        "Je tiens à lui exprimer ma plus profonde gratitude pour sa disponibilité, "
        "son soutien continu et son expertise qui m'ont guidé tout au long de ce parcours.\\n\\n"
        "Un grand merci également à l'établissement Racine pour la qualité de sa formation. "
        "Ce projet représente l'aboutissement d'un apprentissage rigoureux et passionnant."
    )
    
    # Calculate text width and center it properly using multi_cell margins
    pdf.set_x(30)
    pdf.multi_cell(150, 8, final_text, align="C")
    
    pdf.ln(30)
    
    pdf.set_font("Helvetica", "B", 10)
    pdf.set_text_color(*MID_GREY)
    pdf.cell(0, 10, "AIT OUAHMAN OUISSAL - Promotion 2025/2026", align="C")
    
    # Keep is_chapter_sep = True so the footer NEVER prints on this final page
    pdf.output(OUTPUT_PDF)
'''
    content = content[:idx_start] + new_code + content[idx_end + len(end_marker):]
    
    with open('generate_report.py', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Replaced final page successfully!")
else:
    print("Could not find markers.")
