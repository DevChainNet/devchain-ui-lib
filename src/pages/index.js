// MODULES
import Web3 from 'web3';
import React from 'react';
import axios from 'axios';
import cn from 'classnames';

// COMPONENTS
import Head from '../components/head';
import UserLayout from '../components/layouts/user';
import Graph from '../components/graph/index.js';
import Swap from '../components/swap/index.js';

// CONFIG
import config from '../config';

// CONTEXT
import { Context } from '../context';

// UTILS
import { wallet_connect } from '../utils/index.js';
import UTILS_API from '../utils/api.js';

// STYLES
import style from '../styles/pages/home.module.css';

// SERVER SIDE
export async function getServerSideProps({ req }) {
  return {
    props: {
      pathname: req.url,
    },
  };
}

// HOME PAGE
class Home extends React.Component {
  static contextType = Context;

  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {}

  componentDidUpdate() {}

  componentWillUnmount() {}

  render() {
    return (
      <>
        <Head
          title="Home | Devchain"
          desc="Blockchain developer components for building full stack web3 applications."
        />

        <UserLayout pathname={this.props.pathname}></UserLayout>
      </>
    );
  }
}

export default Home;
