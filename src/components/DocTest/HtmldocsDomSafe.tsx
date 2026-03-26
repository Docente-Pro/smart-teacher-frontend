/**
 * Mirrors @htmldocs/react Document + Footer layout for screen capture / PDF,
 * but injects CSS with <style> under a div instead of <head>.
 * React forbids <head> as a descendant of <div>; the library uses <head> for print CSS.
 */
import React, { type CSSProperties, type ReactNode } from "react";
import clsx from "clsx";

const PAGE_SIZES = ["A3", "A4", "A5", "letter", "legal"] as const;

function formatMargin(value: string | number | undefined): string {
  if (value === undefined) return "0.39in";
  return typeof value === "string" ? value : `${value}px`;
}

function formatSize(size: string): string {
  return PAGE_SIZES.includes(size as (typeof PAGE_SIZES)[number]) ? size : size;
}

function marginBoxStyleBlock(opts: {
  position: string;
  pageType: string;
  runningName: string;
  marginBoxStyles?: Record<string, string | number>;
  style?: CSSProperties;
}): string {
  const { position, pageType, runningName, marginBoxStyles, style } = opts;
  const marginEntries = Object.entries(marginBoxStyles || {})
    .map(([key, value]) => `${key.replace(/([A-Z])/g, "-$1").toLowerCase()}: ${value};`)
    .join("\n");
  const styleEntries = Object.entries(style || {})
    .map(([key, value]) => `${key.replace(/([A-Z])/g, "-$1").toLowerCase()}: ${value};`)
    .join("\n");
  const pageTypeBlock =
    pageType === "even"
      ? `@page:odd { @${position} { content: none; } }`
      : pageType === "odd"
        ? `@page:even { @${position} { content: none; } }`
        : pageType === "blank"
          ? `@page:blank { @${position} { content: none; } }`
          : "";
  const align = position.includes("left")
    ? "text-align: left;"
    : position.includes("right")
      ? "text-align: right;"
      : "text-align: center;";
  const valign = position.includes("top")
    ? "vertical-align: top;"
    : position.includes("bottom")
      ? "vertical-align: bottom;"
      : "vertical-align: middle;";

  return `
            .${runningName} {
              position: running(${runningName});
            }
            @page {
              @${position} {
                content: element(${runningName});
                ${marginEntries}
              }
            }
            ${pageTypeBlock}
            .${runningName} {
              ${align}
              ${valign}
              ${styleEntries}
            }
          `;
}

interface HtmldocsMarginBoxProps {
  children?: ReactNode;
  position: string;
  pageType?: string;
  className?: string;
  style?: CSSProperties;
  marginBoxStyles?: Record<string, string | number>;
  runningName: string;
}

function HtmldocsMarginBox({
  children,
  position,
  pageType = "all",
  className,
  style,
  marginBoxStyles,
  runningName,
}: HtmldocsMarginBoxProps) {
  return (
    <>
      <style>{marginBoxStyleBlock({ position, pageType, runningName, marginBoxStyles, style })}</style>
      <div className={clsx(runningName, className)}>{children}</div>
    </>
  );
}

export interface HtmldocsFooterProps {
  children?:
    | ReactNode
    | ((props: { currentPage: ReactNode; totalPages: ReactNode }) => ReactNode);
  position?: string;
  pageType?: string;
  className?: string;
  style?: CSSProperties;
  marginBoxStyles?: Record<string, string | number>;
}

export function HtmldocsFooter({
  children = ({ currentPage, totalPages }) => (
    <span className="page-number">
      Page {currentPage} of {totalPages}
    </span>
  ),
  position = "bottom-center",
  pageType = "all",
  className,
  style,
  marginBoxStyles,
}: HtmldocsFooterProps) {
  const footerStyles = `
    ${style
      ? Object.entries(style)
          .map(([key, value]) => `${key.replace(/([A-Z])/g, "-$1").toLowerCase()}: ${value};`)
          .join("\n")
      : ""}
    .page-counter::after {
      content: counter(page);
    }
    .pages-counter::after {
      content: counter(pages);
    }
    .page-number {
      display: ${typeof children === "function" ? "inline" : "none"};
    }
  `;

  const body =
    typeof children === "function"
      ? children({
          currentPage: <span className="page-counter" />,
          totalPages: <span className="pages-counter" />,
        })
      : children;

  return (
    <>
      <style>{footerStyles}</style>
      <HtmldocsMarginBox
        position={position}
        pageType={pageType}
        className={className}
        style={style}
        marginBoxStyles={marginBoxStyles}
        runningName="print-footer"
      >
        {body}
      </HtmldocsMarginBox>
    </>
  );
}

export interface HtmldocsDocumentProps {
  size: string;
  orientation: string;
  margin?: string | number;
  children?: ReactNode;
}

export function HtmldocsDocument({ size, orientation, margin, children }: HtmldocsDocumentProps) {
  const childrenArray = React.Children.toArray(children);
  const footerChild = childrenArray.find(
    (child) => React.isValidElement(child) && child.type === HtmldocsFooter,
  );
  const otherChildren = childrenArray.filter(
    (child) => !(React.isValidElement(child) && child.type === HtmldocsFooter),
  );
  const reorderedChildren = footerChild ? [footerChild, ...otherChildren] : childrenArray;

  const pageCss = `
            @page {
              size: ${formatSize(size)} ${orientation};
              margin: ${formatMargin(margin)};
            }
          `;

  return (
    <div id="document" data-size={formatSize(size)} data-orientation={orientation}>
      <style>{pageCss}</style>
      {reorderedChildren}
    </div>
  );
}
