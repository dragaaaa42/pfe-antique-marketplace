import re

with open('generate_report.py', 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
skip = False
for i, line in enumerate(lines):
    if 'pdf.h3("Flux de moderation complet"' in line:
        skip = True
    
    if skip:
        if 'description_after="Un artefact en statut \'pending\'' in line:
            skip = False # skip this line, and stop skipping
        elif 'description_after="Un artefact' in line:
            pass # wait for the end
        elif 'l\'administrateur, avec les options d\'approbation et de rejet.")' in line:
            skip = False # stop skipping after this line
        continue

    # Insert final remerciements right before OUTPUT
    if 'pdf.output(OUTPUT_PDF)' in line:
        final_remerciement = """
    # --- Final Remerciements ---
    pdf.add_page()
    pdf.is_chapter_sep = True
    pdf.set_y(80)
    pdf.set_font("Helvetica", "B", 26)
    pdf.set_text_color(*ROYAL_BLUE)
    pdf.cell(0, 20, "Remerciements Finaux", align="C", border=0)
    pdf.ln(30)
    pdf.set_font("Helvetica", "", 14)
    pdf.set_text_color(*DARK_GREY)
    final_text = (
        "La realisation de ce projet n'aurait pas ete possible sans l'accompagnement precieux "
        "et les conseils avises de M. Ait Ben Hamou Khalid.\\n\\n"
        "Je tiens a exprimer ma plus profonde gratitude a mon encadrant pour sa disponibilite, "
        "son soutien continu et son expertise qui m'ont guide tout au long de ce parcours.\\n\\n"
        "Un grand merci egalement a l'etablissement Racine pour la qualite de sa formation. "
        "Ce projet represente l'aboutissement d'un apprentissage rigoureux et passionnant."
    )
    pdf.multi_cell(0, 10, final_text, align="C")
    
    pdf.ln(40)
    pdf.set_font("Helvetica", "B", 30)
    pdf.set_text_color(*GOLD)
    pdf.cell(0, 20, "FIN", align="C", border=0)
    pdf.is_chapter_sep = False

"""
        new_lines.append(final_remerciement)
    
    new_lines.append(line)

with open('generate_report.py', 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print("Modifications applied!")
