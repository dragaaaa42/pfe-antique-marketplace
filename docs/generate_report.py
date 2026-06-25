#!/usr/bin/env python3
"""
Generate the PFE Report PDF for Artisan's Echo project.
Premium academic design with navy/blue/gold palette.
Target: 45-50 pages, submission-ready.
"""
import os
from fpdf import FPDF
from PIL import Image

# ── Paths ──────────────────────────────────────────────────────
BASE = os.path.dirname(os.path.abspath(__file__))
PROJECT = os.path.dirname(BASE)
LOGO = os.path.join(PROJECT, "frontend", "public", "logo_transparent.png")
OUTPUT_PDF = os.path.join(BASE, "Rapport_PFE_Artisans_Echo_AIT_OUAHMAN_OUISSAL.pdf")

# ── Colour Palette ─────────────────────────────────────────────
DARK_NAVY   = (10, 25, 47)
ROYAL_BLUE  = (30, 58, 138)
SOFT_GOLD   = (212, 175, 55)
WHITE       = (255, 255, 255)
LIGHT_GREY  = (243, 244, 246)
MID_GREY    = (107, 114, 128)
DARK_GREY   = (55, 65, 81)
BODY_TEXT   = (31, 41, 55)
HEADER_BG   = (30, 58, 138)   # royal blue for table headers
ROW_ALT     = (239, 246, 255) # very light blue alternating rows
BORDER_CLR  = (191, 204, 224) # soft border
ACCENT_LINE = (212, 175, 55)  # gold accent lines
CHAPTER_BG  = (10, 25, 47)    # dark navy for chapter separators
PLACEHOLDER_BG = (248, 250, 252)
PLACEHOLDER_BORDER = (148, 163, 184)

LM, RM, TM, BM = 22, 22, 22, 25  # margins


class Report(FPDF):
    def __init__(self):
        super().__init__("P", "mm", "A4")
        self.set_auto_page_break(True, BM)
        self.ch_num = 0
        self.fig_counters = {}   # chapter -> count
        self.tbl_counters = {}
        self.is_cover = True
        self.is_chapter_sep = False
        self.current_chapter = 0
        self._toc_entries = []   # (level, title, page)
        self._fig_entries = []   # (label, caption, page)
        self._tbl_entries = []   # (label, caption, page)
        self._toc_page = 0
        self._lof_page = 0
        self._lot_page = 0
        self.start_numbering = False
        self.page_offset = 0

    # ── Header ─────────────────────────────────────────────────
    def header(self):
        if self.is_cover or self.is_chapter_sep or self.page_no() <= 1:
            return
        self.set_font("Helvetica", "I", 8.5)
        self.set_text_color(*SOFT_GOLD)
        self.cell(90, 7, "Artisan's Echo", new_x="RIGHT")
        self.set_text_color(*MID_GREY)
        self.set_font("Helvetica", "I", 8)
        self.cell(78, 7, "Rapport PFE - AIT OUAHMAN OUISSAL", align="R",
                  new_x="LMARGIN", new_y="NEXT")
        self.set_draw_color(*BORDER_CLR)
        self.set_line_width(0.3)
        self.line(LM, self.get_y(), 210 - RM, self.get_y())
        self.ln(4)

    # ── Footer ─────────────────────────────────────────────────
    def footer(self):
        if not self.start_numbering or self.is_chapter_sep:
            return
        
        actual_page = self.page_no() - self.page_offset
        self.set_y(-20)
        self.set_draw_color(*BORDER_CLR)
        self.set_line_width(0.3)
        self.line(LM, self.get_y(), 210 - RM, self.get_y())
        self.ln(3)
        self.set_font("Helvetica", "", 8)
        self.set_text_color(*MID_GREY)
        self.cell(80, 6, "Racine - 2025/2026")
        self.set_text_color(*ROYAL_BLUE)
        self.set_font("Helvetica", "B", 8)
        self.cell(88, 6, f"- {actual_page} -", align="R",
                  new_x="LMARGIN", new_y="NEXT")

    # ── Chapter separator page ─────────────────────────────────
    def chapter_separator(self, num, title):
        self.is_chapter_sep = True
        self.add_page()
        # Dark navy full page
        self.set_fill_color(*CHAPTER_BG)
        self.rect(0, 0, 210, 297, "F")
        # Gold accent line
        self.set_draw_color(*SOFT_GOLD)
        self.set_line_width(1.2)
        self.line(60, 115, 150, 115)
        # Chapter number
        self.set_y(125)
        self.set_font("Helvetica", "B", 42)
        self.set_text_color(*SOFT_GOLD)
        self.cell(0, 20, f"Chapitre {num}", align="C",
                  new_x="LMARGIN", new_y="NEXT")
        # Title
        self.set_font("Helvetica", "", 18)
        self.set_text_color(*WHITE)
        self.cell(0, 14, title, align="C",
                  new_x="LMARGIN", new_y="NEXT")
        # Bottom accent
        self.set_draw_color(*SOFT_GOLD)
        self.line(60, 175, 150, 175)
        self.is_chapter_sep = False

    # ── Titles ─────────────────────────────────────────────────
    def big_title(self, title, add_toc=True):
        if add_toc:
            self._toc_entries.append((0, title, self.page_no()))
        self.ln(4)
        self.set_font("Helvetica", "B", 18)
        self.set_text_color(*ROYAL_BLUE)
        self.cell(0, 12, title, new_x="LMARGIN", new_y="NEXT")
        self.set_draw_color(*SOFT_GOLD)
        self.set_line_width(0.8)
        self.line(LM, self.get_y() + 1, LM + 50, self.get_y() + 1)
        self.set_line_width(0.2)
        self.ln(8)

    def chapter_title(self, title):
        self.ch_num += 1
        self.current_chapter = self.ch_num
        label = f"Chapitre {self.ch_num} : {title}"
        self._toc_entries.append((0, label, self.page_no()))
        self.ln(4)
        self.set_font("Helvetica", "B", 18)
        self.set_text_color(*ROYAL_BLUE)
        self.cell(0, 12, label, new_x="LMARGIN", new_y="NEXT")
        self.set_draw_color(*SOFT_GOLD)
        self.set_line_width(0.8)
        self.line(LM, self.get_y() + 1, LM + 60, self.get_y() + 1)
        self.set_line_width(0.2)
        self.ln(8)

    def h2(self, txt, add_toc=True):
        if self.get_y() > 250:
            self.add_page()
        if add_toc:
            self._toc_entries.append((1, txt, self.page_no()))
        self.ln(3)
        self.set_font("Helvetica", "B", 13)
        self.set_text_color(*DARK_NAVY)
        self.cell(0, 9, txt, new_x="LMARGIN", new_y="NEXT")
        # Small blue line under h2
        self.set_draw_color(*ROYAL_BLUE)
        self.set_line_width(0.4)
        self.line(LM, self.get_y(), LM + 35, self.get_y())
        self.set_line_width(0.2)
        self.ln(4)

    def h3(self, txt, add_toc=True):
        if self.get_y() > 260:
            self.add_page()
        if add_toc:
            self._toc_entries.append((2, txt, self.page_no()))
        self.ln(2)
        self.set_font("Helvetica", "B", 11.5)
        self.set_text_color(30, 58, 138)
        self.cell(0, 7, txt, new_x="LMARGIN", new_y="NEXT")
        self.ln(2)

    # ── Body text ──────────────────────────────────────────────
    def p(self, txt):
        self.set_font("Helvetica", "", 10.5)
        self.set_text_color(*BODY_TEXT)
        self.multi_cell(0, 6.2, txt, new_x="LMARGIN", new_y="NEXT")
        self.ln(2)

    def p_bold(self, txt):
        self.set_font("Helvetica", "B", 10.5)
        self.set_text_color(*BODY_TEXT)
        self.multi_cell(0, 6.2, txt, new_x="LMARGIN", new_y="NEXT")
        self.ln(2)

    def p_italic(self, txt):
        self.set_font("Helvetica", "I", 10.5)
        self.set_text_color(*MID_GREY)
        self.multi_cell(0, 6.2, txt, new_x="LMARGIN", new_y="NEXT")
        self.ln(2)

    def bl(self, txt):
        self.set_font("Helvetica", "", 10.5)
        self.set_text_color(*BODY_TEXT)
        x = self.get_x()
        # Blue bullet dot
        self.set_fill_color(*ROYAL_BLUE)
        self.ellipse(x + 2, self.get_y() + 2, 2, 2, "F")
        self.set_x(x + 8)
        w = 210 - RM - (x + 8)
        self.multi_cell(w, 6, txt, new_x="LMARGIN", new_y="NEXT")
        self.ln(1)

    def numbered(self, num, txt):
        self.set_font("Helvetica", "B", 10.5)
        self.set_text_color(*ROYAL_BLUE)
        x = self.get_x()
        self.cell(8, 6, f"{num}.")
        self.set_font("Helvetica", "", 10.5)
        self.set_text_color(*BODY_TEXT)
        w = 210 - RM - (x + 8)
        self.multi_cell(w, 6, txt, new_x="LMARGIN", new_y="NEXT")
        self.ln(1)

    # ── Screenshot placeholder ─────────────────────────────────
    def screenshot_placeholder(self, fig_label, caption, description_before="", description_after=""):
        if description_before:
            self.p(description_before)

        # Check if we need a page break (placeholder needs ~75mm)
        if self.get_y() > 200:
            self.add_page()

        # Register figure
        self._fig_entries.append((fig_label, caption, self.page_no()))

        y_start = self.get_y()
        box_w = 210 - LM - RM
        box_h = 65  # height for screenshot space

        # Outer border (rounded-look with double line)
        self.set_draw_color(*PLACEHOLDER_BORDER)
        self.set_line_width(0.6)
        self.rect(LM, y_start, box_w, box_h)

        # Inner lighter border
        self.set_draw_color(200, 210, 225)
        self.set_line_width(0.3)
        self.rect(LM + 2, y_start + 2, box_w - 4, box_h - 4)

        # Light background fill
        self.set_fill_color(*PLACEHOLDER_BG)
        self.rect(LM + 3, y_start + 3, box_w - 6, box_h - 6, "F")

        # Small decorative corner accents (gold)
        self.set_draw_color(*SOFT_GOLD)
        self.set_line_width(1.0)
        corner_len = 8
        # Top-left
        self.line(LM + 5, y_start + 5, LM + 5 + corner_len, y_start + 5)
        self.line(LM + 5, y_start + 5, LM + 5, y_start + 5 + corner_len)
        # Top-right
        self.line(LM + box_w - 5, y_start + 5, LM + box_w - 5 - corner_len, y_start + 5)
        self.line(LM + box_w - 5, y_start + 5, LM + box_w - 5, y_start + 5 + corner_len)
        # Bottom-left
        self.line(LM + 5, y_start + box_h - 5, LM + 5 + corner_len, y_start + box_h - 5)
        self.line(LM + 5, y_start + box_h - 5, LM + 5, y_start + box_h - 5 - corner_len)
        # Bottom-right
        self.line(LM + box_w - 5, y_start + box_h - 5, LM + box_w - 5 - corner_len, y_start + box_h - 5)
        self.line(LM + box_w - 5, y_start + box_h - 5, LM + box_w - 5, y_start + box_h - 5 - corner_len)

        self.set_line_width(0.2)

        # Center icon (camera/image icon suggestion)
        center_y = y_start + box_h / 2 - 8
        self.set_fill_color(*PLACEHOLDER_BORDER)
        icon_x = 105 - 6
        self.rect(icon_x, center_y, 12, 10, "F")
        # Small triangle inside to suggest image
        self.set_fill_color(*WHITE)
        # Small circle (lens)
        self.ellipse(icon_x + 3, center_y + 2.5, 6, 5, "F")
        self.set_fill_color(*PLACEHOLDER_BORDER)
        self.ellipse(icon_x + 4.5, center_y + 3.5, 3, 3, "F")

        # Text: "Capture d'ecran a inserer"
        self.set_y(center_y + 14)
        self.set_font("Helvetica", "I", 11)
        self.set_text_color(*PLACEHOLDER_BORDER)
        self.cell(0, 6, "Capture d'ecran a inserer", align="C",
                  new_x="LMARGIN", new_y="NEXT")

        # Figure name inside
        self.set_font("Helvetica", "", 9)
        self.set_text_color(*MID_GREY)
        self.cell(0, 5, fig_label, align="C",
                  new_x="LMARGIN", new_y="NEXT")

        # Move below the box
        self.set_y(y_start + box_h + 3)

        # Caption below
        self.set_font("Helvetica", "I", 9.5)
        self.set_text_color(*ROYAL_BLUE)
        self.cell(0, 5, f"{fig_label} : {caption}", align="C",
                  new_x="LMARGIN", new_y="NEXT")
        self.ln(3)

        if description_after:
            self.p(description_after)

    # ── Tables ─────────────────────────────────────────────────
    
    def insert_diagram(self, img_path, fig_label, caption, description_before="", description_after=""):
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

    def clean_table(self, caption, hdrs, rows, tbl_label=None):
        """Professional academic table with soft blue header."""
        if tbl_label:
            self._tbl_entries.append((tbl_label, caption, self.page_no()))
        else:
            ch = self.current_chapter if self.current_chapter else 1
            if ch not in self.tbl_counters:
                self.tbl_counters[ch] = 0
            self.tbl_counters[ch] += 1
            lbl = f"Tableau {ch}.{self.tbl_counters[ch]}"
            self._tbl_entries.append((lbl, caption, self.page_no()))

        num_cols = len(hdrs)
        usable = 210 - LM - RM
        cw = usable / num_cols

        # Table caption above
        self.set_font("Helvetica", "I", 9.5)
        self.set_text_color(*ROYAL_BLUE)
        final_label = tbl_label if tbl_label else lbl
        self.cell(0, 5, f"{final_label} : {caption}", align="C",
                  new_x="LMARGIN", new_y="NEXT")
        self.ln(2)

        # Check page break
        needed = 7 + len(rows) * 7 + 8
        if self.get_y() + needed > 270:
            self.add_page()

        # Header row - soft royal blue background
        self.set_fill_color(*HEADER_BG)
        self.set_text_color(*WHITE)
        self.set_font("Helvetica", "B", 9)
        self.set_draw_color(*BORDER_CLR)
        for h in hdrs:
            self.cell(cw, 8, h, border=1, align="C", fill=True)
        self.ln()

        # Data rows with alternating background
        self.set_font("Helvetica", "", 9)
        for i, row in enumerate(rows):
            if i % 2 == 0:
                self.set_fill_color(*WHITE)
            else:
                self.set_fill_color(*ROW_ALT)
            self.set_text_color(*BODY_TEXT)
            for j, c in enumerate(row):
                txt = str(c)
                # Truncate if too long
                max_chars = int(cw / 1.8)
                if len(txt) > max_chars:
                    txt = txt[:max_chars - 2] + ".."
                self.cell(cw, 7, txt, border=1, fill=True)
            self.ln()
        self.ln(5)

    def wide_table(self, caption, hdrs, rows, col_widths=None, tbl_label=None):
        """Table with custom column widths for better readability."""
        ch = self.current_chapter if self.current_chapter else 1
        if tbl_label:
            self._tbl_entries.append((tbl_label, caption, self.page_no()))
            final_label = tbl_label
        else:
            if ch not in self.tbl_counters:
                self.tbl_counters[ch] = 0
            self.tbl_counters[ch] += 1
            final_label = f"Tableau {ch}.{self.tbl_counters[ch]}"
            self._tbl_entries.append((final_label, caption, self.page_no()))

        usable = 210 - LM - RM
        if col_widths is None:
            col_widths = [usable / len(hdrs)] * len(hdrs)

        # Caption
        self.set_font("Helvetica", "I", 9.5)
        self.set_text_color(*ROYAL_BLUE)
        self.cell(0, 5, f"{final_label} : {caption}", align="C",
                  new_x="LMARGIN", new_y="NEXT")
        self.ln(2)

        # Header
        self.set_fill_color(*HEADER_BG)
        self.set_text_color(*WHITE)
        self.set_font("Helvetica", "B", 9)
        self.set_draw_color(*BORDER_CLR)
        for j, h in enumerate(hdrs):
            self.cell(col_widths[j], 8, h, border=1, align="C", fill=True)
        self.ln()

        # Rows
        self.set_font("Helvetica", "", 8.5)
        for i, row in enumerate(rows):
            if i % 2 == 0:
                self.set_fill_color(*WHITE)
            else:
                self.set_fill_color(*ROW_ALT)
            self.set_text_color(*BODY_TEXT)
            max_h = 7
            for j, c in enumerate(row):
                self.cell(col_widths[j], max_h, str(c)[:65], border=1, fill=True)
            self.ln()
        self.ln(5)

    # ── Spacer ─────────────────────────────────────────────────
    def space(self, mm=5):
        self.ln(mm)

    # ── Gold divider ───────────────────────────────────────────
    def gold_divider(self):
        self.ln(3)
        self.set_draw_color(*SOFT_GOLD)
        self.set_line_width(0.5)
        mid = 105
        self.line(mid - 20, self.get_y(), mid + 20, self.get_y())
        self.set_line_width(0.2)
        self.ln(5)


