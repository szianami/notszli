import React from 'react';
import isEqual from 'lodash/isEqual';
import Block from './block';
import { setCaretToEnd } from '../setCaretToEnd';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { query, collection, where, onSnapshot } from 'firebase/firestore';
import { db } from '../utils/firebase';
import { userAuthContext } from '../context/userAuthContext';

import { updateDoc, doc, setDoc, deleteDoc } from 'firebase/firestore';
import '../index.css';
import Sidebar from './sidebar';
import Comments from './comments';
import { documentsContext } from '../context/documentsContext';

const generateID = () => {
  return (
    Date.now().toString(36) +
    Math.random()
      .toString(36)
      .slice(2, 5)
  );
};

const initialBlock = { id: generateID(), className: 'p', content: 'Hi there!' };

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
    console.log('didMount isblockdragged -', this.isBlockDragged);
    console.log('didmount documents ', this.context.documents);
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
    // console.log(this.context.documents[this.props.router.params.documentId]);

    // TODO help help help

    if (!this.context.documents) return;

    const document = this.context.documents[this.props.router.params.documentId];

    // no documents to load
    if (!document) return;

    const { id: prevId, sortedBlockIds: prevSortedBlockIds } = this.prevDoc || {};

    this.prevDoc = document;

    if (document.id !== prevId) {
      this.loadBlocks();
    }

    if (!isEqual(document.sortedBlockIds, prevSortedBlockIds)) {
      // ha blokk draggelése indította a componentDidUpdate-et, akkor ne töltsük újra a blokkokat,
      // már kezelve van a helyzet
      console.log('didUpdate isblockdragged -', this.isBlockDragged);
      if (this.isBlockDragged) {
        this.isBlockDragged = false;
        return;
      }
      console.log('jáj');
      this.setSortedBlocks(this.state.blocks);
      // a sortedblockst betesszük a state-be, hogy addig használhassuk innen a sortedblockst, amíg vissza nem jön
      // az adatbázisból az új sortedblock, utána pedig kinullázzuk, mivel nincs már rá szükség
      // mindez azért van, hogy ne legyen egy villanás
      if (this.state.sortedBlockIds) this.setState({ sortedBlockIds: null });
    }
    if (this.state.sortedBlockIds && this.state.sortedBlockIds !== prevState.sortedBlockIds) {
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

    console.log('aaa', JSON.stringify(blocks.map((b) => b.id)), document.sortedBlockIds);
    const sortedIds = this.state.sortedBlockIds || document.sortedBlockIds;
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
    const { uid } = this.context.user;

    // this.uid === uid mit csinál?
    console.log(this.context.user);
    // TODO !!! miez?
    //if (!uid || this.uid === uid) return;
    //this.uid = uid;

    const document = this.getDocument();
    if (!document) return;

    if (this.unsubscribe) this.unsubscribe();

    const q = query(collection(db, 'blocks'), where('documentId', '==', document.id)); // TODO add limit
    this.unsubscribe = onSnapshot(q, (querySnapshot) => {
      console.log(querySnapshot.docs);
      const blocks = querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
      console.log('loadblocks:', document.sortedBlockIds, blocks);
      this.setSortedBlocks(blocks);
    });

    // aj ezt hogy lehetne megoldani :(
    if (document.sortedBlockIds.length === 0) {
      console.log('eeemptyyyyy');
      this.insertNewBlock(null);
    }
    /*
    if (this.props.document.sortedBlockIds.length === 0) {
      this.insertNewBlock(undefined);
      // minden ok eddig :D
      //this.updateSortedBlocks(this.state.blocks);
    }
    */
  }

  saveUpdatedDocument(blockToSave) {}

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
    //    console.log('doku gyerekei ', document.getElementById('document').children);

    const blocks = this.state.blocks;
    let index = this.state.blocks.findIndex((block) => block.id === blockBefore.id);

    if (index < 0) index = 0;

    console.log(index);

    const document = this.getDocument();
    if (!document) return;

    const blockData = {
      documentId: document.id,
      // indexre már remélem nincs szükség
      index: index,
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

    await Promise.all([this.updateSortedBlocks(blocksWithNewBlock), this.insertNewBlockToDb(blockRef, blockData)]);
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
      const index = this.state.blocks.findIndex((block) => block.id === blockToRemove.id);
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

  // a little function to help us with reordering the result
  async reorder(list, originalPlaceIndex, destinationIndex) {
    //console.log('list ', list);
    const result = Array.from(list);
    const [removed] = result.splice(originalPlaceIndex, 1);
    result.splice(destinationIndex, 0, removed);
    await this.updateSortedBlocks(result);
    return result;
  }

  async onDragEnd(result) {
    // dropped outside the list
    if (!result.destination) {
      return;
    }
    this.isBlockDragged = true;
    console.log('onDragEnd isblockdragged -', this.isBlockDragged);
    const blocks = await this.reorder(this.state.blocks, result.source.index, result.destination.index);

    // a blocks-ban most rendezett sorrendben vannak az id-k
    this.setState({ blocks });
  }

  render() {
    return (
      <>
        {!!this.getDocument() && (
          <p className="Intro">
            hi there!{' '}
            <span role="img" aria-label="greetings" className="Emoji">
              👋
            </span>{' '}
            You can add content below.Type <span className="Code">/</span> for commands!
          </p>
        )}
        <DragDropContext onDragEnd={this.onDragEnd}>
          <Droppable droppableId={'document'}>
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                <div className="Block h1">{this.getDocument() ? this.getDocument().title : ''}</div>
                {this.state.blocks.map((block, index) => {
                  //console.log(this.state.blocks);
                  const position = this.state.blocks.map((b) => b.id).indexOf(block.id);
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
        {!!this.getDocument() && <Comments document={this.getDocument()} />}
      </>
    );
  }
}

Document.contextType = documentsContext;
export default Document;
