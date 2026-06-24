/**
 * Genera documentación para inversores: DOCX + PDF
 * Uso: node docs/inversor/generate-inversor-docs.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  ShadingType,
  Header,
  Footer,
  PageNumber,
  NumberFormat,
  ImageRun,
} from "docx";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = __dirname;

const BRAND = {
  primary: "1D4ED8",
  primaryDark: "1E3A8A",
  accent: "0891B2",
  light: "EFF6FF",
  text: "1E293B",
  muted: "64748B",
};

function heading(text, level = HeadingLevel.HEADING_1) {
  return new Paragraph({
    heading: level,
    spacing: { before: level === HeadingLevel.HEADING_1 ? 400 : 280, after: 160 },
    children: [
      new TextRun({
        text,
        bold: true,
        color: level === HeadingLevel.HEADING_1 ? BRAND.primaryDark : BRAND.primary,
        size: level === HeadingLevel.HEADING_1 ? 36 : level === HeadingLevel.HEADING_2 ? 28 : 24,
      }),
    ],
  });
}

function body(text, opts = {}) {
  return new Paragraph({
    spacing: { after: 140, line: 360 },
    children: [
      new TextRun({
        text,
        size: 22,
        color: BRAND.text,
        bold: opts.bold,
        italics: opts.italics,
      }),
    ],
  });
}

function bullet(text, level = 0) {
  return new Paragraph({
    bullet: { level },
    spacing: { after: 80, line: 340 },
    children: [new TextRun({ text, size: 22, color: BRAND.text })],
  });
}

const ARCH_IMAGE = path.join(OUT_DIR, "assets", "arch-diagrama.jpg");

function archImage() {
  if (!fs.existsSync(ARCH_IMAGE)) return new Paragraph({});
  // Imagen 840x1024 → escalada a ancho ~440px conservando proporción.
  const w = 440;
  const h = Math.round((1024 / 840) * w);
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 160, after: 80 },
    children: [
      new ImageRun({
        type: "jpg",
        data: fs.readFileSync(ARCH_IMAGE),
        transformation: { width: w, height: h },
      }),
    ],
  });
}

function caption(text) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 200 },
    children: [new TextRun({ text, size: 16, color: BRAND.muted, italics: true })],
  });
}

function kvLabel(text) {
  return new TextRun({ text, bold: true, color: BRAND.primaryDark, size: 22 });
}

// ─── Proyección financiera ───────────────────────────────────────────────────
const ARPU = 22.5; // Promedio S/ mes (mix primaria S/20 + secundaria S/25)

/** Hitos trimestrales: crecimiento gradual alineado al calendario escolar peruano */
const FINANCIAL_PROJECTION = [
  {
    period: "Jun 2026 (actual)",
    premium: 25,
    note: "Base actual · 25 premium activos",
    expenses: { payroll: 5000, infra: 400, marketing: 300, other: 200 },
  },
  {
    period: "Sep 2026",
    premium: 75,
    note: "Inicio año escolar · conversión registrados",
    expenses: { payroll: 5000, infra: 550, marketing: 900, other: 200 },
  },
  {
    period: "Dic 2026",
    premium: 170,
    note: "Vacaciones · foco retención y producto",
    expenses: { payroll: 5000, infra: 800, marketing: 500, other: 250 },
  },
  {
    period: "Mar 2027 (9 meses)",
    premium: 500,
    note: "Meta 9 meses · pico inicio de clases",
    expenses: { payroll: 5500, infra: 1500, marketing: 2200, other: 300 },
  },
  {
    period: "Jun 2027",
    premium: 580,
    note: "Consolidación post-pico",
    expenses: { payroll: 6000, infra: 1800, marketing: 1200, other: 300 },
  },
  {
    period: "Sep 2027",
    premium: 665,
    note: "Segundo impulso del año escolar",
    expenses: { payroll: 6000, infra: 2100, marketing: 1600, other: 350 },
  },
  {
    period: "Dic 2027 (18 meses)",
    premium: 780,
    note: "Meta 18 meses · rango 700–800",
    expenses: { payroll: 6000, infra: 2500, marketing: 1200, other: 400 },
  },
];

function mrr(premium) {
  return Math.round(premium * ARPU);
}

function totalExpenses(e) {
  return e.payroll + e.infra + e.marketing + e.other;
}

function fmtSoles(n) {
  const sign = n < 0 ? "−" : "";
  return `${sign}S/ ${Math.abs(n).toLocaleString("es-PE")}`;
}

function buildFinancialTableDocx() {
  const header = (text) =>
    new TableCell({
      shading: { fill: BRAND.primaryDark, type: ShadingType.CLEAR },
      children: [new Paragraph({ children: [new TextRun({ text, bold: true, color: "FFFFFF", size: 18 })] })],
    });

  const cell = (text, bold = false) =>
    new TableCell({
      children: [new Paragraph({ children: [new TextRun({ text, size: 18, bold })] })],
    });

  const rows = [
    new TableRow({
      tableHeader: true,
      children: [
        header("Periodo"),
        header("Premium"),
        header("MRR"),
        header("Gastos/mes"),
        header("Resultado/mes"),
      ],
    }),
    ...FINANCIAL_PROJECTION.map((row) => {
      const income = mrr(row.premium);
      const costs = totalExpenses(row.expenses);
      const net = income - costs;
      const highlight = row.premium >= 500;
      return new TableRow({
        children: [
          new TableCell({
            shading: highlight ? { fill: BRAND.light, type: ShadingType.CLEAR } : undefined,
            children: [
              new Paragraph({ children: [new TextRun({ text: row.period, size: 18, bold: highlight })] }),
              new Paragraph({ children: [new TextRun({ text: row.note, size: 14, color: BRAND.muted, italics: true })] }),
            ],
          }),
          cell(String(row.premium), highlight),
          cell(fmtSoles(income), highlight),
          cell(fmtSoles(costs)),
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: fmtSoles(net),
                    size: 18,
                    bold: true,
                    color: net >= 0 ? "059669" : "DC2626",
                  }),
                ],
              }),
            ],
          }),
        ],
      });
    }),
  ];

  return new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows });
}

function buildExpenseBreakdownDocx() {
  const header = (text) =>
    new TableCell({
      shading: { fill: BRAND.primary, type: ShadingType.CLEAR },
      children: [new Paragraph({ children: [new TextRun({ text, bold: true, color: "FFFFFF", size: 18 })] })],
    });

  const cell = (text) =>
    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text, size: 18 })] })] });

  const cellBold = (text) =>
    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text, size: 18, bold: true })] })] });

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        tableHeader: true,
        children: [header("Rubro de gasto"), header("Meses 1–6"), header("Meses 7–9"), header("Meses 10–18")],
      }),
      ...[
        ["Nómina fundadores (2 pers.)", "S/ 5.000", "S/ 5.500", "S/ 6.000"],
        ["Infra AWS + APIs Gemini", "S/ 400 – 800", "S/ 1.200 – 1.800", "S/ 1.800 – 2.500"],
        ["Marketing y adquisición", "S/ 300 – 900", "S/ 1.500 – 2.200", "S/ 1.200 – 1.600"],
        ["Herramientas, legal, otros", "S/ 200 – 250", "S/ 300", "S/ 350 – 400"],
      ].map(([rubro, m1, m2, m3]) => new TableRow({ children: [cell(rubro), cell(m1), cell(m2), cell(m3)] })),
      new TableRow({
        children: [
          cellBold("Total estimado / mes"),
          cellBold("S/ 5.900 – 6.950"),
          cellBold("S/ 8.500 – 9.800"),
          cellBold("S/ 9.350 – 10.500"),
        ],
      }),
    ],
  });
}

