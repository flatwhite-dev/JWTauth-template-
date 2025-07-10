import React, { FC, useContext, useEffect, useState } from "react";
import LoginForm from "./components/LoginForm";
import { Context } from ".";
import { observer } from "mobx-react-lite";
import AuthService from "./services/AuthService";
import { IUser } from "./models/IUser";
import UserService from "./services/UserService";
import ActivateForm from "./components/ActivateForm";

const App: FC = () => {
  const { user } = useContext(Context);

  const [users, setUsers] = useState<IUser[]>([]);

  useEffect(() => {
    if (localStorage.getItem("TOKEN")) {
      user.checkAuth();
    }
  }, []);

  async function getUsers() {
    try {
      const response = await UserService.fetchUsers();
      setUsers(response.data);
    } catch (e) {
      console.log(e);
    }
  }

  if (user.isLoading) {
    return <div>LOADING...</div>;
  }

  if (!user.isAuth) {
    return <LoginForm />;
  }
  console.log(user.isActivating, user?.user?.isActivated);
  if (user.isActivating || !user?.user?.isActivated) {
    return <ActivateForm />;
  }

  return (
    <div className="App">
      <h1>{user.isAuth ? `Welcome ${user.user.email}` : "Hello"}</h1>
      <button onClick={() => user.logout()}>LOG OUT</button>
      <div>
        <button onClick={() => getUsers()}>GET UESRS</button>
      </div>
      <div>
        {users.map((user) => (
          <div key={user.email}>{user.email}</div>
        ))}
      </div>
    </div>
  );
};

export default observer(App);
