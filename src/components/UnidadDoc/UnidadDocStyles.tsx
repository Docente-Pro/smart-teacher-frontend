import { Head } from "@htmldocs/react";

/**
 * Estilos CSS para el documento de Unidad de Aprendizaje.
 * Tema naranja/amber siguiendo formato MINEDU.
 */
export function UnidadDocStyles() {
  return (
    <Head>
      <link href="https://fonts.googleapis.com/css2?family=Arial&display=swap" rel="stylesheet" />
      <style>
        {`
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: Arial, Helvetica, sans-serif;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
            font-size: 10pt;
            line-height: 1.3;
          }

          /* ─── Tablas MINEDU ─── */
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 0.4rem;
          }

          th, td {
            border: 1px solid #000;
            padding: 0.25rem 0.35rem;
            text-align: left;
            vertical-align: top;
          }

          th {
            background-color: #FBBF24;
            font-weight: bold;
            font-size: 9pt;
            color: #000;
          }

          td {
            font-size: 9pt;
          }

          /* ─── Cabecera de sección ─── */
          .section-title {
            background-color: #FBBF24;
            border: 1.5px solid #000;
            padding: 0.25rem 0.4rem;
            font-weight: bold;
            font-size: 10pt;
            margin-bottom: 0.2rem;
          }

          .section-subtitle {
            font-weight: bold;
            font-size: 10pt;
            margin-bottom: 0.2rem;
            text-decoration: underline;
          }

          /* ─── Tipografía ─── */
          h1 {
            font-size: 14pt;
            font-weight: bold;
            margin-bottom: 0.2rem;
            text-align: center;
          }

          h2 {
            font-size: 11pt;
            font-weight: bold;
            margin-bottom: 0.2rem;
          }

          h3 {
            font-size: 10pt;
            font-weight: bold;
            margin-bottom: 0.15rem;
          }

          p {
            margin-bottom: 0.2rem;
            line-height: 1.3;
            font-size: 9pt;
          }

          ul, ol {
            margin-left: 0.8rem;
            margin-bottom: 0.2rem;
          }

          li {
            margin-bottom: 0.1rem;
            line-height: 1.2;
            font-size: 9pt;
          }

          /* ─── Utilidades ─── */
          .grid-2 {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 0.5rem;
          }

          .text-center {
            text-align: center;
          }

          .no-break {
            page-break-inside: avoid;
          }

          /* ─── Badge de grado ─── */
          .grado-badge {
            position: absolute;
            top: 0;
            right: 0;
            background-color: #F59E0B;
            color: #000;
            font-weight: bold;
            font-size: 9pt;
            padding: 0.15rem 0.5rem;
            border-left: 1.5px solid #000;
            border-bottom: 1.5px solid #000;
          }

          /* ─── Situación box ─── */
          .situacion-box {
            border: 2px solid #D97706;
            padding: 0.5rem;
            margin-bottom: 0.4rem;
            font-size: 9pt;
            line-height: 1.35;
            text-align: justify;
          }

          /* ─── Área vertical label ─── */
          .area-vertical {
            font-weight: bold;
            font-size: 8pt;
            text-align: center;
            vertical-align: middle;
            padding: 0.15rem 0.1rem;
            background-color: #FEF3C7;
            max-width: 28px;
            word-break: break-all;
            line-height: 1.15;
            letter-spacing: 2px;
          }

          /* ─── Semana header ─── */
          .semana-header {
            background-color: #F59E0B;
            color: #000;
            font-weight: bold;
            text-align: center;
            font-size: 10pt;
            padding: 0.2rem;
            border: 1.5px solid #000;
            margin-top: 0.5rem;
          }

          /* ─── Reflexiones ─── */
          .reflexion-line {
            border-bottom: 1px solid #000;
            min-height: 1.5rem;
            margin-bottom: 0.3rem;
          }

          /* Firmas */
          .firma-line {
            border-top: 1px solid #000;
            width: 60%;
            margin: 3rem auto 0.2rem auto;
          }

          .firma-label {
            text-align: center;
            font-weight: bold;
            font-size: 10pt;
          }

          /* ─── Cola de tabla header anaranjado claro ─── */
          .header-light {
            background-color: #FDE68A;
          }

          /* ─── Impresión ─── */
          @media print {
            body {
              margin: 0;
              padding: 0;
            }

            .page-break {
              page-break-after: always;
            }

            .no-print {
              display: none;
            }

            .no-break {
              page-break-inside: avoid;
            }
          }

          /* ─── PDF page-break helpers ─── */
          .keep-together {
            page-break-inside: avoid;
            break-inside: avoid;
          }

          .break-before {
            page-break-before: always;
            break-before: page;
          }
        `}
      </style>
    </Head>
  );
}
