import { Head } from "@htmldocs/react";

export function DocumentStyles() {
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
            font-size: 11pt;
            line-height: 1.4;
          }
          
          /* Tablas estilo MINEDU */
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 0.5rem;
          }
          
          th, td {
            border: 1px solid #000;
            padding: 0.4rem 0.5rem;
            text-align: left;
            vertical-align: top;
          }
          
          th {
            background-color: #E8F5E9;
            font-weight: bold;
            font-size: 10pt;
          }
          
          td {
            font-size: 10pt;
          }
          
          /* Títulos de secciones */
          .section-title {
            background-color: #E8F5E9;
            border: 2px solid #000;
            padding: 0.3rem 0.5rem;
            font-weight: bold;
            font-size: 11pt;
            margin-bottom: 0.3rem;
            text-align: center;
          }
          
          .section-content {
            border: 1px solid #000;
            padding: 0.5rem;
            margin-bottom: 0.5rem;
          }
          
          /* Títulos internos */
          h1 {
            font-size: 14pt;
            font-weight: bold;
            margin-bottom: 0.3rem;
            text-align: center;
          }
          
          h2 {
            font-size: 11pt;
            font-weight: bold;
            margin-bottom: 0.3rem;
          }
          
          h3 {
            font-size: 10pt;
            font-weight: bold;
            margin-bottom: 0.2rem;
          }
          
          h4 {
            font-size: 10pt;
            font-weight: normal;
            margin-bottom: 0.2rem;
            text-decoration: underline;
          }
          
          /* Párrafos y listas */
          p {
            margin-bottom: 0.3rem;
            line-height: 1.3;
            font-size: 10pt;
          }
          
          ul, ol {
            margin-left: 1rem;
            margin-bottom: 0.3rem;
          }
          
          li {
            margin-bottom: 0.2rem;
            line-height: 1.3;
            font-size: 10pt;
          }
          
          /* Grid de 2 columnas */
          .grid-2 {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 0.5rem;
          }
          
          /* Espaciados */
          .space-y-2 > * + * {
            margin-top: 0.2rem;
          }
          
          .space-y-4 > * + * {
            margin-top: 0.4rem;
          }
          
          /* Cajas de contenido */
          .content-box {
            border: 1px solid #000;
            padding: 0.4rem;
            margin-bottom: 0.3rem;
          }
          
          .bordered-section {
            border: 2px solid #000;
            padding: 0.5rem;
            margin-bottom: 0.5rem;
          }
          
          /* Texto en negrita */
          strong, b {
            font-weight: bold;
          }
          
          /* Texto centrado */
          .text-center {
            text-align: center;
          }
          
          /* Firmas */
          .signature-line {
            border-top: 1px solid #000;
            width: 80%;
            margin: 2rem auto 0.2rem auto;
          }
          
          .signature-name {
            text-align: center;
            font-weight: bold;
            font-size: 10pt;
          }
          
          .signature-role {
            text-align: center;
            font-size: 9pt;
          }
          
          /* Lista con viñetas personalizadas */
          .custom-list {
            list-style: none;
            margin-left: 0;
          }
          
          .custom-list li:before {
            content: "• ";
            font-weight: bold;
          }
          
          /* Evitar saltos de página */
          .no-break {
            page-break-inside: avoid;
          }
          
          /* Márgenes de impresión */
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
          }
        `}
      </style>
    </Head>
  );
}