function buildFinancialHtmlTable() {
  const rows = FINANCIAL_PROJECTION.map((row) => {
    const income = mrr(row.premium);
    const costs = totalExpenses(row.expenses);
    const net = income - costs;
    const cls = row.premium >= 500 ? ' class="milestone"' : "";
    const netCls = net >= 0 ? "pos" : "neg";
    return `<tr${cls}>
      <td><strong>${row.period}</strong><br><span class="row-note">${row.note}</span></td>
      <td>${row.premium}</td>
      <td>${fmtSoles(income)}</td>
      <td>${fmtSoles(costs)}</td>
      <td class="${netCls}">${fmtSoles(net)}</td>
    </tr>`;
  }).join("\n");

  const m9 = FINANCIAL_PROJECTION.find((r) => r.premium === 500);
  const m18 = FINANCIAL_PROJECTION.find((r) => r.premium === 780);
  const arr18 = mrr(m18.premium) * 12;

  return `
    <p class="fin-intro">Proyección conservadora con ticket promedio de <strong>S/ ${ARPU}/mes</strong> por usuario premium. Crecimiento gradual alineado al calendario escolar peruano (picos en marzo y agosto–noviembre).</p>
    <table class="fin-table">
      <tr>
        <th>Periodo</th><th>Premium</th><th>Ingresos (MRR)</th><th>Gastos/mes</th><th>Resultado/mes</th>
      </tr>
      ${rows}
    </table>
    <div class="fin-summary">
      <div class="fin-kpi"><span class="fin-kpi-val">${m9.premium}</span><span class="fin-kpi-lbl">Premium a 9 meses (Mar 2027)</span></div>
      <div class="fin-kpi"><span class="fin-kpi-val">${fmtSoles(mrr(m9.premium))}</span><span class="fin-kpi-lbl">MRR mes 9</span></div>
      <div class="fin-kpi"><span class="fin-kpi-val">${m18.premium}</span><span class="fin-kpi-lbl">Premium a 18 meses (Dic 2027)</span></div>
      <div class="fin-kpi"><span class="fin-kpi-val">${fmtSoles(arr18)}</span><span class="fin-kpi-lbl">ARR proyectado (mes 18 × 12)</span></div>
    </div>
    <h3>Desglose de gastos operativos</h3>
    <table class="fin-table">
      <tr><th>Rubro</th><th>Meses 1–6</th><th>Meses 7–9</th><th>Meses 10–18</th></tr>
      <tr><td>Nómina fundadores (2 pers.)</td><td>S/ 5.000</td><td>S/ 5.500</td><td>S/ 6.000</td></tr>
      <tr><td>Infra AWS + APIs Gemini</td><td>S/ 400 – 800</td><td>S/ 1.200 – 1.800</td><td>S/ 1.800 – 2.500</td></tr>
      <tr><td>Marketing y adquisición</td><td>S/ 300 – 900</td><td>S/ 1.500 – 2.200</td><td>S/ 1.200 – 1.600</td></tr>
      <tr><td>Herramientas, legal, otros</td><td>S/ 200 – 250</td><td>S/ 300</td><td>S/ 350 – 400</td></tr>
      <tr class="milestone"><td><strong>Total / mes</strong></td><td><strong>S/ 5.900 – 6.950</strong></td><td><strong>S/ 8.500 – 9.800</strong></td><td><strong>S/ 9.350 – 10.500</strong></td></tr>
    </table>
    <p class="note">Meses 1–9 financiados con la ronda de S/ 60.000. A partir del mes 9–10 los ingresos recurrentes empiezan a cubrir parte significativa de la operación; al mes 18 el margen operativo mensual estimado supera S/ 6.500.</p>`;
}

function financialProjectionDocxBlocks() {
  const m9 = FINANCIAL_PROJECTION.find((r) => r.premium === 500);
  const m18 = FINANCIAL_PROJECTION.find((r) => r.premium === 780);
  return [
    heading("11. Proyección financiera", HeadingLevel.HEADING_2),
    body(
      `Proyección conservadora con ticket promedio de S/ ${ARPU}/mes por usuario premium (mix primaria S/ 20 y secundaria S/ 25). El crecimiento es gradual y sigue el calendario escolar peruano: picos en marzo (inicio de clases) y segundo semestre (agosto–noviembre).`
    ),
    buildFinancialTableDocx(),
    new Paragraph({ spacing: { before: 200 } }),
    body(
      `Hitos clave: ${m9.premium} usuarios premium y MRR de ${fmtSoles(mrr(m9.premium))} al mes 9 (marzo 2027). ${m18.premium} usuarios premium y ARR proyectado de ${fmtSoles(mrr(m18.premium) * 12)} al mes 18 (diciembre 2027).`
    ),
    heading("Desglose de gastos operativos", HeadingLevel.HEADING_3),
    buildExpenseBreakdownDocx(),
    new Paragraph({ spacing: { before: 160 } }),
    body("Supuestos de gastos:"),
    bullet("Nómina: S/ 2.500 c/u (meses 1–6), S/ 2.750 c/u (meses 7–9), S/ 3.000 c/u (meses 10–18)."),
    bullet("Infraestructura: escala con volumen de usuarios (AWS EC2/S3, APIs Gemini, Auth0, Mercado Pago)."),
    bullet("Marketing: concentrado en febrero–marzo y agosto–octubre (temporadas de mayor demanda docente)."),
    bullet("Meses 1–9 cubiertos por la ronda de S/ 60.000; a partir del mes 9–10 los ingresos empiezan a financiar la operación."),
    body(
      `Punto de equilibrio operativo estimado: mes 8–9 (${m9.premium} premium, MRR ~${fmtSoles(mrr(m9.premium))} vs. gastos ~${fmtSoles(totalExpenses(m9.expenses))}/mes). Margen mensual al mes 18: ~${fmtSoles(mrr(m18.premium) - totalExpenses(m18.expenses))}.`
    ),
  ];
}

function statCell(label, value, highlight = false) {
  return new TableCell({
    shading: highlight
      ? { fill: BRAND.primary, type: ShadingType.CLEAR }
      : { fill: BRAND.light, type: ShadingType.CLEAR },
    margins: { top: 120, bottom: 120, left: 160, right: 160 },
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: value,
            bold: true,
            size: 32,
            color: highlight ? "FFFFFF" : BRAND.primaryDark,
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: label,
            size: 18,
            color: highlight ? "E0E7FF" : BRAND.muted,
          }),
        ],
      }),
    ],
  });
}

