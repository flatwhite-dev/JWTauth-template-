import { FC, useContext, useState } from "react";
import { Context } from "..";
import { observer } from "mobx-react-lite";

const ActivateForm: FC = () => {
  const [code, setCode] = useState<string>("");

  const { user } = useContext(Context);

  return (
    <div>
      <input
        type="text"
        placeholder="CODE"
        onChange={(e) => setCode(e.target.value)}
        value={code}
      />

      <button onClick={() => user.activateWithCode(code)}>ACTIVATE</button>
      <button onClick={() => user.logout()}>BACK </button>
    </div>
  );
};

export default observer(ActivateForm);
