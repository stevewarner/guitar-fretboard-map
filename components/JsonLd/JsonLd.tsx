type Props = {
  data: Record<string, unknown>;
};

// Server-renderable JSON-LD. `<` is escaped so a value containing "</script>"
// can't break out of the script tag.
export const JsonLd = ({ data }: Props) => (
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{
      __html: JSON.stringify(data).replace(/</g, '\\u003c'),
    }}
  />
);
