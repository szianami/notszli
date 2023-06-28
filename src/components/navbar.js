import React, { useState, useEffect } from "react";
import { Box } from "@mui/system";
import LogoutButton from "./logoutButton";
import { debounce } from "../utils/debounce";
import { auth } from "../utils/firebase";
import { getAvatar } from "../utils/avatar";
import "../../node_modules/bootstrap/dist/css/bootstrap.min.css";
import "../index.css";
import "../App.css";
import LoginButton from "./loginButton";
import LogoText from "./logoText";

const navbarHeight = 60;

const Navbar = ({ contentRef, sidebarWidth }) => {
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!contentRef) return;

    const handleScroll = debounce(() => {
      const currentScrollPos = contentRef.scrollTop;
      setVisible(
        (prevScrollPos > currentScrollPos &&
          prevScrollPos - currentScrollPos > 70) ||
          currentScrollPos < 10
      );
      setPrevScrollPos(currentScrollPos);
    }, 100);

    contentRef.addEventListener("scroll", handleScroll);

    return () => contentRef.removeEventListener("scroll", handleScroll);
  }, [prevScrollPos, visible, contentRef]);

  const navbarStyles = {
    display: "flex",
    justifyContent: "flex-end",
  };

  return (
    <div
      style={{
        height: `${navbarHeight}px`,
        position: "relative",
      }}
    >
      <Box
        sx={{
          position: "fixed",
          paddingRight: {
            xs: 0,
            md: sidebarWidth,
          },
          height: `${navbarHeight}px`,
          width: "100%",
          transition: "top 0.6s",
          top: visible ? "0" : `${-navbarHeight}px`,
          zIndex: "2",
        }}
      >
        <div
          className="navbar navbar-expand-lg navbar-light bg-light"
          style={navbarStyles}
        >
          <Box
            sx={{
              display: {
                xs: "block",
                md: sidebarWidth ? "none" : "block",
              },
              flex: "auto",
            }}
          >
            <LogoText />
          </Box>
          {auth.currentUser !== null && (
            <>
              <div className="user-navbar-container">
                <div
                  className="avatar avatar-smol"
                  style={{
                    backgroundColor: getAvatar(auth.currentUser.displayName)
                      .color,
                  }}
                >
                  {getAvatar(auth.currentUser.displayName).letters}
                </div>
                <div
                  className="sidebar-document-title"
                  style={{ width: "fit-content", color: "#0f2e53" }}
                >
                  {auth.currentUser.displayName}
                </div>
              </div>
              <div className="header flex">
                <LogoutButton />
              </div>
            </>
          )}
          {auth.currentUser === null && <LoginButton />}
        </div>
      </Box>
    </div>
  );
};

// Navbar.contextType = userAuthContext;

export default Navbar;
