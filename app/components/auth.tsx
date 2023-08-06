import styles from "./auth.module.scss";
import { IconButton } from "./button";

import { useNavigate } from "react-router-dom";
import { Path } from "../constant";
import { useAccessStore } from "../store";
import Locale from "../locales";

import BotIcon from "../icons/bot.svg";
import { getHeaders } from "../client/api";

export function AuthPage() {
  const navigate = useNavigate();
  const access = useAccessStore();

  const goHome = () => {
    console.log("go home");

    fetch("/api/auth", {
      method: "GET",
      headers: getHeaders(),
    })
      .then((resp) => {
        return resp.json();
      })
      .then((j) => {
        access.updateExpiredAt(j.expiredAt.toString());
        navigate(Path.Home); // Move this line here
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {});
  };

  return (
    <div className={styles["auth-page"]}>
      <div className={`no-dark ${styles["auth-logo"]}`}>
        <BotIcon />
      </div>

      <div className={styles["auth-title"]}>{Locale.Auth.Title}</div>
      <div className={styles["auth-tips"]}>{Locale.Auth.Tips}</div>

      {/* <input
        className={styles["auth-username"]}
        type="text"
        placeholder={Locale.Auth.UserName}
        value={access.userName}
        onChange={(e) => {
          access.updateUserName(e.currentTarget.value);
        }}
      /> */}
      <input
        className={styles["auth-input"]}
        type="password"
        placeholder={Locale.Auth.Input}
        value={access.accessCode}
        onChange={(e) => {
          access.updateCode(e.currentTarget.value);
        }}
      />

      <div className={styles["auth-actions"]}>
        <IconButton
          text={Locale.Auth.Confirm}
          type="primary"
          onClick={goHome}
        />
      </div>
    </div>
  );
}
