#!/usr/bin/env python3
"""Generate books-en.tex / books-fr.tex from the book JSON data.

Compile with tectonic (XeTeX) from the repository root, e.g.:
    .tools/tectonic books/books-en.tex
"""
import json
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent

# ----------------------------------------------------------------------------
# LaTeX escaping
# ----------------------------------------------------------------------------
def esc(s: str) -> str:
    s = s.replace("\\", r"\textbackslash{}")
    for a, b in [
        ("{", r"\{"),
        ("}", r"\}"),
        ("$", r"\$"),
        ("&", r"\&"),
        ("#", r"\#"),
        ("_", r"\_"),
        ("%", r"\%"),
        ("~", r"\textasciitilde{}"),
        ("^", r"\textasciicircum{}"),
        ("·", r"\textperiodcentered{}"),
    ]:
        s = s.replace(a, b)
    return s


PREAMBLE = r"""% !TEX program = xelatex
\documentclass[10pt]{article}

\usepackage[a4paper,top=13mm,bottom=13mm,left=14mm,right=14mm,footskip=9mm]{geometry}
\usepackage{xcolor}
\usepackage{fontspec}
\usepackage{graphicx}
\usepackage{fancyhdr}
\usepackage{microtype}
\usepackage{longtable}
\usepackage{array}
\usepackage{mdframed}
\usepackage{polyglossia}
\setmainlanguage{LANG}

% ---------- palette (light forest) ----------
\definecolor{ink}{HTML}{1D211C}
\definecolor{inksoft}{HTML}{484E45}
\definecolor{inkmuted}{HTML}{818A7C}
\definecolor{inkfaint}{HTML}{AEB5A3}
\definecolor{rule}{HTML}{E6E7DE}
\definecolor{rulestrong}{HTML}{D4D8C8}
\definecolor{forest}{HTML}{42584A}
\definecolor{paper}{HTML}{FAF9F4}

\pagecolor{paper}
\color{ink}

% ---------- fonts (static instances) ----------
\setmainfont{Inter-Regular.ttf}[Path=../assets/fonts/static/, BoldFont=Inter-SemiBold.ttf]
\newfontfamily\fraunces{Fraunces-SemiBold.ttf}[Path=../assets/fonts/static/]
\newfontfamily\frauncesit{Fraunces-Italic.ttf}[Path=../assets/fonts/static/]

% ---------- layout ----------
\pagestyle{fancy}
\fancyhf{}
\renewcommand{\headrulewidth}{0pt}
\renewcommand{\footrulewidth}{0pt}
\fancyfoot[R]{\footnotesize\color{inkfaint}\thepage}
\setlength{\parindent}{0pt}
\setlength{\parskip}{0pt}
\emergencystretch=2em
\graphicspath{{../assets/images/books/}}

% ---------- longtable 2-column grid ----------
\newcolumntype{L}{>{\raggedright\arraybackslash}p{88mm}}
\setlength{\tabcolsep}{0pt}
\setlength{\LTleft}{0pt}
\setlength{\LTright}{0pt}

% ---------- prologue box (left rule, auto height) ----------
\newmdenv[hidealllines=true,leftline=true,linecolor=forest,linewidth=0.6pt,
  innertopmargin=0pt,innerbottommargin=0pt,innerrightmargin=0pt,
  innerleftmargin=6mm,leftmargin=0pt,rightmargin=0pt]{prologuebox}

% ---------- track header (kept with following row via \\*) ----------
\newcommand{\trackheader}[2]{%
  \footnotesize\bfseries\color{forest}#1\hspace{1.5em}{\color{ink}\MakeUppercase{#2}}%
}

% ---------- one book entry ----------
\NewDocumentCommand{\bookentry}{ m m m m m m m m m }{%
  \begin{minipage}[t]{13mm}\centering
    \includegraphics[width=12mm]{#1}\par\vspace{1.5mm}
    {\footnotesize\color{forest}\bfseries #2}%
  \end{minipage}\hspace{4mm}%
  \begin{minipage}[t]{\dimexpr\linewidth-17mm\relax}
    \raggedright
    {\large\fraunces #3}\par\vspace{1.5mm}
    {\footnotesize\color{inkmuted}\MakeUppercase{#4}\,\textcolor{inkfaint}{\,\textperiodcentered\ \MakeUppercase{#5}}}\par\vspace{1.5mm}
    {\footnotesize\color{inkmuted}{\scriptsize\color{forest}\bfseries\MakeUppercase{#6}\ }#7}\par\vspace{1.5mm}
    {\small\color{inksoft}#8}\par\vspace{1.5mm}
    {\small\frauncesit\color{ink}{\color{forest}\textemdash}\ #9}\par
  \end{minipage}%
  \par\vspace{3pt}\textcolor{rule}{\rule{\linewidth}{0.4pt}}%
}

\begin{document}

% ===================== masthead =====================
\noindent
{\footnotesize\bfseries\color{inkmuted}\MakeUppercase{TAG}\hfill{\mdseries\color{inkfaint}LOCATION}}\par\vspace{4mm}
{\huge\fraunces\color{ink}TITLE}\par\vspace{4mm}
\begin{prologuebox}
  {\small\frauncesit\color{inksoft}PROLOGUE}\par\vspace{2mm}
  {\footnotesize\color{inkfaint}PROLOGUEAUTHOR}
\end{prologuebox}\par\vspace{4mm}
\par\vspace{1mm}\textcolor{rulestrong}{\rule{\linewidth}{0.5pt}}\par\vspace{4mm}

% ===================== tracks =====================
\begin{longtable}{@{}L@{\hspace{6mm}}L@{}}
ROWS
\end{longtable}

% ===================== colophon =====================
\vspace{5mm}
\par\vspace{1mm}\textcolor{rulestrong}{\rule{\linewidth}{0.5pt}}\par\vspace{3mm}
\noindent
{\footnotesize\color{inkfaint}\MakeUppercase{COLOPHONLEFT}\hfill\MakeUppercase{COLOPHONRIGHT}}\par

\end{document}
"""


