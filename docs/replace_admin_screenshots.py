import re

with open('generate_report.py', 'r', encoding='utf-8') as f:
    content = f.read()

replacements = [
    (r'pdf\.screenshot_placeholder\(\s*"Figure 4\.12",', r'pdf.insert_diagram(r"c:\\Users\\boura\\ouissal\\pfe-antique-marketplace-1\\docs\\screenshots\\admin_dashboard.png", "Figure 4.12",'),
    (r'pdf\.screenshot_placeholder\(\s*"Figure 4\.13",', r'pdf.insert_diagram(r"c:\\Users\\boura\\ouissal\\pfe-antique-marketplace-1\\docs\\screenshots\\admin_users.png", "Figure 4.13",'),
    (r'pdf\.screenshot_placeholder\(\s*"Figure 4\.14",', r'pdf.insert_diagram(r"c:\\Users\\boura\\ouissal\\pfe-antique-marketplace-1\\docs\\screenshots\\admin_artifacts.png", "Figure 4.14",'),
    (r'pdf\.screenshot_placeholder\(\s*"Figure 4\.15",', r'pdf.insert_diagram(r"c:\\Users\\boura\\ouissal\\pfe-antique-marketplace-1\\docs\\screenshots\\admin_audit.png", "Figure 4.15",'),
    (r'pdf\.screenshot_placeholder\(\s*"Figure 4\.16",', r'pdf.insert_diagram(r"c:\\Users\\boura\\ouissal\\pfe-antique-marketplace-1\\docs\\screenshots\\account_settings.png", "Figure 4.16",')
]

for pattern, repl in replacements:
    content = re.sub(pattern, repl, content)

with open('generate_report.py', 'w', encoding='utf-8') as f:
    f.write(content)

print('Updated 5 admin screenshots!')
