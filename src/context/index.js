// MODULES
import React from 'react';

// Keep the context update as minimum as possible during the lifecycle of the application.
const state_init = {
  // UI props
  ui_sidebar_open: false,
  ui_toasts: [],

  // user props
  user_auth: null,
  user: {
    _id: '',
    username: '',
    email: '',
    email_verified: false,
    role: 'user',
    img: '',
    phone: '',
    ref_code: '',
    ref_from: '',
    api_key: '',
  },

  // wallet props
  wallet_accounts: [],
  wallet_chain_id: 1,
};

export const Context = React.createContext(state_init);

function reducer(state = state_init, action) {
  return {
    ...action,
  };
}

export default function Provider({ children }) {
  const [state, set_state] = React.useReducer(reducer, state_init);

  return (
    <Context.Provider value={{ state, set_state }}>{children}</Context.Provider>
  );
}

/*** USAGE:

// MODULES
import React from 'react';

// CONTEXT
import { Context } from '../context';

class Home extends React.Component {
  static contextType = Context;

  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    console.log(this.context.state); => { ui_toasts: [], user_auth: null }
    this.context.set_state({ ...new values });
  }

  componentDidUpdate() {}

  render() {
    return (
      <>
        <Head title="Kaciriyosun" desc="Kacirma" />

        <Layout_user>Home</Layout_user>
      </>
    );
  }
}

*/
