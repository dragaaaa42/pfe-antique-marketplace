import re

with open('generate_report.py', 'r', encoding='utf-8') as f:
    content = f.read()

content = re.sub(
    r'pdf\.screenshot_placeholder\(\s*"Figure 4\.11",', 
    r'pdf.insert_diagram(r"c:\\Users\\boura\\ouissal\\pfe-antique-marketplace-1\\docs\\screenshots\\messages.png", "Figure 4.11",', 
    content
)

with open('generate_report.py', 'w', encoding='utf-8') as f:
    f.write(content)

print('Updated messages screenshot!')
