import React, { useId } from 'react';
import ContentEditable from "react-contenteditable";
import ClassSelectorMenu from './classSelectorMenu';
import { setCaretToEnd } from './setCaretToEnd';
import './index.css';
  
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
      this.handleKeyUp = this.handleKeyUp.bind(this);
      this.openClassSelectorMenu = this.openClassSelectorMenu.bind(this);
      this.closeClassSelectorMenu = this.closeClassSelectorMenu.bind(this);
      this.handleClassSelection = this.handleClassSelection.bind(this);
      this.contentEditable = React.createRef();
      this.state = {
        class: "h5",
        content: "",
        prevKey: "",
        // TODO: timestamp?
        htmlBackup: "",
        isMenuOpen: false,
        menuPosition: {
          x: null,
          y: null
        }
      };
    }
  
    componentDidMount() {
      this.setState({ content: this.props.content, tag: this.props.class });
    }
  
    isBlockChanged(prevState){
      return (prevState.content !== this.state.content || prevState.class !== this.state.class);
    }

    componentDidUpdate(prevProps, prevState) {
      if (this.isBlockChanged(prevState)) {
        this.props.updateDocument({
          id: this.props.id,
          class: this.state.class,
          content: this.state.content,
          // TODO: timestamp
        });
      }
    }
  
    handleChange = (event) => {
      this.setState({ content: event.target.value });
    };

    handleKeyDown = (event) => {
      switch (event.key) {
        case ("Enter"):
          // usecases:
          // 1) shift + enter -> new line
          // 2) create new block & take the text after the cursor position as its content
          if (this.state.prevKey !== "Shift") {
            event.preventDefault();

            this.props.insertNewBlock({
              id: this.props.id,
              ref: this.contentEditable.current
            });
          }
        break;
        case ("Backspace"):
          // usecases:
          // 1) cursor is at the beginning of the text -> combining content of the block w/ the prev block
          // 2) if the block has no content / is empty, the block should be deleted
          if (this.state.content === ""){
            event.preventDefault();
            this.props.removeBlock({
              id: this.props.id,
              ref: this.contentEditable.current
            });
          }
        break;
        default:
        break;
      }
      this.setState({ prevKey: event.key });
    }

    handleKeyUp= (event) => {
      if (event.key === "/") {
        this.openClassSelectorMenu();
      }
      if (event.key === "ArrowUp"){
        // TODO
      }
      if (event.key === "ArrowDown"){
        // TODO
      }
    }

    openClassSelectorMenu() {
      console.log("openClassSelectorMenu");
      const { x, y } = getCaretCoordinates();
      console.log( x, y);
      this.setState({
        isMenuOpen: true,
        menuPosition: { x, y }
      });
      console.log("isMenuOpen ", this.state.isMenuOpen);
      document.addEventListener("click", this.closeClassSelectorMenu);
    }

    closeClassSelectorMenu() {
      console.log('closeClassSelectorMenu');
      this.setState({
        htmlBackup: "",
        isMenuOpen: false,
        menuPosition: { x: null, y: null }
      });
      document.removeEventListener("click", this.closeClassSelectorMenu);  
    }

    handleClassSelection(className) {
      console.log('handleclassselection - ', className);
      this.setState({ class: className, content: this.state.htmlBackup }, () => {
        setCaretToEnd(this.contentEditable.current);
        this.closeClassSelectorMenu();
      });
    }

    render() {
      return (
        <>
        { this.state.isMenuOpen &&
          (<ClassSelectorMenu
          position={this.state.menuPosition}
          onSelect={this.handleClassSelection}
          close={this.closeClassSelectorMenu}
          />)
        }
          <ContentEditable
            className="Block"
            innerRef={this.contentEditable}
            tagName={this.state.class}
            html={this.state.content}
            onChange={this.handleChange}
            onKeyDown={this.handleKeyDown}
            onKeyUp={this.handleKeyUp}
          />
        </>
      );
    }
  }
  
  export default Block;
  