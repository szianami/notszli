import React from "react";
import ContentEditable from "react-contenteditable";
import ClassSelectorMenu from "./classSelectorMenu";
import { Draggable } from "react-beautiful-dnd";
import {
  setCaretToEnd,
  getCaretCoordinates,
} from "../utils/caretPositionManipulation";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import AddIcon from "@mui/icons-material/Add";
import "../index.css";

class Block extends React.Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.handleTitleChange = this.handleTitleChange.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.openClassSelectorMenu = this.openClassSelectorMenu.bind(this);
    this.closeClassSelectorMenu = this.closeClassSelectorMenu.bind(this);
    this.handleClassSelection = this.handleClassSelection.bind(this);
    this.handleMouseOver = this.handleMouseOver.bind(this);
    this.handleMouseOut = this.handleMouseOut.bind(this);

    this.contentEditable = React.createRef();

    this.state = {
      className: "p",
      content: this.props.content ? this.props.content : "",
      title: "Untitled",
      isTitleSelected: false,
      typingTimeout: 0,
      prevKey: "",
      prevClass: "p",
      prevContent: "",
      // TODO: timestamp?
      htmlBackup: "",
      hovering: false,
      isMenuOpen: false,
      menuPosition: {
        x: null,
        y: null,
      },
    };
  }

  componentDidMount() {
    this.setState({
      content: this.props.content,
      className: this.props.className,
    });
  }

  isBlockChanged(prevState) {
    return (
      prevState.content !== this.state.content ||
      prevState.className !== this.state.className
    );
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
    if (event.nativeEvent.type === "click") {
      if (this.state.title === "Untitled") {
        this.setState({ title: "" });
      }
    } else this.setState({ title: event.target.value });
  }

  handleKeyDown = (event) => {
    switch (event.key) {
      case "Enter":
        // usecases:
        // 1) shift + enter -> new line
        // 2) create new block & take the text after the cursor position as its content
        if (this.state.prevKey !== "Shift" && !this.state.isMenuOpen) {
          event.preventDefault();
          this.props.insertNewBlock({
            id: this.props.id,
            ref: this.contentEditable.current,
          });
        }
        break;
      case "Backspace":
        // usecases:
        // 1) cursor is at the beginning of the text -> combining content of the block w/ the prev block
        // 2) if the block has no content / is empty, the block should be deleted
        if (this.state.content === "") {
          event.preventDefault();
          this.props.removeBlock({
            id: this.props.id,
            ref: this.contentEditable.current,
          });
        }
        break;
      case "ArrowUp":
        console.log("heloooo arrow up", event);
        console.log(event.target);
        console.log(this.contentEditable);
        break;
      default:
        // keys to ignore:
        // Ctrl, Alt, Shift ... -> control keys
        // Shift + /
        if (
          !event.ctrlKey &&
          event.key !== "Shift" &&
          !(this.state.prevKey === "Shift" && event.key === "/")
        ) {
          if (this.state.typingTimeout) {
            clearTimeout(this.state.typingTimeout);
          }
          this.setState({
            typingTimeout: setTimeout(() => {
              this.saveBlockToDB(this.state.content, undefined);
            }, 3000),
          });
        }
        break;
    }
    this.setState({ prevKey: event.key });
  };

  handleKeyUp = (event) => {
    if (event.key === "/") {
      this.openClassSelectorMenu();
    }
    if (event.key === "ArrowUp") {
      // TODO
      console.log(this.contentEditable);
    }
    if (event.key === "ArrowDown") {
      // TODO
    }
  };

  openClassSelectorMenu(event) {
    console.log("openClassSelectorMenu");
    if (!event) {
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
      this.setState({
        isMenuOpen: true,
        menuPosition: { x: event.clientX, y: event.clientY },
        prevContent: this.state.content,
      });
    }
    setTimeout(() => {
      console.log(this.state.menuPosition);
      console.log("isMenuOpen ", this.state.isMenuOpen);
    }, 1000);

    document.addEventListener("click", this.closeClassSelectorMenu);
  }

  closeClassSelectorMenu() {
    this.setState({
      htmlBackup: "",
      isMenuOpen: false,
      // menuPosition: { x: null, y: null },
    });
    document.removeEventListener("click", this.closeClassSelectorMenu);
  }

  handleClassSelection(className) {
    this.setState(
      {
        prevClass: this.state.className,
        className: className,
        content: this.state.prevContent.replace("/", ""),
      },
      () => {
        setCaretToEnd(this.contentEditable.current);
        this.closeClassSelectorMenu();
        if (this.state.prevClass !== this.state.className) {
          this.saveBlockToDB(undefined, className);
        }
      }
    );
  }

  saveBlockToDB(content, className) {
    this.props.saveBlock({
      id: this.props.id,
      className: className ? className : undefined,
      content: content ? content : undefined,
    });
  }

  handleMouseOver() {
    this.setState({ hovering: true });
  }

  handleMouseOut() {
    this.setState({ hovering: false });
  }

  renderTagContainer() {
    if (["h4", "h5", "h6"].includes(this.state.className)) {
      return `block-container ${this.state.className}-container`;
    } else return "block-container";
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
            <div
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
            >
              <div
                className={this.renderTagContainer()}
                onMouseOver={this.handleMouseOver}
                onMouseOut={this.handleMouseOut}
              >
                <div className="DragSymbol">
                  {this.state.hovering && (
                    <span
                      role="button"
                      onClick={this.openClassSelectorMenu}
                      style={{ width: "21px" }}
                    >
                      <AddIcon
                        sx={{
                          color: "#c3c3c3",
                          size: "small",
                          maxWidth: "21px",
                        }}
                      />
                    </span>
                  )}
                </div>
                <div className="DragSymbol">
                  {this.state.hovering && (
                    <span role="button" style={{ width: "21px" }}>
                      <DragIndicatorIcon
                        sx={{
                          color: "#c3c3c3",
                          size: "small",
                          maxWidth: "21px",
                        }}
                      />
                    </span>
                  )}
                </div>
                <ContentEditable
                  className={`Block ${this.state.className}`}
                  innerRef={this.contentEditable}
                  tagName={this.state.className === "li" ? "li" : "div"}
                  html={this.state.content}
                  onChange={this.handleChange}
                  onKeyDown={this.handleKeyDown}
                  onKeyUp={this.handleKeyUp}
                  // onMouseUp={this.handleTextSelection}
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
