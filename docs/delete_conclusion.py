import re

with open('generate_report.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Delete the text from Conclusion
text_to_delete = '''
    pdf.ln(10)
    pdf.p("Un grand merci également à l'établissement Racine pour la qualité de sa formation. Ce projet représente l'aboutissement d'un apprentissage rigoureux et passionnant.")
    pdf.ln(10)
    pdf.set_font("Helvetica", "B", 11)
    pdf.set_text_color(*MID_GREY)
    pdf.cell(0, 10, "AIT OUAHMAN OUISSAL - Promotion 2025/2026", align="R")
    pdf.ln(15)'''
    
if text_to_delete in content:
    content = content.replace(text_to_delete, '')
    print('Deleted text from conclusion.')
else:
    print('Text not found in conclusion.')
    
with open('generate_report.py', 'w', encoding='utf-8') as f:
    f.write(content)
