import React from 'react';
import '../index.css';

const MENU_HEIGHT = 150;
const editOptions = [
  {
    id: 'delete',
    text: 'delete',
    img:
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAABmJLR0QA/wD/AP+gvaeTAAAA7klEQVQ4jcXTP0oEMRTH8c+OIrvWMtGreAZtt9GjWNh4GG9gbStoJR5gG3dlCxsFQbAwQgzJTHQFf82b9yffvEleJoZ1hjneor+DS1yMrKvqBl3idzFW1ST5PsA1plg2bhjwgkOsSwXHOG+EibVHaaDLCpboE/8q2lOcZDGxdpUCtgvAkPh70e4WYrCPx6EOVxlwTAFPQ8BXzH4AnMY1VeDGKgFbu5z5HJlRYH7TNQWFeS0BWy8myEamBsxHZwj4fx22nGGvscM//+WNgPlb5vsZLqJ9TvJfsV727IZ0+9uaUofwgDu8V/JbuC8lPgDyYi6EdjYW+QAAAABJRU5ErkJggg==',
  },
  {
    id: 'rename',
    text: 'rename',
    img:
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAABmJLR0QA/wD/AP+gvaeTAAAA7ElEQVQ4je3UIU8DQRCG4Qe4IIomqSqaIKtPkRSNqCoKUc1fQWD4E2hog8GRoBAEg6gjqAYHCMROmyPtkdsWyZtMbjNz9+Xbm53lj9lo+N4OrmM9xnmsz3CID/TwlWughQHuIwaRm7OVKfiJR7TxjIvIzSlyLQavdYUCJfYzxO7iWS6pPRU4wRsmGaLL6KA72/IVHjI+LiWnl5VcF8PNNV0t8C+4PrMuH0tdakLdOeyQRm+K7QwTE+xFVM/uFLcZOj8YRiyw6izv1hVyb5sW+jiV5v8dLyo3TtMuF9L/uQmhHo5wgFHUVt3t73wD/1Yj5ikLuBwAAAAASUVORK5CYII=',
  },
  {
    id: 'publish',
    text: 'publish',
    img:
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAABmJLR0QA/wD/AP+gvaeTAAACJElEQVQ4jY3VW2iPYRwH8M/2H8spU/ojhHIYuXAqNjlbObUQLXIqN6zkgkxxp2S5wo0LoSmHJUVkF0o0Ga0oFyY0kxLjQphDbXPxPO+82/61/eqt3/s+z/N9vr/v7/DSt2UwoB/7QF6Ob/lYhQosxBcUYiieoxY38TcXYH6P92LUIItObMdhnMI6dMQzNZjfF2AJqrAXBajD49T6K5zGdOzAVqzPBZowe4MZ8ZLLqbWl2JV6PyeEPw4vsCQNVCDoeAybsCcyaEMZWlAUASZjfDxXhybsxFE8wW9CBlfiG27jLqbhhqDjAizHzAicSDEJu/ER31GKZwnLs5FBYjW6Z79nyHAp5SdJ6gp5EH6kNjQIGU7sk97WkPI70B6BOzLYHD9MQCvGYLBQe2V4L+haiZ+Yil9oxkaMxFzUo60g3pJmlMtvETQrxaJIoD6udwqdlJ+E3I5bKZAsrke/ObIbiEZcwwkhkScj04tx79cEoL9JmYLjulsWh/A0SjIkI9TPssgA5kXmJViLNZiDYSjHeSERBE0f4R3240EmhlUltNYRzIrPfaH1WuNzRxgIWbyMgIXxgozQFF0VUYy3QgHn40qOkBOAqym/Emcic/wfDk3YhoOCnvewRW+bjcWYiANCx/wRyqtcpJrYhwhcHWVYgc9xT5FQ/NXCLNyA4diHERgl1GeBHJaH1biA10JXNAoa1wpDpBZjU2cq8FAYa31af38Bo+EfsJ17g13UfawAAAAASUVORK5CYII=',
  },
];

class EditSelectorMenu extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      items: editOptions,
    };
  }

  render() {
    const x = this.props.position.x;
    const y = this.props.position.y - MENU_HEIGHT;
    const positionAttributes = { top: y, left: x };

    return (
      <div className="SelectMenu" style={positionAttributes}>
        <div className="Items">
          {this.state.items.map((item, key) => {
            return (
              <div
                className="sidebar-document"
                key={key}
                role="button"
                onClick={() => this.props.onSelect(item.id)}
              >
                <img src={item.img} alt="edit option" />
                <div style={{ paddingLeft: '10px' }}>{item.text}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}

export default EditSelectorMenu;
