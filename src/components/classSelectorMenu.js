import React from 'react';
import { matchSorter } from 'match-sorter';
import '../index.css';

const MENU_HEIGHT = 150;
const classes = [
  {
    class: 'h4',
    label: 'Title',
    text: 'Big section heading.',
  },
  {
    class: 'h5',
    label: 'Subtitle',
    text: 'Medium section heading.',
  },
  {
    class: 'h6',
    label: 'Heading',
    text: 'Small section heading.',
  },
  {
    class: 'p',
    label: 'Text',
    text: 'Just plain text.',
  },
  {
    class: 'li',
    label: '• Bulleted list',
    text: 'A simple bulleted list.',
  },
  {
    class: 'quote-block',
    label: '| Quote',
    text: 'Create a quotation.',
  },
];

class ClassSelectorMenu extends React.Component {
  constructor(props) {
    super(props);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.state = {
      command: '',
      items: classes,
      activeItem: 0,
    };
  }

  componentDidMount() {
    document.addEventListener('keydown', this.handleKeyDown);
  }

  componentDidUpdate(prevProps, prevState) {
    // returns the sorted class list based on the command
    // https://npmtrends.com/match-sorter
    const command = this.state.command;
    if (prevState.command !== command) {
      const items = matchSorter(classes, command, { keys: ['class'] });
      // e.g. matchSorter(classes, 'h', { keys: ["class"] }) --> h1, h2, h3
      this.setState({ items: items });
    }
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeyDown);
  }

  handleKeyDown(event) {
    const items = this.state.items;
    const active = this.state.activeItem;
    const command = this.state.command;

    switch (event.key) {
      case 'Enter':
      case 'Tab':
        // select the actual item - the block will handle the selection in its onSelect()
        event.preventDefault();
        console.log('activeItem: ', active);
        console.log('ezutan az itemek:');
        console.log(console.log(items[active]));
        this.props.onSelect(items[active].class);
        break;
      case 'Backspace':
        // 1) if command is empty -> close the menu
        // 2) if command !empty -> remove the last char from the command
        if (!command) this.props.close();
        this.setState({ command: command.substring(0, command.length - 1) });
        // console.log('activeItem: ', this.state.activeItem);
        break;
      case 'ArrowUp':
        // menu overturn
        event.preventDefault();
        const prevActiveItem = active === 0 ? items.length - 1 : active - 1;
        this.setState({ activeItem: prevActiveItem });
        console.log('activeItem: ', this.state.activeItem);
        break;
      case 'ArrowDown':
        event.preventDefault();
        const nextItem = active === items.length - 1 ? 0 : active + 1;
        this.setState({ activeItem: nextItem });
        console.log('activeItem: ', this.state.activeItem);
        break;
      default:
        // append the pressed key to the command
        console.log('default, activeitem ', this.state.activeItem);
        this.setState({ command: this.state.command + event.key });
        break;
    }
    //console.log('command: ', this.state.command);
  }

  renderLabel(className) {
    switch (className) {
      case 'p':
        return <div style={{ paddingLeft: '16px' }}>Text</div>;
        break;
      case 'quote-block':
        return <div className="quote-block">Quote</div>;
        break;
      case 'h4':
        return (
          <div className="h4" style={{ paddingLeft: '16px' }}>
            Title
          </div>
        );
        break;
      case 'h5':
        return (
          <div className="h5" style={{ paddingLeft: '16px' }}>
            Subtitle
          </div>
        );
        break;
      case 'h6':
        return (
          <div className="h6" style={{ paddingLeft: '16px' }}>
            Header
          </div>
        );
        break;
      case 'li':
        return <li>Bulleted list item</li>;
      default:
        return <></>;
    }
  }

  render() {
    const x = this.props.position.x;
    const y = this.props.position.y - MENU_HEIGHT;
    const positionAttributes = { top: y, left: x };

    return (
      <div className="SelectMenu" style={positionAttributes}>
        <div className="Items">
          {this.state.items.map((item, key) => {
            const activeItem = this.state.activeItem;
            const isActive = this.state.items.indexOf(item) === activeItem;
            return (
              <div
                className={isActive ? 'Active' : null}
                key={key}
                role="button"
                tabIndex="0"
                onClick={() => this.props.onSelect(item.class)}
              >
                {this.renderLabel(item.class)}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}

export default ClassSelectorMenu;
