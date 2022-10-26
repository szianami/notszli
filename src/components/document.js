import React from 'react';
import Block from './block';
import { setCaretToEnd } from '../utils/setCaretToEnd';
import '../index.css';

const generateID = () => {
  return (
    Date.now().toString(36) +
    Math.random()
      .toString(36)
      .slice(2, 5)
  );
};

const initialBlock = { id: generateID(), class: 'h5', content: 'Hi there!' };

class Document extends React.Component {
  constructor(props) {
    super(props);
    this.state = { blocks: [initialBlock] };
    this.updateDocument = this.updateDocument.bind(this);
    this.insertNewBlock = this.insertNewBlock.bind(this);
    this.removeBlock = this.removeBlock.bind(this);
  }

  updateDocument(changedBlock) {
    const blocks = this.state.blocks;
    const index = this.state.blocks.findIndex((block) => block.id === changedBlock.id);
    const changedBlocks = [...blocks];
    changedBlocks[index] = {
      ...changedBlocks[index],
      class: changedBlock.class,
      content: changedBlock.content,
    };
    this.setState({ blocks: changedBlocks });
  }

  insertNewBlock(blockBefore) {
    const blockToAdd = { id: generateID(), class: 'p', content: '' };
    const blocks = this.state.blocks;
    const index = this.state.blocks.findIndex((block) => block.id === blockBefore.id);
    const changedBlocks = [...blocks];
    console.log(changedBlocks);
    // adding a new block to the array right after the block
    changedBlocks.splice(index + 1, 0, blockToAdd);
    this.setState({ blocks: changedBlocks }, () => {
      blockBefore.ref.nextElementSibling.focus();
    });
  }

  removeBlock(blockToRemove) {
    if (this.state.blocks.length > 1) {
      const blocks = this.state.blocks;
      const index = this.state.blocks.findIndex((block) => block.id === blockToRemove.id);
      const changedBlocks = [...blocks];
      changedBlocks.splice(index, 1);
      const previousBlock = blockToRemove.ref.previousElementSibling;
      this.setState({ blocks: changedBlocks }, () => {
        /// TODO: setCaretToEnd: a legutolsó karakterre állítja a kurzort
        setCaretToEnd(previousBlock);
      });
      previousBlock.focus();
    }
  }
  render() {
    return (
      <div className="Document">
        {this.state.blocks.map((block, key) => {
          return (
            <Block
              key={key}
              id={block.id}
              class={block.class}
              content={block.content}
              updateDocument={this.updateDocument}
              insertNewBlock={this.insertNewBlock}
              removeBlock={this.removeBlock}
            />
          );
        })}
      </div>
    );
  }
}

export default Document;
