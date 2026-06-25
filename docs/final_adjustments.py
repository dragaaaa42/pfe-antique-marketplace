import re

with open('generate_report.py', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Enable page numbering at Introduction générale
intro_pattern = r'pdf\.big_title\("Introduction g.n.rale"\)'
intro_replacement = '''pdf.start_numbering = True
      pdf.page_offset = pdf.page_no() - 1
      pdf.big_title("Introduction générale")'''
content = re.sub(intro_pattern, intro_replacement, content)

# 2. Add Mobile Screenshots
content = re.sub(
    r'pdf\.screenshot_placeholder\(\s*"Figure A\.1",', 
    r'pdf.insert_diagram(r"c:\\Users\\boura\\ouissal\\pfe-antique-marketplace-1\\docs\\screenshots\\mobile_home.png", "Figure A.1",', 
    content
)
content = re.sub(
    r'pdf\.screenshot_placeholder\(\s*"Figure A\.2",', 
    r'pdf.insert_diagram(r"c:\\Users\\boura\\ouissal\\pfe-antique-marketplace-1\\docs\\screenshots\\mobile_dashboard.png", "Figure A.2",', 
    content
)

# 3. Remove Flux de moderation (Figure A.3)
# We find where it starts and ends
start_str = 'Le processus de moderation est illustr'
end_str = 'sur l\'ensemble du catalogue.")'

idx1 = content.find(start_str)
if idx1 != -1:
    idx_p = content.rfind('pdf.p(', 0, idx1)
    idx2 = content.find(end_str, idx1)
    if idx_p != -1 and idx2 != -1:
        # remove everything from idx_p to idx2 + len(end_str)
        content = content[:idx_p] + content[idx2 + len(end_str):]


# 4. Add "Résumé de fin" at the end of build_report
# Let's find the end of build_report. The last thing it does is Annexes.
annexes_end_str = 'de mani.re irr.prochable sur tous les formats d.crans."\)'
idx3 = re.search(annexes_end_str, content)

if idx3:
    insert_idx = idx3.end()
    resume_code = '''
      
      # --- Résumé de fin (4ème de couverture) ---
      pdf.add_page()
      pdf.is_chapter_sep = True # Hide page number
      pdf.set_xy(20, 100)
      pdf.set_font("Helvetica", "B", 24)
      pdf.set_text_color(*ROYAL_BLUE)
      pdf.cell(0, 20, "Résumé", align="C", border=0)
      pdf.ln(30)
      pdf.set_font("Helvetica", "", 14)
      pdf.set_text_color(*DARK_GREY)
      resume_text = (
          "Le present rapport decrit la conception et le developpement de la plateforme Artisan's Echo, "
          "une marketplace premium dediee a l'achat et la vente d'antiquites. Grace a une architecture moderne "
          "et une interface raffinee, ce systeme met en relation les collectionneurs, les vendeurs et les "
          "administrateurs dans un environnement securise et ergonomique.\\n\\n"
          "Il intègre des outils avances de gestion des catalogues, un espace communautaire de messagerie, "
          "ainsi qu'un systeme de moderation rigoureux. Ce projet illustre l'application des meilleures pratiques "
          "en matiere d'ingenierie logicielle pour un marche de niche exigeant."
      )
      pdf.multi_cell(0, 10, resume_text, align="C")
      pdf.is_chapter_sep = False
'''
    content = content[:insert_idx] + resume_code + content[insert_idx:]

with open('generate_report.py', 'w', encoding='utf-8') as f:
    f.write(content)

print('Modifications appliquées!')