def build_rows(data: dict) -> str:
    lines = []
    for track in data["tracks"]:
        header = (
            "\\multicolumn{2}{@{}p{\\textwidth}@{}}{"
            f"\\trackheader{{{esc(track['num'])}}}{{{esc(track['title'])}}}"
            "}\\\\*[2mm]"
        )
        lines.append(header)
        books = track["books"]
        i = 0
        while i < len(books):
            left = books[i]
            right = books[i + 1] if i + 1 < len(books) else None
            cells = [_book_cell(left)]
            if right is not None:
                cells.append(_book_cell(right))
            else:
                cells.append("")
            lines.append(" & ".join(cells) + r"\\[2mm]")
            i += 2
    return "\n".join(lines)


def _book_cell(b: dict) -> str:
    args = [
        esc(b["cover"]),
        esc(b["num"]),
        esc(b["title"]),
        esc(f"{b['author']} ({b['year']})"),
        esc(b["genre"]),
        esc(b["scenario_label"]),
        esc(b["scenario"]),
        esc(b["verdict"]),
        esc(b["takeaway"]),
    ]
    return "\\bookentry{" + "}{".join(args) + "}"


def build_tex(data: dict) -> str:
    lang = "french" if data["lang"] == "fr" else "english"
    tex = PREAMBLE.replace("LANG", lang)
    tex = tex.replace("TAG", esc(data["masthead_tag"]))
    tex = tex.replace("LOCATION", esc(data["masthead_location"]))
    tex = tex.replace("TITLE", esc(data["masthead_title"]))
    tex = tex.replace("PROLOGUEAUTHOR", esc(data["prologue_author"]))
    tex = tex.replace("PROLOGUE", esc(data["prologue"]))
    tex = tex.replace("COLOPHONLEFT", esc(data["colophon_left"]))
    tex = tex.replace("COLOPHONRIGHT", esc(data["colophon_right"]))
    tex = tex.replace("ROWS", build_rows(data))
    return tex


for lang in ("en", "fr"):
    data = json.loads((ROOT / f"books-{lang}.json").read_text(encoding="utf-8"))
    tex = build_tex(data)
    out = ROOT / f"books-{lang}.tex"
    out.write_text(tex, encoding="utf-8")
    print(f"wrote {out.name} ({len(tex)} bytes, {sum(len(t['books']) for t in data['tracks'])} books)")
