import React from 'react';
import '../index.css';

import isEqual from 'lodash/isEqual';
import { setCaretToEnd } from '../setCaretToEnd';

import Block from './block';
import Reactions from './reactions';

import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import {
  query,
  collection,
  where,
  onSnapshot,
  updateDoc,
  doc,
  setDoc,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '../utils/firebase';

import { documentsContext } from '../context/documentsContext';

class Document extends React.Component {
  constructor(props) {
    super(props);
    this.state = { blocks: [], sortedBlockIds: null, document: null };

    this.isBlockDragged = false;

    this.updateDocument = this.updateDocument.bind(this);
    this.insertNewBlock = this.insertNewBlock.bind(this);
    this.removeBlock = this.removeBlock.bind(this);
    this.onDragEnd = this.onDragEnd.bind(this);
    this.saveBlock = this.saveBlock.bind(this);
    this.loadBlocks = this.loadBlocks.bind(this);
    this.updateSortedBlocks = this.updateSortedBlocks.bind(this);
  }

  componentDidMount() {
    console.log(this.props.router.params.documentId);
    console.log(this.props);

    this.loadBlocks();
  }

  getDocument() {
    if (this.context.documents && this.props.router.params.documentId)
      return this.context.documents[this.props.router.params.documentId];
    else return null;
  }

  componentDidUpdate(prevProps, prevState) {
    if (!this.context.documents) return;

    // gets document from context by ID coming from router params
    const document = this.context.documents[
      this.props.router.params.documentId
    ];

    if (!document) return;

    const { id: prevId, sortedBlockIds: prevSortedBlockIds } =
      this.prevDoc || {};

    this.prevDoc = document;

    // if document id has changed since the previous didUpdate,
    // load its blocks
    if (document.id !== prevId) {
      this.loadBlocks();
    }

    // checking if the order of sorted blocks has changed
    if (!isEqual(document.sortedBlockIds, prevSortedBlockIds)) {
      // if didUpdate was called because of dragging a block,
      // return from method as it is already handled
      if (this.isBlockDragged) {
        this.isBlockDragged = false;
        return;
      }

      // if the order has changed because of other reasons,
      // e.g. inserting a new block -> order the blocks in the state
      this.setSortedBlocks(this.state.blocks);
    }
  }

  componentWillUnmount() {
    if (this.unsubscribe) this.unsubscribe();
  }

  //reorders blocks based on the sortedBockIds
  setSortedBlocks(blocks) {
    const document = this.getDocument();
    if (!document) return;

    console.log(
      'aaa',
      JSON.stringify(blocks.map((b) => b.id)),
      document.sortedBlockIds
    );

    const sortedIds = document.sortedBlockIds;
    if (blocks.length > 1) {
      blocks.sort((a, b) => {
        const indexOfA = sortedIds.indexOf(a.id);
        const indexOfB = sortedIds.indexOf(b.id);
        return indexOfA - indexOfB;
      });
    }
    console.log('bbb', JSON.stringify(blocks.map((b) => b.id)));
    this.setState({ blocks });
  }

  loadBlocks() {
    const document = this.getDocument();
    if (!document) return;

    if (this.unsubscribe) this.unsubscribe();

    const q = query(
      collection(db, 'blocks'),
      where('documentId', '==', document.id)
    );
    this.unsubscribe = onSnapshot(q, (querySnapshot) => {
      const blocks = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      this.setSortedBlocks(blocks);
    });
  }

  updateDocument(changedBlock) {
    this.setState((prev) => {
      const blocks = prev.blocks;
      const index = blocks.findIndex((block) => block.id === changedBlock.id);
      const changedBlocks = [...blocks];
      changedBlocks[index] = { ...changedBlock };
      return { blocks: changedBlocks };
    });
  }

  async insertNewBlock(blockBefore) {
    let index =
      blockBefore === null
        ? 0
        : this.state.blocks.findIndex((block) => block.id === blockBefore.id);

    if (index < 0) index = 0;

    const document = this.getDocument();
    if (!document) return;

    const blockData = {
      documentId: document.id,
      text: '',
      className: 'p',
    };

    const blocksRef = collection(db, 'blocks'); // collectionRef
    const blockRef = doc(blocksRef); // docRef
    const blockId = blockRef.id; // a docRef has an id property
    console.log('a blokk idja: ', blockId);

    const block = { ...blockData, id: blockId };
    // ezen a ponton a blocksWithNewBlock szerintem helyes sorrendben tartalmazza az id-kat
    const blocksWithNewBlock = [...this.state.blocks];
    blocksWithNewBlock.splice(index + 1, 0, block);
    console.log('blockswithnewblock -', blocksWithNewBlock);

    console.log('!!!!', document.sortedBlockIds);

    let newBlockIds;
    if (blocksWithNewBlock.length === 1) {
      newBlockIds = [blocksWithNewBlock[0]];
    } else {
      newBlockIds = [...document.sortedBlockIds];
      newBlockIds.splice(index + 1, 0, blockId);
    }

    this.setState({ blocks: blocksWithNewBlock, sortedBlockIds: newBlockIds });

    await Promise.all([
      this.updateSortedBlocks(blocksWithNewBlock),
      this.insertNewBlockToDb(blockRef, blockData),
    ]);
  }

  // csak annyit tesz, hogy felküldi a db-be
  async insertNewBlockToDb(blockRef, blockData) {
    // updateelni is kell mindenki indexét! :(

    await setDoc(blockRef, blockData)
      .then(() => {
        console.log('created new block');
      })
      .catch((error) => {
        console.log('Error creating document:', error);
      });
  }

  // a paraméterként kapott blokkok sorrendje alapján a db-ben frissíti a sorrendben tárolt blokkid-k tömbjét
  async updateSortedBlocks(changedBlocks) {
    const sortedBlockIds = changedBlocks.map((block) => block.id);

    const document = this.getDocument();
    if (!document) return;

    await updateDoc(doc(db, 'documents', document.id), {
      sortedBlockIds: sortedBlockIds,
    }).catch((error) => {
      console.log('Error updating document:', error);
    });
  }

  removeBlock(blockToRemove) {
    if (this.state.blocks.length > 1) {
      const blocks = this.state.blocks;
      const index = this.state.blocks.findIndex(
        (block) => block.id === blockToRemove.id
      );
      const changedBlocks = [...blocks];
      changedBlocks.splice(index, 1);
      const previousBlock = blockToRemove.ref.previousElementSibling;
      this.setState({ blocks: changedBlocks }, () => {
        /// TODO: setCaretToEnd: a legutolsó karakterre állítja a kurzort
        setCaretToEnd(previousBlock);
      });
      previousBlock.focus();
      deleteDoc(doc(db, 'blocks', blockToRemove.id));
      this.updateSortedBlocks(changedBlocks);
    }
  }

  async saveBlock(blockToSave) {
    updateDoc(
      doc(db, 'blocks', blockToSave.id),
      !!blockToSave.content
        ? {
            text: blockToSave.content,
          }
        : {
            className: blockToSave.className,
          }
    )
      .then((updateResult) => {
        console.log('successfully updated!');
        console.log(updateResult);
        // this.setState({ ... }); ??
      })
      .catch((error) => {
        console.log('Error updating document:', error);
      });
  }

  async onDragEnd(result) {
    // checking if dropped outside the list
    if (!result.destination) {
      return;
    }

    // in case of re-rendering, isBlockDragged tells if it was
    // caused by drag&drop -> if so, no need to fetch the blocks again,
    // as it is handled to make sure no unwanted synchronization happens
    this.isBlockDragged = true;

    const list = Array.from(this.state.blocks);
    const [removed] = list.splice(result.source.index, 1);
    list.splice(result.destination.index, 0, removed);

    this.setState({ blocks: list });

    // updating sorted block list of the document in the DB
    await this.updateSortedBlocks(list);
  }

  render() {
    return (
      <>
        {!!this.getDocument() && (
          <p className="Intro">
            Hi there!{' '}
            <span role="img" aria-label="greetings" className="Emoji">
              👋
            </span>{' '}
            You can add content below. Type <span className="Code">/</span> for
            commands!
          </p>
        )}
        <DragDropContext onDragEnd={this.onDragEnd}>
          <Droppable droppableId={'document'}>
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                <div className="Block h1">
                  {this.getDocument() ? this.getDocument().title : ''}
                </div>
                {this.state.blocks.map((block, index) => {
                  //console.log(this.state.blocks);
                  const position = this.state.blocks
                    .map((b) => b.id)
                    .indexOf(block.id);
                  return (
                    <Block
                      index={index}
                      key={block.id}
                      id={block.id}
                      position={position}
                      className={block.className}
                      content={block.text}
                      updateDocument={this.updateDocument}
                      insertNewBlock={this.insertNewBlock}
                      removeBlock={this.removeBlock}
                      saveBlock={this.saveBlock}
                    />
                  );
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
        {!!this.getDocument() && <Reactions document={this.getDocument()} />}
      </>
    );
  }
}

Document.contextType = documentsContext;
export default Document;
