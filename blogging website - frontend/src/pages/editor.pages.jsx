import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { UserContext } from "../App";

const Editor = () => {
  const [editorState, seEditorState] = useState("editor");

  let {
    userAuth: { access_token },
  } = useContext(UserContext);

  return access_token == null ? (
    <Navigate to="/signin" />
  ) : editorState == "editor" ? (
    <h1>Blog Editor</h1>
  ) : (
    <h1>Publish form</h1>
  );
};

export default Editor;
