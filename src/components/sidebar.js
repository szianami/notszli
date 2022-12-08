import React from 'react';
import '../index.css';
import { Link } from 'react-router-dom';
import { debounce } from '../utils/debounce';

import EditSelectorMenu from './editSelectorMenu.js';
import AddNewDocument from './addNewDocument';

import {
  deleteDoc,
  doc,
  query,
  collection,
  where,
  getDocs,
} from 'firebase/firestore';
import { db } from '../utils/firebase';

import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import DescriptionIcon from '@mui/icons-material/Description';

import { documentsContext } from '../context/documentsContext';

/*

kikommenteztem a scroll-os dolgokat, hogy vajon ez okozza-e az állandó újrarenderelést -> nem
*/
class Sidebar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isMenuOpen: false,
      menuPosition: { x: 0, y: 0 },
      prevScrollPos: 0,
      visible: true,
    };
    this.handleClassSelection = this.handleClassSelection.bind(this);
    this.closeClassSelectorMenu = this.closeClassSelectorMenu.bind(this);
    this.handleScroll = this.handleScroll.bind(this);
  }

  handleScroll = debounce(() => {
    const currentScrollPos = window.pageYOffset;
    this.setState({
      visible:
        (this.state.prevScrollPos > currentScrollPos &&
          this.state.prevScrollPos - currentScrollPos > 70) ||
        currentScrollPos < 10,
    });
    this.setState({ prevScrollPos: currentScrollPos });
  }, 100);

  componentDidMount() {
    window.addEventListener('scroll', this.handleScroll);
    console.log('router - ', this.props.router);
    console.log(this.context.sidebarDocuments);
  }

  componentDidUpdate() {
    console.log('router - ', this.props.router);
    console.log(this.context.sidebarDocuments);
  }
  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll);
  }

  postDocument() {}

  updateDocument() {}

  deleteDocument = async () => {
    if (this.state.selectedDocument) {
      // blokkok letörlése -- sortedBlockIds-zal elég? van olyan blokk, ami ebben nincs benne?
      this.state.selectedDocument.sortedBlockIds.forEach((blockId) => {
        deleteDoc(doc(db, 'blocks', blockId));
      });

      if (this.unsubscribe) this.unsubscribe();

      const reactionsInDocument = query(
        collection(db, 'reactions'),
        where('documentId', '==', this.state.selectedDocument.id)
      );

      const reactionQuerySnapshot = await getDocs(reactionsInDocument);
      reactionQuerySnapshot.forEach((docu) => {
        console.log(docu.id, ' => ', docu.data());
        deleteDoc(doc(db, 'reactions', docu.id));
      });

      deleteDoc(doc(db, 'documents', this.state.selectedDocument.id))
        .then(() => {
          console.log('successfully deleted! ');
          this.setState({ selectedDocument: null });
        })
        .catch((error) => {
          console.log('Error removing document:', error);
        });
    }

    // felugró ablak: are you sure you want to delete this document?
    console.log('delete finished');

    // redirect ehelyett a /-re
    this.props.router.navigate('/');
    //this.props.setActiveDocumentId(null);
  };

  renameDocument(document) {
    // megjelenik egy input field / contenteditable a helyén
    console.log('rename');
  }

  publishDocument(document) {
    // todo: felugró ablak, ahol be lehet állítani a visibilityjét
    // generál egy subpage-et neki
    //console.log(publish);
  }

  handleClassSelection(selectedItem) {
    switch (selectedItem) {
      case 'delete':
        console.log(this.state.selectedDocument);
        this.deleteDocument();
        break;
      case 'rename':
        console.log('rename');
        break;
      case 'publish':
        console.log('publish');
        break;
      default:
        break;
    }
  }

  handleClickOnThreeDots(event, doc) {
    event.preventDefault();
    event.stopPropagation();
    console.log(doc);

    let y;
    if (event.clientY - 180 < 0) {
      y = event.clientY + 120;
    } else y = event.clientY;

    this.setState({
      isMenuOpen: true,
      selectedDocument: doc,
      // menuPosition: { x: x, y: event.clientY },
      menuPosition: { x: 280, y: y },
    });
    document.addEventListener('click', this.closeClassSelectorMenu);
  }

  closeClassSelectorMenu() {
    console.log('closeClassSelectorMenu');
    this.setState({
      isMenuOpen: false,
    });
    document.removeEventListener('click', this.closeClassSelectorMenu);
    document.removeEventListener('click', this.closeClassSelectorMenu);
  }

  getDisplayNameLetters(name) {
    if (!name) return;
    return name
      .split(' ')
      .map((item) => {
        return item[0];
      })
      .join('');
  }

  render() {
    return (
      <div
        className="sidebar"
        style={{
          position: 'fixed',
          width: '300px',
          transition: 'top 0.6s',
          display: 'flex',
          flexWrap: 'inherit',
          paddingTop: '60px',
          marginTop: '-60px',
          top: this.state.visible ? '60px' : '0px',
          height: '-webkit-fill-available',
        }}
      >
        <div>
          {this.state.isMenuOpen && (
            <EditSelectorMenu
              position={{
                x: this.state.menuPosition.x,
                y: this.state.menuPosition.y,
              }}
              onSelect={this.handleClassSelection}
            />
          )}

          {!!this.context.sidebarDocuments &&
            this.context.sidebarDocuments.map((doc) => {
              return (
                <div key={doc.id}>
                  <Link
                    className="sidebar-document"
                    to={`documents/${doc.id}`}
                    style={{ textDecoration: 'none' }}
                  >
                    <DescriptionIcon
                      color="primary"
                      fontSize="small"
                      sx={{ mr: 0.5 }}
                    />
                    <div className="sidebar-document-title">{doc.title}</div>
                    <div>
                      <MoreHorizIcon
                        className="document-more-icon"
                        color="primary"
                        fontSize="small"
                        onClick={(event) => {
                          this.handleClickOnThreeDots(event, doc);
                        }}
                      />
                    </div>
                  </Link>
                </div>
              );
            })}
        </div>
        <div className="sidebar-add-document">
          <AddNewDocument />
        </div>
      </div>
    );
  }
}

Sidebar.contextType = documentsContext;

export default Sidebar;