function buildDocx() {
  const doc = new Document({
    creator: "Docente Pro",
    title: "Docente Pro — Documentación para Inversores",
    description: "Resumen ejecutivo y visión técnica del producto SaaS",
    styles: {
      default: {
        document: {
          run: { font: "Calibri", size: 22 },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: { top: 900, right: 1000, bottom: 900, left: 1000 },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: "Docente Pro · Documento confidencial",
                    size: 16,
                    color: BRAND.muted,
                    italics: true,
                  }),
                ],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: "Página ", size: 16, color: BRAND.muted }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    size: 16,
                    color: BRAND.muted,
                  }),
                ],
              }),
            ],
          }),
        },
        children: [
          // Portada
          new Paragraph({ spacing: { before: 800 } }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "DOCENTE PRO",
                bold: true,
                size: 56,
                color: BRAND.primaryDark,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
            children: [
              new TextRun({
                text: "Planificación docente con Inteligencia Artificial",
                size: 28,
                color: BRAND.accent,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
            children: [
              new TextRun({
                text: "Documentación para inversores · Resumen ejecutivo y visión técnica",
                size: 22,
                color: BRAND.muted,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 600 },
            children: [
              new TextRun({
                text: "Junio 2026 · Confidencial",
                size: 20,
                color: BRAND.muted,
                italics: true,
              }),
            ],
          }),

          // Stats
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.NONE },
              bottom: { style: BorderStyle.NONE },
              left: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE },
              insideHorizontal: { style: BorderStyle.NONE },
              insideVertical: { style: BorderStyle.NONE },
            },
            rows: [
              new TableRow({
                children: [
                  statCell("Usuarios registrados", "440+"),
                  statCell("Usuarios premium", "25"),
                  statCell("Modelo", "SaaS B2C", true),
                ],
              }),
            ],
          }),

          new Paragraph({ spacing: { before: 400 } }),
          heading("1. Resumen ejecutivo"),
          body(
            "Docente Pro es una plataforma SaaS diseñada para docentes peruanos de educación básica (primaria y secundaria). Utiliza inteligencia artificial para generar sesiones de aprendizaje, unidades curriculares, evaluaciones y recursos didácticos alineados al Currículo Nacional de Educación Básica (CNEB / Currículo Nacional 2016)."
          ),
          body(
            "El problema que resolvemos es claro: los docentes invierten entre 8 y 15 horas semanales en planificación, documentación y evaluación. Docente Pro reduce ese tiempo a minutos, manteniendo la calidad pedagógica y el cumplimiento normativo exigido por el MINEDU."
          ),
          body(
            "Operamos con un modelo freemium: registro gratuito con funciones limitadas y suscripción premium mensual (S/ 20 primaria · S/ 25 secundaria · planes equipo desde S/ 30)."
          ),

          heading("2. Problema y oportunidad", HeadingLevel.HEADING_2),
          bullet("Más de 350.000 docentes en educación básica regular en Perú requieren planificar por competencias y capacidades."),
          bullet("La planificación manual es repetitiva, consume fines de semana y genera estrés docente."),
          bullet("Las herramientas genéricas (Word, ChatGPT sin contexto) no están alineadas al CNEB ni generan documentos listos para usar."),
          bullet("Docente Pro combina IA especializada + plantillas oficiales + exportación PDF profesional."),

          heading("3. Propuesta de valor", HeadingLevel.HEADING_2),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                tableHeader: true,
                children: [
                  new TableCell({
                    shading: { fill: BRAND.primaryDark, type: ShadingType.CLEAR },
                    children: [new Paragraph({ children: [new TextRun({ text: "Para el docente", bold: true, color: "FFFFFF", size: 20 })] })],
                  }),
                  new TableCell({
                    shading: { fill: BRAND.primaryDark, type: ShadingType.CLEAR },
                    children: [new Paragraph({ children: [new TextRun({ text: "Beneficio", bold: true, color: "FFFFFF", size: 20 })] })],
                  }),
                ],
              }),
              ...[
                ["Ahorro de tiempo", "Sesiones completas en minutos vs. horas de trabajo manual"],
                ["Cumplimiento normativo", "Contenido alineado al CNEB, competencias y capacidades"],
                ["Documentos listos", "Exportación a PDF con formato profesional para entregar o imprimir"],
                ["Recursos visuales", "Gráficos educativos y material didáctico generado automáticamente"],
                ["Evaluación integrada", "Rúbricas e instrumentos de evaluación coherentes con la sesión"],
              ].map(
                ([a, b]) =>
                  new TableRow({
                    children: [
                      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: a, size: 20 })] })] }),
                      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: b, size: 20 })] })] }),
                    ],
                  })
              ),
            ],
          }),

          heading("4. Producto — Módulos principales", HeadingLevel.HEADING_2),
          heading("4.1 Sesiones de aprendizaje", HeadingLevel.HEADING_3),
          body(
            "Generación asistida por IA de sesiones completas con secuencia didáctica (Inicio, Desarrollo, Cierre), propósitos, competencias, criterios de evaluación y reflexiones. Soporta múltiples áreas curriculares con interfaces especializadas por materia."
          ),
          heading("4.2 Unidades de aprendizaje", HeadingLevel.HEADING_3),
          body(
            "Creación de unidades semanales o por periodo, vinculadas a problemáticas del aula, estándares de aprendizaje y sesiones complementarias. Disponible en planes premium."
          ),
          heading("4.3 Evaluaciones y rúbricas", HeadingLevel.HEADING_3),
          body(
            "Generación automática de instrumentos de evaluación alineados a los criterios de la sesión, incluyendo rúbricas de desempeño por niveles."
          ),
          heading("4.4 Gráficos educativos", HeadingLevel.HEADING_3),
          body(
            "Biblioteca de recursos visuales interactivos (tablas, diagramas, fichas, gráficos matemáticos) integrados en las sesiones para enriquecer el material didáctico."
          ),
          heading("4.5 Fichas y recursos de aplicación", HeadingLevel.HEADING_3),
          body(
            "Fichas de trabajo y aplicación para estudiantes, generadas a partir del contenido de la sesión y exportables a PDF."
          ),
          heading("4.6 Panel administrativo", HeadingLevel.HEADING_3),
          body(
            "Backoffice interno para gestión de usuarios, pagos, suscripciones y soporte operativo del producto."
          ),

          heading("5. Modelo de negocio", HeadingLevel.HEADING_2),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                tableHeader: true,
                children: ["Plan", "Precio", "Público"].map(
                  (t) =>
                    new TableCell({
                      shading: { fill: BRAND.primary, type: ShadingType.CLEAR },
                      children: [new Paragraph({ children: [new TextRun({ text: t, bold: true, color: "FFFFFF", size: 20 })] })],
                    })
                ),
              }),
              ...[
                ["Personal Primaria", "S/ 20 / mes", "Docente de primaria"],
                ["Personal Secundaria", "S/ 25 / mes", "Docente de secundaria"],
                ["Equipo", "S/ 30 / mes", "Docente + 1 colaborador"],
              ].map(
                ([plan, precio, publico]) =>
                  new TableRow({
                    children: [plan, precio, publico].map(
                      (t) => new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: t, size: 20 })] })] })
                    ),
                  })
              ),
            ],
          }),
          new Paragraph({ spacing: { before: 160 } }),
          body("Ingresos recurrentes actuales (MRR estimado): ~S/ 550 – 625 / mes (25 usuarios premium)."),
          body("Estacionalidad: mayor demanda en inicio de año escolar (marzo–abril) y segundo semestre (agosto–noviembre)."),

          heading("6. Tracción y métricas", HeadingLevel.HEADING_2),
          bullet("440+ usuarios registrados en la plataforma."),
          bullet("25 suscriptores premium activos."),
          bullet("Conversión free → premium: ~5,7%."),
          bullet("Producto en producción con flujo de pago integrado (Mercado Pago)."),
          bullet("Crecimiento orgánico vía comunidades docentes y referidos."),

          heading("7. Arquitectura técnica", HeadingLevel.HEADING_2),
          body(
            "Docente Pro está construido como un sistema de microservicios desacoplados: un frontend SPA, un backend orquestador en Node.js y un microservicio de Inteligencia Artificial en Python (RAG). Todo desplegado en AWS con contenedores Docker, diseñado para escalar horizontalmente conforme crece la base de usuarios."
          ),

          heading("7.1 Frontend — Aplicación web (SPA)", HeadingLevel.HEADING_3),
          bullet("React 18 + TypeScript — interfaz robusta, tipada y mantenible."),
          bullet("Vite — build y hot-reload de alta velocidad."),
          bullet("Tailwind CSS + Radix UI — diseño responsive y accesible."),
          bullet("React Query + Zustand — gestión de estado de servidor y caché."),
          bullet("Generación de PDF/Word en cliente y servidor con motor HTML-to-PDF."),
          bullet("Despliegue en CDN con distribución global (CloudFront)."),

          heading("7.2 Backend orquestador — Node.js", HeadingLevel.HEADING_3),
          body(
            "API REST construida con Express + TypeScript, con Prisma como ORM sobre PostgreSQL. Actúa como gateway y orquestador: valida identidad, enriquece el contexto desde la base de datos, coordina las llamadas al motor de IA y persiste los resultados."
          ),
          bullet("Express + TypeScript — API REST con más de 20 grupos de endpoints (/api/unidad, /api/ia, /api/ia-unidad, /api/sesion, /api/pago, /api/usuario, /api/admin, etc.)."),
          bullet("Prisma ORM + PostgreSQL — modelo de datos relacional (usuarios, unidades, sesiones, suscripciones, pagos)."),
          bullet("Orquestación de la IA: arma el contexto curricular y llama al microservicio Python paso a paso."),
          bullet("Gestión de almacenamiento en AWS S3 mediante URLs prefirmadas (PDFs, documentos Word, imágenes)."),

          heading("7.3 Motor de IA — Python (RAG) + Google Gemini", HeadingLevel.HEADING_3),
          body(
            "Microservicio FastAPI que implementa un pipeline RAG (Retrieval-Augmented Generation): recupera contenido curricular oficial del MINEDU y lo usa como contexto para que el modelo genere planificaciones alineadas a la normativa peruana, no respuestas genéricas."
          ),
          bullet("FastAPI (Python) — microservicio asíncrono de generación pedagógica."),
          bullet("Google Gemini 2.5 Pro — generación de tareas complejas (situación significativa, propósitos, secuencia didáctica, sesiones)."),
          bullet("Google Gemini 2.5 Flash — tareas rápidas (títulos, materiales, reflexiones, criterios por actividad) para optimizar costo y latencia."),
          bullet("Gemini 2.5 Flash Image — generación de imágenes educativas (problemas de Matemática y otras áreas)."),
          bullet("LangChain + FAISS — indexación vectorial y recuperación semántica de documentos."),
          bullet("Embeddings configurables (Gemini / OpenAI) sobre el corpus curricular."),
          bullet("Pydantic v2 — contratos de datos validados en cada endpoint (salida JSON estructurada y verificada)."),
          bullet("Concurrencia controlada (semáforo de llamadas) y fallback automático de modelo ante picos de demanda."),

          heading("7.4 Base de conocimiento (RAG / MINEDU)", HeadingLevel.HEADING_3),
          body(
            "El diferencial técnico está en la base de conocimiento curricular. El sistema indexa documentos oficiales y los recupera por relevancia para fundamentar cada generación:"
          ),
          bullet("Currículo Nacional de Educación Básica y Programa Curricular (Resolución 649-2016-MINEDU)."),
          bullet("Cuadernillos, fichas y sesiones modelo del MINEDU para primaria y secundaria, por grado y área."),
          bullet("Estándares de aprendizaje, competencias y capacidades oficiales."),
          bullet("Ingesta automática con deduplicación (hash SHA-256), chunking semántico y filtrado por nivel/área/grado."),

          heading("7.5 Seguridad y autenticación", HeadingLevel.HEADING_3),
          bullet("Auth0 — autenticación enterprise (OAuth 2.0, JWT RS256, login social)."),
          bullet("Control de acceso por roles: usuario free, premium (Subscriber) y administrador."),
          bullet("Validación de tokens vía JWKS; credenciales nunca expuestas en el frontend."),
          bullet("Cifrado de datos sensibles y comunicación HTTPS extremo a extremo."),
          bullet("Área de oportunidad (objetivo de la ronda): auditoría de ciberseguridad, pentesting y hardening de infraestructura — donde el inversor estratégico aporta valor directo."),

          heading("7.6 Pagos y tiempo real", HeadingLevel.HEADING_3),
          bullet("Mercado Pago — checkout y webhooks para suscripciones automáticas."),
          bullet("Pago manual Yape/WhatsApp con confirmación administrativa (realidad del mercado peruano)."),
          bullet("Socket.io — notificaciones en tiempo real: confirmación de pago, activación/expiración de suscripción, conversión de documentos."),
          bullet("Flujo automatizado: pago → webhook → asignación de rol premium en Auth0 → acceso inmediato."),

          heading("7.7 Infraestructura en AWS — actual y escalable", HeadingLevel.HEADING_3),
          body(
            "Hoy operamos una implementación funcional sobre AWS (EC2 + Docker + S3 + CloudFront), con CI/CD automatizado vía GitHub Actions y contenedores en GitHub Container Registry. La arquitectura objetivo está diseñada para escalar horizontalmente con balanceadores de carga, Auto Scaling Groups y base de datos en alta disponibilidad (RDS Multi-AZ):"
          ),
          archImage(),
          caption("Arquitectura AWS: implementación actual (arriba) y arquitectura objetivo escalable (abajo)."),
          bullet("Actual: EC2 (Docker Compose: Node + RAG), PostgreSQL, S3 para documentos generados, CloudFront como CDN."),
          bullet("Objetivo: Application Load Balancer + Auto Scaling Groups para Node y RAG, RDS Multi-AZ en subred privada, S3 + CloudFront para distribución de contenido."),
          bullet("CI/CD: GitHub Actions → build de imágenes → despliegue automatizado en EC2."),

          heading("8. Anatomía de una Sesión de Aprendizaje", HeadingLevel.HEADING_2),
          body(
            "Una sesión generada por Docente Pro no es texto suelto: es un documento estructurado que cumple todas las directrices del MINEDU. El motor de IA produce y valida cada uno de estos componentes:"
          ),
          bullet("Datos generales: área, grado, nivel, duración y docente."),
          bullet("Propósito de aprendizaje: competencia, capacidades, desempeños y estándar (una sola competencia por sesión — regla MINEDU)."),
          bullet("Propósito de la sesión: qué aprenderán, cómo y para qué."),
          bullet("Criterios de evaluación y evidencia de aprendizaje."),
          bullet("Enfoques transversales (máximo 2) con valores y actitudes observables."),
          bullet("Preparación: recursos y materiales (de costo cero, realidad de la escuela pública)."),
          bullet("Secuencia didáctica en tres momentos:"),
          bullet("Inicio — problematización, motivación, saberes previos y propósito.", 1),
          bullet("Desarrollo — gestión y acompañamiento, procesos pedagógicos por área.", 1),
          bullet("Cierre — evaluación, metacognición y reflexión.", 1),
          bullet("Recursos visuales: gráficos educativos y problemas con imágenes (Matemática y otras áreas), validados automáticamente."),
          bullet("Instrumento de evaluación (ej. lista de cotejo) coherente con los criterios."),
          body(
            "Guardrails automáticos: el sistema fuerza una sola competencia, normaliza títulos al formato MINEDU, elimina contenido alucinado, valida los gráficos y reintenta si el JSON sale malformado. Esto garantiza documentos confiables y listos para el aula."
          ),

          heading("9. Anatomía de una Unidad de Aprendizaje", HeadingLevel.HEADING_2),
          body(
            "Una Unidad de Aprendizaje es un documento mayor (varias semanas) que articula múltiples áreas en torno a una problemática. Se genera mediante un flujo secuencial de 8 pasos, donde cada paso acumula el contexto de los anteriores:"
          ),
          bullet("1. Situación significativa — contexto problematizador real del aula."),
          bullet("2. Evidencias — propósito, producto integrador e instrumento de evaluación."),
          bullet("3. Propósitos de aprendizaje — competencias, capacidades, estándares, criterios y actividades por área (incluye competencias transversales)."),
          bullet("4. Áreas complementarias — Tutoría, Plan Lector y otras, vinculadas a la competencia."),
          bullet("5. Enfoques transversales — valores y actitudes observables."),
          bullet("6. Secuencia de actividades — planificador semanal hora por hora, día por día, por área."),
          bullet("7. Materiales y recursos — coherentes con la secuencia."),
          bullet("8. Reflexiones — preguntas de autoevaluación docente."),
          body(
            "El backend Node orquesta estos 8 pasos llamando al motor de IA en orden, alterna modelos Gemini Pro/Flash según la complejidad de cada paso, y persiste el resultado consolidado. El frontend renderiza cada bloque en tablas con el formato oficial, listo para exportar a PDF o Word."
          ),

          heading("10. Ventaja competitiva", HeadingLevel.HEADING_2),
          bullet("Especialización en el mercado peruano y alineación CNEB (no es un ChatGPT genérico)."),
          bullet("Documentos listos para uso real en el aula, no solo texto plano."),
          bullet("Arquitectura por áreas curriculares extensible a nuevas materias."),
          bullet("Stack moderno que permite iteración rápida de producto."),
          bullet("Conocimiento de dominio del equipo fundador (docentes + desarrollo)."),

          ...financialProjectionDocxBlocks(),

          heading("12. Roadmap próximos 9 meses", HeadingLevel.HEADING_2),
          bullet("Mejora de UX/UI en flujos de conversión (registro → primer valor → pago)."),
          bullet("Auditoría de ciberseguridad y fortalecimiento de infraestructura."),
          bullet("Expansión de módulos ATS y recursos para secundaria."),
          bullet("Meta: 500 usuarios premium al mes 9 (marzo 2027), alineado al inicio de clases."),
          bullet("Meta extendida: 700–800 usuarios premium al mes 18 (diciembre 2027)."),
          bullet("Campaña de adquisición concentrada en febrero–marzo y agosto–octubre."),

          heading("13. Propuesta de inversión", HeadingLevel.HEADING_2),
          body("Ronda actual: S/ 60.000 por 25% de participación (valoración post-money: S/ 240.000)."),
          body("Uso de fondos planificado:"),
          bullet("S/ 45.000 — Equipo fundador full time (S/ 2.500 c/u × 9 meses)."),
          bullet("S/ 8.000 — Mejora UX/UI (onboarding, pantallas de conversión, flujo de pago)."),
          bullet("S/ 3.000 — Desarrollo técnico (ATS, integraciones, producto)."),
          bullet("S/ 4.000 — Infraestructura, marketing y reserva operativa."),
          body(
            "El inversor estratégico aporta capital + expertise en ciberseguridad y desarrollo, con participación sujeta a vesting según compromiso operativo."
          ),

          heading("14. Equipo", HeadingLevel.HEADING_2),
          body(
            "Equipo fundador compuesto por hermanos con experiencia en desarrollo de software y conocimiento directo del contexto educativo peruano. Desarrollo activo del producto desde la concepción hasta producción."
          ),

          heading("15. Contacto", HeadingLevel.HEADING_2),
          body("Plataforma: Docente Pro (docentepro.pe)"),
          body("Documento preparado para due diligence inicial. Información técnica detallada disponible bajo NDA."),
          new Paragraph({
            spacing: { before: 400 },
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "— Fin del documento —",
                size: 18,
                color: BRAND.muted,
                italics: true,
              }),
            ],
          }),
        ],
      },
    ],
  });

  return doc;
}

