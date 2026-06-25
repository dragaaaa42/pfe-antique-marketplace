import os

FILE = r'c:\Users\boura\ouissal\pfe-antique-marketplace-1\docs\generate_report.py'

with open(FILE, 'r', encoding='utf-8') as f:
    content = f.read()

method = '''
    def insert_diagram(self, img_path, fig_label, caption, description_before="", description_after=""):
        if description_before:
            self.p(description_before)
            
        self.ln(5)
        # Diagrams can be quite tall, let's make sure we have space
        if self.get_y() > 160:
            self.add_page()
            
        img_w = 160
        x_pos = (210 - img_w) / 2
        
        self._fig_entries.append((fig_label, caption, self.page_no()))
        
        start_y = self.get_y()
        try:
            self.image(img_path, x=x_pos, w=img_w)
            # Just move Y by an estimate since fpdf doesn't always auto advance perfectly for all versions
            # Or actually in fpdf2, self.image with no height auto-advances if keep_aspect_ratio is used, 
            # wait, fpdf2 image() docs say it moves Y if y is not specified? 
            # If we specify x=x_pos, y isn't specified, so it puts it at current y.
        except Exception as e:
            self.set_fill_color(240, 240, 240)
            self.rect(x_pos, start_y, img_w, 40, "F")
            self.set_y(start_y + 45)
            print('Error loading image', e)
            
        self.ln(3)
        self.set_font("Helvetica", "I", 9.5)
        self.set_text_color(*ROYAL_BLUE)
        self.cell(0, 5, f"{fig_label} : {caption}", align="C", new_x="LMARGIN", new_y="NEXT")
        self.ln(5)
        
        if description_after:
            self.p(description_after)
'''

idx = content.find('def clean_table')
if idx != -1:
    new_content = content[:idx] + method + '\n' + content[idx:]
    with open(FILE, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print('Method injected.')
else:
    print('Failed to inject.')
