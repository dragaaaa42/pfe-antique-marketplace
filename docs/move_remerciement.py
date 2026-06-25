import re

with open('generate_report.py', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Append the text at the end of Conclusion
conclusion_end = 'secteur des antiquites et des objets de collection.")'
insertion_idx = content.find(conclusion_end)
if insertion_idx != -1:
    insertion_idx += len(conclusion_end)
    appended_text = '''
    
    pdf.ln(10)
    pdf.p("Un grand merci également à l'établissement Racine pour la qualité de sa formation. Ce projet représente l'aboutissement d'un apprentissage rigoureux et passionnant.")
    pdf.ln(10)
    pdf.set_font("Helvetica", "B", 11)
    pdf.set_text_color(*MID_GREY)
    pdf.cell(0, 10, "AIT OUAHMAN OUISSAL - Promotion 2025/2026", align="R")
    pdf.ln(15)
'''
    content = content[:insertion_idx] + appended_text + content[insertion_idx:]
else:
    print("Conclusion end not found!")

# 2. Remove the Back Cover block
back_cover_start = '# --- Back Cover / Remerciements Finaux ---'
pdf_output = 'pdf.output(OUTPUT_PDF)'

idx_start = content.find(back_cover_start)
idx_end = content.find(pdf_output)

if idx_start != -1 and idx_end != -1:
    content = content[:idx_start] + content[idx_end:]
else:
    print("Back cover block not found!")

with open('generate_report.py', 'w', encoding='utf-8') as f:
    f.write(content)

print("Modifications applied successfully!")
