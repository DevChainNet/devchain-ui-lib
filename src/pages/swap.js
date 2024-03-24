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
import Modal from '../components/modal/index.js';
import Icon_token_swap from '../components/icons/token_swap';

// CONTEXT
import { Context } from '../context';

// UTILS
import UTILS from '../utils/index.js';
import UTILS_API from '../utils/api.js';

// STYLES
import style from '../styles/pages/swap.module.css';

// SERVER SIDE
export async function getServerSideProps({ req }) {
  return {
    props: {
      pathname: req.url,
    },
  };
}

// CLIENT SIDE
class SwapPage extends React.Component {
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
          title="Swap | Devchain"
          desc="Swap tokens with Devchain.net. We take zero fees for our transactions across all chains."
        />

        <UserLayout pathname={this.props.pathname}>
          <section className={cn(style['sectionswap'])}>
            <Swap />
          </section>

          <Modal
            icon={<Icon_token_swap />}
            title="Devchain Swap is Powered by 0x API"
            desc='<a href="https://0x.org/" target="_blank">0x.org</a> is the best in class provider of certified defi solutions
            which are used by hundreds of thousands of people across web3.'
            countdown={2000}
          />
        </UserLayout>
      </>
    );
  }
}

export default SwapPage;
