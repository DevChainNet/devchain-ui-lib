// MODULES
import Web3 from 'web3';
import React from 'react';
import axios from 'axios';
import cn from 'classnames';

// COMPONENTS
import Icon_arrow_down from '../icons/arrow_down';
import Icon_loading from '../icons/loading';

// CONFIG
import config from '../../config';

// CONTEXT
import { Context } from '../../context';

// UTILS
import { wallet_connect, str_copy } from '../../utils/index.js';

// STYLES
import style from './style.module.css';

// CLIENT SIDE
class Circle extends React.Component {
  static contextType = Context;

  constructor(props) {
    super(props);

    this.state = {};

    this.draw = this.draw.bind(this);

    this.ref_circle = React.createRef();
  }

  draw() {
    const circle = this.ref_circle.current;

    circle.style.width = this.props.c + 'px';
    circle.style.height = this.props.c + 'px';

    const canvas = circle.children[0];
    const label = circle.children[1];
    const context = canvas.getContext('2d');

    context.strokeStyle = '#24292E';
    context.lineWidth = 26;
    //context.lineCap = 'round';
    context.lineJoin = 'round';
    const r = canvas.width / 2 - context.lineWidth / 2;

    let angle_end = Math.PI * 2 * (this.props.data / 100);
    let angle_current = 0;
    let v = this.props.data * 0.001; // velocity

    context.beginPath();
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.arc(canvas.width / 2, canvas.height / 2, r, 0, Math.PI * 2);
    context.stroke();

    context.strokeStyle = '#0080FF';

    const interval_id = setInterval(() => {
      if (angle_end - angle_current < 0.001) {
        clearInterval(interval_id);
        context.closePath();
        return;
      }

      const pace = angle_current / angle_end;

      angle_current += v - v * pace;

      context.beginPath();

      context.clearRect(0, 0, canvas.width, canvas.height);

      context.arc(canvas.width / 2, canvas.height / 2, r, 0, angle_current);
      context.stroke();

      label.innerHTML = Math.round((angle_current / (Math.PI * 2)) * 100) + '%';
    }, 20); // fps
  }

  componentDidMount() {
    this.draw();
  }

  componentDidUpdate() {}

  componentWillUnmount() {}

  render() {
    return (
      <div
        key={this.props.key}
        ref={this.ref_circle}
        className={cn(style['circle'])}
      >
        <canvas
          width={this.props.c}
          height={this.props.c}
          className={cn(style['circle-canvas'])}
        ></canvas>

        <div className={cn(style['circle-percentage'])}></div>
      </div>
    );
  }
}

Circle.defaultProps = {
  data: 0,
  c: 200,
};

export default Circle;
