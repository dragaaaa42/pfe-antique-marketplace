import os

FILE = r'c:\Users\boura\ouissal\pfe-antique-marketplace-1\docs\generate_report.py'

with open(FILE, 'r', encoding='utf-8') as f:
    content = f.read()

start_idx = content.find('def insert_diagram')
if start_idx != -1:
    end_idx = content.find('def clean_table', start_idx)
    
    new_method = '''def insert_diagram(self, img_path, fig_label, caption, description_before="", description_after=""):
        if description_before:
            self.p(description_before)
            
        self.ln(5)
        
        # Calculate image dimensions
        try:
            img = Image.open(img_path)
            img_w_px, img_h_px = img.size
            aspect = img_h_px / img_w_px
        except:
            aspect = 0.5
            
        LM = 22
        box_w = 166
        
        max_img_w = box_w - 10
        max_img_h = 100  # Strict max height so it fits nicely like a screenshot placeholder
        
        img_w = max_img_w
        img_h = img_w * aspect
        
        if img_h > max_img_h:
            img_h = max_img_h
            img_w = img_h / aspect
            
        box_h = img_h + 10
        
        # Ensure minimum box height so it feels like a nice cadre
        if box_h < 60:
            box_h = 60
        
        # Check if enough space
        if self.get_y() + box_h + 20 > 270:
            self.add_page()
            
        y_start = self.get_y()
        self._fig_entries.append((fig_label, caption, self.page_no()))
        
        # Draw the cadre
        self.set_draw_color(200, 200, 200)
        self.set_line_width(0.3)
        self.rect(LM, y_start, box_w, box_h)
        
        self.set_fill_color(248, 250, 252)
        self.rect(LM + 1, y_start + 1, box_w - 2, box_h - 2, "F")
        
        self.set_draw_color(212, 175, 55)
        self.set_line_width(1.0)
        c_len = 8
        self.line(LM + 2, y_start + 2, LM + 2 + c_len, y_start + 2)
        self.line(LM + 2, y_start + 2, LM + 2, y_start + 2 + c_len)
        self.line(LM + box_w - 2, y_start + 2, LM + box_w - 2 - c_len, y_start + 2)
        self.line(LM + box_w - 2, y_start + 2, LM + box_w - 2, y_start + 2 + c_len)
        self.line(LM + 2, y_start + box_h - 2, LM + 2 + c_len, y_start + box_h - 2)
        self.line(LM + 2, y_start + box_h - 2, LM + 2, y_start + box_h - 2 - c_len)
        self.line(LM + box_w - 2, y_start + box_h - 2, LM + box_w - 2 - c_len, y_start + box_h - 2)
        self.line(LM + box_w - 2, y_start + box_h - 2, LM + box_w - 2, y_start + box_h - 2 - c_len)
        
        # Calculate x_pos to center the image horizontally within the box
        x_pos = LM + (box_w - img_w) / 2
        y_pos = y_start + (box_h - img_h) / 2
        
        try:
            self.image(img_path, x=x_pos, y=y_pos, w=img_w)
        except Exception as e:
            print('Error loading diagram image:', e)
            
        self.set_y(y_start + box_h + 3)
        
        self.set_font("Helvetica", "I", 9.5)
        self.set_text_color(*ROYAL_BLUE)
        self.cell(0, 5, f"{fig_label} : {caption}", align="C", new_x="LMARGIN", new_y="NEXT")
        self.ln(4)
        
        if description_after:
            self.p(description_after)

    '''
    
    content = content[:start_idx] + new_method + content[end_idx:]
    with open(FILE, 'w', encoding='utf-8') as f:
        f.write(content)
    print('insert_diagram rewritten.')
else:
    print('Could not find insert_diagram.')
