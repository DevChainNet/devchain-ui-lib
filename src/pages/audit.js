// MODULES
import React from 'react';
import Image from 'next/image';
import Web3 from 'web3';
import axios from 'axios';
import cn from 'classnames';

// COMPONENTS
import Head from '../components/head';
import UserLayout from '../components/layouts/user';
import Circle from '../components/circle';

import Icon_loading from '../components/icons/loading';
import Icon_check from '../components/icons/check';
import Icon_close from '../components/icons/close';
import Icon_copy from '../components/icons/copy';

// CONFIG
import config from '../config';

// CONTEXT
import { Context } from '../context';

// UTILS
import { sleep, str_copy } from '../utils/index.js';
import UTILS_API from '../utils/api.js';

// STYLES
import style from '../styles/pages/audit.module.css';

// SERVER SIDE
export async function getServerSideProps({ req, query }) {
  const url_audits = config.url_api + '/v1/audits';
  const res_audits = await axios.get(url_audits);

  const audits = res_audits.data;

  for (let i = 0; i < audits.length; i++) {
    for (let j = 0; j < audits.length; j++) {
      if (audits[j + 1]) {
        const current = audits[j];
        const next = audits[j + 1];

        if (
          new Date(current.created_at).valueOf() <
          new Date(next.created_at).valueOf()
        ) {
          audits[j] = next;
          audits[j + 1] = current;
        }
      }
    }
  }

  return {
    props: {
      audits: audits,
      pathname: req.url,
      query: query,
    },
  };
}

class Audit extends React.Component {
  static contextType = Context;

  constructor(props) {
    super(props);
    this.state = {
      // common
      props: {
        // when we click audit from latest audits we set the global state token address then updates the audit component with that address calling audit function, we save that address in audit, after that we can compare new coming addresses and avoid infinite loops.
        address: '',
      },
      loading: false,

      chains_selector_open: false,

      token_chain_id: 1,
      token_address: '',

      result: null,
      result_desc: '',
      result_score: 0,
      result_analytics: [],
      result_info: [],

      circle_key: 0,
    };

    // supported chain ids in GoPlusLabs
    this.CHAINS = {
      1: {
        name: 'Ethereum',
        img: '/images/ethereum.png',
      },
      10: {
        name: 'Optimism',
        img: '/images/optimism.png',
      },
      25: {
        name: 'Cronos',
        img: '/images/cronos.png',
      },
      56: {
        name: 'BNB',
        img: '/images/bnb.png',
      },
      100: {
        name: 'Gnosis',
        img: '/images/gnosis.png',
      },
      137: {
        name: 'Polygon',
        img: '/images/polygon.png',
      },
      250: {
        name: 'Fantom',
        img: '/images/fantom.png',
      },
      42161: {
        name: 'Arbitrum',
        img: '/images/arbitrum.png',
      },
      43114: {
        name: 'Avalanche',
        img: '/images/avalanche.png',
      },
      /**
       * 
       *       tron: {
        name: 'Tron',
        img: '/images/tron.png',
      },
       */
    };

    this.on_click_audit = this.on_click_audit.bind(this);

    this.ref_button = React.createRef();
    this.ref_warningbar = React.createRef();
    this.ref_passedbar = React.createRef();
  }

