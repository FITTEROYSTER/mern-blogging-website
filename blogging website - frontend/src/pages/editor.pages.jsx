import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { UserContext } from "../App";

const Editor = () => {
  let {
    userAuth: { access_token },
  } = useContext(UserContext);

  return access_token == null ? (
    <Navigate to="/signin" />
  ) : (
    <h1>You can access</h1>
  );
};

export default Editor;
