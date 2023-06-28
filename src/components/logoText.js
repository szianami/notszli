import React from "react";
import { Link } from "react-router-dom";

const LogoText = () => (
  <Link
    className="Logo"
    to={`/`}
    style={{ textDecoration: "none", color: "#000042" }}
  >
    notszli
  </Link>
);

export default LogoText;
