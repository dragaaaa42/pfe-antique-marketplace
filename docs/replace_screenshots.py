import re

with open('generate_report.py', 'r', encoding='utf-8') as f:
    content = f.read()

replacements = [
    (r'pdf\.screenshot_placeholder\(\s*"Figure 4\.1",', r'pdf.insert_diagram(r"c:\\Users\\boura\\ouissal\\pfe-antique-marketplace-1\\docs\\screenshots\\home.png", "Figure 4.1",'),
    (r'pdf\.screenshot_placeholder\(\s*"Figure 4\.2",', r'pdf.insert_diagram(r"c:\\Users\\boura\\ouissal\\pfe-antique-marketplace-1\\docs\\screenshots\\catalogue.png", "Figure 4.2",'),
    (r'pdf\.screenshot_placeholder\(\s*"Figure 4\.3",', r'pdf.insert_diagram(r"c:\\Users\\boura\\ouissal\\pfe-antique-marketplace-1\\docs\\screenshots\\detail.png", "Figure 4.3",'),
    (r'pdf\.screenshot_placeholder\(\s*"Figure 4\.4",', r'pdf.insert_diagram(r"c:\\Users\\boura\\ouissal\\pfe-antique-marketplace-1\\docs\\screenshots\\login.png", "Figure 4.4",'),
    (r'pdf\.screenshot_placeholder\(\s*"Figure 4\.5",', r'pdf.insert_diagram(r"c:\\Users\\boura\\ouissal\\pfe-antique-marketplace-1\\docs\\screenshots\\dashboard.png", "Figure 4.5",'),
    
    (r'pdf\.screenshot_placeholder\(\s*"Figure 4\.6",', r'pdf.insert_diagram(r"c:\\Users\\boura\\ouissal\\pfe-antique-marketplace-1\\docs\\screenshots\\buyer_wishlist.png", "Figure 4.6",'),
    (r'pdf\.screenshot_placeholder\(\s*"Figure 4\.7",', r'pdf.insert_diagram(r"c:\\Users\\boura\\ouissal\\pfe-antique-marketplace-1\\docs\\screenshots\\buyer_orders.png", "Figure 4.7",'),
    (r'pdf\.screenshot_placeholder\(\s*"Figure 4\.8",', r'pdf.insert_diagram(r"c:\\Users\\boura\\ouissal\\pfe-antique-marketplace-1\\docs\\screenshots\\seller_dashboard.png", "Figure 4.8",'),
    (r'pdf\.screenshot_placeholder\(\s*"Figure 4\.9",', r'pdf.insert_diagram(r"c:\\Users\\boura\\ouissal\\pfe-antique-marketplace-1\\docs\\screenshots\\seller_orders.png", "Figure 4.9",'),
    (r'pdf\.screenshot_placeholder\(\s*"Figure 4\.10",', r'pdf.insert_diagram(r"c:\\Users\\boura\\ouissal\\pfe-antique-marketplace-1\\docs\\screenshots\\seller_products.png", "Figure 4.10",')
]

for pattern, repl in replacements:
    content = re.sub(pattern, repl, content)

with open('generate_report.py', 'w', encoding='utf-8') as f:
    f.write(content)

print('Updated 10 screenshots!')
