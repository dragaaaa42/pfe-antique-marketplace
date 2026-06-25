import re

with open('generate_report.py', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if 'pdf.start_numbering = True' in line:
        lines[i] = '    pdf.start_numbering = True\n'
    elif 'pdf.page_offset = pdf.page_no() - 1' in line:
        lines[i] = '    pdf.page_offset = pdf.page_no() - 1\n'
    elif 'pdf.big_title(' in line and 'Introduction g' in line:
        lines[i] = '    pdf.big_title("Introduction générale")\n'

with open('generate_report.py', 'w', encoding='utf-8') as f:
    f.writelines(lines)