  async on_click_audit(address, chain_id) {
    //e.preventDefault();

    if (this.state.loading) {
      return;
    }

    this.setState({
      ...this.state,
      loading: true,
    });

    const url_query = '?contract_addresses=' + address;
    const url =
      'https://api.gopluslabs.io/api/v1/token_security/' + chain_id + url_query;

    const res = await axios.get(url);

    if (!res.data.result) {
      this.context.set_state({
        ...this.context.state,
        ui_toasts: [
          ...this.context.state.ui_toasts,
          { type: 'error', message: res.data.message, created_at: new Date() },
        ],
      });

      this.setState({
        ...this.state,
        loading: false,
      });

      return;
    }

    if (!res.data.result[address.toLowerCase()]) {
      this.context.set_state({
        ...this.context.state,
        ui_toasts: [
          ...this.context.state.ui_toasts,
          {
            type: 'error',
            message: 'Chain might be wrong for this token address',
            created_at: new Date(),
          },
        ],
      });

      this.setState({
        ...this.state,
        loading: false,
      });

      return;
    }

    let desc = '';

    const result = res.data.result[address.toLowerCase()];
    const analytics = [];
    const info = [];

    // is_anti_whale
    if (result.is_anti_whale === '1') {
      analytics.push({
        desc: 'Token has anti whale protection',
        passed: true,
      });
    } else {
      analytics.push({
        desc: "Token doesn't have anti whale protection",
        passed: false,
      });
    }

    // is_blacklisted
    if (result.is_blacklisted === '1') {
      analytics.push({
        desc: 'Token is blacklisted',
        passed: false,
      });
    } else {
      analytics.push({
        desc: 'Token is not blacklisted',
        passed: true,
      });
    }

    // is_honeypot
    if (result.is_honeypot === '1') {
      analytics.push({
        desc: 'Token have honeypot',
        passed: false,
      });
    } else {
      analytics.push({
        desc: "Token doesn't have honeypot",
        passed: true,
      });
    }

    // is_in_dex
    if (result.is_in_dex === '1') {
      analytics.push({
        desc: 'Token is in dex',
        passed: true,
      });
    } else {
      analytics.push({
        desc: 'Token is not in dex',
        passed: false,
      });
    }

    // is_mintable
    if (result.is_mintable === '1') {
      analytics.push({
        desc: 'Token have a mint function',
        passed: false,
      });
    } else {
      analytics.push({
        desc: 'No mint function found',
        passed: true,
      });
    }

    // is_open_source
    if (result.is_open_source === '1') {
      analytics.push({
        desc: "Token's source code is open",
        passed: true,
      });
    } else {
      analytics.push({
        desc: "Token's source code is not open",
        passed: false,
      });
    }

    // is_proxy
    if (result.is_proxy === '1') {
      analytics.push({
        desc: 'Token is proxy',
        passed: false,
      });
    } else {
      analytics.push({
        desc: 'Token is not a proxy',
        passed: true,
      });
    }

    // is_whitelisted
    if (result.is_whitelisted === '1') {
      analytics.push({
        desc: 'Token is whitelisted',
        passed: false,
      });
    } else {
      analytics.push({
        desc: 'Token is not whitelisted',
        passed: true,
      });
    }

    let score = 0;
    const point = 100 / analytics.length;
    for (let i = 0; i < analytics.length; i++) {
      analytics[i].animation = false;

      if (!analytics[i].passed) {
        continue;
      }

      score += point;
    }

    desc += `The score of this contract address is ${parseInt(
      score
    )}% out of 100. Upon detailed examination, ${
      (100 - score) / point
    } important issues were discovered. You can get information about these issues and get a service offer by contacting Devchain.net!`;

    const passedbar_width = (score / 100) * 100;
    const warningbar_width = 100 - passedbar_width;

    this.ref_warningbar.current.style.width = warningbar_width + '%';
    this.ref_passedbar.current.style.width = passedbar_width + '%';

    info.push({
      key: 'Token Address',
      value:
        address[0] +
        address[1] +
        address[2] +
        address[3] +
        address[4] +
        address[5] +
        '...',
      on_click_icon: async (e) => {
        await str_copy(address);

        this.context.set_state({
          ...this.context.state,

          ui_toasts: [
            ...this.context.state.ui_toasts,
            {
              message: 'Address copied',
              type: 'success',
              created_at: new Date(),
            },
          ],
        });
      },
      icon: <Icon_copy />,
    });

    info.push({
      key: 'Buy Tax',
      value: result.buy_tax,
    });

    info.push({
      key: 'Sell Tax',
      value: result.sell_tax,
    });

    info.push({
      key: 'Creator Address',
      value:
        result.creator_address[0] +
        result.creator_address[1] +
        result.creator_address[2] +
        result.creator_address[3] +
        result.creator_address[4] +
        '...',
      on_click_icon: async (e) => {
        await str_copy(result.creator_address);

        this.context.set_state({
          ...this.context.state,

          ui_toasts: [
            ...this.context.state.ui_toasts,
            {
              message: 'Creator Address copied',
              type: 'success',
              created_at: new Date(),
            },
          ],
        });
      },
      icon: <Icon_copy />,
    });

    info.push({
      key: 'Anti Whale Modifiable',
      value: result.anti_whale_modifiable === '1' ? 'Yes' : 'No',
    });

    info.push({
      key: 'Creator Balance',
      value: result.creator_balance,
    });

    info.push({
      key: 'Cannot Sell All',
      value: result.cannot_sell_all === '1' ? 'Yes' : 'No',
    });

    info.push({
      key: 'Owner Balance',
      value: result.owner_balance,
    });

    info.push({
      key: 'Hidden Owner',
      value: result.hidden_owner === '1' ? 'Yes' : 'No',
    });

    info.push({
      key: 'Slippage Modifiable',
      value: result.slippage_modifiable === '1' ? 'Yes' : 'No',
    });

    info.push({
      key: 'Can Take Back Ownership',
      value: result.can_take_back_ownership === '1' ? 'Yes' : 'No',
    });

    this.setState({
      ...this.state,

      loading: false,

      result: result,
      result_desc: desc,
      result_score: score,
      result_analytics: analytics,
      result_info: info,

      circle_key: this.state.circle_key + 1,
    });

    for (let i = 0; i < analytics.length; i++) {
      setTimeout(() => {
        analytics[i].animation = true;

        this.setState({
          ...this.state,

          result_analytics: analytics,
        });
      }, (i + 1) * 200);
    }

    for (let i = 0; i < info.length; i++) {
      setTimeout(() => {
        info[i].animation = true;

        this.setState({
          ...this.state,

          result_info: info,
        });
      }, (i + 1) * 200);
    }

    const url_audit_create = config.url_api + '/v1/audits';

    axios.post(url_audit_create, {
      address: address,
      chain_id: chain_id,
      name: result.token_name,
      symbol: result.token_symbol,
    });
  }

