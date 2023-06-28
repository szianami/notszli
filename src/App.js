import * as React from "react";
import { Outlet } from "react-router-dom";
import ViewListRoundedIcon from "@mui/icons-material/ViewListRounded";
import { Fab } from "@mui/material";
import { Box } from "@mui/system";
import "./App.css";
import "./index.css";
import Navbar from "./components/navbar";
import Sidebar from "./components/sidebar";
import { withRouter } from "./withRouter";
import { documentsContext } from "./context/documentsContext";

import UserHasNoDocuments from "./components/userHasNoDocuments";
import UserHasNoActiveDocument from "./components/userHasNoActiveDocument";
import WelcomePage from "./components/welcomePage";

// todo: egy spinnert mutatni, amíg be nem töltődik az userAuthContext, viszont nem feltétlen itt!

const SidebarWithRouter = withRouter(Sidebar);

const sidebarWidth = "19rem";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { sidebarVisible: false };
    this.mainRef = React.createRef();

    this.openSidebar = () => {
      this.setState({ sidebarVisible: true });
    };
  }

  componentDidUpdate(prevProps) {
    const { documentId } = this.props.router.params;
    if (documentId !== prevProps.router.params.documentId) {
      this.setState({ sidebarVisible: false });
    }
  }

  render() {
    return (
      <>
        <div className="app-container">
          {this.context.user === null ? (
            <>
              <Navbar />
              <div className="document-container">
                <Box sx={{ height: "2rem" }} />
                <WelcomePage />
              </div>
            </>
          ) : (
            <>
              <Box
                sx={{
                  display: {
                    xs: this.state.sidebarVisible ? "flex" : "none",
                    md: "flex",
                  },
                  flex: { xs: "auto", md: "none" },
                  width: { xs: "auto", md: sidebarWidth },
                }}
              >
                <SidebarWithRouter documents={this.context.sidebarDocuments} />
              </Box>

              <Box
                sx={{
                  display: {
                    xs: this.state.sidebarVisible ? "none" : "flex",
                    md: "flex",
                  },
                  flex: "auto",
                }}
              >
                <div className="main" ref={this.mainRef}>
                  <Navbar
                    contentRef={this.mainRef.current}
                    sidebarWidth={sidebarWidth}
                  />

                  {this.props.router.params.documentId ? (
                    <div className="document-container">
                      <Outlet />
                    </div>
                  ) : (
                    <div className="document-container">
                      {this.context.documents !== null &&
                      Object.keys(this.context.documents).length === 0 ? (
                        <UserHasNoDocuments />
                      ) : (
                        <UserHasNoActiveDocument />
                      )}
                    </div>
                  )}

                  <Box
                    sx={{
                      paddingTop: "5.5rem",
                      display: { xs: "block", md: "none" },
                    }}
                  />
                </div>
              </Box>

              <Fab
                onClick={this.openSidebar}
                size="small"
                color="primary"
                aria-label="list of notes"
                sx={{
                  display: {
                    xs: this.state.sidebarVisible ? "none" : "flex",
                    md: "none",
                  },
                  position: "fixed",
                  bottom: "2rem",
                  left: "2rem",
                  marginRight: "2rem",
                }}
              >
                <ViewListRoundedIcon />
              </Fab>
            </>
          )}
        </div>
      </>
    );
  }
}

App.contextType = documentsContext;

export default App;
