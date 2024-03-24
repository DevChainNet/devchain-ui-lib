// MODULES
import React from 'react';
import cn from 'classnames';

// CONTEXT
import { Context } from '../../context';

// STYLES
import style from './style.module.css';

// CLIENT SIDE
class Graph extends React.Component {
  static contextType = Context;

  constructor(props) {
    super(props);
    this.state = {};

    // component variables
    this.interval_main = 0;
    this.path_d = '';

    // element references
    this.ref_svg = React.createRef();
  }

  componentDidMount() {
    const svg = this.ref_svg.current;
    const children = svg.children;
    let path = null;

    for (let i = 0; i < children.length; i++) {
      if (children[i].tagName === 'path') {
        path = children[i];
      }
    }

    const parent_rect = svg.parentNode.getBoundingClientRect();

    let parent_padding = getComputedStyle(svg.parentNode).padding; // gets the computed style of the parent which means it has to come from stylesheet files otherwise padding will be ignored
    parent_padding = Number(parent_padding.replace('px', ''));

    if (this.props.parentSize) {
      svg.setAttribute('width', parent_rect.width - parent_padding * 2);
      svg.setAttribute('height', parent_rect.height);
      svg.setAttribute(
        'viewBox',
        `0 0 ${parent_rect.width - parent_padding * 2} ${parent_rect.height}`
      );
    }

    const width = Number(svg.getAttribute('width'));
    const height = Number(svg.getAttribute('height'));

    let path_x = 0;
    let path_y = height;
    this.path_d = `M ${path_x} ${path_y}`;

    this.interval_main = setInterval(() => {
      if (path_x >= width) {
        clearInterval(this.interval_main);
        return;
      }

      // TODO implement the random graph algorithm and static object array algorithm
      path_x += 2;
      path_y -= 1;

      this.path_d += ` L ${path_x} ${path_y} M ${path_x} ${path_y}`;

      // rerender component
      this.setState({});
    }, 100);
  }

  componentDidUpdate() {}

  render() {
    return (
      <svg
        ref={this.ref_svg}
        width={this.props.width}
        height={this.props.height}
        viewBox={`0 0 ${this.props.width} ${this.props.height}`}
        className={cn(style['graph'])}
      >
        <path
          d={this.path_d}
          stroke={this.props.stroke}
          fill={this.props.fill}
          strokeWidth={this.props.strokeWidth}
          strokeLinecap="round"
        />
      </svg>
    );
  }
}

export default Graph;
