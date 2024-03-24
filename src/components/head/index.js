// MODULES
import React from 'react';
import Head from 'next/head';

// CONFIG
import config from '../../config';

class HeadTag extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <Head lang="en">
        <title>{this.props.title}</title>

        <meta charSet="utf-8" />
        <meta httpEquiv="content-language" content="en" />
        <meta name="title" content={this.props.title} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />
        <meta name="description" content={this.props.desc} />

        <meta property="og:image" content={config.url_app + '/favicon.ico'} />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="200" />
        <meta property="og:image:height" content="200" />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="en_US" />
        <meta property="og:site_name" content="devchain" />
        <meta property="og:title" content={this.props.title} />
        <meta property="og:description" content={this.props.desc} />
        <meta property="og:url" content={config.url_app} />

        <meta name="twitter:site" content="@devchain" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:creator" content="@devchain" />
        <meta name="twitter:description" content={this.props.desc} />
        <meta name="twitter:image" content={config.url_app + '/favicon.ico'} />

        <link rel="apple-touch-icon" href={config.url_app + '/favicon.ico'} />
        <link
          rel="icon"
          href={config.url_app + '/favicon.ico'}
          type="image/x-icon"
        />
        <link rel="manifest" href={config.url_app + '/manifest.json'} />
      </Head>
    );
  }
}

HeadTag.defaultProps = {
  title: 'Devchain | Blockchain developer components',
  desc: 'Blockchain developer components for building full stack web3 applications.',
};

export default HeadTag;