function buildHtml() {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>Docente Pro — Documentación para Inversores</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    @page { size: A4; margin: 18mm 16mm; }
    body {
      font-family: 'Inter', system-ui, sans-serif;
      color: #1e293b;
      line-height: 1.65;
      font-size: 10.5pt;
      background: #f1f5f9;
    }
    .page {
      background: #fff;
      max-width: 210mm;
      margin: 0 auto;
      box-shadow: 0 4px 24px rgba(0,0,0,.08);
    }
    .cover {
      background: linear-gradient(135deg, #1d4ed8 0%, #1e3a8a 55%, #0e7490 100%);
      color: #fff;
      padding: 48px 44px 40px;
      min-height: 260px;
      position: relative;
      overflow: hidden;
    }
    .cover::before {
      content: '';
      position: absolute;
      top: -60px; right: -60px;
      width: 220px; height: 220px;
      background: rgba(255,255,255,.08);
      border-radius: 50%;
    }
    .cover::after {
      content: '';
      position: absolute;
      bottom: -80px; left: -40px;
      width: 280px; height: 280px;
      background: rgba(255,255,255,.06);
      border-radius: 50%;
    }
    .badge {
      display: inline-block;
      background: rgba(255,255,255,.15);
      border: 1px solid rgba(255,255,255,.25);
      padding: 6px 14px;
      border-radius: 999px;
      font-size: 9pt;
      font-weight: 600;
      letter-spacing: .04em;
      text-transform: uppercase;
      margin-bottom: 20px;
      backdrop-filter: blur(4px);
    }
    .cover h1 {
      font-size: 34pt;
      font-weight: 800;
      letter-spacing: -.02em;
      line-height: 1.1;
      margin-bottom: 10px;
      position: relative;
    }
    .cover .subtitle {
      font-size: 13pt;
      color: #ffffff;
      font-weight: 600;
      max-width: 520px;
      position: relative;
    }
    .cover .meta {
      margin-top: 28px;
      font-size: 9.5pt;
      color: #cfe3ff;
      font-weight: 500;
      position: relative;
    }
    .stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0;
      border-bottom: 3px solid #1d4ed8;
    }
    .stat {
      text-align: center;
      padding: 22px 16px;
      background: #eff6ff;
      border-right: 1px solid #dbeafe;
    }
    .stat:last-child { border-right: none; background: #1d4ed8; color: #fff; }
    .stat:last-child .stat-label { color: #bfdbfe; }
    .stat-value {
      font-size: 22pt;
      font-weight: 800;
      color: #1e3a8a;
      line-height: 1;
    }
    .stat:last-child .stat-value { color: #fff; }
    .stat-label {
      font-size: 8.5pt;
      color: #64748b;
      margin-top: 6px;
      font-weight: 500;
    }
    .content { padding: 36px 44px 44px; }
    h2 {
      font-size: 14pt;
      font-weight: 700;
      color: #1e3a8a;
      margin: 28px 0 12px;
      padding-bottom: 6px;
      border-bottom: 2px solid #dbeafe;
    }
    h2:first-child { margin-top: 0; }
    h3 {
      font-size: 11pt;
      font-weight: 600;
      color: #1d4ed8;
      margin: 18px 0 8px;
    }
    p { margin-bottom: 10px; color: #334155; }
    ul { margin: 8px 0 12px 20px; }
    li { margin-bottom: 5px; color: #334155; }
    .highlight-box {
      background: linear-gradient(135deg, #eff6ff, #f0fdfa);
      border-left: 4px solid #1d4ed8;
      padding: 16px 18px;
      border-radius: 0 8px 8px 0;
      margin: 16px 0;
    }
    .highlight-box p { margin: 0; font-weight: 500; }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 12px 0 16px;
      font-size: 9.5pt;
    }
    th {
      background: #1e3a8a;
      color: #fff;
      text-align: left;
      padding: 10px 12px;
      font-weight: 600;
    }
    td {
      padding: 9px 12px;
      border-bottom: 1px solid #e2e8f0;
    }
    tr:nth-child(even) td { background: #f8fafc; }
    .tech-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin: 12px 0;
    }
    .tech-card {
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 14px;
      background: #fafafa;
    }
    .tech-card h4 {
      font-size: 9.5pt;
      color: #1d4ed8;
      margin-bottom: 8px;
      font-weight: 700;
    }
    .tech-card ul { margin: 0 0 0 16px; font-size: 9pt; }
    .flow {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-wrap: wrap;
      margin: 14px 0;
      font-size: 8.5pt;
    }
    .flow-step {
      background: #1d4ed8;
      color: #fff;
      padding: 6px 10px;
      border-radius: 6px;
      font-weight: 600;
    }
    .flow-arrow { color: #94a3b8; font-weight: 700; }
    .invest-box {
      background: #1e3a8a;
      color: #fff;
      border-radius: 10px;
      padding: 20px 22px;
      margin-top: 16px;
    }
    .invest-box h3 { color: #93c5fd; margin-top: 0; }
    .invest-box ul { color: #e2e8f0; }
    .invest-box li { color: #e2e8f0; }
    .footer-note {
      text-align: center;
      font-size: 8.5pt;
      color: #94a3b8;
      margin-top: 32px;
      padding-top: 16px;
      border-top: 1px solid #e2e8f0;
    }
    .arch-figure { text-align: center; margin: 16px 0 8px; }
    .arch-figure img {
      max-width: 78%;
      height: auto;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,.06);
    }
    .arch-figure figcaption {
      font-size: 8pt;
      color: #94a3b8;
      font-style: italic;
      margin-top: 8px;
    }
    .pill-row { display: flex; flex-wrap: wrap; gap: 6px; margin: 8px 0 14px; }
    .pill {
      font-size: 8pt;
      font-weight: 600;
      padding: 4px 10px;
      border-radius: 999px;
      background: #eff6ff;
      color: #1d4ed8;
      border: 1px solid #dbeafe;
    }
    .anatomy {
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 16px 18px;
      margin: 12px 0;
      background: #fafcff;
    }
    .anatomy h3 { margin-top: 0; }
    .phase-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      margin: 10px 0;
    }
    .phase {
      border-top: 3px solid #0891b2;
      background: #fff;
      border-radius: 0 0 8px 8px;
      padding: 10px 12px;
      box-shadow: 0 1px 4px rgba(0,0,0,.05);
    }
    .phase h5 { font-size: 9pt; color: #0e7490; margin-bottom: 4px; font-weight: 700; }
    .phase p { font-size: 8.5pt; margin: 0; color: #475569; }
    .steps { counter-reset: step; list-style: none; margin: 8px 0 8px 0; padding: 0; }
    .steps li {
      counter-increment: step;
      position: relative;
      padding-left: 30px;
      margin-bottom: 7px;
      font-size: 9.5pt;
    }
    .steps li::before {
      content: counter(step);
      position: absolute;
      left: 0; top: 0;
      width: 20px; height: 20px;
      background: #1d4ed8;
      color: #fff;
      border-radius: 50%;
      font-size: 8pt;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .note { font-size: 8.5pt; color: #64748b; font-style: italic; margin-top: 6px; }
    .fin-intro { margin-bottom: 12px; }
    .fin-table {
      width: 100%;
      border-collapse: collapse;
      margin: 12px 0 16px;
      font-size: 8.5pt;
    }
    .fin-table th {
      background: #1e3a8a;
      color: #fff;
      padding: 8px 10px;
      text-align: left;
      font-weight: 600;
    }
    .fin-table td {
      padding: 8px 10px;
      border-bottom: 1px solid #e2e8f0;
      vertical-align: top;
    }
    .fin-table tr.milestone td { background: #eff6ff; }
    .fin-table .row-note { font-size: 7.5pt; color: #94a3b8; font-style: italic; }
    .fin-table .pos { color: #059669; font-weight: 700; }
    .fin-table .neg { color: #dc2626; font-weight: 700; }
    .fin-summary {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      margin: 16px 0 20px;
    }
    .fin-kpi {
      text-align: center;
      background: #f0f9ff;
      border: 1px solid #bae6fd;
      border-radius: 8px;
      padding: 12px 8px;
    }
    .fin-kpi-val {
      display: block;
      font-size: 13pt;
      font-weight: 800;
      color: #1e3a8a;
      line-height: 1.2;
    }
    .fin-kpi-lbl {
      display: block;
      font-size: 7pt;
      color: #64748b;
      margin-top: 4px;
      line-height: 1.3;
    }
    @media print {
      body { background: #fff; }
      .page { box-shadow: none; max-width: 100%; }
      .arch-figure { page-break-inside: avoid; }
      .anatomy { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
<div class="page">
  <div class="cover">
    <div class="badge">Confidencial · Junio 2026</div>
    <h1>Docente Pro</h1>
    <p class="subtitle">Planificación docente con Inteligencia Artificial — Documentación para inversores</p>
    <p class="meta">Resumen ejecutivo · Producto · Tecnología · Modelo de negocio</p>
  </div>

  <div class="stats">
    <div class="stat"><div class="stat-value">440+</div><div class="stat-label">Usuarios registrados</div></div>
    <div class="stat"><div class="stat-value">25</div><div class="stat-label">Usuarios premium</div></div>
    <div class="stat"><div class="stat-value">SaaS</div><div class="stat-label">Modelo B2C recurrente</div></div>
  </div>

  <div class="content">
    <h2>1. Resumen ejecutivo</h2>
    <p><strong>Docente Pro</strong> es una plataforma SaaS para docentes peruanos de educación básica. Utiliza inteligencia artificial para generar sesiones de aprendizaje, unidades curriculares, evaluaciones y recursos didácticos alineados al <strong>Currículo Nacional de Educación Básica (CNEB)</strong>.</p>
    <div class="highlight-box">
      <p>Los docentes invierten 8–15 horas semanales en planificación. Docente Pro reduce ese tiempo a minutos, manteniendo calidad pedagógica y cumplimiento normativo MINEDU.</p>
    </div>

    <h2>2. Problema y oportunidad</h2>
    <ul>
      <li>Más de 350.000 docentes en educación básica regular en Perú planifican por competencias.</li>
      <li>Herramientas genéricas (Word, IA sin contexto) no generan documentos alineados al CNEB.</li>
      <li>Docente Pro combina IA especializada + plantillas oficiales + PDF profesional.</li>
    </ul>

    <h2>3. Propuesta de valor</h2>
    <table>
      <tr><th>Para el docente</th><th>Beneficio</th></tr>
      <tr><td>Ahorro de tiempo</td><td>Sesiones completas en minutos vs. horas manuales</td></tr>
      <tr><td>Cumplimiento normativo</td><td>Alineado al CNEB, competencias y capacidades</td></tr>
      <tr><td>Documentos listos</td><td>PDF profesional para entregar o imprimir</td></tr>
      <tr><td>Recursos visuales</td><td>Gráficos educativos integrados en sesiones</td></tr>
      <tr><td>Evaluación</td><td>Rúbricas coherentes con cada sesión</td></tr>
    </table>

    <h2>4. Producto — Módulos principales</h2>
    <h3>Sesiones de aprendizaje</h3>
    <p>Generación IA de sesiones con secuencia didáctica (Inicio, Desarrollo, Cierre), propósitos, competencias y reflexiones. Interfaces especializadas por área curricular.</p>
    <h3>Unidades de aprendizaje</h3>
    <p>Unidades semanales vinculadas a problemáticas, estándares y sesiones complementarias (Premium).</p>
    <h3>Evaluaciones y rúbricas</h3>
    <p>Instrumentos de evaluación automáticos alineados a criterios de la sesión.</p>
    <h3>Gráficos educativos y fichas</h3>
    <p>Recursos visuales y fichas de aplicación exportables a PDF.</p>

    <h2>5. Modelo de negocio</h2>
    <table>
      <tr><th>Plan</th><th>Precio</th><th>Público</th></tr>
      <tr><td>Personal Primaria</td><td>S/ 20 / mes</td><td>Docente de primaria</td></tr>
      <tr><td>Personal Secundaria</td><td>S/ 25 / mes</td><td>Docente de secundaria</td></tr>
      <tr><td>Equipo</td><td>S/ 30 / mes</td><td>Docente + 1 colaborador</td></tr>
    </table>
    <p>MRR actual estimado: <strong>S/ 550 – 625 / mes</strong> · Estacionalidad alineada al calendario escolar peruano.</p>

    <h2>6. Arquitectura técnica</h2>
    <p>Sistema de <strong>microservicios desacoplados</strong>: un frontend SPA, un backend orquestador en <strong>Node.js</strong> y un motor de IA en <strong>Python (RAG)</strong> potenciado por <strong>Google Gemini</strong>. Desplegado en <strong>AWS</strong> con contenedores Docker y diseñado para escalar horizontalmente.</p>
    <div class="tech-grid">
      <div class="tech-card">
        <h4>Frontend (SPA)</h4>
        <ul>
          <li>React 18 + TypeScript</li>
          <li>Vite · Tailwind · Radix UI</li>
          <li>React Query · Zustand</li>
          <li>Exportación PDF / Word</li>
        </ul>
      </div>
      <div class="tech-card">
        <h4>Backend — Node.js</h4>
        <ul>
          <li>Express + TypeScript</li>
          <li>Prisma ORM + PostgreSQL</li>
          <li>Orquestador de IA (gateway)</li>
          <li>+20 grupos de endpoints</li>
        </ul>
      </div>
      <div class="tech-card">
        <h4>IA — Python RAG + Gemini</h4>
        <ul>
          <li>FastAPI (microservicio)</li>
          <li>Google Gemini 2.5 Pro / Flash</li>
          <li>LangChain + FAISS (vectorial)</li>
          <li>Pydantic — salida validada</li>
        </ul>
      </div>
      <div class="tech-card">
        <h4>Seguridad</h4>
        <ul>
          <li>Auth0 — OAuth 2.0 + JWT</li>
          <li>HTTPS end-to-end</li>
          <li>Control free / premium / admin</li>
          <li>Auditoría cyber (roadmap)</li>
        </ul>
      </div>
      <div class="tech-card">
        <h4>Pagos & tiempo real</h4>
        <ul>
          <li>Mercado Pago + webhooks</li>
          <li>Yape / WhatsApp (manual)</li>
          <li>Socket.io — tiempo real</li>
          <li>Activación premium instantánea</li>
        </ul>
      </div>
      <div class="tech-card">
        <h4>Cloud — AWS</h4>
        <ul>
          <li>EC2 + Docker (actual)</li>
          <li>S3 + CloudFront (CDN)</li>
          <li>ALB + Auto Scaling (objetivo)</li>
          <li>RDS Multi-AZ (objetivo)</li>
        </ul>
      </div>
    </div>

    <h3>Base de conocimiento (RAG / MINEDU)</h3>
    <p>El diferencial técnico: el motor de IA no responde "de memoria". Recupera contenido curricular oficial e indexado, y lo usa como contexto para generar planificaciones alineadas a la normativa peruana.</p>
    <div class="pill-row">
      <span class="pill">Currículo Nacional (CNEB)</span>
      <span class="pill">Programa Curricular 649-2016-MINEDU</span>
      <span class="pill">Cuadernillos y fichas MINEDU</span>
      <span class="pill">Sesiones modelo</span>
      <span class="pill">Estándares y competencias</span>
    </div>

    <h3>Flujo de generación con IA</h3>
    <div class="flow">
      <span class="flow-step">Cuestionario docente</span><span class="flow-arrow">→</span>
      <span class="flow-step">Node orquesta</span><span class="flow-arrow">→</span>
      <span class="flow-step">RAG: FAISS + MINEDU</span><span class="flow-arrow">→</span>
      <span class="flow-step">Gemini 2.5</span><span class="flow-arrow">→</span>
      <span class="flow-step">Validación Pydantic</span><span class="flow-arrow">→</span>
      <span class="flow-step">Render + PDF/Word</span>
    </div>

    <h3>Infraestructura AWS — actual y escalable</h3>
    <p>Hoy operamos una implementación funcional en AWS con CI/CD automatizado. La arquitectura objetivo está diseñada para escalar con balanceadores de carga, Auto Scaling y base de datos en alta disponibilidad.</p>
    <figure class="arch-figure">
      <img src="assets/arch-diagrama.jpg" alt="Arquitectura AWS actual y objetivo" />
      <figcaption>Arriba: implementación actual (EC2 + Docker + S3 + CloudFront). Abajo: arquitectura objetivo escalable (ALB + Auto Scaling + RDS Multi-AZ).</figcaption>
    </figure>

    <h2>7. Anatomía de una Sesión de Aprendizaje</h2>
    <div class="anatomy">
      <p>Cada sesión es un documento estructurado que cumple las directrices del MINEDU. El motor genera y valida automáticamente:</p>
      <ul>
        <li><strong>Datos generales</strong> · <strong>Propósito de aprendizaje</strong> (competencia, capacidades, desempeños, estándar)</li>
        <li><strong>Propósito de la sesión</strong> (qué, cómo, para qué) · <strong>Criterios de evaluación</strong> y evidencia</li>
        <li><strong>Enfoques transversales</strong> (máx. 2) con valores y actitudes observables</li>
        <li><strong>Preparación</strong>: recursos y materiales de costo cero (realidad de la escuela pública)</li>
      </ul>
      <h3 style="margin-top:12px">Secuencia didáctica — 3 momentos</h3>
      <div class="phase-grid">
        <div class="phase"><h5>INICIO</h5><p>Problematización, motivación, saberes previos y comunicación del propósito.</p></div>
        <div class="phase"><h5>DESARROLLO</h5><p>Gestión y acompañamiento, procesos pedagógicos específicos por área.</p></div>
        <div class="phase"><h5>CIERRE</h5><p>Evaluación, metacognición y reflexión del aprendizaje.</p></div>
      </div>
      <p class="note">Guardrails automáticos: una sola competencia por sesión, títulos normalizados al formato MINEDU, eliminación de contenido alucinado, validación de gráficos e instrumento de evaluación (lista de cotejo) coherente con los criterios.</p>
    </div>

    <h2>8. Anatomía de una Unidad de Aprendizaje</h2>
    <p>Una unidad articula varias áreas durante semanas en torno a una problemática. Se genera mediante un <strong>flujo secuencial de 8 pasos</strong>, donde cada paso acumula el contexto de los anteriores y alterna modelos Gemini Pro/Flash según complejidad:</p>
    <ol class="steps">
      <li><strong>Situación significativa</strong> — contexto problematizador real del aula.</li>
      <li><strong>Evidencias</strong> — propósito, producto integrador e instrumento de evaluación.</li>
      <li><strong>Propósitos de aprendizaje</strong> — competencias, capacidades, estándares, criterios y actividades por área (+ transversales).</li>
      <li><strong>Áreas complementarias</strong> — Tutoría, Plan Lector y otras vinculadas a la competencia.</li>
      <li><strong>Enfoques transversales</strong> — valores y actitudes observables.</li>
      <li><strong>Secuencia de actividades</strong> — planificador semanal hora por hora, día por día, por área.</li>
      <li><strong>Materiales y recursos</strong> — coherentes con la secuencia.</li>
      <li><strong>Reflexiones</strong> — preguntas de autoevaluación docente.</li>
    </ol>
    <p class="note">El backend Node orquesta los 8 pasos en orden, persiste el resultado consolidado y el frontend lo renderiza en tablas con el formato oficial, listo para exportar a PDF o Word.</p>

    <h2>9. Ventaja competitiva</h2>
    <ul>
      <li>Especialización mercado peruano + CNEB con RAG sobre documentos MINEDU (no es ChatGPT genérico).</li>
      <li>Documentos listos para el aula, no solo texto.</li>
      <li>Arquitectura de microservicios extensible por áreas curriculares.</li>
      <li>Equipo con dominio educativo + desarrollo.</li>
    </ul>

    <h2>10. Proyección financiera</h2>
    ${buildFinancialHtmlTable()}

    <h2>11. Propuesta de inversión</h2>
    <div class="invest-box">
      <h3>Ronda actual: S/ 60.000 por 25%</h3>
      <p style="margin-bottom:12px;color:#dbeafe">Valoración post-money: S/ 240.000 · Inversor estratégico (capital + ciberseguridad + desarrollo)</p>
      <ul>
        <li>S/ 45.000 — Equipo full time (S/ 2.500 × 2 × 9 meses)</li>
        <li>S/ 8.000 — Mejora UX/UI y conversión</li>
        <li>S/ 3.000 — Desarrollo técnico (ATS, integraciones)</li>
        <li>S/ 4.000 — Infra, marketing y reserva</li>
      </ul>
    </div>

    <p class="footer-note">Docente Pro · Documento confidencial para due diligence inicial · Información detallada bajo NDA</p>
  </div>
</div>
</body>
</html>`;
}

async function generatePdf(htmlPath, pdfPath) {
  try {
    const puppeteer = await import("puppeteer");
    const browser = await puppeteer.default.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(`file:///${htmlPath.replace(/\\/g, "/")}`, { waitUntil: "networkidle0" });
    await page.pdf({
      path: pdfPath,
      format: "A4",
      printBackground: true,
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
    });
    await browser.close();
    return true;
  } catch (err) {
    console.warn("PDF via Puppeteer falló:", err.message);
    console.warn("Puedes abrir el HTML en Chrome y usar Imprimir → Guardar como PDF.");
    return false;
  }
}

async function main() {
  const docxPath = path.join(OUT_DIR, "DocentePro-Documentacion-Inversores.docx");
  const htmlPath = path.join(OUT_DIR, "DocentePro-Documentacion-Inversores.html");
  const pdfPath = path.join(OUT_DIR, "DocentePro-Documentacion-Inversores.pdf");

  // DOCX
  const doc = buildDocx();
  const buffer = await Packer.toBuffer(doc);
  try {
    fs.writeFileSync(docxPath, buffer);
    console.log("✓ DOCX:", docxPath);
  } catch (err) {
    if (err.code === "EBUSY") {
      const alt = docxPath.replace(".docx", "-nuevo.docx");
      fs.writeFileSync(alt, buffer);
      console.warn("⚠ DOCX bloqueado (ciérralo en Word). Guardado como:", alt);
    } else throw err;
  }

  // HTML
  fs.writeFileSync(htmlPath, buildHtml(), "utf8");
  console.log("✓ HTML:", htmlPath);

  // PDF
  const pdfOk = await generatePdf(htmlPath, pdfPath);
  if (pdfOk) console.log("✓ PDF:", pdfPath);
}

main().catch(console.error);
