import React, { useId } from 'react';
import ContentEditable from "react-contenteditable";
import './index.css';

class Block extends React.Component {
    constructor(props) {
      super(props);
      this.handleChange = this.handleChange.bind(this);
      this.contentEditable = React.createRef();
      this.state = {
        class: "h5",
        content: "",
        prevKey: "",
        // TODO: timestamp?
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
      console.log("wtf");
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
            this.props.removeBlock({
              id: this.props.id,
              ref: this.contentEditable.current
            });
          }
          
        break;
        case ("/"):
        // edit the class tag of the block
        break;
      }
      this.setState({ prevKey: event.key });
    }
  
    render() {
      return (
          <ContentEditable
            innerRef={this.contentEditable}
            tagName={this.state.class}
            html={this.state.content}
            onChange={this.handleChange}
            onKeyDown={this.handleKeyDown}
          />
      );
    }
  }
  
  export default Block;
  