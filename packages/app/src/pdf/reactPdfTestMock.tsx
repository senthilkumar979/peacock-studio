import { createElement, type PropsWithChildren, type ReactNode } from 'react';

type PdfProps = PropsWithChildren<Record<string, unknown>>;

function dataAttrs(props: Record<string, unknown>) {
  const { style, fixed, src, size, title, author, wrap, debug, bookmark, ...rest } = props;
  return {
    'data-style': style !== undefined ? JSON.stringify(style) : undefined,
    'data-fixed': fixed ? 'true' : undefined,
    'data-src': typeof src === 'string' ? src : undefined,
    'data-size': typeof size === 'string' ? size : undefined,
    'data-title': typeof title === 'string' ? title : undefined,
    'data-author': typeof author === 'string' ? author : undefined,
    ...rest,
  };
}

export const Document = ({ children, ...props }: PdfProps) =>
  createElement('div', { 'data-testid': 'pdf-document', ...dataAttrs(props) }, children);

export const Page = ({ children, ...props }: PdfProps) =>
  createElement('div', { 'data-testid': 'pdf-page', ...dataAttrs(props) }, children);

export const View = ({ children, ...props }: PdfProps) =>
  createElement('div', { 'data-testid': 'pdf-view', ...dataAttrs(props) }, children);

export const Text = ({
  children,
  render,
  ...props
}: PdfProps & {
  render?: (info: { pageNumber: number; totalPages: number }) => ReactNode;
}) => {
  const content =
    typeof render === 'function' ? render({ pageNumber: 1, totalPages: 3 }) : children;
  return createElement('span', { 'data-testid': 'pdf-text', ...dataAttrs(props) }, content);
};

export const Image = (props: Record<string, unknown>) =>
  createElement('img', { 'data-testid': 'pdf-image', alt: '', ...dataAttrs(props) });

export const StyleSheet = {
  create: <T extends Record<string, unknown>>(styles: T): T => styles,
};

export const Font = {
  register: () => undefined,
  registerHyphenationCallback: () => undefined,
};

export const pdf = () => ({
  toBlob: async () => new Blob(['pdf'], { type: 'application/pdf' }),
});