  componentDidMount() {}

  componentDidUpdate() {
    if (this.props.address !== this.state.props.address) {
      this.state.props.address = this.props.address;
      this.on_click_audit(this.props.address, this.props.chainId);
    }
  }

  componentWillUnmount() {}

  render() {
    return (
      <div className={cn(style['audit'])}>
        <div className={cn(style['audit-header'])}>
          <div className={cn(style['audit-header-options'])}>
            <div
              onClick={(e) => {
                if (this.state.chains_selector_open) {
                  return;
                }

                this.setState({
                  ...this.state,
                  chains_selector_open: !this.state.chains_selector_open,
                });
              }}
              className={cn(style['audit-header-options-chain'])}
            >
              <img
                loading="lazy"
                decoding="async"
                src={this.CHAINS[this.state.token_chain_id].img}
                alt={this.CHAINS[this.state.token_chain_id].name}
                title={this.CHAINS[this.state.token_chain_id].name}
                className={cn(style['audit-header-options-chain-img'])}
              />

              <div
                className={cn(
                  style['audit-header-options-chain-chains'],
                  this.state.chains_selector_open
                    ? style['audit-header-options-chain-chainsopen']
                    : null
                )}
              >
                {Object.values(this.CHAINS).map((current, index) => {
                  return (
                    <div
                      onClick={(e) => {
                        this.setState({
                          ...this.state,
                          token_chain_id: Number(
                            Object.keys(this.CHAINS)[index]
                          ),
                          chains_selector_open: false,
                        });
                      }}
                      key={index}
                      className={cn(
                        style['audit-header-options-chain-chains-item']
                      )}
                    >
                      <img
                        src={current.img}
                        className={cn(
                          style['audit-header-options-chain-chains-item-img']
                        )}
                      />

                      <div
                        className={cn(
                          style['audit-header-options-chain-chains-item-name']
                        )}
                      >
                        {current.name}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <input
              className={cn(style['audit-header-options-input'])}
              value={this.state.token_address}
              onChange={(e) => {
                this.setState({
                  ...this.state,
                  token_address: e.target.value,
                });
              }}
              placeholder="0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce"
            />

            <button
              ref={this.ref_button}
              onClick={(e) =>
                this.on_click_audit(
                  this.state.token_address,
                  this.state.token_chain_id
                )
              }
              className={cn(
                style['audit-header-options-audit'],
                this.state.loading
                  ? style['audit-header-options-auditdisabled']
                  : null
              )}
            >
              {this.state.loading ? (
                <div
                  className={cn(
                    style['audit-header-options-audit-loadingicon']
                  )}
                >
                  <Icon_loading />
                </div>
              ) : (
                'AUDIT'
              )}
            </button>
          </div>
        </div>

        <div className={cn(style['audit-body'])}>
          <div className={cn(style['audit-body-token'])}>
            <div className={cn(style['audit-body-token-left'])}>
              <h2
                className={cn(
                  style['audit-body-token-left-name'],
                  !this.state.result
                    ? style['audit-body-token-left-nameplaceholder']
                    : null
                )}
              >
                {this.state.result ? this.state.result.token_name : null}{' '}
                {this.state.result
                  ? `(${this.state.result.token_symbol})`
                  : null}
              </h2>

              <div className={cn(style['audit-body-token-left-address'])}></div>
            </div>

            <div
              className={cn(
                style['audit-body-token-right'],
                !this.state.result
                  ? style['audit-body-token-rightplaceholder']
                  : null
              )}
            >
              {this.state.result ? (
                <>
                  <span>Holders: </span> {this.state.result.holder_count}
                </>
              ) : null}
            </div>
          </div>

          <div className={cn(style['audit-body-score'])}>
            <div className={cn(style['audit-body-score-left'])}>
              {
                <Circle
                  c={200}
                  data={this.state.result_score}
                  key={this.state.circle_key}
                />
              }
            </div>

            <div className={cn(style['audit-body-score-right'])}>
              {!this.state.result ? (
                <div
                  className={cn(style['audit-body-score-right-placeholder'])}
                >
                  <div
                    className={cn(
                      style['audit-body-score-right-placeholder-textmedium']
                    )}
                  ></div>

                  <div
                    className={cn(
                      style['audit-body-score-right-placeholder-textsmall']
                    )}
                  ></div>

                  <div
                    className={cn(
                      style['audit-body-score-right-placeholder-textlarge']
                    )}
                  ></div>

                  <div
                    className={cn(
                      style['audit-body-score-right-placeholder-textmedium']
                    )}
                  ></div>

                  <div
                    className={cn(
                      style['audit-body-score-right-placeholder-textmedium']
                    )}
                  ></div>

                  <div
                    className={cn(
                      style['audit-body-score-right-placeholder-textlarge']
                    )}
                  ></div>

                  <div
                    className={cn(
                      style['audit-body-score-right-placeholder-textsmall']
                    )}
                  ></div>

                  <div
                    className={cn(
                      style['audit-body-score-right-placeholder-textlarge']
                    )}
                  ></div>
                </div>
              ) : (
                this.state.result_desc
              )}
            </div>
          </div>

          <div className={cn(style['audit-body-bars'])}>
            <label className={cn(style['audit-body-bars-warninglabel'])}>
              Warnings
            </label>

            <div className={cn(style['audit-body-bars-warning'])}>
              <div
                ref={this.ref_warningbar}
                className={cn(style['audit-body-bars-warning-bar'])}
              ></div>
            </div>

            <label className={cn(style['audit-body-bars-passedlabel'])}>
              Passed
            </label>

            <div className={cn(style['audit-body-bars-passed'])}>
              <div
                ref={this.ref_passedbar}
                className={cn(style['audit-body-bars-passed-bar'])}
              ></div>
            </div>
          </div>

          <div className={cn(style['audit-body-analytics'])}>
            <div className={cn(style['audit-body-analytics-title'])}>
              Analytics
            </div>

            <div className={cn(style['audit-body-analytics-list'])}>
              {!this.state.result_analytics.length ? (
                <>
                  <div
                    className={cn(
                      style['audit-body-analytics-itemplaceholder']
                    )}
                  >
                    <div
                      className={cn(
                        style['audit-body-analytics-item-iconplaceholder']
                      )}
                    ></div>

                    <div
                      className={cn(
                        style['audit-body-analytics-item-descplaceholder']
                      )}
                    ></div>
                  </div>

                  <div
                    className={cn(
                      style['audit-body-analytics-itemplaceholder']
                    )}
                  >
                    <div
                      className={cn(
                        style['audit-body-analytics-item-iconplaceholder']
                      )}
                    ></div>

                    <div
                      className={cn(
                        style['audit-body-analytics-item-descplaceholder']
                      )}
                    ></div>
                  </div>

                  <div
                    className={cn(
                      style['audit-body-analytics-itemplaceholder']
                    )}
                  >
                    <div
                      className={cn(
                        style['audit-body-analytics-item-iconplaceholder']
                      )}
                    ></div>

                    <div
                      className={cn(
                        style['audit-body-analytics-item-descplaceholder']
                      )}
                    ></div>
                  </div>
                </>
              ) : (
                this.state.result_analytics.map((current, index) => {
                  return (
                    <div
                      key={index}
                      className={cn(
                        style['audit-body-analytics-item'],
                        current.animation
                          ? style['audit-body-analytics-itemanimation']
                          : null
                      )}
                    >
                      <div
                        className={cn(
                          style['audit-body-analytics-item-icon'],
                          current.passed
                            ? style['audit-body-analytics-item-iconpassed']
                            : null
                        )}
                      >
                        {current.passed ? <Icon_check /> : <Icon_close />}
                      </div>

                      <div
                        className={cn(style['audit-body-analytics-item-desc'])}
                      >
                        {current.desc}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className={cn(style['audit-body-info'])}>
            <div className={cn(style['audit-body-info-title'])}>Token info</div>

            <div className={cn(style['audit-body-info-list'])}>
              {!this.state.result_info.length ? (
                <>
                  <div className={cn(style['audit-body-info-itemplaceholder'])}>
                    <div
                      className={cn(
                        style['audit-body-info-item-keyplaceholder']
                      )}
                    ></div>

                    <div
                      className={cn(
                        style['audit-body-info-item-valueplaceholder']
                      )}
                    ></div>
                  </div>

                  <div className={cn(style['audit-body-info-itemplaceholder'])}>
                    <div
                      className={cn(
                        style['audit-body-info-item-keyplaceholder']
                      )}
                    ></div>

                    <div
                      className={cn(
                        style['audit-body-info-item-valueplaceholder']
                      )}
                    ></div>
                  </div>
                </>
              ) : (
                this.state.result_info.map((current, index) => {
                  return (
                    <div
                      key={index}
                      className={cn(
                        style['audit-body-info-item'],
                        current.animation
                          ? style['audit-body-info-itemanimation']
                          : null
                      )}
                    >
                      <div className={cn(style['audit-body-info-item-key'])}>
                        {current.key}
                      </div>

                      <div className={cn(style['audit-body-info-item-value'])}>
                        <div
                          className={cn(
                            style['audit-body-info-item-value-icon']
                          )}
                          onClick={current.on_click_icon}
                        >
                          {current.icon}
                        </div>

                        {current.value}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

// CLIENT SIDE
class LatestAudits extends React.Component {
  static contextType = Context;

  constructor(props) {
    super(props);
    this.state = {
      audits: this.props.data,
    };

    this.get_audits = this.get_audits.bind(this);
  }

  async get_audits() {
    const url = config.url_api + '/v1/audits';
    const res = await axios.get(url);

    const audits = res.data;

    for (let i = 0; i < audits.length; i++) {
      for (let j = 0; j < audits.length; j++) {
        if (audits[j + 1]) {
          const current = audits[j];
          const next = audits[j + 1];

          if (
            new Date(current.created_at).valueOf() <
            new Date(next.created_at).valueOf()
          ) {
            audits[j] = next;
            audits[j + 1] = current;
          }
        }
      }
    }

    if (!audits[0] || !this.state.audits[0]) {
      this.setState({
        ...this.state,

        audits: audits,
      });

      return;
    }

    if (
      audits[0].address.toLowerCase() !==
      this.state.audits[0].address.toLowerCase()
    ) {
      audits[0].animation = true;
    }

    this.setState({
      ...this.state,
      audits: audits,
    });

    setTimeout(() => {
      audits[0].animation = false;

      this.setState({
        ...this.state,
        audits: audits,
      });
    }, 2000);
  }

  componentDidMount() {
    setInterval(() => {
      this.get_audits();
    }, 10000);
  }

  componentDidUpdate() {}

  componentWillUnmount() {}

  render() {
    return (
      <div className={cn(style['latestaudits'])}>
        <div className={cn(style['latestaudits-header'])}>LATEST AUDITS</div>

        <div className={cn(style['latestaudits-body'])}>
          {this.state.audits.map((current, index) => {
            return (
              <div
                key={index}
                className={cn(
                  style['latestaudits-body-item'],
                  current.animation
                    ? style['latestaudits-body-itemanimation']
                    : null
                )}
              >
                <div className={cn(style['latestaudits-body-item-left'])}>
                  <Image
                    width="32"
                    height="32"
                    className={cn(style['latestaudits-body-item-left-img'])}
                    src={
                      config.blockchain_chains[Number(current.chain_id)]
                        .token_img
                    }
                    alt={
                      config.blockchain_chains[Number(current.chain_id)]
                        .token_name
                    }
                    title={
                      config.blockchain_chains[Number(current.chain_id)]
                        .token_name
                    }
                  />

                  <div
                    className={cn(style['latestaudits-body-item-left-info'])}
                  >
                    <div
                      className={cn(
                        style['latestaudits-body-item-left-info-symbol']
                      )}
                    >
                      {current.symbol}
                    </div>

                    <div
                      className={cn(
                        style['latestaudits-body-item-left-info-name']
                      )}
                    >
                      {current.name}
                    </div>
                  </div>
                </div>

                <div className={cn(style['latestaudits-body-item-date'])}>
                  {new Date(current.created_at).toDateString()}
                </div>

                <button
                  onClick={(e) => {
                    this.props.setToken(current.address, current.chain_id);
                  }}
                  className={cn(style['latestaudits-body-item-view'])}
                >
                  VIEW
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}

// CLIENT SIDE
class AuditPage extends React.Component {
  static contextType = Context;

  constructor(props) {
    super(props);
    this.state = {
      token_address: '',
      token_chain_id: 1,
    };
  }

  componentDidMount() {}

  componentDidUpdate() {}

  componentWillUnmount() {}

  render() {
    return (
      <>
        <Head title="Audit | Devchain" desc="Audit tokens" />

        <UserLayout pathname={this.props.pathname}>
          <section className={cn(style['sectionaudit'])}>
            <div className={cn(style['sectionaudit-left'])}>
              <Audit
                address={this.state.token_address}
                chainId={this.state.token_chain_id}
              />
            </div>

            <div className={cn(style['sectionaudit-right'])}>
              <LatestAudits
                data={this.props.audits}
                setToken={(address, chain_id) => {
                  this.setState({
                    ...this.state,

                    token_address: address,
                    token_chain_id: chain_id,
                  });
                }}
              />
            </div>
          </section>
        </UserLayout>
      </>
    );
  }
}

export default AuditPage;
