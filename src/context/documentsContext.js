import React, { createContext, useContext } from 'react';
import { db } from '../utils/firebase';
import { query, collection, where, onSnapshot, doc, updateDoc, getDoc } from 'firebase/firestore';
import { userAuthContext } from './userAuthContext';

export const documentsContext = createContext({ documents: '' });

class DocumentsContextProvider extends React.Component {
  constructor(props) {
    super(props);
    this.state = { documents: null, sidebarDocuments: null, activeDocument: null };
    this.isDocumentVisibleForUser = this.isDocumentVisibleForUser.bind(this);
    this.isItMyDocument = this.isItMyDocument.bind(this);
  }

  componentDidMount() {
    // console.log(this.props.router.params.documentId);
    this.getDocuments();
  }

  componentDidUpdate() {
    //  console.log(this.state.documents[this.props.router.params.documentId]);
    this.getDocuments();
  }

  componentWillUnmount() {
    if (this.unsubscribe) this.unsubscribe();
  }

  isItMyDocument(documentId) {
    // ha nincs a leszedett dokumentumaim között -> nem én vagyok az author
    // ha nincs egy dokumentumom sem, akkor amit nézek, az nem az enyém :D
    if (this.state.documents === null) return false;

    return !!this.state.documents[documentId];
    // de úgy is meg lehetne nézni, hogy lefetchelem a dokumentumot és összevetem az authort
  }

  async getDocument(documentId) {
    const docRef = doc(db, 'documents', documentId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      console.log(docSnap.data());
      return { ...docSnap.data(), id: documentId };
    } else return null;
  }

  getDocuments() {
    if (!this.context.user) return;

    const { uid } = this.context.user;

    if (!uid || this.uid === uid) return;
    this.uid = uid;

    if (this.unsubscribe) this.unsubscribe();

    const q = query(collection(db, 'documents'), where('authorId', '==', this.context.user.uid)); // TODO add limit
    this.unsubscribe = onSnapshot(q, (querySnapshot) => {
      //console.log(querySnapshot.docs);
      let documents = {};
      let sidebarDocuments = [];
      for (const doc of querySnapshot.docs) {
        const docObject = { ...doc.data(), id: doc.id };
        documents[doc.id] = docObject;
        sidebarDocuments.push(docObject);
      }
      console.log('documentUpdate subscription - ', documents);

      sidebarDocuments.sort((a, b) => {
        const timestampOfA = a.timestamp;
        const timestampOfB = b.timestamp;
        return timestampOfA - timestampOfB;
      });

      this.setState({ documents, sidebarDocuments });
    });
  }

  // nagyon óvatosan ezzel még, nincs kész
  setActiveDocument(documentId) {
    this.setState({ activeDocument: documentId });
  }

  // TODO: itt kell await?
  async setDocumentVisibility(documentId, visibility) {
    // TODO: további visibility-funkcionalitások implementálása
    await updateDoc(doc(db, 'documents', documentId), {
      visibility: visibility,
    });
  }

  isDocumentVisibleForUser(document, uId) {
    // ? tuti?
    const userId = !!this.context.user ? this.context.user.id : uId;

    if (document.authorId === userId) {
      return true;
    } else {
      if (document.visibility === 'public') {
        return true;
      } else return false;
    }
  }

  render() {
    return (
      <documentsContext.Provider
        value={{
          documents: this.state.documents,
          sidebarDocuments: this.state.sidebarDocuments,
          user: this.context.user,
          setVisibility: this.setDocumentVisibility,
          isDocumentVisibleForUser: this.isDocumentVisibleForUser,
          isItMyDocument: this.isItMyDocument,
          getDocument: this.getDocument,
        }}
      >
        {this.props.children}
      </documentsContext.Provider>
    );
  }
}
export default DocumentsContextProvider;

DocumentsContextProvider.contextType = userAuthContext;
