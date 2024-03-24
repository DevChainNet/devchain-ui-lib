import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body>
        <Main />
        <NextScript />

        {/**
           *         <script
          dangerouslySetInnerHTML={{
            __html: `if(document) { document.querySelectorAll("link[rel='preload'][as='style']").forEach(link => link.rel = "stylesheet")}`,
          }}
        />
           * 
           */}
      </body>
    </Html>
  );
}