def build_report():
    pdf = Report()
    pdf.set_margins(LM, TM, RM)

    # ═══════════════════════════════════════════════════════════
    #  COVER PAGE
    # ═══════════════════════════════════════════════════════════
    pdf.add_page()
    pdf.is_cover = True

    # Dark navy full background
    pdf.set_fill_color(*DARK_NAVY)
    pdf.rect(0, 0, 210, 297, "F")

    # Top decorative gold line
    pdf.set_draw_color(*SOFT_GOLD)
    pdf.set_line_width(0.8)
    pdf.line(40, 15, 170, 15)

    # Logo
    box_w = 40
    box_x = (210 - box_w) / 2
    box_y = 30
    if os.path.exists(LOGO):
        # Professional transparent logo placement
        pdf.image(LOGO, x=box_x, y=box_y, w=box_w)

    # Establishment (Under logo, nicely spaced)
    pdf.set_y(box_y + box_w + 14)
    pdf.set_font("Times", "B", 18)
    pdf.set_text_color(*SOFT_GOLD)
    pdf.cell(0, 8, "ETABLISSEMENT RACINE", align="C",
             new_x="LMARGIN", new_y="NEXT")

    # Subtitle
    pdf.ln(2)
    pdf.set_font("Times", "", 12)
    pdf.set_text_color(*WHITE)
    pdf.cell(0, 6, "Filière : Développement Informatique", align="C",
             new_x="LMARGIN", new_y="NEXT")

    # Main title block (Cleaner, larger, academic font)
    pdf.ln(24)
    pdf.set_font("Times", "", 16)
    pdf.set_text_color(180, 195, 220)
    pdf.cell(0, 8, "Rapport de Projet de Fin d'Études", align="C",
             new_x="LMARGIN", new_y="NEXT")
    pdf.ln(4)
    pdf.set_font("Times", "B", 38)
    pdf.set_text_color(*WHITE)
    pdf.cell(0, 16, "Artisan's Echo", align="C",
             new_x="LMARGIN", new_y="NEXT")
    pdf.ln(3)
    pdf.set_font("Times", "I", 16)
    pdf.set_text_color(*SOFT_GOLD)
    pdf.cell(0, 8, "Marketplace premium d'antiquités et d'objets de collection", align="C",
             new_x="LMARGIN", new_y="NEXT")

    # Gold separator
    pdf.ln(14)
    pdf.set_draw_color(*SOFT_GOLD)
    pdf.set_line_width(0.5)
    pdf.line(65, pdf.get_y(), 145, pdf.get_y())
    pdf.ln(14)

    # Information table on cover
    info_data = [
        ("Établissement", "Racine"),
        ("Filière", "Développement Informatique"),
        ("Réalisé par", "AIT OUAHMAN OUISSAL"),
        ("Encadré par", "Ait Ben Hamou Khalid"),
        ("Année universitaire", "2025/2026"),
    ]
    table_w = 130
    col1_w = 55
    col2_w = 75
    x_start = (210 - table_w) / 2

    for label, value in info_data:
        pdf.set_x(x_start)
        pdf.set_font("Times", "B", 12)
        pdf.set_text_color(180, 195, 220)
        pdf.cell(col1_w, 8, label, align="R")
        pdf.set_font("Times", "", 12)
        pdf.set_text_color(*WHITE)
        pdf.cell(col2_w, 8, f"   {value}", new_x="LMARGIN", new_y="NEXT")

    # Technology badges (clean academic look)
    pdf.ln(20)
    badges = ["Django", "React", "Marketplace", "RBAC", "Admin Dashboard"]
    badge_w = 26
    total_w = len(badges) * badge_w + (len(badges) - 1) * 3
    x_badge = (210 - total_w) / 2

    for i, badge in enumerate(badges):
        bx = x_badge + i * (badge_w + 3)
        pdf.set_fill_color(20, 40, 90)
        pdf.set_draw_color(*SOFT_GOLD)
        pdf.set_line_width(0.3)
        pdf.rect(bx, pdf.get_y(), badge_w, 6, "DF")
        pdf.set_xy(bx, pdf.get_y())
        pdf.set_font("Times", "B", 8)
        pdf.set_text_color(*SOFT_GOLD)
        pdf.cell(badge_w, 6, badge, align="C")

    # Bottom decorative lines
    pdf.set_draw_color(*SOFT_GOLD)
    pdf.set_line_width(0.8)
    pdf.line(40, 282, 170, 282)

    pdf.is_cover = False

    # ═══════════════════════════════════════════════════════════
    #  REMERCIEMENTS
    # ═══════════════════════════════════════════════════════════
    pdf.add_page()
    pdf.big_title("Remerciements")
    pdf.p("Je tiens à exprimer ma profonde gratitude envers toutes les personnes qui ont contribué, de pres ou de loin, à la réalisation de ce projet de fin d'études.")
    pdf.p("Je remercie tout d'abord mon encadrant, M. Ait Ben Hamou Khalid, pour son accompagnement pédagogique, ses conseils avisés et sa disponibilité tout au long de ce travail. Ses orientations ont été déterminantes dans la reussite de ce projet, m'aidant à structurer ma demarche, à clarifier mes choix techniques et à maintenir une vision coherente du resultat attendu.")
    pdf.p("J'adresse également mes remerciements à l'ensemble de l'equipe pédagogique et administrative de l'etablissement Racine pour la qualite de la formation dispensée, ainsi que pour avoir mis à notre disposition l'environnement d'apprentissage et les ressources nécessaires a la conduite de nos projets academiques.")
    pdf.p("Enfin, je remercie ma famille et mes proches pour leur soutien inconditionnel, leur patience et leurs encouragements qui m'ont permis de mener à bien ce travail de conception et de réalisation.")

    # ═══════════════════════════════════════════════════════════
    #  RESUME / ABSTRACT
    # ═══════════════════════════════════════════════════════════
    pdf.add_page()
    pdf.big_title("Résumé")
    pdf.p("Le present rapport de projet de fin d'études porte sur la conception et la réalisation d'Artisan's Echo, une plateforme web de type marketplace premium dédiée à la vente, la découverte et l'acquisition d'objets antiques et rares. Le projet a été pensé pour offrir un environnement de confiance, raffine et securise, répondant aux exigences spécifiques des collectionneurs, des acheteurs passionnes et des vendeurs professionnels.")
    pdf.p("La solution repose sur une architecture moderne client-serveur. Le frontend est développé avec React (TypeScript, Vite) et offre une interface à forte identité visuelle inspirée des galeries d'art, adaptée à chaque rôle utilisateur. Le backend s'appuie sur Django et Django REST Framework, integrant une authentification par JWT, un contrôle d'accès basé sur les rôles (RBAC), et une gestion robuste des entites telles que les utilisateurs, les artefacts, les commandes et les messages.")
    pdf.p("Le système intègre plusieurs modules distincts : un catalogue public filtrable, des tableaux de bord spécifiques (Acheteur/Collectionneur, Vendeur, Administrateur), une fiche produit détaillée avec galerie, un processus de commande avec paiement a la livraison (Cash on Delivery), un système de liste de souhaits (wishlist) et de panier, une messagerie interne entre acheteurs et vendeurs, ainsi qu'un journal d'audit et une moderation des artefacts par l'administrateur.")
    pdf.p_bold("Mots-clés : Marketplace, objets antiques, Django REST Framework, React, JWT, tableau de bord, commerce electronique, moderation, rôles.")

    pdf.gold_divider()

    pdf.add_page()
    pdf.big_title("Abstract")
    pdf.p("This graduation project report presents the design and implementation of Artisan's Echo, a premium web marketplace platform dedicated to the sale, discovery, and acquisition of antique and rare objects. The project was designed to provide a secure, refined, and trustworthy environment that meets the specific requirements of collectors, passionate buyers, and professional sellers.")
    pdf.p("The solution is based on a modern client-server architecture. The frontend is built with React (TypeScript, Vite), offering an interface with a strong visual identity inspired by art galleries, adapted to each user role. The backend relies on Django and Django REST Framework, featuring secure JWT authentication, Role-Based Accèss Control (RBAC), and robust data management for users, artifacts, orders, and messages.")
    pdf.p("The system incorporates several distinct modules: a filterable public catalogue, role-specific dashboards (Buyer/Collector, Seller, Administrator), detailed product pages with galleries, a checkout process with Cash on Delivery, a wishlist and cart system, internal messaging between buyers and sellers, as well as an audit trail and artifact moderation by the administrator.")
    pdf.p_bold("Keywords: Marketplace, antique objects, Django REST Framework, React, JWT, dashboard, e-commerce, moderation, rôles.")

    # ═══════════════════════════════════════════════════════════
    #  TABLE DES MATIERES (Real detailed TOC)
    # ═══════════════════════════════════════════════════════════
    pdf.add_page()
    pdf._toc_page = pdf.page_no()
    pdf.big_title("Table des matières", add_toc=False)

    toc_items = [
        (0, "Remerciements", "2"),
        (0, "Résumé / Abstract", "3"),
        (0, "Table des matières", ""),
        (0, "Liste des figures", ""),
        (0, "Liste des tableaux", ""),
        (0, "Liste des abréviations", ""),
        (0, "Introduction générale", ""),
        (0, "Chapitre I : Presentation générale du projet", ""),
        (1, "1.1 Contexte du projet", ""),
        (1, "1.2 Problématique", ""),
        (1, "1.3 Objectifs du projet", ""),
        (1, "1.4 Valeur ajoutée", ""),
        (1, "1.5 Périmètre fonctionnel", ""),
        (0, "Chapitre II : Analyse des besoins", ""),
        (1, "2.1 Identification des acteurs", ""),
        (1, "2.2 Besoins fonctionnels", ""),
        (1, "2.3 Besoins non fonctionnels", ""),
        (1, "2.4 Parcours utilisateurs", ""),
        (1, "2.5 Diagramme des cas d'utilisation", ""),
        (0, "Chapitre III : Conception", ""),
        (1, "3.1 Architecture globale du système", ""),
        (1, "3.2 Gestion des rôles et des accès (RBAC)", ""),
        (1, "3.3 Modele de données", ""),
        (1, "3.4 Diagrammes de séquence", ""),
        (2, "3.4.1 Séquence d'authentification", ""),
        (2, "3.4.2 Séquence de publication d'un produit", ""),
        (2, "3.4.3 Séquence de commande (Checkout)", ""),
        (1, "3.5 Règles de gestion", ""),
        (0, "Chapitre IV : Réalisation de la solution", ""),
        (1, "4.1 Technologies utilisées", ""),
        (1, "4.2 Structure du projet", ""),
        (1, "4.3 Interfaces et fonctionnalités développées", ""),
        (2, "4.3.1 Page d'accueil publique", ""),
        (2, "4.3.2 Catalogue des objets", ""),
        (2, "4.3.3 Dossier detaille d'un objet", ""),
        (2, "4.3.4 Authentification et inscription", ""),
        (2, "4.3.5 Tableau de bord du collectionneur", ""),
        (2, "4.3.6 Tableau de bord du vendeur", ""),
        (2, "4.3.7 Tableau de bord administrateur", ""),
        (2, "4.3.8 Messagerie interne", ""),
        (2, "4.3.9 Profil utilisateur", ""),
        (1, "4.4 Responsive Design", ""),
        (0, "Chapitre V : Tests, validation et perspectives", ""),
        (1, "5.1 Strategie de test", ""),
        (1, "5.2 Scenarios de tests fonctionnels", ""),
        (1, "5.3 Resultats de validation", ""),
        (1, "5.4 Limites actuelles", ""),
        (1, "5.5 Perspectives d'amelioration", ""),
        (0, "Conclusion générale", ""),
        (0, "Bibliographie", ""),
        (0, "Annexes", ""),
        (1, "Annexe A : Structure du code source", ""),
        (1, "Annexe B : Guide d'installation rapide", ""),
        (1, "Annexe C : Captures d'ecran complementaires", ""),
    ]

    for level, title, pg in toc_items:
        indent = level * 8
        is_main = (level == 0)
        pdf.set_font("Helvetica", "B" if is_main else "", 10.5 if is_main else 9.5)
        pdf.set_text_color(*DARK_NAVY if is_main else BODY_TEXT)
        pdf.set_x(LM + indent)

        # Title text
        title_w = 140 - indent
        pdf.cell(title_w, 6, title)

        # Dotted leader + page number (if not empty)
        if pg:
            pdf.set_font("Helvetica", "", 9)
            pdf.set_text_color(*MID_GREY)
            pdf.cell(20, 6, f"{'.' * 8} {pg}", align="R",
                     new_x="LMARGIN", new_y="NEXT")
        else:
            pdf.cell(20, 6, "", new_x="LMARGIN", new_y="NEXT")
        pdf.ln(0.5)

    # ═══════════════════════════════════════════════════════════
    #  LISTE DES FIGURES (Complete)
    # ═══════════════════════════════════════════════════════════
    pdf.add_page()
    pdf.big_title("Liste des figures", add_toc=False)

    figures_list = [
        ("Figure 2.1", "Diagramme des cas d'utilisation"),
        ("Figure 3.1", "Architecture générale du système"),
        ("Figure 3.2", "Contrôle d'accès basé sur les rôles (RBAC)"),
        ("Figure 3.3", "Vue d'ensemble de la base de données / entites"),
        ("Figure 3.4", "Diagramme de séquence - Connexion (Login)"),
        ("Figure 3.5", "Diagramme de séquence - Publication produit"),
        ("Figure 3.6", "Diagramme de séquence - Checkout / Commande"),
        ("Figure 4.1", "Page d'accueil publique"),
        ("Figure 4.2", "Catalogue des objets"),
        ("Figure 4.3", "Dossier detaille d'un objet"),
        ("Figure 4.4", "Page de connexion / inscription"),
        ("Figure 4.5", "Tableau de bord du collectionneur (acheteur)"),
        ("Figure 4.6", "Liste de souhaits (Wishlist)"),
        ("Figure 4.7", "Panier et processus de commande"),
        ("Figure 4.8", "Tableau de bord du vendeur"),
        ("Figure 4.9", "Gestion des produits du vendeur"),
        ("Figure 4.10", "Formulaire d'ajout / modification produit"),
        ("Figure 4.11", "Messagerie interne"),
        ("Figure 4.12", "Tableau de bord administrateur"),
        ("Figure 4.13", "Gestion des utilisateurs (Admin)"),
        ("Figure 4.14", "Moderation des artefacts (Admin)"),
        ("Figure 4.15", "Journal d'audit (Audit Trail)"),
        ("Figure 4.16", "Parametres du profil utilisateur"),
    ]

    for fig_label, fig_caption in figures_list:
        pdf.set_font("Helvetica", "", 10)
        pdf.set_text_color(*BODY_TEXT)
        leader = "." * 6
        pdf.cell(130, 6, f"{fig_label} - {fig_caption}")
        pdf.set_font("Helvetica", "", 9)
        pdf.set_text_color(*MID_GREY)
        pdf.cell(36, 6, leader, align="R", new_x="LMARGIN", new_y="NEXT")
        pdf.ln(0.5)

    # ═══════════════════════════════════════════════════════════
    #  LISTE DES TABLEAUX
    # ═══════════════════════════════════════════════════════════
    pdf.add_page()
    pdf.big_title("Liste des tableaux", add_toc=False)

    tables_list = [
        ("Tableau 1.1", "Périmètre fonctionnel du projet"),
        ("Tableau 2.1", "Acteurs du système"),
        ("Tableau 2.2", "Besoins fonctionnels"),
        ("Tableau 2.3", "Besoins non fonctionnels"),
        ("Tableau 3.1", "Entités principales du modele de données"),
        ("Tableau 3.2", "Matrice des permissions par role"),
        ("Tableau 3.3", "Principaux endpoints de l'API REST"),
        ("Tableau 4.1", "Stack technologique du projet"),
        ("Tableau 5.1", "Scenarios de test fonctionnels"),
    ]

    for tbl_label, tbl_caption in tables_list:
        pdf.set_font("Helvetica", "", 10)
        pdf.set_text_color(*BODY_TEXT)
        leader = "." * 6
        pdf.cell(130, 6, f"{tbl_label} - {tbl_caption}")
        pdf.set_font("Helvetica", "", 9)
        pdf.set_text_color(*MID_GREY)
        pdf.cell(36, 6, leader, align="R", new_x="LMARGIN", new_y="NEXT")
        pdf.ln(0.5)

    # ═══════════════════════════════════════════════════════════
    #  LISTE DES ABREVIATIONS
    # ═══════════════════════════════════════════════════════════
    pdf.add_page()
    pdf.big_title("Liste des abréviations", add_toc=False)

    abbrevs = [
        ("API", "Application Programming Interface"),
        ("COD", "Cash on Delivery (Paiement a la livraison)"),
        ("CRUD", "Create, Read, Update, Delete"),
        ("CSS", "Cascading Style Sheets"),
        ("DRF", "Django REST Framework"),
        ("HTTP", "HyperText Transfer Protocol"),
        ("JSON", "JavaScript Object Notation"),
        ("JWT", "JSON Web Token"),
        ("ORM", "Object-Relational Mapping"),
        ("RBAC", "Role-Based Accèss Control"),
        ("REST", "Representational State Transfer"),
        ("SPA", "Single Page Application"),
        ("SQL", "Structured Query Language"),
        ("UI", "User Interface"),
        ("UML", "Unified Modeling Language"),
        ("UX", "User Experience"),
    ]

    pdf.clean_table("Abreviations utilisées dans ce rapport",
                    ["Abreviation", "Signification"],
                    abbrevs,
                    tbl_label="")

    # Conventions
    pdf.ln(4)
    pdf.h2("Conventions de lecture", add_toc=False)
    pdf.p("Les noms techniques, routes, commandes et fichiers sont presentes en police monospace. Les figures sont citees dans le texte avant leur apparition et leur numerotation suit le chapitre correspondant (ex: Figure 3.1 = premiere figure du Chapitre III).")
    pdf.p("Les statuts fonctionnels sont conserves en anglais ou francais selon leur implementation technique pour rester coherents avec le code (ex: pending, sold, approved). Les termes frontend et backend designent respectivement l'interface utilisateur React et l'API serveur Django.")

    # ═══════════════════════════════════════════════════════════
    #  INTRODUCTION GENERALE
    # ═══════════════════════════════════════════════════════════
    pdf.add_page()
    pdf.start_numbering = True
    pdf.page_offset = pdf.page_no() - 1
    pdf.big_title("Introduction générale")
    pdf.p("L'ere numerique a profondement transforme les modes de consommation et les echanges commerciaux. Si le commerce electronique grand public est aujourd'hui domine par des plateformes généralistes telles qu'Amazon, eBay ou Leboncoin, le secteur des antiquites et des objets de collection requiert une approche distincte et specialisee. Les collectionneurs, historiens amateurs et passionnes d'art ne recherchent pas seulement une transaction, mais une histoire, une garantie d'authenticite et une experience visuelle a la hauteur de la rarete des pieces qu'ils convoitent.")
    pdf.p("Cependant, les solutions existantes pour la vente d'antiquites en ligne souffrent souvent d'un manque de curation, d'interfaces vieillissantes, et d'une separation floue entre acheteurs professionnels et amateurs. Le besoin d'une plateforme de confiance, ou les objets sont mis en valeur et les vendeurs moderes, est reel et croissant. Les acteurs de ce marche de niche aspirent a un espace qui respecte les codes du marche de l'art tout en tirant parti des technologies web modernes.")
    pdf.p("Le projet Artisan's Echo repond a cette problématique en proposant une plateforme marketplace premium, concue comme une galerie virtuelle. Elle offre un espace dedie pour chaque type d'utilisateur : l'administrateur modere le contenu et les accès, le vendeur professionnel ou verifie publie et gere ses artefacts, tandis que l'acheteur collectionneur explore, sauvegarde et acquiert des objets rares dans un environnement visuellement immersif et fonctionnellement complet.")
    pdf.p("Ce projet vise à structurer l'ensemble du cycle d'un marketplace specialise : de l'authentification securisee a la publication de produits detailles, en passant par la gestion du panier, de la liste de souhaits, de la messagerie interne pour les negociations, et enfin, le processus de commande avec paiement a la livraison.")
    pdf.p("Ce rapport presente les différentes étapes de la conception et de la réalisation de cette plateforme, organisees en cinq chapitres :")
    pdf.numbered(1, "Le premier chapitre introduit le contexte général, la problématique et les objectifs du projet.")
    pdf.numbered(2, "Le deuxieme chapitre detaille l'analyse des besoins fonctionnels et non fonctionnels.")
    pdf.numbered(3, "Le troisieme chapitre aborde la conception architecturale et logicielle, incluant les diagrammes UML.")
    pdf.numbered(4, "Le quatrieme chapitre presente la réalisation technique et les interfaces développées.")
    pdf.numbered(5, "Le cinquieme chapitre expose les tests, la validation et les perspectives d'evolution.")

    # ═══════════════════════════════════════════════════════════
    #  CHAPTER 1 - Presentation générale
    # ═══════════════════════════════════════════════════════════
    pdf.chapter_separator(1, "Presentation générale du projet")
    pdf.add_page()
    pdf.chapter_title("Presentation générale du projet")

    pdf.h2("1.1 Contexte du projet")
    pdf.p("Le marche des objets antiques et de collection est un secteur de niche caracterise par des transactions de forte valeur et une importance capitale accordee a la provenance et a l'authenticite des biens. Traditionnellement ancre dans les salles de vente aux encheres, les brocantes specialisees et les galeries physiques, ce marche s'est progressivement numerise au cours des deux dernieres decennies.")
    pdf.p("Cependant, les plateformes généralistes de vente de pair a pair (C2C) ou de commerce electronique standard ne repondent pas aux attentes spécifiques de ce public exigeant. Elles manquent de mecanismes de verification rigoureux, d'interfaces esthetiques adaptees a la mise en valeur du patrimoine culturel, et de tableaux de bord adaptes a la gestion d'inventaires de pieces uniques, chacune possedant son propre historique et sa propre valeur patrimoniale.")
    pdf.p("C'est dans ce contexte que s'inscrit le développément d'Artisan's Echo. Le projet est ne de la volonte de creer une vitrine numerique qui respecte les codes du marche de l'art et de l'antiquite, tout en tirant parti des technologies web modernes pour offrir fluidite, securite et organisation. La plateforme se positionne comme un intermediaire de confiance entre vendeurs professionnels et collectionneurs passionnes.")

    pdf.h2("1.2 Problématique")
    pdf.p("La conception d'une plateforme dédiée aux antiquites souleve plusieurs defis majeurs. La problématique centrale peut se formuler ainsi :")
    pdf.p_bold("Comment concevoir et realiser une plateforme web marketplace premium qui garantit un environnement de confiance pour la vente d'objets rares, tout en offrant une experience utilisateur esthetique et des outils de gestion cloisonnes et adaptes a chaque role (acheteur, vendeur, administrateur) ?")
    pdf.p("Cette problématique implique plusieurs sous-questions fondamentales :")
    pdf.bl("Comment separer efficacement les espaces vendeurs, acheteurs et administrateurs pour eviter toute confusion des fonctionnalites et garantir la securite des données ?")
    pdf.bl("Comment mettre en valeur les objets (les \"artefacts\") tout en structurant les données nécessaires a leur identification (epoque, origine, condition, materiaux) ?")
    pdf.bl("Comment faciliter la communication et la transaction entre les parties tout en maintenant un contrôle et une moderation rigoureuse par les administrateurs ?")
    pdf.bl("Comment assurer une experience utilisateur premium et immersive qui reflete la valeur et le prestige des objets vendus ?")

    pdf.h2("1.3 Objectifs du projet")
    pdf.p("Les objectifs principaux du projet Artisan's Echo sont clairement definis et guident l'ensemble du processus de conception et de développément :")
    pdf.bl("Concevoir une vitrine en ligne premium, avec un design moderne et immersif inspire des galeries d'art contemporaines, offrant une experience visuelle a la hauteur des objets presentes.")
    pdf.bl("Implementer un système multi-rôles securise avec des espaces et tableaux de bord dedies pour les acheteurs (collectionneurs), les vendeurs professionnels et les administrateurs de la plateforme.")
    pdf.bl("Developper un catalogue riche, filtrable et recherchable pour faciliter la découverte des objets par categories, mots-cles, fourchettes de prix et etats de conservation.")
    pdf.bl("Mettre en place un processus de moderation des utilisateurs et des artefacts pour garantir la qualite et l'integrite de la plateforme, avec un journal d'audit tracable.")
    pdf.bl("Integrer des fonctionnalites e-commerce completes : panier d'achat, liste de souhaits, processus de commande avec paiement a la livraison (Cash on Delivery), et suivi des commandes.")
    pdf.bl("Fournir un canal de communication direct et prive via une messagerie interne entre acheteurs et vendeurs, liee a chaque artefact concerne.")

    pdf.h2("1.4 Valeur ajoutée")
    pdf.p("La valeur ajoutée d'Artisan's Echo par rapport aux solutions existantes repose sur plusieurs piliers distinctifs :")
    pdf.bl("Design Premium : Une interface utilisateur elegante, epuree et dynamique, mettant l'accent sur la photographie des objets et utilisant des animations fluides pour creer une experience immersive.")
    pdf.bl("Separation Stricte des Roles : Des tableaux de bord qui ne melangent pas les actions d'achat et de vente, offrant une clarte fonctionnelle optimale a chaque type d'utilisateur.")
    pdf.bl("Moderation et Confiance : Un flux d'approbation des artefacts par l'administration, assurant que seuls des objets de qualite et conformes apparaissent sur le catalogue public.")
    pdf.bl("Dossier Produit Complet : Des fiches produits détaillées qui informent l'acheteur sur l'histoire, la condition, les materiaux et l'authenticite de l'objet, au-dela d'une simple description marchande.")

    pdf.h2("1.5 Périmètre fonctionnel")
    pdf.p("Le tableau suivant resume le périmètre fonctionnel couvert par la plateforme Artisan's Echo dans sa version actuelle :")
    pdf.wide_table("Périmètre fonctionnel du projet",
                   ["Module", "Description"],
                   [
                       ["Page d'accueil", "Hero banner immersif, navigation, featured items"],
                       ["Catalogue", "Filtrage par categorie, recherche, tri, grille responsive"],
                       ["Detail produit", "Galerie d'images, infos vendeur, boutons d'action"],
                       ["Authentification", "Inscription, connexion, JWT, gestion des rôles"],
                       ["Dashboard acheteur", "Wishlist, commandes, panier, historique, profil"],
                       ["Dashboard vendeur", "Artefacts, galeries, commandes, messagerie, stats"],
                       ["Dashboard admin", "Utilisateurs, moderation, audit trail, statistiques"],
                       ["Messagerie", "Conversations acheteur-vendeur liees aux artefacts"],
                       ["Commandes", "Checkout COD, suivi de statut, acceptation/rejet"],
                   ],
                   col_widths=[45, 121],
                   tbl_label="Tableau 1.1")

    pdf.p("Ce premier chapitre a pose les bases du projet Artisan's Echo en definissant son contexte, sa problématique, ses objectifs et son périmètre. Le chapitre suivant s'attâchera a traduire ces intentions en besoins fonctionnels et non fonctionnels precis.")

    # ═══════════════════════════════════════════════════════════
    #  CHAPTER 2 - Analyse des besoins
    # ═══════════════════════════════════════════════════════════
    pdf.chapter_separator(2, "Analyse des besoins")
    pdf.add_page()
    pdf.chapter_title("Analyse des besoins")
    pdf.p("L'analyse des besoins constitue une étape fondamentale dans le cycle de vie d'un projet logiciel. Elle permet de definir avec precision les fonctionnalites attendues par les différents utilisateurs du système, ainsi que les contraintes qualitatives et techniques auxquelles la solution doit repondre. Ce chapitre presente l'identification des acteurs, les besoins fonctionnels et non fonctionnels, les parcours utilisateurs et le diagramme des cas d'utilisation.")

    pdf.h2("2.1 Identification des acteurs")
    pdf.p("Le système Artisan's Echo interagit avec plusieurs profils d'utilisateurs, chacun ayant des droits, des responsabilites et des interfaces spécifiques. L'identification rigoureuse de ces acteurs est essentielle pour garantir que chaque fonctionnalite est accèssible uniquement aux utilisateurs autorises.")
    pdf.wide_table("Acteurs du système",
                   ["Acteur", "Description", "Actions cles"],
                   [
                       ["Visiteur", "Utilisateur non authentifie", "Parcourir le catalogue, visualiser les details, s'inscrire"],
                       ["Acheteur", "Utilisateur authentifie (buyer)", "Wishlist, panier, commander, messagerie, profil"],
                       ["Vendeur", "Utilisateur authentifie (seller)", "Publier artefacts, gerer commandes, repondre messages"],
                       ["Administrateur", "Privileges maximums (admin)", "Moderer artefacts, gerer utilisateurs, audit trail"],
                   ],
                   col_widths=[30, 50, 86],
                   tbl_label="Tableau 2.1")

    pdf.h2("2.2 Besoins fonctionnels")
    pdf.p("Les besoins fonctionnels decrivent les actions que le système doit permettre de realiser. Ils ont ete identifies a partir de l'analyse des parcours utilisateurs et des objectifs du projet. Chaque besoin est associe a un identifiant unique et a une priorite de réalisation.")
    pdf.wide_table("Besoins fonctionnels",
                   ["ID", "Domaine", "Description", "Priorite"],
                   [
                       ["BF01", "Authentification", "Permettre la creation d'un compte (Acheteur ou Vendeur)", "Haute"],
                       ["BF02", "Authentification", "Connexion securisee et gestion du profil utilisateur", "Haute"],
                       ["BF03", "Catalogue", "Afficher le catalogue public des artefacts approuves", "Haute"],
                       ["BF04", "Catalogue", "Recherche par mots-cles et filtrage par categories", "Haute"],
                       ["BF05", "Catalogue", "Afficher le dossier detaille d'un objet (galerie, vendeur)", "Haute"],
                       ["BF06", "Achat", "Ajouter/retirer des objets de la liste de souhaits", "Haute"],
                       ["BF07", "Achat", "Gerer un panier d'achat temporaire", "Haute"],
                       ["BF08", "Achat", "Soumettre une commande (Checkout COD)", "Haute"],
                       ["BF09", "Achat", "Consulter l'historique et le statut des commandes", "Haute"],
                       ["BF10", "Vente", "Ajouter, modifier ou supprimer un artefact", "Haute"],
                       ["BF11", "Vente", "Gerer les commandes recues (accepter, expedier)", "Moyenne"],
                       ["BF12", "Vente", "Consulter les statistiques de vente", "Moyenne"],
                       ["BF13", "Communication", "Messagerie interne acheteur-vendeur", "Moyenne"],
                       ["BF14", "Administration", "Approuver ou rejeter les artefacts soumis", "Haute"],
                       ["BF15", "Administration", "Gerer les utilisateurs (suspension, rôles)", "Haute"],
                       ["BF16", "Administration", "Consulter le journal d'audit", "Basse"],
                   ],
                   col_widths=[14, 30, 96, 26],
                   tbl_label="Tableau 2.2")

    pdf.h2("2.3 Besoins non fonctionnels")
    pdf.p("Les besoins non fonctionnels definissent les criteres de qualite et les contraintes techniques auxquelles le système doit se conformer. Ils sont essentiels pour garantir une experience utilisateur satisfaisante et une maintenance aisee du projet.")
    pdf.wide_table("Besoins non fonctionnels",
                   ["Categorie", "Exigence"],
                   [
                       ["Sécurité", "Protection des routes par JWT. Contrôle des autorisations cote serveur (RBAC)."],
                       ["Performance", "Temps de reponse rapide de l'API. Chargement optimise des images."],
                       ["Ergonomie", "Interface premium, claire et intuitive. Micro-animations."],
                       ["Responsivite", "Utilisable sur mobile, tablette et desktop."],
                       ["Maintenabilite", "Code structure, architecture separee Frontend/Backend."],
                       ["Tracabilite", "Journal d'audit pour les actions d'administration critiques."],
                   ],
                   col_widths=[35, 131],
                   tbl_label="Tableau 2.3")

    pdf.h2("2.4 Parcours utilisateurs")
    pdf.p("Pour mieux comprendre les interactions entre les acteurs et le système, les parcours typiques pour chaque role ont ete definis. Ces parcours permettent de valider que les besoins fonctionnels couvrent l'ensemble des scenarii d'utilisation.")

    pdf.h3("Le parcours Visiteur")
    pdf.p("Le visiteur arrive sur la page d'accueil, attiree par le design immersif et le hero banner. Il navigue vers le catalogue, utilisé les filtres pour chercher une antiquite precise par categorie ou par prix. Il consulte le dossier detaille d'un objet, decouvre sa galerie de photos et son historique. Pour ajouter l'objet a sa liste de souhaits ou contacter le vendeur, il est invite a creer un compte en choisissant son role (collectionneur ou vendeur).")

    pdf.h3("Le parcours Acheteur / Collectionneur")
    pdf.p("L'acheteur se connecte et arrive sur son tableau de bord collectionneur. Il peut voir un resume de ses activites : nombre d'objets dans sa wishlist, articles dans le panier, commandes recentes. Il reprend son exploration du catalogue, ajoute un objet rare a son panier, puis procede au checkout en remplissant son adresse de livraison et en confirmant le paiement a la livraison (COD). Il suit ensuite l'evolution de sa commande dans son espace dedie et peut communiquer avec le vendeur via la messagerie interne.")

    pdf.h3("Le parcours Vendeur")
    pdf.p("Le vendeur se connecte et accede a son tableau de bord de gestion. Il decide de mettre en vente une nouvelle horloge ancienne. Il remplit le formulaire de creation de produit avec des photos haute definition, des details historiques (epoque, origine, materiaux) et fixe un prix. L'artefact passe en statut pending (en attente de moderation). Une fois approuve par l'admin, l'objet apparait dans le catalogue public. Le vendeur recoit des commandes, discute avec les acheteurs via la messagerie pour les details d'expedition, puis met à jour le statut de chaque commande.")

    pdf.h3("Le parcours Administrateur")
    pdf.p("L'administrateur a une vue d'ensemble sur l'activite de la plateforme. Son tableau de bord affiche des statistiques globales : nombre total d'utilisateurs, d'artefacts, de commandes. Il verifie les artefacts en attente de moderation, s'assurant que les descriptions sont adequates et les photos conformes aux standards de qualite. Il valide ou rejette les objets. Il consulte également les nouveaux utilisateurs inscrits, peut modifier les rôles ou suspendre des comptes problématiques. Le journal d'audit lui permet de retracer toutes les actions de moderation effectuees.")

    pdf.h2("2.5 Diagramme des cas d'utilisation")
    pdf.p("Le diagramme des cas d'utilisation modelise les interactions globales entre les acteurs et le système, illustrant les périmètres d'action definis dans les sections precedentes. Il permet de visualiser de maniere synthetique les fonctionnalites accèssibles a chaque type d'utilisateur.")
    pdf.insert_diagram(
        os.path.join(BASE, "diagrams", "usecase.png"),
        "Figure 2.1",
        "Diagramme des cas d'utilisation",
        description_after="Ce diagramme illustre les frontières du système et les relations entre Visiteurs, Acheteurs, Vendeurs et Administrateurs vis-à-vis des fonctionnalités majeures de la plateforme Artisan's Echo.")

    pdf.p("L'analyse des besoins a permis de cartographier avec precision les attentes fonctionnelles et qualitatives de la plateforme. La separation claire des rôles et l'accent mis sur la moderation et l'experience premium guideront les choix d'architecture et de conception logicielle abordes dans le chapitre suivant.")

    # ═══════════════════════════════════════════════════════════
    #  CHAPTER 3 - Conception
    # ═══════════════════════════════════════════════════════════
    pdf.chapter_separator(3, "Conception")
    pdf.add_page()
    pdf.chapter_title("Conception")
    pdf.p("La phase de conception traduit les besoins identifies en une architecture logicielle coherente et en modeles de données structures. Ce chapitre presente l'architecture globale du système, le modele de gestion des rôles et des accès, le modele de données relationnel, les diagrammes de séquence illustrant les flux cles, et les regles de gestion metier qui assurent la coherence du système.")

    pdf.h2("3.1 Architecture globale du système")
    pdf.p("Le projet Artisan's Echo repose sur une architecture moderne de type Single Page Application (SPA) decouple du serveur via une API REST. Cette separation stricte entre le frontend et le backend offre de nombreux avantages en termes de maintenabilite, d'evolutivite et de specialisation des développéments.")
    pdf.p("L'architecture s'organise en trois couches principales :")
    pdf.numbered(1, "Couche Presentation (Frontend) : Developpee en React avec TypeScript et Vite. Elle gere le routage cote client (React Router), la gestion d'etat locale, l'affichage dynamique des composants et l'experience utilisateur globale avec des animations fluides (Framer Motion).")
    pdf.numbered(2, "Couche Metier et Services (Backend API) : Developpee en Python avec Django et Django REST Framework (DRF). Cette couche recoit les requetes HTTP, verifie l'authentification via les jetons JWT, applique la logique metier, valide les données via les serializers et interroge la base de données via l'ORM Django.")
    pdf.numbered(3, "Couche Persistance (Base de données) : Utilisation de SQLite en environnement de développément, modulaire pour PostgreSQL en production. Elle stocke de maniere intègre et persistante l'ensemble des données : utilisateurs, profils, artefacts, commandes, messages et logs d'audit.")
    pdf.p("Le frontend est servi sur le port 5173 (serveur de développément Vite) et communique avec le backend sur le port 8000 via des appels HTTP/JSON. Les tokens JWT (accèss + refresh) sont stockes cote client et transmis dans les en-tetes Authorization de chaque requete protegee.")

    pdf.insert_diagram(
        os.path.join(BASE, "diagrams", "architecture.png"),
        "Figure 3.1",
        "Architecture générale du système",
        description_after="Ce schéma illustre la communication entre le frontend React et le backend Django via l'API REST, ainsi que les flux d'authentification JWT et l'accès à la base de données.")

    pdf.h2("3.2 Gestion des rôles et des accès (RBAC)")
    pdf.p("L'architecture de securite repose sur un modele Role-Based Accèss Control (RBAC). Apres authentification, le backend verifie l'identité de l'utilisateur via le JSON Web Token, puis lit son role (buyer, seller, admin) depuis le profil associe.")
    pdf.p("Des classes de permissions personnalisees ont ete creees cote serveur pour proteger les endpoints de l'API. Chaque vue (ViewSet) est associee a une ou plusieurs classes de permission qui determinent si l'utilisateur courant a le droit d'effectuer l'action demandee. Par exemple :")
    pdf.bl("IsAdminOrReadOnly : permet a tous de lire les données, mais seul l'admin peut les modifier ou les supprimer.")
    pdf.bl("IsSeller : limite l'accès a la creation et la gestion de produits aux utilisateurs ayant le role vendeur.")
    pdf.bl("IsOwnerOrAdmin : garantit qu'un utilisateur ne peut voir ou modifier que ses propres commandes, messages ou informations de profil.")
    pdf.p("Le frontend s'adapte dynamiquement en fonction du role retourne par l'API, en affichant ou masquant des elements de navigation, des boutons d'action et des sections entieres du tableau de bord. Par exemple, le lien vers le Dashboard Admin n'apparait que pour les utilisateurs ayant le role admin.")

    pdf.insert_diagram(
        os.path.join(BASE, "diagrams", "rbac.png"),
        "Figure 3.2",
        "Contrôle d'accès basé sur les rôles (RBAC)",
        description_after="Ce schéma montre les différents niveaux d'accès et les permissions associées à chaque rôle utilisateur dans le système Artisan's Echo.")

    pdf.h2("3.3 Modele de données")
    pdf.p("La conception de la base de données est cruciale pour structurer l'information de la marketplace. Le modele relationnel s'articule autour de plusieurs entites interconnectees, chacune representant un concept metier fondamental du système.")
    pdf.wide_table("Entités principales du modele de données",
                   ["Entité", "Description", "Relations principales"],
                   [
                       ["User", "Compte utilisateur (authentification)", "1-1 avec Profile"],
                       ["Profile", "Informations etendues (role, adresse, bio)", "1-1 avec User"],
                       ["Category", "Taxonomie pour classer les artefacts", "1-N avec Artifact"],
                       ["Artifact", "Objet en vente (titre, prix, description, statut)", "N-1 User (vendeur), N-1 Category"],
                       ["ArtifactImage", "Images multiples pour la galerie produit", "N-1 avec Artifact"],
                       ["Order", "Commande globale effectuee par un acheteur", "N-1 avec User (acheteur)"],
                       ["OrderItem", "Ligne de commande liant artefact a commande", "N-1 Order, 1-1 Artifact"],
                       ["CartItem", "Article dans le panier temporaire", "N-1 User, N-1 Artifact"],
                       ["WishlistItem", "Article dans la liste de souhaits", "N-1 User, N-1 Artifact"],
                       ["Conversation", "Fil de discussion lie a un artefact", "N-1 Artifact, N-N Users"],
                       ["Message", "Message dans une conversation", "N-1 Conversation, N-1 User"],
                       ["AuditLog", "Trace des actions d'administration", "N-1 avec User (admin)"],
                   ],
                   col_widths=[30, 60, 76],
                   tbl_label="Tableau 3.1")

    pdf.insert_diagram(
        os.path.join(BASE, "diagrams", "db_er.png"),
        "Figure 3.3",
        "Vue d'ensemble de la base de données / entités",
        description_after="Ce diagramme de classes ER modélise les relations entre les entités, leurs attributs majeurs et les multiplicités. L'entité Artifact est centrale, liée au Vendeur, aux Categories, aux Images et aux Commandes.")

    pdf.h2("3.4 Diagrammes de séquence")
    pdf.p("Pour illustrer la dynamique du système, plusieurs séquences cles ont ete modelisees. Ces diagrammes montrent l'enchainement des interactions entre l'utilisateur, le frontend React et le backend Django pour les operations les plus importantes.")

    pdf.h3("3.4.1 Séquence d'authentification (Login)")
    pdf.p("Cette séquence montre le processus complet de connexion : l'utilisateur saisit ses identifiants dans le formulaire de login. Le frontend envoie une requete POST a l'endpoint /api/auth/login/ avec les credentials. Le backend verifie les informations, genere une paire de tokens JWT (accèss + refresh) et retourne le profil utilisateur avec son role. Le frontend stocke les tokens et redirige l'utilisateur vers son tableau de bord specifique.")
    pdf.insert_diagram(
        os.path.join(BASE, "diagrams", "seq_login.png"),
        "Figure 3.4",
        "Diagramme de séquence - Connexion (Login)",
        description_after="Le flux d'authentification garantit que chaque utilisateur est redirigé vers l'interface correspondant à son rôle après connexion.")

    pdf.h3("3.4.2 Séquence de publication d'un produit")
    pdf.p("Le vendeur remplit le formulaire de creation d'artefact avec les informations détaillées (titre, description, prix, categorie, images). Le frontend envoie une requete POST multipart a l'API. Le backend cree l'entite Artifact avec le statut pending (en attente de moderation), enregistre les images associees, et retourne une confirmation au frontend. L'artefact n'apparaitra dans le catalogue public qu'apres approbation par l'administrateur.")
    pdf.insert_diagram(
        os.path.join(BASE, "diagrams", "seq_publish.png"),
        "Figure 3.5",
        "Diagramme de séquence - Publication produit",
        description_after="Ce flux illustre le mécanisme de modération : tout nouvel artefact doit être approuvé avant d'être visible publiquement.")

    pdf.h3("3.4.3 Séquence de commande (Checkout)")
    pdf.p("L'acheteur valide son panier ou utilisé le bouton 'Buy Now' pour un achat direct. Le frontend envoie les données de livraison (nom, telephone, adresse, ville, notes) a l'endpoint /api/orders/direct_checkout/. Le backend cree l'entite Order avec les OrderItems correspondants, met à jour le statut des artefacts commandes, et retourne le succes de la transaction. L'acheteur peut ensuite suivre sa commande dans son tableau de bord.")
    pdf.insert_diagram(
        os.path.join(BASE, "diagrams", "seq_checkout.png"),
        "Figure 3.6",
        "Diagramme de séquence - Checkout / Commande",
        description_after="Le processus de commande couvre le checkout direct (Buy Now) et le checkout depuis le panier, tous deux avec paiement à la livraison (COD).")

    pdf.h2("3.5 Règles de gestion")
    pdf.p("Plusieurs regles metiers fortes assurent la coherence et l'integrite du système. Ces regles sont implementees a la fois cote serveur (dans les vues et serializers Django) et cote client (dans les composants React) pour une double validation :")
    pdf.bl("Un artefact vendu (statut sold) ne peut plus etre ajoute au panier par un autre utilisateur. Le bouton d'achat est desactive automatiquement.")
    pdf.bl("Seul un artefact au statut approved est visible publiquement dans le catalogue. Les artefacts en attente (pending) ou rejetes (rejected) ne sont visibles que par leur vendeur et l'administrateur.")
    pdf.bl("Un vendeur ne peut pas acheter ses propres artefacts. Le système verifie l'identité de l'acheteur et du vendeur pour chaque transaction.")
    pdf.bl("Une commande passe par plusieurs statuts temporels : pending_confirmation, processing, shipped, delivered, cancelled. Chaque transition est tracee dans le journal d'audit.")
    pdf.bl("Seul l'administrateur peut changer le role d'un utilisateur, suspendre un compte ou approuver/rejeter un artefact soumis.")
    pdf.bl("La messagerie est liee a un artefact specifique : un acheteur ne peut contacter un vendeur qu'a propos d'un objet precis.")

    pdf.p("La phase de conception a permis de definir une architecture robuste, modulaire et securisee. Le modele de données relationnel et le système de rôles garantissent que les exigences de segregation des données et de tracabilite seront respectees lors de l'implementation détaillée dans le chapitre suivant.")

    # ═══════════════════════════════════════════════════════════
    #  CHAPTER 4 - Réalisation
    # ═══════════════════════════════════════════════════════════
    pdf.chapter_separator(4, "Réalisation de la solution")
    pdf.add_page()
    pdf.chapter_title("Réalisation de la solution")
    pdf.p("Ce chapitre presente la phase de réalisation technique du projet Artisan's Echo. Il detaille les technologies utilisées, la structure du code source, et les différentes interfaces développées pour chaque role utilisateur. La réalisation a suivi une approche orientee utilisateur, en materialisant les parcours definis lors de l'analyse des besoins et en respectant l'architecture concue au chapitre precedent.")

    pdf.h2("4.1 Technologies utilisées")
    pdf.p("La phase de réalisation s'est appuyee sur des technologies modernes, reconnues pour leur fiabilite, leur performance et leur vaste ecosystème de bibliotheques et d'outils complementaires.")
    pdf.wide_table("Stack technologique du projet",
                   ["Composant", "Technologie", "Justification"],
                   [
                       ["Frontend Framework", "React 19.x", "Architecture composants, large communaute"],
                       ["Langage Frontend", "TypeScript", "Typage statique, prevention d'erreurs"],
                       ["Outil de Build", "Vite 8.x", "Dev server rapide, optimisation build"],
                       ["Animations", "Motion (Framer Motion)", "Micro-interactions fluides et premium"],
                       ["Icones", "Lucide React", "Icones modernes et coherentes"],
                       ["HTTP Client", "Axios 1.x", "Gestion des requetes API robuste"],
                       ["Routage Frontend", "React Router DOM 7.x", "Navigation SPA fluide"],
                       ["Backend Framework", "Django 5.x", "Robustesse, securite native (ORM, CSRF)"],
                       ["API REST", "Django REST Framework", "Serialisation, vues, permissions"],
                       ["Authentification", "Simple JWT 5.x", "Tokens accèss/refresh, securise"],
                       ["Base de données", "SQLite 3.x", "Legerete pour le développément"],
                       ["Gestion de code", "Git", "Versionnage et collaboration"],
                   ],
                   col_widths=[38, 42, 86],
                   tbl_label="Tableau 4.1")

    pdf.h2("4.2 Structure du projet")
    pdf.p("Le projet est organise en deux repertoires principaux, suivant le principe de separation des preoccupations entre le frontend et le backend :")
    pdf.bl("frontend/ : Application React contenant les composants, pages, services API, types TypeScript et assets statiques. Le point d'entree est App.tsx qui gere le routage principal vers toutes les pages de la plateforme.")
    pdf.bl("backend/ : Projet Django organise en deux applications principales - marketplace (gestion des artefacts, commandes, messages, moderation) et users (authentification, profils utilisateurs, gestion des rôles).")
    pdf.p("Le frontend contient les pages principales : App.tsx (page d'accueil et routage global), ArtifactDetailPage.tsx (detail produit avec galerie), buyer.tsx (dashboard acheteur), seller.tsx (dashboard vendeur), admin.tsx (dashboard administrateur), account.tsx (parametres du profil), et api.ts (configuration Axios pour les appels API).")
    pdf.p("Le backend contient les fichiers essentiels : models.py (definition des entites), views.py (logique metier et ViewSets), serializers.py (validation et transformation des données), urls.py (routage API REST), et permissions.py (classes de contrôle d'accès RBAC).")

    pdf.h2("4.3 Interfaces et fonctionnalités développées")
    pdf.p("Le développément a suivi une approche orientee utilisateur, en materialisant les parcours definis lors de l'analyse des besoins. Chaque interface a ete concue pour offrir une experience premium, coherente et intuitive.")

    pdf.h3("4.3.1 Page d'accueil publique")
    pdf.p("La premiere impression est cruciale pour une plateforme premium. La page d'accueil a ete entierement repensee avec un theme professionnel et elegant. La barre de navigation (navbar) offre un espacement epure, avec le logo (format PNG transparent sans arriere-plan) judicieusement place a gauche. La section \"Hero\" adopte un design raffine, tandis que la typographie, l'espacement, les cartes et la palette de couleurs ont ete optimises pour un rendu visuel luxueux, tout en garantissant un affichage parfaitement responsive.")
    pdf.insert_diagram(r"c:\Users\boura\ouissal\pfe-antique-marketplace-1\docs\screenshots\home.png", "Figure 4.1",
        "Page d'accueil publique (redesign premium)",
        description_after="Le design utilisé une palette de couleurs sombres et dorees, renforcant l'aspect luxueux et historique des antiquites. L'affichage s'adapte dynamiquement du desktop au mobile pour une experience fluide.")

    pdf.h3("4.3.2 Catalogue des objets")
    pdf.p("Le catalogue est le coeur de la découverte sur la plateforme. Il affiche les artefacts approuves sous forme de cartes elegantes, presentant la photographie principale, le titre, le prix, la categorie et le badge de verification du vendeur. Des fonctionnalites de filtrage par categorie, par fourchette de prix, et une barre de recherche par mots-cles permettent d'affiner l'exploration. La grille est entierement responsive, s'adaptant du desktop au mobile.")
    pdf.insert_diagram(r"c:\Users\boura\ouissal\pfe-antique-marketplace-1\docs\screenshots\catalogue.png", "Figure 4.2",
        "Catalogue des objets",
        description_after="L'interface du catalogue est pensee pour maximiser la visibilite des images, tout en offrant une navigation fluide. Les cartes produit incluent des effets de survol (hover) subtils qui revelent des details supplementaires.")

    pdf.h3("4.3.3 Dossier detaille d'un objet")
    pdf.p("Lorsqu'un utilisateur clique sur un objet, il accede a sa fiche détaillée. Celle-ci comprend une galerie de photos interactive avec navigation par miniatures, une description riche retracant l'histoire de l'objet, des informations structurees sur sa condition, sa provenance, ses materiaux et ses dimensions. Un encart est dedie au profil du vendeur avec son badge de verification, et les appels a l'action (Ajouter au panier, Buy Now, Liste de souhaits, Contacter le vendeur) sont clairement identifies et accèssibles.")
    pdf.insert_diagram(r"c:\Users\boura\ouissal\pfe-antique-marketplace-1\docs\screenshots\detail.png", "Figure 4.3",
        "Dossier detaille d'un objet",
        description_after="La mise en page aeree rappelle la scenographie d'une exposition artistique, mettant chaque objet en valeur comme une piece de musee.")

    pdf.h3("4.3.4 Authentification et inscription")
    pdf.p("Les formulaires de connexion et d'inscription sont epures et securises. L'inscription propose le choix du role (Collectionneur ou Vendeur), ce qui conditionnera l'experience future sur la plateforme et le type de tableau de bord accèssible. La connexion genere des tokens JWT stockes localement. Le système gere automatiquement le rafraichissement des tokens expires et la redirection vers le tableau de bord correspondant au role de l'utilisateur.")
    pdf.insert_diagram(r"c:\Users\boura\ouissal\pfe-antique-marketplace-1\docs\screenshots\login.png", "Figure 4.4",
        "Page de connexion / inscription",
        description_after="Les formulaires incluent des validations cote client (format email, longueur de mot de passe, champs obligatoires) pour garantir des données propres avant la soumission a l'API backend.")

    pdf.h3("4.3.5 Tableau de bord du collectionneur (Acheteur)")
    pdf.p("Une fois connecte, l'acheteur accede a son espace personnel. Ce tableau de bord offre une vue synthetique sur ses activites recentes : nombre d'objets dans sa wishlist, articles dans le panier, commandes en cours et leur statut. Il permet de naviguer rapidement vers ses différentes sections : historique des commandes, liste de souhaits, panier d'achat et parametres du profil.")
    pdf.insert_diagram(r"c:\Users\boura\ouissal\pfe-antique-marketplace-1\docs\screenshots\dashboard.png", "Figure 4.5",
        "Tableau de bord du collectionneur (acheteur)",
        description_after="Un environnement centre sur l'utilisateur, facilitant le suivi de ses acquisitions et offrant un accès rapide a toutes les fonctionnalites d'achat.")

    pdf.p("L'acheteur peut mettre de cote des objets remarquables dans sa liste de souhaits pour y revenir plus tard. La wishlist est presentee sous forme de galerie privee avec les informations essentielles de chaque objet sauvegarde.")
    pdf.insert_diagram(r"c:\Users\boura\ouissal\pfe-antique-marketplace-1\docs\screenshots\buyer_wishlist.png", "Figure 4.6",
        "Liste de souhaits (Wishlist)",
        description_after="La liste de souhaits permet au collectionneur de construire sa collection virtuelle avant de proceder a l'achat, offrant une experience de curation personnelle.")

    pdf.p("Le panier recapitule les articles choisis avec leurs prix et quantites. Le processus de commande (Checkout) recueille les informations de livraison (nom complet, telephone, ville, adresse, notes de livraison) et valide la transaction avec le mode de paiement Cash on Delivery (COD). Un modal de checkout securise guide l'utilisateur a travers les étapes finales de la commande.")
    pdf.insert_diagram(r"c:\Users\boura\ouissal\pfe-antique-marketplace-1\docs\screenshots\buyer_orders.png", "Figure 4.7",
        "Panier et processus de commande",
        description_after="Le checkout est concu pour etre fluide et rassurant, minimisant les frictions lors de l'achat tout en collectant toutes les informations nécessaires a la livraison.")

    pdf.h3("4.3.6 Tableau de bord du vendeur")
    pdf.p("L'espace du vendeur est un centre de contrôle de son activite commerciale. Le tableau de bord affiche des metriques cles : nombre d'objets en vente, artefacts en attente de moderation, commandes recues, revenus generes. Il offre un accès rapide a la gestion de son inventaire, a la creation de nouveaux produits et au traitement des commandes en cours.")
    pdf.insert_diagram(r"c:\Users\boura\ouissal\pfe-antique-marketplace-1\docs\screenshots\seller_dashboard.png", "Figure 4.8",
        "Tableau de bord du vendeur",
        description_after="L'interface met en evidence les actions requises, comme les nouvelles commandes a traiter ou les artefacts en attente de moderation, grace a des indicateurs visuels et des badges de notification.")

    pdf.p("Le vendeur dispose d'un tableau listant ses artefacts avec leurs statuts (Approuve, En attente, Vendu, Rejete). Il peut filtrer et rechercher parmi ses produits pour une gestion efficace de son inventaire.")
    pdf.insert_diagram(r"c:\Users\boura\ouissal\pfe-antique-marketplace-1\docs\screenshots\seller_orders.png", "Figure 4.9",
        "Gestion des produits du vendeur",
        description_after="La liste de gestion de l'inventaire vendeur offre une vue complete de tous les artefacts avec leurs statuts de moderation et de vente.")

    pdf.p("Le formulaire d'ajout ou de modification est exhaustif, permettant de specifier tous les details qui feront la valeur de l'objet : titre, description riche, prix, categorie, etat de conservation, epoque estimee, provenance, materiaux, dimensions, et upload multiple de photos haute definition.")
    pdf.insert_diagram(r"c:\Users\boura\ouissal\pfe-antique-marketplace-1\docs\screenshots\seller_products.png", "Figure 4.10",
        "Formulaire d'ajout / modification produit",
        description_after="Le formulaire gere l'upload multiple d'images, la saisie de données structurees et la validation cote client avant soumission au backend pour moderation.")

    pdf.h3("4.3.7 Tableau de bord administrateur")
    pdf.p("L'administrateur dispose du niveau d'accès le plus eleve. Son tableau de bord est un centre de supervision de la plateforme, avec des statistiques globales (nombre total d'utilisateurs, d'artefacts, de commandes, revenus) et des alertes sur les actions en attente, comme les artefacts a moderer ou les signalements a traiter.")
    pdf.insert_diagram(r"c:\Users\boura\ouissal\pfe-antique-marketplace-1\docs\screenshots\admin_dashboard.png", "Figure 4.12",
        "Tableau de bord administrateur",
        description_after="Une vue d'ensemble des metriques de sante de la marketplace, avec des indicateurs visuels pour les actions urgentes et les tendances d'activite.")

    pdf.p("L'administrateur peut visualiser tous les utilisateurs inscrits, changer leurs rôles (buyer, seller, admin) ou suspendre des comptes problématiques. Un système de recherche et de filtrage permet de retrouver rapidement un utilisateur specifique.")
    pdf.insert_diagram(r"c:\Users\boura\ouissal\pfe-antique-marketplace-1\docs\screenshots\admin_users.png", "Figure 4.13",
        "Gestion des utilisateurs (Admin)",
        description_after="Le tableau de gestion des membres offre un contrôle total sur les privileges et le statut de chaque compte utilisateur de la plateforme.")

    pdf.p("La moderation des artefacts est une responsabilite cle de l'administrateur. L'interface de moderation affiche les objets soumis par les vendeurs en attente d'approbation, avec toutes les informations nécessaires a la prise de decision (photos, description, vendeur, prix).")
    pdf.insert_diagram(r"c:\Users\boura\ouissal\pfe-antique-marketplace-1\docs\screenshots\admin_artifacts.png", "Figure 4.14",
        "Moderation des artefacts (Admin)",
        description_after="L'interface de moderation permet d'approuver ou de rejeter un objet en un clic, avec la possibilite d'ajouter un commentaire de justification pour le vendeur.")

    pdf.p("Par souci de transparence et de securite, toutes les actions critiques (moderation d'artefacts, changements de rôles, suspensions de comptes) sont consignees dans un journal d'audit accèssible par l'administration. Chaque entree du journal inclut l'horodatage, l'action effectuee, l'utilisateur concerne et l'administrateur responsable.")
    pdf.insert_diagram(r"c:\Users\boura\ouissal\pfe-antique-marketplace-1\docs\screenshots\admin_audit.png", "Figure 4.15",
        "Journal d'audit (Audit Trail)",
        description_after="L'historique des actions de moderation permet de retracer les decisions prises sur la plateforme, assurant la tracabilite et la responsabilite des actes administratifs.")

    pdf.h3("4.3.8 Messagerie interne")
    pdf.p("Pour les transactions d'antiquites, la communication entre acheteur et vendeur est vitale. La plateforme intègre une messagerie interne permettant aux acheteurs de contacter les vendeurs directement depuis la fiche produit. Chaque conversation est liee a un artefact specifique, ce qui facilite le suivi et le contexte des echanges. Les messages sont affiches dans une interface de chat intuitive avec indicateurs de lecture et horodatage.")
    pdf.insert_diagram(r"c:\Users\boura\ouissal\pfe-antique-marketplace-1\docs\screenshots\messages.png", "Figure 4.11",
        "Messagerie interne",
        description_after="L'interface de chat permet des echanges structures et contextualises, ameliorant la confiance entre acheteurs et vendeurs lors des negociations.")

    pdf.h3("4.3.9 Profil utilisateur")
    pdf.p("Chaque utilisateur peut personnaliser son compte via la page des parametres du profil. Cette page permet la mise à jour des informations personnelles (nom, email, bio, adresse), le changement de mot de passe, et la gestion de l'avatar. Les parametres sont organises de maniere claire et la sauvegarde est confirmee par un retour visuel immediat.")
    pdf.insert_diagram(r"c:\Users\boura\ouissal\pfe-antique-marketplace-1\docs\screenshots\account_settings.png", "Figure 4.16",
        "Parametres du profil utilisateur",
        description_after="Une gestion simple et centralisee des données personnelles, avec validation en temps reel des modifications avant sauvegarde.")

    pdf.h2("4.4 Responsive Design")
    pdf.p("Un soin particulier a ete apporte a l'ergonomie sur les différents terminaux. L'ensemble des interfaces - tableaux de bord, catalogue, formulaires, messagerie - s'adaptent dynamiquement aux petites resolutions. Les elements s'empilent intelligemment sur mobile, la navigation se transforme en menu hamburger, et les tableaux de données deviennent scrollables horizontalement. Les images du catalogue sont redimensionnees et les cartes produit passent d'une grille multi-colonnes a une colonne unique pour garantir une experience fluide sur smartphone et tablette.")

    pdf.p("La phase de réalisation a permis de concretiser les specifications en une application web fonctionnelle et esthetique. L'utilisation d'outils modernes comme React, TypeScript et Django a permis de livrer rapidement des interfaces riches et interactives, tout en maintenant un backend solide et securise. Le chapitre suivant verifiera la qualite de ce travail a travers des campagnes de tests.")

    # ═══════════════════════════════════════════════════════════
    #  CHAPTER 5 - Tests, validation et perspectives
    # ═══════════════════════════════════════════════════════════
    pdf.chapter_separator(5, "Tests, validation et perspectives")
    pdf.add_page()
    pdf.chapter_title("Tests, validation et perspectives")
    pdf.p("Ce chapitre final presente la strategie de validation mise en place pour s'assurer de la fiabilite et de la qualite de l'application Artisan's Echo. Il detaille les scenarios de tests executes, les resultats obtenus, les limites identifiees et les perspectives d'amelioration envisagees pour les versions futures de la plateforme.")

    pdf.h2("5.1 Strategie de test")
    pdf.p("Pour s'assurer de la fiabilite de l'application, une strategie de validation multi-niveaux a ete mise en place, couvrant les aspects fonctionnels, techniques et securitaires du système.")
    pdf.p("La validation a comporte plusieurs axes complementaires :")
    pdf.bl("Tests fonctionnels : Verification systematique que chaque bouton, formulaire, lien et fonctionnalite repond comme prevu selon les specifications definies lors de l'analyse des besoins. Chaque parcours utilisateur a ete teste de bout en bout.")
    pdf.bl("Tests d'integration : Validation de la bonne communication entre le frontend React et l'API Django. Verification que les requetes HTTP sont correctement formatees, que les reponses JSON sont correctement parsees, et que les erreurs sont gerees gracieusement cote client.")
    pdf.bl("Tests de securite et permissions : Verification rigoureuse qu'un utilisateur n'a accès qu'aux ressources autorisees par son role. Tentatives d'accès non autorises pour valider le bon fonctionnement du système RBAC.")
    pdf.bl("Tests d'interface (UI/UX) : Verification de l'adaptabilite visuelle (Responsive Design) sur différentes resolutions d'ecran, de la clarte des messages d'erreur et de succes, et de la coherence globale de l'experience utilisateur.")
    pdf.bl("Tests de compilation : Verification que le projet compile sans erreurs ni avertissements, tant cote frontend (npm run build) que cote backend (python manage.py check).")

    pdf.h2("5.2 Scenarios de tests fonctionnels")
    pdf.p("Un ensemble de scenarios critiques a ete execute pour valider les fonctionnalites principales du système. Chaque scenario couvre un parcours utilisateur complet, de l'action initiale au resultat attendu.")
    pdf.wide_table("Scenarios de test fonctionnels",
                   ["ID", "Scenario teste", "Resultat attendu", "Statut"],
                   [
                       ["ST01", "Inscription vendeur", "Compte cree avec role seller", "Succes"],
                       ["ST02", "Routage apres connexion", "Redirection vers dashboard specifique", "Succes"],
                       ["ST03", "Accès non autorise (RBAC)", "Erreur 403, accès refuse", "Succes"],
                       ["ST04", "Soumission d'un artefact", "Statut pending, non visible public", "Succes"],
                       ["ST05", "Moderation par l'admin", "Artefact approved, visible catalogue", "Succes"],
                       ["ST06", "Workflow de commande", "Commande creee, artefact sold", "Succes"],
                       ["ST07", "Messagerie interne", "Message envoye et recu correctement", "Succes"],
                       ["ST08", "Ajout au panier", "Article ajoute, total mis à jour", "Succes"],
                       ["ST09", "Gestion wishlist", "Objet ajoute/retire de la wishlist", "Succes"],
                       ["ST10", "Modification de role", "Role mis à jour par l'admin", "Succes"],
                   ],
                   col_widths=[14, 40, 72, 40],
                   tbl_label="Tableau 5.1")

    pdf.h2("5.3 Resultats de validation")
    pdf.p("La verification complete du projet a confirme que l'application fonctionne correctement dans l'ensemble des scenarios testes. Les resultats de compilation ont également ete satisfaisants :")
    pdf.bl("Frontend : npm run build execute avec succes - TypeScript compile sans erreurs, bundle optimise genere en moins de 2 secondes. Taille du bundle JavaScript : environ 723 KB (197 KB compresse). CSS : environ 168 KB (31 KB compresse).")
    pdf.bl("Backend : python manage.py check execute sans aucun problème identifie. L'ensemble des modeles, serializers et vues sont correctement configures et operationnels.")
    pdf.bl("API REST : Tous les endpoints repondent correctement avec les codes HTTP attendus (200, 201, 400, 401, 403, 404) et les reponses JSON sont conformes aux schemas definis.")
    pdf.p("L'ensemble des 10 scenarios de test fonctionnels ont ete valides avec succes, confirmant la robustesse des parcours utilisateurs et le bon fonctionnement du système de permissions RBAC.")

    pdf.h2("5.4 Limites actuelles")
    pdf.p("Bien que la plateforme soit pleinement fonctionnelle pour sa version initiale, certaines limites ont ete identifiees et constituent des axes d'amelioration pour les iterations futures :")
    pdf.bl("Paiement en ligne : Actuellement, le système repose exclusivement sur le paiement a la livraison (Cash on Delivery). Il n'y a pas d'integration de passerelle de paiement en ligne (Stripe, PayPal) pour les transactions par carte bancaire.")
    pdf.bl("Temps reel : La messagerie fonctionne via des requetes HTTP classiques avec un mecanisme de polling periodique. L'implementation de WebSockets (via Django Channels) ameliorerait considerablement la reactivite du chat et permettrait des notifications en temps reel.")
    pdf.bl("Optimisation des medias : Les images des artefacts sont televersees et servies dans leur format original. Un service de redimensionnement, de compression et de conversion (WebP) cote serveur serait necessaire en production pour garantir les performances avec un grand volume de données.")
    pdf.bl("Base de données : L'utilisation de SQLite, adequate pour le développément, ne conviendrait pas pour un deploiement en production a grande echelle. Une migration vers PostgreSQL est recommandee.")
    pdf.bl("Internationalisation : L'interface est actuellement disponible uniquement en anglais. L'ajout du support multi-langues (francais, arabe) elargirait l'audience potentielle de la plateforme.")

    pdf.h2("5.5 Perspectives d'amelioration")
    pdf.p("Les perspectives d'evolution pour Artisan's Echo sont nombreuses et pourraient constituer les phases futures du projet :")
    pdf.bl("Intégration bancaire : Permettre les paiements securises par carte bancaire directement sur la plateforme, avec gestion de sequestre (escrow) pour rassurer acheteurs et vendeurs lors de transactions de grande valeur.")
    pdf.bl("Système d'encheres : Au-dela de l'achat immediat, proposer un module d'encheres programmees pour les pieces d'exception, avec un compteur en temps reel et des notifications automatiques.")
    pdf.bl("Certificats d'authenticite numeriques : Lier les artefacts a des certificats generes pour garantir la provenance et l'authenticite des objets vendus.")
    pdf.bl("Notifications push : Implementer un système de notifications en temps reel pour informer les utilisateurs des nouvelles commandes, messages, changements de statut et promotions.")
    pdf.bl("Application mobile : Developper une version mobile native (React Native) pour offrir une experience optimisee sur smartphone avec accès hors-ligne aux favoris et a l'historique des commandes.")
    pdf.bl("Moteur de recherche avance : Integrer une solution de recherche full-text (Elasticsearch) pour ameliorer la pertinence des resultats et proposer des suggestions intelligentes.")

    pdf.p("La phase de test a valide la robustesse et l'ergonomie de l'application. Les parcours critiques fonctionnent correctement et les regles de securite sont respectees. Les limites identifiees ouvrent des perspectives d'evolution stimulantes, demontrant que la plateforme est une base solide capable de s'adapter aux exigences futures du marche des antiquites en ligne.")

    # ═══════════════════════════════════════════════════════════
    #  CONCLUSION GENERALE
    # ═══════════════════════════════════════════════════════════
    pdf.add_page()
    pdf.big_title("Conclusion générale")
    pdf.p("Le projet de fin d'études Artisan's Echo a consiste en la conception et le développément d'une plateforme web marketplace premium dédiée aux objets antiques et de collection. Face aux manques des plateformes généralistes actuelles pour ce marche de niche, l'objectif etait de fournir une solution elegante, securisee et segmentee par rôles, capable de restaurer la confiance entre acheteurs exigeants et vendeurs professionnels.")
    pdf.p("Tout au long de ce travail, une méthodologie rigoureuse a ete suivie, debutant par une analyse approfondie des besoins spécifiques du domaine des antiquites. Cette analyse a abouti a une architecture logicielle robuste, s'appuyant sur les technologies Django et React, qui a permis de separer clairement les responsabilites (backend / frontend) et de gerer finement les autorisations d'accès via un système RBAC complet.")
    pdf.p("La réalisation technique a couvert un large spectre fonctionnel : de l'interface publique immersive au catalogue dynamique, en passant par les systèmes de panier et de wishlist, la messagerie interne entre acheteurs et vendeurs, le processus de commande avec paiement a la livraison, et la creation de trois tableaux de bord distincts adaptes aux besoins spécifiques des acheteurs, des vendeurs et de l'administration.")
    pdf.p("Un soin particulier a ete apporte a l'ergonomie (UI/UX) pour s'assurer que l'experience visuelle reflete la valeur et le prestige des objets vendus. Le design premium, les micro-animations, la palette de couleurs raffinee et l'attention portee aux details visuels contribuént a creer une atmosphere de galerie virtuelle qui distingue Artisan's Echo des plateformes de vente conventionnelles.")
    pdf.p("Ce projet m'a permis de mobiliser et d'approfondir mes competences en développément Full-Stack, en conception de bases de données relationnelles, en securite des API REST et en integration d'interfaces modernes. Il represente une étape majeure dans mon parcours de formation en développément informatique a l'etablissement Racine, constituant une experience concrete et valorisante de creation d'une application web de bout en bout.")
    pdf.p("Artisan's Echo se revele aujourd'hui etre une preuve de concept fonctionnelle et prometteuse. Ses perspectives d'evolution, comme l'integration de paiements en ligne securises, de systèmes d'encheres ou de certificats d'authenticite numeriques, confirment son potentiel pour devenir une veritable reference numerique dans le secteur des antiquites et des objets de collection.")
    


    # ═══════════════════════════════════════════════════════════
    #  BIBLIOGRAPHIE
    # ═══════════════════════════════════════════════════════════
    pdf.add_page()
    pdf.big_title("Bibliographie")
    refs = [
        "[1] Django Software Foundation. Django Documentation. https://docs.djangoproject.com/",
        "[2] Encode OSS Ltd. Django REST Framework Documentation. https://www.django-rest-framework.org/",
        "[3] Meta Platforms. React Documentation. https://react.dev/",
        "[4] Microsoft. TypeScript Documentation. https://www.typescriptlang.org/docs/",
        "[5] Evan You. Vite Documentation. https://vite.dev/",
        "[6] Jazzband. Simple JWT Documentation. https://django-rest-framework-simplejwt.readthedocs.io/",
        "[7] Axios. Axios HTTP Client Documentation. https://axios-http.com/docs/",
        "[8] Remix Inc. React Router Documentation. https://reactrouter.com/",
        "[9] Framer. Motion Library Documentation. https://motion.dev/",
        "[10] Lucide. Lucide Icons Documentation. https://lucide.dev/",
        "[11] SQLite Consortium. SQLite Documentation. https://www.sqlite.org/docs.html",
        "[12] Mozilla. MDN Web Docs - Web Technologies. https://developer.mozilla.org/",
        "[13] Tailwind Labs. Tailwind CSS Documentation. https://tailwindcss.com/docs",
    ]
    for r in refs:
        pdf.set_font("Helvetica", "", 10)
        pdf.set_text_color(*BODY_TEXT)
        pdf.multi_cell(0, 6, r, new_x="LMARGIN", new_y="NEXT")
        pdf.ln(1)

    # ═══════════════════════════════════════════════════════════
    #  ANNEXES
    # ═══════════════════════════════════════════════════════════
    # Annexe separator
    pdf.is_chapter_sep = True
    pdf.add_page()
    pdf.set_fill_color(*CHAPTER_BG)
    pdf.rect(0, 0, 210, 297, "F")
    pdf.set_draw_color(*SOFT_GOLD)
    pdf.set_line_width(1.2)
    pdf.line(60, 130, 150, 130)
    pdf.set_y(140)
    pdf.set_font("Helvetica", "B", 36)
    pdf.set_text_color(*SOFT_GOLD)
    pdf.cell(0, 20, "Annexes", align="C", new_x="LMARGIN", new_y="NEXT")
    pdf.set_draw_color(*SOFT_GOLD)
    pdf.line(60, 170, 150, 170)
    pdf.is_chapter_sep = False

    # Annexe A
    pdf.add_page()
    pdf.big_title("Annexes")

    pdf.h2("Annexe A : Structure globale du code source")
    pdf.p("L'arborescence du projet illustre la separation des preoccupations entre le frontend et le backend :")
    struct = [
        "pfe-antique-marketplace/",
        "  frontend/",
        "    src/",
        "      App.tsx              -- Page d'accueil, routage principal",
        "      ArtifactDetailPage.tsx -- Detail produit avec galerie",
        "      api.ts               -- Configuration Axios, appels API",
        "      auth.tsx             -- Contexte d'authentification JWT",
        "      buyer.tsx            -- Dashboard acheteur/collectionneur",
        "      seller.tsx           -- Dashboard vendeur",
        "      admin.tsx            -- Dashboard administrateur",
        "      account.tsx          -- Page profil et parametres",
        "      types.ts             -- Types et interfaces TypeScript",
        "      index.css            -- Styles globaux et design system",
        "    public/                -- Assets statiques (images, icones)",
        "    package.json           -- Dependances frontend",
        "    vite.config.ts         -- Configuration Vite",
        "  backend/",
        "    config/                -- Settings Django, URLs racine",
        "    marketplace/",
        "      models.py            -- Modeles de données (Artifact, Order..)",
        "      views.py             -- Vues API (ViewSets, actions)",
        "      serializers.py       -- Serializers DRF (validation)",
        "      urls.py              -- Routage API REST",
        "      permissions.py       -- Classes de permissions RBAC",
        "    users/",
        "      models.py            -- UserProfile, rôles",
        "      views.py             -- Authentification, profil",
        "    manage.py              -- Django management command",
        "    requirements.txt       -- Dependances Python",
    ]
    pdf.set_font("Courier", "", 8)
    pdf.set_text_color(*BODY_TEXT)
    for line in struct:
        pdf.cell(0, 4.5, line, new_x="LMARGIN", new_y="NEXT")
    pdf.ln(5)

    # Annexe B
    pdf.h2("Annexe B : Guide d'installation rapide")
    pdf.p("Pour deployer la plateforme en environnement de développément local, suivez les étapes suivantes :")
    pdf.h3("Backend (Django)", add_toc=False)
    cmds_backend = [
        "cd backend",
        "python -m venv venv",
        "source venv/Scripts/activate    # Windows",
        "# ou : source venv/bin/activate # Linux/Mac",
        "pip install -r requirements.txt",
        "python manage.py migrate",
        "python manage.py createsuperuser  # Creer un admin",
        "python manage.py runserver 127.0.0.1:8000",
    ]
    pdf.set_font("Courier", "", 8.5)
    pdf.set_text_color(*BODY_TEXT)
    for line in cmds_backend:
        pdf.cell(0, 5, line, new_x="LMARGIN", new_y="NEXT")
    pdf.ln(3)

    pdf.h3("Frontend (React)", add_toc=False)
    cmds_frontend = [
        "cd frontend",
        "npm install",
        "npm run dev",
        "# L'application est accèssible sur http://localhost:5173",
    ]
    pdf.set_font("Courier", "", 8.5)
    pdf.set_text_color(*BODY_TEXT)
    for line in cmds_frontend:
        pdf.cell(0, 5, line, new_x="LMARGIN", new_y="NEXT")
    pdf.ln(5)

    # Annexe C - Additional screenshot placeholders
    pdf.h2("Annexe C : Captures d'ecran complementaires")
    pdf.p("Cette annexe regroupe des captures d'ecran additionnelles illustrant diverses fonctionnalites et etats de la plateforme Artisan's Echo. Ces captures viennent completer les illustrations presentees dans le corps du rapport.")

    pdf.h3("Interface responsive sur mobile", add_toc=False)
    pdf.p("La plateforme Artisan's Echo est entierement responsive et s'adapte aux ecrans de smartphones et tablettes. Les elements de navigation se transforment en menu hamburger, les grilles de produits passent en colonne unique, et les tableaux de bord conservent leur lisibilite.")

    # Add a few more placeholders for annexes
    pdf.insert_diagram(r"c:\Users\boura\ouissal\pfe-antique-marketplace-1\docs\screenshots\mobile_home.png", "Figure A.1",
        "Vue responsive - Catalogue sur mobile",
        description_after="Le catalogue s'adapte aux petits ecrans en passant d'une grille multi-colonnes a une colonne unique, preservant la qualite visuelle des images.")

    pdf.insert_diagram(r"c:\Users\boura\ouissal\pfe-antique-marketplace-1\docs\screenshots\mobile_dashboard.png", "Figure A.2",
        "Vue responsive - Dashboard sur tablette",
        description_after="Les tableaux de bord conservent leur fonctionnalite complete sur tablette, avec une reorganisation intelligente des panneaux et des metriques.")


    # ═══════════════════════════════════════════════════════════
    #  OUTPUT
    # ═══════════════════════════════════════════════════════════

    
    
    # --- Back Cover / Remerciements Finaux ---
    pdf.add_page()
    pdf.is_chapter_sep = True # Disable footer
    
    # Let's add a nice background color rectangle to make it look like a cover
    pdf.set_fill_color(250, 250, 250) # Very light grey/white
    pdf.rect(0, 0, 210, 297, 'F')
    
    pdf.set_y(60)
    
    # Logo
    pdf.image(LOGO, x=(210 - 50) / 2, w=50)
    pdf.ln(40)
    
    # Title
    pdf.set_font("Helvetica", "B", 32)
    pdf.set_text_color(*SOFT_GOLD)
    pdf.cell(0, 15, "Artisan's Echo", align="C", border=0)
    pdf.ln(12)
    
    pdf.set_font("Helvetica", "I", 16)
    pdf.set_text_color(*ROYAL_BLUE)
    pdf.cell(0, 10, "Marketplace Premium d'Antiquités", align="C")
    pdf.ln(25)
    
    # Subtle line
    pdf.set_draw_color(*SOFT_GOLD)
    pdf.set_line_width(0.5)
    pdf.line(60, pdf.get_y(), 150, pdf.get_y())
    pdf.ln(25)
    
    # Text
    pdf.set_font("Helvetica", "", 13)
    pdf.set_text_color(*DARK_GREY)
    final_text = (
        "La réalisation de ce projet de fin d'études n'aurait pas été possible sans l'accompagnement "
        "précieux et les conseils avisés de mon encadrant, M. Ait Ben Hamou Khalid.\n\n"
        "Je tiens à lui exprimer ma plus profonde gratitude pour sa disponibilité, "
        "son soutien continu et son expertise qui m'ont guidé tout au long de ce parcours.\n\n"
        "Un grand merci également à l'établissement Racine pour la qualité de sa formation. "
        "Ce projet représente l'aboutissement d'un apprentissage rigoureux et passionnant."
    )
    
    pdf.set_x(25)
    pdf.multi_cell(160, 8, final_text, align="C")
    
    pdf.ln(40)
    
    pdf.set_font("Helvetica", "B", 11)
    pdf.set_text_color(*MID_GREY)
    pdf.cell(0, 10, "AIT OUAHMAN OUISSAL - Promotion 2025/2026", align="C")
    
    pdf.output(OUTPUT_PDF)


    pages = pdf.page_no()
    figs = len(pdf._fig_entries)
    tbls = len(pdf._tbl_entries)
    print(f"PDF genere avec succes : {OUTPUT_PDF}")
    print(f"Nombre de pages : {pages}")
    print(f"Nombre de figures : {figs}")
    print(f"Nombre de tableaux : {tbls}")
    if pages < 45:
        print(f"ATTENTION : Le PDF fait {pages} pages, objectif 45-50.")
    elif pages > 50:
        print(f"ATTENTION : Le PDF fait {pages} pages, objectif 45-50.")
    else:
        print(f"OK : Le PDF est dans la fourchette cible (45-50 pages).")
    return pages


if __name__ == "__main__":
    build_report()
