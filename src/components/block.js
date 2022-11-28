import React from 'react';
import ContentEditable from 'react-contenteditable';
import ClassSelectorMenu from './classSelectorMenu';
import { Draggable } from 'react-beautiful-dnd';
import { setCaretToEnd } from '../setCaretToEnd';
import DragHandleIcon from '../images/vertical-gray.png';
import PlusIcon from '../images/icons8-plus-20.png';
// <a href="https://www.flaticon.com/free-icons/drag-and-drop" title="drag and drop icons">Drag and drop icons created by SeyfDesigner - Flaticon</a>
// <a target="_blank" href="https://icons8.com/icon/10617/asterisk">Asterisk</a> icon by <a target="_blank" href="https://icons8.com">Icons8</a>
import '../index.css';

const getCaretCoordinates = () => {
  let x, y;
  const selection = window.getSelection();
  if (selection.rangeCount !== 0) {
    const range = selection.getRangeAt(0).cloneRange();
    range.collapse(false);
    const rect = range.getClientRects()[0];
    if (rect) {
      x = rect.left;
      y = rect.top;
    }
  }
  return { x, y };
};

class Block extends React.Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.handleTitleChange = this.handleTitleChange.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.openClassSelectorMenu = this.openClassSelectorMenu.bind(this);
    this.closeClassSelectorMenu = this.closeClassSelectorMenu.bind(this);
    this.handleClassSelection = this.handleClassSelection.bind(this);
    this.handleTextSelection = this.handleTextSelection.bind(this);
    this.handleMouseOver = this.handleMouseOver.bind(this);
    this.handleMouseOut = this.handleMouseOut.bind(this);

    this.contentEditable = React.createRef();

    this.state = {
      className: 'p',
      content: this.props.content ? this.props.content : '',
      title: 'Untitled',
      isTitleSelected: false,
      typingTimeout: 0,
      prevKey: '',
      prevClass: 'p',
      prevContent: '',
      // TODO: timestamp?
      htmlBackup: '',
      hovering: false,
      isMenuOpen: false,
      menuPosition: {
        x: null,
        y: null,
      },
    };
  }

  componentDidMount() {
    this.setState({ content: this.props.content, className: this.props.className });
  }

  isBlockChanged(prevState) {
    return prevState.content !== this.state.content || prevState.className !== this.state.className;
  }

  componentDidUpdate(_prevProps, prevState) {
    if (this.isBlockChanged(prevState)) {
      this.props.updateDocument({
        id: this.props.id,
        className: this.state.className,
        content: this.state.content,
        // TODO: timestamp
      });
    }
  }

  handleChange = (event) => {
    this.setState({ content: event.target.value });
  };

  handleTitleChange(event) {
    if (event.nativeEvent.type === 'click') {
      if (this.state.title === 'Untitled') {
        this.setState({ title: '' });
      }
    } else this.setState({ title: event.target.value });
  }

  handleKeyDown = (event) => {
    switch (event.key) {
      case 'Enter':
        // usecases:
        // 1) shift + enter -> new line
        // 2) create new block & take the text after the cursor position as its content
        if (this.state.prevKey !== 'Shift' && !this.state.isMenuOpen) {
          event.preventDefault();
          this.props.insertNewBlock({
            id: this.props.id,
            ref: this.contentEditable.current,
          });
        }
        break;
      case 'Backspace':
        // usecases:
        // 1) cursor is at the beginning of the text -> combining content of the block w/ the prev block
        // 2) if the block has no content / is empty, the block should be deleted
        if (this.state.content === '') {
          event.preventDefault();
          this.props.removeBlock({
            id: this.props.id,
            ref: this.contentEditable.current,
          });
        }
        break;
      default:
        // mit kell figyelmen kivul hagyni?
        // ctrl, alt, stb
        // Shift
        // előző billentyü shift, most pedig /
        // bug: ha az utolsó leütés egy sima /, akkor azt nem updateeli
        if (!event.ctrlKey && event.key !== 'Shift' && !(this.state.prevKey === 'Shift' && event.key === '/')) {
          if (this.state.typingTimeout) {
            clearTimeout(this.state.typingTimeout);
          }
          this.setState({
            typingTimeout: setTimeout(() => {
              console.log('timeout timeout you stopped typing!');
              // this.sendToParent(this.props.id);
              console.log('timeout utáni block content -', this.state.content);
              this.saveBlockToDB(this.state.content, undefined);
            }, 1500),
          });
        }
        break;
    }
    this.setState({ prevKey: event.key });
  };

  handleKeyUp = (event) => {
    if (event.key === '/') {
      this.openClassSelectorMenu();
    }
    if (event.key === 'ArrowUp') {
      // TODO
    }
    if (event.key === 'ArrowDown') {
      // TODO
    }
  };

  openClassSelectorMenu(event) {
    console.log('openClassSelectorMenu');
    if (!event) {
      // console.log(x, y);
      const { x, y } = getCaretCoordinates();
      this.setState({
        isMenuOpen: true,
        menuPosition: { x, y },
        prevContent: this.state.content,
      });
    } else {
      // ezzel megállítom az erre az eventre feliratkozóknak a továbbdobást, mert én ezt már lekezeltem!
      // így erre az eventre még nem reagál a closeClassSelector!
      event.stopPropagation();
      console.log(event.clientX, event.clientY);
      this.setState({
        isMenuOpen: true,
        menuPosition: { x: event.clientX, y: event.clientY },
        prevContent: this.state.content,
      });
    }
    setTimeout(() => {
      console.log(this.state.menuPosition);
      console.log('isMenuOpen ', this.state.isMenuOpen);
    }, 1000);

    document.addEventListener('click', this.closeClassSelectorMenu);
  }

  closeClassSelectorMenu() {
    console.log('closeClassSelectorMenu');
    this.setState({
      htmlBackup: '',
      isMenuOpen: false,
      // menuPosition: { x: null, y: null },
    });
    document.removeEventListener('click', this.closeClassSelectorMenu);
  }

  handleClassSelection(className) {
    this.setState(
      { prevClass: this.state.className, className: className, content: this.state.prevContent.replace('/', '') },
      () => {
        setCaretToEnd(this.contentEditable.current);
        this.closeClassSelectorMenu();
        if (this.state.prevClass !== this.state.className) {
          console.log('edited classname, save block');
          this.saveBlockToDB(undefined, className);
        }
      }
    );
  }

  saveBlockToDB(content, className) {
    console.log('save block');
    this.props.saveBlock({
      id: this.props.id,
      index: this.props.index,
      className: className ? className : undefined,
      // lehet hogy a class átadással is para van? docuban vizsgálni kéne?
      content: content ? content : undefined,
    });
  }

  handleTextSelection = (event) => {
    // console.log(window.getSelection().toString());
  };

  handleMouseOver() {
    this.setState({ hovering: true });
  }

  handleMouseOut() {
    this.setState({ hovering: false });
  }

  handleDragHandleClick() {
    // todo
    console.log('draghandle');
  }

  renderTagContainer() {
    if (['h4', 'h5', 'h6'].includes(this.state.className)) {
      return `block-container ${this.state.className}-container`;
    } else return 'block-container';
  }

  render() {
    return (
      <>
        {this.state.isMenuOpen && (
          <ClassSelectorMenu
            position={this.state.menuPosition}
            onSelect={this.handleClassSelection}
            close={this.closeClassSelectorMenu}
          />
        )}

        <Draggable draggableId={this.props.id} index={this.props.position}>
          {(provided, snapshot) => (
            <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
              <div
                className={this.renderTagContainer()}
                onMouseOver={this.handleMouseOver}
                onMouseOut={this.handleMouseOut}
              >
                <div className="DragSymbol">
                  {this.state.hovering && (
                    <span role="button" onClick={this.openClassSelectorMenu}>
                      <img src={PlusIcon} alt="Icon" />
                    </span>
                  )}
                </div>
                <div className="DragSymbol">
                  {this.state.hovering && (
                    <span role="button" onClick={this.handleDragHandleClick}>
                      <img src={DragHandleIcon} alt="Icon" />
                    </span>
                  )}
                </div>
                <ContentEditable
                  className={`Block ${this.state.className}`}
                  innerRef={this.contentEditable}
                  tagName={this.state.className === 'li' ? 'li' : 'div'}
                  html={this.state.content}
                  onChange={this.handleChange}
                  onKeyDown={this.handleKeyDown}
                  onKeyUp={this.handleKeyUp}
                  onMouseUp={this.handleTextSelection}
                />
              </div>
            </div>
          )}
        </Draggable>
      </>
    );
  }
}

export default Block;
